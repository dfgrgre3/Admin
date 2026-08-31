"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { AdminUserListItem } from "@/lib/api/admin-users-api";
import type { ColumnDef } from "@tanstack/react-table";

export const userInfoColumn: ColumnDef<AdminUserListItem> = {
  accessorKey: "name",
  header: "المستخدم",
  cell: ({ row }) => {
    const user = row.original;
    return (
      <div className="flex items-center gap-3">
        <div className="relative">
          <Avatar className="h-10 w-10 border-2 border-primary/20">
            <AvatarImage src={user.avatar || ""} />
            <AvatarFallback className="font-bold bg-primary/10 text-primary">
              {user.name?.charAt(0) || user.username?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <span
            className={`absolute -bottom-0.5 -left-0.5 h-3 w-3 rounded-full border-2 border-background ${
              user.isOnline ? "bg-emerald-500" : "bg-muted-foreground/40"
            }`}
            title={user.isOnline ? "متصل الآن" : "غير متصل"}
          />
        </div>
        <div>
          <p className="font-black text-sm tracking-tight">{user.name || user.username || "بدون اسم"}</p>
          <p className="text-[10px] text-muted-foreground font-bold opacity-60 italic" dir="ltr">{user.email}</p>
          {user.username && <p className="text-[10px] text-muted-foreground font-bold">@{user.username}</p>}
        </div>
      </div>
    );
  },
};