"use client";

import * as React from "react";
import { AdminDataTable } from "@/components/admin/ui/admin-table";
import { toast } from "sonner";
import { COLUMN_LABELS } from "./list-constants";
import type { ColumnDef } from "@tanstack/react-table";
import type { AdminUserListItem } from "@/lib/api/admin-users-api";
import { PageToolbar } from "./page-toolbar";

export interface UsersBulkAction {
  label: string;
  icon?: React.ElementType;
  onClick: (selectedRows: AdminUserListItem[]) => void;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  disabled?: boolean;
}

interface UsersDataTableProps {
  columns: ColumnDef<AdminUserListItem>[];
  users: AdminUserListItem[];
  isLoading: boolean;
  isError: boolean;
  hasActiveFilters: boolean;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  search: string;
  advancedFiltersOpen: boolean;
  bulkActions: UsersBulkAction[];
  onSetPage: (page: number) => void;
  onSetLimit: (limit: number) => void;
  onSetSortBy: (id: string) => void;
  onSetSortOrder: (order: "asc" | "desc") => void;
  onSetSearch: (v: string) => void;
  onUpdateQuerySearch: (v: string) => void;
  onToggleAdvancedFilters: () => void;
  onClearFilters: () => void;
  onResetPage: () => void;
  onRefetch: () => void;
  onSelectAllPages: (ids: string[]) => void;
  fetchExportRows: () => Promise<AdminUserListItem[]>;
  allSelectedIdsRef: React.RefObject<string[]>;
}

export function UsersDataTable(props: UsersDataTableProps) {
  const {
    columns, users, isLoading, hasActiveFilters, page, limit, total, totalPages,
    search, advancedFiltersOpen, bulkActions,
    onSetPage, onSetLimit, onSetSortBy, onSetSortOrder,
    onSetSearch, onUpdateQuerySearch, onToggleAdvancedFilters, onClearFilters,
    onResetPage, onRefetch, onSelectAllPages, fetchExportRows, allSelectedIdsRef,
  } = props;

  const emptyMessage = {
    title: !users.length && !isLoading ? "لا توجد نتائج" : "لا توجد بيانات",
    description: hasActiveFilters
      ? "جرّب تعديل أو مسح الفلاتر للعثور على المستخدمين."
      : "لم يتم العثور على أي مستخدمين بعد.",
  };

  const handleSelectAllPages = React.useCallback(() => {
    toast.info("جاري تحديد جميع المستخدمين...");
    void fetchExportRows().then((allUsers) => {
      const allIds = allUsers.map((u) => u.id);
      if (allIds.length > 0) {
        allSelectedIdsRef.current = allIds;
        toast.success(`تم تحديد ${allIds.length} مستخدم`);
        onSelectAllPages(allIds);
      }
    });
  }, [fetchExportRows, allSelectedIdsRef, onSelectAllPages]);

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <AdminDataTable
        columns={columns}
        data={users}
        loading={isLoading}
        serverSide
        selectable
        virtualized
        columnLabels={COLUMN_LABELS}
        onSortingChange={(sorting) => {
          const col = sorting.length > 0 ? sorting[0] : null;
          if (col) {
            onSetSortBy(col.id);
            onSetSortOrder(col.desc ? "desc" : "asc");
            onResetPage();
          }
        }}
        enableSelectAllPages
        onSelectAllPages={handleSelectAllPages}
        bulkActions={bulkActions}
        totalRows={total}
        pageCount={totalPages}
        currentPage={page}
        onPageChange={onSetPage}
        onPageSizeChange={onSetLimit}
        pageSize={limit}
        actions={{ onRefresh: onRefetch }}
        toolbar={
          <PageToolbar
            search={search}
            onSearchChange={(value) => {
              onSetSearch(value);
              onUpdateQuerySearch(value.trim());
            }}
            onUpdateQuerySearch={onUpdateQuerySearch}
            advancedFiltersOpen={advancedFiltersOpen}
            onToggleAdvancedFilters={onToggleAdvancedFilters}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={onClearFilters}
          />
        }
        emptyMessage={emptyMessage}
      />
    </div>
  );
}