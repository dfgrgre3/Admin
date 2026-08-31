"use client";

import * as React from "react";
import { PaymentList, PaymentLoadingState } from "../_tabs/_payments/payment-list";
import { PaymentStats } from "../_tabs/_payments/payment-stats";
import type { Payment, UserPaymentsTabProps } from "../_tabs/_payments/payment-types";

export function UserPaymentsTab({ userId: _userId }: UserPaymentsTabProps) {
  const [payments] = React.useState<Payment[]>([]);
  const [loading] = React.useState(false);

  if (loading) return <PaymentLoadingState />;

  return (
    <div className="space-y-4">
      <PaymentStats payments={payments} />
      <PaymentList payments={payments} />
    </div>
  );
}