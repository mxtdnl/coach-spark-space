import type { ComponentType } from "react";
import PrioritizationMatrix from "@/exercises/PrioritizationMatrix";
import CirclesOfControl from "@/exercises/CirclesOfControl";
import PERMA from "@/exercises/PERMA";
import RulesAndAssumptions from "@/exercises/RulesAndAssumptions";
import SelfCareWheel from "@/exercises/SelfCareWheel";
import SelfCompassion from "@/exercises/SelfCompassion";
import ThoughtLogging from "@/exercises/ThoughtLogging";
import BoxBreathing from "@/exercises/BoxBreathing";
import CognitiveDistortions from "@/exercises/CognitiveDistortions";
import ChallengingRules from "@/exercises/ChallengingRules";
import ChimpBrain from "@/exercises/ChimpBrain";
import FutureSelf from "@/exercises/FutureSelf";
import CoreValues from "@/exercises/CoreValues";
import EndOfYearReview from "@/exercises/EndOfYearReview";
import FindingPassions from "@/exercises/FindingPassions";
import Ikigai from "@/exercises/Ikigai";
import ProcrastinationChecklist from "@/exercises/ProcrastinationChecklist";
import WheelOfPower from "@/exercises/WheelOfPower";
import WheelOfLife from "@/exercises/WheelOfLife";
import SixThinkingHats from "@/exercises/SixThinkingHats";
import IdeaQuickfire from "@/exercises/IdeaQuickfire";

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
    description: "Rank tasks, goals, or options using pairwise comparison — never more than two at a time.",
    category: "Prioritization",
    tags: ["decision-making", "focus", "planning"],
    estimatedMinutes: 10,
    component: PrioritizationMatrix,
  },
  {
    slug: "circles-of-control",
    title: "Circles of Control, Influence, and Concern",
    description: "Sort your worries into what you can control, influence, and must let go of — then act.",
    category: "Stress & Anxiety",
    tags: ["focus", "stress", "agency"],
    estimatedMinutes: 10,
    component: CirclesOfControl,
  },
  {
    slug: "perma-model",
    title: "PERMA Model of Wellbeing",
    description: "Check in on the five elements of wellbeing: Positive emotions, Engagement, Relationships, Meaning, Accomplishment.",
    category: "Wellbeing",
    tags: ["wellbeing", "reflection", "positive-psychology"],
    estimatedMinutes: 10,
    component: PERMA,
  },
  {
    slug: "rules-and-assumptions-check",
    title: "Rules and Assumptions Check",
    description: "Surface the unconscious rules and assumptions that drive your behaviour and anxiety.",
    category: "Beliefs & Thinking",
    tags: ["perfectionism", "anxiety", "self-awareness"],
    estimatedMinutes: 12,
    component: RulesAndAssumptions,
  },
  {
    slug: "self-care-wheel",
    title: "Self-Care Wheel",
    description: "Visualise your wellbeing across six dimensions of self-care and find where to focus next.",
    category: "Wellbeing",
    tags: ["wellbeing", "balance", "self-care"],
    estimatedMinutes: 10,
    component: SelfCareWheel,
  },
  {
    slug: "self-compassion",
    title: "Practising Self-Compassion",
    description: "Five short steps to meet a hard moment with kindness instead of harsh self-criticism.",
    category: "Wellbeing",
    tags: ["self-compassion", "resilience", "reflection"],
    estimatedMinutes: 8,
    component: SelfCompassion,
  },
  {
    slug: "thought-logging",
    title: "Thought Logging",
    description: "Externalise and challenge unhelpful thoughts. Track triggers, evidence, and reframes over time.",
    category: "Beliefs & Thinking",
    tags: ["cbt", "anxiety", "reframing"],
    estimatedMinutes: 12,
    component: ThoughtLogging,
  },
  {
    slug: "box-breathing",
    title: "Box Breathing",
    description: "A guided 4-4-4-4 breathing timer to calm the nervous system in under two minutes.",
    category: "Calming Techniques",
    tags: ["breathing", "mindfulness", "stress"],
    estimatedMinutes: 3,
    component: BoxBreathing,
  },
  {
    slug: "challenging-cognitive-distortions",
    title: "Challenging Cognitive Distortions",
    description: "Spot common thinking traps and reframe a thought into something more balanced.",
    category: "Beliefs & Thinking",
    tags: ["cbt", "reframing", "self-awareness"],
    estimatedMinutes: 12,
    component: CognitiveDistortions,
  },
  {
    slug: "challenging-rules-and-assumptions",
    title: "Challenging Rules and Assumptions",
    description: "Run a small behavioural experiment to test and shift an unhelpful belief.",
    category: "Beliefs & Thinking",
    tags: ["perfectionism", "experiment", "growth"],
    estimatedMinutes: 15,
    component: ChallengingRules,
  },
  {
    slug: "chimp-brain",
    title: "The Chimp Mind Model",
    description: "Six steps to handle moments when your emotional brain hijacks your thinking.",
    category: "Stress & Anxiety",
    tags: ["emotional-regulation", "stress", "self-awareness"],
    estimatedMinutes: 10,
    component: ChimpBrain,
  },
  {
    slug: "future-self",
    title: "Meeting Your Future Self",
    description: "A guided visualization to meet a wiser version of you 15 years from now — and hear what they have to say.",
    category: "Purpose & Direction",
    tags: ["visualization", "goals", "reflection"],
    estimatedMinutes: 15,
    component: FutureSelf,
  },
  {
    slug: "core-values",
    title: "Core Values",
    description: "Clarify, group, and rank the values that guide your decisions and goals.",
    category: "Purpose & Direction",
    tags: ["values", "self-awareness", "decision-making"],
    estimatedMinutes: 15,
    component: CoreValues,
  },
  {
    slug: "end-of-year-review",
    title: "End-of-Year Review",
    description: "Reflect on your academic year — what you achieved, what you'd change, and where to focus next.",
    category: "Reflection",
    tags: ["reflection", "review", "goals"],
    estimatedMinutes: 15,
    component: EndOfYearReview,
  },
  {
    slug: "finding-your-passions",
    title: "Finding Your Passions",
    description: "Five questions to surface what energizes you and a small experiment to test it.",
    category: "Purpose & Direction",
    tags: ["passion", "self-awareness", "direction"],
    estimatedMinutes: 15,
    component: FindingPassions,
  },
  {
    slug: "ikigai",
    title: "Ikigai",
    description: "Find your reason for being at the intersection of what you love, are good at, can be paid for, and what the world needs.",
    category: "Purpose & Direction",
    tags: ["purpose", "meaning", "career"],
    estimatedMinutes: 20,
    component: Ikigai,
  },
  {
    slug: "procrastination-checklist",
    title: "Procrastination Checklist",
    description: "Pinpoint exactly where you procrastinate so you can stop labelling yourself and start fixing the specifics.",
    category: "Productivity",
    tags: ["procrastination", "self-awareness", "habits"],
    estimatedMinutes: 10,
    component: ProcrastinationChecklist,
  },
  {
    slug: "wheel-of-power-and-privilege",
    title: "Wheel of Privilege & Power",
    description: "Reflect on how parts of your identity shape privilege or marginalization across different contexts.",
    category: "Reflection",
    tags: ["identity", "privilege", "awareness"],
    estimatedMinutes: 15,
    component: WheelOfPower,
  },
  {
    slug: "wheel-of-life",
    title: "Wheel of Life",
    description: "A quick visual snapshot of your satisfaction across eight life areas — and where to bring more balance.",
    category: "Wellbeing",
    tags: ["balance", "reflection", "wellbeing"],
    estimatedMinutes: 10,
    component: WheelOfLife,
  },
  {
    slug: "six-thinking-hats",
    title: "The Six Thinking Hats",
    description: "Work through a problem or decision from six distinct perspectives to reach a balanced choice.",
    category: "Decision-Making",
    tags: ["decision-making", "creativity", "problem-solving"],
    estimatedMinutes: 20,
    component: SixThinkingHats,
  },
  {
    slug: "idea-generation-quickfire",
    title: "Idea Generation Quickfire",
    description: "A timed brainstorming sprint to flex your creative muscles — wild ideas welcome.",
    category: "Creativity",
    tags: ["brainstorming", "creativity", "ideas"],
    estimatedMinutes: 10,
    component: IdeaQuickfire,
  },
];

export const getExercise = (slug: string) =>
  EXERCISES.find((e) => e.slug === slug);

export const getCategories = () =>
  Array.from(new Set(EXERCISES.map((e) => e.category))).sort();
