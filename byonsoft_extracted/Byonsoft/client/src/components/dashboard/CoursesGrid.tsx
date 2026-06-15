import React, { useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookOpen,
  Lock,
  Award,
  ChevronRight,
  Download,
  CheckCircle,
} from "lucide-react";
import type { Course, Progress as ProgressType } from "@shared/schema";
import { getProgressPct, getLessonsTotal } from "../../utils/progress";

const CATEGORY_STYLES: Record<string, string> = {
  Programming: "bg-blue-500/15 text-blue-300 border-blue-500/25",
  Business: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
  Marketing: "bg-orange-500/15 text-orange-300 border-orange-500/25",
  Design: "bg-purple-500/15 text-purple-300 border-purple-500/25",
  "AI/ML": "bg-pink-500/15 text-pink-300 border-pink-500/25",
  "Web Development": "bg-blue-500/15 text-blue-300 border-blue-500/25",
  "Digital Marketing": "bg-orange-500/15 text-orange-300 border-orange-500/25",
  "Freelancing & Agency": "bg-teal-500/15 text-teal-300 border-teal-500/25",
  "Design & Creative Skills": "bg-purple-500/15 text-purple-300 border-purple-500/25",
  "AI & Automation": "bg-pink-500/15 text-pink-300 border-pink-500/25",
};

interface CourseCardProps {
  course: Course;
  prog?: ProgressType;
  isLocked: boolean;
  isRecommended: boolean;
  price: number;
  onOpen: (course: Course) => void;
  onDownloadCert: (course: Course) => void;
}

