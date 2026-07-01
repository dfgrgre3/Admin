import React from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { m, AnimatePresence } from "framer-motion";
import { Radio, Focus, Eye, Wifi, XCircle, Scan } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ActiveUser, activityConfig } from "./constants";

interface LiveMonitoringTabProps {
   filteredUsers: ActiveUser[];
   loading: boolean;
   viewMode: "grid" | "list";
   filter: 'all' | 'exam' | 'study' | 'online';
   setFilter: (filter: 'all' | 'exam' | 'study' | 'online') => void;
   handleTerminateSession: (sessionId: string) => void;
}

export function LiveMonitoringTab({
   filteredUsers,
   loading,
   viewMode,
   filter,
   setFilter,
   handleTerminateSession,
}: LiveMonitoringTabProps) {
   return (
      <div className="space-y-6">
         {/* Activity Filter */}
         <div className="flex flex-wrap items-center gap-3">
            {(["all", "exam", "study", "online"] as const).map((v) => (
               <Button
                  key={v}
                  variant={filter === v ? "default" : "outline"}
                  size="sm"
                  className={cn(
                     "rounded-xl h-9 text-xs font-bold",
                     filter === v && v === "exam" && "bg-red-500 hover:bg-red-600 text-white",
                     filter === v && v === "study" && "bg-green-500 hover:bg-green-600 text-white",
                     filter === v && v === "online" && "bg-blue-500 hover:bg-blue-600 text-white",
                  )}
                  onClick={() => setFilter(v)}
               >
                  {v === "all" && <Radio className="w-3 h-3 ml-1.5" />}
                  {v === "exam" && <Focus className="w-3 h-3 ml-1.5" />}
                  {v === "study" && <Eye className="w-3 h-3 ml-1.5" />}
                  {v === "online" && <Wifi className="w-3 h-3 ml-1.5" />}
                  {v === "all" ? "الكل" : v === "exam" ? "الامتحانات" : v === "study" ? "الدراسة" : "المتصلون"}
               </Button>
            ))}
         </div>

         {loading && filteredUsers.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground font-bold">جاري تحميل بيانات المراقبة...</div>
         ) : filteredUsers.length === 0 ? (
            <div className="text-center py-16">
               <Radio className="w-16 h-16 mx-auto mb-4 opacity-20" />
               <p className="font-bold text-lg">لا يوجد مستخدمين نشطين حالياً</p>
               <p className="text-sm text-muted-foreground mt-1">سيتم تحديث البيانات تلقائياً عند ظهور نشاط جديد</p>
            </div>
         ) : viewMode === "grid" ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
               <AnimatePresence>
                  {filteredUsers.map((user) => {
                     const cfg = activityConfig[user.currentActivity];
                     const Icon = cfg.icon;
                     return (
                        <m.div
                           key={user.userId}
                           layout
                           initial={{ opacity: 0, scale: 0.9 }}
                           animate={{ opacity: 1, scale: 1 }}
                           exit={{ opacity: 0 }}
                        >
                           <div className={cn(
                              "p-5 rounded-3xl relative overflow-hidden border-2 transition-all duration-300 h-full",
                              cfg.borderColor,
                              user.currentActivity === 'taking_exam' ? `${cfg.bgColor} shadow-[0_0_20px_rgba(239,68,68,0.3)]` : `${cfg.bgColor}`
                           )}>
                              <div className="flex justify-between items-start gap-3">
                                 <div className="flex items-center gap-3">
                                    <Avatar className="w-11 h-11 border-2 border-background shadow-sm rounded-xl">
                                       <AvatarFallback className="rounded-xl font-bold bg-primary/10 text-primary">
                                          {user.user.name?.substring(0, 2) || '??'}
                                       </AvatarFallback>
                                    </Avatar>
                                    <div>
                                       <h4 className={cn("font-bold text-sm", cfg.color)}>{user.user.name}</h4>
                                       <span className="text-[10px] text-muted-foreground font-medium">
                                          {user.user.role === 'STUDENT' ? 'طالب' :
                                             user.user.role === 'TEACHER' ? 'معلم' : 'إداري'}
                                       </span>
                                    </div>
                                 </div>
                                 <div className={cn("p-2 rounded-full", cfg.bgColor, cfg.color)}>
                                    <Icon className="w-4 h-4" />
                                 </div>
                              </div>

                              {user.activityDetails && (
                                 <div className="mt-4 space-y-1">
                                    <div className="text-[10px] font-bold flex items-center gap-1 text-muted-foreground">
                                       {user.currentActivity === 'taking_exam' ? (
                                          <>يؤدي امتحان: {user.activityDetails.exam?.title || 'امتحان'}</>
                                       ) : user.currentActivity === 'studying' ? (
                                          <>يدرس: {user.activityDetails.subject?.nameAr || user.activityDetails.subject?.name || 'مادة'}</>
                                       ) : (
                                          <>متصل بالمنصة</>
                                       )}
                                    </div>
                                    {user.activityDetails.duration && (
                                       <div className="flex justify-between text-[10px] font-bold text-muted-foreground">
                                          <span>المدة</span>
                                          <span>{user.activityDetails.duration} دقيقة</span>
                                       </div>
                                    )}
                                    {user.activityDetails.score !== undefined && (
                                       <div className="flex justify-between text-[10px] font-bold">
                                          <span>الدرجة</span>
                                          <span className={user.activityDetails.score >= 50 ? "text-green-500" : "text-red-500"}>
                                             {user.activityDetails.score}%
                                          </span>
                                       </div>
                                    )}
                                 </div>
                              )}

                              <div className="mt-4 pt-3 border-t border-border/30 flex gap-2">
                                 {user.sessionId && (
                                    <Button
                                       variant="ghost"
                                       size="sm"
                                       className="h-8 text-[10px] text-red-500 hover:bg-red-500/10 flex-1"
                                       onClick={() => handleTerminateSession(user.sessionId!)}
                                    >
                                       <XCircle className="w-3 h-3 ml-1" /> إنهاء
                                    </Button>
                                 )}
                                 <Button variant="ghost" size="sm" className="h-8 text-[10px] flex-1">
                                    <Scan className="w-3 h-3 ml-1" /> تفاصيل
                                 </Button>
                              </div>
                           </div>
                        </m.div>
                     );
                  })}
               </AnimatePresence>
            </div>
         ) : (
            /* List View */
            <div className="p-0 overflow-hidden">
               <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                     <thead className="bg-accent/20 border-b border-border">
                        <tr>
                           <th className="p-4 text-right font-bold text-xs">المستخدم</th>
                           <th className="p-4 text-right font-bold text-xs">النشاط</th>
                           <th className="p-4 text-right font-bold text-xs">التفاصيل</th>
                           <th className="p-4 text-right font-bold text-xs">آخر تواجد</th>
                           <th className="p-4 text-right font-bold text-xs">الإجراءات</th>
                        </tr>
                     </thead>
                     <tbody>
                        {filteredUsers.map((user) => {
                           const cfg = activityConfig[user.currentActivity];
                           return (
                              <tr key={user.userId} className="border-b border-border/50 hover:bg-accent/5">
                                 <td className="p-4">
                                    <div className="flex items-center gap-3">
                                       <Avatar className="w-9 h-9 rounded-xl">
                                          <AvatarFallback className="rounded-xl font-bold text-xs">
                                             {user.user.name?.substring(0, 2) || '??'}
                                          </AvatarFallback>
                                       </Avatar>
                                       <div>
                                          <p className="font-bold text-xs">{user.user.name}</p>
                                          <span className="text-[10px] text-muted-foreground">{user.user.email}</span>
                                       </div>
                                    </div>
                                 </td>
                                 <td className="p-4">
                                    <Badge className={cn("border-0 text-[10px] font-black", cfg.bgColor, cfg.color)}>
                                       {cfg.label}
                                    </Badge>
                                 </td>
                                 <td className="p-4 text-xs opacity-70">
                                    {user.activityDetails?.exam?.title || user.activityDetails?.subject?.nameAr || "---"}
                                 </td>
                                 <td className="p-4 text-xs font-mono">
                                    {(() => {
                                       const dateValue = new Date(user.lastAccessed);
                                       return isNaN(dateValue.getTime()) ? "---" : formatDistanceToNow(dateValue, { addSuffix: true });
                                    })()}
                                 </td>
                                 <td className="p-4">
                                    {user.sessionId && (
                                       <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-7 text-[10px] text-red-500 hover:bg-red-500/10"
                                          onClick={() => handleTerminateSession(user.sessionId!)}
                                       >
                                          <XCircle className="w-3 h-3 ml-1" /> إنهاء
                                       </Button>
                                    )}
                                 </td>
                              </tr>
                           );
                        })}
                     </tbody>
                  </table>
               </div>
            </div>
         )}
      </div>
   );
}