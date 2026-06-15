import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Map, Briefcase, GraduationCap, TrendingUp, ChevronRight } from "lucide-react";
import type { Course } from "@shared/schema";

interface AIRoadmapSectionProps {
  roadmap: any;
  matchedCourses: Course[];
  onImprove: () => void;
  onGetRoadmap: () => void;
}

export function AIRoadmapSection({ roadmap, matchedCourses, onImprove, onGetRoadmap }: AIRoadmapSectionProps) {
  if (!roadmap || (!roadmap.career_paths && !roadmap.recommended_courses)) {
    return (
      <Card className="p-8 border-dashed border-2 border-white/10 bg-white/5 text-center">
        <Map className="w-12 h-12 text-blue-500 mx-auto mb-4 opacity-50" />
        <h3 className="text-xl font-bold mb-2">No Career Roadmap Yet</h3>
        <p className="text-gray-400 mb-6">Complete the AI Career Assessment to get your personalized roadmap.</p>
        <Button onClick={onGetRoadmap} className="bg-blue-600 hover:bg-blue-700">
          Start Assessment
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Map className="text-blue-500" />
          AI Career Roadmap
        </h2>
        <Button variant="ghost" size="sm" onClick={onImprove} className="text-blue-400">
          Retake Assessment
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Career Paths */}
        <Card className="p-6 bg-slate-900/50 border-white/10">
          <div className="flex items-center gap-3 mb-4 text-blue-400">
            <Briefcase className="w-5 h-5" />
            <h3 className="font-bold">Career Paths</h3>
          </div>
          <div className="space-y-2">
            {roadmap.career_paths?.map((path: string, i: number) => (
              <div key={i} className="p-2 rounded bg-white/5 border border-white/10 text-sm">
                {path}
              </div>
            ))}
          </div>
          {roadmap.expected_income && (
            <div className="mt-4 pt-4 border-t border-white/5">
              <div className="text-xs text-gray-500 uppercase">Expected Income</div>
              <div className="text-green-400 font-bold">{roadmap.expected_income}</div>
            </div>
          )}
        </Card>

        {/* Recommended Courses */}
        <Card className="p-6 bg-slate-900/50 border-white/10 md:col-span-2">
          <div className="flex items-center gap-3 mb-4 text-purple-400">
            <GraduationCap className="w-5 h-5" />
            <h3 className="font-bold">Recommended Courses</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {roadmap.recommended_courses?.map((course: any, i: number) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs text-purple-400 font-bold">
                  {i + 1}
                </div>
                <div className="text-sm font-medium truncate">
                   {typeof course === 'string' ? course : course.title}
                </div>
              </div>
            ))}
          </div>

          {/* Learning Order / Step-by-step */}
          {roadmap.learning_path && (
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-3 text-orange-400">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-bold">Learning Order</span>
              </div>
              <div className="text-sm text-gray-400 bg-orange-500/5 p-4 rounded-lg border border-orange-500/10 leading-relaxed">
                {roadmap.learning_path}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
