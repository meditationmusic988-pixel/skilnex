import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Zap, RotateCcw, BookOpen, Briefcase, DollarSign, ListOrdered } from "lucide-react";
import type { SkillScore } from "@shared/schema";

interface RoadmapResult {
  recommended_courses: string[];
  career_paths: string[];
  expected_income: string;
  learning_order: string;
}

function parseRoadmap(json: string | undefined | null): RoadmapResult | null {
  if (!json) return null;
  try {
    const parsed = JSON.parse(json);
    if (parsed && Array.isArray(parsed.recommended_courses)) return parsed as RoadmapResult;
  } catch {}
  return null;
}

export default function SkillTest() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [goal, setGoal] = useState("");
  const [existingSkill, setExistingSkill] = useState("");
  const [availableTool, setAvailableTool] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RoadmapResult | null>(null);
  const [showForm, setShowForm] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  const { data: skillScore, isLoading: loadingSkills } = useQuery<SkillScore | null>({
    queryKey: ["/api/skills"],
  });

  useEffect(() => {
    if (skillScore && !hydrated) {
      setHydrated(true);
      if (skillScore.goal) setGoal(skillScore.goal);
      if (skillScore.existing_skill) setExistingSkill(skillScore.existing_skill);
      if (skillScore.available_tool) setAvailableTool(skillScore.available_tool);
      const parsed = parseRoadmap(skillScore.roadmap_result);
      if (parsed) {
        setResult(parsed);
        setShowForm(false);
      }
    }
  }, [skillScore, hydrated]);

  const handleGenerate = async () => {
    if (goal.trim().length < 3) {
      toast({ title: "Too short", description: "Please describe your primary goal.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const res = await apiRequest("POST", "/api/ai/roadmap", {
        goal: goal.trim(),
        existing_skill: existingSkill.trim(),
        available_tool: availableTool.trim(),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ["/api/skills"] });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleRetake = () => {
    setResult(null);
    setShowForm(true);
  };

  if (loadingSkills) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-purple-900/40 border-t-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <Button size="icon" variant="ghost" onClick={() => setLocation("/dashboard")} className="text-slate-400" data-testid="button-back">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-bold text-white">AI Career Roadmap</h1>
            <p className="text-slate-400 text-xs">Get your personalized learning path</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-6" data-testid="loading-state">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-purple-900/40 border-t-purple-500 animate-spin" />
              <Zap className="w-6 h-6 text-purple-400 absolute inset-0 m-auto" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-white font-semibold text-lg">AI is building your roadmap...</p>
              <p className="text-slate-400 text-sm">Analyzing your background and finding the best career path</p>
              <div className="flex gap-1 justify-center mt-3">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        ) : !showForm && result ? (
          <div className="space-y-5" data-testid="result-state">
            <div className="flex items-center justify-between mb-2">
              <div className="text-left space-y-1">
                <h2 className="text-2xl font-extrabold text-white">Your AI Career Roadmap</h2>
                <p className="text-slate-400 text-sm">Personalized just for you by Byonsoft AI</p>
              </div>
              <Button
                data-testid="button-retake"
                className="bg-slate-700 hover:bg-slate-600 text-white font-bold shrink-0"
                size="sm"
                onClick={handleRetake}
              >
                <RotateCcw className="w-4 h-4 mr-1.5" />
                Retake Test
              </Button>
            </div>

            {(goal || existingSkill || availableTool) && (
              <Card className="bg-slate-800/30 border-slate-700/40" data-testid="card-saved-answers">
                <CardContent className="p-4 space-y-1.5">
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Your Answers</p>
                  {goal && <p className="text-slate-300 text-sm"><span className="text-slate-500">Goal:</span> {goal}</p>}
                  {existingSkill && <p className="text-slate-300 text-sm"><span className="text-slate-500">Skill:</span> {existingSkill}</p>}
                  {availableTool && <p className="text-slate-300 text-sm"><span className="text-slate-500">Tool:</span> {availableTool}</p>}
                </CardContent>
              </Card>
            )}

            {result.recommended_courses?.length > 0 && (
              <Card className="bg-slate-800/50 border-slate-700/60 overflow-hidden" data-testid="card-recommended-courses">
                <div className="h-1 bg-gradient-to-r from-blue-600 to-purple-600" />
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <BookOpen className="w-5 h-5 text-blue-400" />
                    <p className="text-white font-bold">Recommended Courses</p>
                  </div>
                  <div className="space-y-2.5">
                    {result.recommended_courses.map((course, i) => (
                      <div key={i} data-testid={`recommended-course-${i}`} className="flex items-start gap-3 p-3 rounded-xl bg-slate-700/30 border border-slate-600/30">
                        <span className="w-7 h-7 rounded-full bg-blue-600/30 text-blue-300 text-sm font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                        <p className="text-white text-sm font-medium leading-snug pt-0.5">{course}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {result.career_paths?.length > 0 && (
              <Card className="bg-slate-800/50 border-slate-700/60" data-testid="card-career-paths">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Briefcase className="w-5 h-5 text-green-400" />
                    <p className="text-white font-bold">Career Paths</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {result.career_paths.map((path, i) => (
                      <Badge key={i} data-testid={`career-path-${i}`} className="bg-green-900/30 border-green-600/30 text-green-300 text-sm px-4 py-2">
                        {path}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {result.expected_income && (
              <Card className="bg-gradient-to-r from-emerald-900/40 to-teal-900/30 border-emerald-600/30" data-testid="card-expected-income">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-5 h-5 text-emerald-400" />
                    <p className="text-emerald-300 text-xs font-bold uppercase tracking-widest">Expected Income</p>
                  </div>
                  <p className="text-white text-xl font-extrabold" data-testid="text-expected-income">{result.expected_income}</p>
                </CardContent>
              </Card>
            )}

            {result.learning_order && (
              <Card className="bg-slate-800/50 border-slate-700/60" data-testid="card-learning-order">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <ListOrdered className="w-5 h-5 text-cyan-400" />
                    <p className="text-white font-bold">Learning Order</p>
                  </div>
                  <div className="space-y-3" data-testid="text-learning-order">
                    {(() => {
                      const sentences = result.learning_order
                        .split(/(?<=[.!?])\s+|(?:\d+[\.\)]\s*)/)
                        .filter(s => s.trim().length > 5);
                      const steps = sentences.length >= 3
                        ? [sentences.slice(0, Math.ceil(sentences.length / 3)).join(" "),
                           sentences.slice(Math.ceil(sentences.length / 3), Math.ceil(2 * sentences.length / 3)).join(" "),
                           sentences.slice(Math.ceil(2 * sentences.length / 3)).join(" ")]
                        : sentences.length === 2
                        ? [sentences[0], sentences[1], ""]
                        : [result.learning_order, "", ""];
                      const stepConfig = [
                        { label: "Step 1", color: "text-blue-400", border: "border-blue-500/20 bg-blue-900/10" },
                        { label: "Step 2", color: "text-cyan-400", border: "border-cyan-500/20 bg-cyan-900/10" },
                        { label: "Step 3", color: "text-emerald-400", border: "border-emerald-500/20 bg-emerald-900/10" },
                      ];
                      return steps.filter(s => s.trim()).map((step, i) => (
                        <div key={i} data-testid={`learning-step-${i}`} className={`flex items-start gap-3 p-3.5 rounded-xl border ${stepConfig[i].border}`}>
                          <span className={`w-7 h-7 rounded-full bg-slate-700/60 ${stepConfig[i].color} text-xs font-bold flex items-center justify-center shrink-0 mt-0.5`}>{i + 1}</span>
                          <div>
                            <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${stepConfig[i].color}`}>{stepConfig[i].label}</p>
                            <p className="text-slate-300 text-sm leading-relaxed">{step.trim()}</p>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </CardContent>
              </Card>
            )}

          </div>
        ) : (
          <div className="space-y-6" data-testid="input-state">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-extrabold text-white">AI Career Assessment</h2>
              <p className="text-slate-400 text-sm">3 sawal jawab do, AI tumhare liye personalized career roadmap banaye ga</p>
            </div>

            <Card className="bg-slate-800/50 border-slate-700/60">
              <CardContent className="p-5 space-y-5">
                <div className="space-y-2">
                  <label className="text-slate-300 text-sm font-medium block">Q1: Aapka primary goal kya hai?</label>
                  <Textarea
                    data-testid="textarea-goal"
                    className="bg-slate-700/60 border-slate-600 text-white placeholder:text-slate-500 resize-none focus:border-blue-500 min-h-[80px]"
                    rows={3}
                    placeholder="e.g. Online earning seekhna hai, freelancing start karni hai, digital marketing mein career banana hai..."
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-slate-300 text-sm font-medium block">Q2: Aapke paas pehle se kaunsi skill hai?</label>
                  <Textarea
                    data-testid="textarea-existing-skill"
                    className="bg-slate-700/60 border-slate-600 text-white placeholder:text-slate-500 resize-none focus:border-blue-500 min-h-[80px]"
                    rows={3}
                    placeholder="e.g. Basic Canva aata hai, social media chalana aata hai, coding seekhi hai, koi skill nahi hai..."
                    value={existingSkill}
                    onChange={(e) => setExistingSkill(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-slate-300 text-sm font-medium block">Q3: Aapke paas kya tool mojood hai? (PC/Mobile etc.)</label>
                  <Textarea
                    data-testid="textarea-available-tool"
                    className="bg-slate-700/60 border-slate-600 text-white placeholder:text-slate-500 resize-none focus:border-blue-500 min-h-[80px]"
                    rows={3}
                    placeholder="e.g. Sirf mobile phone hai, laptop hai, PC hai with internet, tablet hai..."
                    value={availableTool}
                    onChange={(e) => setAvailableTool(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Button
              data-testid="button-generate-roadmap"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold shadow-xl shadow-blue-900/30"
              size="lg"
              disabled={goal.trim().length < 3}
              onClick={handleGenerate}
            >
              <Zap className="w-4 h-4 mr-2" />
              Update & Get Career Analysis
            </Button>

            <p className="text-slate-500 text-xs text-center">
              Powered by Byonsoft AI · Your personalized career path in seconds
            </p>
          </div>
        )}

      </main>
    </div>
  );
}
