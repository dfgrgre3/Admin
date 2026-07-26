"use client";

import * as React from "react";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  DollarSign,
  GraduationCap,
  X,
  Plus,
} from "lucide-react";
import type { Control } from "react-hook-form";

import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminCard } from "@/components/admin/ui/admin-card";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TabsContent } from "@/components/ui/tabs";

import type { CourseFormValues, CourseTeacher } from "./types";
import type { CourseOption } from "./course-options";

interface DetailsTabProps {
  control: Control<CourseFormValues>;
  teachers: CourseTeacher[];
  courseId?: string;
  allCourses: CourseOption[];
  onNext: () => void;
  onPrev: () => void;
}

export function DetailsTab({
  control,
  teachers,
  courseId,
  allCourses,
  onNext,
  onPrev,
}: DetailsTabProps) {
  const [customReq, setCustomReq] = React.useState("");
  const courseOptions = Array.isArray(allCourses) ? allCourses : [];

  return (
    <TabsContent value="details" className="mt-0 space-y-6">
      <AdminCard className="p-6">
        <div className="grid gap-6">
          <div className="flex items-center gap-3 pb-2 border-b">
            <DollarSign className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-black">التسعير والوصول</h3>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <FormField
              control={control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">
                    سعر الدورة (EGP)
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type="number"
                        className="h-12 rounded-xl pr-12"
                      />
                      <DollarSign className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div>
                  </FormControl>
                  <FormDescription className="text-[10px]">
                    اترك السعر 0 لجعل الدورة مجانية.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="durationHours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">
                    إجمالي الساعات التقريبي
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type="number"
                        className="h-12 rounded-xl pr-12"
                      />
                      <Clock className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={control}
            name="instructorId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold">
                  المحاضر / المدرس المسئول
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value || ""}
                >
                  <FormControl>
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue placeholder="اختر مدرساً" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </AdminCard>

      <AdminCard className="p-6">
        <div className="grid gap-6">
          <div className="flex items-center gap-3 pb-2 border-b">
            <GraduationCap className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-black">المحتوى التعليمي</h3>
          </div>

          <FormField
            control={control}
            name="requirements"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold">
                  متطلبات الدورة
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    value={field.value || ""}
                    placeholder="ما الذي يجب على الطالب توفره قبل البدء؟ (ضع كل متطلب في سطر مستقل)"
                    className="min-h-[100px] rounded-2xl"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="learningObjectives"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold">
                  ماذا ستتعلم؟ (الأهداف)
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    value={field.value || ""}
                    placeholder="ما المخرجات النهائية للطالب بعد إكمال الدورة؟ (ضع كل هدف في سطر مستقل)"
                    className="min-h-[100px] rounded-2xl"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="targetAudience"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold">
                  الفئة المستهدفة
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    value={field.value || ""}
                    placeholder="ضع كل فئة مستهدفة في سطر مستقل"
                    className="min-h-[100px] rounded-2xl"
                  />
                </FormControl>
                <FormDescription>
                  مثال: طلاب الصف الثالث الثانوي، طلاب المراجعة النهائية.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="coursePrerequisites"
            render={({ field }) => {
              const currentTags = field.value
                ? field.value.split("\n").filter((v) => v.trim() !== "")
                : [];

              const handleAddTag = (tagVal: string) => {
                const trimmed = tagVal.trim();
                if (trimmed && !currentTags.includes(trimmed)) {
                  const updated = [...currentTags, trimmed].join("\n");
                  field.onChange(updated);
                }
              };

              const handleRemoveTag = (indexToRemove: number) => {
                const updatedTags = currentTags.filter((_, idx) => idx !== indexToRemove);
                field.onChange(updatedTags.join("\n"));
              };

              return (
                <FormItem>
                  <FormLabel className="font-bold flex items-center justify-between">
                    <span>المتطلبات والترابط التعليمي</span>
                    <Badge variant="outline" className="text-[9px] font-black h-4 px-1">مطور</Badge>
                  </FormLabel>
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Dropdown for system courses */}
                      <Select
                        onValueChange={(val) => {
                          handleAddTag(val);
                        }}
                      >
                        <FormControl>
                          <SelectTrigger className="h-12 rounded-xl border-primary/20 bg-primary/5">
                            <SelectValue placeholder="اختر دورة من النظام كمتطلب..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {courseOptions
                            .filter((c) => c.id !== courseId)
                            .map((c) => (
                              <SelectItem key={c.id} value={c.nameAr || c.name}>
                                {c.nameAr || c.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>

                      {/* Custom text requirement */}
                      <div className="flex gap-2">
                        <Input
                          value={customReq}
                          onChange={(e) => setCustomReq(e.target.value)}
                          placeholder="أو اكتب متطلب مخصص هنا..."
                          className="h-12 rounded-xl flex-1"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              if (customReq.trim()) {
                                handleAddTag(customReq);
                                setCustomReq("");
                              }
                            }
                          }}
                        />
                        <AdminButton
                          type="button"
                          variant="outline"
                          onClick={() => {
                            if (customReq.trim()) {
                              handleAddTag(customReq);
                              setCustomReq("");
                            }
                          }}
                          className="h-12 w-12 rounded-xl p-0 flex items-center justify-center border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary"
                        >
                          <Plus className="h-5 w-5" />
                        </AdminButton>
                      </div>
                    </div>

                    {/* Tags Display Container */}
                    <div className="flex flex-wrap gap-2 p-3 min-h-[50px] rounded-2xl bg-muted/20 border border-border/40">
                      {currentTags.length === 0 ? (
                        <span className="text-xs text-muted-foreground/80 self-center">
                          لم يتم تحديد متطلبات سابقة لهذه الدورة بعد. اختر من القائمة أو اكتب متطلباً مخصصاً.
                        </span>
                      ) : (
                        currentTags.map((tag, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card border border-border/50 text-xs font-bold text-foreground shadow-sm animate-in fade-in-50 zoom-in-95 duration-150"
                          >
                            <span>{tag}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(idx)}
                              className="text-muted-foreground hover:text-destructive transition-colors rounded-full p-0.5 hover:bg-muted"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                  <FormDescription className="text-[10px] leading-relaxed">
                    اربط هذه الدورة بدورات أخرى في الموقع لتحسين تجربة الطالب وتوجيهه للمسار الصحيح.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              );
            }}
          />

          <FormField
            control={control}
            name="whatYouLearn"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold">
                  ماذا سيتعلم الطالب
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    value={field.value || ""}
                    placeholder="ضع كل فائدة أو مهارة في سطر مستقل"
                    className="min-h-[100px] rounded-2xl"
                  />
                </FormControl>
                <FormDescription>
                  يدعم بناء محتوى تسويقي وتعليمي أكثر دقة بدون تغيير التصميم.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </AdminCard>

      <div className="flex justify-between">
        <AdminButton
          type="button"
          variant="outline"
          onClick={onPrev}
          className="h-12 rounded-xl px-8 font-black gap-3"
        >
          <ChevronRight className="h-4 w-4" />
          السابق
        </AdminButton>
        <AdminButton
          type="button"
          variant="outline"
          onClick={onNext}
          className="h-12 rounded-xl px-8 font-black gap-3"
        >
          التالي: الوسائط وصور العرض
          <ChevronLeft className="h-4 w-4" />
        </AdminButton>
      </div>
    </TabsContent>
  );
}
