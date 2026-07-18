"use client";

import * as React from "react";
import { PageHeader } from "@/components/admin/ui/page-header";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Library, Plus, Filter } from "lucide-react";
import { cmsApi, QUESTION_TYPES, BankQuestion } from "@/lib/api/cms-api";

export default function QuestionBankPage() {
  const qc = useQueryClient();
  const [filters, setFilters] = React.useState({ difficulty: "", type: "", topic: "" });
  const [showForm, setShowForm] = React.useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "bank-questions", filters],
    queryFn: () => cmsApi.listBankQuestions(filters),
  });

  const createMutation = useMutation({
    mutationFn: (body: Partial<BankQuestion>) => cmsApi.createBankQuestion(body),
    onSuccess: () => {
      toast.success("تمت إضافة السؤال للبنك");
      qc.invalidateQueries({ queryKey: ["admin", "bank-questions"] });
      setShowForm(false);
    },
    onError: () => toast.error("فشل الإضافة"),
  });

  const questions = data ?? [];
  const typeLabel = (t: string) => QUESTION_TYPES.find((x) => x.value === t)?.label ?? t;

  return (
    <div className="space-y-6">
      <PageHeader title="بنك الأسئلة" description="مكتبة مركزية من الأسئلة المفهرسة (حسب المادة/الموضوع/الصعوبة) لتوليد امتحانات عشوائية" />

      <div className="flex flex-wrap items-center gap-3">
        <select value={filters.difficulty} onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
          className="rounded-lg border px-3 py-2 text-sm">
          <option value="">كل الصعوبات</option>
          <option value="easy">سهل</option>
          <option value="medium">متوسط</option>
          <option value="hard">صعب</option>
        </select>
        <select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          className="rounded-lg border px-3 py-2 text-sm">
          <option value="">كل الأنواع</option>
          {QUESTION_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <input value={filters.topic} onChange={(e) => setFilters({ ...filters, topic: e.target.value })}
          placeholder="موضوع (مثل: كهرباء)" className="rounded-lg border px-3 py-2 text-sm" />
        <AdminButton variant="outline"><Filter className="mr-1 h-4 w-4" /> تصفية</AdminButton>
        <AdminButton onClick={() => setShowForm(!showForm)}><Plus className="mr-1 h-4 w-4" /> سؤال جديد</AdminButton>
      </div>

      {showForm && (
        <NewQuestionForm onSubmit={(b) => createMutation.mutate(b)} loading={createMutation.isPending} />
      )}

      {isLoading ? (
        <div className="text-center text-muted-foreground py-10">جاري التحميل...</div>
      ) : (
        <div className="rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="p-3 text-right">السؤال</th>
                <th className="p-3 text-right">النوع</th>
                <th className="p-3 text-right">الموضوع</th>
                <th className="p-3 text-right">الصعوبة</th>
                <th className="p-3 text-right">النقاط</th>
                <th className="p-3 text-right">الاستخدام</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q) => (
                <tr key={q.id} className="border-t">
                  <td className="p-3 max-w-md truncate">{q.text}</td>
                  <td className="p-3">{typeLabel(q.type)}</td>
                  <td className="p-3">{q.topic ?? "-"}</td>
                  <td className="p-3">{q.difficulty}</td>
                  <td className="p-3">{q.points}</td>
                  <td className="p-3">{q.usageCount}</td>
                </tr>
              ))}
              {questions.length === 0 && (
                <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">لا توجد أسئلة</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function NewQuestionForm({ onSubmit, loading }: { onSubmit: (b: Partial<BankQuestion>) => void; loading: boolean }) {
  const [text, setText] = React.useState("");
  const [type, setType] = React.useState("MCQ");
  const [topic, setTopic] = React.useState("");
  const [difficulty, setDifficulty] = React.useState("medium");
  const [options, setOptions] = React.useState("");

  return (
    <div className="rounded-lg border bg-muted/20 p-4 space-y-3">
      <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="نص السؤال"
        className="w-full rounded-lg border p-2 text-sm" rows={3} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <select value={type} onChange={(e) => setType(e.target.value)} className="rounded-lg border px-3 py-2 text-sm">
          {QUESTION_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="الموضوع" className="rounded-lg border px-3 py-2 text-sm" />
        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="rounded-lg border px-3 py-2 text-sm">
          <option value="easy">سهل</option>
          <option value="medium">متوسط</option>
          <option value="hard">صعب</option>
        </select>
        {(type === "MCQ" || type === "MULTI_SELECT") && (
          <input value={options} onChange={(e) => setOptions(e.target.value)} placeholder="الخيارات (مفصولة بفاصلة)" className="rounded-lg border px-3 py-2 text-sm" />
        )}
      </div>
      <AdminButton disabled={!text || loading} onClick={() => onSubmit({
        text, type, topic, difficulty, options: options ? options.split(",").map((o) => o.trim()) : [],
      })}>{loading ? "جاري الحفظ..." : "حفظ السؤال"}</AdminButton>
    </div>
  );
}
