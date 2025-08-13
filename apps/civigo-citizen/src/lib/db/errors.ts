export type FriendlyDbError =
  | "unique_violation"
  | "referential_violation"
  | "insufficient_privilege"
  | "not_found"
  | "unknown";

export function mapPostgresError(e: unknown): { code: FriendlyDbError; message?: string } {
  const err = (e || {}) as { code?: string; message?: string; details?: string };
  switch (err.code) {
    case "23505":
      return { code: "unique_violation", message: err.message };
    case "23503":
      return { code: "referential_violation", message: err.message };
    case "42501":
      return { code: "insufficient_privilege", message: err.message };
    case "PGRST116":
      return { code: "not_found", message: err.message };
    default:
      return { code: "unknown", message: err.message };
  }
}


