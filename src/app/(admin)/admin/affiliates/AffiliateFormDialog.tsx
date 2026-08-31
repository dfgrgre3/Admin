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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { useForm } from "react-hook-form";
import {
  Sparkles,
  Search,
  Loader2,
  UserCheck,
  X,
} from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { billingApi } from "@/lib/api/billing-api";
import { adminUsersApi, type AdminUserListItem } from "@/lib/api/admin-users-api";
import { UserRole, UserStatus } from "@/types/enums";
import { statusOptions, tierOptions, Affiliate } from "./types";

const affiliateSchema = z.object({
  userId: z.string().min(1, "معرف المستخدم مطلوب"),
  code: z.string().optional(),
  commissionRate: z.number().min(0).max(100, "النسبة يجب أن تكون 0-100"),
  tier: z.string().min(1, "الفئة مطلوبة"),
  status: z.string().min(1, "الحالة مطلوبة"),
});

type AffiliateFormValues = z.infer<typeof affiliateSchema>;

interface AffiliateFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingAffiliate: Affiliate | null;
  onSuccess: () => void;
}

function UserSearch({
  onSelect,
  disabled,
}: {
  onSelect: (user: AdminUserListItem) => void;
  disabled?: boolean;
}) {
  const [term, setTerm] = React.useState("");
  const [results, setResults] = React.useState<AdminUserListItem[]>([]);
  const [searching, setSearching] = React.useState(false);
  const [focused, setFocused] = React.useState(false);
  const [selected, setSelected] = React.useState<AdminUserListItem | null>(null);

  React.useEffect(() => {
    if (!term.trim() || term.trim().length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }
    let cancelled = false;
    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const page = await adminUsersApi.list({ search: term.trim(), limit: 8 });
        if (!cancelled) setResults(page.users ?? []);
      } catch {
        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [term]);

  const handlePick = (user: AdminUserListItem) => {
    setSelected(user);
    setTerm("");
    setResults([]);
    onSelect(user);
  };

  if (selected) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-xl border border-primary/30 bg-primary/5 p-3">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar className="h-9 w-9">
            {selected.avatar && <AvatarImage src={selected.avatar} alt={selected.name || ""} />}
            <AvatarFallback className="bg-primary/10 text-xs font-black text-primary">
              {(selected.name || selected.email || "؟").slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">{selected.name || selected.username || "—"}</p>
            <p className="truncate text-[11px] text-muted-foreground" dir="ltr">
              {selected.email}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!disabled && (
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-white/10 hover:text-foreground transition-colors"
              title="تغيير المستخدم"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          dir="rtl"
          type="text"
          value={term}
          disabled={disabled}
          onChange={(e) => setTerm(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder="ابحث بالاسم أو البريد الإلكتروني..."
          className="h-11 w-full rounded-xl border border-white/10 bg-white/5 pr-10 pl-9 text-sm outline-none focus:border-primary transition-colors disabled:opacity-50"
        />
        {searching && (
          <Loader2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>
      {focused && results.length > 0 && (
        <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-white/10 bg-background/95 backdrop-blur-xl shadow-2xl">
          {results.map((user) => (
            <button
              key={user.id}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handlePick(user)}
              className="flex w-full items-center gap-3 px-3 py-2.5 text-right hover:bg-muted/50 transition-colors"
            >
              <Avatar className="h-8 w-8">
                {user.avatar && <AvatarImage src={user.avatar} alt={user.name || ""} />}
                <AvatarFallback className="bg-primary/10 text-[10px] font-black text-primary">
                  {(user.name || user.email || "؟").slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">{user.name || user.username || "—"}</p>
                <p className="truncate text-[11px] text-muted-foreground" dir="ltr">
                  {user.email}
                </p>
              </div>
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                {user.role}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function AffiliateFormDialog({
  open,
  onOpenChange,
  editingAffiliate,
  onSuccess,
}: AffiliateFormDialogProps) {
  const form = useForm<AffiliateFormValues>({
    resolver: zodResolver(affiliateSchema),
    defaultValues: {
      userId: "",
      code: "",
      commissionRate: 10,
      tier: "BRONZE",
      status: "ACTIVE",
    },
  });

  const [selectedUser, setSelectedUser] = React.useState<AdminUserListItem | null>(null);

  React.useEffect(() => {
    if (open) {
      if (editingAffiliate) {
        form.reset({
          userId: editingAffiliate.userId,
          code: editingAffiliate.code,
          commissionRate: editingAffiliate.commissionRate,
          tier: editingAffiliate.tier,
          status: editingAffiliate.status,
        });
        if (editingAffiliate.user) {
          setSelectedUser({
            id: editingAffiliate.user.id,
            email: editingAffiliate.user.email,
            name: editingAffiliate.user.name ?? null,
            username: editingAffiliate.user.username ?? null,
            avatar: editingAffiliate.user.avatar ?? null,
            permissions: [],
            emailVerified: false,
            createdAt: "",
            lastLogin: "",
            totalXP: 0,
            level: 0,
            currentStreak: 0,
            role: UserRole.STUDENT,
            status: UserStatus.ACTIVE,
            _count: { tasks: 0, studySessions: 0, achievements: 0 },
          });
        } else {
          setSelectedUser(null);
        }
      } else {
        form.reset({
          userId: "",
          code: "",
          commissionRate: 10,
          tier: "BRONZE",
          status: "ACTIVE",
        });
        setSelectedUser(null);
      }
    }
  }, [editingAffiliate, form, open]);

  const [submitting, setSubmitting] = React.useState(false);

  const handleSubmit = async (values: AffiliateFormValues) => {
    setSubmitting(true);
    try {
      if (editingAffiliate) {
        await billingApi.updateAffiliate(editingAffiliate.id, {
          code: values.code || undefined,
          commissionRate: values.commissionRate,
          tier: values.tier,
          status: values.status,
        });
        toast.success("تم تحديث بيانات المسوق بنجاح");
      } else {
        await billingApi.createAffiliate({
          userId: values.userId,
          code: values.code || undefined,
          commissionRate: values.commissionRate,
          tier: values.tier,
          status: values.status,
        });
        toast.success("تم إنشاء حساب المسوق بنجاح");
      }
      onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "حدث خطأ أثناء الحفظ");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-card/80 backdrop-blur-xl border-white/10 rounded-[2.5rem] p-0 overflow-hidden shadow-2xl">
        <div className="h-1.5 bg-gradient-to-r from-primary/80 via-primary to-primary/40" />
        <div className="p-8">
          <DialogHeader className="mb-8">
            <DialogTitle className="text-2xl font-black">
              {editingAffiliate ? "تعديل بيانات المسوق" : "إضافة مسوق جديد"}
            </DialogTitle>
            <DialogDescription className="font-bold text-muted-foreground">
              {editingAffiliate
                ? "حدّث بيانات حساب المسوق بالعمولة."
                : "اختر مستخدماً واربطه بحساب مسوق جديد."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label className="font-black text-[10px] uppercase tracking-widest opacity-60">
                المستخدم {editingAffiliate ? "(مقروء فقط)" : ""}
              </label>
              <UserSearch
                key={editingAffiliate?.id ?? "new"}
                disabled={!!editingAffiliate}
                onSelect={(user) => {
                  setSelectedUser(user);
                  form.setValue("userId", user.id, { shouldValidate: true });
                }}
              />
              <Input
                {...form.register("userId")}
                type="hidden"
              />
              {form.formState.errors.userId && !selectedUser && (
                <p className="text-xs text-red-500">{form.formState.errors.userId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="font-black text-[10px] uppercase tracking-widest opacity-60">
                كود الإحالة (اختياري - يُولّد تلقائياً)
              </label>
              <Input
                {...form.register("code")}
                dir="ltr"
                placeholder="AFF1234"
                className="rounded-xl border-white/10 bg-white/5 h-11"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="font-black text-[10px] uppercase tracking-widest opacity-60">
                  نسبة العمولة (%)
                </label>
                <Input
                  {...form.register("commissionRate", { valueAsNumber: true })}
                  type="number"
                  min={0}
                  max={100}
                  step={0.1}
                  className="rounded-xl border-white/10 bg-white/5 h-11 text-center font-black"
                />
                {form.formState.errors.commissionRate && (
                  <p className="text-xs text-red-500">
                    {form.formState.errors.commissionRate.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="font-black text-[10px] uppercase tracking-widest opacity-60">
                  الفئة (Tier)
                </label>
                <Select
                  onValueChange={(v) => form.setValue("tier", v)}
                  value={form.watch("tier")}
                >
                  <SelectTrigger className="rounded-xl border-white/10 bg-white/5 h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tierOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-black text-[10px] uppercase tracking-widest opacity-60">
                الحالة
              </label>
              <Select
                onValueChange={(v) => form.setValue("status", v)}
                value={form.watch("status")}
              >
                <SelectTrigger className="rounded-xl border-white/10 bg-white/5 h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-4">
              <AdminButton
                type="submit"
                icon={editingAffiliate ? Sparkles : UserCheck}
                loading={submitting}
                className="w-full h-14 text-md font-black shadow-xl rounded-2xl"
              >
                {editingAffiliate ? "تحديث بيانات المسوق" : "حفظ المسوق الجديد"}
              </AdminButton>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
