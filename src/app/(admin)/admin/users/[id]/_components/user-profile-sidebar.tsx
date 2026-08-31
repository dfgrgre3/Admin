"use client";

import * as React from "react";
import type { UserDetails } from "./types";
import { useAvatarUpload } from "../_hooks/use-avatar-upload";
import { useCopyToClipboard } from "../_hooks/use-copy-to-clipboard";
import { ProfileIdentityCard } from "./profile-identity-card";
import { ProfileBadges } from "./profile-badges";
import { ProfileLevelProgress } from "./profile-level-progress";
import { ProfileContactInfo } from "./profile-contact-info";
import { ProfileUserId } from "./profile-user-id";
import { ProfileQuickActions } from "./profile-quick-actions";

interface UserProfileSidebarProps {
  user: UserDetails;
  setActiveTab: (tab: string) => void;
  router: ReturnType<typeof import("next/navigation").useRouter>;
  onChangePassword?: () => void;
  onImpersonate?: () => void;
  canManage?: boolean;
}

export function UserProfileSidebar({
  user,
  setActiveTab,
  router,
  onChangePassword,
  onImpersonate,
  canManage = false,
}: UserProfileSidebarProps) {
  const [now] = React.useState(() => Date.now());
  const copy = useCopyToClipboard();
  const { fileInputRef, isUploading, openPicker, handleFileChange } = useAvatarUpload(user.id);

  const isOnline = user.lastLogin
    ? (now - new Date(user.lastLogin).getTime()) < 5 * 60 * 1000
    : false;

  const handleChangePassword = () => {
    if (onChangePassword) {
      onChangePassword();
    } else {
      // Fallback handled by parent — leave hook here for symmetry.
    }
  };

  return (
    <div className="lg:col-span-1 space-y-6">
      <ProfileIdentityCard
        user={user}
        canManage={canManage}
        isUploading={isUploading}
        isOnline={isOnline}
        onAvatarClick={openPicker}
        fileInputRef={fileInputRef}
        onFileChange={handleFileChange}
        onCopy={copy}
      />
      <ProfileBadges user={user} />
      <ProfileLevelProgress user={user} />
      <ProfileContactInfo user={user} isOnline={isOnline} onCopy={copy} />
      <ProfileUserId user={user} onCopy={copy} />

      {canManage && (
        <ProfileQuickActions
          user={user}
          onEdit={() => setActiveTab("settings")}
          onChangePassword={handleChangePassword}
          onPermissions={() => router.push(`/admin/users/${user.id}/permissions`)}
          onSecurity={() => setActiveTab("security")}
          onImpersonate={onImpersonate}
          onAdvancedEdit={() => router.push(`/admin/users/${user.id}/edit`)}
          onBack={() => router.push(`/admin/users/${user.id}`)}
        />
      )}
    </div>
  );
}