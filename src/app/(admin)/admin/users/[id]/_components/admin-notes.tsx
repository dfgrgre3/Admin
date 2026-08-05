"use client";

import type { AdminNote } from "./types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { StickyNote, Plus, Trash2, MessageSquare, User, Pencil, Check, X } from "lucide-react";
import { format, isValid } from "date-fns";
import { ar } from "date-fns/locale";
import * as React from "react";
import { toast } from "sonner";
import { adminFetch } from "@/lib/api/admin-api";

interface AdminNotesProps {
  notes: AdminNote[];
  userId: string;
}

export function AdminNotes({ notes, userId }: AdminNotesProps) {
  const [localNotes, setLocalNotes] = React.useState<AdminNote[]>(notes || []);
  const [newNote, setNewNote] = React.useState("");
  const [isAdding, setIsAdding] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editingContent, setEditingContent] = React.useState("");

  const handleAddNote = async () => {
    if (!newNote.trim()) {
      toast.error("يرجى كتابة محتوى الملاحظة");
      return;
    }

    setIsAdding(true);
    try {
      const response = await adminFetch(`/admin/users/${userId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newNote.trim() })
      });

      if (response.ok) {
        const createdNote = await response.json();
        setLocalNotes(prev => [createdNote, ...prev]);
        setNewNote("");
        toast.success("تم إضافة الملاحظة بنجاح");
      } else throw new Error();
    } catch {
      toast.error("فشل حفظ الملاحظة");
    } finally {
      setIsAdding(false);
    }
  };

  const handleUpdateNote = async (noteId: string) => {
    if (!editingContent.trim()) return;
    const response = await adminFetch(`/admin/users/${userId}/notes/${noteId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: editingContent.trim() }),
    });
    if (!response.ok) return toast.error("فشل تعديل الملاحظة");
    const payload = await response.json().catch(() => null);
    setLocalNotes((prev) => prev.map((note) => note.id === noteId
      ? { ...note, ...(payload?.data || payload || {}), content: editingContent.trim(), updatedAt: new Date().toISOString() }
      : note));
    setEditingId(null);
    setEditingContent("");
    toast.success("تم تعديل الملاحظة وتسجيل التغيير");
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      const response = await adminFetch(`/admin/users/${userId}/notes/${noteId}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        toast.error("حدث خطأ أثناء حذف الملاحظة");
      } else {
        setLocalNotes(prev => prev.filter(n => n.id !== noteId));
      }
    } catch {
      toast.error("حدث خطأ في الاتصال بالخادم");
    }
  };

  return (
    <Card className="border-none shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <StickyNote className="h-5 w-5 text-primary" />
          ملاحظات المسؤول
        </CardTitle>
        <CardDescription>أضف ملاحظات داخلية حول هذا المستخدم (تظهر للمسؤولين فقط)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Note Input */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <MessageSquare className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
            <textarea
              className="w-full min-h-[80px] pr-10 rounded-xl border bg-muted/50 p-3 text-sm focus:ring-2 ring-primary/20 outline-none transition-all resize-none"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="اكتب ملاحظة جديدة..."
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  handleAddNote();
                }
              }}
            />
          </div>
          <Button
            className="rounded-xl self-start"
            size="icon"
            aria-label="إضافة ملاحظة"
            onClick={handleAddNote}
            disabled={isAdding || !newNote.trim()}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <Separator />

        {/* Notes List */}
        {localNotes.length > 0 ? (
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {localNotes.map((note) => (
              <div
                key={note.id}
                className="group relative p-4 rounded-2xl bg-muted/30 border border-transparent hover:border-primary/10 hover:bg-muted/50 transition-all">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {editingId === note.id ? <textarea className="w-full rounded-xl border bg-background p-2 text-sm" value={editingContent} onChange={(e) => setEditingContent(e.target.value)} /> : <p className="text-sm leading-relaxed whitespace-pre-wrap">{note.content}</p>}
                  </div>
                  {editingId === note.id ? <div className="flex"><Button variant="ghost" size="icon" onClick={() => handleUpdateNote(note.id)}><Check className="h-4 w-4" /></Button><Button variant="ghost" size="icon" onClick={() => setEditingId(null)}><X className="h-4 w-4" /></Button></div> : <><Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100" onClick={() => { setEditingId(note.id); setEditingContent(note.content); }}><Pencil className="h-4 w-4" /></Button><Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-full text-muted-foreground hover:text-danger"
                    onClick={() => handleDeleteNote(note.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button></>}
                </div>
                <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {note.createdBy}
                  </span>
                  <span>
                    {note.createdAt && isValid(new Date(note.createdAt))
                      ? format(new Date(note.createdAt), "d MMM yyyy HH:mm", { locale: ar })
                      : "-"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <StickyNote className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">لا توجد ملاحظات بعد</p>
            <p className="text-xs mt-1">أضف ملاحظة للمساعدة في تتبع هذا المستخدم</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
