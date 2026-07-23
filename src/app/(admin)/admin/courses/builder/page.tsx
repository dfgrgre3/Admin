"use client";

import React, { useState } from "react";
import InteractiveLessonPlayer from "@/components/InteractiveLessonPlayer";
import { 
  BookOpen, Layers, CheckCircle2, Clock, GitBranch, ArrowLeftRight, 
  Eye, FileText, Plus, ChevronRight, Settings, ShieldAlert, Award
} from "lucide-react";

export default function LmsCourseEditorPage() {
  const [courseStatus, setCourseStatus] = useState<"DRAFT" | "PENDING_REVIEW" | "PUBLISHED">("DRAFT");
  const [previewMode, setPreviewMode] = useState<"builder" | "player">("builder");

  const [sections, setSections] = useState([
    {
      id: "sec-1",
      title: "الوحدة الأولى: الأساسيات والمدخل التأسيسي",
      orderIndex: 0,
      lessons: [
        { id: "les-1", title: "المقدمة في بناء تطبيقات LMS المعقدة", type: "VIDEO", duration: "12:30", isFreePreview: true },
        { id: "les-2", title: "المتطلبات السابقة وبنية البيانات", type: "TEXT", duration: "05:00", isFreePreview: false }
      ]
    },
    {
      id: "sec-2",
      title: "الوحدة الثانية: Drip Content وحماية المحتوى",
      orderIndex: 1,
      lessons: [
        { id: "les-3", title: "جدولة الدروس وتوقيت الإتاحة", type: "VIDEO", duration: "18:45", isFreePreview: false }
      ]
    }
  ]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans dir-rtl" dir="rtl">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl mb-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 rounded-2xl">
            <BookOpen className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-100">كورس البرمجة المتقدمة ومعمارية الأنظمة</h1>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                courseStatus === "PUBLISHED" 
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : courseStatus === "PENDING_REVIEW"
                  ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  : "bg-slate-800 text-slate-400 border-slate-700"
              }`}>
                {courseStatus}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-3">
              <span>الإصدار الحالية: v1.0</span>
              <span>•</span>
              <span>عدد الطلاب المسجلين: 142</span>
            </p>
          </div>
        </div>

        {/* Action Controls & Workflow State buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPreviewMode(previewMode === "builder" ? "player" : "builder")}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-200 transition-all shadow-md"
          >
            <Eye className="w-4 h-4 text-indigo-400" />
            {previewMode === "builder" ? "معاينة كطالب" : "العودة للتحرير"}
          </button>

          {courseStatus === "DRAFT" && (
            <button
              onClick={() => setCourseStatus("PENDING_REVIEW")}
              className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md"
            >
              <Clock className="w-4 h-4" />
              إرسال للمراجعة
            </button>
          )}

          {courseStatus === "PENDING_REVIEW" && (
            <button
              onClick={() => setCourseStatus("PUBLISHED")}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md"
            >
              <CheckCircle2 className="w-4 h-4" />
              اعتماد ونشر الكورس
            </button>
          )}
        </div>
      </div>

      {previewMode === "player" ? (
        <InteractiveLessonPlayer 
          lessonId="les-1"
          title="المقدمة في بناء تطبيقات LMS المعقدة"
          studentName="مدير النظام (معاينة)"
          studentEmail="admin@system.com"
        />
      ) : (
        /* Drag-and-Drop & Section Editor Interface */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Section & Lesson Hierarchy Tree (2 Columns) */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-400" />
                أقسام الكورس والدروس (هيكلية قابلة للسحب)
              </h2>
              <button className="flex items-center gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-lg font-semibold transition-all">
                <Plus className="w-4 h-4" /> إضافة قسم جديد
              </button>
            </div>

            {sections.map((sec, secIdx) => (
              <div key={sec.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 font-bold text-xs flex items-center justify-center border border-indigo-500/20">
                      {secIdx + 1}
                    </span>
                    <h3 className="font-bold text-slate-100">{sec.title}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700">
                      + إضافة درس
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-2.5">
                  {sec.lessons.map((les) => (
                    <div key={les.id} className="flex items-center justify-between bg-slate-950/70 border border-slate-800/80 p-3.5 rounded-xl hover:border-slate-700 transition-all">
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-medium text-slate-200">{les.title}</span>
                        {les.isFreePreview && (
                          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                            معاينة مجانية
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                        <span>{les.duration}</span>
                        <Settings className="w-4 h-4 cursor-pointer hover:text-slate-200" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Course Configuration Panel (1 Column) */}
          <div className="flex flex-col gap-5">
            {/* Versioning & Cloning Box */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <h3 className="text-base font-bold text-slate-200 mb-3 flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-purple-400" />
                إدارة الإصدارات والاستنساخ
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                تتيح لك إدارة الإصدارات تجميد النسخة المنشورة حالياً وإنشاء مسودة إصدار جديد للتعديل الآمن بدون التأثير على الطلاب.
              </p>
              <div className="flex flex-col gap-2.5">
                <button className="w-full py-2.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2">
                  <GitBranch className="w-4 h-4" /> إنشاء إصدار جديد (v1.1)
                </button>
                <button className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2">
                  <ArrowLeftRight className="w-4 h-4" /> استنساخ الكورس بالكامل (Cloning)
                </button>
              </div>
            </div>

            {/* Drip Content Summary */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <h3 className="text-base font-bold text-slate-200 mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400" />
                جدولة المحتوى (Drip Content)
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                يتم فتح الدروس تلقائياً للطالب بناءً على جدول زمني محدد أو بعد مرور عدد أيام معين من التسجيل.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
