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
  isDirty 
}) => {
  const {
    assignments,
    loadAssignments,
    linkAssignment,
    unlinkAssignment,
    isLoading,
    error,
    clearError,
  } = useCourseBuilder({ courseId: draft?.id });
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLessonId, setSelectedLessonId] = useState<string>("");
  
  useEffect(() => {
    loadAssignments(draft?.id);
  }, [draft?.id, loadAssignments]);
  
  const filteredAssignments = assignments.filter(a => 
    a.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleLink = useCallback(async (assignmentId: string) => {
    if (!selectedLessonId) {
      alert("يرجى اختيار درس أولاً");
      return;
    }
    try {
      await linkAssignment(selectedLessonId, assignmentId);
      onChange({ ...draft });
    } catch (err) {
      console.error("Failed to link assignment:", err);
    }
  }, [selectedLessonId, linkAssignment, draft, onChange]);
  
  const handleUnlink = useCallback(async (lessonId: string) => {
    if (!confirm("هل أنت متأكد من فك ربط هذا الواجب؟")) return;
    try {
      await unlinkAssignment(lessonId);
      onChange({ ...draft });
    } catch (err) {
      console.error("Failed to unlink assignment:", err);
    }
  }, [unlinkAssignment, draft, onChange]);
  
  // Find which lessons have assignments linked
  // Note: This would need backend support to track lesson-assignment links
  const lessonsWithAssignments = lessons.filter(l => false); // Placeholder
  
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
            
            {isLoading && assignments.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
              </div>
            ) : filteredAssignments.length === 0 ? (
              <EmptyState
                icon={<HelpCircle className="w-12 h-12 text-gray-300" />}
                title="لا توجد واجبات"
                description="لا توجد واجبات متاحة في النظام حالياً"
              />
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>الواجب</TableHead>
                      <TableHead>النقاط القصوى</TableHead>
                      <TableHead>تاريخ التسليم</TableHead>
                      <TableHead className="w-24">إجراء</TableHead>
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
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleLink(assignment.id)}
                            disabled={isLoading || !selectedLessonId}
                            className="w-full"
                          >
                            <Link2 className="w-3.5 h-3.5" />
                            ربط
                          </Button>
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
              الواجبات المرتبطة ({lessonsWithAssignments.length})
            </h3>
            
            {lessonsWithAssignments.length === 0 ? (
              <EmptyState
                icon={<Unlink2 className="w-12 h-12 text-gray-300" />}
                title="لا توجد واجبات مرتبطة"
                description="اختر درساً وواجباً ثم اضغط 'ربط'"
                className="h-64"
              />
            ) : (
              <div className="space-y-3">
                {lessonsWithAssignments.map(lesson => (
                  <div key={lesson.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900 dark:text-white">{lesson.title}</span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      لا توجد واجبات مرتبطة حالياً
                    </p>
                  </div>
                ))}
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

export default AssignmentsStep;