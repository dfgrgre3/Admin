"use client";

import { Edit, Eye } from "lucide-react";
import {
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";

interface ViewEditActionsProps {
  userId: string;
  canUpdateUsers: boolean;
  isDeleted: boolean;
}

export function ViewEditActions({ userId, canUpdateUsers, isDeleted }: ViewEditActionsProps) {
  const router = useRouter();
  return (
    <>
      <DropdownMenuItem onClick={() => router.push(`/admin/users/${userId}`)}>
        <Eye className="ml-2 h-4 w-4" />
        عرض التفاصيل
      </DropdownMenuItem>
      {canUpdateUsers && !isDeleted && (
        <DropdownMenuItem onClick={() => router.push(`/admin/users/${userId}/edit`)}>
          <Edit className="ml-2 h-4 w-4" />
          تعديل
        </DropdownMenuItem>
      )}
    </>
  );
}