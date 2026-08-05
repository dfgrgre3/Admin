/**
 * Minimal external alerting via a generic webhook (Slack / Discord / Grafana
 * Alertmanager / custom endpoint).
 *
 * Fire-and-forget by design: it never throws and never blocks startup or the
 * request path. Configure the target URL with ALERT_WEBHOOK_URL; when unset,
 * alerts are no-ops (logged to console instead of silently dropped).
 */

const ALERT_TIMEOUT_MS = 5_000;

export interface WebhookAlertPayload {
  title: string;
  message: string;
  level?: "critical" | "error" | "warning";
  fields?: Record<string, string>;
}

export async function sendWebhookAlert({
  title,
  message,
  level = "error",
  fields,
}: WebhookAlertPayload): Promise<void> {
  const webhookUrl = process.env.ALERT_WEBHOOK_URL?.trim();
  if (!webhookUrl) {
    console.warn(
      `[webhook-alert] "${title}" would be reported externally, but ALERT_WEBHOOK_URL is not set. ` +
        "Configure it in production to receive startup/critical failure alerts."
    );
    return;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ALERT_TIMEOUT_MS);

  try {
    const payload = {
      title,
      message,
      level,
      service: "thanawy-admin",
      environment: process.env.NODE_ENV ?? "development",
      time: new Date().toISOString(),
      fields,
    };

    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  } catch (error) {
    // An alert must never take the application down.
    console.error("[webhook-alert] Failed to deliver alert", error instanceof Error ? error.message : error);
  } finally {
    clearTimeout(timer);
  }
}
