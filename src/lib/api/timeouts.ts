const DEFAULT_TIMEOUT_MS = 30_000;
const REPORT_TIMEOUT_MS = 120_000;
const UPLOAD_TIMEOUT_MS = 180_000;

const HEAVY_PATH_PATTERNS = [
  /\/reports(?:\/|$)/,
  /\/analytics(?:\/|$)/,
  /\/backups(?:\/|$)/,
  /\/infrastructure(?:\/|$)/,
  /\/ai(?:\/|$)/,
  /\/auth\/me(?:\/|$)/,
  /\/settings(?:\/|$)/,
  /export/i,
  /bulk/i,
];

const UPLOAD_PATH_PATTERNS = [
  /\/upload(?:\/|$)/,
  /\/upload\/chunked(?:\/|$)/,
  /\/upload\/presign(?:\/|$)/,
];

export function getApiTimeoutMs(path: string): number {
  if (UPLOAD_PATH_PATTERNS.some((pattern) => pattern.test(path))) {
    return UPLOAD_TIMEOUT_MS;
  }

  if (HEAVY_PATH_PATTERNS.some((pattern) => pattern.test(path))) {
    return REPORT_TIMEOUT_MS;
  }

  return DEFAULT_TIMEOUT_MS;
}
