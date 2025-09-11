// src/components/types.ts
export type TextQuestion = {
  id: string;
  type: "text";
  prompt: string;
  unit?: string;
  prefill?: string | null;
  validate?: boolean;
};

export type TableRow = {
  id: string;
  values: Record<string, string | null>;
};

export type TableHeader = {
    id: string; // <-- Add this ID field
  key?: string;
  label: string;
  colSpan: number;
  rowSpan?: number;
  children?: TableHeader[];
  isEditable? :boolean;
};

export type TableQuestion = {
  id: string;
  type: "table";
  prompt: string;
  headers: TableHeader[];
  rows: TableRow[];
rowsLocked?: boolean; // <-- ADD THIS LINE
  validate?: boolean;
};

export type Question = TextQuestion | TableQuestion;

export type Experiment = {
  id: string;
  title: string;
  description?: string;
  questions: {
    questions: Question[];
  };
};