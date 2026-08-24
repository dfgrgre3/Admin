"use client";

import React, { useState, useCallback, useEffect } from "react";
import {
  Link2,
  Unlink2,
  Search,
  Loader2,
  AlertCircle,
  CheckCircle,
  FileText,
  Clock,
  HelpCircle,
  Calendar,
  Trash2,
} from "lucide-react";
import { useCourseBuilder } from "../hooks";
import type { Assignment, Lesson } from "../types";
import { Section, Button, Badge, Input, Table, TableHeader, TableBody, TableRow, TableCell, TableHead, EmptyState, Alert } from "../ui";

interface AssignmentsStepProps {
  draft: any;
  lessons: Lesson[];
  onChange: (data: Partial<any>) => void;
  isDirty: boolean;
}

export const AssignmentsStep: React.FC<AssignmentsStepProps> = ({
  draft,
  lessons,
  onChange,
  isDirty,
}) => {
  const {
    assignments,
    loadAssignments,
    createAssignment,
    deleteAssignment,
    linkAssignment,
    unlinkAssignment,
    isLoading,
    error,
    clearError,
  } = useCourseBuilder({ courseId: draft?.id });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLessonId, setSelectedLessonId] = useState<string>("");
  const [newTitle, setNewTitle] = useState("");
  const [newMaxScore, setNewMaxScore] = useState("100");
  const [newDueDate, setNewDueDate] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadAssignments(draft?.id);
  }, [draft?.id, loadAssignments]);

  // Only assignments not already linked to a lesson are offered for linking —
  // an assignment already linked must be unlinked first, so re-linking it to
  // a different lesson is always an explicit, visible action.
  const filteredAssignments = assignments.filter(a =>
    !a.lessonId && a.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = useCallback(async () => {
    if (!draft?.id || !newTitle.trim()) return;
    setIsCreating(true);
    try {
      const maxScore = Number(newMaxScore);
      await createAssignment(draft.id, {
        title: newTitle.trim(),
        maxScore: Number.isFinite(maxScore) && maxScore > 0 ? maxScore : undefined,
        dueDate: newDueDate ? Math.floor(new Date(newDueDate).getTime() / 1000) : undefined,
      });
      setNewTitle("");
      setNewMaxScore("100");
      setNewDueDate("");
    } catch (err) {
      console.error("Failed to create assignment:", err);
    } finally {
      setIsCreating(false);
    }
  }, [draft?.id, newTitle, newMaxScore, newDueDate, createAssignment]);

  const handleLink = useCallback(async (assignmentId: string) => {
    if (!selectedLessonId) {
      alert("يرجى اختيار درس أولاً");
      return;
    }
    if (!draft?.id) return;
    try {
      await linkAssignment(draft.id, assignmentId, selectedLessonId);
      onChange({ ...draft });
    } catch (err) {
      console.error("Failed to link assignment:", err);
    }
  }, [selectedLessonId, linkAssignment, draft, onChange]);

  const handleUnlink = useCallback(async (assignmentId: string) => {
    if (!confirm("هل أنت متأكد من فك ربط هذا الواجب؟")) return;
    if (!draft?.id) return;
    try {
      await unlinkAssignment(draft.id, assignmentId);
      onChange({ ...draft });
    } catch (err) {
      console.error("Failed to unlink assignment:", err);
    }
  }, [unlinkAssignment, draft, onChange]);

  const handleDelete = useCallback(async (assignmentId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الواجب نهائياً من قائمة الواجبات؟")) return;
    if (!draft?.id) return;
    try {
      await deleteAssignment(draft.id, assignmentId);
    } catch (err) {
      console.error("Failed to delete assignment:", err);
    }
  }, [deleteAssignment, draft?.id]);

  // Assignments that are currently linked to a lesson, resolved to that lesson.
  const linkedAssignments = assignments.filter(a => !!a.lessonId);
  const lessonById = new Map(lessons.map(l => [l.id, l]));
  
  return (
    <div className="space-y-6">
      <Section title="إدارة الواجبات" description="ربط وفك ربط الواجبات بالدروس" icon={<FileText className="w-5 h-5" />}>
        {error && (
          <Alert variant="destructive" onClose={clearError} className="mb-4">
            <AlertCircle className="w-4 h-4" />
            <span>{error.message}</span>
          </Alert>
        )}
        
        {isDirty && (
          <Alert variant="warning" className="mb-4">
            <AlertCircle className="w-4 h-4" />
            <span>لديك تغييرات غير محفوظة. سيتم الحفظ تلقائياً بعد التوقف عن الكتابة.</span>
          </Alert>
        )}
        
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Available Assignments */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                الواجبات المتاحة ({assignments.length})
              </h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="البحث في الواجبات..."
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Input
                placeholder="عنوان واجب جديد..."
                value={newTitle}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTitle(e.target.value)}
                className="flex-1 min-w-[200px]"
              />
              <Input
                type="number"
                min={1}
                placeholder="النقاط القصوى"
                value={newMaxScore}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewMaxScore(e.target.value)}
                className="w-32"
              />
              <Input
                type="date"
                value={newDueDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewDueDate(e.target.value)}
                className="w-40"
              />
              <Button onClick={handleCreate} disabled={isCreating || !newTitle.trim()}>
                {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : "إضافة واجب"}
              </Button>
            </div>

            {isLoading && assignments.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
              </div>
            ) : filteredAssignments.length === 0 ? (
              <EmptyState
                icon={<HelpCircle className="w-12 h-12 text-gray-300" />}
                title="لا توجد واجبات"
                description="أضف واجباً جديداً من الحقل أعلاه"
              />
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>الواجب</TableHead>
                      <TableHead>النقاط القصوى</TableHead>
                      <TableHead>تاريخ التسليم</TableHead>
                      <TableHead className="w-40">إجراء</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAssignments.map(assignment => (
                      <TableRow key={assignment.id}>
                        <TableCell>
                          <div className="font-medium text-gray-900 dark:text-white">{assignment.title}</div>
                          {assignment.description && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                              {assignment.description}
                            </p>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="font-medium">{assignment.maxScore}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          {assignment.dueDate ? (
                            <span className="flex items-center justify-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {new Date(assignment.dueDate).toLocaleDateString('ar-SA')}
                            </span>
                          ) : (
                            <span className="text-gray-400">غير محدد</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleLink(assignment.id)}
                              disabled={isLoading || !selectedLessonId}
                              className="flex-1"
                            >
                              <Link2 className="w-3.5 h-3.5" />
                              ربط
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(assignment.id)}
                              disabled={isLoading}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              aria-label="حذف الواجب"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
          
          {/* Linked Assignments */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              الواجبات المرتبطة ({linkedAssignments.length})
            </h3>

            {linkedAssignments.length === 0 ? (
              <EmptyState
                icon={<Unlink2 className="w-12 h-12 text-gray-300" />}
                title="لا توجد واجبات مرتبطة"
                description="اختر درساً وواجباً ثم اضغط 'ربط'"
                className="h-64"
              />
            ) : (
              <div className="space-y-3">
                {linkedAssignments.map(assignment => {
                  const lesson = assignment.lessonId ? lessonById.get(assignment.lessonId) : undefined;
                  return (
                    <div key={assignment.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900 dark:text-white">{assignment.title}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-700 dark:text-gray-300 truncate pr-2">
                          {lesson?.title || "درس غير معروف"}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleUnlink(assignment.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Unlink2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Lesson Selector */}
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            اختر الدرس للربط <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedLessonId}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedLessonId(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">-- اختر درساً --</option>
            {lessons.filter(l => l.type !== "INTERACTIVE_QUIZ").map(lesson => (
              <option key={lesson.id} value={lesson.id}>
                {lesson.title} ({lessonTypeLabels[lesson.type] || lesson.type})
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">اختر درساً أولاً، ثم اضغط 'ربط' بجانب الواجب المطلوب</p>
        </div>
      </Section>
    </div>
  );
};

const lessonTypeLabels: Record<string, string> = {
  VIDEO: "فيديو",
  TEXT: "نص/مقال",
  AUDIO: "صوت",
  FILE: "ملف",
  EXTERNAL_LINK: "رابط خارجي",
  INTERACTIVE_QUIZ: "اختبار تفاعلي",
};