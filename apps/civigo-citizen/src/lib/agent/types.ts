// Tool result types
export type ServiceInstructionsResult = {
  serviceName: string;
  instructions_richtext?: unknown;
  instructions_pdf_url?: string;
  branches: Array<{ id: string; code: string; name: string; address?: string }>;
};

export type SlotResult = {
  id: string;
  slot_at: string; // ISO UTC
  capacity: number;
  branch_id: string;
};

export type BookSlotResult = { appointmentId: string; reference_code: string };

export type UserDocument = {
  id: string;
  name: string;
  type: string;
  status?: string;
  created_at: string; // ISO UTC
};

export type UserAppointment = {
  id: string;
  appointment_at: string; // ISO UTC
  status: string;
  reference_code: string;
  service_id: string;
  slot_id?: string | null;
};

// Agent actions
export type ActionSelectBranch = {
  type: "selectBranch";
  params: { branchId: string; branchName: string };
};
export type ActionSelectDateRange = {
  type: "selectDateRange";
  params: { fromISO: string; toISO: string };
};
export type ActionShowSlots = {
  type: "showSlots";
  params: {
    serviceId: string;
    branchId?: string;
    fromISO: string;
    toISO: string;
  };
};
export type ActionBook = { type: "book"; params: { slotId: string } };
export type ActionOpenService = {
  type: "openService";
  params: { serviceId: string };
};
export type ActionOpenAppointments = {
  type: "openAppointments";
  params?: Record<string, unknown>;
};

export type AgentAction =
  | ActionSelectBranch
  | ActionSelectDateRange
  | ActionShowSlots
  | ActionBook
  | ActionOpenService
  | ActionOpenAppointments;

export type AgentResponse = {
  answer: string;
  actions: AgentAction[];
  missing?: { serviceId?: boolean; branchId?: boolean; dateRange?: boolean };
};

export type AgentContext = {
  serviceId?: string;
  branchId?: string;
  dateFromISO?: string;
  dateToISO?: string;
};
