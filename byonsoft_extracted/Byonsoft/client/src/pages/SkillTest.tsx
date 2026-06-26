import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation, useSearch } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Brain, Zap, TrendingUp, Star, ArrowRight, Copy, CheckCircle,
  ChevronRight, BookOpen, Gift, Trophy, Target, Award, Share2,
  MessageCircle, RotateCcw, Users, Download, ExternalLink
} from "lucide-react";

export default function SkillTest() {
  const { user } = useAuth();
  const search = useSearch();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResult, setShowResult] = useState(false);

  const isNew = new URLSearchParams(search).get("new") === "1";

  const { data: questions, isLoading } = useQuery<{ id: number; text: string; options: string[]; category: string }[]>({
    queryKey: ["/api/questions"],
  });

  const mutation = useMutation({
    mutationFn: async (data: { answers: Record<number, string> }) => {
      const res = await apiRequest("POST", "/api/skill-test", data);
      return res.json();
    },
    onSuccess: (data) => {
      setShowResult(true);
    },
  });

  const handleOption = (questionId: number, option: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
    if (step < (questions?.length ?? 0) - 1) {
      setStep(step + 1);
    } else {
      // Calculate scores based on answers before submitting
      const finalAnswers = { ...answers, [questionId]: option };
      calculateAndSubmitScores(finalAnswers);
    }
  };

  const calculateAndSubmitScores = (finalAnswers: Record<number, string>) => {
    // Calculate skill scores based on answers
    let technical = 0, communication = 0, logical = 0, digital = 0;
    let totalQuestions = questions?.length ?? 0;
    
    // Simple scoring logic - can be customized based on question categories
    Object.entries(finalAnswers).forEach(([qId, answer]) => {
      const question = questions?.find(q => q.id === Number(qId));
      if (question) {
        const optionIndex = question.options.indexOf(answer);
        const score = Math.min(100, Math.max(10, (optionIndex + 1) * 25)); // 25, 50, 75, 100
        
        if (question.category === "technical") technical += score;
        else if (question.category === "communication") communication += score;
        else if (question.category === "logical") logical += score;
        else if (question.category === "digital") digital += score;
        else {
          // Default distribution
          technical += score * 0.3;
          communication += score * 0.2;
          logical += score * 0.3;
          digital += score * 0.2;
        }
      }
    });

    // Average out
    const count = totalQuestions > 0 ? totalQuestions : 1;
    technical = Math.round(technical / count);
    communication = Math.round(communication / count);
    logical = Math.round(logical / count);
    digital = Math.round(digital / count);

    // Ensure minimum scores
    technical = Math.max(10, Math.min(95, technical));
    communication = Math.max(10, Math.min(95, communication));
    logical = Math.max(10, Math.min(95, logical));
    digital = Math.max(10, Math.min(95, digital));

    mutation.mutate({ 
      answers: finalAnswers,
      technical,
      communication,
      logical,
      digital
    } as any);
  };

  if (isLoading) return <div className="min-h-screen bg-[#070D18] text-white flex items-center justify-center">Loading questions...</div>;
  if (!questions?.length) return <div className="min-h-screen bg-[#070D18] text-white flex items-center justify-center">No questions available.</div>;

  const question = questions[step];
  const progress = ((step + 1) / questions.length) * 100;

  if (showResult) {
    return <SkillTestResult answers={answers} />;
  }

  return (
    <div className="min-h-screen bg-[#070D18] text-white px-4">
      <header className="sticky top-0 z-40 bg-[#070D18]/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center">
              <BookOpen className="w-3 h-3 text-white" />
            </div>
            <span className="font-bold text-sm">Skilnex <span className="text-blue-400">OS</span></span>
          </div>
          <div className="flex items-center gap-2">
            {user && (
              <Link href="/dashboard">
                <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white text-xs">
                  Dashboard
                </Button>
              </Link>
            )}
            <Link href="/">
              <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white text-xs">
                Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Skill Assessment Test</h1>
          <p className="text-slate-400 text-sm">Find out your strengths and get a personalized career roadmap.</p>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-xs">Question {step + 1} of {questions.length}</span>
            <span className="text-slate-400 text-xs">{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full">
            <div className="h-2 bg-blue-500 rounded-full" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="rounded-2xl border border-white/5 bg-[#0D1626]/60 p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="secondary" className="bg-blue-500/10 text-blue-300 border-blue-500/20">
              {question.category}
            </Badge>
          </div>
          <h2 className="text-xl font-semibold text-white mb-6">{question.text}</h2>
          <div className="space-y-3">
            {question.options.map((option, i) => (
              <button
                key={i}
                onClick={() => handleOption(question.id, option)}
                className={`w-full py-3 px-4 rounded-xl border border-white/10 bg-slate-800/30 hover:bg-slate-700/50 transition-all text-left ${
                  answers[question.id] === option ? "border-blue-500 bg-blue-900/20" : ""
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {step > 0 && (
          <div className="mt-6 text-center">
            <Button variant="ghost" onClick={() => setStep(step - 1)} className="text-slate-400 hover:text-white">
              Back
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}

// Skill Test Result Component
function SkillTestResult({ answers }: { answers: Record<number, string> }) {
  const [, setLocation] = useLocation();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#070D18] text-white px-4">
      <header className="sticky top-0 z-40 bg-[#070D18]/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center">
              <BookOpen className="w-3 h-3 text-white" />
            </div>
            <span className="font-bold text-sm">Skilnex <span className="text-blue-400">OS</span></span>
          </div>
          <Link href="/dashboard">
            <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white text-xs">
              Dashboard
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 text-center">
        <div className="mb-8">
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Test Complete!</h1>
          <p className="text-slate-400">Your skill assessment has been submitted successfully.</p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-bold text-white mb-4">What's Next?</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
              <Brain className="w-5 h-5 text-blue-400" />
              <div className="text-left">
                <p className="text-white text-sm font-medium">AI Career Analysis</p>
                <p className="text-slate-400 text-xs">Get your personalized career roadmap</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 ml-auto" />
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
              <BookOpen className="w-5 h-5 text-emerald-400" />
              <div className="text-left">
                <p className="text-white text-sm font-medium">Start Learning</p>
                <p className="text-slate-400 text-xs">Begin your recommended courses</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 ml-auto" />
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-center">
          <Button
            onClick={() => setLocation("/dashboard")}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            View My Roadmap
          </Button>
          <Button
            variant="outline"
            onClick={handleCopy}
            className="border-slate-600 text-slate-300 hover:text-white"
          >
            {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? " Copied!" : " Copy Link"}
          </Button>
        </div>
      </main>
    </div>
  );
}
