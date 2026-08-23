"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  FileText,
  GitBranch,
  Loader2,
  MessageSquare,
  Send,
  Trash2,
  XCircle,
  Archive,
  RotateCcw,
  Settings,
} from "lucide-react";
import { toast } from "sonner";

import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminCard } from "@/components/admin/ui/admin-card";
import { CourseStatusBadge } from "@/components/admin/courses/status-badge";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { apiRoutes } from "@/lib/api/routes";
import { adminFetch } from "@/lib/api/admin-api";
import { readJsonOrThrow, throwIfApiError } from "@/lib/api/api-error-utils";
import {
  COURSE_STATUS_LABELS,
  type CourseChangelogEntry,
  type CourseReviewComment,
  type CourseStatus,
} from "../../_components/types";

export default function CourseWorkflowPage() {
  const params = useParams();
  const courseId = params.id as string;
  const queryClient = useQueryClient();

  const [rejectDialog, setRejectDialog] = React.useState(false);
  const [rejectReason, setRejectReason] = React.useState("");
  const [newComment, setNewComment] = React.useState("");

  // Fetch course data
  const { data: course, isLoading } = useQuery<{ data?: { course?: any; [key: string]: any }; [key: string]: any }>({
    queryKey: ["admin", "courses", courseId],
    queryFn: async () => {
      const res = await adminFetch(`${apiRoutes.admin.courses}/${courseId}`);
      return readJsonOrThrow(res, "فشل تحميل بيانات الدورة");
    },
  });

  const courseData = course?.data?.course || course?.data || course;

  // Fetch changelog
  const { data: changelogData } = useQuery<{ data?: { changelog?: CourseChangelogEntry[]; [key: string]: any }; [key: string]: any }>({
    queryKey: ["admin", "courses", courseId, "changelog"],
    queryFn: async () => {
      const res = await adminFetch(apiRoutes.admin.courseChangelogV2(courseId));
      return readJsonOrThrow(res, "فشل تحميل سجل التعديلات");
    },
  });

  const changelog: CourseChangelogEntry[] = changelogData?.data?.changelog || [];

  // Fetch review comments
  const { data: commentsData, refetch: refetchComments } = useQuery<{ data?: { comments?: CourseReviewComment[]; [key: string]: any }; [key: string]: any }>({
    queryKey: ["admin", "courses", courseId, "review-comments"],
    queryFn: async () => {
      const res = await adminFetch(apiRoutes.admin.courseReviewComments(courseId));
      return readJsonOrThrow(res, "فشل تحميل تعليقات المراجعة");
    },
  });

  const comments: CourseReviewComment[] = commentsData?.data?.comments || [];

  // Workflow mutations
  const submitReview = useMutation({
    mutationFn: async () => {
      const res = await adminFetch(apiRoutes.admin.courseSubmitReview(courseId), {
        method: "POST",
      });
      await throwIfApiError(res, "فشل إرسال الدورة للمراجعة");
    },
    onSuccess: () => {
      toast.success("تم إرسال الدورة للمراجعة");
      queryClient.invalidateQueries({ queryKey: ["admin", "courses", courseId] });
    },
    onError: () => toast.error("فشل إرسال الدورة للمراجعة"),
  });

  const approveCourse = useMutation({
    mutationFn: async () => {
      const res = await adminFetch(apiRoutes.admin.courseApprove(courseId), {
        method: "POST",
      });
      await throwIfApiError(res, "فشل اعتماد الدورة");
    },
    onSuccess: () => {
      toast.success("تم اعتماد الدورة ونشرها");
      queryClient.invalidateQueries({ queryKey: ["admin", "courses", courseId] });
    },
    onError: () => toast.error("فشل اعتماد الدورة"),
  });

  const rejectCourse = useMutation({
    mutationFn: async () => {
      const res = await adminFetch(apiRoutes.admin.courseReject(courseId), {
        method: "POST",
        body: JSON.stringify({ reason: rejectReason }),
      });
      await throwIfApiError(res, "فشل رفض الدورة");
    },
    onSuccess: () => {
      toast.success("تم رفض الدورة وإعادتها للمسودة");
      setRejectDialog(false);
      setRejectReason("");
      queryClient.invalidateQueries({ queryKey: ["admin", "courses", courseId] });
    },
    onError: () => toast.error("فشل رفض الدورة"),
  });

  const archiveCourse = useMutation({
    mutationFn: async () => {
      const res = await adminFetch(apiRoutes.admin.courseArchive(courseId), {
        method: "POST",
      });
      await throwIfApiError(res, "فشل أرشفة الدورة");
    },
    onSuccess: () => {
      toast.success("تم أرشفة الدورة");
      queryClient.invalidateQueries({ queryKey: ["admin", "courses", courseId] });
    },
    onError: () => toast.error("فشل أرشفة الدورة"),
  });

  const restoreCourse = useMutation({
    mutationFn: async () => {
      const res = await adminFetch(apiRoutes.admin.courseUnarchive(courseId), {
        method: "POST",
      });
      await throwIfApiError(res, "فشل استعادة الدورة");
    },
    onSuccess: () => {
      toast.success("تم استعادة الدورة");
      queryClient.invalidateQueries({ queryKey: ["admin", "courses", courseId] });
    },
    onError: () => toast.error("فشل استعادة الدورة"),
  });

  const addComment = useMutation({
    mutationFn: async () => {
      const res = await adminFetch(apiRoutes.admin.courseReviewComments(courseId), {
        method: "POST",
        body: JSON.stringify({ comment: newComment, status: "pending" }),
      });
      await throwIfApiError(res, "فشل إضافة التعليق");
    },
    onSuccess: () => {
      toast.success("تم إضافة التعليق");
      setNewComment("");
      refetchComments();
    },
    onError: () => toast.error("فشل إضافة التعليق"),
  });

  const rawStatus: string | undefined = courseData?.status;
  const normalizedStatus = rawStatus ? rawStatus.toUpperCase() : undefined;
  const status: CourseStatus =
    normalizedStatus && normalizedStatus in COURSE_STATUS_LABELS
      ? (normalizedStatus as CourseStatus)
      : "DRAFT";
  const isPending = submitReview.isPending || approveCourse.isPending || rejectCourse.isPending || archiveCourse.isPending || restoreCourse.isPending || addComment.isPending;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <GitBranch className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-black">سير العمل والمراجعة</h1>
            <p className="text-sm text-muted-foreground">
              إدارة دورة حياة الدورة: المسودة ← المراجعة ← النشر ← الأرشفة
            </p>
          </div>
        </div>
        <CourseStatusBadge
          status={status}
          isPublished={courseData?.isPublished}
          isActive={courseData?.isActive}
        />
      </div>

      {/* Workflow Actions */}
      <AdminCard className="p-6">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-black">
          <Settings className="h-5 w-5 text-primary" />
          إجراءات سير العمل
        </h3>
        <div className="flex flex-wrap gap-3">
          {status === "DRAFT" && (
            <AdminButton
              onClick={() => submitReview.mutate()}
              disabled={isPending}
              className="gap-2 rounded-xl"
            >
              <Send className="h-4 w-4" />
              إرسال للمراجعة
            </AdminButton>
          )}

          {status === "UNDER_REVIEW" && (
            <>
              <AdminButton
                onClick={() => approveCourse.mutate()}
                disabled={isPending}
                className="gap-2 rounded-xl bg-green-600 hover:bg-green-700"
              >
                <CheckCircle2 className="h-4 w-4" />
                اعتماد ونشر
              </AdminButton>
              <AdminButton
                onClick={() => setRejectDialog(true)}
                disabled={isPending}
                variant="outline"
                className="gap-2 rounded-xl border-red-300 text-red-600 hover:bg-red-50"
              >
                <XCircle className="h-4 w-4" />
                رفض وإعادة لمسودة
              </AdminButton>
            </>
          )}

          {status === "PUBLISHED" && (
            <AdminButton
              onClick={() => archiveCourse.mutate()}
              disabled={isPending}
              variant="outline"
              className="gap-2 rounded-xl"
            >
              <Archive className="h-4 w-4" />
              أرشفة الدورة
            </AdminButton>
          )}

          {status === "ARCHIVED" && (
            <AdminButton
              onClick={() => restoreCourse.mutate()}
              disabled={isPending}
              className="gap-2 rounded-xl"
            >
              <RotateCcw className="h-4 w-4" />
              استعادة الدورة
            </AdminButton>
          )}
        </div>

        {/* Workflow diagram */}
        <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2">
          {(["DRAFT", "UNDER_REVIEW", "PUBLISHED", "ARCHIVED"] as CourseStatus[]).map((s, i) => (
            <React.Fragment key={s}>
              <div
                className={`flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold ${
                  s === status
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border/60 bg-muted/30 text-muted-foreground"
                }`}
              >
                <span className="h-2 w-2 rounded-full bg-current opacity-60" />
                {COURSE_STATUS_LABELS[s]}
              </div>
              {i < 3 && <ArrowLeft className="h-4 w-4 shrink-0 text-muted-foreground/40" />}
            </React.Fragment>
          ))}
        </div>
      </AdminCard>

      {/* Review Comments */}
      <AdminCard className="p-6">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-black">
          <MessageSquare className="h-5 w-5 text-primary" />
          تعليقات المراجعة
        </h3>

        {/* Add comment */}
        <div className="mb-4 flex gap-2">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="أضف تعليق مراجعة..."
            className="flex-1 rounded-xl border border-border/60 bg-background p-3 text-sm resize-none"
            rows={2}
          />
          <AdminButton
            onClick={() => addComment.mutate()}
            disabled={isPending || !newComment.trim()}
            className="self-end gap-2 rounded-xl"
          >
            <Send className="h-4 w-4" />
            إرسال
          </AdminButton>
        </div>

        {/* Comments list */}
        {comments.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            لا توجد تعليقات مراجعة بعد
          </p>
        ) : (
          <div className="space-y-3">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="rounded-xl border border-border/60 bg-muted/20 p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <Badge
                    variant="outline"
                    className={
                      comment.status === "approved"
                        ? "border-green-200 bg-green-50 text-green-700"
                        : comment.status === "rejected"
                        ? "border-red-200 bg-red-50 text-red-700"
                        : "border-amber-200 bg-amber-50 text-amber-700"
                    }
                  >
                    {comment.status === "approved" ? "معتمد" : comment.status === "rejected" ? "مرفوض" : "معلق"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(comment.createdAt).toLocaleDateString("ar-EG")}
                  </span>
                </div>
                <p className="text-sm">{comment.comment}</p>
              </div>
            ))}
          </div>
        )}
      </AdminCard>

      {/* Changelog */}
      <AdminCard className="p-6">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-black">
          <Clock className="h-5 w-5 text-primary" />
          سجل التعديلات
        </h3>
        {changelog.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            لا توجد تعديلات مسجلة
          </p>
        ) : (
          <div className="space-y-3">
            {changelog.map((entry) => (
              <div
                key={entry.id}
                className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/20 p-4"
              >
                <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold">{entry.field}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(entry.createdAt).toLocaleString("ar-EG")}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs">
                    {entry.oldValue && (
                      <span className="rounded bg-red-50 px-2 py-0.5 text-red-600 line-through">
                        {entry.oldValue}
                      </span>
                    )}
                    {entry.newValue && (
                      <span className="rounded bg-green-50 px-2 py-0.5 text-green-600">
                        {entry.newValue}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminCard>

      {/* Reject dialog */}
      <ConfirmDialog
        open={rejectDialog}
        onOpenChange={setRejectDialog}
        title="رفض الدورة"
        description="أدخل سبب الرفض (سيتم إعادة الدورة إلى حالة المسودة)"
        confirmText="رفض"
        variant="destructive"
        onConfirm={() => rejectCourse.mutate()}
      />
    </div>
  );
}
