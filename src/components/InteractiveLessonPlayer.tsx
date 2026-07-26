"use client";

import React, { useState } from "react";
import { 
  Play, Pause, Volume2, Bookmark, HelpCircle, Shield, Download, FileText, 
  CheckCircle, Plus, ChevronRight, Lock, Eye, AlertCircle, Clock
} from "lucide-react";

interface InteractiveQuiz {
  id: string;
  timestampSec: number;
  question: string;
  options: string[];
  correctIndex: number;
}

interface VideoNote {
  id: string;
  timestampSec: number;
  note: string;
  createdAt: string;
}

interface LessonProps {
  lessonId: string;
  title: string;
  videoUrl?: string;
  studentName: string;
  studentEmail: string;
  quizzes?: InteractiveQuiz[];
}

export default function InteractiveLessonPlayer({
  lessonId,
  title,
  videoUrl,
  studentName,
  studentEmail,
  quizzes = []
}: LessonProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(60);
  const [activeTab, setActiveTab] = useState<"overview" | "notes" | "quizzes" | "attachments">("overview");
  const [notes, setNotes] = useState<VideoNote[]>([]);
  const [newNote, setNewNote] = useState("");
  const [activeQuizPopup, setActiveQuizPopup] = useState<InteractiveQuiz | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<string | null>(null);

  const videoRef = React.useRef<HTMLVideoElement>(null);

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = Math.floor(videoRef.current.currentTime);
    setCurrentTime(current);

    // Check inline interactive quiz popup
    const popup = quizzes.find((q) => Math.floor(q.timestampSec) === current);
    if (popup && isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
      setActiveQuizPopup(popup);
    }
  };

  const handlePlayPause = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    const noteObj: VideoNote = {
      id: Date.now().toString(),
      timestampSec: currentTime,
      note: newNote,
      createdAt: new Date().toLocaleTimeString("ar-EG")
    };

    setNotes([noteObj, ...notes]);
    setNewNote("");
  };

  const handleSeekTo = (sec: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = sec;
    setCurrentTime(sec);
  };

  const handleQuizSubmit = () => {
    if (selectedOption === null || !activeQuizPopup) return;
    if (selectedOption === activeQuizPopup.correctIndex) {
      setQuizFeedback("إجابة صحيحة! أحسنت 🌟");
      setTimeout(() => {
        setActiveQuizPopup(null);
        setSelectedOption(null);
        setQuizFeedback(null);
        videoRef.current?.play();
        setIsPlaying(true);
      }, 1500);
    } else {
      setQuizFeedback("إجابة غير صحيحة، حاول مرة أخرى.");
    }
  };

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6 bg-slate-950 text-slate-100 min-h-screen font-sans dir-rtl" dir="rtl">
      {/* Main Video & Content Area */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Video Player Wrapper with Foreground Dynamic Watermark */}
        <div className="relative rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-2xl group">
          <video
            ref={videoRef}
            src={videoUrl}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={() => setDuration(Math.floor(videoRef.current?.duration || 0))}
            className="w-full aspect-video object-contain"
          />

          {/* DYNAMIC WATERMARK (SECURITY & ANTI-PIRACY) */}
          <div
            aria-hidden="true"
            className="absolute top-8 right-8 pointer-events-none select-none opacity-70 bg-black/60 px-3 py-1.5 rounded-lg border border-slate-700/70 backdrop-blur-md text-xs text-amber-300 font-mono flex items-center gap-2 animate-pulse"
          >
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span>{studentName} • {studentEmail}</span>
          </div>

          {/* INTERACTIVE QUIZ OVERLAY POPUP */}
          {activeQuizPopup && (
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-6 z-30 animate-fadeIn">
              <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl p-6 max-w-lg w-full shadow-2xl text-right">
                <div className="flex items-center gap-2 text-indigo-400 font-semibold mb-3">
                  <HelpCircle className="w-5 h-5" />
                  <span>سؤال تفاعلي عند الدقيقة ({formatTime(activeQuizPopup.timestampSec)})</span>
                </div>
                <h3 className="text-xl font-bold text-slate-100 mb-4">{activeQuizPopup.question}</h3>
                
                <div className="flex flex-col gap-2.5 mb-6">
                  {activeQuizPopup.options.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedOption(idx)}
                      className={`p-3.5 rounded-xl border text-right font-medium transition-all ${
                        selectedOption === idx
                          ? "bg-indigo-600/20 border-indigo-500 text-indigo-200 shadow-lg shadow-indigo-500/10"
                          : "bg-slate-800/50 border-slate-700 hover:border-slate-600 text-slate-300"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>

                {quizFeedback && (
                  <div className={`p-3 rounded-xl mb-4 text-sm font-semibold ${quizFeedback.includes("صحيحة!") ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-rose-500/20 text-rose-300 border border-rose-500/30"}`}>
                    {quizFeedback}
                  </div>
                )}

                <button
                  onClick={handleQuizSubmit}
                  disabled={selectedOption === null}
                  className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg transition-all"
                >
                  تأكيد الإجابة والمتابعة
                </button>
              </div>
            </div>
          )}

          {/* Controls Bar */}
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden cursor-pointer">
              <div 
                className="bg-indigo-500 h-full transition-all duration-150" 
                style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button onClick={handlePlayPause} className="p-2 rounded-full hover:bg-slate-800 text-slate-200">
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
                </button>
                <span className="text-xs font-mono text-slate-400">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setActiveTab("notes")} 
                  className="flex items-center gap-1.5 text-xs bg-slate-800/80 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 rounded-lg text-indigo-300 font-medium"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  إضافة ملاحظة عند {formatTime(currentTime)}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Title & Metadata */}
        <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div>
            <h1 className="text-xl font-bold text-slate-100">{title}</h1>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
              <span>كورس التطوير المتقدم</span>
              <span>•</span>
              <span className="text-emerald-400 font-medium">معاينة مجانية متاحة</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              إصدار الكورس v1.2
            </span>
          </div>
        </div>

        {/* Tabs Content */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col flex-1">
          <div className="flex border-b border-slate-800 bg-slate-950/50">
            {[
              { id: "overview", label: "نظرة عامة" },
              { id: "notes", label: `الملاحظات الزمانية (${notes.length})` },
              { id: "quizzes", label: `الأسئلة التفاعلية (${quizzes.length})` },
              { id: "attachments", label: "المرفقات والملفات" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-3.5 text-sm font-semibold transition-all border-b-2 ${
                  activeTab === tab.id
                    ? "border-indigo-500 text-indigo-400 bg-slate-900"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === "overview" && (
              <div className="text-slate-300 text-sm leading-relaxed space-y-4">
                <p>في هذا الدرس سنتعرف على المعمارية البرمجية الأساسية لإدارة الدروس التفاعلية، حماية الفيديوهات من خلال التشفير والعلامات المائية الرقمية، وإضافة الأسئلة الزمنية لمنع الانقطاع وتحسين التفاعل.</p>
              </div>
            )}

            {activeTab === "notes" && (
              <div className="flex flex-col gap-4">
                <form onSubmit={handleAddNote} className="flex gap-2">
                  <input
                    type="text"
                    placeholder={`إضافة ملاحظة عند الدقيقة ${formatTime(currentTime)}...`}
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2.5 rounded-xl text-sm transition-all flex items-center gap-1.5">
                    <Plus className="w-4 h-4" /> حفظ الملاحظة
                  </button>
                </form>

                <div className="flex flex-col gap-2 mt-2">
                  {notes.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-6">لا توجد ملاحظات زمنية مسجلة بعد.</p>
                  ) : (
                    notes.map((n) => (
                      <div key={n.id} className="flex items-center justify-between bg-slate-950/60 border border-slate-800/80 p-3.5 rounded-xl">
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => handleSeekTo(n.timestampSec)}
                            className="bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 px-2.5 py-1 rounded-lg font-mono text-xs font-bold border border-indigo-500/30"
                          >
                            {formatTime(n.timestampSec)}
                          </button>
                          <span className="text-sm text-slate-200">{n.note}</span>
                        </div>
                        <span className="text-xs text-slate-500 font-mono">{n.createdAt}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === "quizzes" && (
              <div className="flex flex-col gap-3">
                {quizzes.map((q) => (
                  <div key={q.id} className="flex items-center justify-between bg-slate-950/60 border border-slate-800 p-4 rounded-xl">
                    <div className="flex items-center gap-3">
                      <HelpCircle className="w-5 h-5 text-indigo-400" />
                      <div>
                        <p className="text-sm font-semibold text-slate-200">{q.question}</p>
                        <p className="text-xs text-slate-400 mt-0.5">سؤال يظهر عند الدقيقة ({formatTime(q.timestampSec)})</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleSeekTo(q.timestampSec)}
                      className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg text-slate-300 font-medium"
                    >
                      انتقال للنقطة
                    </button>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "attachments" && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between bg-slate-950/60 border border-slate-800 p-4 rounded-xl">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-purple-400" />
                    <div>
                      <p className="text-sm font-semibold text-slate-200">الملف التوضيحي للدرس (PDF)</p>
                      <p className="text-xs text-slate-500">الحجم: 2.4 MB</p>
                    </div>
                  </div>
                  <button className="flex items-center gap-1.5 text-xs bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 px-3.5 py-2 rounded-lg font-medium transition-all">
                    <Download className="w-3.5 h-3.5" /> تحميل
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
