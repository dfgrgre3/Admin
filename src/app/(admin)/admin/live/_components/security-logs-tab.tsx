import React from "react";
import { AdminCard } from "@/components/admin/ui/admin-card";
import { Badge } from "@/components/ui/badge";
import { History, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { SecurityLog, eventTypeLabels, eventTypeColors, eventTypeIcons } from "./constants";

interface SecurityLogsTabProps {
   securityLogs: SecurityLog[];
   securityLogsLoading: boolean;
}

export function SecurityLogsTab({ securityLogs, securityLogsLoading }: SecurityLogsTabProps) {
   return (
      <div className="space-y-6">
         <AdminCard variant="glass" className="bg-gradient-to-l from-slate-500/10 to-transparent border-slate-500/30 p-6">
            <div className="flex items-start gap-4">
               <div className="p-3 bg-slate-500/10 rounded-2xl text-slate-500">
                  <History className="w-8 h-8" />
               </div>
               <div>
                  <h3 className="text-xl font-black text-slate-500">سجل أحداث الأمان (Security Event Log)</h3>
                  <p className="text-sm font-bold mt-2 max-w-3xl text-muted-foreground">
                     تتبع جميع أحداث الأمان الهامة في النظام: محاولات الدخول، تغييرات كلمة المرور،
                     الأنشطة المشبوهة، والمزيد.
                  </p>
               </div>
            </div>
         </AdminCard>

         {securityLogsLoading ? (
            <div className="text-center py-10 text-muted-foreground font-bold">جاري تحميل سجلات الأمان...</div>
         ) : securityLogs.length === 0 ? (
            <AdminCard variant="glass" className="text-center py-16">
               <History className="w-16 h-16 mx-auto mb-4 opacity-20" />
               <p className="font-bold text-lg">لا توجد سجلات أمان بعد</p>
            </AdminCard>
         ) : (
            <AdminCard variant="glass" className="p-0 overflow-hidden border border-white/10">
               <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                     <thead className="bg-accent/20 border-b border-border">
                        <tr>
                           <th className="p-4 text-right font-bold text-xs">الحدث</th>
                           <th className="p-4 text-right font-bold text-xs">المستخدم</th>
                           <th className="p-4 text-right font-bold text-xs">IP</th>
                           <th className="p-4 text-right font-bold text-xs">الموقع</th>
                           <th className="p-4 text-right font-bold text-xs">التاريخ</th>
                        </tr>
                     </thead>
                     <tbody>
                        {securityLogs.slice(0, 50).map((log) => {
                           const Icon = eventTypeIcons[log.eventType] || Info;
                           const colorClass = eventTypeColors[log.eventType] || "bg-gray-500/10 text-gray-500 border-gray-500/20";
                           return (
                              <tr key={log.id} className="border-b border-border/30 hover:bg-accent/5 transition-colors">
                                 <td className="p-4">
                                    <Badge className={cn("border-0 text-[10px] font-black", colorClass)}>
                                       <Icon className="w-3 h-3 ml-1" />
                                       {eventTypeLabels[log.eventType] || log.eventType}
                                    </Badge>
                                 </td>
                                 <td className="p-4 text-xs font-bold">
                                    {log.user?.name || log.user?.email || "---"}
                                 </td>
                                 <td className="p-4">
                                    <code className="text-[10px] bg-white/5 px-2 py-0.5 rounded font-mono" dir="ltr">
                                       {log.ip}
                                    </code>
                                 </td>
                                 <td className="p-4 text-xs opacity-70">
                                    {log.location || "---"}
                                 </td>
                                 <td className="p-4 text-xs font-mono">
                                    {new Date(log.createdAt).toLocaleDateString("ar-EG", {
                                       hour: '2-digit',
                                       minute: '2-digit',
                                    })}
                                 </td>
                              </tr>
                           );
                        })}
                     </tbody>
                  </table>
               </div>
               {securityLogs.length > 50 && (
                  <div className="p-4 text-center border-t border-border/30">
                     <p className="text-xs text-muted-foreground font-bold">
                        عرض 50 من أصل {securityLogs.length} سجل
                     </p>
                  </div>
               )}
            </AdminCard>
         )}
      </div>
   );
}