"use client";

/**
 * لوحة المجموعات المحفوظة (Collections) — إنشاء، إعادة تسمية،
 * حذف، وفتح طلب محفوظ في المحرر.
 */

import * as React from "react";
import {
  FolderPlus,
  Trash2,
  Edit3,
  Check,
  X,
  Bookmark,
  Play,
  Inbox,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { RequestDraft, SavedCollection } from "../_types/api-explorer";

interface CollectionsPanelProps {
  collections: SavedCollection[];
  onCreate: (name: string) => void;
  onRemove: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onRemoveRequest: (collectionId: string, requestId: string) => void;
  onOpenRequest: (request: RequestDraft) => void;
}

function colorClasses(color?: string): string {
  switch (color) {
    case "blue":
      return "bg-blue-500/15 text-blue-300 border-blue-500/30";
    case "violet":
      return "bg-violet-500/15 text-violet-300 border-violet-500/30";
    case "emerald":
      return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
    case "amber":
      return "bg-amber-500/15 text-amber-300 border-amber-500/30";
    case "rose":
      return "bg-rose-500/15 text-rose-300 border-rose-500/30";
    default:
      return "bg-slate-500/15 text-slate-300 border-slate-500/30";
  }
}

export function CollectionsPanel({
  collections,
  onCreate,
  onRemove,
  onRename,
  onRemoveRequest,
  onOpenRequest,
}: CollectionsPanelProps): React.ReactElement {
  const [newName, setNewName] = React.useState("");
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editingName, setEditingName] = React.useState("");

  const submitCreate = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    onCreate(trimmed);
    setNewName("");
    toast.success("تم إنشاء المجموعة");
  };

  if (collections.length === 0) {
    return (
      <div className="space-y-3" dir="rtl">
        <div className="flex items-center gap-2">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submitCreate();
            }}
            placeholder="اسم مجموعة جديدة…"
            className="h-9 flex-1 rounded-lg border-white/10 bg-white/5 text-sm"
          />
          <Button
            type="button"
            size="sm"
            onClick={submitCreate}
            disabled={!newName.trim()}
            className="h-9 gap-1 rounded-lg"
          >
            <FolderPlus className="h-3.5 w-3.5" />
            إنشاء
          </Button>
        </div>
        <EmptyState
          title="لا توجد مجموعات"
          description="قم بتجميع الطلبات المتشابهة في مجموعات لتسهيل إعادة استخدامها."
          icon={Inbox}
          className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] py-8"
        />
      </div>
    );
  }

  return (
    <div className="space-y-3" dir="rtl">
      <div className="flex items-center gap-2">
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submitCreate();
          }}
          placeholder="اسم مجموعة جديدة…"
          className="h-9 flex-1 rounded-lg border-white/10 bg-white/5 text-sm"
        />
        <Button
          type="button"
          size="sm"
          onClick={submitCreate}
          disabled={!newName.trim()}
          className="h-9 gap-1 rounded-lg"
        >
          <FolderPlus className="h-3.5 w-3.5" />
          إنشاء
        </Button>
      </div>

      <ul className="space-y-2">
        {collections.map((c) => {
          const isEditing = editingId === c.id;
          return (
            <li
              key={c.id}
              className="rounded-2xl border border-white/5 bg-white/[0.03] p-3"
            >
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={cn("h-5 border px-1.5 text-[10px]", colorClasses(c.color))}>
                  <Bookmark className="ms-1 h-3 w-3" />
                  {c.requests.length}
                </Badge>
                {isEditing ? (
                  <>
                    <Input
                      autoFocus
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && editingName.trim()) {
                          onRename(c.id, editingName.trim());
                          setEditingId(null);
                        }
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      className="h-7 flex-1 rounded-lg border-white/10 bg-white/5 text-xs"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (editingName.trim()) {
                          onRename(c.id, editingName.trim());
                          setEditingId(null);
                        }
                      }}
                      className="h-7 w-7 text-emerald-400"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingId(null)}
                      className="h-7 w-7"
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 truncate text-sm font-bold">{c.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingId(c.id);
                        setEditingName(c.name);
                      }}
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemove(c.id)}
                      className="h-7 w-7 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </>
                )}
              </div>

              {c.description ? (
                <p className="mt-1 text-[11px] text-muted-foreground">{c.description}</p>
              ) : null}

              {c.requests.length > 0 ? (
                <ul className="mt-2 space-y-1 border-t border-white/5 pt-2">
                  {c.requests.map((r) => (
                    <li
                      key={r.id}
                      className="group flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs hover:bg-white/5"
                    >
                      <span className="rounded-md bg-white/10 px-1.5 py-0.5 font-mono text-[10px] font-black">
                        {r.method}
                      </span>
                      <span className="flex-1 truncate font-mono text-[11px]" dir="ltr">
                        {r.url}
                      </span>
                      <button
                        type="button"
                        onClick={() => onOpenRequest(r)}
                        className="rounded-md p-1 text-muted-foreground hover:bg-primary/15 hover:text-primary"
                        title="تحميل في المحرر"
                      >
                        <Play className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemoveRequest(c.id, r.id)}
                        className="rounded-md p-1 text-rose-400 opacity-0 transition-opacity hover:bg-rose-500/10 group-hover:opacity-100"
                        title="حذف من المجموعة"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
