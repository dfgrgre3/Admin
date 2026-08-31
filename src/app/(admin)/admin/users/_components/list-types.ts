import type { AdminUserListItem } from "@/lib/api/admin-users-api";
import type { UserRole } from "@/types/enums";

export interface DeleteDialogState { open: boolean; ids: string[] }
export interface RestoreDialogState { open: boolean; ids: string[] }
export interface SuspendDialogState { open: boolean; ids: string[]; reason?: string }
export interface ActivateDialogState { open: boolean; ids: string[] }
export interface MessageDialogState { open: boolean; users: AdminUserListItem[] }
export interface PasswordDialogState { open: boolean; user: AdminUserListItem | null; password?: string }
export interface VerifyDialogState { open: boolean; user: AdminUserListItem | null; type: "email" | "phone" }
export interface RoleDialogState { open: boolean; user: AdminUserListItem | null; role?: UserRole }
export interface BulkRoleDialogState { open: boolean; ids: string[]; role?: UserRole }
export interface ImpersonateDialogState { open: boolean; user: AdminUserListItem | null }
