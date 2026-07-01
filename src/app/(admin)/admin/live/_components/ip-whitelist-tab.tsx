import React from "react";
import { AdminCard } from "@/components/admin/ui/admin-card";
import { AdminDataTable } from "@/components/admin/ui/admin-table";
import { Badge } from "@/components/ui/badge";
import { Shield, Ban } from "lucide-react";
import { IPWhitelistEntry } from "./constants";
import { whitelistColumns } from "./whitelist-columns";

interface IPWhitelistTabProps {
   whitelistEntries: IPWhitelistEntry[];
   whitelistLoading: boolean;
   whitelistedIPs: number;
}

export function IPWhitelistTab({
   whitelistEntries,
   whitelistLoading,
   whitelistedIPs,
}: IPWhitelistTabProps) {
   return (
      <div className="space-y-6">
         <AdminCard variant="glass" className="bg-gradient-to-l from-emerald-500/10 to-transparent border-emerald-500/30 p-6">
            <div className="flex items-start gap-4">
               <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500">
                  <Shield className="w-8 h-8" />
               </div>
               <div>
                  <h3 className="text-xl font-black text-emerald-500">القائمة البيضاء لعناوين IP</h3>
                  <p className="text-sm font-bold mt-2 max-w-3xl text-muted-foreground">
                     قم بإضافة عناوين IP الموثوقة التي يُسمح لها بالوصول إلى لوحة التحكم الإدارية.
                     أي محاولة وصول من عنوان غير موجود في القائمة سيتم حظرها تلقائياً.
                  </p>
               </div>
            </div>
         </AdminCard>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <AdminCard variant="glass" className="p-5 flex items-center gap-4 border-emerald-500/20">
               <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500"><Shield className="w-7 h-7" /></div>
               <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">عناوين مفعلة</p>
                  <h3 className="text-3xl font-black">{whitelistedIPs}</h3>
               </div>
            </AdminCard>
            <AdminCard variant="glass" className="p-5 flex items-center gap-4 border-red-500/20">
               <div className="p-3 bg-red-500/10 rounded-2xl text-red-500"><Ban className="w-7 h-7" /></div>
               <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">محاولات محظورة</p>
                  <h3 className="text-3xl font-black">0</h3>
               </div>
            </AdminCard>
            <AdminCard variant="glass" className="p-5 flex items-center gap-4 border-blue-500/20">
               <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500">
                  <Shield className="w-7 h-7" />
               </div>
               <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">إجمالي</p>
                  <h3 className="text-3xl font-black">{whitelistEntries.length}</h3>
               </div>
            </AdminCard>
         </div>

         <AdminCard variant="glass" className="p-1 rounded-[2.5rem] overflow-hidden border border-white/10">
            {whitelistLoading ? (
               <div className="p-8 text-center font-bold text-muted-foreground">جاري تحميل القائمة البيضاء...</div>
            ) : whitelistEntries.length === 0 ? (
               <div className="text-center py-16">
                  <Shield className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p className="font-bold text-lg">لا توجد عناوين في القائمة البيضاء</p>
                  <p className="text-sm text-muted-foreground mt-1">أضف عنوان IP للبدء</p>
               </div>
            ) : (
               <AdminDataTable
                  {...({ columns: whitelistColumns, data: whitelistEntries, searchKey: "ip", searchPlaceholder: "ابحث في القائمة البيضاء..." } as any)}
               />
            )}
         </AdminCard>
      </div>
   );
}