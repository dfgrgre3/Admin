/**
 * PDF Generation — Hybrid Strategy
 *
 * This module provides client-side PDF generation for backwards compatibility,
 * but the primary strategy is SERVER-SIDE via the Go backend.
 *
 * Strategy selection:
 *   1. Server-side preferred: GET /api/invoices/:id/pdf
 *   2. Client-side fallback:  html2canvas + jspdf (legacy, for edge cases)
 *
 * Why server-side?
 *   - Eliminates memory spikes on low-end devices (html2canvas renders full DOM)
 *   - No browser freezing during canvas-to-image conversion
 *   - Supports Arabic/Unicode text natively
 *   - Works on all devices regardless of CPU/RAM
 */

import { pdfService } from "@/services/pdf/pdf-service";
import { logger } from "@/lib/logger";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface GenerateOptions {
  /** Download filename (without extension) */
  filename?: string;
  /** Force client-side generation even if server API is available */
  forceClient?: boolean;
}

/**
 * Generate and download an invoice PDF.
 *
 * Primary: Server-side via /api/invoices/:id/pdf
 * Fallback: Client-side via html2canvas + jspdf
 *
 * @param invoiceId - The invoice UUID
 * @param elementId  - DOM element ID for fallback rendering (optional)
 * @param options    - Generation options
 */
export const generateInvoicePDF = async (
  invoiceId: string,
  elementId?: string,
  options?: GenerateOptions
): Promise<void> => {
  const filename = options?.filename || `invoice-${invoiceId}`;

  // Strategy 1: Server-side (preferred)
  if (!options?.forceClient) {
    try {
      logger.info("[PDF] Attempting server-side generation for invoice", { invoiceId });
      await pdfService.downloadInvoice(invoiceId, { filename });
      logger.info("[PDF] Server-side generation succeeded");
      return; // Success, exit
    } catch (serverError) {
      logger.warn("[PDF] Server-side generation failed, falling back to client-side", {
        error: serverError instanceof Error ? serverError.message : String(serverError),
      });
      // Fall through to client-side fallback
    }
  }

  // Strategy 2: Client-side fallback (legacy)
  if (!elementId) {
    throw new Error(
      "Cannot generate PDF: server-side failed and no elementId provided for client-side fallback"
    );
  }

  logger.info("[PDF] Using client-side fallback generation", { elementId });
  await clientSideGenerate(elementId, filename);
};

/**
 * Generate and download a report PDF (server-side only).
 *
 * @param reportId - The report UUID
 * @param options  - Generation options
 */
export const generateReportPDF = async (
  reportId: string,
  options?: GenerateOptions
): Promise<void> => {
  const filename = options?.filename || `report-${reportId}`;

  try {
    logger.info("[PDF] Generating report PDF server-side", { reportId });
    await pdfService.downloadReport(reportId, { filename });
    logger.info("[PDF] Report PDF generation succeeded");
  } catch (error) {
    logger.error("[PDF] Report PDF generation failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
};

// ======================
// Client-side fallback (legacy)
// ======================

/**
 * Client-side PDF generation using html2canvas + jspdf.
 * Kept for backwards compatibility when server is unreachable.
 */
const clientSideGenerate = async (elementId: string, filename: string): Promise<void> => {
  const element = document.getElementById(elementId);
  if (!element) {
    logger.error("[PDF] Element not found for client-side generation");
    throw new Error(`Element #${elementId} not found`);
  }

  logger.warn("[PDF] Using client-side generation - this may cause performance issues on low-end devices");

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: "#ffffff",
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const imgProps = pdf.getImageProperties(imgData);
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

  pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
  pdf.save(`${filename}.pdf`);

  logger.info("[PDF] Client-side generation completed");
};

// ======================
// Deprecation warnings
// ======================

// Legacy export kept for backwards compatibility.
// New code should use `generateInvoicePDF(invoiceId)` or `generateReportPDF(reportId)` directly.
export const generatePDF = generateInvoicePDF;