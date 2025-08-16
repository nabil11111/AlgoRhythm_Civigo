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

// Minimal Gemini function-calling loop (pseudo-implementation)
// We do not include actual SDK usage details; placeholder structure respects server-only execution.
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

  // For this implementation, we avoid external model calls and simulate a minimal deterministic flow
  // respecting the constraint to keep all tool use server-side and validated.
  // Replace with real Gemini function-calling logic wired to SYSTEM_PROMPT and response schema.

  // Heuristic: if message contains "appointments"
  if (/appointments?/i.test(message)) {
    const appts = await Tools.getUserAppointments();
    return AgentResponseSchema.parse({
      answer:
        appts.length === 0
          ? "You have no appointments."
          : `You have ${appts.length} appointments.`,
      actions: [{ type: "openAppointments" }],
    });
  }

  // If asking for slots
  if (
    /slot|book|availability/i.test(message) &&
    context.serviceId &&
    context.dateFromISO &&
    context.dateToISO
  ) {
    const slots = await Tools.searchSlots(
      context.serviceId,
      context.dateFromISO,
      context.dateToISO,
      context.branchId
    );
    return AgentResponseSchema.parse({
      answer:
        slots.length === 0
          ? "No slots in that range."
          : `Found ${slots.length} slots.`,
      actions: [
        {
          type: "showSlots",
          params: {
            serviceId: context.serviceId,
            branchId: context.branchId,
            fromISO: context.dateFromISO,
            toISO: context.dateToISO,
          },
        },
      ],
      missing: undefined,
    });
  }

  // If asking for documents/instructions
  if (/document|instruction|requirement/i.test(message) && context.serviceId) {
    const info = await Tools.getServiceInstructions(context.serviceId);
    const docs = await Tools.getUserDocuments();
    const answer = `${info.serviceName}: ${
      info.instructions_richtext
        ? "Found instructions"
        : info.instructions_pdf_url
        ? "PDF available"
        : "No instructions"
    }. You have ${docs.length} documents.`;
    return AgentResponseSchema.parse({
      answer,
      actions: [
        { type: "openService", params: { serviceId: context.serviceId } },
        { type: "openAppointments" },
      ],
    });
  }

  // Default: ask for missing inputs
  return AgentResponseSchema.parse({
    answer: "Which service and date range would you like?",
    actions: [],
    missing: {
      serviceId: !context.serviceId,
      dateRange: !context.dateFromISO || !context.dateToISO,
      branchId: !context.branchId,
    },
  });
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
