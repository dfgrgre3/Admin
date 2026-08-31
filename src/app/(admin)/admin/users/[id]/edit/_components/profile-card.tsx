"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { roleOptions } from "../../_components/types";
import type { UserEditFormValues } from "../_schemas/user-edit-schema";

interface ProfileCardProps {
  user: { name: string | null; email: string; username: string | null; avatar: string | null; createdAt: string | null };
  form: ReturnType<typeof import("react-hook-form").useForm<UserEditFormValues>>;
}

export function ProfileCard({ user, form }: ProfileCardProps) {
  return (
    <Card className="lg:col-span-1">
      <CardHeader className="text-center">
        <Avatar className="h-24 w-24 mx-auto mb-4">
          <AvatarImage src={user.avatar || undefined} />
          <AvatarFallback className="text-2xl">
            {user.name?.charAt(0) || user.email?.charAt(0)?.toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        <CardTitle>{user.name || "بدون اسم"}</CardTitle>
        <CardDescription>@{user.username || "بدون اسم مستخدم"}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground text-center">
          <p>عضو منذ {user.createdAt ? new Date(user.createdAt).toLocaleDateString("ar-EG") : "غير معروف"}</p>
        </div>
        <Separator />
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>الدور</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الدور" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {roleOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}