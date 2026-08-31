"use client";

import {
  getAllPermissionMetas,
  getRolePermissionCount,
  getStaffRoles,
} from "@/lib/permission-matrix-config";
import { RoleOverviewCard } from "./role-overview-card";

export function RoleOverviewGrid() {
  const staffRoles = getStaffRoles();
  const totalPermissions = getAllPermissionMetas().length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
      {staffRoles.map((role) => {
        const { total } = getRolePermissionCount(role.role);
        const percentage =
          totalPermissions > 0 ? Math.round((total / totalPermissions) * 100) : 0;
        return (
          <RoleOverviewCard
            key={role.role}
            label={role.label}
            description={role.description}
            total={total}
            totalPermissions={totalPermissions}
            percentage={percentage}
            badgeClass={role.badgeClass}
            isSystem={role.isSystem}
          />
        );
      })}
    </div>
  );
}