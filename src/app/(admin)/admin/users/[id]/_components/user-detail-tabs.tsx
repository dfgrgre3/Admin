"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  Award,
  BookOpen,
  History,
  Settings,
  Shield,
  CreditCard,
  LifeBuoy,
  Bell,
} from "lucide-react";
import type { UserDetails } from "./types";
import { OverviewTab } from "./overview-tab";
import { AcademicTab } from "./academic-tab";
import { ActivityTab } from "./activity-tab";
import { AchievementsTab } from "./achievements-tab";
import { SettingsTab } from "./settings-tab";
import { SecurityTab } from "./security-tab";
import { BillingTab } from "./billing-tab";
import { SupportNotesTab } from "./support-notes-tab";
import { UserNotificationsTab } from "./user-notifications-tab";
import { UserAuditLogTab } from "../../_components/user-audit-log-tab";
import { SecurityActivitySection } from "./security-activity";

interface UserDetailTabsProps {
  user: UserDetails;
  activeTab: string;
  onTabChange: (value: string) => void;
  canManageUsers: boolean;
  canViewAudit: boolean;
  saving: boolean;
  editedUser: Partial<UserDetails>;
  setEditedUser: (user: Partial<UserDetails>) => void;
  onSave: () => void | Promise<void>;
  onSecurityChange: (updatedUser: Partial<UserDetails>) => void;
  securityBlockReason?: string;
}

export function UserDetailTabs({
  user,
  activeTab,
  onTabChange,
  canManageUsers,
  canViewAudit,
  saving,
  editedUser,
  setEditedUser,
  onSave,
  onSecurityChange,
  securityBlockReason,
}: UserDetailTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="space-y-8">
      <TabsListContainer canManageUsers={canManageUsers} canViewAudit={canViewAudit} />
      <OverviewTabPanel user={user} active="overview" />
      <AcademicTabPanel user={user} active="academic" />
      <ActivityTabPanel user={user} active="activity" />
      {canManageUsers && (
        <SettingsTabPanel
          user={user}
          editedUser={editedUser}
          setEditedUser={setEditedUser}
          onSave={onSave}
          saving={saving}
          active="settings"
        />
      )}
      <SecurityTabPanel
        user={user}
        onUserChange={onSecurityChange}
        actionBlockReason={securityBlockReason}
        active="security"
      />
      <NotificationsTabPanel user={user} active="notifications" />
      <BillingTabPanel user={user} canManage={canManageUsers} active="billing" />
      <SupportTabPanel user={user} active="support" />
      {canViewAudit && <AuditTabPanel userId={user.id} active="audit" />}
    </Tabs>
  );
}

function TabsListContainer({
  canManageUsers,
  canViewAudit,
}: {
  canManageUsers: boolean;
  canViewAudit: boolean;
}) {
  return (
    <div className="bg-card p-1.5 rounded-2xl border shadow-sm inline-flex w-full md:w-auto">
      <TabsList className="bg-transparent h-10 w-full md:w-auto">
        <TabsTrigger value="overview" className={triggerClass}><Activity className="h-4 w-4" />نظرة عامة</TabsTrigger>
        <TabsTrigger value="academic" className={triggerClass}><BookOpen className="h-4 w-4" />الأداء الأكاديمي</TabsTrigger>
        <TabsTrigger value="activity" className={triggerClass}><History className="h-4 w-4" />سجل النشاط</TabsTrigger>
        {canManageUsers && <TabsTrigger value="settings" className={triggerClass}><Settings className="h-4 w-4" />الإعدادات</TabsTrigger>}
        <TabsTrigger value="security" className={triggerClass}><Shield className="h-4 w-4" />الأمان</TabsTrigger>
        <TabsTrigger value="notifications" className={triggerClass}><Bell className="h-4 w-4" />الإشعارات</TabsTrigger>
        <TabsTrigger value="billing" className={triggerClass}><CreditCard className="h-4 w-4" />المالية</TabsTrigger>
        <TabsTrigger value="support" className={triggerClass}><LifeBuoy className="h-4 w-4" />الدعم والملاحظات</TabsTrigger>
        {canViewAudit && <TabsTrigger value="audit" className={triggerClass}><History className="h-4 w-4" />سجل التدقيق</TabsTrigger>}
      </TabsList>
    </div>
  );
}

const triggerClass = "rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg flex items-center gap-2 px-6";

function OverviewTabPanel({ user, active }: { user: UserDetails; active: string }) {
  return <TabsContent value={active}><OverviewTab user={user} /></TabsContent>;
}

function AcademicTabPanel({ user, active }: { user: UserDetails; active: string }) {
  return <TabsContent value={active}><AcademicTab user={user} /></TabsContent>;
}

function ActivityTabPanel({ user, active }: { user: UserDetails; active: string }) {
  return (
    <TabsContent value={active}>
      <ActivityTab user={user} />
      <div className="mt-8"><SecurityActivitySection user={user} /></div>
    </TabsContent>
  );
}

function AchievementsTabPanel({
  user,
  canManage,
  active,
}: {
  user: UserDetails;
  canManage: boolean;
  active: string;
}) {
  return (
    <TabsContent value={active}>
      <AchievementsTab user={user} canManage={canManage} />
    </TabsContent>
  );
}

function SettingsTabPanel({
  user,
  editedUser,
  setEditedUser,
  onSave,
  saving,
  active,
}: {
  user: UserDetails;
  editedUser: Partial<UserDetails>;
  setEditedUser: (u: Partial<UserDetails>) => void;
  onSave: () => void | Promise<void>;
  saving: boolean;
  active: string;
}) {
  return (
    <TabsContent value={active}>
      <SettingsTab
        user={user}
        setEditedUser={setEditedUser}
        handleUpdate={onSave}
        setIsEditing={() => {}}
        saving={saving}
      />
    </TabsContent>
  );
}

function SecurityTabPanel({
  user,
  onUserChange,
  actionBlockReason,
  active,
}: {
  user: UserDetails;
  onUserChange: (u: Partial<UserDetails>) => void;
  actionBlockReason?: string;
  active: string;
}) {
  return (
    <TabsContent value={active}>
      <SecurityTab user={user} actionBlockReason={actionBlockReason} onUserChange={onUserChange} />
    </TabsContent>
  );
}

function NotificationsTabPanel({ user, active }: { user: UserDetails; active: string }) {
  return <TabsContent value={active}><UserNotificationsTab user={user} /></TabsContent>;
}

function BillingTabPanel({ user, canManage, active }: { user: UserDetails; canManage: boolean; active: string }) {
  return <TabsContent value={active}><BillingTab user={user} canManage={canManage} /></TabsContent>;
}

function SupportTabPanel({ user, active }: { user: UserDetails; active: string }) {
  return <TabsContent value={active}><SupportNotesTab user={user} /></TabsContent>;
}

function AuditTabPanel({ userId, active }: { userId: string; active: string }) {
  return <TabsContent value={active}><UserAuditLogTab userId={userId} /></TabsContent>;
}