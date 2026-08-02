import { Search, Plus, Filter } from "lucide-react";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserRole } from "@/types/enums";

interface AdminsToolbarProps {
  search: string;
  selectedRole: "all" | UserRole;
  onSearchChange: (value: string) => void;
  onRoleChange: (role: "all" | UserRole) => void;
  onAddAdmin: () => void;
}

export function AdminsToolbar({
  search,
  selectedRole,
  onSearchChange,
  onRoleChange,
  onAddAdmin,
}: AdminsToolbarProps) {
  return (
    <div className="rounded-[2rem] border border-border/70 bg-card/70 p-4 shadow-sm backdrop-blur-xl">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 items-center gap-3 rounded-2xl border border-border bg-background/70 px-3 py-2.5">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="البحث عن مشرف"
            className="h-9 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
            aria-label="البحث عن مشرف"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select value={selectedRole} onValueChange={(value) => onRoleChange((value as "all" | UserRole) ?? "all")}>
            <SelectTrigger className="h-10 min-w-[160px] rounded-xl border-border bg-background/70">
              <SelectValue placeholder="كل الصلاحيات" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل الصلاحيات</SelectItem>
              <SelectItem value={UserRole.SUPER_ADMIN}>مدير عام</SelectItem>
              <SelectItem value={UserRole.ADMIN}>مدير</SelectItem>
              <SelectItem value={UserRole.MODERATOR}>مشرف</SelectItem>
              <SelectItem value={UserRole.SUPPORT}>دعم فني</SelectItem>
            </SelectContent>
          </Select>

          <AdminButton variant="outline" icon={Filter} className="rounded-xl">
            فلتر
          </AdminButton>

          <AdminButton variant="gradient" icon={Plus} className="rounded-xl" onClick={onAddAdmin}>
            إضافة مشرف
          </AdminButton>
        </div>
      </div>
    </div>
  );
}
