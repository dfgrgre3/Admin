"use client";

import { Info } from "lucide-react";
import { Card } from "@/components/ui/card";

export function PermissionsInfoBanner() {
  return (
    <Card className="p-4 bg-primary/5 border-primary/20">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Info className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-black text-sm mb-1">كيف تعمل مصفوفة الصلاحيات؟</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            الصلاحيات تُدار بشكل فردي لكل مستخدم، وقائمة الصلاحيات المخزنة في قاعدة البيانات هي المصدر
            الوحيد والكامل لما يستطيع المستخدم فعله. الدور الوظيفي لا يمنح أي صلاحية إضافية بذاته،
            وصلاحية التجاوز الكامل (admin:bypass) يجب منحها بوعي لمنح الوصول إلى كل شيء.
          </p>
        </div>
      </div>
    </Card>
  );
}