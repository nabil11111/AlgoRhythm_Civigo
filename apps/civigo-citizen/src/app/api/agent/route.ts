import { NextRequest } from "next/server";
import {
  AgentRequestSchema,
  AgentResponseSchema,
  IsoDateSchema,
  SlotIdSchema,
  ServiceIdSchema,
} from "@/lib/agent/schemas";
import { SYSTEM_PROMPT } from "@/lib/agent/constants";
import { getProfile } from "@/utils/supabase/server";
import * as Tools from "@/app/(protected)/_agent_tools";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

// Simple in-memory rate limiter: 10 requests / 5 min per key
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;
const rateMap = new Map<string, { windowStart: number; count: number }>();

function rateKey(userId: string | null, ip: string | null): string {
  return `${userId ?? "anon"}:${ip ?? "0.0.0.0"}`;
}

function checkRateLimit(userId: string | null, ip: string | null): boolean {
  const key = rateKey(userId, ip);
  const now = Date.now();
  const rec = rateMap.get(key);
  if (!rec) {
    rateMap.set(key, { windowStart: now, count: 1 });
    return true;
  }
  if (now - rec.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateMap.set(key, { windowStart: now, count: 1 });
    return true;
  }
  if (rec.count >= RATE_LIMIT_MAX) return false;
  rec.count += 1;
  return true;
}

// Real Gemini function-calling implementation
export async function runAgent(
  message: string,
  context: {
    serviceId?: string;
    branchId?: string;
    dateFromISO?: string;
    dateToISO?: string;
  }
) {
  // Validate and sanitize inputs
  if (!message || message.trim().length === 0) {
    throw new Error("Message cannot be empty");
  }

  // Limit message length for security
  if (message.length > 1000) {
    throw new Error("Message too long");
  }

  // Validate context parameters if provided
  if (
    context.serviceId &&
    !ServiceIdSchema.safeParse(context.serviceId).success
  ) {
    throw new Error("Invalid serviceId");
  }
  if (
    context.dateFromISO &&
    !IsoDateSchema.safeParse(context.dateFromISO).success
  ) {
    throw new Error("Invalid dateFromISO");
  }
  if (
    context.dateToISO &&
    !IsoDateSchema.safeParse(context.dateToISO).success
  ) {
    throw new Error("Invalid dateToISO");
  }
  if (
    context.branchId &&
    !ServiceIdSchema.safeParse(context.branchId).success
  ) {
    throw new Error("Invalid branchId");
  }

  // Initialize Gemini API
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not configured");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    systemInstruction: SYSTEM_PROMPT
  });

  // Define available tools for Gemini
  const tools = [
    {
      functionDeclarations: [
        {
          name: "getServiceInstructions",
          description: "Get instructions and requirements for a government service",
          parameters: {
            type: SchemaType.OBJECT,
            properties: {
              serviceId: { type: SchemaType.STRING, description: "The service ID" }
            },
            required: ["serviceId"]
          }
        },
        {
          name: "searchSlots",
          description: "Search for available appointment slots",
          parameters: {
            type: SchemaType.OBJECT,
            properties: {
              serviceId: { type: SchemaType.STRING, description: "The service ID" },
              dateFromISO: { type: SchemaType.STRING, description: "Start date in ISO format" },
              dateToISO: { type: SchemaType.STRING, description: "End date in ISO format" },
              branchId: { type: SchemaType.STRING, description: "Optional branch ID" }
            },
            required: ["serviceId", "dateFromISO", "dateToISO"]
          }
        },
        {
          name: "bookSlot",
          description: "Book an appointment slot",
          parameters: {
            type: SchemaType.OBJECT,
            properties: {
              slotId: { type: SchemaType.STRING, description: "The slot ID to book" },
              notes: { type: SchemaType.STRING, description: "Optional notes" }
            },
            required: ["slotId"]
          }
        },
        {
          name: "getUserDocuments",
          description: "Get user's uploaded documents",
          parameters: { 
            type: SchemaType.OBJECT, 
            properties: {} 
          }
        },
        {
          name: "getUserAppointments", 
          description: "Get user's appointments",
          parameters: { 
            type: SchemaType.OBJECT, 
            properties: {} 
          }
        }
      ]
    }
  ];

  // Build conversation history with context
  const contextInfo = Object.entries(context)
    .filter(([_, value]) => value)
    .map(([key, value]) => `${key}: ${value}`)
    .join(", ");
  
  const prompt = contextInfo 
    ? `Context: ${contextInfo}\n\nUser: ${message}`
    : `User: ${message}`;

  try {
    // Start chat with tools (casting to any to bypass TypeScript issues)
    const chat = model.startChat({ tools: tools as any });
    const result = await chat.sendMessage(prompt);

    let response = result.response;
    
    // Handle function calls - simplified approach
    const candidates = result.response.candidates;
    if (candidates && candidates[0]?.content?.parts) {
      for (const part of candidates[0].content.parts) {
        if ((part as any).functionCall) {
          const call = (part as any).functionCall;
          let toolResult;
          
          switch (call.name) {
            case "getServiceInstructions":
              toolResult = await Tools.getServiceInstructions((call.args as any).serviceId);
              break;
            case "searchSlots":
              toolResult = await Tools.searchSlots(
                (call.args as any).serviceId,
                (call.args as any).dateFromISO,
                (call.args as any).dateToISO,
                (call.args as any).branchId
              );
              break;
            case "bookSlot":
              toolResult = await Tools.bookSlot({
                slotId: (call.args as any).slotId,
                notes: (call.args as any).notes
              });
              break;
            case "getUserDocuments":
              toolResult = await Tools.getUserDocuments();
              break;
            case "getUserAppointments":
              toolResult = await Tools.getUserAppointments();
              break;
            default:
              toolResult = { error: "Unknown function" };
          }
          
          // Send function result back to model
          const functionResults = [{
            functionResponse: {
              name: call.name,
              response: toolResult
            }
          }];
          
          const finalResult = await chat.sendMessage(functionResults as any);
          response = finalResult.response;
        }
      }
    }

    const answer = response.text();
    
    // Parse suggested actions from the response
    const actions = [];
    if (answer.includes("appointments") || answer.includes("schedule")) {
      actions.push({ type: "openAppointments" });
    }
    if (context.serviceId) {
      actions.push({ 
        type: "openService", 
        params: { serviceId: context.serviceId } 
      });
    }

    return AgentResponseSchema.parse({
      answer,
      actions
    });

  } catch (error) {
    console.error("Gemini API error:", error);
    // Fallback to simple response if Gemini fails
    return AgentResponseSchema.parse({
      answer: "I'm sorry, I'm having trouble processing your request right now. Please try again.",
      actions: []
    });
  }
}

