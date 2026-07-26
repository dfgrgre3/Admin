import { trimTrailingSlashes } from "@/lib/utils";

export const DEFAULT_BACKEND_ORIGIN = "http://127.0.0.1:8082";
export const BROWSER_API_BASE_URL = "/api";

function ensureProtocol(url: string): string {
  return /^https?:\/\//i.test(url) ? url : `http://${url}`;
}

export function getBackendOrigin(): string {
  const configured = process.env.INTERNAL_API_URL ||
    (process.env.NODE_ENV !== "production" ? process.env.NEXT_PUBLIC_API_URL || DEFAULT_BACKEND_ORIGIN : "");

  if (!configured) {
    throw new Error("INTERNAL_API_URL is required in production for the server backend origin");
  }

  return ensureProtocol(trimTrailingSlashes(configured).replace(/\/api$/, ""));
}

export function getBackendApiBaseUrl(): string {
  return `${getBackendOrigin()}/api`;
}

export function getRuntimeApiBaseUrl(): string {
  return typeof window !== "undefined" ? BROWSER_API_BASE_URL : getBackendApiBaseUrl();
}

export function buildBackendApiUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${getBackendApiBaseUrl()}${normalized}`;
}

export function buildRuntimeApiUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;

  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (normalized.startsWith("/api/")) {
    return typeof window !== "undefined"
      ? normalized
      : `${getBackendApiBaseUrl()}${normalized.substring(4)}`;
  }

  return `${getRuntimeApiBaseUrl()}${normalized}`;
}
