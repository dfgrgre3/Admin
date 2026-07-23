"use client";

import * as React from "react";
import { AdminCard } from "@/components/admin/ui/admin-card";
import { Badge } from "@/components/ui/badge";
import { FileText, Clock, User, Edit2, Trash2, Plus } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Note {
  id: string;
  content: string;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  category?: string;
  isPrivate: boolean;
}

interface UserNotesTabProps {
  userId: string;
}

export function UserNotesTab({ userId }: UserNotesTabProps) {
  const [notes, setNotes] = React.useState<Note[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [newNote, setNewNote] = React.useState("");
  const [category, setCategory] = React.useState("general");
  const [isPrivate, setIsPrivate] = React.useState(true);

  React.useEffect(() => {
    // TODO: Fetch notes from API
    setLoading(false);
  }, [userId]);

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    // TODO: Add note via API
    setNewNote("");
  };

  if (loading) {
    return (
      <AdminCard variant="glass" className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-white/5 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-white/5 rounded-xl"></div>
            ))}
          </div>
        </div>
      </AdminCard>
    );
  }

  return (
    <div className="space-y-4">
      {/* Add Note Form */}
      <AdminCard variant="glass" className="p-6">
        <h3 className="text-xl font-black mb-4 flex items-center gap-2">
          <Plus className="h-5 w-5" />
          إضافة ملاحظة جديدة
        </h3>
        <div className="space-y-3">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="اكتب ملاحظة هنا..."
            className="w-full h-24 p-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-muted-foreground focus:ring-2 ring-primary outline-none resize-none"
          />
          <div className="flex items-center gap-3">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="h-10 px-3 rounded-xl bg-white/5 border border-white/10 text-white"
            >
              <option value="general">عام</option>
              <option value="important">مهم</option>
              <option value="warning">تحذير</option>
              <option value="follow_up">متابعة</option>
            </select>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="rounded"
              />
              <span>خاص</span>
            </label>
            <button
              onClick={handleAddNote}
              className="mr-auto px-4 py-2 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all"
            >
              إضافة
            </button>
          </div>
        </div>
      </AdminCard>

      {/* Notes List */}
      <AdminCard variant="glass" className="p-6">
        <h3 className="text-xl font-black mb-4">الملاحظات الداخلية</h3>
        {notes.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">لا توجد ملاحظات بعد</p>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <div
                key={note.id}
                className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-primary/20 transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <Badge variant={note.isPrivate ? "secondary" : "outline"}>
                      {note.isPrivate ? "خاص" : "عام"}
                    </Badge>
                    {note.category && (
                      <Badge variant="outline">{note.category}</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-1 hover:bg-white/10 rounded-lg transition-all">
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button className="p-1 hover:bg-red-500/10 text-red-500 rounded-lg transition-all">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <p className="text-white mb-3">{note.content}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {note.createdBy}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDate(note.createdAt)}
                  </span>
                  {note.updatedAt && (
                    <span>• محدّث: {formatDate(note.updatedAt)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminCard>
    </div>
  );
}