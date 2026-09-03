"use client";

/**
 * صفحة مستكشف API — أداة اختبار/استكشاف لواجهات الـ backend
 * تشبه Postman/Swagger UI مع تكامل مع نظام الصلاحيات، CSRF، ومعمارية الأدمن.
 *
 * المكوّنات:
 *  - بطاقات إحصائيات سريعة
 *  - شجرة كتالوج المسارات (يبحث في apiRoutes المركزي)
 *  - محرر الطلب (URL/Method/Params/Headers/Body/Auth)
 *  - لوحة الاستجابة (الحالة، الزمن، الحجم، الرؤوس، الجسم)
 *  - السجل (محفوظ في localStorage)
 *  - المجموعات المحفوظة (Collections)
 */

import * as React from "react";
import { Braces, Lock, Save, Trash2, Wand2 } from "lucide-react";

import { PageHeader } from "@/components/admin/ui/page-header";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminCard } from "@/components/admin/ui/admin-card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { usePermission } from "@/components/auth/PermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";
import { useSafeLocalStorage } from "@/lib/safe-client-utils";
import { toast } from "sonner";

import {
  CollectionsPanel,
  EndpointTree,
  ExplorerStats,
  HistoryPanel,
  RequestEditor,
  ResponseViewer,
} from "./_components";
import {
  buildEndpointCatalog,
  searchEndpoints,
} from "./_lib/endpoint-catalog";
import {
  cloneDraft,
  createEmptyDraft,
  useExplorerStorage,
} from "./_hooks/use-explorer-storage";
import { useApiRequest } from "./_hooks/use-api-request";
import {
  STORAGE_KEYS,
  type HistoryEntry,
  type RequestDraft,
  type ResponseRecord,
} from "./_types/api-explorer";

const REQUEST_NAME_PRESETS = [
  { method: "GET" as const, path: "/api/admin/dashboard", name: "لوحة الأدمن" },
  { method: "GET" as const, path: "/api/admin/users?limit=20", name: "قائمة المستخدمين" },
  { method: "GET" as const, path: "/api/admin/security/sessions", name: "الجلسات النشطة" },
  { method: "GET" as const, path: "/api/healthz", name: "فحص الصحة" },
  { method: "GET" as const, path: "/api/readyz", name: "جاهزية الخدمة" },
  { method: "GET" as const, path: "/api/admin/analytics/overview", name: "نظرة التحليلات" },
  { method: "GET" as const, path: "/api/admin/billing/subscriptions", name: "الاشتراكات" },
  { method: "GET" as const, path: "/api/admin/notifications", name: "الإشعارات" },
];

