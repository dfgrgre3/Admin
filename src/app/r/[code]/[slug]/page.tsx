import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

interface RedirectPayload {
  destinationUrl: string;
  affiliateCode: string;
  linkId: string;
  affiliateId: string;
  campaignId: string | null;
  cookieName: string;
  cookieDays: number;
  utm: {
    source: string | null;
    medium: string | null;
    campaign: string | null;
  };
  recorded: boolean;
}

function buildDestination(payload: RedirectPayload): string {
  const base = payload.destinationUrl || "/";
  try {
    const url = new URL(base);
    const { source, medium, campaign } = payload.utm || {};
    if (source) url.searchParams.set("utm_source", source);
    if (medium) url.searchParams.set("utm_medium", medium);
    if (campaign) url.searchParams.set("utm_campaign", campaign);
    url.searchParams.set("ref", payload.affiliateCode);
    if (payload.linkId) url.searchParams.set("aff_link", payload.linkId);
    return url.toString();
  } catch {
    return base;
  }
}

async function fetchRedirect(code: string, slug: string): Promise<RedirectPayload | null> {
  const apiBase =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.API_BASE_URL ||
    "http://localhost:8082";

  const url = `${apiBase.replace(/\/$/, "")}/api/v1/affiliates/redirect/${encodeURIComponent(code)}/${encodeURIComponent(slug)}`;

  try {
    const res = await fetch(url, { method: "GET", cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as { data?: RedirectPayload };
    return data?.data ?? null;
  } catch {
    return null;
  }
}

export default async function AffiliateRedirectPage({
  params,
}: {
  params: { code: string; slug: string };
}) {
  const { code, slug } = params;
  const payload = await fetchRedirect(code, slug);

  if (!payload) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-6"
        dir="rtl"
      >
        <div className="text-center space-y-3">
          <div className="text-6xl font-black">404</div>
          <p className="text-lg font-bold">رابط التتبع غير موجود أو معطّل</p>
          <a
            href="/"
            className="inline-block mt-4 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-black text-sm"
          >
            العودة للرئيسية
          </a>
        </div>
      </div>
    );
  }

  const destination = buildDestination(payload);
  const cookieName = payload.cookieName || "aff_ref";
  const cookieDays = Math.max(1, Math.min(365, payload.cookieDays || 30));

  // Set tracking cookie server-side
  try {
    const store = await cookies();
    store.set({
      name: cookieName,
      value: payload.affiliateCode,
      path: "/",
      maxAge: cookieDays * 24 * 60 * 60,
      sameSite: "lax",
    });
    if (payload.linkId) {
      store.set({
        name: "aff_link",
        value: payload.linkId,
        path: "/",
        maxAge: cookieDays * 24 * 60 * 60,
        sameSite: "lax",
      });
    }
  } catch {
    /* cookies() may be read-only in some edge setups; client script below is the fallback */
  }

  return (
    <>
      <meta httpEquiv="refresh" content={`0;url=${destination}`} />

      <div
        className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-6"
        dir="rtl"
      >
        <div className="text-center space-y-4 max-w-md">
          <div
            className="mx-auto h-14 w-14 rounded-full border-4 border-primary border-t-transparent animate-spin"
            aria-hidden
          />
          <h1 className="text-xl font-black">جارٍ تحويلك…</h1>
          <p className="text-sm text-muted-foreground">
            نقوم بتوجيهك إلى صفحة المسوّق. إذا لم يتم التحويل تلقائيًا، اضغط الزر أدناه.
          </p>
          <a
            href={destination}
            className="inline-block mt-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-black text-sm"
          >
            متابعة الآن
          </a>
        </div>

        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{document.cookie=${JSON.stringify(
              cookieName + "=" + payload.affiliateCode
            )}; path=/; max-age=${cookieDays * 24 * 60 * 60}; samesite=lax;` +
              `document.cookie=${JSON.stringify(
                "aff_link=" + payload.linkId
              )}; path=/; max-age=${cookieDays * 24 * 60 * 60}; samesite=lax;` +
              `}catch(e){}window.location.replace(${JSON.stringify(destination)});})();`,
          }}
        />
      </div>
    </>
  );
}