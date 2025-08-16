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
async function runAgent(
  message: string,
  context: {
    serviceId?: string;
    branchId?: string;
    dateFromISO?: string;
    dateToISO?: string;
  }
) {
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
    req.headers.get("x-forwarded-for")?.split(",")[0] || req.ip || null;
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

  // Run a minimal agent loop (placeholder). In production, wire to Gemini using SYSTEM_PROMPT.
  const result = await runAgent(message, context);
  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}
