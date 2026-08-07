"use client";

import React, { useState, useCallback, useEffect } from "react";
import { 
  DollarSign, 
  Tag, 
  Percent, 
  RefreshCw, 
  Loader2,
  AlertCircle,
  CheckCircle,
  Plus,
  Trash2,
  Save,
} from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCourseBuilder } from "../hooks";
import type { Pricing } from "../types";
import { Section, Button, Input, Select, Badge, Alert, Card } from "../ui";

const pricingSchema = z.object({
  type: z.enum(["FREE", "ONE_TIME", "SUBSCRIPTION", "BUNDLE"]),
  amount: z.coerce.number().min(0),
  currencyCode: z.string(),
  subscriptionDurationDays: z.coerce.number().min(1).optional().nullable(),
  isActive: z.boolean(),
});

type PricingFormData = z.infer<typeof pricingSchema>;

interface PricingStepProps {
  draft: any;
  onChange: (data: Partial<any>) => void;
  isDirty: boolean;
}

export const PricingStep: React.FC<PricingStepProps> = ({ 
  draft, 
  onChange, 
  isDirty 
}) => {
  const {
    pricing,
    loadPricing,
    updatePricing,
    isLoading,
    error,
    clearError,
  } = useCourseBuilder({ courseId: draft?.id });
  
  const [localPricing, setLocalPricing] = useState<PricingFormData[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  
  const form = useForm<{ pricings: PricingFormData[] }>({
    resolver: zodResolver(z.object({
      pricings: z.array(pricingSchema),
    })),
    defaultValues: { pricings: [] },
  });
  
  const { fields, append, remove } = useFieldArray({ 
    control: form.control, 
    name: "pricings" 
  });
  
  useEffect(() => {
    loadPricing(draft?.id || "");
  }, [draft?.id, loadPricing]);
  
  useEffect(() => {
    if (pricing.length > 0) {
      const formatted = pricing.map(p => ({
        type: p.type,
        amount: p.amount,
        currencyCode: p.currencyCode,
        subscriptionDurationDays: p.subscriptionDurationDays || null,
        isActive: p.isActive,
      }));
      setLocalPricing(formatted);
      form.reset({ pricings: formatted });
    }
  }, [pricing, form]);
  
  const handleSubmit = async (data: { pricings: PricingFormData[] }) => {
    try {
      await updatePricing(data.pricings);
      setLocalPricing(data.pricings);
      onChange({ ...draft, pricings: data.pricings });
    } catch (err) {
      console.error("Failed to update pricing:", err);
    }
  };
  
  const addPricing = () => {
    append({
      type: "ONE_TIME",
      amount: 0,
      currencyCode: "EGP",
      subscriptionDurationDays: null,
      isActive: true,
    });
  };
  
  const removePricing = (index: number) => {
    remove(index);
  };
  
  const typeLabels: Record<string, string> = {
    FREE: "مجاني",
    ONE_TIME: "مدفوع (مرة واحدة)",
    SUBSCRIPTION: "اشتراك",
    BUNDLE: "حزمة",
  };
  
  return (
    <div className="space-y-6">
      <Section title="إدارة التسعير" description="نوع التسعير، العملة، السعر، الخصم، توفر الاشتراك" icon={<DollarSign className="w-5 h-5" />}>
        {error && (
          <Alert variant="destructive" onClose={clearError} className="mb-4">
            <AlertCircle className="w-4 h-4" />
            <span>{error.message}</span>
          </Alert>
        )}
        
        {isDirty && (
          <Alert variant="warning" className="mb-4">
            <AlertCircle className="w-4 h-4" />
            <span>لديك تغييرات غير محفوظة. سيتم الحفظ تلقائياً بعد التوقف عن الكتابة.</span>
          </Alert>
        )}
        
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            خطط التسعير ({localPricing.length})
          </h3>
          <Button onClick={addPricing} icon={<Plus className="w-4 h-4" />}>
            إضافة خطة
          </Button>
        </div>
        
        {localPricing.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <DollarSign className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">لا توجد خطط تسعير</h4>
            <p className="text-gray-500 dark:text-gray-400 mb-4">أضف خطة تسعير واحدة على الأقل للكورس</p>
            <Button onClick={addPricing} icon={<Plus className="w-4 h-4" />}>
              إضافة أول خطة
            </Button>
          </div>
        ) : (
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {fields.map((field, index) => (
              <Card key={field.id} className="p-4 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          نوع الخطة <span className="text-red-500">*</span>
                        </label>
                        <Select
                          {...form.register(`pricings.${index}.type`)}
                          error={form.formState.errors.pricings?.[index]?.type?.message}
                        >
                          <option value="FREE">مجاني</option>
                          <option value="ONE_TIME">مدفوع (مرة واحدة)</option>
                          <option value="SUBSCRIPTION">اشتراك</option>
                          <option value="BUNDLE">حزمة</option>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          السعر <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          {...form.register(`pricings.${index}.amount`, { valueAsNumber: true })}
                          error={form.formState.errors.pricings?.[index]?.amount?.message}
                          placeholder="0.00"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          العملة
                        </label>
                        <Select
                          {...form.register(`pricings.${index}.currencyCode`)}
                        >
                          <option value="EGP">جنيه مصري (EGP)</option>
                          <option value="USD">دولار أمريكي (USD)</option>
                          <option value="SAR">ريال سعودي (SAR)</option>
                          <option value="AED">درهم إماراتي (AED)</option>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          مدة الاشتراك (أيام)
                        </label>
                        <Input
                          type="number"
                          min="1"
                          {...form.register(`pricings.${index}.subscriptionDurationDays`, { valueAsNumber: true })}
                          placeholder="30"
                          disabled={form.watch(`pricings.${index}.type`) !== "SUBSCRIPTION"}
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          {...form.register(`pricings.${index}.isActive`)}
                          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">خطة نشطة</span>
                      </label>
                      
                      <Badge variant="outline" className="ml-auto">
                        {typeLabels[form.watch(`pricings.${index}.type`)] || "غير محدد"}
                      </Badge>
                      
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removePricing(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        disabled={fields.length === 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            
            <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button 
                type="submit" 
                disabled={isLoading}
                icon={<Save className="w-4 h-4" />}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  "حفظ التغييرات"
                )}
              </Button>
            </div>
          </form>
        )}
      </Section>
    </div>
  );
};