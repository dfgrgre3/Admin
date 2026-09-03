"use client";

/**
 * محرر الطلب — يتكوّن من:
 *  - شريط URL والمنهج (method picker)
 *  - تبويبات: Params / Headers / Body / Auth
 *  - مفاتيح Auth القابلة للطي
 */

import * as React from "react";
import {
  Key,
  Plus,
  Send,
  Loader2,
  Trash2,
  RotateCcw,
  X,
  CheckCircle2,
  Code2,
  Lock,
  ListTree,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  HTTP_METHODS,
  type HttpMethod,
  type KeyValueEntry,
  type RequestDraft,
} from "../_types/api-explorer";

interface RequestEditorProps {
  draft: RequestDraft;
  onChange: (draft: RequestDraft) => void;
  onSend: () => void;
  onReset: () => void;
  isLoading: boolean;
  onCancel: () => void;
}

function methodColor(method: HttpMethod): string {
  switch (method) {
    case "GET":
      return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
    case "POST":
      return "bg-blue-500/15 text-blue-300 border-blue-500/30";
    case "PUT":
      return "bg-amber-500/15 text-amber-300 border-amber-500/30";
    case "PATCH":
      return "bg-violet-500/15 text-violet-300 border-violet-500/30";
    case "DELETE":
      return "bg-rose-500/15 text-rose-300 border-rose-500/30";
    case "HEAD":
      return "bg-slate-500/15 text-slate-300 border-slate-500/30";
    default:
      return "bg-slate-500/15 text-slate-300 border-slate-500/30";
  }
}

function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString().slice(-4);
}

/** صف قابل للتحرير لمفتاح/قيمة */
function KeyValueRow({
  entry,
  placeholderKey,
  placeholderValue,
  onChange,
  onRemove,
}: {
  entry: KeyValueEntry;
  placeholderKey: string;
  placeholderValue: string;
  onChange: (next: KeyValueEntry) => void;
  onRemove: () => void;
}): React.ReactElement {
  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={entry.enabled}
        onCheckedChange={(enabled) => onChange({ ...entry, enabled })}
        aria-label="تفعيل المعامل"
      />
      <Input
        value={entry.key}
        onChange={(e) => onChange({ ...entry, key: e.target.value })}
        placeholder={placeholderKey}
        className="h-9 flex-1 rounded-lg border-white/10 bg-white/5 text-sm font-mono"
      />
      <Input
        value={entry.value}
        onChange={(e) => onChange({ ...entry, value: e.target.value })}
        placeholder={placeholderValue}
        className="h-9 flex-1 rounded-lg border-white/10 bg-white/5 text-sm font-mono"
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onRemove}
        className="h-7 w-7 text-muted-foreground hover:text-rose-400"
        aria-label="حذف"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

