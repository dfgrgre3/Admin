import { trimTrailingSlashes } from "@/lib/utils";

const DEVELOPMENT_BACKEND_ORIGIN = "http://127.0.0.1:8082";
export const BROWSER_API_BASE_URL = "/api";

function ensureProtocol(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  return `${process.env.NODE_ENV === "production" ? "https" : "http"}://${url}`;
}

function assertSecureProductionOrigin(url: string): void {
  if (process.env.NODE_ENV === "production" && !url.toLowerCase().startsWith("https://")) {
    throw new Error("INTERNAL_API_URL must use HTTPS in production");
  }
}

export function getBackendOrigin(): string {
  const internal = process.env.INTERNAL_API_URL?.trim();
  const publicUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  const configured = internal ||
    (process.env.NODE_ENV !== "production" ? publicUrl || DEVELOPMENT_BACKEND_ORIGIN : "");

  if (!configured) {
    throw new Error("INTERNAL_API_URL is required in production for the server backend origin");
  }

  const origin = ensureProtocol(trimTrailingSlashes(configured).replace(/\/api$/, ""));
  assertSecureProductionOrigin(origin);
  return origin;
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
