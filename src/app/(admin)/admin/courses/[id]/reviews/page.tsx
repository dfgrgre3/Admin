"use client";

import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { adminFetch } from "@/lib/api/admin-api";
import { apiRoutes } from "@/lib/api/routes";
import { toast } from "sonner";
import {
  Star,
  MessageSquare,
  Trash2,
  Eye,
  EyeOff,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  Reply,
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
import { cn, formatPrice } from "@/lib/utils";

type CourseReview = {
  id: string;
  userId: string;
  subjectId: string;
  rating: number;
  comment: string;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  comments?: CourseComment[];
};

type CourseComment = {
  id: string;
  reviewId: string;
  userId: string;
  comment: string;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
};

type ReviewsResponse = {
  data: CourseReview[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export default function CourseReviewsPage() {
  const params = useParams();
  const courseId = params.id as string;
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set());
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string | null; type: 'review' | 'comment' }>({
    open: false,
    id: null,
    type: 'review'
  });

  const { data: reviewsData, isLoading, refetch } = useQuery({
    queryKey: ["admin", "courses", courseId, "reviews", page, limit],
    queryFn: async (): Promise<ReviewsResponse> => {
      const response = await adminFetch(
        `${apiRoutes.admin.courses}/${courseId}/reviews?page=${page}&limit=${limit}`
      );
      if (!response.ok) throw new Error("فشل تحميل التقييمات");
      return response.json();
    },
    staleTime: 30_000,
  });

  const reviews = reviewsData?.data || [];
  const pagination = reviewsData?.pagination;
  const totalPages = pagination?.totalPages || 1;

  // Toggle review visibility
  const toggleVisibilityMutation = useMutation({
    mutationFn: async ({ id, isVisible, type }: { id: string; isVisible: boolean; type: 'review' | 'comment' }) => {
      const endpoint = type === 'review' 
        ? `${apiRoutes.admin.courses}/${courseId}/reviews`
        : `${apiRoutes.admin.courses}/reviews/comments/${id}`;
      
      const response = await adminFetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isVisible: !isVisible }),
      });
      if (!response.ok) throw new Error("فشل تحديث الحالة");
      return response.json();
    },
    onSuccess: () => {
      toast.success("تم تحديث الحالة بنجاح");
      refetch();
    },
    onError: () => {
      toast.error("فشل تحديث الحالة");
    },
  });

  // Delete review/comment
  const deleteMutation = useMutation({
    mutationFn: async ({ id, type }: { id: string; type: 'review' | 'comment' }) => {
      const endpoint = type === 'review'
        ? `${apiRoutes.admin.courses}/${courseId}/reviews`
        : `${apiRoutes.admin.courses}/reviews/comments/${id}`;
      
      const response = await adminFetch(endpoint, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) throw new Error("فشل الحذف");
      return response.json();
    },
    onSuccess: () => {
      toast.success("تم الحذف بنجاح");
      setDeleteDialog({ open: false, id: null, type: 'review' });
      refetch();
    },
    onError: () => {
      toast.error("فشل الحذف");
    },
  });

  const toggleExpand = (reviewId: string) => {
    setExpandedReviews((prev) => {
      const next = new Set(prev);
      if (next.has(reviewId)) {
        next.delete(reviewId);
      } else {
        next.add(reviewId);
      }
      return next;
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={cn(
          "h-4 w-4",
          i < rating ? "fill-amber-400 text-amber-400" : "text-zinc-300"
        )}
      />
    ));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">التقييمات والتعليقات</h1>
          <p className="text-sm text-muted-foreground mt-1">
            إدارة تقييمات وردود الطلاب على الدورة
          </p>
        </div>
        <Badge variant="outline" className="font-black">
          {pagination?.total || reviews.length} تقييم
        </Badge>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <Card className="p-12 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-bold text-muted-foreground">لا توجد تقييمات بعد</p>
            <p className="text-sm text-muted-foreground mt-2">
              سيظهر هنا تقييمات الطلاب بمجرد إضافتها
            </p>
          </Card>
        ) : (
          reviews.map((review) => (
            <Card key={review.id} className="overflow-hidden">
              <CardContent className="p-6">
                {/* Review Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-bold">{review.user?.name || "مستخدم"}</span>
                      </div>
                      <Badge variant="outline" className="text-[10px] font-black">
                        {review.user?.email || ""}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {formatDate(review.createdAt)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 mb-3">
                      {renderStars(review.rating)}
                    </div>
                    <p className="text-sm font-medium leading-relaxed">{review.comment}</p>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem
                        onClick={() => toggleVisibilityMutation.mutate({
                          id: review.id,
                          isVisible: review.isVisible,
                          type: 'review'
                        })}
                      >
                        {review.isVisible ? (
                          <>
                            <EyeOff className="h-4 w-4 ml-2" />
                            إخفاء التقييم
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4 ml-2" />
                            إظهار التقييم
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-500"
                        onClick={() => setDeleteDialog({ open: true, id: review.id, type: 'review' })}
                      >
                        <Trash2 className="h-4 w-4 ml-2" />
                        حذف التقييم
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Visibility Badge */}
                <div className="mt-3">
                  <Badge
                    variant={review.isVisible ? "default" : "secondary"}
                    className={cn(
                      "text-[10px] font-black",
                      review.isVisible ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                    )}
                  >
                    {review.isVisible ? "مرئي للطلاب" : "مخفي"}
                  </Badge>
                </div>

                {/* Comments Section */}
                {review.comments && review.comments.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-border/50">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpand(review.id)}
                      className="text-xs font-black gap-1"
                    >
                      <Reply className="h-3 w-3" />
                      {review.comments.length} رد
                      {expandedReviews.has(review.id) ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )}
                    </Button>

                    {expandedReviews.has(review.id) && (
                      <div className="mt-3 space-y-3">
                        {review.comments.map((comment) => (
                          <div
                            key={comment.id}
                            className="rounded-xl border border-border/30 bg-muted/20 p-4"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <User className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-xs font-bold">
                                    {comment.user?.name || "مستخدم"}
                                  </span>
                                  <span className="text-[10px] text-muted-foreground">
                                    {formatDate(comment.createdAt)}
                                  </span>
                                </div>
                                <p className="text-xs font-medium">{comment.comment}</p>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-6 w-6">
                                    <MoreVertical className="h-3 w-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start">
                                  <DropdownMenuItem
                                    onClick={() => toggleVisibilityMutation.mutate({
                                      id: comment.id,
                                      isVisible: comment.isVisible,
                                      type: 'comment'
                                    })}
                                  >
                                    {comment.isVisible ? (
                                      <>
                                        <EyeOff className="h-3 w-3 ml-2" />
                                        إخفاء
                                      </>
                                    ) : (
                                      <>
                                        <Eye className="h-3 w-3 ml-2" />
                                        إظهار
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-red-500"
                                    onClick={() => setDeleteDialog({ open: true, id: comment.id, type: 'comment' })}
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            السابق
          </Button>
          <span className="text-sm font-bold">
            صفحة {page} من {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            التالي
          </Button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, id: open ? deleteDialog.id : null, type: deleteDialog.type })}
        onConfirm={() => deleteMutation.mutate({ id: deleteDialog.id!, type: deleteDialog.type })}
        title={deleteDialog.type === 'review' ? "حذف التقييم" : "حذف الرد"}
        description={deleteDialog.type === 'review' 
          ? "سيتم حذف التقييم وجميع الردود المرتبطة به بشكل دائم. هذه العملية لا يمكن التراجع عنها."
          : "سيتم حذف هذا الرد بشكل دائم. هذه العملية لا يمكن التراجع عنها."
        }
        confirmText="حذف"
        variant="destructive"
      />
    </div>
  );
}
