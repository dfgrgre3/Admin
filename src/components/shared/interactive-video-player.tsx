"use client";

import React, { useState, useRef, useEffect } from "react";
import NextImage from "next/image";
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, FileText, X, CheckCircle, XCircle, Image as ImageIcon, Link as LinkIcon, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type InteractiveQuestion = {
  id: string;
  lessonId: string;
  timePosition: number;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation?: string | null;
  mediaUrl?: string | null;
  mediaType?: 'image' | 'video' | 'link' | null;
  linkUrl?: string | null;
  groupId?: string | null;
  groupOrder?: number;
  isActive: boolean;
};

type UserAnswer = {
  questionId: string;
  isCorrect: boolean;
  selectedOption: number;
};

interface InteractiveVideoPlayerProps {
  videoUrl: string;
  lessonId: string;
  questions: InteractiveQuestion[];
  onProgress?: (currentTime: number) => void;
  onComplete?: () => void;
  className?: string;
}

export function InteractiveVideoPlayer({
  videoUrl,
  lessonId,
  questions,
  onProgress,
  onComplete,
  className,
}: InteractiveVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const [activeQuestion, setActiveQuestion] = useState<InteractiveQuestion | null>(null);
  const [activeQuestionGroup, setActiveQuestionGroup] = useState<InteractiveQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);
  
  // Load user's previous answers
  useEffect(() => {
    const loadAnswers = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        if (!token) return;
        
        const response = await fetch(`/api/courses/lessons/${lessonId}/interactive-questions/answers`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setUserAnswers(data.data || data || []);
        }
      } catch (error) {
        console.error("Failed to load answers:", error);
      }
    };
    
    loadAnswers();
  }, [lessonId]);
  
  // Check for questions at current time
  useEffect(() => {
    if (!isPlaying || activeQuestion) return;

    const unansweredQuestions = questions.filter((q) => {
      if (q.timePosition > currentTime || q.timePosition < currentTime - 2) return false;
      return !userAnswers.some((a) => a.questionId === q.id);
    });

    if (unansweredQuestions.length > 0) {
      // Group questions by groupId or time position
      const grouped = unansweredQuestions.reduce((acc, q) => {
        const key = q.groupId || q.timePosition.toString();
        if (!acc[key]) acc[key] = [];
        acc[key].push(q);
        return acc;
      }, {} as Record<string, InteractiveQuestion[]>);

      const firstGroup = Object.values(grouped)[0];
      if (firstGroup) {
        const sortedGroup = firstGroup.sort((a, b) => (a.groupOrder || 0) - (b.groupOrder || 0));

        setActiveQuestionGroup(sortedGroup);
        setActiveQuestion(sortedGroup[0] || null);
        setCurrentQuestionIndex(0);
        if (videoRef.current) {
          videoRef.current.pause();
          setIsPlaying(false);
        }
      }
    }
  }, [currentTime, questions, userAnswers, isPlaying, activeQuestion]);
  
  // Update progress callback
  useEffect(() => {
    if (onProgress) {
      onProgress(currentTime);
    }
  }, [currentTime, onProgress]);
  
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };
  
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };
  
  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = Number(e.target.value);
    
    // Check if seeking past an unanswered question
    const blockedQuestion = questions.find((q) => {
      if (q.timePosition <= newTime && !userAnswers.some((a) => a.questionId === q.id)) {
        return true;
      }
      return false;
    });
    
    if (blockedQuestion) {
      toast.error("يجب الإجابة على الأسئلة أولاً قبل المتابعة");
      return;
    }
    
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };
  
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      videoRef.current.muted = newVolume === 0;
    }
  };
  
  const handleToggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };
  
  const handleFullscreen = () => {
    if (!containerRef.current) return;
    
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };
  
  const handleAnswerSubmit = async () => {
    if (selectedOption === null || !activeQuestion) return;
    
    const correct = selectedOption === activeQuestion.correctOptionIndex;
    setIsAnswerCorrect(correct);
    setShowResult(true);
    
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        toast.error("يجب تسجيل الدخول لحفظ الإجابات");
        return;
      }
      
      const response = await fetch(`/api/interactive-questions/${activeQuestion.id}/answer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          selectedOption,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserAnswers((prev) => [
          ...prev,
          {
            questionId: activeQuestion.id,
            isCorrect: data.isCorrect,
            selectedOption,
          },
        ]);
        
        toast.success(data.message || (correct ? "إجابة صحيحة!" : "إجابة خاطئة"));
      } else {
        const error = await response.json();
        toast.error(error.error || "فشل حفظ الإجابة");
      }
    } catch (error) {
      toast.error("فشل حفظ الإجابة");
    }
  };
  
  const handleContinue = () => {
    // Check if there are more questions in the group
    if (activeQuestionGroup.length > 1 && currentQuestionIndex < activeQuestionGroup.length - 1) {
      // Move to next question in group
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setActiveQuestion(activeQuestionGroup[nextIndex] || null);
      setShowResult(false);
      setSelectedOption(null);
    } else {
      // No more questions in group, continue video
      setActiveQuestion(null);
      setActiveQuestionGroup([]);
      setCurrentQuestionIndex(0);
      setShowResult(false);
      setSelectedOption(null);
      if (videoRef.current) {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };
  
  const handleRetry = () => {
    setShowResult(false);
    setSelectedOption(null);
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  
  return (
    <div ref={containerRef} className={cn("relative bg-black rounded-xl overflow-hidden", className)}>
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={onComplete}
      />
      
      {/* Video Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
        {/* Progress Bar */}
        <div className="mb-3">
          <input
            type="range"
            min="0"
            max={duration}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
          />
          <div className="flex justify-between text-[10px] text-white/70 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
        
        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-white/20"
              onClick={handlePlayPause}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:bg-white/20"
                onClick={handleToggleMute}
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                className="w-16 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {questions.length > 0 && (
              <Badge variant="outline" className="bg-white/10 text-white border-white/20 text-[10px]">
                <FileText className="h-3 w-3 ml-1" />
                {questions.length} أسئلة
              </Badge>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-white/20"
              onClick={handleFullscreen}
            >
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Question Markers on Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-8">
        {questions.map((q) => {
          const isAnswered = userAnswers.some((a) => a.questionId === q.id);
          const position = (q.timePosition / duration) * 100;
          return (
            <div
              key={q.id}
              className={cn(
                "absolute bottom-16 w-1 h-3 rounded-sm cursor-pointer transition-all hover:h-4",
                isAnswered ? "bg-green-500" : "bg-yellow-500"
              )}
              style={{ left: `${position}%` }}
              title={`سؤال عند ${formatTime(q.timePosition)}`}
            />
          );
        })}
      </div>
      
      {/* Interactive Question Dialog */}
      <Dialog open={!!activeQuestion} onOpenChange={(open) => !open && setActiveQuestion(null)}>
        <DialogContent className="sm:max-w-[500px]" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              سؤال تفاعلي
            </DialogTitle>
          </DialogHeader>
          
          {activeQuestion && (
            <div className="space-y-4 py-4">
              {!showResult ? (
                <>
                  <div className="rounded-xl bg-primary/5 border border-primary/20 p-3">
                    <p className="text-sm font-bold">{activeQuestion.question}</p>
                  </div>

                  {/* Media Display */}
                  {activeQuestion.mediaType === 'image' && activeQuestion.mediaUrl && (
                    <div className="relative h-64 w-full rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
                      <NextImage
                        src={activeQuestion.mediaUrl}
                        alt="Question media"
                        fill
                        sizes="100vw"
                        className="object-contain bg-zinc-100 dark:bg-zinc-900"
                      />
                    </div>
                  )}

                  {activeQuestion.mediaType === 'video' && activeQuestion.mediaUrl && (
                    <div className="rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
                      <video
                        src={activeQuestion.mediaUrl}
                        controls
                        className="w-full h-auto max-h-64 bg-zinc-100 dark:bg-zinc-900"
                      />
                    </div>
                  )}

                  {activeQuestion.mediaType === 'link' && activeQuestion.linkUrl && (
                    <a
                      href={activeQuestion.linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <LinkIcon className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium text-primary">{activeQuestion.linkUrl}</span>
                      <X className="h-3 w-3 text-zinc-400 mr-auto" />
                    </a>
                  )}

                  <div className="space-y-2">
                    {activeQuestion.options.map((option, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedOption(idx)}
                        className={cn(
                          "w-full text-right p-3 rounded-xl border-2 transition-all text-sm font-medium",
                          selectedOption === idx
                            ? "border-primary bg-primary/10"
                            : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700"
                        )}
                      >
                        <span className="ml-2 font-black text-zinc-500">{idx + 1}.</span>
                        {option}
                      </button>
                    ))}
                  </div>
                  
                  <Button
                    onClick={handleAnswerSubmit}
                    disabled={selectedOption === null}
                    className="w-full h-12 rounded-xl text-xs font-bold uppercase"
                  >
                    إرسال الإجابة
                  </Button>
                </>
              ) : (
                <div className="space-y-4">
                  <div className={cn(
                    "flex items-center justify-center gap-3 p-4 rounded-xl",
                    isAnswerCorrect ? "bg-green-500/10 border border-green-500/20" : "bg-red-500/10 border border-red-500/20"
                  )}>
                    {isAnswerCorrect ? (
                      <CheckCircle className="h-8 w-8 text-green-500" />
                    ) : (
                      <XCircle className="h-8 w-8 text-red-500" />
                    )}
                    <p className="text-lg font-black">
                      {isAnswerCorrect ? "إجابة صحيحة!" : "إجابة خاطئة"}
                    </p>
                  </div>
                  
                  {!isAnswerCorrect && activeQuestion.explanation && (
                    <div className="rounded-xl bg-zinc-100 dark:bg-zinc-800 p-3">
                      <p className="text-xs font-bold text-zinc-600 dark:text-zinc-400 mb-1">الشرح:</p>
                      <p className="text-sm">{activeQuestion.explanation}</p>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    {!isAnswerCorrect && (
                      <Button onClick={handleRetry} variant="outline" className="flex-1 h-12 rounded-xl text-xs font-bold">
                        إعادة المحاولة
                      </Button>
                    )}
                    <Button onClick={handleContinue} className="flex-1 h-12 rounded-xl text-xs font-bold uppercase">
                      متابعة الفيديو
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
