import React, { useCallback } from "react";
import { Course, Progress as ProgressType } from "@/types";
import { Lock, CheckCircle, Play, Star } from "lucide-react";

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
  isRecommended?: (course: Course) => boolean;
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
  isRecommended,
  onOpen,
  onDownloadCert,
  onUpgrade,
}: CoursesGridProps) {
  const getProgress = useCallback(
    (courseId: number) => progressList.find((p) => p.course_id === courseId),
    [progressList]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">
          All Courses <span className="text-slate-500 text-sm font-normal">({totalCourses})</span>
        </h2>
        {hasRoadmapMatches && (
          <span className="text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            ⭐ Sorted by roadmap
          </span>
        )}
      </div>

      {/* Progress nudge */}
      {completedCount > 0 && totalCourses > completedCount && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-emerald-400 text-sm">
          {completedCount} course{completedCount > 1 ? "s" : ""} complete!{" "}
          {totalCourses - completedCount} more waiting 🚀
        </div>
      )}

      {/* Upgrade nudge for free users */}
      {!isPremium && (
        <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl p-4">
          <p className="text-amber-400 text-sm">
            Upgrade to Premium (Rs. {price}/month) to unlock all {totalCourses} courses
          </p>
          <button
            onClick={onUpgrade}
            className="mt-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-4 py-2 rounded-lg"
          >
            Upgrade Now
          </button>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading
          ? Array(6)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 animate-pulse h-64"
                />
              ))
          : courses.map((course) => {
              const progress = getProgress(course.id);
              const lessonsCompleted = progress?.lessons_completed ?? 0;
              const totalLessons = course.total_lessons ?? 0;
              const isCompleted = lessonsCompleted >= totalLessons && totalLessons > 0;
              const isLocked = !isPremium && course.is_premium;
              const recommended = isRecommended?.(course) ?? false;

              return (
                <div
                  key={course.id}
                  onClick={() => !isLocked && onOpen(course)}
                  className={`relative bg-slate-800/50 border rounded-xl p-4 transition-all hover:bg-slate-700/50 group ${
                    isLocked
                      ? "border-slate-700/50 opacity-60 cursor-not-allowed"
                      : "border-slate-700/50 cursor-pointer"
                  } ${recommended ? "border-amber-500/50 ring-1 ring-amber-500/20" : ""}`}
                >
                  {/* Recommended Star Badge */}
                  {recommended && (
                    <div className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-lg z-10">
                      <Star className="w-3 h-3 fill-white" />
                      AI Recommended
                    </div>
                  )}

                  {/* Top row: category + icon */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-slate-400 bg-slate-700/50 px-2 py-1 rounded-md">
                      {course.category}
                    </span>
                    {isCompleted && (
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                    )}
                  </div>

                  {/* Title + description */}
                  <h3 className="text-white font-semibold text-sm mb-1 line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-slate-400 text-xs line-clamp-2 mb-3">
                    {course.description}
                  </p>

                  {/* Progress */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-500">Progress</span>
                      <span className={isCompleted ? "text-emerald-400" : "text-slate-400"}>
                        {isCompleted
                          ? "✓ Completed"
                          : `${lessonsCompleted}/${totalLessons} lessons`}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isCompleted
                            ? "bg-emerald-500"
                            : "bg-blue-500"
                        }`}
                        style={{
                          width: `${totalLessons > 0 ? (lessonsCompleted / totalLessons) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* CTA */}
                  {isCompleted && !isLocked && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDownloadCert(course);
                      }}
                      className="w-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold py-2 rounded-lg hover:bg-emerald-500/20 transition-colors"
                    >
                      Download Certificate
                    </button>
                  )}
                  {isLocked && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpgrade();
                      }}
                      className="w-full bg-slate-700/50 border border-slate-600/50 text-slate-400 text-xs font-semibold py-2 rounded-lg flex items-center justify-center gap-2"
                    >
                      <Lock className="w-3 h-3" />
                      Rs. {price}/mo — Unlock
                    </button>
                  )}
                  {!isCompleted && !isLocked && (
                    <button className="w-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-500/20 transition-colors">
                      <Play className="w-3 h-3" />
                      Continue Learning
                    </button>
                  )}
                </div>
              );
            })}
      </div>
    </div>
  );
});
