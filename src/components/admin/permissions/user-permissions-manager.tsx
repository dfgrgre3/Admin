"use client";

import * as React from "react";
import {
  PERMISSION_CATEGORIES,
  getDangerLevelStyle,
} from "@/lib/permission-matrix-config";
import {
  PERMISSIONS,
  stripPermissionsSentinel,
} from "@/lib/permissions";
import { UserRole } from "@/types/enums";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Search,
  Save,
  RotateCcw,
  ShieldCheck,
  ShieldAlert,
  UserCog,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Plus,
  Minus,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { adminUsersApi } from "@/lib/api/admin-users-api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { logger } from "@/lib/logger";

interface StaffUser {
  id: string;
  name: string | null;
  email: string;
  username?: string | null;
  avatar?: string | null;
  role: UserRole;
  permissions: string[];
}

interface UserPermissionsManagerProps {
  onSaved?: () => void;
}

type DangerFilter = "all" | "safe" | "elevated" | "dangerous";

export function UserPermissionsManager({ onSaved }: UserPermissionsManagerProps) {
  const queryClient = useQueryClient();
  const [selectedUserId, setSelectedUserId] = React.useState<string | null>(null);
  const [editingPermissions, setEditingPermissions] = React.useState<string[]>([]);
  const [originalPermissions, setOriginalPermissions] = React.useState<string[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState<string>("all");
  const [permSearch, setPermSearch] = React.useState("");
  const [dangerFilter, setDangerFilter] = React.useState<DangerFilter>("all");
  const [showChangesOnly, setShowChangesOnly] = React.useState(false);

  const { data: staffUsers, isLoading } = useQuery<StaffUser[]>({
    queryKey: ["admin", "staff-users", searchQuery, roleFilter],
    queryFn: async () => {
      const roles = roleFilter === "all" ? ["ADMIN", "TEACHER", "MODERATOR", "SUPPORT", "SUPER_ADMIN"] : [roleFilter];
      const responses = await Promise.all(
        roles.map((role) =>
          adminUsersApi.list({ role: role as UserRole, limit: 100, search: searchQuery || undefined }),
        ),
      );
      return responses.flatMap((res) =>
        res.users.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          username: u.username,
          avatar: u.avatar,
          role: u.role,
          permissions: u.permissions || [],
        })),
      );
    },
  });

  const selectedUser = React.useMemo(
    () => staffUsers?.find((u) => u.id === selectedUserId) || null,
    [staffUsers, selectedUserId],
  );

  const updatePermissionsMutation = useMutation({
    mutationFn: async ({ userId, permissions }: { userId: string; permissions: string[] }) => {
      return adminUsersApi.update(userId, { permissions } as Partial<Record<string, unknown>>);
    },
    onSuccess: () => {
      toast.success("تم تحديث صلاحيات المستخدم بنجاح");
      queryClient.invalidateQueries({ queryKey: ["admin", "staff-users"] });
      setOriginalPermissions([...editingPermissions]);
      onSaved?.();
    },
    onError: (err) => {
      toast.error("فشل في تحديث الصلاحيات");
      logger.error("Failed to update user permissions", err);
    },
  });

  const resetPermissionsMutation = useMutation({
    mutationFn: async (userId: string) => {
      return adminUsersApi.update(userId, { permissions: [] } as any);
    },
    onSuccess: () => {
      toast.success("تم إعادة تعيين الصلاحيات إلى الوضع الافتراضي");
      queryClient.invalidateQueries({ queryKey: ["admin", "staff-users"] });
      setEditingPermissions([]);
      setOriginalPermissions([]);
    },
    onError: () => toast.error("فشل في إعادة التعيين"),
  });

  // Diff calculation
  const addedPermissions = editingPermissions.filter((p) => !originalPermissions.includes(p));
  const removedPermissions = originalPermissions.filter((p) => !editingPermissions.includes(p));
  const hasUnsavedChanges = addedPermissions.length > 0 || removedPermissions.length > 0;

  const handleSelectUser = (user: StaffUser) => {
    if (hasUnsavedChanges) {
      if (!confirm("لديك تغييرات غير محفوظة. هل تريد المتابعة وتجاهلها؟")) {
        return;
      }
    }
    setSelectedUserId(user.id);
    // The stored permission array is the single source of truth. Strip only the
    // bookkeeping sentinel — every real grant (including `admin:bypass`) stays
    // visible so it can be reviewed and revoked.
    const perms = stripPermissionsSentinel(user.permissions || []);
    setEditingPermissions(perms);
    setOriginalPermissions(perms);
    setPermSearch("");
    setDangerFilter("all");
    setShowChangesOnly(false);
  };

  const togglePermission = (perm: string) => {
    setEditingPermissions((prev) => {
      return prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm];
    });
  };

  const toggleCategoryPermissions = (_categoryId: string, permissionKeys: string[], grant: boolean) => {
    setEditingPermissions((prev) => {
      if (grant) {
        const newPerms = new Set(prev);
        permissionKeys.forEach((k) => newPerms.add(k));
        return Array.from(newPerms);
      }
      return prev.filter((p) => !permissionKeys.includes(p));
    });
  };

  const handleSave = () => {
    if (!selectedUser) return;
    // The saved list IS the effective permission set — the backend stores it
    // verbatim and `GetEffectivePermissions` reads it back without merging any
    // role defaults. Granting full bypass is irreversible from the target's
    // perspective, so require an explicit confirmation for it.
    const permsToSave = stripPermissionsSentinel(editingPermissions);
    const grantsBypass =
      permsToSave.includes(PERMISSIONS.ADMIN_BYPASS) &&
      !originalPermissions.includes(PERMISSIONS.ADMIN_BYPASS);

    if (grantsBypass) {
      const confirmed = confirm(
        "أنت على وشك منح هذا المستخدم تجاوزاً كاملاً للصلاحيات (admin:bypass).\n\n" +
          "سيحصل على وصول غير مقيد إلى كل صفحة وكل عملية وكل واجهة برمجية، " +
          "وستُتجاهل بقية الصلاحيات المحددة.\n\nهل تريد المتابعة؟",
      );
      if (!confirmed) return;
    }

    updatePermissionsMutation.mutate({
      userId: selectedUser.id,
      permissions: permsToSave,
    });
  };

  const handleReset = () => {
    if (!selectedUser) return;
    if (
      !confirm(
        "سيتم سحب جميع صلاحيات هذا المستخدم بالكامل، ولن يتمكن من الوصول إلى أي صفحة في لوحة الإدارة. هل تريد المتابعة؟",
      )
    )
      return;
    resetPermissionsMutation.mutate(selectedUser.id);
  };

  const handleDiscardChanges = () => {
    setEditingPermissions([...originalPermissions]);
  };

  const filteredPermissions = React.useMemo(() => {
    return PERMISSION_CATEGORIES.map((cat) => ({
      ...cat,
      permissions: cat.permissions.filter((p) => {
        if (dangerFilter !== "all" && p.dangerLevel !== dangerFilter) return false;
        if (!permSearch) return true;
        const query = permSearch.toLowerCase();
        return (
          p.label.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.key.toLowerCase().includes(query)
        );
      }),
    })).filter((cat) => cat.permissions.length > 0);
  }, [permSearch, dangerFilter]);

  // Changes-only view
  const changesOnlyCategories = React.useMemo(() => {
    if (!showChangesOnly) return filteredPermissions;
    return filteredPermissions
      .map((cat) => ({
        ...cat,
        permissions: cat.permissions.filter(
          (p) => addedPermissions.includes(p.key) || removedPermissions.includes(p.key),
        ),
      }))
      .filter((cat) => cat.permissions.length > 0);
  }, [filteredPermissions, showChangesOnly, addedPermissions, removedPermissions]);

  const grantedCount = editingPermissions.length;

  const totalPermissionCount = React.useMemo(
    () => PERMISSION_CATEGORIES.reduce((sum, cat) => sum + cat.permissions.length, 0),
    [],
  );

  // Bypass status reflects what is actually stored for THIS user, never a
  // hardcoded role default. A role name alone grants nothing.
  const hasBypass = editingPermissions.includes(PERMISSIONS.ADMIN_BYPASS);

  const dangerFilters: { value: DangerFilter; label: string; color: string }[] = [
    { value: "all", label: "الكل", color: "bg-muted/40 text-muted-foreground border-border/50" },
    { value: "safe", label: "آمن", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
    { value: "elevated", label: "مرتفع", color: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
    { value: "dangerous", label: "خطر", color: "bg-red-500/10 text-red-600 border-red-500/20" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-6" dir="rtl">
      {/* Users List */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ابحث عن عضو..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10 rounded-xl bg-muted/40"
          />
        </div>

        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="rounded-xl bg-muted/40">
            <Filter className="h-4 w-4 ml-2 text-muted-foreground" />
            <SelectValue placeholder="تصفية حسب الدور" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الأدوار</SelectItem>
            <SelectItem value="ADMIN">مدير النظام</SelectItem>
            <SelectItem value="SUPER_ADMIN">المدير العام</SelectItem>
            <SelectItem value="MODERATOR">مشرف</SelectItem>
            <SelectItem value="SUPPORT">الدعم الفني</SelectItem>
            <SelectItem value="TEACHER">معلم</SelectItem>
          </SelectContent>
        </Select>

        <ScrollArea className="h-[600px] rounded-2xl border border-border/50 bg-card/30">
          <div className="p-2 space-y-1">
            {isLoading ? (
              <div className="p-8 text-center text-sm text-muted-foreground">جاري التحميل...</div>
            ) : !staffUsers?.length ? (
              <div className="p-8 text-center text-sm text-muted-foreground">لا يوجد مستخدمون</div>
            ) : (
              staffUsers.map((user) => {
                const userHasChanges =
                  selectedUserId === user.id && hasUnsavedChanges;
                return (
                  <button
                    key={user.id}
                    onClick={() => handleSelectUser(user)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-xl transition-all text-right",
                      selectedUserId === user.id
                        ? "bg-primary/10 border border-primary/30 shadow-sm"
                        : "hover:bg-muted/40 border border-transparent",
                    )}
                  >
                    <Avatar className="h-10 w-10 border-2 border-border/50 flex-shrink-0">
                      <AvatarImage src={user.avatar || ""} />
                      <AvatarFallback className="font-bold bg-primary/10 text-primary text-xs">
                        {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate">{user.name || user.email}</p>
                      <p className="text-[10px] text-muted-foreground truncate" dir="ltr">{user.email}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Badge variant="outline" className="text-[8px] font-bold h-4">
                          {user.role}
                        </Badge>
                        {user.permissions?.length > 0 && (
                          <Badge className="bg-amber-500/10 text-amber-600 text-[8px] font-bold h-4 border-none">
                            {user.permissions.length} استثناء
                          </Badge>
                        )}
                        {userHasChanges && (
                          <Badge className="bg-blue-500/10 text-blue-600 text-[8px] font-bold h-4 border-none">
                            تعديلات
                          </Badge>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Permission Editor */}
      <div className="space-y-4">
        {!selectedUser ? (
          <div className="flex flex-col items-center justify-center h-[600px] rounded-2xl border border-dashed border-border/50 bg-card/20">
            <UserCog className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <p className="text-lg font-black text-muted-foreground">اختر مستخدماً لإدارة صلاحياته</p>
            <p className="text-sm text-muted-foreground/70 mt-1">يمكنك منح أو سحب صلاحيات فردية فوق صلاحيات الدور الافتراضية</p>
          </div>
        ) : (
          <>
            {/* User header */}
            <div className="rounded-2xl border border-border/50 bg-card/30 p-5 space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14 border-2 border-primary/20">
                  <AvatarImage src={selectedUser.avatar || ""} />
                  <AvatarFallback className="font-bold bg-primary/10 text-primary text-lg">
                    {selectedUser.name?.charAt(0) || selectedUser.email.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-black text-lg">{selectedUser.name || selectedUser.email}</h3>
                  <p className="text-xs text-muted-foreground" dir="ltr">{selectedUser.email}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge className={cn("text-[10px] font-black border", getRoleBadgeClass(selectedUser.role))}>
                    {getRoleLabel(selectedUser.role)}
                  </Badge>
                  {hasBypass && (
                    <Badge className="bg-red-500/10 text-red-600 text-[9px] font-bold border-none">
                      <ShieldAlert className="h-3 w-3 ml-1" />
                      تجاوز كامل
                    </Badge>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-emerald-500/10 p-3 text-center">
                  <p className="text-2xl font-black text-emerald-600">{grantedCount}</p>
                  <p className="text-[10px] font-bold text-muted-foreground">صلاحية ممنوحة</p>
                </div>
                <div className="rounded-xl bg-muted/30 p-3 text-center">
                  <p className="text-2xl font-black text-muted-foreground">{totalPermissionCount - grantedCount}</p>
                  <p className="text-[10px] font-bold text-muted-foreground">صلاحية غير ممنوحة</p>
                </div>
              </div>

              {/* The stored list is the complete effective permission set. */}
              <div className="rounded-xl bg-muted/30 border border-border/50 p-3 flex items-start gap-2">
                <ShieldCheck className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  الصلاحيات المحددة أدناه هي صلاحيات المستخدم الفعلية بالكامل. الدور الوظيفي لا يمنح أي صلاحية
                  إضافية بذاته، وما لا يتم تحديده هنا لن يظهر للمستخدم ولن يستطيع الوصول إليه.
                </p>
              </div>

              {hasBypass && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 flex items-start gap-2">
                  <ShieldAlert className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-red-600">هذا المستخدم يملك تجاوزاً كاملاً للصلاحيات</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      صلاحية <span className="font-mono">admin:bypass</span> تمنحه الوصول إلى كل شيء وتتجاوز بقية
                      التحديدات أدناه. لسحبها، أوقف مفتاح «تجاوز كامل للصلاحيات» ثم احفظ.
                    </p>
                  </div>
                </div>
              )}

              {/* Unsaved changes banner */}
              {hasUnsavedChanges && (
                <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-blue-600 flex-shrink-0" />
                    <p className="text-sm font-bold text-blue-600">
                      لديك تغييرات غير محفوظة ({addedPermissions.length} إضافة، {removedPermissions.length} حذف)
                    </p>
                  </div>
                  {/* Diff summary */}
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                    {addedPermissions.map((p) => (
                      <Badge key={`add-${p}`} className="bg-emerald-500/10 text-emerald-600 text-[8px] font-bold border-none gap-1">
                        <Plus className="h-2.5 w-2.5" />
                        {p}
                      </Badge>
                    ))}
                    {removedPermissions.map((p) => (
                      <Badge key={`rem-${p}`} className="bg-red-500/10 text-red-600 text-[8px] font-bold border-none gap-1">
                        <Minus className="h-2.5 w-2.5" />
                        {p}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleSave}
                  disabled={!hasUnsavedChanges || updatePermissionsMutation.isPending}
                  className="flex-1 h-11 rounded-xl font-bold gap-2"
                >
                  <Save className="h-4 w-4" />
                  {updatePermissionsMutation.isPending ? "جاري الحفظ..." : "حفظ التغييرات"}
                </Button>
                <Button
                  onClick={handleDiscardChanges}
                  variant="outline"
                  disabled={!hasUnsavedChanges}
                  className="h-11 rounded-xl font-bold gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  تراجع
                </Button>
                <Button
                  onClick={handleReset}
                  variant="outline"
                  disabled={resetPermissionsMutation.isPending || grantedCount === 0}
                  className="h-11 rounded-xl font-bold gap-2"
                >
                  <XCircle className="h-4 w-4" />
                  سحب الكل
                </Button>
              </div>
            </div>

            {/* Permission categories */}
            <>
                {/* Search + Filters */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="ابحث في الصلاحيات..."
                      value={permSearch}
                      onChange={(e) => setPermSearch(e.target.value)}
                      className="pr-10 rounded-xl bg-muted/40"
                    />
                  </div>

                  {/* Danger filter */}
                  <div className="flex items-center gap-1 rounded-xl bg-muted/30 p-1">
                    {dangerFilters.map((f) => (
                      <button
                        key={f.value}
                        onClick={() => setDangerFilter(f.value)}
                        className={cn(
                          "px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border",
                          dangerFilter === f.value
                            ? f.color + " shadow-sm"
                            : "text-muted-foreground border-transparent hover:bg-muted/50",
                        )}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  {/* Changes only toggle */}
                  <Button
                    variant={showChangesOnly ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowChangesOnly(!showChangesOnly)}
                    disabled={!hasUnsavedChanges}
                    className="rounded-xl gap-1.5 h-9"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    التغييرات فقط
                    {hasUnsavedChanges && (
                      <Badge className="ml-1 bg-primary/20 text-primary text-[8px] border-none h-4">
                        {addedPermissions.length + removedPermissions.length}
                      </Badge>
                    )}
                  </Button>
                </div>

                <ScrollArea className="h-[500px] rounded-2xl border border-border/50 bg-card/20">
                  <div className="p-4 space-y-6">
                    {changesOnlyCategories.length === 0 ? (
                      <div className="p-8 text-center text-sm text-muted-foreground">
                        {showChangesOnly ? "لا توجد تغييرات لعرضها" : "لا توجد صلاحيات مطابقة"}
                      </div>
                    ) : (
                      changesOnlyCategories.map((category) => {
                        const categoryPermKeys = category.permissions.map((p) => p.key);
                        const categoryAdded = categoryPermKeys.filter((k) => addedPermissions.includes(k)).length;
                        const categoryRemoved = categoryPermKeys.filter((k) => removedPermissions.includes(k)).length;

                        return (
                          <div key={category.id} className="space-y-3">
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                                {category.label}
                              </h4>
                              <Separator className="flex-1" />
                              {/* Category bulk actions */}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-[10px] font-bold text-emerald-600 hover:bg-emerald-500/10"
                                onClick={() => toggleCategoryPermissions(category.id, categoryPermKeys, true)}
                              >
                                منح الكل
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-[10px] font-bold text-red-600 hover:bg-red-500/10"
                                onClick={() => toggleCategoryPermissions(category.id, categoryPermKeys, false)}
                              >
                                سحب الكل
                              </Button>
                              {(categoryAdded > 0 || categoryRemoved > 0) && (
                                <Badge className="bg-blue-500/10 text-blue-600 text-[8px] font-bold border-none h-4">
                                  +{categoryAdded} -{categoryRemoved}
                                </Badge>
                              )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {category.permissions.map((perm) => {
                                const dangerStyle = getDangerLevelStyle(perm.dangerLevel);
                                const isChecked = editingPermissions.includes(perm.key);
                                const wasGranted = originalPermissions.includes(perm.key);
                                const isAdded = !wasGranted && isChecked;
                                const isRemoved = wasGranted && !isChecked;
                                // A stored bypass grant implies every other permission at
                                // runtime. Surface that so effective access is never hidden
                                // from whoever is editing this user.
                                const impliedByBypass =
                                  !isChecked && hasBypass && perm.key !== PERMISSIONS.ADMIN_BYPASS;

                                return (
                                  <div
                                    key={perm.key}
                                    className={cn(
                                      "flex items-center justify-between p-3 rounded-xl border transition-all",
                                      isAdded && "bg-emerald-500/5 border-emerald-500/30",
                                      isRemoved && "bg-red-500/5 border-red-500/30",
                                      isChecked && !isAdded && !isRemoved && "bg-primary/5 border-primary/20",
                                      !isChecked && !isAdded && !isRemoved && "bg-transparent border-border/30 opacity-60",
                                    )}
                                  >
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <p className="text-xs font-bold">{perm.label}</p>
                                        <Badge
                                          className={cn(
                                            "text-[7px] font-black border h-3.5 rounded-full px-1",
                                            dangerStyle.badgeClass,
                                          )}
                                        >
                                          {dangerStyle.label}
                                        </Badge>
                                      </div>
                                      <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
                                        {perm.description}
                                      </p>
                                      <div className="flex items-center gap-1 mt-1">
                                        {isChecked && !isAdded && (
                                          <Badge className="bg-emerald-500/10 text-emerald-600 text-[7px] font-black border-none h-3.5">
                                            ممنوحة
                                          </Badge>
                                        )}
                                        {impliedByBypass && (
                                          <Badge className="bg-red-500/10 text-red-600 text-[7px] font-black border-none h-3.5">
                                            نافذة عبر التجاوز الكامل
                                          </Badge>
                                        )}
                                        {isAdded && (
                                          <Badge className="bg-emerald-500/10 text-emerald-600 text-[7px] font-black border-none h-3.5 gap-0.5">
                                            <Plus className="h-2 w-2" />
                                            جديد
                                          </Badge>
                                        )}
                                        {isRemoved && (
                                          <Badge className="bg-red-500/10 text-red-600 text-[7px] font-black border-none h-3.5 gap-0.5">
                                            <Minus className="h-2 w-2" />
                                            محذوف
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                    <Switch
                                      checked={isChecked}
                                      onCheckedChange={() => togglePermission(perm.key)}
                                      className="scale-90 mr-2"
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </ScrollArea>
              </>
          </>
        )}
      </div>
    </div>
  );
}

// ── Helpers ──
function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    [UserRole.SUPER_ADMIN]: "المدير العام",
    [UserRole.ADMIN]: "مدير النظام",
    [UserRole.MODERATOR]: "مشرف",
    [UserRole.SUPPORT]: "الدعم الفني",
    [UserRole.TEACHER]: "معلم",
    [UserRole.PARENT]: "ولي أمر",
    [UserRole.STUDENT]: "طالب",
  };
  return labels[role] || role;
}

function getRoleBadgeClass(role: UserRole): string {
  const classes: Record<UserRole, string> = {
    [UserRole.SUPER_ADMIN]: "bg-red-500/10 text-red-500 border-red-500/20",
    [UserRole.ADMIN]: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    [UserRole.MODERATOR]: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    [UserRole.SUPPORT]: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    [UserRole.TEACHER]: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    [UserRole.PARENT]: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
    [UserRole.STUDENT]: "bg-slate-500/10 text-slate-500 border-slate-500/20",
  };
  return classes[role] || "";
}
