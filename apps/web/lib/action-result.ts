// Shared discriminated result type returned by every public Server Action
// (apps/web/actions/*.ts) so calling client components can render
// field-level errors without a try/catch around a thrown exception.
export type ActionResult =
  | { ok: true; message?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };
