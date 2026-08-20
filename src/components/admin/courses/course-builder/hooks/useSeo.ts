"use client";

import { useCallback, type MutableRefObject } from "react";
import { seoApi } from "../api";

interface Options {
  handleError: (err: unknown, defaultMessage: string) => never;
  courseIdRef: MutableRefObject<string | undefined>;
}

export function useSeo({ handleError, courseIdRef }: Options) {
  const loadSEO = useCallback(async (id: string) => {
    try {
      const response = await seoApi.getSEO(id);
      if (response.error) throw new Error(response.error);
      return response.data;
    } catch (err) {
      handleError(err, "فشل تحميل إعدادات SEO");
      return null;
    }
  }, [handleError]);

  const updateSEO = useCallback(async (data: any) => {
    const id = courseIdRef.current;
    if (!id) throw new Error("لا يوجد معرف كورس");

    try {
      const response = await seoApi.updateSEO(id, data);
      if (response.error) throw new Error(response.error);
    } catch (err) {
      handleError(err, "فشل تحديث إعدادات SEO");
    }
  }, [handleError, courseIdRef]);

  return { loadSEO, updateSEO };
}
