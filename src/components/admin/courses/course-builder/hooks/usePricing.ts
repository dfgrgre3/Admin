"use client";

import { useCallback, useState, type MutableRefObject } from "react";
import { pricingApi } from "../api";
import type { Pricing } from "../types";

interface Options {
  handleError: (err: unknown, defaultMessage: string) => never;
  courseIdRef: MutableRefObject<string | undefined>;
}

export function usePricing({ handleError, courseIdRef }: Options) {
  const [pricing, setPricing] = useState<Pricing[]>([]);

  const loadPricing = useCallback(async (id: string) => {
    try {
      const response = await pricingApi.getPricing(id);
      if (response.error) throw new Error(response.error);
      setPricing(response.data || []);
    } catch (err) {
      handleError(err, "فشل تحميل التسعير");
    }
  }, [handleError]);

  const updatePricing = useCallback(async (data: Partial<Pricing>[]) => {
    const id = courseIdRef.current;
    if (!id) throw new Error("لا يوجد معرف كورس");

    try {
      const response = await pricingApi.updatePricing(id, data);
      if (response.error) throw new Error(response.error);
      if (response.data) setPricing(response.data);
    } catch (err) {
      handleError(err, "فشل تحديث التسعير");
    }
  }, [handleError, courseIdRef]);

  return { pricing, loadPricing, updatePricing };
}
