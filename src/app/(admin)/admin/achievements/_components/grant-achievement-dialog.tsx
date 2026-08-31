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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Award,
  Check,
  Search,
  UserPlus,
  X,
  Loader2,
  Sparkles,
  Send,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useGrantAchievement } from "../_hooks/use-user-achievements";
import { useUserSearch, type UserSearchResult } from "../_hooks/use-user-search";
import { useAchievements } from "../_hooks/use-achievements";
import { grantAchievementSchema, type GrantAchievementFormValues } from "../_lib/schemas";
import { getAchievementIcon, CATEGORY_LABELS } from "../_lib/constants";
import { getRarityColor, getRarityLabel } from "../_lib/utils";
import { cn } from "@/lib/utils";
import type { Achievement } from "../_lib/types";

interface GrantAchievementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  achievement?: Achievement | null;
  onSuccess?: () => void;
  defaultUserIds?: string[];
  defaultUserName?: string;
}

export function GrantAchievementDialog({
  open,
  onOpenChange,
  achievement: preselectedAchievement,
  onSuccess,
  defaultUserIds,
  defaultUserName,
}: GrantAchievementDialogProps) {
  const {
    searchTerm,
    results,
    loading: searchLoading,
    selectedUsers,
    search,
    addUser,
    removeUser,
    clearSelected,
    setSearchTerm,
  } = useUserSearch();

  const grantMutation = useGrantAchievement();
  const { data: achievements = [] } = useAchievements();

  const [achievementSearch, setAchievementSearch] = React.useState("");
  const [selectedAchievement, setSelectedAchievement] = React.useState<Achievement | null>(
    preselectedAchievement || null
  );

  const form = useForm<
    z.input<typeof grantAchievementSchema>,
    any,
    GrantAchievementFormValues
  >({
    resolver: zodResolver(grantAchievementSchema),
    defaultValues: {
      userIds: [],
      achievementId: preselectedAchievement?.id || "",
      reason: "",
      notifyUser: true,
    },
  });

  React.useEffect(() => {
    if (selectedAchievement) {
      form.setValue("achievementId", selectedAchievement.id);
    }
  }, [selectedAchievement, form]);

  React.useEffect(() => {
    form.setValue("userIds", selectedUsers.map((u) => u.id));
  }, [selectedUsers, form]);

  // Pre-fill user when defaultUserIds provided
  React.useEffect(() => {
    if (defaultUserIds && defaultUserIds.length > 0 && open) {
      const preselected: UserSearchResult[] = defaultUserIds.map((id) => ({
        id,
        name: defaultUserName || "مستخدم محدد مسبقاً",
        email: "",
      }));
      preselected.forEach((u) => addUser(u));
    }
  }, [defaultUserIds, defaultUserName, open, addUser]);

  // Reset on close
  React.useEffect(() => {
    if (!open) {
      clearSelected();
      setAchievementSearch("");
      setSelectedAchievement(preselectedAchievement || null);
      form.reset({
        userIds: [],
        achievementId: preselectedAchievement?.id || "",
        reason: "",
        notifyUser: true,
      });
    }
  }, [open, clearSelected, form, preselectedAchievement]);

  const Icon = selectedAchievement ? getAchievementIcon(selectedAchievement.icon) : Award;

  const filteredAchievements = React.useMemo(() => {
    if (!achievementSearch.trim()) return achievements.slice(0, 8);
    const term = achievementSearch.toLowerCase();
    return achievements
      .filter(
        (a) =>
          a.title.toLowerCase().includes(term) ||
          a.description.toLowerCase().includes(term) ||
          a.category.toLowerCase().includes(term)
      )
      .slice(0, 12);
  }, [achievements, achievementSearch]);

  const handleSubmit = async (values: GrantAchievementFormValues) => {
    try {
      await grantMutation.mutateAsync({
        userIds: values.userIds,
        achievementId: values.achievementId,
        reason: values.reason,
        notifyUser: values.notifyUser,
      });
      form.reset();
      clearSelected();
      onSuccess?.();
      onOpenChange(false);
    } catch {
      // toast handled by hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-card/80 backdrop-blur-xl border-white/10 rounded-[2rem] p-0 overflow-hidden shadow-2xl">
        <div className="h-1.5 bg-gradient-to-r from-primary/80 via-primary to-primary/40" />

        <div className="p-6 max-h-[calc(90vh-6px)] overflow-y-auto">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-xl font-black flex items-center gap-3">
              <Send className="w-6 h-6 text-primary" />
              منح وسام للطلاب
            </DialogTitle>
            <DialogDescription className="font-bold text-muted-foreground">
              اختر الطلاب والوسام المناسب. سيتم تسجيل العملية في سجل الأوسمة.
            </DialogDescription>
          </DialogHeader>

          {/* Achievement preview */}
          {selectedAchievement && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4"
            >
              <div
                className={cn(
                  "flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-white/10 text-white shadow-lg",
                  getRarityColor(selectedAchievement.rarity)
                )}
              >
                <Icon className="h-7 w-7" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-sm truncate">{selectedAchievement.title}</p>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                  {getRarityLabel(selectedAchievement.rarity)} • {CATEGORY_LABELS[selectedAchievement.category]}
                </p>
                <div className="mt-1 flex items-center gap-1">
                  <Sparkles className="h-3 w-3 fill-blue-500 text-blue-500" />
                  <span className="text-[10px] font-black text-blue-500">
                    +{selectedAchievement.xpReward} XP
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              {/* Achievement Picker (only when no preselected achievement) */}
              {!preselectedAchievement && (
                <FormItem>
                  <FormLabel className="font-black text-[10px] uppercase tracking-widest opacity-60">
                    اختر الوسام
                  </FormLabel>
                  <div className="relative mb-2">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={achievementSearch}
                      onChange={(e) => setAchievementSearch(e.target.value)}
                      placeholder="ابحث عن وسام..."
                      className="rounded-xl border-white/10 bg-white/5 h-11 pr-11 font-bold"
                      dir="rtl"
                    />
                  </div>
                  <div className="max-h-44 overflow-y-auto rounded-xl border border-white/10 bg-white/5 p-2 space-y-1">
                    {filteredAchievements.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-4">
                        لا توجد أوسمة مطابقة
                      </p>
                    ) : (
                      filteredAchievements.map((ach) => {
                        const isSelected = selectedAchievement?.id === ach.id;
                        const AchIcon = getAchievementIcon(ach.icon);
                        return (
                          <button
                            key={ach.id}
                            type="button"
                            onClick={() => setSelectedAchievement(ach)}
                            className={cn(
                              "flex w-full items-center gap-3 px-3 py-2 text-right rounded-lg transition-colors",
                              isSelected
                                ? "bg-primary/15 border border-primary/40"
                                : "hover:bg-white/5 border border-transparent"
                            )}
                          >
                            <div
                              className={cn(
                                "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 text-white shadow",
                                getRarityColor(ach.rarity)
                              )}
                            >
                              <AchIcon className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0 text-right">
                              <p className="text-xs font-black truncate">{ach.title}</p>
                              <p className="text-[10px] text-muted-foreground">
                                {getRarityLabel(ach.rarity)} • +{ach.xpReward} XP
                              </p>
                            </div>
                            {isSelected && <Check className="h-4 w-4 text-primary" />}
                          </button>
                        );
                      })
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}

              {/* User Search */}
              <FormField
                control={form.control}
                name="userIds"
                render={() => (
                  <FormItem>
                    <FormLabel className="font-black text-[10px] uppercase tracking-widest opacity-60">
                      المستخدمون المستهدفون
                    </FormLabel>
                    <FormControl>
                      <div className="space-y-3">
                        {!defaultUserIds && (
                          <div className="relative">
                            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              value={searchTerm}
                              onChange={(e) => {
                                setSearchTerm(e.target.value);
                                search(e.target.value);
                              }}
                              placeholder="ابحث بالاسم أو البريد الإلكتروني..."
                              className="rounded-xl border-white/10 bg-white/5 h-11 pr-11 font-bold"
                              dir="rtl"
                            />
                            {searchLoading && (
                              <Loader2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-primary" />
                            )}
                          </div>
                        )}

                        {/* Selected users */}
                        <AnimatePresence>
                          {selectedUsers.length > 0 && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="flex flex-wrap gap-2 p-3 rounded-xl border border-primary/30 bg-primary/5"
                            >
                              {selectedUsers.map((user) => (
                                <motion.div
                                  key={user.id}
                                  initial={{ scale: 0.8, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  exit={{ scale: 0.8, opacity: 0 }}
                                >
                                  <Badge
                                    variant="outline"
                                    className="rounded-full px-3 py-1.5 bg-primary/20 border-primary/40 text-primary"
                                  >
                                    <span className="text-xs font-black">
                                      {user.name || user.email}
                                    </span>
                                    {!defaultUserIds && (
                                      <button
                                        type="button"
                                        onClick={() => removeUser(user.id)}
                                        className="mr-2 hover:text-destructive"
                                      >
                                        <X className="h-3 w-3" />
                                      </button>
                                    )}
                                  </Badge>
                                </motion.div>
                              ))}
                              {!defaultUserIds && selectedUsers.length > 1 && (
                                <button
                                  type="button"
                                  onClick={clearSelected}
                                  className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-destructive"
                                >
                                  مسح الكل
                                </button>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Search results */}
                        <AnimatePresence>
                          {!defaultUserIds && searchTerm.length >= 2 && results.length > 0 && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="max-h-48 overflow-y-auto rounded-xl border border-white/10 bg-white/5"
                            >
                              {results.map((user: UserSearchResult) => {
                                const isSelected = selectedUsers.find((u) => u.id === user.id);
                                return (
                                  <button
                                    key={user.id}
                                    type="button"
                                    onClick={() => addUser(user)}
                                    disabled={!!isSelected}
                                    className={cn(
                                      "flex w-full items-center gap-3 px-3 py-2 text-right transition-colors",
                                      isSelected
                                        ? "bg-primary/10 opacity-50 cursor-not-allowed"
                                        : "hover:bg-white/5"
                                    )}
                                  >
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-black text-primary">
                                      {(user.name || user.email).charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0 text-right">
                                      <p className="text-xs font-black truncate">
                                        {user.name || "بدون اسم"}
                                      </p>
                                      <p className="text-[10px] text-muted-foreground truncate">
                                        {user.email}
                                      </p>
                                    </div>
                                    {isSelected ? (
                                      <Check className="h-4 w-4 text-primary" />
                                    ) : (
                                      <UserPlus className="h-4 w-4 text-muted-foreground" />
                                    )}
                                  </button>
                                );
                              })}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </FormControl>
                    <p className="text-[10px] text-muted-foreground font-bold">
                      {selectedUsers.length} مستخدم محدد
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Reason */}
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-black text-[10px] uppercase tracking-widest opacity-60">
                      سبب المنح (اختياري)
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="مثال: تميز في الاختبارات النصفية..."
                        className="rounded-xl border-white/10 bg-white/5 p-3 font-medium min-h-[80px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Notify */}
              <FormField
                control={form.control}
                name="notifyUser"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-xl border border-white/10 p-4 bg-white/5">
                    <div className="space-y-0.5">
                      <FormLabel className="font-black text-xs">
                        إرسال إشعار للطلاب
                      </FormLabel>
                      <p className="text-[10px] text-muted-foreground font-bold">
                        سيتم إخطار الطلاب بحصولهم على الوسام الجديد.
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

              <DialogFooter className="pt-2">
                <AdminButton
                  type="submit"
                  icon={Send}
                  disabled={selectedUsers.length === 0 || !selectedAchievement}
                  loading={grantMutation.isPending}
                  className="w-full h-12 text-md font-black shadow-xl rounded-2xl"
                >
                  منح الوسام لـ {selectedUsers.length} مستخدم
                </AdminButton>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}