export default function ApiExplorerPage(): React.ReactElement {
  const { hasPermission } = usePermission();
  const canUse = hasPermission(PERMISSIONS.SETTINGS_VIEW);

  const storage = useExplorerStorage();
  const api = useApiRequest();

  // المسودة النشطة تُحفظ في localStorage تلقائياً
  const [activeDraft, setActiveDraft, draftReady] = useSafeLocalStorage<RequestDraft>(
    STORAGE_KEYS.activeDraft,
    createEmptyDraft("GET")
  );

  const [response, setResponse] = React.useState<ResponseRecord | null>(null);
  const [selectedEndpointId, setSelectedEndpointId] = React.useState<string | undefined>(undefined);
  const [leftTab, setLeftTab] = React.useState<"catalog" | "collections">("catalog");
  const [rightTab, setRightTab] = React.useState<"response" | "history" | "collections">("response");

  // الكتالوج والبحث المؤجل
  const [catalogSearch, setCatalogSearch] = React.useState("");
  const deferredSearch = React.useDeferredValue(catalogSearch);
  const catalog = React.useMemo(() => buildEndpointCatalog(), []);
  const filteredCatalog = React.useMemo(
    () => searchEndpoints(deferredSearch),
    [deferredSearch]
  );

  // متوسط زمن الاستجابة (آخر 20)
  const averageDuration = React.useMemo(() => {
    const last20 = storage.history.slice(0, 20);
    if (last20.length === 0) return 0;
    return last20.reduce((s, h) => s + h.durationMs, 0) / last20.length;
  }, [storage.history]);

  const handleSelectEndpoint = React.useCallback(
    (node: import("./_types/api-explorer").ApiEndpointNode) => {
      setSelectedEndpointId(node.id);
      // عند اختيار مسار من الكتالوج: نحدّث المسودة
      const next: RequestDraft = {
        ...activeDraft,
        method: activeDraft.method,
        url: node.path,
        name: node.name,
      };
      setActiveDraft(next);
      toast.info(`تم تحميل المسار: ${node.name}`, {
        description: node.path,
      });
    },
    [activeDraft, setActiveDraft]
  );

  const handleSend = React.useCallback(async () => {
    if (!activeDraft.url.trim()) {
      toast.error("الرجاء إدخال URL");
      return;
    }
    const record = await api.send(activeDraft);
    setResponse(record);

    // إضافة إلى السجل
    const entry: HistoryEntry = {
      id: Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4),
      name: activeDraft.name || activeDraft.url,
      method: activeDraft.method,
      url: activeDraft.url,
      status: record.status,
      durationMs: record.durationMs,
      sizeBytes: record.sizeBytes,
      timestamp: record.timestamp,
      draft: cloneDraft(activeDraft),
      response: record,
    };
    storage.pushHistory(entry);

    if (record.ok) {
      toast.success("تم إرسال الطلب بنجاح", {
        description: `${record.status} • ${record.durationMs}ms`,
      });
    } else if (record.networkError) {
      toast.error("فشل الاتصال", { description: record.networkError });
    } else {
      toast.warning(`استجابة ${record.status}`);
    }
  }, [activeDraft, api, storage]);

  const handleReset = React.useCallback(() => {
    const fresh = createEmptyDraft("GET");
    setActiveDraft(fresh);
    setResponse(null);
    setSelectedEndpointId(undefined);
  }, [setActiveDraft]);

  const handleCancel = React.useCallback(() => {
    if (api.abortControllerRef.current) {
      api.abortControllerRef.current.abort();
    }
  }, [api]);

  // إعادة إرسال من السجل
  const handleReplay = React.useCallback(
    (entry: HistoryEntry) => {
      setActiveDraft(cloneDraft(entry.draft));
      setResponse(entry.response ?? null);
      toast.info(`تم تحميل: ${entry.name}`);
    },
    [setActiveDraft]
  );

  // حفظ طلب من السجل في مجموعة
  const handleSaveToCollection = React.useCallback(
    (entry: HistoryEntry, collectionId: string) => {
      storage.addRequestToCollection(collectionId, entry.draft);
    },
    [storage]
  );

  // فتح طلب من مجموعة
  const handleOpenFromCollection = React.useCallback(
    (request: RequestDraft) => {
      setActiveDraft(cloneDraft(request));
      toast.success("تم تحميل الطلب من المجموعة");
    },
    [setActiveDraft]
  );

  // إنشاء طلب سريع من القائمة المعدة
  const loadPreset = (preset: { method: RequestDraft["method"]; path: string; name: string }) => {
    setActiveDraft({
      ...createEmptyDraft(preset.method),
      name: preset.name,
      url: preset.path,
    });
    toast.success(`تم تحميل: ${preset.name}`);
  };

  // مستخدمو لا يملكون صلاحية
  if (!canUse) {
    return (
      <div className="space-y-6 pb-20" dir="rtl">
        <PageHeader
          title="مستكشف API"
          description="استكشاف واختبار واجهات برمجة التطبيقات المتاحة."
          icon={Braces}
          badge="محظور"
          eyebrow="المطورين"
        />
        <Alert variant="destructive" className="border-rose-500/30 bg-rose-500/10">
          <Lock className="h-4 w-4" />
          <AlertDescription>
            ليس لديك الصلاحية اللازمة لاستخدام مستكشف API. تتطلب هذه الصفحة صلاحية
            <code className="mx-1 rounded bg-rose-500/15 px-1 py-0.5 font-mono text-xs">
              {PERMISSIONS.SETTINGS_VIEW}
            </code>
            أو ما يعادلها.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20" dir="rtl">
      <PageHeader
        title="مستكشف API"
        description="اختبر جميع نقاط نهاية الـ backend، أرسل طلبات حقيقية، احفظ المجموعات، وتصفح السجل — كل ذلك في واجهة واحدة."
        icon={Braces}
        eyebrow="المطورين"
        badge={`${catalog.length.toLocaleString("ar-EG")} مسار`}
        accentColor="from-blue-500/20 via-cyan-500/20 to-transparent"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <AdminButton
              variant="outline"
              size="sm"
              icon={Wand2}
              onClick={handleReset}
              className="rounded-xl"
            >
              طلب جديد
            </AdminButton>
            <AdminButton
              variant="outline"
              size="sm"
              icon={Save}
              onClick={() => {
                storage.createCollection(
                  `مجموعة ${new Date().toLocaleDateString("ar-EG")}`
                );
                toast.success("تم إنشاء مجموعة سريعة");
              }}
              className="rounded-xl"
            >
              مجموعة سريعة
            </AdminButton>
          </div>
        }
      />

      {/* إحصائيات سريعة */}
      <ExplorerStats
        totalEndpoints={catalog.length}
        historyCount={storage.history.length}
        collectionsCount={storage.collections.length}
        averageDurationMs={averageDuration}
      />

      {/* طلبات سريعة معدة مسبقاً */}
      <AdminCard variant="glass" className="rounded-2xl border-white/10 p-4">
        <div className="mb-2 flex items-center gap-2">
          <Wand2 className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-black">طلبات سريعة جاهزة</h3>
          <span className="text-[11px] text-muted-foreground">
            اضغط لتحميلها في المحرر
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {REQUEST_NAME_PRESETS.map((preset) => (
            <button
              key={preset.path}
              type="button"
              onClick={() => loadPreset(preset)}
              className="group flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
            >
              <span className="rounded-md bg-emerald-500/15 px-1.5 py-0.5 font-mono text-[10px] text-emerald-300">
                {preset.method}
              </span>
              {preset.name}
            </button>
          ))}
        </div>
      </AdminCard>

      {/* التخطيط الرئيسي: ثلاث أعمدة */}
      <div className="grid gap-4 lg:grid-cols-[320px_1fr_360px]">
        {/* العمود الأيسر: الكتالوج / المجموعات */}
        <AdminCard
          variant="glass"
          className="rounded-2xl border-white/10 p-3 lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)]"
        >
          <Tabs
            value={leftTab}
            onValueChange={(v) => setLeftTab(v as typeof leftTab)}
            className="flex h-full flex-col"
          >
            <TabsList className="grid h-9 w-full grid-cols-2 rounded-xl border border-white/10 bg-white/5 p-1">
              <TabsTrigger value="catalog" className="rounded-lg text-xs font-bold">
                الكتالوج ({catalog.length})
              </TabsTrigger>
              <TabsTrigger value="collections" className="rounded-lg text-xs font-bold">
                المجموعات ({storage.collections.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="catalog" className="mt-3 flex-1 overflow-hidden">
              <div className="flex h-full flex-col">
                <Input
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  placeholder="بحث في الكتالوج…"
                  className="h-9 rounded-lg border-white/10 bg-white/5 text-sm"
                />
                <div className="mt-2 flex-1 overflow-y-auto pr-1">
                  <EndpointTree
                    onSelect={handleSelectEndpoint}
                    selectedId={selectedEndpointId}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="collections" className="mt-3 flex-1 overflow-y-auto pr-1">
              <CollectionsPanel
                collections={storage.collections}
                onCreate={(name) => storage.createCollection(name)}
                onRemove={(id) => storage.removeCollection(id)}
                onRename={(id, name) => storage.renameCollection(id, name)}
                onRemoveRequest={(cid, rid) => storage.removeRequestFromCollection(cid, rid)}
                onOpenRequest={handleOpenFromCollection}
              />
            </TabsContent>
          </Tabs>
        </AdminCard>

        {/* العمود الأوسط: المحرر + الاستجابة */}
        <div className="space-y-4">
          {/* المحرر */}
          <AdminCard variant="glass" className="rounded-2xl border-white/10 p-4">
            {draftReady ? (
              <RequestEditor
                draft={activeDraft}
                onChange={setActiveDraft}
                onSend={handleSend}
                onReset={handleReset}
                isLoading={api.isLoading}
                onCancel={handleCancel}
              />
            ) : (
              <div className="h-40 animate-pulse rounded-xl bg-white/5" />
            )}
          </AdminCard>

          {/* اللوحة اليمنى الداخلية: تبويبات الاستجابة/السجل/المجموعات */}
          <AdminCard variant="glass" className="rounded-2xl border-white/10 p-4">
            <Tabs
              value={rightTab}
              onValueChange={(v) => setRightTab(v as typeof rightTab)}
              className="flex h-[520px] flex-col"
            >
              <TabsList className="grid h-10 w-full grid-cols-3 rounded-xl border border-white/10 bg-white/5 p-1">
                <TabsTrigger value="response" className="rounded-lg text-xs font-bold">
                  الاستجابة
                </TabsTrigger>
                <TabsTrigger value="history" className="rounded-lg text-xs font-bold">
                  السجل ({storage.history.length})
                </TabsTrigger>
                <TabsTrigger value="collections" className="rounded-lg text-xs font-bold">
                  المجموعات
                </TabsTrigger>
              </TabsList>

              <TabsContent value="response" className="mt-3 flex-1 overflow-hidden">
                <ResponseViewer response={response} loading={api.isLoading} />
              </TabsContent>

              <TabsContent value="history" className="mt-3 flex-1 overflow-y-auto pr-1">
                <HistoryPanel
                  history={storage.history}
                  collections={storage.collections}
                  onReplay={handleReplay}
                  onRemove={storage.removeHistory}
                  onClearAll={() => {
                    if (confirm("هل أنت متأكد من مسح كل السجل؟")) {
                      storage.clearHistory();
                      toast.success("تم مسح السجل");
                    }
                  }}
                  onSaveToCollection={handleSaveToCollection}
                />
              </TabsContent>

              <TabsContent value="collections" className="mt-3 flex-1 overflow-y-auto pr-1">
                <CollectionsPanel
                  collections={storage.collections}
                  onCreate={(name) => storage.createCollection(name)}
                  onRemove={(id) => storage.removeCollection(id)}
                  onRename={(id, name) => storage.renameCollection(id, name)}
                  onRemoveRequest={(cid, rid) => storage.removeRequestFromCollection(cid, rid)}
                  onOpenRequest={handleOpenFromCollection}
                />
              </TabsContent>
            </Tabs>
          </AdminCard>
        </div>

        {/* العمود الأيمن: معلومات سريعة + اختصارات */}
        <div className="space-y-4">
          <AdminCard variant="glass" className="rounded-2xl border-white/10 p-4">
            <h3 className="mb-3 text-sm font-black">تفاصيل المسار المحدد</h3>
            {selectedEndpointId ? (
              <div className="space-y-2 text-xs">
                {(() => {
                  const node = catalog.find((n) => n.id === selectedEndpointId);
                  if (!node) return <p className="text-muted-foreground">—</p>;
                  return (
                    <>
                      <div>
                        <span className="font-bold text-muted-foreground">المجموعة:</span>{" "}
                        <span className="font-mono">{node.group}</span>
                      </div>
                      {node.subgroup ? (
                        <div>
                          <span className="font-bold text-muted-foreground">المجموعة الفرعية:</span>{" "}
                          <span className="font-mono">{node.subgroup}</span>
                        </div>
                      ) : null}
                      <div>
                        <span className="font-bold text-muted-foreground">الاسم:</span>{" "}
                        <span className="font-mono">{node.name}</span>
                      </div>
                      <div>
                        <span className="font-bold text-muted-foreground">المسار:</span>{" "}
                        <span className="font-mono text-primary" dir="ltr">{node.path}</span>
                      </div>
                      {node.isDynamic ? (
                        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-2 text-amber-300">
                          مسار ديناميكي — يتطلب معاملات
                        </div>
                      ) : null}
                      {node.pathParams.length > 0 ? (
                        <div>
                          <span className="font-bold text-muted-foreground">المتغيرات:</span>{" "}
                          {node.pathParams.map((p) => (
                            <code
                              key={p}
                              className="mx-0.5 rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-amber-300"
                            >
                              {`{${p}}`}
                            </code>
                          ))}
                        </div>
                      ) : null}
                    </>
                  );
                })()}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                اختر مساراً من الكتالوج لعرض تفاصيله
              </p>
            )}
          </AdminCard>

          <AdminCard variant="glass" className="rounded-2xl border-white/10 p-4">
            <h3 className="mb-2 text-sm font-black">إجراءات سريعة</h3>
            <div className="space-y-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="w-full justify-start gap-2 rounded-lg"
              >
                <Wand2 className="h-3.5 w-3.5" />
                طلب جديد فارغ
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  if (confirm("هل أنت متأكد من مسح كل السجل؟")) {
                    storage.clearHistory();
                    toast.success("تم مسح السجل");
                  }
                }}
                disabled={storage.history.length === 0}
                className="w-full justify-start gap-2 rounded-lg text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
              >
                <Trash2 className="h-3.5 w-3.5" />
                مسح السجل ({storage.history.length})
              </Button>
            </div>
          </AdminCard>

          <AdminCard variant="glass" className="rounded-2xl border-white/10 p-4">
            <h3 className="mb-2 text-sm font-black">المسارات الأكثر استخداماً</h3>
            <TopUsedList history={storage.history} />
          </AdminCard>
        </div>
      </div>

      {/* تذييل */}
      <AdminCard variant="glass" className="rounded-2xl border-white/10 p-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground">
          <span>
            المسودة الحالية تُحفظ محلياً تلقائياً · السجل يحتفظ بآخر {100} طلب
          </span>
          <span>
            إجمالي المسارات في الكتالوج: {catalog.length.toLocaleString("ar-EG")} · عدد المجموعات: {storage.collections.length}
          </span>
        </div>
      </AdminCard>
    </div>
  );
}

