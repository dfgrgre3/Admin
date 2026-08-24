"use client";

import { useCallback, useState } from "react";
import { certificatesApi } from "../api";
import type { CertificateTemplate } from "../types";

export function useCertificates(handleError: (err: unknown, defaultMessage: string) => never) {
  const [certificateTemplates, setCertificateTemplates] = useState<CertificateTemplate[]>([]);

  const loadCertificateTemplates = useCallback(async () => {
    try {
      const response = await certificatesApi.getCertificateTemplates();
      if (response.error) throw new Error(response.error);
      setCertificateTemplates(response.data || []);
    } catch (err) {
      handleError(err, "فشل تحميل قوالب الشهادات");
    }
  }, [handleError]);

  const assignCertificateTemplate = useCallback(async (courseId: string, templateId: string) => {
    try {
      const response = await certificatesApi.assignCertificateTemplate(courseId, templateId);
      if (response.error) throw new Error(response.error);
    } catch (err) {
      handleError(err, "فشل تعيين قالب الشهادة");
    }
  }, [handleError]);

  const removeCertificateTemplate = useCallback(async (courseId: string) => {
    try {
      const response = await certificatesApi.removeCertificateTemplate(courseId);
      if (response.error) throw new Error(response.error);
    } catch (err) {
      handleError(err, "فشل إزالة قالب الشهادة");
    }
  }, [handleError]);

  return { certificateTemplates, loadCertificateTemplates, assignCertificateTemplate, removeCertificateTemplate };
}
