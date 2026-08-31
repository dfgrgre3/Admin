"use client";

import { Copy } from "lucide-react";
import type { UserDetails } from "./types";

interface ProfileUserIdProps {
  user: UserDetails;
  onCopy: (text: string, label: string) => void;
}

export function ProfileUserId({ user, onCopy }: ProfileUserIdProps) {
  return (
    <button
      className="mt-4 w-full flex items-center justify-center gap-2 text-[9px] text-muted-foreground/60 hover:text-muted-foreground font-mono transition-colors group/id"
      onClick={() => onCopy(user.id, "معرف المستخدم")}
    >
      <span>ID: {user.id}</span>
      <Copy className="h-2.5 w-2.5 opacity-0 group-hover/id:opacity-70 transition-opacity" />
    </button>
  );
}