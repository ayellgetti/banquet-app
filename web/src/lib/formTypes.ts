export const FORM_QUESTION_TYPES = [
  "SHORT_ANSWER",
  "PARAGRAPH",
  "MULTIPLE_CHOICE",
  "CHECKBOXES",
  "DROPDOWN",
  "DATE",
  "TIME",
] as const;

export type FormQuestionType = (typeof FORM_QUESTION_TYPES)[number];

export type FormQuestion = {
  id: string;
  sortOrder: number;
  type: FormQuestionType;
  title: string;
  description: string | null;
  required: boolean;
  options: string[];
  fieldKey?: string | null;
};

export type FormListItem = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  published: boolean;
  questionCount: number;
  responseCount: number;
  createdAt: string;
  updatedAt: string;
};

export type FormDetail = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  published: boolean;
  questions: FormQuestion[];
  responseCount: number;
  createdAt: string;
  updatedAt: string;
};

export type FormPublic = {
  slug: string;
  title: string;
  description: string | null;
  questions: FormQuestion[];
};

export type FormResponseItem = {
  id: string;
  answers: Record<string, string | string[]>;
  submittedAt: string;
};

export type FormAnswers = Record<string, string | string[]>;

export function isChoiceQuestionType(type: FormQuestionType): boolean {
  return type === "MULTIPLE_CHOICE" || type === "CHECKBOXES" || type === "DROPDOWN";
}

export function createLocalQuestion(type: FormQuestionType = "SHORT_ANSWER"): FormQuestion {
  return {
    id: `local-${crypto.randomUUID()}`,
    sortOrder: 0,
    type,
    title: "",
    description: null,
    required: false,
    options: isChoiceQuestionType(type) ? ["Option 1", "Option 2"] : [],
  };
}

export function formatAnswer(value: string | string[] | undefined): string {
  if (value === undefined) return "";
  return Array.isArray(value) ? value.join(", ") : value;
}
