import type { User } from "@shared/schema";

export const isPremium = (user: User | null | undefined): boolean =>
  !!user?.subscription_status;

export const getPriceDisplay = (price: number) => `Rs. ${price}`;

export const getPricePerCourse = (price: number, totalCourses: number): string => {
  if (!totalCourses) return "";
  return `Rs. ${Math.round(price / totalCourses)}`;
};

export const FREE_FEATURES = [
  { text: "Basic AI Career Roadmap", included: true },
  { text: "Dashboard Access", included: true },
  { text: "AI Mentor Chat", included: false },
  { text: "Premium Courses", included: false },
  { text: "Giveaway Tickets", included: false },
] as const;

export const getPremiumFeatures = (totalCourses: number) => [
  "Unlimited AI Mentor Chat",
  `${totalCourses} Premium Courses — All Unlocked`,
  "Saved AI Career Roadmap",
  "Giveaway Ticket (Win Rs. 35,000+)",
  "Completion Certificate",
] as const;