"use client";

import { LockKeyhole } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PermissionsNoteCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <LockKeyhole className="h-5 w-5" />
          ملاحظة تنفيذية
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        الصلاحيات المعروضة هنا هي الصلاحيات الفعلية المخزنة للمستخدم؛ يمكن منحها أو سحبها مباشرة.
      </CardContent>
    </Card>
  );
}