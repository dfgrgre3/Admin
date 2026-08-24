"use client";

import { adminApi } from "@/lib/api/admin-api";
import { courseApi } from "@/lib/api/course-api";
import type { CertificateTemplate, ApiResponse } from "../types";

interface CertificateTemplateApiItem {
  id: string;
  name: string;
  templateHtml: string;
  isDefault: boolean;
}

// ─── Certificate templates ──────────────────────────────────────────────────────
// Real shared, global library via LmsCertificateTemplate
// (certificate_template_handler.go, routes at /api/admin/certificates/templates).
// Course.certificateTemplate already existed as a free-text column no UI ever
// wrote raw text into — it's repurposed here to hold a template id instead.

export const certificatesApi = {
  async getCertificateTemplates(): Promise<ApiResponse<CertificateTemplate[]>> {
    const response = await adminApi.get<{ templates?: CertificateTemplateApiItem[] }>("/certificates/templates");
    const templates: CertificateTemplate[] = (response.templates || []).map((t) => ({
      id: t.id,
      name: t.name,
      templateHtml: t.templateHtml,
      isDefault: t.isDefault,
    }));
    return { data: templates, error: undefined };
  },

  async assignCertificateTemplate(courseId: string, templateId: string): Promise<ApiResponse<void>> {
    await courseApi.updateCourse(courseId, { certificateTemplate: templateId, hasCertificate: true });
    return { data: undefined, error: undefined };
  },

  async removeCertificateTemplate(courseId: string): Promise<ApiResponse<void>> {
    await courseApi.updateCourse(courseId, { certificateTemplate: null, hasCertificate: false });
    return { data: undefined, error: undefined };
  },
};
