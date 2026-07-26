/**
 * AB Testing Service
 *
 * Provides AB testing management via the backend API.
 * Backend response format: { success: true, data: { experiments: [...] } }
 * or for single item: { success: true, data: { experiment: {...} } }
 */

import { Experiment, CreateExperimentData, BackendABExperiment } from "@/types/ab-testing";
import { adminFetch } from "@/lib/api/admin-api";
import { apiRoutes } from "@/lib/api/routes";

const statusMap: Record<string, Experiment["status"]> = {
  DRAFT: "draft",
  RUNNING: "active",
  PAUSED: "paused",
  COMPLETED: "completed",
};

const reverseStatusMap: Record<Experiment["status"], string> = {
  draft: "DRAFT",
  active: "RUNNING",
  paused: "PAUSED",
  completed: "COMPLETED",
};

function parseBackendData<T>(json: any, key: string): T | null {
  // Backend wraps in { success: true, data: { key: value } }
  if (json.data && json.data[key]) return json.data[key];
  // Fallback for plain responses
  if (json[key]) return json[key];
  // Fallback for direct object
  return null;
}

function mapBackendToFrontend(item: BackendABExperiment): Experiment {
  let variants: { name: string; views: number; completionRate: number; avgScore?: number }[] = [];
  try {
    variants = item.variants ? JSON.parse(item.variants) : [];
  } catch {
    variants = [];
  }

  return {
    id: item.id,
    title: item.name,
    description: item.description || "",
    status: statusMap[item.status] || "draft",
    variantA: variants[0] || { name: "A", views: 0, completionRate: 0 },
    variantB: variants[1] || { name: "B", views: 0, completionRate: 0 },
    winner: (item.winner === "A" || item.winner === "B") ? item.winner as "A" | "B" : undefined,
    startDate: item.startDate || item.createdAt,
    endDate: item.endDate || undefined,
    createdBy: "Admin",
    sampleSize: item.trafficPct,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

const getAllExperiments = async (): Promise<Experiment[]> => {
  const response = await adminFetch(apiRoutes.admin.abTesting);
  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody.error || "Failed to fetch AB experiments");
  }
  const json = await response.json();
  const items: BackendABExperiment[] = parseBackendData<BackendABExperiment[]>(json, "experiments") || [];
  return items.map(mapBackendToFrontend);
};

const createExperiment = async (data: CreateExperimentData): Promise<Experiment> => {
  const variants = JSON.stringify([
    { name: data.variantAName, views: 0, completionRate: 0 },
    { name: data.variantBName, views: 0, completionRate: 0 },
  ]);

  const response = await adminFetch(apiRoutes.admin.abTesting, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: data.title,
      description: data.description,
      status: "DRAFT",
      variants,
      trafficPct: 100,
    }),
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody.error || "Failed to create experiment");
  }
  const json = await response.json();
  const item: BackendABExperiment = parseBackendData<BackendABExperiment>(json, "experiment") || json;
  return mapBackendToFrontend(item);
};

const updateExperimentStatus = async (
  id: string,
  newStatus: "active" | "paused" | "completed"
): Promise<Experiment> => {
  const backendStatus = reverseStatusMap[newStatus];
  const response = await adminFetch(`${apiRoutes.admin.abTesting}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      status: backendStatus,
      ...(newStatus === "completed" ? { endDate: new Date().toISOString() } : {}),
    }),
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody.error || "Failed to update experiment status");
  }
  const json = await response.json();
  const item: BackendABExperiment = parseBackendData<BackendABExperiment>(json, "experiment") || json;
  return mapBackendToFrontend(item);
};

const declareWinner = async (id: string, winner: "A" | "B"): Promise<Experiment> => {
  const response = await adminFetch(`${apiRoutes.admin.abTesting}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      status: "COMPLETED",
      endDate: new Date().toISOString(),
      winner,
    }),
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody.error || "Failed to declare winner");
  }
  const json = await response.json();
  const item: BackendABExperiment = parseBackendData<BackendABExperiment>(json, "experiment") || json;
  return mapBackendToFrontend(item);
};

const deleteExperiment = async (id: string): Promise<void> => {
  const response = await adminFetch(`${apiRoutes.admin.abTesting}/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody.error || "Failed to delete experiment");
  }
};

const getExperimentVariant = async (experimentId: string, userId: string): Promise<string> => {
  if (!experimentId.trim() || !userId.trim()) {
    throw new Error("Experiment ID and user ID are required");
  }

  const experiments = await getAllExperiments();
  if (!experiments.some((experiment) => experiment.id === experimentId)) {
    throw new Error("Experiment not found");
  }

  // Assignment must be generated and persisted by the backend. A client-side
  // hash is user-controlled and can bias experiments or expose allocation rules.
  const response = await adminFetch(
    `${apiRoutes.admin.abTesting}/${encodeURIComponent(experimentId)}/variant?userId=${encodeURIComponent(userId)}`,
    { cache: "no-store" },
  );
  if (!response.ok) {
    throw new Error("Failed to resolve experiment variant");
  }
  const json = await response.json();
  const variant = json?.data?.variant ?? json?.variant;
  if (variant !== "A" && variant !== "B") {
    throw new Error("Backend returned an invalid experiment variant");
  }
  return variant;
};

const trackExperimentEvent = async (
  experimentId: string,
  userId: string,
  event: string
): Promise<void> => {
  const response = await adminFetch(`${apiRoutes.admin.abTesting}/${experimentId}/track`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, event }),
  });
  if (!response.ok) throw new Error("Failed to track experiment event");
};

const abTestingService = {
  getAllExperiments,
  createExperiment,
  updateExperimentStatus,
  declareWinner,
  deleteExperiment,
  getExperimentVariant,
  trackExperimentEvent,
};

export { abTestingService };
export default abTestingService;