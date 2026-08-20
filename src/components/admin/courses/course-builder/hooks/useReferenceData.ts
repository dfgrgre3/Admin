"use client";

import { useCallback, useState } from "react";
import { referenceApi } from "../api";

export function useReferenceData(handleError: (err: unknown, defaultMessage: string) => never) {
  const [categories, setCategories] = useState<any[]>([]);
  const [levels, setLevels] = useState<any[]>([]);
  const [languages, setLanguages] = useState<any[]>([]);

  const loadCategories = useCallback(async () => {
    try {
      const response = await referenceApi.getCategories();
      if (response.error) throw new Error(response.error);
      setCategories(response.data || []);
    } catch (err) {
      handleError(err, "فشل تحميل التصنيفات");
    }
  }, [handleError]);

  const loadLevels = useCallback(async () => {
    try {
      const response = await referenceApi.getLevels();
      if (response.error) throw new Error(response.error);
      setLevels(response.data || []);
    } catch (err) {
      handleError(err, "فشل تحميل المستويات");
    }
  }, [handleError]);

  const loadLanguages = useCallback(async () => {
    try {
      const response = await referenceApi.getLanguages();
      if (response.error) throw new Error(response.error);
      setLanguages(response.data || []);
    } catch (err) {
      handleError(err, "فشل تحميل اللغات");
    }
  }, [handleError]);

  return { categories, loadCategories, levels, loadLevels, languages, loadLanguages };
}
