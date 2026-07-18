"use client";

import * as React from "react";
import { PageHeader } from "@/components/admin/ui/page-header";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminStatsCard } from "@/components/admin/ui/admin-card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Video, Plus, Radio, CalendarClock } from "lucide-react";
import { cmsApi, LiveSession } from "@/lib/api/cms-api";

const providerLabel: Record<string, string> = { ZOOM: "Zoom", MEET: "Google Meet", CUSTOM: "مخصص" };
const statusLabel: Record<string, { label: string; color: string }> = {
  SCHEDULED: { label: "مجدول", color: "bg-blue-100 text-blue-700" },
  LIVE: { label: "مباشر الآن", color: "bg-red-100 text-red-700" },
  ENDED: { label: "انتهى", color: "bg-gray-100 text-gray-700" },
  CANCELLED: { label: "ملغي", color: "bg-gray-100 text-gray-700" },
};

export default function LiveSessionsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "live-sessions"],
    queryFn: () => cmsApi.listLiveSessions(),
  });

  const createMutation = useMutation({
    mutationFn: (body: Partial<LiveSession>) => cmsApi.createLiveSession(body),
    onSuccess: () => {
      toast.success("تم جدولة البث المباشر");
      qc.invalidateQueries({ queryKey: ["admin", "live-sessions"] });
    },
    onError: () => toast.error("فشل الجدولة"),
  });

  const sessions = data ?? [];
  const liveNow = sessions.filter((s) => s.status === "LIVE").length;
  const scheduled = sessions.filter((s) => s.status === "SCHEDULED").length;

  return (
    <div className="space-y-6">
      <PageHeader title="البث المباشر" description="إدارة المحاضرات المباشرة عبر Zoom / Google Meet مع روابط تلقائية" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <AdminStatsCard title="مجدولة" value={scheduled} icon={CalendarClock} />
        <AdminStatsCard title="مباشر الآن" value={liveNow} icon={Radio} />
        <AdminStatsCard title="الإجمالي" value={sessions.length} icon={Video} />
      </div>

      <NewSessionForm onSubmit={(b) => createMutation.mutate(b)} loading={createMutation.isPending} />

      {isLoading ? (
        <div className="text-center text-muted-foreground py-10">جاري التحميل...</div>
      ) : (
        <div className="rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="p-3 text-right">العنوان</th>
                <th className="p-3 text-right">المزود</th>
                <th className="p-3 text-right">الموعد</th>
                <th className="p-3 text-right">المدة</th>
                <th className="p-3 text-right">الحالة</th>
                <th className="p-3 text-right">رابط الانضمام</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => {
                const st = statusLabel[s.status] ?? statusLabel.SCHEDULED;
                return (
                  <tr key={s.id} className="border-t">
                    <td className="p-3">{s.title}</td>
                    <td className="p-3">{providerLabel[s.provider] ?? s.provider}</td>
                    <td className="p-3">{new Date(s.scheduledAt).toLocaleString("ar-EG")}</td>
                    <td className="p-3">{s.durationMin} د</td>
                    <td className="p-3"><span className={`rounded-full px-2 py-0.5 text-xs ${st?.color ?? statusLabel.SCHEDULED?.color ?? ""}`}>{st?.label ?? statusLabel.SCHEDULED?.label ?? ""}</span></td>
                    <td className="p-3">{s.joinUrl ? <a href={s.joinUrl} target="_blank" className="text-blue-600 underline">انضمام</a> : "-"}</td>
                  </tr>
                );
              })}
              {sessions.length === 0 && (
                <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">لا توجد جلسات</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function NewSessionForm({ onSubmit, loading }: { onSubmit: (b: Partial<LiveSession>) => void; loading: boolean }) {
  const [title, setTitle] = React.useState("");
  const [provider, setProvider] = React.useState("ZOOM");
  const [hostEmail, setHostEmail] = React.useState("");
  const [scheduledAt, setScheduledAt] = React.useState("");
  const [durationMin, setDurationMin] = React.useState(60);

  return (
    <div className="rounded-lg border bg-muted/20 p-4 space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="عنوان المحاضرة" className="rounded-lg border px-3 py-2 text-sm" />
        <select value={provider} onChange={(e) => setProvider(e.target.value)} className="rounded-lg border px-3 py-2 text-sm">
          <option value="ZOOM">Zoom</option>
          <option value="MEET">Google Meet</option>
          <option value="CUSTOM">مخصص</option>
        </select>
        <input value={hostEmail} onChange={(e) => setHostEmail(e.target.value)} placeholder="بريد المضيف" className="rounded-lg border px-3 py-2 text-sm" />
        <input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} className="rounded-lg border px-3 py-2 text-sm" />
        <input type="number" value={durationMin} onChange={(e) => setDurationMin(Number(e.target.value))} placeholder="المدة (دقيقة)" className="rounded-lg border px-3 py-2 text-sm" />
      </div>
      <AdminButton disabled={!title || !scheduledAt || loading} onClick={() => onSubmit({
        title, provider, hostEmail, durationMin,
        scheduledAt: new Date(scheduledAt).toISOString(),
      })}>{loading ? "جاري الجدولة..." : <><Plus className="mr-1 h-4 w-4" /> جدولة البث</>}</AdminButton>
    </div>
  );
}
