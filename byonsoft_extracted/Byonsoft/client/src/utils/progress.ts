import type { Course, Progress } from "@shared/schema";

export const DEFAULT_LESSONS = 10;

export const getCourseProgress = (
  course: Course,
  progressList: Progress[]
): Progress | undefined =>
  progressList.find((p) => p.course_id === course.id);

export const getLessonsTotal = (course: Course): number =>
  (course as any).total_lessons ||
  (course as any).lesson_count ||
  (course as any).lessons_count ||
  DEFAULT_LESSONS;

export const getProgressPct = (prog: Progress | undefined, course: Course): number => {
  if (!prog) return 0;
  if (prog.is_completed) return 100;
  const total = getLessonsTotal(course);
  return Math.min(100, ((prog.lessons_completed ?? 0) / total) * 100);
};

export const countCompleted = (progressList: Progress[]): number =>
  progressList.filter((p) => p.is_completed).length;

export const countInProgress = (progressList: Progress[]): number =>
  progressList.filter((p) => !p.is_completed && (p.lessons_completed ?? 0) > 0).length;