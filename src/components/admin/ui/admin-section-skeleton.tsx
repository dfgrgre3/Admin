"use client";

import * as React from "react";
import { PageHeader } from "@/components/admin/ui/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import {
  Activity,
  Archive,
  ArrowLeftRight,
  Award,
  BadgeCheck,
  BadgePercent,
  Banknote,
  BarChart3,
  Bell,
  BookOpen,
  Bot,
  Braces,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  CircleHelp,
  ClipboardList,
  Construction,
  CreditCard,
  Disc3,
  DollarSign,
  DoorOpen,
  Eye,
  FileClock,
  FileEdit,
  FileStack,
  FileText,
  FolderOpen,
  Gauge,
  Globe,
  GraduationCap,
  Hammer,
  HardDrive,
  HelpCircle,
  History,
  Hourglass,
  Images,
  Inbox,
  Info,
  Key,
  KeyRound,
  Languages,
  LayoutDashboard,
  ListChecks,
  Mail,
  Megaphone,
  MessageCircle,
  MessageCircleQuestion,
  MessageSquare,
  MessageSquareText,
  MessagesSquare,
  Network,
  Newspaper,
  PackageOpen,
  Paperclip,
  PlaySquare,
  ReceiptText,
  Repeat,
  ScanSearch,
  ScrollText,
  Search,
  Share2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldHalf,
  ShoppingCart,
  Smartphone,
  StickyNote,
  Tags,
  Target,
  TerminalSquare,
  Trash2,
  TrendingUp,
  UploadCloud,
  UserCog,
  UserRound,
  Users,
  Video,
  Vote,
  Wallet,
  XCircle,
  type LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  Activity,
  Archive,
  ArrowLeftRight,
  Award,
  BadgeCheck,
  BadgePercent,
  Banknote,
  BarChart3,
  Bell,
  BookOpen,
  Bot,
  Braces,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  CircleHelp,
  ClipboardList,
  CreditCard,
  Disc3,
  DollarSign,
  DoorOpen,
  Eye,
  FileClock,
  FileEdit,
  FileStack,
  FileText,
  FolderOpen,
  Gauge,
  Globe,
  GraduationCap,
  Hammer,
  HardDrive,
  HelpCircle,
  History,
  Hourglass,
  Images,
  Inbox,
  Info,
  Key,
  KeyRound,
  Languages,
  LayoutDashboard,
  ListChecks,
  Mail,
  Megaphone,
  MessageCircle,
  MessageCircleQuestion,
  MessageSquare,
  MessageSquareText,
  MessagesSquare,
  Network,
  Newspaper,
  PackageOpen,
  Paperclip,
  PlaySquare,
  ReceiptText,
  Repeat,
  ScanSearch,
  ScrollText,
  Search,
  Share2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldHalf,
  ShoppingCart,
  Smartphone,
  StickyNote,
  Tags,
  Target,
  TerminalSquare,
  Trash2,
  TrendingUp,
  UploadCloud,
  UserCog,
  UserRound,
  Users,
  Video,
  Vote,
  Wallet,
  XCircle,
};

interface AdminSectionSkeletonProps {
  title: string;
  description: string;
  eyebrow?: string;
  badge?: string;
  iconName?: string;
  actions?: React.ReactNode;
}

export function AdminSectionSkeleton({
  title,
  description,
  eyebrow,
  badge,
  iconName,
  actions,
}: AdminSectionSkeletonProps) {
  const Icon = (iconName && ICON_MAP[iconName]) || Construction;

  return (
    <div className="space-y-10 pb-20" dir="rtl">
      <PageHeader title={title} description={description} eyebrow={eyebrow} badge={badge}>
        {actions}
      </PageHeader>

      <div className="admin-glass p-8 rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl">
        <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
          <Icon className="h-8 w-8 text-primary" />
        </div>
        <EmptyState
          icon={Construction}
          title="قيد الإنشاء"
          description="هذه الصفحة قيد التطوير وستتوفر قريباً ضمن لوحة التحكم."
          size="lg"
        />
      </div>
    </div>
  );
}