const CourseCard = React.memo(function CourseCard({
  course,
  prog,
  isLocked,
  isRecommended,
  price,
  onOpen,
  onDownloadCert,
}: CourseCardProps) {
  const isCompleted = prog?.is_completed === true;
  const lessonsCompleted = prog?.lessons_completed ?? 0;
  const progressPct = getProgressPct(prog, course);
  const totalLessons = getLessonsTotal(course);

  const borderClass = isRecommended
    ? "border-indigo-500/40 hover:border-indigo-400/60 hover:shadow-indigo-900/20"
    : isLocked
    ? "border-slate-700/50 opacity-80 hover:opacity-100 hover:border-yellow-600/25"
    : isCompleted
    ? "border-emerald-600/30 hover:border-emerald-500/50 hover:shadow-emerald-900/15"
    : "border-slate-700/50 hover:border-blue-500/30 hover:shadow-blue-900/15";

  return (
    <Card
      className={`relative group transition-all duration-200 cursor-pointer overflow-hidden bg-slate-800/60 hover:-translate-y-0.5 hover:shadow-xl ${borderClass}`}
      onClick={() => onOpen(course)}
    >
      {/* Top accent bar */}
      {isRecommended && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 via-purple-400 to-indigo-500" />
      )}
      {!isRecommended && isCompleted && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-400" />
      )}

      <CardContent className="p-5">
        {/* Top row: category + icon */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex flex-col gap-1.5">
            <Badge
              className={`text-xs w-fit border ${
                CATEGORY_STYLES[course.category] ||
                "bg-slate-700/50 text-slate-300 border-slate-600/50"
              }`}
            >
              {course.category}
            </Badge>
            {isRecommended && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-200 bg-indigo-900/30 border border-indigo-500/30 px-2 py-0.5 rounded-full w-fit">
                ⭐ Recommended
              </span>
            )}
          </div>
          {isLocked ? (
            <Lock className="w-4 h-4 text-slate-500 shrink-0" />
          ) : isCompleted ? (
            <Award className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <ChevronRight
              className={`w-4 h-4 shrink-0 transition-colors ${
                isRecommended
                  ? "text-indigo-400 group-hover:text-indigo-300"
                  : "text-slate-500 group-hover:text-blue-400"
              }`}
            />
          )}
        </div>

        {/* Title + description */}
        <h3 className="font-semibold text-white text-sm leading-snug mb-1 group-hover:text-blue-100 transition-colors">
          {course.title}
        </h3>
        <p className="text-slate-400 text-xs leading-relaxed line-clamp-2 mb-4">
          {course.description}
        </p>

        {/* Progress */}
        <div className="space-y-1.5 mb-3">
          <div className="flex justify-between text-xs text-slate-500">
            <span>Progress</span>
            <span className={isCompleted ? "text-emerald-400 font-medium" : ""}>
              {isCompleted
                ? "✓ Completed"
                : `${lessonsCompleted}/${totalLessons} lessons`}
            </span>
          </div>
          <Progress
            value={isCompleted ? 100 : progressPct}
            className={`h-1 ${
              isCompleted
                ? "bg-slate-700 [&>div]:bg-emerald-500"
                : "bg-slate-700 [&>div]:bg-blue-500"
            }`}
          />
        </div>

        {/* CTA */}
        {isCompleted && !isLocked && (
          <Button
            size="sm"
            className="w-full bg-emerald-800/60 hover:bg-emerald-700/60 text-emerald-200 border border-emerald-700/40 font-medium text-xs gap-1.5 mt-1"
            onClick={(e) => {
              e.stopPropagation();
              onDownloadCert(course);
            }}
          >
            <Download className="w-3.5 h-3.5" /> Download Certificate
          </Button>
        )}
        {isLocked && (
          <div className="mt-3 text-center">
            <span className="text-xs text-yellow-500/80 font-medium flex items-center justify-center gap-1">
              <Lock className="w-3 h-3" /> Rs. {price}/mo — Unlock
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

interface CoursesGridProps {
  courses: Course[];
  progressList: ProgressType[];
  isLoading: boolean;
  isPremium: boolean;
  price: number;
  completedCount: number;
  totalCourses: number;
  hasRoadmapMatches: boolean;
  isTagMatch: (course: Course) => boolean;
  onOpen: (course: Course) => void;
  onDownloadCert: (course: Course) => void;
  onUpgrade: () => void;
}

export const CoursesGrid = React.memo(function CoursesGrid({
  courses,
  progressList,
  isLoading,
  isPremium,
  price,
  completedCount,
  totalCourses,
  hasRoadmapMatches,
  isTagMatch,
  onOpen,
  onDownloadCert,
  onUpgrade,
}: CoursesGridProps) {
  const getProgress = useCallback(
    (courseId: number) => progressList.find((p) => p.course_id === courseId),
    [progressList]
  );

  return (
    <section>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg font-bold text-white">
            All Courses
            <span className="text-slate-500 text-sm font-normal ml-1.5">({totalCourses})</span>
          </h2>
          {hasRoadmapMatches && (
            <span className="hidden sm:inline-flex text-xs text-indigo-400 bg-indigo-900/25 border border-indigo-700/30 px-2 py-0.5 rounded-full">
              ⭐ Sorted by roadmap
            </span>
          )}
        </div>
      </div>

      {/* Progress nudge */}
      {completedCount > 0 && totalCourses > completedCount && (
        <div className="mb-4 flex items-center gap-3 p-3 rounded-xl bg-blue-900/15 border border-blue-700/25">
          <CheckCircle className="w-4 h-4 text-blue-400 shrink-0" />
          <p className="text-blue-300 text-sm">
            {completedCount} course{completedCount > 1 ? "s" : ""} complete!{" "}
            {totalCourses - completedCount} more waiting 🚀
          </p>
        </div>
      )}

      {/* Upgrade nudge for free users */}
      {!isPremium && (
        <div className="mb-4 p-3.5 rounded-xl bg-yellow-900/15 border border-yellow-700/25 flex items-center gap-3">
          <Lock className="w-5 h-5 text-yellow-400 shrink-0" />
          <p className="text-yellow-300 text-sm flex-1">
            Upgrade to Premium (Rs. {price}/month) to unlock all {totalCourses} courses
          </p>
          <Button
            size="sm"
            onClick={onUpgrade}
            className="bg-yellow-600 hover:bg-yellow-500 text-black font-bold text-xs h-8 px-3 shrink-0"
          >
            Upgrade
          </Button>
        </div>
      )}

      {/* Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading
          ? Array(6)
              .fill(0)
              .map((_, i) => (
                <Card key={i} className="bg-slate-800/60 border-slate-700/50">
                  <CardContent className="p-5 space-y-3">
                    <Skeleton className="h-4 w-3/4 bg-slate-700/70" />
                    <Skeleton className="h-3 w-1/2 bg-slate-700/70" />
                    <Skeleton className="h-1.5 w-full bg-slate-700/70" />
                  </CardContent>
                </Card>
              ))
          : courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                prog={getProgress(course.id)}
                isLocked={!isPremium}
                isRecommended={isTagMatch(course)}
                price={price}
                onOpen={onOpen}
                onDownloadCert={onDownloadCert}
              />
            ))}
      </div>
    </section>
  );
});