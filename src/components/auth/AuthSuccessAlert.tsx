"use client";

import { CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AuthSuccessAlertProps {
  message: string | null;
}

/** Animated success banner shared by the auth pages' step forms. */
export default function AuthSuccessAlert({ message }: AuthSuccessAlertProps) {
  if (!message) return null;

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95, height: 0 }} animate={{ opacity: 1, scale: 1, height: "auto" }} className="mb-6">
      <Alert className="mb-6 border-green-500/20 bg-green-500/10 text-green-400" role="alert">
        <CheckCircle className="h-4 w-4" />
        <AlertDescription className="font-medium">{message}</AlertDescription>
      </Alert>
    </motion.div>
  );
}
