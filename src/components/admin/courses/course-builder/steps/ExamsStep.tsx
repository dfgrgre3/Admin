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
} from "lucide-react";
import { useCourseBuilder } from "../hooks";
import type { Exam, Lesson } from "../types";
import { Section, Button, Badge, Input, Table, TableHeader, TableBody, TableRow, TableCell, TableHead, EmptyState, Alert } from "../ui";

interface ExamsStepProps {
  draft: any;
  lessons: Lesson[];
  onChange: (data: Partial<any>) => void;
  isDirty: boolean;
}

export const ExamsStep: React.FC<ExamsStepProps> = ({ 
  draft, 
  lessons, 
  onChange, 
  isDirty 
}) => {
  const {
    exams,
    loadExams,
    linkExam,
    unlinkExam,
    isLoading,
    error,
    clearError,
  } = useCourseBuilder({ courseId: draft?.id });
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLessonId, setSelectedLessonId] = useState<string>("");
  
  useEffect(() => {
    loadExams(draft?.id);
  }, [draft?.id, loadExams]);
  
  const filteredExams = exams.filter(e => 
    e.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleLink = useCallback(async (examId: string) => {
    if (!selectedLessonId) {
      alert("يرجى اختيار درس أولاً");
      return;
    }
    try {
      await linkExam(selectedLessonId, examId);
      onChange({ ...draft });
    } catch (err) {
      console.error("Failed to link exam:", err);
    }
  }, [selectedLessonId, linkExam, draft, onChange]);
  
  const handleUnlink = useCallback(async (lessonId: string) => {
    if (!confirm("هل أنت متأكد من فك ربط هذا الاختبار؟")) return;
    try {
      await unlinkExam(lessonId);
      onChange({ ...draft });
    } catch (err) {
      console.error("Failed to unlink exam:", err);
    }
  }, [unlinkExam, draft, onChange]);
  
  // Find which lessons have exams linked
  const lessonsWithExams = lessons.filter(l => (l.quizzes?.length ?? 0) > 0);
  
  return (
    <div className="space-y-6">
      <Section title="إدارة الاختبارات" description="ربط وفك ربط الاختبارات بالدروس" icon={<FileText className="w-5 h-5" />}>
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
          {/* Available Exams */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                الاختبارات المتاحة ({exams.length})
              </h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="البحث في الاختبارات..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
            
            {isLoading && exams.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
              </div>
            ) : filteredExams.length === 0 ? (
              <EmptyState
                icon={<HelpCircle className="w-12 h-12 text-gray-300" />}
                title="لا توجد اختبارات"
                description="لا توجد اختبارات متاحة في النظام حالياً"
              />
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>الاختبار</TableHead>
                      <TableHead>النوع</TableHead>
                      <TableHead>الأسئلة</TableHead>
                      <TableHead>المدة</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead className="w-24">إجراء</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredExams.map(exam => (
                      <TableRow key={exam.id}>
                        <TableCell>
                          <div className="font-medium text-gray-900 dark:text-white">{exam.title}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{exam.type}</Badge>
                        </TableCell>
                        <TableCell className="text-center">{exam.questionsCount}</TableCell>
                        <TableCell className="text-center">
                          <span className="flex items-center justify-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {exam.duration} دقيقة
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={exam.isPublished ? "success" : "secondary"}>
                            {exam.isPublished ? "منشور" : "مسودة"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleLink(exam.id)}
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
          
          {/* Linked Exams */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              الاختبارات المرتبطة ({lessonsWithExams.length})
            </h3>
            
            {lessonsWithExams.length === 0 ? (
              <EmptyState
                icon={<Unlink2 className="w-12 h-12 text-gray-300" />}
                title="لا توجد اختبارات مرتبطة"
                description="اختر درساً واختباراً ثم اضغط 'ربط'"
                className="h-64"
              />
            ) : (
              <div className="space-y-3">
                {lessonsWithExams.map(lesson => (
                  <div key={lesson.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900 dark:text-white">{lesson.title}</span>
                      <Badge variant="outline">{lesson.quizzes?.length || 0} اختبار</Badge>
                    </div>
                    <ul className="space-y-1">
                      {lesson.quizzes?.map(quiz => (
                        <li key={quiz.id} className="flex items-center justify-between text-sm">
                          <span className="text-gray-700 dark:text-gray-300 truncate pr-2">{quiz.question}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleUnlink(lesson.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Unlink2 className="w-3.5 h-3.5" />
                          </Button>
                        </li>
                      ))}
                    </ul>
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
            onChange={e => setSelectedLessonId(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">-- اختر درساً --</option>
            {lessons.filter(l => l.type !== "INTERACTIVE_QUIZ").map(lesson => (
              <option key={lesson.id} value={lesson.id}>
                {lesson.title} ({lessonTypeLabels[lesson.type] || lesson.type})
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">اختر درساً أولاً، ثم اضغط 'ربط' بجانب الاختبار المطلوب</p>
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