/** قائمة بأكثر المسارات استخداماً بناءً على السجل */
function TopUsedList({ history }: { history: HistoryEntry[] }): React.ReactElement {
  const top = React.useMemo(() => {
    const counts = new Map<string, { count: number; method: HistoryEntry["method"]; lastStatus: number }>();
    for (const entry of history) {
      const key = `${entry.method} ${entry.url.split("?")[0]}`;
      const existing = counts.get(key);
      if (existing) {
        existing.count++;
      } else {
        counts.set(key, { count: 1, method: entry.method, lastStatus: entry.status });
      }
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5);
  }, [history]);

  if (top.length === 0) {
    return <p className="text-xs text-muted-foreground">لا توجد بيانات بعد</p>;
  }
  return (
    <ul className="space-y-1.5">
      {top.map(([key, info]) => (
        <li
          key={key}
          className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 px-2 py-1.5"
        >
          <div className="flex min-w-0 items-center gap-2">
            <span className="rounded-md bg-white/10 px-1.5 py-0.5 font-mono text-[10px] font-black">
              {info.method}
            </span>
            <span className="truncate font-mono text-[10px]" dir="ltr">
              {key.replace(`${info.method} `, "")}
            </span>
          </div>
          <span className="shrink-0 rounded-md bg-primary/15 px-1.5 py-0.5 text-[10px] font-black text-primary">
            {info.count}
          </span>
        </li>
      ))}
    </ul>
  );
}
