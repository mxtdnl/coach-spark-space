import type { ComponentType } from "react";
import PrioritizationMatrix from "@/exercises/PrioritizationMatrix";

export type Exercise = {
  slug: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  estimatedMinutes: number;
  component: ComponentType;
};

export const EXERCISES: Exercise[] = [
  {
    slug: "prioritization-matrix",
    title: "Prioritization Matrix",
    description:
      "Rank a list of tasks, goals, or options using pairwise comparison — never more than two at a time.",
    category: "Prioritization",
    tags: ["decision-making", "focus", "planning"],
    estimatedMinutes: 10,
    component: PrioritizationMatrix,
  },
];

export const getExercise = (slug: string) =>
  EXERCISES.find((e) => e.slug === slug);

export const getCategories = () =>
  Array.from(new Set(EXERCISES.map((e) => e.category))).sort();