export async function POST(req: NextRequest) {
  if (process.env.AGENT_ENABLED !== "true") {
    return new Response(JSON.stringify({ disabled: true }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0] ||
    req.headers.get("x-real-ip") ||
    null;
  const profile = await getProfile();
  const userId = profile?.id ?? null;

  if (!checkRateLimit(userId, ip)) {
    return new Response(JSON.stringify({ error: "rate_limited" }), {
      status: 429,
      headers: { "content-type": "application/json" },
    });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "invalid_json" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const parsed = AgentRequestSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: "invalid_request" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  // Redact inputs for any logging (not logging here by default)
  const { message, context = {} } = parsed.data;

  // Enforce citizen role on server-side
  if (!profile || profile.role !== "citizen") {
    return new Response(JSON.stringify({ error: "not_authenticated" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }

  try {
    // Run a minimal agent loop (placeholder). In production, wire to Gemini using SYSTEM_PROMPT.
    const result = await runAgent(message, context);
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (error) {
    console.error("Agent error:", error);

    // Map known tool errors to user-friendly messages
    const errorMessage = error instanceof Error ? error.message : "unknown";
    let userMessage = "Something went wrong. Please try again.";
    let statusCode = 500;

    switch (errorMessage) {
      case "not_authenticated":
        userMessage = "Authentication required.";
        statusCode = 401;
        break;
      case "slot_inactive":
        userMessage = "This slot is no longer available.";
        statusCode = 400;
        break;
      case "slot_full":
        userMessage = "This slot is fully booked.";
        statusCode = 400;
        break;
      case "slot_past":
        userMessage = "Cannot book slots in the past.";
        statusCode = 400;
        break;
      case "rpc_not_available":
        userMessage = "Booking service temporarily unavailable.";
        statusCode = 503;
        break;
    }

    return new Response(
      JSON.stringify({
        error: errorMessage,
        message: userMessage,
      }),
      {
        status: statusCode,
        headers: { "content-type": "application/json" },
      }
    );
  }
}
