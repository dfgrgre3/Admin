"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  GENDER_OPTIONS, ONLINE_OPTIONS, PAYMENT_OPTIONS, SUBSCRIPTION_OPTIONS, VERIFIED_OPTIONS,
} from "../_components/list-constants";

interface FiltersContentProps {
  canViewFinancial: boolean;
  country: string; setCountry: (v: string) => void;
  city: string; setCity: (v: string) => void;
  gender: string; setGender: (v: string) => void;
  verified: string; setVerified: (v: string) => void;
  subscriptionStatus: string; setSubscriptionStatus: (v: string) => void;
  paymentStatus: string; setPaymentStatus: (v: string) => void;
  online: string; setOnline: (v: string) => void;
  createdFrom: string; setCreatedFrom: (v: string) => void;
  createdTo: string; setCreatedTo: (v: string) => void;
  walletMin: string; setWalletMin: (v: string) => void;
  walletMax: string; setWalletMax: (v: string) => void;
  includeDeleted: boolean; setIncludeDeleted: (v: boolean) => void;
  onFilterChange: () => void;
}

export function FiltersContent(props: FiltersContentProps) {
  const { canViewFinancial, onFilterChange } = props;
  const { country, setCountry, city, setCity, gender, setGender, verified, setVerified,
    subscriptionStatus, setSubscriptionStatus, paymentStatus, setPaymentStatus,
    online, setOnline, createdFrom, setCreatedFrom, createdTo, setCreatedTo,
    walletMin, setWalletMin, walletMax, setWalletMax, includeDeleted, setIncludeDeleted,
  } = props;

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <div className="space-y-2">
        <Label className="text-xs font-black text-muted-foreground uppercase tracking-wider">المنطقة الجغرافية</Label>
        <div className="grid grid-cols-2 gap-4">
          <Input
            value={country} onChange={(e) => { setCountry(e.target.value); onFilterChange(); }}
            placeholder="الدولة" className="h-10"
          />
          <Input
            value={city} onChange={(e) => { setCity(e.target.value); onFilterChange(); }}
            placeholder="المدينة" className="h-10"
          />
        </div>
      </div>

      <div className="space-y-4">
        <Label className="text-xs font-black text-muted-foreground uppercase tracking-wider">تفاصيل الحساب</Label>
        <div className="space-y-3">
          <Select value={gender} onValueChange={(v) => { setGender(v); onFilterChange(); }}>
            <SelectTrigger className="h-10"><SelectValue placeholder="الجنس" /></SelectTrigger>
            <SelectContent>{GENDER_OPTIONS.map((opt) => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={verified} onValueChange={(v) => { setVerified(v); onFilterChange(); }}>
            <SelectTrigger className="h-10"><SelectValue placeholder="حالة التوثيق" /></SelectTrigger>
            <SelectContent>{VERIFIED_OPTIONS.map((opt) => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={online} onValueChange={(v) => { setOnline(v); onFilterChange(); }}>
            <SelectTrigger className="h-10"><SelectValue placeholder="حالة الاتصال" /></SelectTrigger>
            <SelectContent>{ONLINE_OPTIONS.map((opt) => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        <Label className="text-xs font-black text-muted-foreground uppercase tracking-wider">تاريخ التسجيل</Label>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <span className="text-[10px] text-muted-foreground">من</span>
            <Input type="date" value={createdFrom} onChange={(e) => { setCreatedFrom(e.target.value); onFilterChange(); }} className="h-10 text-xs" />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-muted-foreground">إلى</span>
            <Input type="date" value={createdTo} onChange={(e) => { setCreatedTo(e.target.value); onFilterChange(); }} className="h-10 text-xs" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <Label className="text-xs font-black text-muted-foreground uppercase tracking-wider">الاشتراكات والمالية</Label>
        <div className="space-y-3">
          <Select value={subscriptionStatus} onValueChange={(v) => { setSubscriptionStatus(v); onFilterChange(); }}>
            <SelectTrigger className="h-10"><SelectValue placeholder="حالة الاشتراك" /></SelectTrigger>
            <SelectContent>{SUBSCRIPTION_OPTIONS.map((opt) => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
          </Select>
          {canViewFinancial && (
            <>
              <Select value={paymentStatus} onValueChange={(v) => { setPaymentStatus(v); onFilterChange(); }}>
                <SelectTrigger className="h-10"><SelectValue placeholder="حالة الدفع" /></SelectTrigger>
                <SelectContent>{PAYMENT_OPTIONS.map((opt) => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
              </Select>
              <div className="grid grid-cols-2 gap-4">
                <Input type="number" min={0} value={walletMin} onChange={(e) => { setWalletMin(e.target.value); onFilterChange(); }} placeholder="الرصيد الأدنى" className="h-10 text-xs" />
                <Input type="number" min={0} value={walletMax} onChange={(e) => { setWalletMax(e.target.value); onFilterChange(); }} placeholder="الرصيد الأقصى" className="h-10 text-xs" />
              </div>
            </>
          )}
        </div>
      </div>

      <div className="pt-4 border-t border-border">
        <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-muted/50 transition-colors">
          <input
            type="checkbox"
            checked={includeDeleted}
            onChange={(e) => { setIncludeDeleted(e.target.checked); onFilterChange(); }}
            className="h-5 w-5 rounded border-muted-foreground/30 text-primary focus:ring-primary"
          />
          <span className="text-sm font-bold">تضمين المستخدمين المحذوفين</span>
        </label>
      </div>
    </div>
  );
}