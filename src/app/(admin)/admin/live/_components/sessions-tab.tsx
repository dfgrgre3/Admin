import React from "react";
import { AdminCard } from "@/components/admin/ui/admin-card";
import { AdminDataTable } from "@/components/admin/ui/admin-table";
import { Activity, History, Monitor } from "lucide-react";
import { Session } from "./constants";
import { sessionColumns } from "./session-columns";

interface SessionsTabProps {
   sessions: Session[];
   sessionsLoading: boolean;
   sessionStats: { totalActive: number; totalExpired: number; uniqueDevices: number } | undefined;
   revokeSessionMutation: {
      mutate: (sessionId: string) => void;
   };
}

export function SessionsTab({
   sessions,
   sessionsLoading,
   sessionStats,
   revokeSessionMutation,
}: SessionsTabProps) {
   return (
      <div className="space-y-6">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <AdminCard variant="glass" className="p-5 flex items-center gap-4 border-green-500/20">
               <div className="p-3 bg-green-500/10 rounded-2xl text-green-500">
                  <Activity className="w-7 h-7" />
               </div>
               <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">جلسات نشطة</p>
                  <h3 className="text-3xl font-black">{sessionStats?.totalActive || 0}</h3>
               </div>
            </AdminCard>

            <AdminCard variant="glass" className="p-5 flex items-center gap-4 border-gray-500/20">
               <div className="p-3 bg-gray-500/10 rounded-2xl text-gray-500">
                  <History className="w-7 h-7" />
               </div>
               <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">جلسات منتهية</p>
                  <h3 className="text-3xl font-black">{sessionStats?.totalExpired || 0}</h3>
               </div>
            </AdminCard>

            <AdminCard variant="glass" className="p-5 flex items-center gap-4 border-indigo-500/20">
               <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-500">
                  <Monitor className="w-7 h-7" />
               </div>
               <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">أجهزة فريدة</p>
                  <h3 className="text-3xl font-black">{sessionStats?.uniqueDevices || 0}</h3>
               </div>
            </AdminCard>
         </div>

         <AdminCard variant="glass" className="p-1 rounded-[2.5rem] overflow-hidden border border-white/10">
            {sessionsLoading ? (
               <div className="p-8 text-center font-bold text-muted-foreground">جاري تحميل الجلسات...</div>
            ) : (
               <AdminDataTable
                  {...({
                     columns: sessionColumns(revokeSessionMutation.mutate),
                     data: sessions,
                     searchKey: "ip",
                     searchPlaceholder: "ابحث بالـ IP...",
                  } as any)}
               />
            )}
         </AdminCard>
      </div>
   );
}
