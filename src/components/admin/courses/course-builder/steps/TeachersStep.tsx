"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  Plus, 
  Trash2, 
  UserPlus, 
  UserMinus, 
  Search, 
  Loader2,
  AlertCircle,
  X,
} from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCourseBuilder } from "../hooks";
import type { Teacher, TeacherAssignment } from "../types";
import { Card, Badge, Input, Button, Skeleton, Alert } from "../ui";

const teacherSchema = z.object({
  instructorId: z.string().min(1, "يجب اختيار مدرس"),
  role: z.string(),
});

type TeacherFormData = z.infer<typeof teacherSchema>;

interface TeachersStepProps {
  courseId?: string;
}

export const TeachersStep: React.FC<TeachersStepProps> = ({ courseId }) => {
  const {
    teachers,
    courseTeachers,
    loadTeachers,
    loadCourseTeachers,
    assignTeacher,
    removeTeacher,
    isLoading,
    error,
    clearError,
  } = useCourseBuilder({ courseId });
  
  const [isAssigning, setIsAssigning] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAssignModal, setShowAssignModal] = useState(false);
  
  const form = useForm<TeacherFormData>({
    resolver: zodResolver(teacherSchema),
    defaultValues: { instructorId: "", role: "instructor" },
  });
  
  useEffect(() => {
    loadTeachers();
    if (courseId) loadCourseTeachers(courseId);
  }, [courseId, loadTeachers, loadCourseTeachers]);
  
  const handleAssign = async (data: TeacherFormData) => {
    if (!courseId) return;
    setIsAssigning(true);
    try {
      await assignTeacher(data.instructorId, data.role);
      form.reset({ role: "instructor" });
      setShowAssignModal(false);
    } catch (err) {
      console.error("Failed to assign teacher:", err);
    } finally {
      setIsAssigning(false);
    }
  };
  
  const handleRemove = async (instructorId: string) => {
    if (!courseId) return;
    if (!window.confirm("هل أنت متأكد من إزالة هذا المدرس؟")) return;
    
    try {
      await removeTeacher(instructorId);
    } catch (err) {
      console.error("Failed to remove teacher:", err);
    }
  };
  
  const filteredTeachers = teachers.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.email.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const assignedTeacherIds = new Set(courseTeachers.map(t => t.instructorId));
  const availableTeachers = filteredTeachers.filter(t => !assignedTeacherIds.has(t.id));
  
  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive" onClose={clearError}>
          <AlertCircle className="w-4 h-4" />
          {error.message}
        </Alert>
      )}
      
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">إدارة المعلمين</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">عين أو أزل المعلمين للكورس</p>
        </div>
        <Button 
          onClick={() => setShowAssignModal(true)}
          disabled={isAssigning || availableTeachers.length === 0}
        >
          <Plus className="w-4 h-4" />
          تعيين مدرس
        </Button>
      </div>
      
      {courseTeachers.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <UserPlus className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">لا يوجد معلمين معينين</h3>
          <p className="text-gray-500 dark:text-gray-400">اضغط على 'تعيين مدرس' لإضافة معلم للكورس</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="h-12 px-4 text-right font-medium">المدرس</th>
                <th className="h-12 px-4 text-right font-medium">الدور</th>
                <th className="h-12 px-4 text-right font-medium">الحالة</th>
                <th className="h-12 px-4 text-right font-medium w-20">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {courseTeachers.map((assignment) => (
                <tr key={assignment.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <span className="font-medium text-gray-600 dark:text-gray-300">
                          {assignment.instructor?.name?.charAt(0) || "م"}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{assignment.instructor?.name || "غير معروف"}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{assignment.instructor?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge variant="outline">{assignment.role}</Badge>
                  </td>
                  <td className="p-4">
                    <Badge variant={assignment.instructor?.status === "APPROVED" ? "default" : "outline"}>
                      {assignment.instructor?.status === "APPROVED" ? "نشط" : (assignment.instructor?.status || "غير معروف")}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemove(assignment.instructorId)}
                      disabled={isLoading}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Assign Teacher Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <Card className="max-w-md w-full">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">تعيين مدرس جديد</h3>
              <button onClick={() => setShowAssignModal(false)} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={form.handleSubmit(handleAssign)} className="p-6 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="ابحث بالاسم أو الإيميل..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Controller
                name="instructorId"
                control={form.control}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">المدرس *</label>
                    <select
                      {...field}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                      disabled={isAssigning}
                    >
                      <option value="">اختر مدرساً</option>
                      {availableTeachers.map(teacher => (
                        <option key={teacher.id} value={teacher.id}>
                          {teacher.name} ({teacher.email})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              />
              
              <Alert variant="default">
                النظام الحالي يدعم مدرّساً رئيسياً واحداً لكل كورس. تعيين مدرس جديد سيستبدل المدرس الحالي.
              </Alert>

              {availableTeachers.length === 0 && (
                <Alert variant="default">
                  جميع المعلمين المتاحين معينين بالفعل لهذا الكورس
                </Alert>
              )}
              
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button variant="outline" onClick={() => setShowAssignModal(false)} disabled={isAssigning}>
                  إلغاء
                </Button>
                <Button type="submit" disabled={isAssigning}>
                  {isAssigning ? <Loader2 className="w-4 h-4 animate-spin" /> : "تعيين"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};