"use client";

import { useUserPermissions } from "./_hooks/use-user-permissions";
import { permissionGroups } from "./_lib/permission-groups";
import { PermissionsSkeleton } from "./_components/permissions-skeleton";
import { PermissionsHeader } from "./_components/permissions-header";
import { RoleSummaryCard } from "./_components/role-summary-card";
import { PermissionGroupCard } from "./_components/permission-group-card";
import { PermissionsNoteCard } from "./_components/permissions-note-card";

export default function UserPermissionsPage() {
  const {
    user,
    selected,
    isLoading,
    isSaving,
    togglePermission,
    handleSave,
    router,
    userId,
  } = useUserPermissions();

  if (isLoading) return <PermissionsSkeleton />;
  if (!user) return null;

  return (
    <div className="space-y-6" dir="rtl">
      <PermissionsHeader
        userLabel={user.name || user.email}
        isSaving={isSaving}
        onBack={() => router.push(`/admin/users/${userId}`)}
        onSave={handleSave}
      />

      <RoleSummaryCard role={user.role} selectedPermissions={selected} />

      <div className="grid gap-4 lg:grid-cols-2">
        {permissionGroups.map(group => (
          <PermissionGroupCard
            key={group.title}
            title={group.title}
            permissions={group.permissions}
            selected={selected}
            onToggle={togglePermission}
          />
        ))}
      </div>

      <PermissionsNoteCard />
    </div>
  );
}