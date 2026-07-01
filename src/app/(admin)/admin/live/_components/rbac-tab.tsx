import React from "react";
import { AdminCard } from "@/components/admin/ui/admin-card";
import { Badge } from "@/components/ui/badge";
import { KeyRound, UserCog } from "lucide-react";
import { RolePermission } from "./constants";

interface RBACTabProps {
   roles: RolePermission[];
   rolesLoading: boolean;
}

export function RBACTab({ roles, rolesLoading }: RBACTabProps) {
   return (
      <div className="space-y-6">
         <AdminCard variant="glass" className="bg-gradient-to-l from-emerald-500/10 to-transparent border-emerald-500/30 p-6">
            <div className="flex items-start gap-4">
               <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500">
                  <KeyRound className="w-8 h-8" />
               </div>
               <div>
                  <h3 className="text-xl font-black text-emerald-500">الصلاحيات الجزئية (Granular RBAC)</h3>
                  <p className="text-sm font-bold mt-2 max-w-3xl text-muted-foreground">
                     صناعة وتخصيص أدوار دقيقة للموظفين والمعلمين. لا تعطى الصلاحية الكاملة لأحد.
                     حدد من يقرأ، ومن يضيف، ومن يمسح، ومن يعدل الأسعار.
                  </p>
               </div>
            </div>
         </AdminCard>

         {rolesLoading ? (
            <div className="text-center py-10 text-muted-foreground font-bold">جاري تحميل الأدوار...</div>
         ) : roles.length === 0 ? (
            <AdminCard variant="glass" className="text-center py-16">
               <UserCog className="w-16 h-16 mx-auto mb-4 opacity-20" />
               <p className="font-bold text-lg">لا توجد أدوار مخصصة بعد</p>
            </AdminCard>
         ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
               {roles.map((role) => (
                  <AdminCard key={role.id} variant="glass" className="p-6 hover:border-primary/30 transition-all">
                     <div className="flex items-start justify-between mb-4">
                        <div>
                           <h4 className="font-black text-lg">{role.name}</h4>
                           <p className="text-xs text-muted-foreground mt-1">{role.description}</p>
                        </div>
                        <Badge className="bg-primary/15 text-primary border-primary/20 border-0">
                           {role.userCount} مستخدم
                        </Badge>
                     </div>
                     <div className="space-y-2">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">الصلاحيات:</p>
                        <div className="flex flex-wrap gap-1.5">
                                 {role.permissions.map((perm) => (
                                    <Badge key={perm} variant="outline" className="text-[9px] font-bold border-white/10">
                                       {perm}
                                    </Badge>
                                 ))}
                        </div>
                     </div>
                  </AdminCard>
               ))}
            </div>
         )}
      </div>
   );
}