"use client";

import * as React from "react";
import type { UserDetails } from "./types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ShieldAlert,
  Video,
  Clock,
  CheckCircle2,
  XCircle,
  Globe,
  Monitor,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { format, isValid } from "date-fns";
import { ar } from "date-fns/locale";
import { toast } from "sonner";
import { adminUsersApi } from "@/lib/api/admin-users-api";

// ── Login Attempts ──────────────────────────────────────────────
// Detects brute-force / account-takeover patterns.
function LoginAttemptsCard({ userId }: { userId: string }) {
  const [attempts, setAttempts] = React.useState<Array<{
    id: string; eventType: string; success: boolean; ip: string; userAgent: string; location?: string; createdAt: string;
  }>>([]);
  const [failedCount, setFailedCount] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    adminUsersApi.getLoginAttempts(userId, { limit: 50 })
      .then((res) => {
        if (cancelled) return;
        setAttempts(res.attempts);
        setFailedCount(res.failedCount);
      })
      .catch(() => !cancelled && setError("تعذر تحميل محاولات الدخول"))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [userId]);

  return (
    <Card className="border-none shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-primary" />
          سجل محاولات تسجيل الدخول
        </CardTitle>
        <CardDescription>
          {loading ? "جاري التحميل..." : `${attempts.length} محاولة · ${failedCount} فاشلة`}
          {failedCount > 5 && (
            <span className="mr-2 inline-flex items-center gap-1 text-danger font-bold">
              <AlertTriangle className="h-3 w-3" /> نشاط مشبوه محتمل
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : error ? (
          <p className="text-center text-sm text-danger py-6">{error}</p>
        ) : attempts.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-6">لا توجد محاولات دخول مسجلة</p>
        ) : (
          <div className="space-y-2 max-h-[360px] overflow-y-auto">
            {attempts.map((a) => (
              <div
                key={a.id}
                className={`flex items-center justify-between rounded-xl border p-3 ${
                  a.success ? "bg-green-500/5 border-green-500/10" : "bg-red-500/5 border-red-500/10"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`p-2 rounded-lg ${a.success ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>
                    {a.success ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold">
                      {a.success ? "دخول ناجح" : a.eventType === "LOGIN_FAILED" ? "محاولة فاشلة" : a.eventType}
                    </p>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1" dir="ltr">
                      <Globe className="h-3 w-3" /> {a.ip} {a.location ? `· ${a.location}` : ""}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground shrink-0">
                  {isValid(new Date(a.createdAt))
                    ? format(new Date(a.createdAt), "d MMM HH:mm", { locale: ar })
                    : "-"}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Video Engagement (Watch Time) ───────────────────────────────
function VideoEngagementCard({ userId }: { userId: string }) {
  const [videos, setVideos] = React.useState<Array<{
    lessonId: string; timeSpentSeconds: number; timeSpentMinutes: number; completed: boolean; status: string; lastWatchedPosition: number;
  }>>([]);
  const [totalMinutes, setTotalMinutes] = React.useState(0);
  const [totalVideos, setTotalVideos] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    adminUsersApi.getVideoEngagement(userId, { limit: 100 })
      .then((res) => {
        if (cancelled) return;
        setVideos(res.videos);
        setTotalMinutes(res.totalWatchMinutes);
        setTotalVideos(res.totalVideos);
      })
      .catch(() => !cancelled && setError("تعذر تحميل بيانات مشاهدة الفيديو"))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [userId]);

  const completedCount = videos.filter((v) => v.completed).length;
  const completionRate = totalVideos ? Math.round((completedCount / totalVideos) * 100) : 0;

  return (
    <Card className="border-none shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Video className="h-5 w-5 text-primary" />
          تفاعل الفيديو (Watch Time)
        </CardTitle>
        <CardDescription>
          {loading ? "جاري التحميل..." : `${totalVideos} فيديو · ${totalMinutes} دقيقة مشاهدة`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!loading && !error && totalVideos > 0 && (
          <div className="mb-4 p-4 rounded-2xl bg-primary/5 border border-primary/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black text-muted-foreground uppercase tracking-wider">معدل إكمال الفيديوهات</span>
              <span className="text-sm font-black text-primary">{completionRate}%</span>
            </div>
            <Progress value={completionRate} className="h-2 bg-primary/10" />
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : error ? (
          <p className="text-center text-sm text-danger py-6">{error}</p>
        ) : videos.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-6">لا توجد مقاطع فيديو شوهدت</p>
        ) : (
          <div className="space-y-2 max-h-[360px] overflow-y-auto">
            {videos.map((v) => {
              const pct = Math.min(100, Math.round((v.timeSpentMinutes / Math.max(1, Math.max(...videos.map((x) => x.timeSpentMinutes)))) * 100));
              return (
                <div
                  key={v.lessonId}
                  className="flex items-center justify-between rounded-xl border bg-muted/20 p-3 hover:bg-muted/40 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-2 rounded-lg ${v.completed ? "bg-green-500/10 text-green-500" : "bg-blue-500/10 text-blue-500"}`}>
                      <Video className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold truncate" dir="ltr">
                        Lesson {v.lessonId.slice(0, 8)}…
                      </p>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {v.timeSpentMinutes} دقيقة
                        {v.completed && <CheckCircle2 className="h-3 w-3 text-green-500 mr-1" />}
                      </p>
                    </div>
                  </div>
                  <div className="w-20 shrink-0">
                    <Progress value={pct} className="h-1.5" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function SecurityActivitySection({ user }: { user: UserDetails }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <LoginAttemptsCard userId={user.id} />
      <VideoEngagementCard userId={user.id} />
    </div>
  );
}
