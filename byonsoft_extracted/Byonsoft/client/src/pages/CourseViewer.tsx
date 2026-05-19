import { useState, useEffect, useMemo } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { toEmbedUrl } from "@/lib/youtube";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ArrowLeft, MessageSquare, Send, X, CheckCircle, BookOpen,
  Loader2, PlayCircle, MessageCircle,
} from "lucide-react";
import type { Course, Lesson, Progress as ProgressType } from "@shared/schema";

interface LessonModule {
  name: string;
  lessons: Lesson[];
}

export default function CourseViewer() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [chatOpen, setChatOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [activeLessonId, setActiveLessonId] = useState<number | null>(null);

  const { data: course, isLoading: courseLoading } = useQuery<Course>({
    queryKey: [`/api/courses/${id}`],
  });

  const { data: lessons = [], isLoading: lessonsLoading } = useQuery<Lesson[]>({
    queryKey: [`/api/courses/${id}/lessons`],
    enabled: !!id,
  });

  const { data: progressList = [] } = useQuery<ProgressType[]>({
    queryKey: ["/api/progress"],
  });

  const myProgress = progressList.find((p) => p.course_id === Number(id));
  const lessonsCompleted = myProgress?.lessons_completed ?? 0;
  const totalLessons = lessons.length || 1;
  const progressPct = Math.round((lessonsCompleted / totalLessons) * 100);
  const activeLesson = lessons.find((l) => l.id === activeLessonId) ?? lessons[0] ?? null;
  const activeLessonIndex = lessons.findIndex((l) => l.id === activeLessonId);
  const isLessonCompleted = (idx: number) => idx < lessonsCompleted;
  const canMarkComplete = activeLessonIndex >= lessonsCompleted;

  // Group lessons by module_name, preserving insertion order
  const modules = useMemo<LessonModule[]>(() => {
    const map = new Map<string, Lesson[]>();
    lessons.forEach((lesson) => {
      const key = lesson.module_name?.trim() || "General Lessons";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(lesson);
    });
    return [...map.entries()].map(([name, ls]) => ({ name, lessons: ls }));
  }, [lessons]);

  // All module names open by default so the list is immediately visible
  const defaultOpenModules = useMemo(() => modules.map((m) => m.name), [modules]);

  useEffect(() => {
    if (lessons.length > 0 && activeLessonId === null) {
      setActiveLessonId(lessons[0].id);
    }
  }, [lessons, activeLessonId]);

  const updateProgress = useMutation({
    mutationFn: async (completed: number) => {
      const res = await apiRequest("POST", "/api/progress", {
        course_id: Number(id),
        lessons_completed: completed,
        is_completed: completed >= totalLessons,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
      toast({ title: "Progress updated!" });
    },
  });

  const askMentor = async () => {
    if (!question.trim() || !course) return;
    setChatLoading(true);
    try {
      const res = await apiRequest("POST", "/api/ai/mentor", {
        lesson: `${course.title} - ${activeLesson?.title ?? "Lesson"}`,
        question,
      });
      const data = await res.json();
      setAnswer(data.answer);
      setQuestion("");
    } catch (err: any) {
      toast({ title: "AI error", description: err.message, variant: "destructive" });
    } finally {
      setChatLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.subscription_status && !courseLoading) {
      setLocation("/dashboard");
    }
  }, [user, courseLoading]);

  if (courseLoading) {
    return (
      <div className="min-h-screen bg-[#0F172A] p-6 space-y-4">
        <Skeleton className="h-8 w-48 bg-slate-700" />
        <Skeleton className="h-96 w-full bg-slate-700" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center text-white">
        <p>Course not found.</p>
      </div>
    );
  }

  if (!user?.subscription_status) return null;

  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <Button
            size="icon"
            variant="ghost"
            data-testid="button-back"
            onClick={() => setLocation("/dashboard")}
            className="text-slate-400"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-white leading-tight truncate">{course.title}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge className="text-xs bg-blue-500/20 text-blue-300 border-blue-500/30">{course.category}</Badge>
              {activeLesson && (
                <span className="text-slate-400 text-xs truncate">· {activeLesson.title}</span>
              )}
            </div>
          </div>
          <a
            href="https://wa.me/923124494267?text=Hi%20Byonsoft%20Support!"
            target="_blank"
            rel="noopener noreferrer"
            data-testid="button-whatsapp-course"
            className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-semibold text-xs px-3 py-1.5 rounded-lg transition-all shrink-0"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">WhatsApp</span>
          </a>
          <Button
            data-testid="button-ai-mentor"
            onClick={() => setChatOpen(true)}
            className="bg-purple-600 text-white shrink-0"
            size="sm"
          >
            <MessageSquare className="w-4 h-4 mr-2" /> AI Mentor
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 grid lg:grid-cols-3 gap-6">
        {/* Video Player + Description */}
        <div className="lg:col-span-2 space-y-4">
          <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-700 relative">
            {lessonsLoading ? (
              <Skeleton className="w-full h-full bg-slate-800" />
            ) : activeLesson ? (
              <iframe
                key={activeLesson.id}
                data-testid="video-player"
                src={toEmbedUrl(activeLesson.video_url)}
                title={activeLesson.title}
                className="w-full h-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-slate-500">
                <PlayCircle className="w-16 h-16" />
                <p className="text-sm">No lessons added yet</p>
              </div>
            )}
          </div>

          {/* Active lesson info */}
          {activeLesson && (
            <Card className="bg-slate-800/60 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-semibold text-white">{activeLesson.title}</h2>
                    <p className="text-slate-400 text-sm mt-1">{course.description}</p>
                  </div>
                  {canMarkComplete && (
                    <Button
                      data-testid="button-mark-complete"
                      size="sm"
                      className="bg-green-600 text-white shrink-0"
                      disabled={updateProgress.isPending}
                      onClick={() => updateProgress.mutate(activeLessonIndex + 1)}
                    >
                      {updateProgress.isPending ? "Saving..." : "Mark Complete"}
                    </Button>
                  )}
                  {!canMarkComplete && activeLessonIndex !== -1 && (
                    <Badge className="bg-green-900/40 text-green-300 border-green-600/30 shrink-0">
                      <CheckCircle className="w-3 h-3 mr-1" /> Done
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Progress */}
          <Card className="bg-slate-800/60 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-400" />
                Your Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm text-slate-400">
                <span>{lessonsCompleted} of {totalLessons} lessons</span>
                <span className="text-white font-medium">{progressPct}%</span>
              </div>
              <Progress value={progressPct} className="h-2 bg-slate-700" />
              {myProgress?.is_completed && (
                <div className="flex items-center gap-2 text-green-400 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  <span>Course Completed!</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Course Content — Accordion grouped by module */}
          <Card className="bg-slate-800/60 border-slate-700">
            <CardHeader className="pb-2 px-4 pt-4">
              <CardTitle className="text-white text-sm flex items-center justify-between">
                <span>Course Content</span>
                {lessons.length > 0 && (
                  <span className="text-slate-400 text-xs font-normal">
                    {modules.length} module{modules.length !== 1 ? "s" : ""} · {lessons.length} lessons
                  </span>
                )}
              </CardTitle>
            </CardHeader>

            <CardContent className="p-0 max-h-[520px] overflow-y-auto">
              {lessonsLoading ? (
                <div className="space-y-2 p-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-9 w-full bg-slate-700 rounded-md" />
                  ))}
                </div>
              ) : lessons.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-6 px-4">No lessons yet</p>
              ) : (
                <Accordion
                  type="multiple"
                  defaultValue={defaultOpenModules}
                  className="w-full divide-y divide-slate-700/50"
                >
                  {modules.map((mod, modIdx) => {
                    const completedInModule = mod.lessons.filter((l) =>
                      isLessonCompleted(lessons.findIndex((x) => x.id === l.id))
                    ).length;
                    const allDone = completedInModule === mod.lessons.length;

                    return (
                      <AccordionItem
                        key={mod.name}
                        value={mod.name}
                        className="border-0"
                      >
                        <AccordionTrigger
                          data-testid={`module-${mod.name}`}
                          className="px-4 py-3 bg-slate-700/50 hover:bg-slate-700 hover:no-underline data-[state=open]:bg-slate-700/80 transition-colors"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0 mr-2 text-left">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 font-bold text-sm ${allDone ? "bg-green-600/30 text-green-400" : "bg-blue-600/30 text-blue-300"}`}>
                              {modIdx + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-sm font-semibold leading-tight truncate">
                                {mod.name}
                              </p>
                              <p className="text-slate-400 text-[11px] mt-0.5">
                                {completedInModule}/{mod.lessons.length} lessons
                                {allDone && <span className="text-green-400 ml-1">· Complete</span>}
                              </p>
                            </div>
                          </div>
                        </AccordionTrigger>

                        <AccordionContent className="pb-0 pt-0 bg-slate-800/40">
                          <div className="py-1">
                            {mod.lessons
                              .slice()
                              .sort((a, b) => a.title.localeCompare(b.title, undefined, { numeric: true, sensitivity: "base" }))
                              .map((lesson) => {
                                const globalIdx = lessons.findIndex((x) => x.id === lesson.id);
                                const completed = isLessonCompleted(globalIdx);
                                const active = lesson.id === activeLessonId;
                                return (
                                  <button
                                    key={lesson.id}
                                    data-testid={`lesson-${lesson.id}`}
                                    onClick={() => setActiveLessonId(lesson.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all ${
                                      active
                                        ? "bg-blue-600/20 border-l-2 border-blue-500 text-blue-300"
                                        : completed
                                        ? "text-green-400 hover:bg-slate-700/40 border-l-2 border-transparent"
                                        : "text-slate-300 hover:bg-slate-700/40 hover:text-white border-l-2 border-transparent"
                                    }`}
                                  >
                                    <div className="shrink-0 ml-2">
                                      {completed ? (
                                        <CheckCircle className="w-4 h-4 text-green-400" />
                                      ) : active ? (
                                        <PlayCircle className="w-4 h-4 text-blue-400" />
                                      ) : (
                                        <div className="w-5 h-5 rounded-full border border-slate-600 bg-slate-800/60 flex items-center justify-center">
                                          <span className="text-slate-500 text-[9px] font-bold">{globalIdx + 1}</span>
                                        </div>
                                      )}
                                    </div>
                                    <span className="text-xs leading-snug flex-1 truncate">{lesson.title}</span>
                                    {active && (
                                      <span className="text-[10px] text-blue-400 font-semibold shrink-0 bg-blue-900/40 px-1.5 py-0.5 rounded">
                                        Playing
                                      </span>
                                    )}
                                  </button>
                                );
                              })}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Floating AI Chat Widget */}
      {chatOpen && (
        <div className="fixed bottom-6 right-6 w-96 max-w-[calc(100vw-2rem)] bg-slate-800 border border-slate-600 rounded-xl shadow-2xl z-50">
          <div className="flex items-center justify-between p-4 border-b border-slate-700">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-white font-medium text-sm">AI Mentor</p>
                <p className="text-slate-400 text-xs truncate max-w-[200px]">
                  {activeLesson?.title ?? course.title}
                </p>
              </div>
            </div>
            <Button size="icon" variant="ghost" onClick={() => setChatOpen(false)} className="text-slate-400">
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="p-4 space-y-3">
            {answer && (
              <div className="bg-slate-700/60 rounded-lg p-3 max-h-[60vh] overflow-y-auto">
                <p className="text-xs text-purple-400 mb-2 font-medium">AI Mentor Response:</p>
                <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">{answer}</p>
              </div>
            )}
            <div className="space-y-2">
              <Textarea
                data-testid="input-question"
                placeholder="Ask your question about this lesson..."
                className="bg-slate-700/60 border-slate-600 text-white placeholder:text-slate-500 resize-none text-sm"
                rows={3}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    askMentor();
                  }
                }}
              />
              <Button
                data-testid="button-ask-mentor"
                onClick={askMentor}
                disabled={!question.trim() || chatLoading}
                className="w-full bg-purple-600 text-white"
                size="sm"
              >
                {chatLoading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Thinking...</>
                ) : (
                  <><Send className="w-4 h-4 mr-2" /> Ask Mentor</>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
