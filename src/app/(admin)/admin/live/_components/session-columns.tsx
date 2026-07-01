import { ColumnDef } from "@tanstack/react-table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { MapPin, Smartphone, XCircle } from "lucide-react";
import { Session } from "./constants";

export const sessionColumns = (onRevokeSession: (sessionId: string) => void): ColumnDef<Session>[] => [
   {
      accessorKey: "user",
      header: "المستخدم",
      cell: ({ row }) => {
         const session = row.original;
         const userName = session.user?.name || "غير معروف";

         return (
            <div className="flex items-center gap-3">
               <Avatar className="h-9 w-9 rounded-xl border-2 border-white/10">
                  <AvatarFallback className="rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-xs">
                     {userName.charAt(0)}
                  </AvatarFallback>
               </Avatar>
               <div>
                  <p className="font-bold text-xs">{userName}</p>
                  <p className="text-[10px] text-muted-foreground">{session.user?.email || ""}</p>
               </div>
            </div>
         );
      },
   },
   {
      accessorKey: "ip",
      header: "IP",
      cell: ({ row }) => (
         <code className="text-[10px] bg-white/5 px-2 py-0.5 rounded-md font-mono font-bold" dir="ltr">
            {row.original.ip}
         </code>
      ),
   },
   {
      accessorKey: "deviceInfo",
      header: "الجهاز",
      cell: ({ row }) => (
         <div className="flex items-center gap-1.5 text-xs font-medium opacity-70">
            <Smartphone className="w-3 h-3" />
            <span className="truncate max-w-[120px]">
               {row.original.deviceInfo || row.original.userAgent?.slice(0, 30) || "---"}
            </span>
         </div>
      ),
   },
   {
      accessorKey: "location",
      header: "الموقع",
      cell: ({ row }) => (
         <div className="flex items-center gap-1.5 text-xs font-medium opacity-70">
            <MapPin className="w-3 h-3" />
            <span>{row.original.location || "غير معروف"}</span>
         </div>
      ),
   },
   {
      accessorKey: "lastAccessed",
      header: "آخر نشاط",
      cell: ({ row }) => {
         const dateValue = new Date(row.original.lastAccessed);

         if (Number.isNaN(dateValue.getTime())) {
            return <div className="text-[11px] font-bold text-gray-400">لا يوجد نشاط مسجل</div>;
         }

         return <div className="text-[11px] font-bold">{formatDistanceToNow(dateValue, { addSuffix: true })}</div>;
      },
   },
   {
      accessorKey: "status",
      header: "الحالة",
      cell: ({ row }) => {
         const isActive = row.original.isActive;

         return (
            <Badge
               className={cn(
                  "border-0 text-[10px] font-black",
                  isActive ? "bg-green-500/20 text-green-500" : "bg-gray-500/20 text-gray-500",
               )}
            >
               {isActive ? "نشط" : "منتهي"}
            </Badge>
         );
      },
   },
   {
      id: "actions",
      header: "إجراءات",
      cell: ({ row }) => (
         <div className="flex items-center gap-1">
            {row.original.isActive && (
               <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-[10px] text-red-500 hover:text-red-600 hover:bg-red-500/10"
                  onClick={() => onRevokeSession(row.original.id)}
               >
                  <XCircle className="w-3 h-3 ml-1" />
                  إنهاء
               </Button>
            )}
         </div>
      ),
   },
];
