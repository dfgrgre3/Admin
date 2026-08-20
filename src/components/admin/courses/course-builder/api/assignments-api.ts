"use client";

import type { Assignment, ApiResponse } from "../types";
import { unsupported } from "./mappers";

// ─── Assignments ────────────────────────────────────────────────────────────────
// There is no Assignment domain model, table, or route anywhere in the Go
// backend — the Next.js proxy at /api/admin/assignments forwards to a Go
// endpoint that does not exist. Student assignments/homework are not a
// feature of the backend yet, so this stays honestly unsupported end to end.

export const assignmentsApi = {
  async getAssignments(): Promise<ApiResponse<Assignment[]>> {
    return unsupported<Assignment[]>("إدارة الواجبات");
  },

  async linkAssignment(): Promise<ApiResponse<null>> {
    return unsupported<null>("ربط الواجبات بالدروس");
  },

  async unlinkAssignment(): Promise<ApiResponse<void>> {
    return unsupported<void>("فك ربط الواجبات");
  },
};
