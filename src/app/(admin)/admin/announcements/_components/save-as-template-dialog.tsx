"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Save,
  X,
  Tag as TagIcon,
  Sparkles,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { cn } from "@/lib/utils";
import { adminFetch } from "@/lib/api/admin-api";
import {
  TEMPLATE_CATEGORIES,
  TemplateCategory,
} from "./types";

interface SaveAsTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** البيانات المراد حفظها كقالب */
  data: {
    title: string;
    content: string;
    type: string;
    priority: string;
    category?: string;
    audience?: string[];
    channels?: string[];
    tags?: string[];
    link?: string;
  };
}

export function SaveAsTemplateDialog({
  open,
  onOpenChange,
  data,
}: SaveAsTemplateDialogProps) {
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [category, setCategory] =
    React.useState<TemplateCategory>("general");
  const [isPublic, setIsPublic] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setName("");
      setDescription("");
      setCategory("general");
      setIsPublic(false);
    }
  }, [open]);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("يرجى إدخال اسم القالب");
      return;
    }
    setSubmitting(true);
    try {
      const res = await adminFetch("/api/admin/announcements/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          category,
          isPublic,
          data,
        }),
      });

      if (res.ok) {
        toast.success("تم حفظ القالب بنجاح");
        onOpenChange(false);
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error((err as { error?: string })?.error || "فشل حفظ القالب");
      }
    } catch {
      toast.error("خطأ في الاتصال بالخادم");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card/95 backdrop-blur-xl border-white/10 rounded-[2rem] p-0 overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500" />
        <div className="p-6">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-black flex items-center gap-3">
              <Save className="h-5 w-5 text-violet-500" />
              حفظ كقالب
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              احفظ بيانات الإعلان الحالية كقالب لإعادة استخدامه لاحقاً
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-2 block">
                اسم القالب
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: تذكير بنهاية الأسبوع"
                maxLength={60}
              />
            </div>

            <div>
              <label className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-2 block">
                الوصف
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="وصف مختصر لاستخدام القالب"
                rows={2}
                maxLength={200}
              />
            </div>

            <div>
              <label className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-2 block">
                التصنيف
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(
                  Object.entries(TEMPLATE_CATEGORIES) as [
                    TemplateCategory,
                    (typeof TEMPLATE_CATEGORIES)[TemplateCategory]
                  ][]
                ).map(([key, cat]) => {
                  const Icon = cat.icon;
                  const active = category === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setCategory(key)}
                      className={cn(
                        "flex items-center gap-2 rounded-lg border p-2.5 text-right transition",
                        active
                          ? cn("border-current", cat.color)
                          : "border-white/10 hover:border-white/30 bg-white/2.5"
                      )}
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0" />
                      <span className="text-xs font-bold">{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/2.5 p-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="h-4 w-4 rounded"
              />
              <div>
                <p className="text-xs font-black">قالب مشترك</p>
                <p className="text-[10px] text-muted-foreground">
                  يمكن لجميع المسؤولين استخدامه
                </p>
              </div>
            </label>
          </div>

          <div className="mt-6 flex items-center gap-2 justify-end">
            <AdminButton
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              إلغاء
            </AdminButton>
            <AdminButton
              icon={Save}
              size="sm"
              onClick={handleSave}
              loading={submitting}
            >
              حفظ القالب
            </AdminButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}