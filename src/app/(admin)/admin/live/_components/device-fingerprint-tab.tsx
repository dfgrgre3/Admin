import React from "react";
import { AdminCard } from "@/components/admin/ui/admin-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Fingerprint, Ban, Unlock, CheckCircle2 } from "lucide-react";
import { DeviceFingerprint } from "./constants";

interface DeviceFingerprintTabProps {
   fingerprints: DeviceFingerprint[];
   fingerprintsLoading: boolean;
   blockDeviceMutation: {
      mutate: (data: { fingerprintId: string; reason: string }) => void;
   };
   unblockDeviceMutation: {
      mutate: (fingerprintId: string) => void;
   };
   setSelectedDevice: (device: DeviceFingerprint | null) => void;
   setBlockDialogOpen: (open: boolean) => void;
}

export function DeviceFingerprintTab({
   fingerprints,
   fingerprintsLoading,
   blockDeviceMutation,
   unblockDeviceMutation,
   setSelectedDevice,
   setBlockDialogOpen,
}: DeviceFingerprintTabProps) {
   return (
      <div className="space-y-6">
         <AdminCard variant="glass" className="bg-gradient-to-l from-purple-500/10 to-transparent border-purple-500/30 p-6">
            <div className="flex items-start gap-4">
               <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-500">
                  <Fingerprint className="w-8 h-8" />
               </div>
               <div>
                  <h3 className="text-xl font-black text-purple-500">إدارة بصمة الأجهزة (Device Fingerprinting)</h3>
                  <p className="text-sm font-bold mt-2 max-w-3xl text-muted-foreground">
                     يمنع هذا المحرك مشاركة الحسابات باستخدام تقنيات مطابقة معلومات المتصفح، الـ IP، والموقع الجغرافي.
                     إذا تم رصد أجهزة متناقضة تعمل في نفس الوقت، سيتم اتخاذ إجراء تلقائي.
                  </p>
               </div>
            </div>
         </AdminCard>

         {fingerprintsLoading ? (
            <div className="text-center py-10 text-muted-foreground font-bold">جاري تحميل بصمات الأجهزة...</div>
         ) : fingerprints.length === 0 ? (
            <AdminCard variant="glass" className="text-center py-16">
               <Fingerprint className="w-16 h-16 mx-auto mb-4 opacity-20" />
               <p className="font-bold text-lg">لا توجد بصمات أجهزة مسجلة بعد</p>
            </AdminCard>
         ) : (
            <AdminCard variant="glass" className="p-0 overflow-hidden border border-white/10">
               <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                     <thead className="bg-accent/20 border-b border-border">
                        <tr>
                           <th className="p-4 text-right font-bold text-xs">المستخدم</th>
                           <th className="p-4 text-right font-bold text-xs">الجهاز</th>
                           <th className="p-4 text-right font-bold text-xs">العنوان IP</th>
                           <th className="p-4 text-right font-bold text-xs">آخر ظهور</th>
                           <th className="p-4 text-right font-bold text-xs">عدد الدخول</th>
                           <th className="p-4 text-right font-bold text-xs">الحالة</th>
                           <th className="p-4 text-right font-bold text-xs">الإجراءات</th>
                        </tr>
                     </thead>
                     <tbody>
                        {fingerprints.map((device) => (
                           <tr key={device.id} className="border-b border-border/30 hover:bg-accent/5 transition-colors">
                              <td className="p-4 font-bold text-sm">{device.userName}</td>
                              <td className="p-4">
                                 <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium truncate max-w-[120px]">{device.deviceType}</span>
                                 </div>
                              </td>
                              <td className="p-4">
                                 <code className="text-[10px] bg-white/5 px-2 py-0.5 rounded font-mono" dir="ltr">
                                    {device.ip}
                                 </code>
                              </td>
                              <td className="p-4 text-xs">
                                 {(() => {
                                    const dateValue = new Date(device.lastSeen);
                                    return isNaN(dateValue.getTime()) ? "---" : new Date(device.lastSeen).toLocaleDateString("ar-EG");
                                 })()}
                              </td>
                              <td className="p-4">
                                 <Badge variant="outline" className="font-bold text-xs">{device.loginCount}</Badge>
                              </td>
                              <td className="p-4">
                                 {device.isBlocked ? (
                                    <Badge className="bg-red-500/15 text-red-500 border-red-500/20 border-0">
                                       <Ban className="w-3 h-3 ml-1" /> محظور
                                    </Badge>
                                 ) : (
                                    <Badge className="bg-green-500/15 text-green-500 border-green-500/20 border-0">
                                       <CheckCircle2 className="w-3 h-3 ml-1" /> نشط
                                    </Badge>
                                 )}
                              </td>
                              <td className="p-4">
                                 {device.isBlocked ? (
                                    <Button
                                       variant="ghost"
                                       size="sm"
                                       className="h-8 text-[10px] text-green-500 hover:bg-green-500/10"
                                       onClick={() => unblockDeviceMutation.mutate(device.id)}
                                    >
                                       <Unlock className="w-3 h-3 ml-1" /> إلغاء الحظر
                                    </Button>
                                 ) : (
                                    <Button
                                       variant="ghost"
                                       size="sm"
                                       className="h-8 text-[10px] text-red-500 hover:bg-red-500/10"
                                       onClick={() => {
                                          setSelectedDevice(device);
                                          setBlockDialogOpen(true);
                                       }}
                                    >
                                       <Ban className="w-3 h-3 ml-1" /> حظر
                                    </Button>
                                 )}
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </AdminCard>
         )}
      </div>
   );
}