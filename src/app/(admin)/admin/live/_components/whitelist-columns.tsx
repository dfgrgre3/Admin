import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Edit, Trash2 } from "lucide-react";
import { IPWhitelistEntry } from "./constants";

export const whitelistColumns: ColumnDef<IPWhitelistEntry>[] = [
   {
      accessorKey: "ip",
      header: "عنوان IP",
      cell: ({ row }) => (
         <code className="text-xs bg-white/5 px-2 py-0.5 rounded-md font-mono font-bold" dir="ltr">
            {row.original.ip}
         </code>
      ),
   },
   {
      accessorKey: "label",
      header: "الوصف",
      cell: ({ row }) => <span className="font-bold text-xs">{row.original.label || "---"}</span>,
   },
   {
      accessorKey: "createdAt",
      header: "تاريخ الإضافة",
      cell: ({ row }) => (
         <div className="text-xs font-bold">
            {new Date(row.original.createdAt).toLocaleDateString("ar-EG")}
         </div>
      ),
   },
   {
      accessorKey: "isActive",
      header: "الحالة",
      cell: ({ row }) => (
         <Badge
            className={cn(
               "border-0 text-[10px] font-black",
               row.original.isActive ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500",
            )}
         >
            {row.original.isActive ? "مفعل" : "معطل"}
         </Badge>
      ),
   },
   {
      id: "actions",
      header: "إجراءات",
      cell: () => (
         <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-8 text-[10px]" aria-label="تعديل عنوان IP">
               <Edit className="w-3 h-3" />
            </Button>
            <Button
               variant="ghost"
               size="sm"
               className="h-8 text-[10px] text-red-500 hover:text-red-600"
               aria-label="حذف عنوان IP"
            >
               <Trash2 className="w-3 h-3" />
            </Button>
         </div>
      ),
   },
];
