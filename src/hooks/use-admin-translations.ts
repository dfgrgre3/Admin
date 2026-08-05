import * as React from "react";
import arCommon from "@/messages/ar/common.json";
import enCommon from "@/messages/en/common.json";

export function useAdminTranslations() {
  const [lang, setLang] = React.useState<"ar" | "en">("ar");

  React.useEffect(() => {
    if (typeof document !== "undefined") {
      const htmlLang = document.documentElement.lang;
      if (htmlLang === "en" || htmlLang === "ar") {
        setLang(htmlLang as "ar" | "en");
      }
    }
  }, []);

  const t = React.useCallback(
    (key: string, variables?: Record<string, string | number>) => {
      const dict: Record<string, any> = lang === "ar" ? arCommon : enCommon;
      const parts = key.split(".");
      let value: any = dict;

      for (const part of parts) {
        if (value && typeof value === "object" && part in value) {
          value = value[part];
        } else {
          return key;
        }
      }

      if (typeof value === "string") {
        if (variables) {
          let result = value;
          for (const [k, v] of Object.entries(variables)) {
            result = result.replace(new RegExp(`{{${k}}}`, "g"), String(v));
          }
          return result;
        }
        return value;
      }
      return key;
    },
    [lang]
  );

  return { t, lang };
}
