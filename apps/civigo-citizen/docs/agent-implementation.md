# Citizen AI Agent — Implementation Plan

This document tracks the full implementation of the Citizen AI Agent and all subsequent progress logs. Keep edits minimal and aligned with existing SSR + Supabase RLS patterns.

## 0) Overview

- Goal: Add an AI assistant in the Citizen app that uses only five server-side tools and never runs SQL or reads PDFs directly.
- Tools (server-only):
  - getServiceInstructions(serviceId)
  - searchSlots(serviceId, dateFromISO, dateToISO, branchId?)
  - bookSlot({ slotId, notes? })
  - getUserDocuments()
  - getUserAppointments()
- Guardrails:
  - All DB access via existing Supabase clients/RPC/RLS
  - Datetimes returned as ISO UTC; UI localizes
  - No file contents or signed URLs returned by tools
  - Minimal Gemini-based function-calling controller via an API route
  - Feature flag: AGENT_ENABLED

## 1) Task Checklist

1. Create this plan file (you are here)
2. Add server-side tools module: `apps/civigo-citizen/src/app/(protected)/_agent_tools.ts`
3. Define shared types and schemas: `apps/civigo-citizen/src/lib/agent/{types.ts,schemas.ts}`
4. Add Agent Controller API route: `apps/civigo-citizen/src/app/api/agent/route.ts`
5. Add agent constants: `apps/civigo-citizen/src/lib/agent/constants.ts`
6. Chat UI components: `apps/civigo-citizen/src/components/agent/*`
7. Integrate ChatButton in protected layout
8. Validation, error mapping, and rate limiting
9. Tests (unit helpers + lightweight integration for API route)
10. Configuration and demos (env flags and demo scripts)

## 2) Actions Schema (Agent → UI)

Action types and params (UI SuggestedActions):

- selectBranch: { branchId: string, branchName: string }
- selectDateRange: { fromISO: string, toISO: string }
- showSlots: { serviceId: string, branchId?: string, fromISO: string, toISO: string }
- book: { slotId: string }
- openService: { serviceId: string }
- openAppointments: {}

## 3) System Prompt (Controller)

You are an assistant for a government appointment portal. Only use the provided tools. Never invent data. If needed inputs (serviceId, branchId, date range) are missing, ask one concise question and propose options from tool results. Keep answers brief and include suggested actions. Do not include personal data. When booking, use only slotId and attach only document IDs from getUserDocuments().

## 4) Tools Contract (Server-only)

- getServiceInstructions(serviceId: string): Promise<{ serviceName: string; instructions_richtext?: unknown; instructions_pdf_url?: string; branches: Array<{ id: string; code: string; name: string; address?: string }> }>
- searchSlots(serviceId: string, dateFromISO: string, dateToISO: string, branchId?: string): Promise<Array<{ id: string; slot_at: string; capacity: number; branch_id: string }>>
- bookSlot(input: { slotId: string; notes?: string }): Promise<{ appointmentId: string; reference_code: string }>
- getUserDocuments(): Promise<Array<{ id: string; name: string; type: string; status?: string; created_at: string }>>
- getUserAppointments(): Promise<Array<{ id: string; appointment_at: string; status: string; reference_code: string; service_id: string; slot_id?: string }>>

All tools:

- Validate inputs with zod
- Use `getServerClient()` and session identity
- Only return metadata; no file blobs or signed URLs
- Return all datetimes as ISO UTC strings

## 5) Security & Privacy

- Auth & Role: Enforce citizen role in the API route; rely on RLS and server identity
- Rate limiting: per IP+userId (e.g., 10 requests / 5 minutes)
- PII: Never include NIC, phone, or email in model inputs; hash params if logged
- Storage: Never return signed URLs; only public instruction PDF URLs; documents list returns metadata only
- Env: `GEMINI_API_KEY` server-only; `AGENT_ENABLED` feature flag; keys never exposed to client

## 6) Controller (API Route) Design

- Path: `apps/civigo-citizen/src/app/api/agent/route.ts`
- Input: `{ message: string; context?: { serviceId?: string; branchId?: string; dateFromISO?: string; dateToISO?: string } }`
- Build Gemini request with:
  - `systemInstruction = SYSTEM_PROMPT`
  - `tools`: function declarations matching the five tools, with JSON schemas
  - `response_mime_type: application/json` and `response_schema` (see schemas.ts)
- Tool-calling loop:
  - If model requests a tool call, validate with zod and call server tool
  - Feed tool result back as functionResponse and continue until final JSON
  - Hard cap loops (e.g. 3) and timeouts

## 7) UI Design

- Components in `src/components/agent/`:
  - ChatButton: floating trigger (respects `AGENT_ENABLED` via server-prop)
  - ChatDrawer: message panel and input
  - MessageList: bubbles
  - SuggestedActions: renders action buttons and emits context updates
- Context state: `{ serviceId?, branchId?, dateFromISO?, dateToISO? }`
- Events:
  - Actions update context or POST to `/api/agent` with updated context
  - Navigation for `openService` and `openAppointments` via Next router

## 8) Testing & Demo

- Unit tests: helpers (action validation), zod schemas (inputs, response)
- Integration: API route minimal test with AGENT_DISABLED and mocked Gemini
- Demos:
  - A) “What documents do I need for Passport Renewal?”
  - B) “Find me a morning slot next week at Colombo HQ, book it.”
  - C) “What appointments do I have?”

## 9) Configuration & Flags

- env: `GEMINI_API_KEY` (server), `AGENT_ENABLED=true` (server)
- Build: ensure no secret leaks to client; do not use NEXT_PUBLIC for secrets

## 10) Step-by-step Tasks (Expanded)

1. Plan file (this)
2. Server tools module with zod
3. Shared types and zod schemas
4. Agent API route with Gemini function-calling loop
5. Constants (system prompt, action types)
6. Chat UI components
7. Integrate ChatButton in protected layout
8. Validation + error mapping + rate limit
9. Tests (unit + integration-lite)
10. Demo scripts appended here

---

## Demo Scenarios (Scripts)

### A) Documents needed for a service

1. Agent calls getServiceInstructions(serviceId)
2. Agent summarizes requirements from `instructions_richtext` or notes “PDF available”
3. Agent calls getUserDocuments() and lists what the user already has
4. SuggestedActions: `openService`, `openAppointments`

### B) Find morning slot next week at a branch and book

1. Agent asks for missing inputs (serviceId/branchId/dateRange) if needed
2. Agent calls searchSlots(serviceId, dateFromISO, dateToISO, branchId)
3. Agent proposes options and SuggestedActions: `showSlots`, `book {slotId}`
4. On confirm, agent calls bookSlot({ slotId }) and returns reference code

### C) What appointments do I have?

1. Agent calls getUserAppointments()
2. Agent summarizes upcoming/past; SuggestedActions: `openAppointments`

---

## Progress Log

(Append a new entry after every commit with: Task #, short commit hash, files changed, and a brief summary.)
