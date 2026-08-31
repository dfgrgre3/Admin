"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Sparkles, ListChecks, Check, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

import { apiRoutes } from "@/lib/api/routes";
import { adminFetch } from "@/lib/api/admin-api";
import { logger } from "@/lib/logger";
import {
  ICON_OPTIONS,
  RARITY_OPTIONS,
  CATEGORY_OPTIONS,
  DIFFICULTY_OPTIONS,
  XP_RANGES_BY_RARITY,
  ACHIEVEMENT_TEMPLATES,
} from "./_lib/constants";
import { achievementSchema, type AchievementSchemaValues } from "./_lib/schemas";
import { DEFAULT_FORM_VALUES, generateAchievementKey } from "./_lib/utils";
import { AchievementPreview } from "./_components/achievement-preview";
import { AchievementTemplates } from "./_components/achievement-templates";
import type { Achievement } from "./_lib/types";

interface AchievementFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingAchievement: Achievement | null;
  onSuccess: () => void;
}

export function AchievementFormDialog({
  open,
  onOpenChange,
  editingAchievement,
  onSuccess,
}: AchievementFormDialogProps) {
  const form = useForm<AchievementSchemaValues>({
    resolver: zodResolver(achievementSchema),
    defaultValues: DEFAULT_FORM_VALUES,
  });

  const watchedIcon = form.watch("icon");
  const watchedRarity = form.watch("rarity");
  const watchedTitle = form.watch("title");
  const watchedXpReward = form.watch("xpReward");
  const suggestedXp = XP_RANGES_BY_RARITY[watchedRarity]?.suggested;

  React.useEffect(() => {
    if (editingAchievement) {
      form.reset({
        key: editingAchievement.key,
        title: editingAchievement.title,
        description: editingAchievement.description,
        icon: editingAchievement.icon,
        rarity: editingAchievement.rarity,
        xpReward: editingAchievement.xpReward,
        isSecret: editingAchievement.isSecret,
        category: editingAchievement.category,
        difficulty: editingAchievement.difficulty,
        criteria: editingAchievement.criteria || "",
      });
    } else {
      form.reset(DEFAULT_FORM_VALUES);
    }
  }, [editingAchievement, form]);

  const handleSubmit = async (values: AchievementSchemaValues) => {
    try {
      const url = editingAchievement
        ? apiRoutes.admin.achievementById(editingAchievement.id)
        : apiRoutes.admin.achievements;
      const method = editingAchievement ? "PATCH" : "POST";

      const response = await adminFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        toast.success(editingAchievement ? "تم تحديث الوسام بنجاح" : "تم إنشاء الوسام بنجاح");
        onSuccess();
      } else {
        const data = await response.json().catch(() => null);
        toast.error(data?.message || "حدث خطأ أثناء حفظ الإنجاز");
      }
    } catch (error) {
      logger.error("Error saving achievement:", error);
      toast.error("حدث خطأ أثناء حفظ الإنجاز");
    }
  };

  const handleApplyTemplate = (template: typeof ACHIEVEMENT_TEMPLATES[number]) => {
    form.reset({
      key: template.key,
      title: template.title,
      description: template.description,
      icon: template.icon,
      rarity: template.rarity,
      xpReward: template.xpReward,
      isSecret: false,
      category: template.category,
      difficulty: template.difficulty,
      criteria: template.criteria,
    });
    toast.success("تم تطبيق القالب بنجاح");
  };

  const handleGenerateKey = () => {
    const title = form.getValues("title");
    if (!title) {
      toast.error("أدخل العنوان أولاً لتوليد المفتاح");
      return;
    }
    const generatedKey = generateAchievementKey(title);
    form.setValue("key", generatedKey, { shouldValidate: true });
    toast.success("تم توليد المفتاح");
  };

  const handleAutoXp = () => {
    if (suggestedXp !== undefined) {
      form.setValue("xpReward", suggestedXp, { shouldValidate: true });
      toast.success(`تم اقتراح ${suggestedXp} نقطة لهذه الفئة`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl bg-card/80 backdrop-blur-xl border-white/10 rounded-[2.5rem] p-0 overflow-hidden shadow-2xl">
        <div className="h-1.5 bg-gradient-to-r from-primary/80 via-primary to-primary/40" />
        <div className="p-8 max-h-[calc(90vh-6px)] overflow-y-auto">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-black flex items-center gap-3">
              <Sparkles className="w-7 h-7 text-primary" />
              {editingAchievement ? "تعديل بيانات الوسام" : "إنشاء وسام تعليمي جديد"}
            </DialogTitle>
            <DialogDescription className="font-bold text-muted-foreground">
              أدخل بيانات الوسام بدقة لتكريم العملاء الممرين والمستخدمين المتميزين.
            </DialogDescription>
          </DialogHeader>

          {/* Live preview */}
          <div className="mb-6">
            <AchievementPreview
              title={watchedTitle}
              description={form.watch("description")}
              icon={watchedIcon}
              rarity={watchedRarity}
              xpReward={watchedXpReward}
              isSecret={form.watch("isSecret")}
              criteria={form.watch("criteria")}
            />
          </div>

          {/* Templates (only for new achievements) */}
          {!editingAchievement && (
            <div className="mb-6">
              <AchievementTemplates onSelect={handleApplyTemplate} />
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              {/* Key + XP */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="key"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-black text-[10px] uppercase tracking-widest opacity-60 flex items-center justify-between">
                        المفتاح البرمجي (Key)
                        {!editingAchievement && (
                          <button
                            type="button"
                            onClick={handleGenerateKey}
                            className="text-primary hover:underline normal-case tracking-normal"
                          >
                            <Wand2 className="h-3 w-3 inline ml-1" />
                            توليد تلقائي
                          </button>
                        )}
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          dir="ltr"
                          placeholder="ACHIEVEMENT_KEY"
                          className="rounded-xl border-white/10 bg-white/5 h-11 font-mono"
                          disabled={!!editingAchievement}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="xpReward"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-black text-[10px] uppercase tracking-widest opacity-60 flex items-center justify-between">
                        مكافأة النقاط
                        {suggestedXp !== undefined && (
                          <button
                            type="button"
                            onClick={handleAutoXp}
                            className="text-primary hover:underline normal-case tracking-normal"
                          >
                            <Wand2 className="h-3 w-3 inline ml-1" />
                            اقتراح {suggestedXp}
                          </button>
                        )}
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          className="rounded-xl border-white/10 bg-white/5 h-11 text-center font-black"
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-black text-[10px] uppercase tracking-widest opacity-60">
                      عنوان الوسام
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="rounded-xl border-white/10 bg-white/5 h-11 px-4 font-bold"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-black text-[10px] uppercase tracking-widest opacity-60">
                      وصف الإنجاز
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        className="rounded-2xl border-white/10 bg-white/5 p-4 font-medium"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Criteria */}
              <FormField
                control={form.control}
                name="criteria"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-black text-[10px] uppercase tracking-widest opacity-60">
                      شرط الإنجاز (Criteria)
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        dir="ltr"
                        placeholder="مثال: COMPLETE_10_LESSONS"
                        className="rounded-xl border-white/10 bg-white/5 h-11 font-mono text-xs"
                      />
                    </FormControl>
                    <p className="text-[10px] text-muted-foreground font-bold">
                      المفتاح البرمجي الذي يحدد متى يُمنح الوسام تلقائيًا.
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Icon Picker */}
              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-black text-[10px] uppercase tracking-widest opacity-60">
                      أيقونة الوسام
                    </FormLabel>
                    <FormControl>
                      <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-11 gap-2 max-h-48 overflow-y-auto p-2 rounded-xl border border-white/10 bg-white/5">
                        {ICON_OPTIONS.map((option) => {
                          const Icon = option.icon;
                          const selected = field.value === option.value;
                          return (
                            <motion.button
                              key={option.value}
                              type="button"
                              title={option.label}
                              onClick={() => field.onChange(option.value)}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              className={cn(
                                "relative flex h-11 w-full items-center justify-center rounded-xl border transition-all",
                                selected
                                  ? "bg-primary/20 border-primary text-primary shadow-lg shadow-primary/20"
                                  : "bg-background/40 border-white/10 text-muted-foreground hover:text-foreground hover:border-primary/40"
                              )}
                            >
                              <Icon className="h-5 w-5" />
                              {selected && (
                                <span className="absolute -top-1.5 -left-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                  <Check className="h-3 w-3" />
                                </span>
                              )}
                            </motion.button>
                          );
                        })}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Rarity, Category, Difficulty, Secret */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="rarity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-black text-[10px] uppercase tracking-widest opacity-60">
                        فئة التميز
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="rounded-xl border-white/10 bg-white/5 h-11">
                            <SelectValue placeholder="اختر الفئة" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {RARITY_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-black text-[10px] uppercase tracking-widest opacity-60">
                        مجال الإنجاز
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="rounded-xl border-white/10 bg-white/5 h-11">
                            <SelectValue placeholder="اختر الفئة" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CATEGORY_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="difficulty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-black text-[10px] uppercase tracking-widest opacity-60">
                        مستوى الصعوبة
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="rounded-xl border-white/10 bg-white/5 h-11">
                            <SelectValue placeholder="اختر الصعوبة" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {DIFFICULTY_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isSecret"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-xl border border-white/10 p-4 bg-white/5">
                      <div className="space-y-0.5">
                        <FormLabel className="font-black text-xs">وسام مخفي</FormLabel>
                        <p className="text-[10px] text-muted-foreground font-bold">
                          لن يظهر حتى يحصل عليه الطالب.
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter className="pt-4">
                <AdminButton
                  type="submit"
                  icon={editingAchievement ? Sparkles : ListChecks}
                  className="w-full h-14 text-md font-black shadow-xl rounded-2xl"
                >
                  {editingAchievement ? "تحديث بيانات الوسام" : "حفظ الوسام الجديد"}
                </AdminButton>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}