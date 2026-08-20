"use client";

import type { CertificateTemplate, ApiResponse } from "../types";
import { unsupported } from "./mappers";

// ─── Certificate templates ──────────────────────────────────────────────────────
// There is no CertificateTemplate domain model or route in the Go backend —
// Course only has a free-text `certificateTemplate` string field and a
// `hasCertificate` flag (both already wired for real in draft-api.ts /
// SEOStep's sibling fields). A template *library* to pick from does not
// exist server-side yet, so this stays honestly unsupported.

export const certificatesApi = {
  async getCertificateTemplates(): Promise<ApiResponse<CertificateTemplate[]>> {
    return unsupported<CertificateTemplate[]>("قوالب الشهادات");
  },

  async assignCertificateTemplate(): Promise<ApiResponse<null>> {
    return unsupported<null>("تعيين قالب الشهادة");
  },

  async removeCertificateTemplate(): Promise<ApiResponse<void>> {
    return unsupported<void>("إزالة قالب الشهادة");
  },
};
