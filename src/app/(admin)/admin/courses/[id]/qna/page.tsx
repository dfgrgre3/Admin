"use client";

import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { apiClient } from "@/lib/api/api-client";
import { apiRoutes } from "@/lib/api/routes";
import { toast } from "sonner";
import {
  HelpCircle,
  Trash2,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  User,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";
import { cn } from "@/lib/utils";

type CourseAnswer = {
  id: string;
  questionId: string;
  userId: string;
  body: string;
  isInstructorAnswer: boolean;
  createdAt: string;
  user?: { id: string; name: string; email: string };
};

type CourseQuestion = {
  id: string;
  subjectId: string;
  subTopicId?: string | null;
  userId: string;
  title: string;
  body: string;
  createdAt: string;
  user?: { id: string; name: string; email: string };
  answers?: CourseAnswer[];
};

type QuestionsResponse = {
  data?: { questions: CourseQuestion[] };
  questions?: CourseQuestion[];
};

export default function CourseQnaPage() {
  const params = useParams();
  const courseId = params.id as string;
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string | null; type: "question" | "answer" }>({
    open: false,
    id: null,
    type: "question",
  });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin", "courses", courseId, "questions"],
    queryFn: async (): Promise<QuestionsResponse> => {
      const response = await apiClient.fetch(apiRoutes.admin.courseQuestions(courseId));
      if (!response.ok) throw new Error("فشل تحميل الأسئلة");
      return response.json();
    },
    staleTime: 30_000,
  });

  const questions = data?.data?.questions || data?.questions || [];

  const deleteMutation = useMutation({
    mutationFn: async ({ id, type }: { id: string; type: "question" | "answer" }) => {
      const endpoint = type === "question" ? apiRoutes.admin.deleteQuestion(id) : apiRoutes.admin.deleteAnswer(id);
      const response = await apiClient.fetch(endpoint, { method: "DELETE" });
      if (!response.ok) throw new Error("فشل الحذف");
      return response.json();
    },
    onSuccess: () => {
      toast.success("تم الحذف بنجاح");
      setDeleteDialog({ open: false, id: null, type: "question" });
      queryClient.invalidateQueries({ queryKey: ["admin", "courses", courseId, "questions"] });
      refetch();
    },
    onError: () => {
      toast.error("فشل الحذف");
    },
  });

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" });

  if (isLoading) {
    return (
      <div className="space-y-4" dir="rtl">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-muted/30 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">الأسئلة والأجوبة</h1>
          <p className="text-sm text-muted-foreground mt-1">إشراف على أسئلة الطلاب وردود المدرّسين على الدورة</p>
        </div>
        <Badge variant="outline" className="font-black">
          {questions.length} سؤال
        </Badge>
      </div>

      <div className="space-y-4">
        {questions.length === 0 ? (
          <Card className="p-12 text-center">
            <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-bold text-muted-foreground">لا توجد أسئلة بعد</p>
            <p className="text-sm text-muted-foreground mt-2">سيظهر هنا أسئلة الطلاب بمجرد إضافتها</p>
          </Card>
        ) : (
          questions.map((question) => (
            <Card key={question.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-bold">{question.user?.name || "مستخدم"}</span>
                      </div>
                      <Badge variant="outline" className="text-[10px] font-black">
                        {question.user?.email || ""}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{formatDate(question.createdAt)}</span>
                      </div>
                    </div>
                    <p className="font-bold text-sm">{question.title}</p>
                    {question.body && <p className="text-sm font-medium leading-relaxed mt-1">{question.body}</p>}
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem
                        className="text-red-500"
                        onClick={() => setDeleteDialog({ open: true, id: question.id, type: "question" })}
                      >
                        <Trash2 className="h-4 w-4 ml-2" />
                        حذف السؤال
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {question.answers && question.answers.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-border/50">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpand(question.id)}
                      className="text-xs font-black gap-1"
                    >
                      <HelpCircle className="h-3 w-3" />
                      {question.answers.length} رد
                      {expanded.has(question.id) ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </Button>

                    {expanded.has(question.id) && (
                      <div className="mt-3 space-y-3">
                        {question.answers.map((answer) => (
                          <div
                            key={answer.id}
                            className={cn(
                              "rounded-xl border p-4",
                              answer.isInstructorAnswer
                                ? "border-primary/20 bg-primary/5"
                                : "border-border/30 bg-muted/20"
                            )}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  {answer.isInstructorAnswer ? (
                                    <GraduationCap className="h-3 w-3 text-primary" />
                                  ) : (
                                    <User className="h-3 w-3 text-muted-foreground" />
                                  )}
                                  <span className="text-xs font-bold">{answer.user?.name || "مستخدم"}</span>
                                  {answer.isInstructorAnswer && (
                                    <Badge className="text-[10px] font-black bg-primary/10 text-primary">المدرّس</Badge>
                                  )}
                                  <span className="text-[10px] text-muted-foreground">{formatDate(answer.createdAt)}</span>
                                </div>
                                <p className="text-xs font-medium">{answer.body}</p>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-6 w-6">
                                    <MoreVertical className="h-3 w-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start">
                                  <DropdownMenuItem
                                    className="text-red-500"
                                    onClick={() => setDeleteDialog({ open: true, id: answer.id, type: "answer" })}
                                  >
                                    <Trash2 className="h-3 w-3 ml-2" />
                                    حذف
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, id: open ? deleteDialog.id : null, type: deleteDialog.type })}
        onConfirm={() => deleteMutation.mutate({ id: deleteDialog.id!, type: deleteDialog.type })}
        title={deleteDialog.type === "question" ? "حذف السؤال" : "حذف الرد"}
        description={
          deleteDialog.type === "question"
            ? "سيتم حذف السؤال وجميع الردود المرتبطة به بشكل دائم. هذه العملية لا يمكن التراجع عنها."
            : "سيتم حذف هذا الرد بشكل دائم. هذه العملية لا يمكن التراجع عنها."
        }
        confirmText="حذف"
        variant="destructive"
      />
    </div>
  );
}
