"use client";

import * as React from "react";
import { PageHeader } from "@/components/admin/ui/page-header";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ImageIcon, Plus, Search, Tag, Sparkles } from "lucide-react";
import { mediaApi, MEDIA_TYPES, MediaAsset } from "@/lib/api/media-api";

export default function MediaLibraryPage() {
  const qc = useQueryClient();
  const [type, setType] = React.useState("");
  const [tag, setTag] = React.useState("");
  const [q, setQ] = React.useState("");
  const [showForm, setShowForm] = React.useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "media", type, tag, q],
    queryFn: () => mediaApi.list({ type: type || undefined, tags: tag || undefined, q: q || undefined }),
  });

  const tagsQuery = useQuery({ queryKey: ["admin", "media-tags"], queryFn: () => mediaApi.tags() });

  const createMutation = useMutation({
    mutationFn: (body: Partial<MediaAsset>) => mediaApi.create(body),
    onSuccess: () => {
      toast.success("تمت إضافة الوسيط وبدأ وسْم الذكاء الاصطناعي");
      qc.invalidateQueries({ queryKey: ["admin", "media"] });
      qc.invalidateQueries({ queryKey: ["admin", "media-tags"] });
      setShowForm(false);
    },
    onError: () => toast.error("فشل الإضافة"),
  });

  const assets = data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader title="مكتبة الوسائط" description="مكتبة مركزية للفيديوهات والصور مع بحث ذكي بالمحتوى (AI Tags)" />

      <div className="flex flex-wrap items-center gap-3">
        <select value={type} onChange={(e) => setType(e.target.value)} className="rounded-lg border px-3 py-2 text-sm">
          <option value="">كل الأنواع</option>
          {MEDIA_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <div className="relative">
          <Search className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="بحث بالعنوان..." className="rounded-lg border py-2 pr-8 pl-3 text-sm" />
        </div>
        <select value={tag} onChange={(e) => setTag(e.target.value)} className="rounded-lg border px-3 py-2 text-sm">
          <option value="">كل الوسوم</option>
          {(tagsQuery.data ?? []).map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <AdminButton onClick={() => setShowForm(!showForm)}><Plus className="mr-1 h-4 w-4" /> وسـيط جديد</AdminButton>
      </div>

      {showForm && (
        <NewMediaForm onSubmit={(b) => createMutation.mutate(b)} loading={createMutation.isPending} />
      )}

      {isLoading ? (
        <div className="text-center text-muted-foreground py-10">جاري التحميل...</div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {assets.map((a) => (
            <div key={a.id} className="rounded-lg border overflow-hidden">
              <div className="aspect-video bg-muted flex items-center justify-center">
                {a.thumbnailUrl ? (
                  <img src={a.thumbnailUrl} alt={a.title} loading="lazy" decoding="async" className="h-full w-full object-cover" />
                ) : (
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <div className="p-3 space-y-1">
                <p className="text-sm font-medium truncate">{a.title}</p>
                <div className="flex flex-wrap gap-1">
                  {(a.aiTags ?? []).slice(0, 4).map((t) => (
                    <span key={t} className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] text-blue-700 flex items-center gap-0.5">
                      <Tag className="h-2.5 w-2.5" /> {t}
                    </span>
                  ))}
                  {!a.aiIndexed && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] text-amber-700 flex items-center gap-0.5">
                      <Sparkles className="h-2.5 w-2.5" /> جارٍ الوسم...
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          {assets.length === 0 && (
            <div className="col-span-full text-center text-muted-foreground py-10">لا توجد وسائط مطابقة</div>
          )}
        </div>
      )}
    </div>
  );
}

import { FileDropzone } from "@/components/ui/file-dropzone";

function NewMediaForm({ onSubmit, loading }: { onSubmit: (b: Partial<MediaAsset>) => void; loading: boolean }) {
  const [title, setTitle] = React.useState("");
  const [url, setUrl] = React.useState("");
  const [type, setType] = React.useState("IMAGE");
  const [desc, setDesc] = React.useState("");

  const handleFilesSelected = (files: File[]) => {
    const file = files[0];
    if (file) {
      if (!title) setTitle(file.name);
      // Generate object URL for preview or upload trigger
      const objectUrl = URL.createObjectURL(file);
      setUrl(objectUrl);
    }
  };

  return (
    <div className="rounded-lg border bg-muted/20 p-4 space-y-4">
      <FileDropzone
        onFilesSelected={handleFilesSelected}
        label="اسحب وأسقط ملفات الصور أو الفيديوهات هنا لرفعها إلى مكتبة الوسائط"
      />
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="العنوان" className="w-full rounded-lg border px-3 py-2 text-sm" />
      <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="رابط الملف أو المسار" className="w-full rounded-lg border px-3 py-2 text-sm" />
      <div className="grid grid-cols-2 gap-3">
        <select value={type} onChange={(e) => setType(e.target.value)} className="rounded-lg border px-3 py-2 text-sm">
          {MEDIA_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="وصف (يساعد الذكاء الاصطناعي في الوسم)" className="rounded-lg border px-3 py-2 text-sm" />
      </div>
      <AdminButton disabled={!title || !url || loading} onClick={() => onSubmit({ title, url, type, description: desc })}>
        {loading ? "جاري الحفظ..." : "إضافة وسـيط"}
      </AdminButton>
    </div>
  );
}
