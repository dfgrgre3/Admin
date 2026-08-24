"use client";

import { AlertCircle } from "lucide-react";
import { m, AnimatePresence } from "framer-motion";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AuthErrorAlertProps {
  message: string | null;
}

/** Animated error banner shared by the auth pages' credential/step forms. */
export default function AuthErrorAlert({ message }: AuthErrorAlertProps) {
  return (
    <AnimatePresence mode="wait">
      {message && (
        <m.div
          initial={{ opacity: 0, scale: 0.95, height: 0 }}
          animate={{ opacity: 1, scale: 1, height: "auto" }}
          exit={{ opacity: 0, scale: 0.95, height: 0 }}
        >
          <Alert variant="destructive" className="mb-6" role="alert">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="font-medium">{message}</AlertDescription>
          </Alert>
        </m.div>
      )}
    </AnimatePresence>
  );
}
