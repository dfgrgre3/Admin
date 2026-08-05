"use client";

import dynamic from "next/dynamic";
import * as React from "react";

/**
 * Centralized dynamic imports for heavy components.
 * Each component below is code-split and only fetched when actually needed,
 * rather than being bundled into the main chunk of every page that imports it.
 */

// Charts — loaded only when they appear on screen
export const UserGrowthChart = dynamic(
  () => import("@/components/admin/dashboard/user-growth-chart").then((m) => m.UserGrowthChart),
  { ssr: false, loading: () => <div className="h-[300px] w-full animate-pulse rounded-2xl bg-muted/10" /> },
);

export const ActivityChart = dynamic(
  () => import("@/components/admin/dashboard/activity-chart").then((m) => m.ActivityChart),
  { ssr: false, loading: () => <div className="h-[300px] w-full animate-pulse rounded-2xl bg-muted/10" /> },
);

export const ActivityHeatmap = dynamic(
  () => import("@/components/admin/dashboard/activity-heatmap").then((m) => m.ActivityHeatmap),
  { ssr: false, loading: () => <div className="h-[300px] w-full animate-pulse rounded-2xl bg-muted/10" /> },
);

export const DistributionChart = dynamic(
  () => import("@/components/admin/dashboard/distribution-chart").then((m) => m.DistributionChart),
  { ssr: false, loading: () => <div className="h-[300px] w-full animate-pulse rounded-2xl bg-muted/10" /> },
);

// Heavy UI components loaded on-demand
export const MarkdownEditor = dynamic(
  () => import("@/components/admin/ui/markdown-editor").then((m) => m.MarkdownEditor),
  { ssr: false, loading: () => <div className="h-64 w-full animate-pulse rounded-2xl bg-muted/10" /> },
);

export const CsvImportDialog = dynamic(
  () => import("@/components/admin/ui/csv-import-dialog").then((m) => m.CsvImportDialog),
  { ssr: false, loading: () => null },
);

// Export utilities — jspdf/html2canvas are heavy and only needed when exporting
export const PdfExport = async (): Promise<typeof import("jspdf")["jsPDF"]> => {
  const module = await import("jspdf");
  return module.jsPDF;
};

export const Html2Canvas = async (): Promise<typeof import("html2canvas")["default"]> => {
  const module = await import("html2canvas");
  return module.default;
};

// Command palette — only loaded after first interaction
export const CommandPalette = dynamic(
  () => import("@/components/admin/ui/command-palette").then((m) => m.CommandPalette),
  { ssr: false, loading: () => null },
);

// Broadcast modal — heavy dialog with user list
export const BroadcastModal = dynamic(
  () => import("@/components/admin/broadcast/broadcast-modal").then((m) => ({ default: m.BroadcastModal })),
  { ssr: false, loading: () => null },
);

// Editors
export const TipTapEditor = dynamic(
  () => import("@/components/ui/tiptap-editor").then((m) => m.TipTapEditor),
  { ssr: false, loading: () => <div className="h-64 w-full animate-pulse rounded-2xl bg-muted/10" /> },
);

// Log viewer — heavy monaco/console-like component
export const PremiumLogViewer = dynamic(
  () => import("@/components/admin/monitoring/PremiumLogViewer").then((m) => ({ default: m.PremiumLogViewer })),
  { ssr: false, loading: () => <div className="h-[500px] w-full animate-pulse rounded-2xl bg-muted/10" /> },
);

export const RealTimePerformanceChart = dynamic(
  () => import("@/components/admin/monitoring/RealTimePerformanceChart").then((m) => m.RealTimePerformanceChart),
  { ssr: false, loading: () => <div className="h-[300px] w-full animate-pulse rounded-2xl bg-muted/10" /> },
);