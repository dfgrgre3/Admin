"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AlertCircle, Ban, Fingerprint, Grid3X3, History, List, Radio, RefreshCw, Shield, Terminal, UserCog } from "lucide-react";

import { PageHeader } from "@/components/admin/ui/page-header";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { adminFetch } from "@/lib/api/admin-api";
import { readApiErrorMessage } from "@/lib/api/api-error-utils";
import { apiRoutes } from "@/lib/api/routes";
import { cn } from "@/lib/utils";

import { DeviceFingerprintTab } from "./_components/device-fingerprint-tab";
import { IPWhitelistTab } from "./_components/ip-whitelist-tab";
import { LiveMonitoringTab } from "./_components/live-monitoring-tab";
import { RBACTab } from "./_components/rbac-tab";
import { SecurityLogsTab } from "./_components/security-logs-tab";
import { SessionsTab } from "./_components/sessions-tab";
import {
   ActiveUser,
   DeviceFingerprint,
   IPWhitelistEntry,
   LiveStats,
   RolePermission,
   SecurityLog,
   Session,
} from "./_components/constants";

type ActivityFilter = "all" | "exam" | "study" | "online";

export default function LiveMonitoringPage() {
   const queryClient = useQueryClient();
   const [activeUsers, setActiveUsers] = React.useState<ActiveUser[]>([]);
   const [stats, setStats] = React.useState<LiveStats | null>(null);
   const [loading, setLoading] = React.useState(true);
   const [error, setError] = React.useState<string | null>(null);
   const [mainTab, setMainTab] = React.useState("live");
   const [filter, setFilter] = React.useState<ActivityFilter>("all");
   const [autoRefresh, setAutoRefresh] = React.useState(true);
   const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");
   const [blockDialogOpen, setBlockDialogOpen] = React.useState(false);
   const [selectedDevice, setSelectedDevice] = React.useState<DeviceFingerprint | null>(null);
   const [blockReason, setBlockReason] = React.useState("");

   const fetchLiveData = React.useCallback(async () => {
      try {
         setLoading(true);
         const response = await adminFetch(`${apiRoutes.admin.live}?type=${filter}&minutes=5`);

         if (!response.ok) {
            const errBody = await response.json().catch(() => ({}));
            throw new Error(readApiErrorMessage(errBody, "تعذر جلب بيانات المراقبة الحية"));
         }

         const data = await response.json();
         if (!data.success) {
            throw new Error(readApiErrorMessage(data, "خطأ من الخادم"));
         }

         setActiveUsers(data.activeUsers || []);
         setStats(data.stats || null);
         setError(null);
      } catch (err: unknown) {
         setError(err instanceof Error ? err.message : "تعذر جلب بيانات المراقبة الحية");
      } finally {
         setLoading(false);
      }
   }, [filter]);

   React.useEffect(() => {
      fetchLiveData();
      if (!autoRefresh) return;

      const interval = setInterval(fetchLiveData, 15000);
      return () => clearInterval(interval);
   }, [autoRefresh, fetchLiveData]);

   const handleTerminateSession = async (sessionId: string) => {
      if (!confirm("هل أنت متأكد من إنهاء هذه الجلسة؟")) return;

      try {
         await adminFetch(`${apiRoutes.auth.sessions}/${sessionId}`, { method: "DELETE" });
         toast.success("تم إنهاء الجلسة بنجاح");
         fetchLiveData();
      } catch {
         toast.error("فشل في إنهاء الجلسة");
      }
   };

   const { data: fingerprintsData, isLoading: fingerprintsLoading } = useQuery<{ data: { devices: DeviceFingerprint[] } }>({
      queryKey: ["admin", "device-fingerprints"],
      queryFn: async () => {
         const response = await adminFetch("/api/admin/security/fingerprints");
         if (!response.ok) throw new Error("فشل في جلب بصمات الأجهزة");
         return response.json();
      },
      refetchInterval: autoRefresh ? 30000 : false,
   });

   const { data: rolesData, isLoading: rolesLoading } = useQuery<{ data: { roles: RolePermission[] } }>({
      queryKey: ["admin", "rbac-roles"],
      queryFn: async () => {
         const response = await adminFetch("/api/admin/security/roles");
         if (!response.ok) throw new Error("فشل في جلب الأدوار");
         return response.json();
      },
   });

   const { data: sessionsData, isLoading: sessionsLoading } = useQuery<{ data: { sessions: Session[]; count: number } }>({
      queryKey: ["admin", "security-sessions"],
      queryFn: async () => {
         const response = await adminFetch("/api/admin/security/sessions");
         if (!response.ok) throw new Error("فشل في جلب الجلسات");
         return response.json();
      },
      refetchInterval: autoRefresh ? 30000 : false,
   });

   const { data: whitelistData, isLoading: whitelistLoading } = useQuery<{ data: IPWhitelistEntry[] }>({
      queryKey: ["admin", "ip-whitelist"],
      queryFn: async () => {
         const response = await adminFetch("/api/admin/security/ip-whitelist");
         if (!response.ok) throw new Error("فشل في جلب القائمة البيضاء");
         return response.json();
      },
   });

   const { data: securityLogsData, isLoading: securityLogsLoading } = useQuery<{ data: { logs: SecurityLog[] } }>({
      queryKey: ["admin", "security-logs"],
      queryFn: async () => {
         const response = await adminFetch("/api/admin/security/logs?limit=100");
         if (!response.ok) throw new Error("فشل في جلب سجلات الأمان");
         return response.json();
      },
      refetchInterval: autoRefresh ? 30000 : false,
   });

   const { data: sessionStats } = useQuery<{ data: { totalActive: number; totalExpired: number; uniqueDevices: number } }>({
      queryKey: ["admin", "session-stats"],
      queryFn: async () => {
         const response = await adminFetch("/api/admin/security/sessions/stats");
         if (!response.ok) throw new Error("فشل في جلب إحصائيات الجلسات");
         return response.json();
      },
   });

   const revokeSessionMutation = useMutation({
      mutationFn: async (sessionId: string) => {
         const response = await adminFetch(`/api/admin/security/sessions/${sessionId}/revoke`, { method: "POST" });
         if (!response.ok) throw new Error("فشل في إنهاء الجلسة");
         return response.json();
      },
      onSuccess: () => {
         toast.success("تم إنهاء الجلسة");
         queryClient.invalidateQueries({ queryKey: ["admin", "security-sessions"] });
         queryClient.invalidateQueries({ queryKey: ["admin", "session-stats"] });
      },
      onError: () => toast.error("فشل في إنهاء الجلسة"),
   });

   const blockDeviceMutation = useMutation({
      mutationFn: async ({ fingerprintId, reason }: { fingerprintId: string; reason: string }) => {
         const response = await adminFetch("/api/admin/security/fingerprints/block", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fingerprintId, reason }),
         });
         if (!response.ok) throw new Error("فشل في حظر الجهاز");
         return response.json();
      },
      onSuccess: () => {
         toast.success("تم حظر الجهاز بنجاح");
         setBlockDialogOpen(false);
         setSelectedDevice(null);
         setBlockReason("");
         queryClient.invalidateQueries({ queryKey: ["admin", "device-fingerprints"] });
      },
      onError: (err) => toast.error(err instanceof Error ? err.message : "فشل في حظر الجهاز"),
   });

   const unblockDeviceMutation = useMutation({
      mutationFn: async (fingerprintId: string) => {
         const response = await adminFetch(`/api/admin/security/fingerprints/${fingerprintId}/unblock`, { method: "POST" });
         if (!response.ok) throw new Error("فشل في إلغاء حظر الجهاز");
         return response.json();
      },
      onSuccess: () => {
         toast.success("تم إلغاء حظر الجهاز بنجاح");
         queryClient.invalidateQueries({ queryKey: ["admin", "device-fingerprints"] });
      },
      onError: (err) => toast.error(err instanceof Error ? err.message : "فشل في إلغاء حظر الجهاز"),
   });

   const fingerprints = fingerprintsData?.data?.devices || [];
   const roles = rolesData?.data?.roles || [];
   const sessions = sessionsData?.data?.sessions || [];
   const whitelistEntries = Array.isArray(whitelistData?.data) ? whitelistData.data : [];
   const securityLogs = securityLogsData?.data?.logs || [];
   const whitelistedIPs = whitelistEntries.filter((entry) => entry.isActive).length;

   const filteredUsers = React.useMemo(() => {
      if (filter === "all") return activeUsers;
      return activeUsers.filter((user) => {
         if (filter === "exam") return user.currentActivity === "taking_exam";
         if (filter === "study") return user.currentActivity === "studying";
         return user.currentActivity === "online";
      });
   }, [activeUsers, filter]);

   const recentThreats = React.useMemo(() => {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return securityLogs.filter((log) => (
         (log.eventType === "FAILED_LOGIN" || log.eventType === "LOGIN_FAILED" || log.eventType === "SUSPICIOUS_ACTIVITY") &&
         new Date(log.createdAt) > oneDayAgo
      )).length;
   }, [securityLogs]);

   return (
      <div className="space-y-8 pb-20" dir="rtl">
         <PageHeader
            title="مركز المراقبة والأمان (Security Hub)"
            description="نظام متكامل لمراقبة النشاط الحي، إدارة الجلسات، بصمات الأجهزة، القائمة البيضاء للـ IP، وسجلات الأمان."
         >
            <div className="flex items-center gap-3">
               <Badge
                  variant="outline"
                  className={cn(
                     "text-xs font-black border-0",
                     recentThreats > 0 ? "bg-amber-500/20 text-amber-500" : "bg-green-500/20 text-green-500",
                  )}
               >
                  {recentThreats > 0 ? `${recentThreats} تهديد` : "آمن"}
               </Badge>
            </div>
         </PageHeader>

         <div className="flex flex-wrap items-center justify-between gap-4 bg-card/40 backdrop-blur-md p-4 rounded-[1.5rem] border border-white/5">
            <div className="flex items-center gap-3">
               <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} id="auto-refresh" />
               <Label htmlFor="auto-refresh" className="text-sm font-bold cursor-pointer">
                  تحديث تلقائي
               </Label>
               <Badge variant="outline" className="text-[10px] font-mono font-bold">كل 15 ثانية</Badge>
            </div>

            <div className="flex items-center gap-2">
               <div className="flex items-center bg-accent/30 rounded-xl p-1">
                  <Button variant={viewMode === "grid" ? "default" : "ghost"} size="sm" className="h-8 w-8 p-0" onClick={() => setViewMode("grid")}>
                     <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button variant={viewMode === "list" ? "default" : "ghost"} size="sm" className="h-8 w-8 p-0" onClick={() => setViewMode("list")}>
                     <List className="w-4 h-4" />
                  </Button>
               </div>
               <AdminButton variant="outline" onClick={fetchLiveData} loading={loading} icon={RefreshCw} className="h-10">
                  تحديث
               </AdminButton>
            </div>
         </div>

         {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 font-bold flex items-center gap-2">
               <AlertCircle className="w-5 h-5" />
               {error}
            </div>
         )}

         <Tabs value={mainTab} onValueChange={setMainTab} className="w-full">
            <TabsList className="w-full bg-background/50 h-14 p-1 border-border rounded-xl mb-8 overflow-x-auto flex-nowrap">
               <TabsTrigger value="live" className="whitespace-nowrap text-sm font-bold rounded-lg">
                  <Radio className="w-4 h-4 ml-2" /> المراقبة الحية
               </TabsTrigger>
               <TabsTrigger value="sessions" className="whitespace-nowrap text-sm font-bold rounded-lg">
                  <Terminal className="w-4 h-4 ml-2" /> الجلسات ({sessionStats?.data?.totalActive || 0})
               </TabsTrigger>
               <TabsTrigger value="fingerprint" className="whitespace-nowrap text-sm font-bold rounded-lg">
                  <Fingerprint className="w-4 h-4 ml-2" /> بصمات الأجهزة ({fingerprints.length})
               </TabsTrigger>
               <TabsTrigger value="whitelist" className="whitespace-nowrap text-sm font-bold rounded-lg">
                  <Shield className="w-4 h-4 ml-2" /> القائمة البيضاء ({whitelistedIPs})
               </TabsTrigger>
               <TabsTrigger value="rbac" className="whitespace-nowrap text-sm font-bold rounded-lg">
                  <UserCog className="w-4 h-4 ml-2" /> الصلاحيات ({roles.length})
               </TabsTrigger>
               <TabsTrigger value="logs" className="whitespace-nowrap text-sm font-bold rounded-lg">
                  <History className="w-4 h-4 ml-2" /> سجلات الأمان
               </TabsTrigger>
            </TabsList>

            <TabsContent value="live">
               <LiveMonitoringTab
                  filteredUsers={filteredUsers}
                  loading={loading}
                  viewMode={viewMode}
                  filter={filter}
                  setFilter={setFilter}
                  handleTerminateSession={handleTerminateSession}
               />
            </TabsContent>

            <TabsContent value="sessions">
               <SessionsTab
                  sessions={sessions}
                  sessionsLoading={sessionsLoading}
                  sessionStats={sessionStats?.data}
                  revokeSessionMutation={revokeSessionMutation}
               />
            </TabsContent>

            <TabsContent value="fingerprint">
               <DeviceFingerprintTab
                  fingerprints={fingerprints}
                  fingerprintsLoading={fingerprintsLoading}
                  blockDeviceMutation={blockDeviceMutation}
                  unblockDeviceMutation={unblockDeviceMutation}
                  setSelectedDevice={setSelectedDevice}
                  setBlockDialogOpen={setBlockDialogOpen}
               />
            </TabsContent>

            <TabsContent value="whitelist">
               <IPWhitelistTab whitelistEntries={whitelistEntries} whitelistLoading={whitelistLoading} whitelistedIPs={whitelistedIPs} />
            </TabsContent>

            <TabsContent value="rbac">
               <RBACTab roles={roles} rolesLoading={rolesLoading} />
            </TabsContent>

            <TabsContent value="logs">
               <SecurityLogsTab securityLogs={securityLogs} securityLogsLoading={securityLogsLoading} />
            </TabsContent>
         </Tabs>

         <Dialog open={blockDialogOpen} onOpenChange={setBlockDialogOpen}>
            <DialogContent className="max-w-md bg-card/95 backdrop-blur-xl border-white/10 rounded-[2rem] p-0 overflow-hidden">
               <div className="h-1.5 bg-gradient-to-r from-red-500 via-rose-500 to-orange-500" />
               <div className="p-8">
                  <DialogHeader className="mb-6">
                     <DialogTitle className="text-xl font-black flex items-center gap-3">
                        <Ban className="w-6 h-6 text-red-500" />
                        حظر جهاز
                     </DialogTitle>
                     <DialogDescription className="font-bold text-muted-foreground">
                        {selectedDevice && (
                           <>حظر جهاز <strong>{selectedDevice.deviceType}</strong> للمستخدم <strong>{selectedDevice.userName}</strong></>
                        )}
                     </DialogDescription>
                  </DialogHeader>

                  <Label className="text-sm font-bold mb-2 block">سبب الحظر</Label>
                  <Textarea
                     value={blockReason}
                     onChange={(event) => setBlockReason(event.target.value)}
                     placeholder="مثال: مشاركة حساب، نشاط مشبوه..."
                     rows={3}
                     className="rounded-xl border-white/10 bg-white/5"
                  />

                  <DialogFooter className="mt-6 gap-3">
                     <Button
                        variant="outline"
                        onClick={() => {
                           setBlockDialogOpen(false);
                           setSelectedDevice(null);
                           setBlockReason("");
                        }}
                        className="flex-1 h-12 rounded-xl font-bold"
                     >
                        إلغاء
                     </Button>
                     <Button
                        onClick={() => {
                           if (!selectedDevice) return;
                           blockDeviceMutation.mutate({
                              fingerprintId: selectedDevice.id,
                              reason: blockReason || "حظر من قبل المسؤول",
                           });
                        }}
                        disabled={blockDeviceMutation.isPending}
                        className="flex-1 h-12 rounded-xl font-bold bg-red-500 hover:bg-red-600 text-white"
                     >
                        {blockDeviceMutation.isPending ? "جاري الحظر..." : "تأكيد الحظر"}
                     </Button>
                  </DialogFooter>
               </div>
            </DialogContent>
         </Dialog>
      </div>
   );
}
