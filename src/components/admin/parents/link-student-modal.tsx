"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { adminUsersApi } from "@/lib/api/admin-users-api";
import { UserRole } from "@/types/enums";
import { Search, User, Link2, X } from "lucide-react";
import { toast } from "sonner";

interface LinkStudentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentId: string | null;
  onLinkStudent: (studentId: string) => Promise<void>;
}

interface StudentOption {
  id: string;
  name: string | null;
  username: string | null;
  email: string;
  gradeLevel?: string | null;
}

export function LinkStudentModal({ open, onOpenChange, parentId, onLinkStudent }: LinkStudentModalProps) {
  const [search, setSearch] = React.useState("");
  const [selectedStudentId, setSelectedStudentId] = React.useState<string>("");
  const [linking, setLinking] = React.useState(false);

  const { data: studentsData, isLoading: studentsLoading } = useQuery({
    queryKey: ["admin", "users", "students", search],
    queryFn: () => adminUsersApi.list({
      role: UserRole.STUDENT,
      search: search || undefined,
      limit: 20,
    }),
    enabled: open,
  });

  const students = React.useMemo(() => {
    return (studentsData?.users || []).filter((user) => user.role === UserRole.STUDENT) as StudentOption[];
  }, [studentsData]);

  const handleLink = async () => {
    if (!selectedStudentId || !parentId) {
      toast.error("يرجى اختيار طالب");
      return;
    }

    setLinking(true);
    try {
      await onLinkStudent(selectedStudentId);
      toast.success("تم ربط الطالب بنجاح");
      setSelectedStudentId("");
      setSearch("");
      onOpenChange(false);
    } catch (error) {
      toast.error("فشل ربط الطالب");
    } finally {
      setLinking(false);
    }
  };

  const handleClose = () => {
    setSelectedStudentId("");
    setSearch("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="w-5 h-5" />
            ربط طالب بولي الأمر
          </DialogTitle>
          <DialogDescription>
            اختر طالبًا من القائمة لربطه بهذا ولي الأمر
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search">البحث عن طالب</Label>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="ابحث بالاسم، البريد الإلكتروني..."
                className="pr-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Student Selection */}
          <div className="space-y-2">
            <Label htmlFor="student">اختر الطالب</Label>
            {selectedStudentId ? (
              <div className="flex items-center justify-between p-3 bg-primary/5 rounded-xl border border-primary/20">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-bold text-sm">
                      {students.find((s) => s.id === selectedStudentId)?.name || "غير محدد"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {students.find((s) => s.id === selectedStudentId)?.email}
                    </p>
                  </div>
                </div>
                <AdminButton
                  variant="outline"
                  size="sm"
                  icon={X}
                  onClick={() => setSelectedStudentId("")}
                />
              </div>
            ) : (
              <div className="border border-border rounded-xl max-h-48 overflow-y-auto">
                {studentsLoading ? (
                  <div className="flex items-center justify-center py-8 text-muted-foreground">
                    جاري التحميل...
                  </div>
                ) : students.length > 0 ? (
                  students.map((student) => (
                    <button
                      key={student.id}
                      onClick={() => setSelectedStudentId(student.id)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-accent/5 transition-colors text-right border-b border-border last:border-0"
                    >
                      <User className="w-5 h-5 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="font-bold text-sm">{student.name || student.username || "بدون اسم"}</p>
                        <p className="text-xs text-muted-foreground">{student.email}</p>
                      </div>
                      {student.gradeLevel && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                          {student.gradeLevel}
                        </span>
                      )}
                    </button>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <User className="w-8 h-8 mb-2 opacity-50" />
                    <p className="text-sm">لا يوجد طلاب</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <AdminButton variant="outline" onClick={handleClose}>
            إلغاء
          </AdminButton>
          <AdminButton
            variant="premium"
            icon={Link2}
            onClick={handleLink}
            disabled={!selectedStudentId || linking}
            loading={linking}
          >
            ربط الطالب
          </AdminButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}
