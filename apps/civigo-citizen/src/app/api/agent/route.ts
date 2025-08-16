import { NextRequest } from "next/server";
import {
  AgentRequestSchema,
  AgentResponseSchema,
  IsoDateSchema,
  SlotIdSchema,
  ServiceIdSchema,
} from "@/lib/agent/schemas";
import { SYSTEM_PROMPT } from "@/lib/agent/constants";
import { getProfile, getServerClient } from "@/utils/supabase/server";
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

// Get initial context for the conversation
async function getInitialContext() {
  try {
    const profile = await getProfile();
    if (!profile) return null;

    // Get available services from database with their departments
    const supabase = await getServerClient();
    const { data: services } = await supabase
      .from("services")
      .select(
        `
        id, 
        name, 
        code, 
        description,
        department_id,
        departments!inner(
          id,
          name,
          code
        )
      `
      )
      .eq("active", true)
      .order("name");

    // Get branches/locations available
    const { data: branches } = await supabase
      .from("branches")
      .select(
        `
        id,
        name,
        code,
        address,
        department_id,
        departments!inner(name, code)
      `
      )
      .eq("active", true)
      .order("name");

    // Get user's current appointments and documents
    const [appointments, documents] = await Promise.all([
      Tools.getUserAppointments().catch(() => []),
      Tools.getUserDocuments().catch(() => []),
    ]);

    return {
      user: {
        id: profile.id,
        name: profile.full_name,
        govId: profile.gov_id,
        role: profile.role,
      },
      services:
        services?.map((s) => ({
          id: s.id,
          name: s.name,
          code: s.code,
          description: s.description,
          department: (s as any).departments?.name,
          departmentCode: (s as any).departments?.code,
        })) || [],
      branches:
        branches?.map((b) => ({
          id: b.id,
          name: b.name,
          code: b.code,
          address: b.address,
          department: (b as any).departments?.name,
          departmentCode: (b as any).departments?.code,
        })) || [],
      currentAppointments: appointments.slice(0, 5), // Last 5 appointments
      documentsCount: documents.length,
      currentDate: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error getting initial context:", error);
    return null;
  }
}

// Real Gemini function-calling implementation
export async function runAgent(
  message: string,
  context: {
    serviceId?: string;
    branchId?: string;
    dateFromISO?: string;
    dateToISO?: string;
    isInitialMessage?: boolean;
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
    systemInstruction: SYSTEM_PROMPT,
  });

  // Define available tools for Gemini
  const tools = [
    {
      functionDeclarations: [
        {
          name: "getServiceInstructions",
          description:
            "Get instructions and requirements for a government service",
          parameters: {
            type: SchemaType.OBJECT,
            properties: {
              serviceId: {
                type: SchemaType.STRING,
                description: "The service ID",
              },
            },
            required: ["serviceId"],
          },
        },
        {
          name: "searchSlots",
          description: "Search for available appointment slots",
          parameters: {
            type: SchemaType.OBJECT,
            properties: {
              serviceId: {
                type: SchemaType.STRING,
                description: "The service ID",
              },
              dateFromISO: {
                type: SchemaType.STRING,
                description: "Start date in ISO format",
              },
              dateToISO: {
                type: SchemaType.STRING,
                description: "End date in ISO format",
              },
              branchId: {
                type: SchemaType.STRING,
                description: "Optional branch ID",
              },
            },
            required: ["serviceId", "dateFromISO", "dateToISO"],
          },
        },
        {
          name: "bookSlot",
          description: "Book an appointment slot",
          parameters: {
            type: SchemaType.OBJECT,
            properties: {
              slotId: {
                type: SchemaType.STRING,
                description: "The slot ID to book",
              },
              notes: { type: SchemaType.STRING, description: "Optional notes" },
            },
            required: ["slotId"],
          },
        },
        {
          name: "getUserDocuments",
          description: "Get user's uploaded documents",
          parameters: {
            type: SchemaType.OBJECT,
            properties: {},
          },
        },
        {
          name: "getUserAppointments",
          description: "Get user's appointments",
          parameters: {
            type: SchemaType.OBJECT,
            properties: {},
          },
        },
      ],
    },
  ];

  // Build conversation with context
  let prompt = `User: ${message}`;

  // Add conversation context if available
  const contextInfo = Object.entries(context)
    .filter(([key, value]) => key !== "isInitialMessage" && value)
    .map(([key, value]) => `${key}: ${value}`)
    .join(", ");

  if (contextInfo) {
    prompt = `Context: ${contextInfo}\n\n${prompt}`;
  }

  // For initial message or when no context, add comprehensive background
  if (
    context.isInitialMessage ||
    (!context.serviceId && message.length < 100)
  ) {
    const initialContext = await getInitialContext();
    if (initialContext) {
      const backgroundPrompt = `
SYSTEM CONTEXT for this conversation:

Current User:
- Name: ${initialContext.user.name}
- Government ID: ${initialContext.user.govId}
- Current Date: ${new Date(initialContext.currentDate).toLocaleDateString()}

Available Services in System:
${initialContext.services
  .map(
    (s) =>
      `- ${s.name} (ID: ${s.id}) - ${s.department} [${s.departmentCode}]${
        s.description ? ` - ${s.description}` : ""
      }`
  )
  .join("\n")}

Available Branches/Locations:
${initialContext.branches
  .map(
    (b) =>
      `- ${b.name} (ID: ${b.id}) - ${b.department} [${b.departmentCode}]${
        b.address ? ` - ${b.address}` : ""
      }`
  )
  .join("\n")}

User's Current Status:
- Active Appointments: ${initialContext.currentAppointments.length}
- Uploaded Documents: ${initialContext.documentsCount}

Recent Appointments:
${
  initialContext.currentAppointments.length > 0
    ? initialContext.currentAppointments
        .map(
          (a) =>
            `- ${a.status} appointment on ${new Date(
              a.appointment_at
            ).toLocaleDateString()}`
        )
        .join("\n")
    : "- No recent appointments"
}

Now respond to the user's message with this context in mind.

${prompt}`;

      prompt = backgroundPrompt;
    }
  }

  try {
    // Start chat with tools (casting to any to bypass TypeScript issues)
    const chat = model.startChat({ tools: tools as any });
    const result = await chat.sendMessage(prompt);

    let response = result.response;

    // Handle function calls: perform tool calls server-side and finalize response here
    const candidates = result.response.candidates;
    if (candidates && candidates[0]?.content?.parts) {
      const firstCall = (candidates[0].content.parts as any[]).find(
        (p) => p && p.functionCall
      )?.functionCall as undefined | { name: string; args?: Record<string, unknown> };

      if (firstCall) {
        const name = firstCall.name;
        const args = (firstCall.args ?? {}) as Record<string, unknown>;

        switch (name) {
          case "getUserAppointments": {
            const appts = await Tools.getUserAppointments();
            const upcoming = appts.filter((a) => new Date(a.appointment_at) > new Date());
            return AgentResponseSchema.parse({
              answer:
                upcoming.length === 0
                  ? "You have no upcoming appointments."
                  : `You have ${upcoming.length} upcoming appointments.`,
              actions: [{ type: "openAppointments" }],
            });
          }
          case "getUserDocuments": {
            const docs = await Tools.getUserDocuments();
            return AgentResponseSchema.parse({
              answer: `You have ${docs.length} documents in your wallet.`,
              actions: [],
            });
          }
          case "getServiceInstructions": {
            const serviceId = String(args.serviceId || context.serviceId || "");
            const info = await Tools.getServiceInstructions(serviceId);
            const docs = await Tools.getUserDocuments();
            const hasInstr = info.instructions_richtext || info.instructions_pdf_url;
            const answer = `${info.serviceName}: ${hasInstr ? "Instructions available." : "No instructions found."} You currently have ${docs.length} documents.`;
            return AgentResponseSchema.parse({
              answer,
              actions: [
                { type: "openService", params: { serviceId } },
                { type: "openAppointments" },
              ],
            });
          }
          case "searchSlots": {
            const serviceId = String(args.serviceId || context.serviceId || "");
            const dateFromISO = String(args.dateFromISO || context.dateFromISO || "");
            const dateToISO = String(args.dateToISO || context.dateToISO || "");
            const branchId = args.branchId ? String(args.branchId) : context.branchId;

            const slots = await Tools.searchSlots(serviceId, dateFromISO, dateToISO, branchId);
            const count = slots.length;
            return AgentResponseSchema.parse({
              answer: count === 0 ? "No slots found in that range." : `Found ${count} slots in that range.`,
              actions: [
                {
                  type: "showSlots",
                  params: { serviceId, branchId, fromISO: dateFromISO, toISO: dateToISO },
                },
              ],
            });
          }
          case "bookSlot": {
            const slotId = String(args.slotId || "");
            const notes = args.notes ? String(args.notes) : undefined;
            const res = await Tools.bookSlot({ slotId, notes });
            return AgentResponseSchema.parse({
              answer: `Booked successfully. Reference code: ${res.reference_code}.`,
              actions: [{ type: "openAppointments" }],
            });
          }
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
        params: { serviceId: context.serviceId },
      });
    }

    return AgentResponseSchema.parse({
      answer,
      actions,
    });
  } catch (error) {
    console.error("Gemini API error:", error);
    // Fallback: propose popular services to avoid dead-ends
    const initial = await getInitialContext();
    const top = initial?.services?.slice(0, 4) ?? [];
    const lines = top.map((s) => `- ${s.name} (${s.department})`).join("\n");
    const answer =
      top.length > 0
        ? `Let's continue. Please pick a service to proceed:\n${lines}`
        : "Please tell me which service you need and a date range (for example: next week).";
    const actions = top.map((s) => ({ type: "openService" as const, params: { serviceId: s.id } }));
    return AgentResponseSchema.parse({ answer, actions });
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
