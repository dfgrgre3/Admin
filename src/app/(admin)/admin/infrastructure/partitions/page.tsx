"use client";

import React from "react";
import { m, AnimatePresence } from "framer-motion";
import { 
  Database, 
  ShieldCheck, 
  ShieldAlert, 
  Activity, 
  Layers, 
  RefreshCw, 
  ChevronRight, 
  Zap,
  HardDrive,
  Server,
  Terminal,
  Shield
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { apiRoutes } from "@/lib/api/routes";
import { toast } from "sonner";

const STYLES = {
  glass: "relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-card/40 shadow-2xl backdrop-blur-3xl ring-1 ring-white/5",
  statusPulse: "h-3 w-3 rounded-full animate-pulse shadow-[0_0_15px_rgba(var(--primary),0.5)]",
  neonText: "rpg-neon-text font-black",
};

interface PartitionHealth {
  tableName: string;
  partitionCount: number;
  status: 'healthy' | 'warning' | 'not_partitioned' | 'error';
  recommendedActions: string[];
  rows?: number;
}

export default function PartitionsHealthPage() {
  const [logs, setLogs] = React.useState<Array<{ time: string; msg: string; type: string }>>([
    { time: "00:15:22", msg: "Scanning Pg_Catalog for new partitions...", type: "info" },
    { time: "00:14:01", msg: "Health Check: StudySession is healthy.", type: "success" },
    { time: "00:12:45", msg: "Warning: Missing future partition for SecurityLog.", type: "warning" },
    { time: "00:10:11", msg: "Pruning index tree for optimized access.", type: "info" }
  ]);

  const [isRunningMaintenance, setIsRunningMaintenance] = React.useState(false);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['admin', 'infrastructure', 'partitions'],
    queryFn: async () => {
      const response = await fetch(apiRoutes.admin.databasePartitions + '?action=health');
      if (!response.ok) throw new Error('Failed to fetch partition health');
      const res = await response.json();
      return res.data;
    },
    refetchInterval: 60000 // Refresh every minute
  });

  const settings = data?.settings || { autoPartition: true, purgeOld: false, compression: true };

  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: typeof settings) => {
      const response = await fetch(apiRoutes.admin.databasePartitions, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSettings),
      });
      if (!response.ok) throw new Error("Failed to update partition settings");
      const res = await response.json();
      return res.data;
    },
    onSuccess: () => {
      toast.success("تم تحديث إعدادات الأتمتة بنجاح");
      refetch();
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "فشل في تحديث الإعدادات");
    }
  });

  const toggleSetting = (key: 'autoPartition' | 'purgeOld' | 'compression') => {
    const nextSettings = {
      ...settings,
      [key]: !settings[key]
    };
    updateSettingsMutation.mutate(nextSettings);
  };

  const handleRunMaintenance = async () => {
    setIsRunningMaintenance(true);
    const toastId = toast.loading("جاري تنفيذ أعمال الصيانة وقسمة الجداول...");
    try {
      const response = await fetch(apiRoutes.admin.databasePartitions + '?action=maintenance', {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to execute maintenance");
      const res = await response.json();
      if (res.success && res.data?.logs) {
        setLogs(prev => [...res.data.logs, ...prev]);
        toast.success("تم تنفيذ الصيانة الدورية للأقسام بنجاح!", { id: toastId });
        refetch();
      } else {
        throw new Error(res.error || "خطأ غير معروف");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "خطأ أثناء تنفيذ الصيانة", { id: toastId });
    } finally {
      setIsRunningMaintenance(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'warning': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'not_partitioned': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
      default: return 'text-red-400 bg-red-400/10 border-red-400/20';
    }
  };

  const getStatusPulse = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-emerald-400 shadow-emerald-400/50';
      case 'warning': return 'bg-amber-400 shadow-amber-400/50';
      default: return 'bg-red-400 shadow-red-400/50';
    }
  };

  return (
    <div className="min-h-screen space-y-12 pb-20" dir="rtl">
      {/* Cinematic Header */}
      <m.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={STYLES.glass + " p-8 md:p-12 mb-10 overflow-hidden group"}
      >
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent group-hover:via-primary transition-all duration-700" />
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10 relative z-10">
          <div className="space-y-4 text-center lg:text-right flex-1">
             <div className="inline-flex items-center gap-3 rounded-full border border-primary/30 bg-primary/10 px-6 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                <Database className="h-4 w-4" />
                <span>بروتوكول البنية التحتية: Scalability v5.0</span>
             </div>
             <h1 className="text-4xl md:text-7xl font-black tracking-tight leading-tight">
                صحة <span className={STYLES.neonText}>خفايا المملكة</span> ⚔️
             </h1>
             <p className="text-lg text-gray-400 font-medium font-bold max-w-2xl">
                عندما تزداد الجيوش (المطلوب: 1M محارب), يجب أن تتسع خزائن البيانات. راقب تقسيم الجداول لضمان خفة الحركة القتالية.
             </p>
          </div>

          <div className="flex gap-4">
             <Button 
                variant="outline" 
                onClick={() => refetch()}
                disabled={isFetching}
                className="h-16 px-8 rounded-2xl border-white/10 hover:bg-white/5 font-black flex items-center gap-3 transition-all"
             >
                <RefreshCw className={`w-5 h-5 ${isFetching ? 'animate-spin' : ''}`} />
                إعادة فحص السجلات
             </Button>
          </div>
        </div>
      </m.div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         {[
           { label: "الجداول المراقبة", value: data?.tableHealth?.length || 0, icon: Layers, color: "blue" },
           { label: "الحالة العامة", value: data?.status === "healthy" ? "مستقر" : "تنبيهات", icon: ShieldCheck, color: "emerald" },
           { label: "المساحة الموفرة", value: "+45%", icon: Zap, color: "amber" },
           { label: "الرتبة التقنية", value: "S-Tier", icon: Server, color: "purple" }
         ].map((stat, i) => (
           <m.div 
             key={i}
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ delay: i * 0.1 }}
             className={STYLES.glass + " p-6 flex flex-col items-center justify-center text-center gap-2 border-white/5"}
           >
              <div className={`p-4 rounded-2xl bg-${stat.color}-500/10 text-${stat.color}-400 border border-white/5 mb-2`}>
                 <stat.icon className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{stat.label}</span>
              <span className="text-2xl font-black">{stat.value}</span>
           </m.div>
         ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Table Cards - Main Section */}
        <div className="lg:col-span-8 space-y-8">
           <h2 className="text-2xl font-black flex items-center gap-4 px-2">
              <Layers className="text-primary w-6 h-6" />
              <span>مخطط تقسيم الجداول (Table Schema Mapping)</span>
           </h2>

           <div className="grid grid-cols-1 gap-6">
              <AnimatePresence mode="popLayout">
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-48 w-full animate-pulse bg-white/5 rounded-[2.5rem] border border-white/10" />
                  ))
                ) : (
                  data?.tableHealth?.map((table: PartitionHealth, i: number) => (
                    <m.div
                      key={table.tableName}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      whileHover={{ x: 10 }}
                      className={STYLES.glass + " p-8 border-white/5 group hover:border-primary/30 transition-all cursor-default"}
                    >
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                        <div className="flex items-center gap-6">
                           <div className={`h-20 w-20 flex items-center justify-center rounded-[1.5rem] bg-gradient-to-br from-card to-background border-2 border-white/5 shadow-2xl relative`}>
                              <HardDrive className="w-10 h-10 text-primary/60" />
                              <div className={`absolute -top-1 -right-1 ${STYLES.statusPulse} ${getStatusPulse(table.status)}`} />
                           </div>
                           <div className="space-y-1">
                              <h3 className="text-3xl font-black tracking-tight">{table.tableName}</h3>
                              <div className="flex items-center gap-4">
                                 <Badge className={`${getStatusColor(table.status)} px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg border`}>
                                    {table.status.replace('_', ' ')}
                                 </Badge>
                                 <span className="text-gray-500 text-xs font-bold font-mono uppercase">{table.partitionCount} Partitions</span>
                                 {table.rows !== undefined && (
                                   <span className="text-gray-400 text-xs font-mono">({table.rows} rows)</span>
                                 )}
                              </div>
                           </div>
                        </div>

                        <div className="flex flex-col items-end gap-3 min-w-[200px]">
                           <div className="w-full space-y-2">
                              <div className="flex justify-between text-[10px] font-black uppercase text-gray-500">
                                 <span>كفاءة الاستعلام (Query Efficiency)</span>
                                 <span>{table.status === "healthy" ? "98%" : table.status === "warning" ? "85%" : "60%"}</span>
                              </div>
                              <Progress value={table.status === "healthy" ? 98 : table.status === "warning" ? 85 : 60} className="h-1.5 bg-white/5" />
                           </div>
                           <Button size="sm" variant="ghost" className="text-primary font-black gap-2 hover:bg-primary/10 rounded-xl px-4">
                              عرض تفاصيل السجلات <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                           </Button>
                        </div>
                      </div>

                      {table.recommendedActions.length > 0 && (
                        <div className="mt-8 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-4">
                           <ShieldAlert className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                           <div className="space-y-1">
                              <p className="text-xs font-black text-amber-500 uppercase tracking-widest">توصية القائد الأمني</p>
                              <div className="flex flex-wrap gap-2 mt-2">
                                 {table.recommendedActions.map((action, idx) => (
                                   <span key={idx} className="text-sm font-bold text-gray-400 flex items-center gap-2">
                                      <div className="h-1 w-1 rounded-full bg-amber-500" />
                                      {action}
                                   </span>
                                 ))}
                              </div>
                           </div>
                        </div>
                      )}
                    </m.div>
                  ))
                )}
              </AnimatePresence>
           </div>
        </div>

        {/* Action Sidebar */}
        <div className="lg:col-span-4 space-y-8">
           <h2 className="text-2xl font-black flex items-center gap-4 px-2">
              <Terminal className="text-primary w-6 h-6" />
              <span>مركز العمليات (Operational Ops)</span>
           </h2>

           <Card className={STYLES.glass + " p-8 border-primary/20 space-y-8"}>
              <div className="space-y-2">
                 <h4 className="text-xl font-black">إعدادات الأتمتة</h4>
                 <p className="text-xs text-gray-500 font-bold leading-relaxed uppercase">تحكم في كيفية إدارة المملكة لمواردها بشكل تلقائي.</p>
              </div>

              {[
                { key: "autoPartition" as const, title: "التقسيم التلقائي", desc: "إنشاء جداول الشهور القادمة تلقائياً", active: settings.autoPartition },
                { key: "purgeOld" as const, title: "حذف السجلات القديمة", desc: "تنظيف البيانات الأقدم من عام", active: settings.purgeOld },
                { key: "compression" as const, title: "ضغط البيانات (Compression)", desc: "تقليل مساحة الخادم للبيانات الأرشفية", active: settings.compression }
              ].map((op, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 group hover:bg-white/10 transition-all">
                   <div className="space-y-1">
                      <p className="text-sm font-black">{op.title}</p>
                      <p className="text-[10px] text-gray-500 font-bold">{op.desc}</p>
                   </div>
                   <div 
                      onClick={() => toggleSetting(op.key)}
                      className={`h-6 w-12 rounded-full p-1 cursor-pointer transition-all ${op.active ? 'bg-primary' : 'bg-gray-700'}`}
                   >
                      <div className={`h-4 w-4 rounded-full bg-white transition-all transform ${op.active ? 'translate-x-6' : 'translate-x-0'}`} />
                   </div>
                </div>
              ))}

              <Button 
                onClick={handleRunMaintenance}
                disabled={isRunningMaintenance}
                className="w-full bg-primary hover:bg-primary/90 text-white font-black h-16 rounded-2xl shadow-[0_15px_30px_rgba(var(--primary),0.3)] flex items-center justify-center gap-3 group border-b-4 border-black/20"
              >
                 <Shield className={`w-5 h-5 group-hover:scale-110 transition-transform ${isRunningMaintenance ? 'animate-pulse' : ''}`} />
                 {isRunningMaintenance ? "جاري تنفيذ الصيانة..." : "تنفيذ الصيانة المجدولة"}
              </Button>
           </Card>

           {/* Technical Log Summary */}
           <div className={STYLES.glass + " p-8 border-white/5 space-y-6"}>
              <h4 className="text-lg font-black flex items-center gap-3">
                 <Activity className="w-5 h-5 text-gray-500" />
                 سجلات المحرك (Engine Logs)
              </h4>
              <div className="space-y-4 font-mono text-[10px] text-gray-500">
                 {logs.map((log, i) => (
                   <div key={i} className="flex gap-3 leading-relaxed">
                      <span className="text-primary opacity-50">[{log.time}]</span>
                      <span className={log.type === 'warning' ? 'text-amber-500' : log.type === 'success' ? 'text-emerald-500' : 'text-gray-400'}>{log.msg}</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}
