import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tolo - لوحة التحكم",
  description: "نظام إدارة التعليم Tolo - لوحة التحكم الإدارية",
  robots: { index: false, follow: false },
};

export default function Home() {
  redirect("/admin");
}

