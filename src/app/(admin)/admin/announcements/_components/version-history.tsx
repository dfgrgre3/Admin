"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  History,
  RotateCcw,
  GitBranch,
  Eye,
  Calendar,
  User,
  ArrowRight,
  X,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminConfirm } from "@/components/admin/ui/admin-confirm";
import { cn, formatDateTime } from "@/lib/utils";
import { adminFetch } from "@/lib/api/admin-api";
import {
  Announcement,
  AnnouncementVersion,
  VersionDiff,
} from "./types";

interface VersionHistoryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  announcementId: string;
  onRestore: () => void;
}

export function VersionHistory({
  open,
  onOpenChange,
  announcementId,
  onRestore,
}: VersionHistoryProps) {
  const [previewVersion, setPreviewVersion] =
    React.useState<AnnouncementVersion | null>(null);
  const [restoreTarget, setRestoreTarget] =
    React.useState<AnnouncementVersion | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "announcements", "versions", announcementId],
    queryFn: async () => {
      try {
        const res = await adminFetch(
          `/api/admin/announcements/${announcementId}/versions`
        );
        if (!res.ok) return { versions: [] as AnnouncementVersion[] };
        const json = await res.json();
        return {
          versions:
            (json?.data?.versions as AnnouncementVersion[]) ||
            (json?.versions as AnnouncementVersion[]) ||
            [],
        };
      } catch {
        return { versions: [] as AnnouncementVersion[] };
      }
    },
    enabled: open,
    staleTime: 30000,
  });

  const versions = data?.versions || [];

  const handleRestore = async (version: AnnouncementVersion) => {
    try {
      const res = await adminFetch(
        `/api/admin/announcements/${announcementId}/restore`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ versionId: version.id }),
        }
      );
      if (res.ok) {
        toast.success(`تم استرجاع الإصدار v${version.version}`);
        onRestore();
        onOpenChange(false);
      } else {
        toast.error("فشل استرجاع الإصدار");
      }
    } catch {
      toast.error("خطأ في الاتصال");
    } finally {
      setRestoreTarget(null);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl bg-card/95 backdrop-blur-xl border-white/10 rounded-[2rem] p-0 overflow-hidden max-h-[85vh]">
          <div className="h-1.5 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500" />
          <div className="p-6 sm:p-8 overflow-y-auto max-h-[calc(85vh-2rem)]">
            <DialogHeader className="mb-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <DialogTitle className="text-2xl font-black flex items-center gap-3">
                    <GitBranch className="h-6 w-6 text-violet-500" />
                    سجل الإصدارات
                  </DialogTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    استعرض واسترجع أي إصدار سابق من الإعلان
                  </p>
                </div>
                <button
                  onClick={() => onOpenChange(false)}
                  className="rounded-full p-2 hover:bg-white/10 transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </DialogHeader>

            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 rounded-2xl" />
                ))}
              </div>
            ) : versions.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-white/10 bg-white/2.5 py-12 text-center">
                <History className="h-10 w-10 opacity-30" />
                <p className="text-sm font-bold text-muted-foreground">
                  لا توجد إصدارات سابقة بعد
                </p>
                <p className="text-xs text-muted-foreground/70">
                  سيتم حفظ لقطة تلقائية عند كل تعديل
                </p>
              </div>
            ) : (
              <ol className="relative space-y-3 border-r-2 border-white/5 pr-5">
                {versions.map((v, i) => (
                  <li key={v.id} className="relative">
                    {i < versions.length - 1 && (
                      <span className="absolute -right-[calc(1.25rem+5px)] top-12 h-full w-px bg-white/10" />
                    )}
                    <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/2.5 p-4 hover:bg-white/5 transition">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-500/15 text-violet-500">
                        <GitBranch className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className="font-mono text-[10px] bg-violet-500/10 border-violet-500/30"
                            >
                              v{v.version}
                            </Badge>
                            <span className="text-xs font-black">
                              {v.snapshot.title || "بدون عنوان"}
                            </span>
                          </div>
                          <span className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {formatDateTime(v.changedAt)}
                          </span>
                        </div>

                        <div className="mt-2 flex items-center gap-2 text-[11px] text-muted-foreground">
                          <User className="h-3 w-3" />
                          <span>{v.changedByName}</span>
                          {v.changeSummary && (
                            <>
                              <ArrowRight className="h-3 w-3 opacity-50" />
                              <span className="italic">"{v.changeSummary}"</span>
                            </>
                          )}
                        </div>

                        <div className="mt-3 flex items-center gap-2">
                          <AdminButton
                            size="sm"
                            variant="outline"
                            icon={Eye}
                            onClick={() => setPreviewVersion(v)}
                          >
                            معاينة
                          </AdminButton>
                          <AdminButton
                            size="sm"
                            variant="outline"
                            icon={RotateCcw}
                            onClick={() => setRestoreTarget(v)}
                            className="text-amber-500 hover:text-amber-600"
                          >
                            استرجاع
                          </AdminButton>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* نافذة معاينة الإصدار */}
      <VersionPreview
        version={previewVersion}
        onClose={() => setPreviewVersion(null)}
      />

      {/* تأكيد الاسترجاع */}
      <AdminConfirm
        open={!!restoreTarget}
        onOpenChange={(o) => !o && setRestoreTarget(null)}
        title={`استرجاع الإصدار v${restoreTarget?.version}؟`}
        description="سيتم إنشاء نسخة جديدة ببيانات هذا الإصدار. لا يمكن التراجع."
        confirmText="استرجاع"
        variant="destructive"
        onConfirm={() => restoreTarget && handleRestore(restoreTarget)}
      />
    </>
  );
}

function VersionPreview({
  version,
  onClose,
}: {
  version: AnnouncementVersion | null;
  onClose: () => void;
}) {
  if (!version) return null;
  const s = version.snapshot;

  return (
    <Dialog open={!!version} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-card/95 backdrop-blur-xl border-white/10 rounded-[2rem] p-0 overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500" />
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          <DialogHeader className="mb-4">
            <div className="flex items-start justify-between gap-4">
              <DialogTitle className="text-xl font-black flex items-center gap-3">
                <Eye className="h-5 w-5 text-blue-500" />
                معاينة الإصدار v{version.version}
              </DialogTitle>
              <button
                onClick={onClose}
                className="rounded-full p-2 hover:bg-white/10 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              بواسطة {version.changedByName} • {formatDateTime(version.changedAt)}
            </p>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-1">
                العنوان
              </p>
              <p className="text-base font-black">{s.title}</p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-lg border border-white/10 p-2.5 bg-white/2.5">
                <p className="text-[10px] text-muted-foreground font-bold">النوع</p>
                <p className="text-xs font-black">{s.type}</p>
              </div>
              <div className="rounded-lg border border-white/10 p-2.5 bg-white/2.5">
                <p className="text-[10px] text-muted-foreground font-bold">الأولوية</p>
                <p className="text-xs font-black">{s.priority}</p>
              </div>
              <div className="rounded-lg border border-white/10 p-2.5 bg-white/2.5">
                <p className="text-[10px] text-muted-foreground font-bold">الحالة</p>
                <p className="text-xs font-black">
                  {s.isActive ? "منشور" : "مخفي"}
                </p>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-2">
                المحتوى
              </p>
              <div
                className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: s.content || "" }}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** مساعد للحصول على الفروقات بين إصدارين */
export function computeVersionDiff(
  current: Partial<Announcement>,
  previous: Partial<Announcement>
): VersionDiff[] {
  const fields: (keyof Announcement)[] = [
    "title",
    "content",
    "type",
    "priority",
    "isActive",
    "scheduledAt",
    "expiresAt",
    "audience",
    "channels",
    "tags",
    "category",
    "link",
  ];
  const diffs: VersionDiff[] = [];
  for (const f of fields) {
    const a = JSON.stringify(current[f]);
    const b = JSON.stringify(previous[f]);
    if (a !== b) {
      diffs.push({
        field: f as string,
        oldValue: previous[f],
        newValue: current[f],
      });
    }
  }
  return diffs;
}