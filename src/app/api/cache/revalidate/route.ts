import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { BACKEND_URL, upstreamAuthHeaders } from "@/app/api/auth/_utils";

export const dynamic = "force-dynamic";

const ALLOW_PREFIX = [
  "/blog",
  "/courses",
  "/learning",
  "/announcements",
  "/notifications",
  "/exams",
  "/teacher-exams",
  "/library",
  "/events",
  "/contests",
  "/subscription",
  "/billing",
] as const;

function isAllowedRevalidatePath(path: string): boolean {
  if (path === "/") return true;
  return ALLOW_PREFIX.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
}

export async function POST(request: NextRequest) {
  const me = await fetch(`${BACKEND_URL}/api/auth/me`, {
    headers: upstreamAuthHeaders(request),
    cache: "no-store",
  });

  if (!me.ok) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  let payload: { user?: { role?: string } };
  try {
    payload = await me.json();
  } catch {
    return NextResponse.json({ error: "فشل التحقق من الجلسة" }, { status: 502 });
  }

  const role = payload.user?.role;
  if (
    role !== "ADMIN" &&
    role !== "SUPER_ADMIN" &&
    role !== "MODERATOR" &&
    role !== "SUPPORT" &&
    role !== "TEACHER"
  ) {
    return NextResponse.json({ error: "ممنوع" }, { status: 403 });
  }

  let body: { paths?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "جسم الطلب غير صالح" }, { status: 400 });
  }

  const paths = body.paths;
  if (!Array.isArray(paths) || paths.length === 0) {
    return NextResponse.json({ error: "paths مطلوب" }, { status: 400 });
  }

  for (const path of paths) {
    if (typeof path !== "string" || !path.startsWith("/")) {
      return NextResponse.json(
        { error: "كل مسار يجب أن يبدأ بـ /" },
        { status: 400 },
      );
    }

    if (!isAllowedRevalidatePath(path)) {
      return NextResponse.json(
        { error: `مسار غير مسموح لإبطال الكاش: ${path}` },
        { status: 400 },
      );
    }
  }

  for (const path of paths as string[]) {
    revalidatePath(path);
  }

  return NextResponse.json({ ok: true, revalidated: paths });
}