export function RequestEditor({
  draft,
  onChange,
  onSend,
  onReset,
  isLoading,
  onCancel,
}: RequestEditorProps): React.ReactElement {
  const [activeTab, setActiveTab] = React.useState("params");

  // استخراج متغيرات المسار التلقائية من URL
  const pathParamsInUrl = React.useMemo(() => {
    const matches = draft.url.match(/\{([^}]+)\}/g);
    if (!matches) return [] as string[];
    return Array.from(new Set(matches.map((m) => m.replace(/[{}]/g, ""))));
  }, [draft.url]);

  // ضمان وجود صف لكل متغير
  React.useEffect(() => {
    const existingKeys = new Set(draft.pathParams.map((p) => p.key));
    const missing = pathParamsInUrl.filter((k) => !existingKeys.has(k));
    if (missing.length > 0) {
      const next = [
        ...draft.pathParams,
        ...missing.map((k) => ({ id: uid(), key: k, value: "", enabled: true })),
      ];
      onChange({ ...draft, pathParams: next });
    }
  }, [pathParamsInUrl, draft, onChange]);

  const setMethod = (m: HttpMethod) => onChange({ ...draft, method: m });
  const setUrl = (url: string) => onChange({ ...draft, url });

  const updateList = (
    list: KeyValueEntry[],
    updater: (entry: KeyValueEntry) => KeyValueEntry,
    index: number
  ): KeyValueEntry[] => {
    const next = [...list];
    const current = next[index];
    if (!current) return list;
    next[index] = updater(current);
    return next;
  };

  const removeFromList = (list: KeyValueEntry[], index: number) => {
    const next = [...list];
    next.splice(index, 1);
    return next;
  };

  const addToList = (list: KeyValueEntry[], entry: Partial<KeyValueEntry> = {}) => [
    ...list,
    { id: uid(), key: "", value: "", enabled: true, ...entry },
  ];

  return (
    <div className="flex h-full flex-col" dir="rtl">
      {/* شريط URL */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Select value={draft.method} onValueChange={(v) => setMethod(v as HttpMethod)}>
          <SelectTrigger
            className={cn(
              "h-11 w-32 rounded-xl border px-3 text-sm font-black",
              methodColor(draft.method)
            )}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {HTTP_METHODS.map((m) => (
              <SelectItem key={m} value={m} className="font-mono font-bold">
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex flex-1 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 focus-within:border-primary/50">
          <Code2 className="h-4 w-4 shrink-0 text-muted-foreground" />
          <Input
            value={draft.url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="/api/admin/users?limit=20"
            className="h-7 flex-1 border-0 bg-transparent p-0 font-mono text-sm shadow-none focus-visible:ring-0"
            dir="ltr"
            aria-label="عنوان URL"
          />
          {draft.url ? (
            <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setUrl("")}
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            aria-label="مسح"
          >
              <X className="h-3.5 w-3.5" />
            </Button>
          ) : null}
        </div>

        {isLoading ? (
          <Button
            type="button"
            variant="destructive"
            onClick={onCancel}
            className="h-11 gap-2 rounded-xl px-5 font-bold"
          >
            <X className="h-4 w-4" />
            إلغاء
          </Button>
        ) : (
          <Button
            type="button"
            onClick={onSend}
            disabled={!draft.url.trim()}
            className="h-11 gap-2 rounded-xl bg-gradient-to-l from-primary to-primary/70 px-6 font-black shadow-lg shadow-primary/20 hover:from-primary/90 hover:to-primary/60"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            إرسال
          </Button>
        )}

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onReset}
          className="h-11 w-11 rounded-xl text-muted-foreground hover:text-foreground"
          aria-label="إعادة تعيين"
          title="إعادة تعيين المحرر"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {/* شارات سريعة لمتغيرات المسار المكتشفة */}
      {pathParamsInUrl.length > 0 ? (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-semibold text-muted-foreground">متغيرات المسار:</span>
          {pathParamsInUrl.map((p) => (
            <Badge
              key={p}
              variant="outline"
              className="border-amber-500/30 bg-amber-500/10 px-1.5 py-0 text-[10px] text-amber-300"
            >
              {`{${p}}`}
            </Badge>
          ))}
        </div>
      ) : null}

      {/* التبويبات */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="mt-4 flex flex-1 flex-col overflow-hidden"
      >
        <TabsList className="grid h-10 w-full grid-cols-4 rounded-xl border border-white/10 bg-white/5 p-1">
          <TabsTrigger value="params" className="gap-1.5 rounded-lg text-xs font-bold">
            <ListTree className="h-3.5 w-3.5" />
            المعاملات
            {draft.queryParams.length + draft.pathParams.length > 0 ? (
              <span className="rounded-md bg-white/10 px-1.5 py-0 text-[10px]">
                {draft.queryParams.length + draft.pathParams.length}
              </span>
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="headers" className="gap-1.5 rounded-lg text-xs font-bold">
            <Key className="h-3.5 w-3.5" />
            الرؤوس
            {draft.headers.length > 0 ? (
              <span className="rounded-md bg-white/10 px-1.5 py-0 text-[10px]">
                {draft.headers.length}
              </span>
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="body" className="gap-1.5 rounded-lg text-xs font-bold">
            <Code2 className="h-3.5 w-3.5" />
            الجسم
          </TabsTrigger>
          <TabsTrigger value="auth" className="gap-1.5 rounded-lg text-xs font-bold">
            <Lock className="h-3.5 w-3.5" />
            المصادقة
          </TabsTrigger>
        </TabsList>

        <TabsContent value="params" className="mt-3 flex-1 space-y-4 overflow-y-auto pr-1">
          {/* متغيرات المسار */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-xs font-black text-amber-300">متغيرات المسار (Path Variables)</h4>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  onChange({ ...draft, pathParams: addToList(draft.pathParams) })
                }
                className="h-7 gap-1 text-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                إضافة
              </Button>
            </div>
            {draft.pathParams.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                لم تُكتشف متغيرات. أضف <code className="rounded bg-white/10 px-1">{"{id}"}</code> في الـ URL.
              </p>
            ) : (
              <div className="space-y-1.5">
                {draft.pathParams.map((p, idx) => (
                  <KeyValueRow
                    key={p.id}
                    entry={p}
                    placeholderKey="اسم المتغير"
                    placeholderValue="القيمة"
                    onChange={(next) =>
                      onChange({ ...draft, pathParams: updateList(draft.pathParams, () => next, idx) })
                    }
                    onRemove={() =>
                      onChange({ ...draft, pathParams: removeFromList(draft.pathParams, idx) })
                    }
                  />
                ))}
              </div>
            )}
          </div>

          {/* Query Params */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-xs font-black text-blue-300">معاملات الاستعلام (Query Params)</h4>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  onChange({ ...draft, queryParams: addToList(draft.queryParams) })
                }
                className="h-7 gap-1 text-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                إضافة
              </Button>
            </div>
            {draft.queryParams.length === 0 ? (
              <p className="text-xs text-muted-foreground">لا توجد معاملات استعلام.</p>
            ) : (
              <div className="space-y-1.5">
                {draft.queryParams.map((p, idx) => (
                  <KeyValueRow
                    key={p.id}
                    entry={p}
                    placeholderKey="key"
                    placeholderValue="value"
                    onChange={(next) =>
                      onChange({ ...draft, queryParams: updateList(draft.queryParams, () => next, idx) })
                    }
                    onRemove={() =>
                      onChange({ ...draft, queryParams: removeFromList(draft.queryParams, idx) })
                    }
                  />
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="headers" className="mt-3 flex-1 space-y-2 overflow-y-auto pr-1">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">رؤوس HTTP المخصصة المرسلة مع الطلب.</p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onChange({ ...draft, headers: addToList(draft.headers) })}
              className="h-7 gap-1 text-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              إضافة
            </Button>
          </div>
          {draft.headers.length === 0 ? (
            <div className="grid place-items-center rounded-2xl border border-dashed border-white/10 p-6 text-sm text-muted-foreground">
              لا توجد رؤوس مخصصة
            </div>
          ) : (
            <div className="space-y-1.5">
              {draft.headers.map((h, idx) => (
                <KeyValueRow
                  key={h.id}
                  entry={h}
                  placeholderKey="Header-Name"
                  placeholderValue="Header-Value"
                  onChange={(next) =>
                    onChange({ ...draft, headers: updateList(draft.headers, () => next, idx) })
                  }
                  onRemove={() =>
                    onChange({ ...draft, headers: removeFromList(draft.headers, idx) })
                  }
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="body" className="mt-3 flex-1 space-y-3 overflow-y-auto pr-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground">النوع:</span>
            {(["none", "json", "form-data", "raw"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => onChange({ ...draft, bodyMode: mode })}
                className={cn(
                  "rounded-lg border px-3 py-1 text-xs font-bold transition-colors",
                  draft.bodyMode === mode
                    ? "border-primary/50 bg-primary/15 text-primary"
                    : "border-white/10 bg-white/5 text-muted-foreground hover:text-foreground"
                )}
              >
                {mode === "none"
                  ? "بدون جسم"
                  : mode === "json"
                    ? "JSON"
                    : mode === "form-data"
                      ? "Form-Data"
                      : "Raw"}
              </button>
            ))}
          </div>

          {draft.bodyMode === "none" ? (
            <div className="grid place-items-center rounded-2xl border border-dashed border-white/10 p-8 text-sm text-muted-foreground">
              لا يوجد جسم للطلب.
            </div>
          ) : null}

          {draft.bodyMode === "json" ? (
            <div className="space-y-2">
              <Textarea
                value={draft.bodyJson}
                onChange={(e) => onChange({ ...draft, bodyJson: e.target.value })}
                placeholder='{ "key": "value" }'
                dir="ltr"
                className="min-h-[260px] rounded-2xl border-white/10 bg-black/30 font-mono text-xs leading-6"
              />
              <JsonValidationHint source={draft.bodyJson} />
            </div>
          ) : null}

          {draft.bodyMode === "raw" ? (
            <Textarea
              value={draft.bodyRaw}
              onChange={(e) => onChange({ ...draft, bodyRaw: e.target.value })}
              placeholder="نص خام…"
              dir="ltr"
              className="min-h-[260px] rounded-2xl border-white/10 bg-black/30 font-mono text-xs leading-6"
            />
          ) : null}

          {draft.bodyMode === "form-data" ? (
            <div className="space-y-1.5">
              {draft.formData.map((f, idx) => (
                <KeyValueRow
                  key={f.id}
                  entry={f}
                  placeholderKey="field"
                  placeholderValue="value"
                  onChange={(next) =>
                    onChange({ ...draft, formData: updateList(draft.formData, () => next, idx) })
                  }
                  onRemove={() =>
                    onChange({ ...draft, formData: removeFromList(draft.formData, idx) })
                  }
                />
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onChange({ ...draft, formData: addToList(draft.formData) })}
                className="mt-1 w-full gap-1 border-dashed"
              >
                <Plus className="h-3.5 w-3.5" />
                إضافة حقل
              </Button>
            </div>
          ) : null}
        </TabsContent>

        <TabsContent value="auth" className="mt-3 flex-1 space-y-3 overflow-y-auto pr-1">
          <Select
            value={draft.auth.type}
            onValueChange={(v) =>
              onChange({ ...draft, auth: { ...draft.auth, type: v as typeof draft.auth.type } })
            }
          >
            <SelectTrigger className="h-10 rounded-xl border-white/10 bg-white/5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">بدون مصادقة</SelectItem>
              <SelectItem value="bearer">Bearer Token</SelectItem>
              <SelectItem value="api-key">API Key</SelectItem>
              <SelectItem value="basic">Basic Auth</SelectItem>
            </SelectContent>
          </Select>

          {draft.auth.type === "bearer" ? (
            <Input
              value={draft.auth.token ?? ""}
              onChange={(e) => onChange({ ...draft, auth: { ...draft.auth, token: e.target.value } })}
              placeholder="eyJhbGciOi…"
              dir="ltr"
              className="h-10 rounded-xl border-white/10 bg-white/5 font-mono text-sm"
            />
          ) : null}

          {draft.auth.type === "api-key" ? (
            <div className="space-y-2">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Input
                  value={draft.auth.apiKeyName ?? ""}
                  onChange={(e) =>
                    onChange({ ...draft, auth: { ...draft.auth, apiKeyName: e.target.value } })
                  }
                  placeholder="اسم المفتاح (X-API-Key)"
                  dir="ltr"
                  className="h-10 rounded-xl border-white/10 bg-white/5 font-mono text-sm"
                />
                <Input
                  value={draft.auth.apiKeyValue ?? ""}
                  onChange={(e) =>
                    onChange({ ...draft, auth: { ...draft.auth, apiKeyValue: e.target.value } })
                  }
                  placeholder="القيمة"
                  dir="ltr"
                  className="h-10 rounded-xl border-white/10 bg-white/5 font-mono text-sm"
                />
              </div>
              <Select
                value={draft.auth.apiKeyIn ?? "header"}
                onValueChange={(v) =>
                  onChange({
                    ...draft,
                    auth: { ...draft.auth, apiKeyIn: v as "header" | "query" },
                  })
                }
              >
                <SelectTrigger className="h-10 rounded-xl border-white/10 bg-white/5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="header">إرساله كـ Header</SelectItem>
                  <SelectItem value="query">إضافته كـ Query</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ) : null}

          {draft.auth.type === "basic" ? (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <Input
                value={draft.auth.username ?? ""}
                onChange={(e) =>
                  onChange({ ...draft, auth: { ...draft.auth, username: e.target.value } })
                }
                placeholder="username"
                dir="ltr"
                className="h-10 rounded-xl border-white/10 bg-white/5 font-mono text-sm"
              />
              <Input
                type="password"
                value={draft.auth.password ?? ""}
                onChange={(e) =>
                  onChange({ ...draft, auth: { ...draft.auth, password: e.target.value } })
                }
                placeholder="password"
                dir="ltr"
                className="h-10 rounded-xl border-white/10 bg-white/5 font-mono text-sm"
              />
            </div>
          ) : null}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function JsonValidationHint({ source }: { source: string }): React.ReactElement {
  const [state, setState] = React.useState<{ ok: boolean; msg?: string }>({ ok: true });

  React.useEffect(() => {
    if (!source.trim()) {
      setState({ ok: true });
      return;
    }
    try {
      JSON.parse(source);
      setState({ ok: true });
    } catch (err) {
      setState({ ok: false, msg: err instanceof Error ? err.message : "خطأ في JSON" });
    }
  }, [source]);

  if (state.ok) {
    return (
      <p className="flex items-center gap-1.5 text-[11px] text-emerald-400">
        <CheckCircle2 className="h-3 w-3" />
        JSON صحيح
      </p>
    );
  }
  return (
    <p className="flex items-center gap-1.5 text-[11px] text-rose-400">
      <X className="h-3 w-3" />
      {state.msg}
    </p>
  );
}
