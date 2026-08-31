"use client";

import { AdminBadge } from "@/components/admin/ui/admin-badge";
import { AlertTriangle, Ban } from "lucide-react";
import {
  roleLabels,
  resolveGradeLabel,
  statusLabels,
  statusColors,
} from "./types";
import type { UserDetails } from "./types";

interface ProfileBadgesProps {
  user: UserDetails;
}

export function ProfileBadges({ user }: ProfileBadgesProps) {
  return (
    <div className="mt-5 flex flex-wrap justify-center gap-2">
      <AdminBadge
        color={user.role === "ADMIN" ? "red" : user.role === "TEACHER" ? "blue" : "green"}
        variant="solid"
        className="px-4 py-1.5 rounded-full font-black uppercase tracking-widest text-[10px]"
      >
        {roleLabels[user.role] || user.role}
      </AdminBadge>
      {user.gradeLevel && (
        <AdminBadge
          color="purple"
          variant="outline"
          className="px-4 py-1.5 rounded-full font-black text-[10px] border-white/10"
        >
          {resolveGradeLabel(user.gradeLevel)}
        </AdminBadge>
      )}
      {user.status && user.status !== "ACTIVE" && (
        <span
          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black border ${statusColors[user.status] || ""}`}
        >
          {user.status === "SUSPENDED" ? (
            <AlertTriangle className="h-3 w-3" />
          ) : (
            <Ban className="h-3 w-3" />
          )}
          {statusLabels[user.status] || user.status}
        </span>
      )}
    </div>
  );
}