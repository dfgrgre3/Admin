/**
 * PDF Service — Server-Side Generation
 *
 * Replaces client-side html2canvas + jspdf with server-side PDF generation
 * via the Go backend. This eliminates:
 *   - High memory usage on low-end devices (html2canvas renders full DOM)
 *   - Browser freezing during canvas-to-image conversion
 *   - Large base64 data URLs in memory
 *
 * Usage:
 *   import { pdfService } from "@/services/pdf/pdf-service";
 *   await pdfService.downloadInvoice("invoice-id-123");
 *   await pdfService.downloadReport("report-id-456");
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

interface DownloadOptions {
  /** Optional filename for the downloaded PDF */
  filename?: string;
}

class PDFService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE) {
    this.baseUrl = baseUrl;
  }

  /**
   * Download an invoice PDF by invoice ID.
   * GET /api/invoices/:id/pdf
   */
  async downloadInvoice(invoiceId: string, options?: DownloadOptions): Promise<void> {
    if (!invoiceId) {
      throw new Error("Invoice ID is required");
    }

    const url = `${this.baseUrl}/api/v1/invoices/${encodeURIComponent(invoiceId)}/pdf`;

    try {
      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/pdf",
        },
      });

      if (!response.ok) {
        const errorBody = await response.text().catch(() => "");
        throw new Error(
          `Failed to download invoice PDF (${response.status}): ${errorBody || response.statusText}`
        );
      }

      await this.triggerDownload(response, options?.filename || `invoice-${invoiceId}.pdf`);
    } catch (error) {
      console.error("[PDFService] downloadInvoice failed:", error);
      throw error;
    }
  }

  /**
   * Download a report PDF by report ID.
   * GET /api/admin/reports/:id/export?format=pdf
   */
  async downloadReport(reportId: string, options?: DownloadOptions): Promise<void> {
    if (!reportId) {
      throw new Error("Report ID is required");
    }

    const url = `${this.baseUrl}/api/v1/admin/reports/${encodeURIComponent(reportId)}/export?format=pdf`;

    try {
      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/pdf",
        },
      });

      if (!response.ok) {
        const errorBody = await response.text().catch(() => "");
        throw new Error(
          `Failed to download report PDF (${response.status}): ${errorBody || response.statusText}`
        );
      }

      await this.triggerDownload(response, options?.filename || `report-${reportId}.pdf`);
    } catch (error) {
      console.error("[PDFService] downloadReport failed:", error);
      throw error;
    }
  }

  /**
   * Trigger a browser download from a fetch Response.
   */
  private async triggerDownload(response: Response, filename: string): Promise<void> {
    const blob = await response.blob();

    // Validate that we received a PDF
    if (!blob.type.includes("pdf") && !blob.type.includes("octet-stream")) {
      // Some servers send application/octet-stream for PDFs
      console.warn(`[PDFService] Unexpected content type: ${blob.type}`);
    }

    // Create a download link and trigger it
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = filename;
    link.style.display = "none";

    document.body.appendChild(link);
    link.click();

    // Cleanup
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    }, 100);
  }
}

/** Singleton instance */
export const pdfService = new PDFService();