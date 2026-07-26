import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { cmsApi } from "@/lib/api/cms-api";

describe("cmsApi live sessions", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === "string" ? input : input.toString();
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }));
  });

  afterEach(() => {
    if (originalFetch) {
      vi.stubGlobal("fetch", originalFetch);
    } else {
      vi.unstubAllGlobals();
    }
  });

  it("uses the backend admin live-sessions endpoint for create and list calls", async () => {
    const fetchMock = vi.mocked(global.fetch);

    await cmsApi.listLiveSessions();
    await cmsApi.createLiveSession({ title: "Demo", scheduledAt: "2026-07-24T10:00:00.000Z" });

    const calledUrls = fetchMock.mock.calls
      .map(([input]) => input.toString())
      .filter((url) => url.includes("/api/admin/live-sessions"));

    expect(calledUrls).toHaveLength(2);
    expect(calledUrls[0]).toContain("/api/admin/live-sessions");
    expect(calledUrls[1]).toContain("/api/admin/live-sessions");
  });
});
