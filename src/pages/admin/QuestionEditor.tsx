// src/components/QuestionEditor.tsx
import React from "react";
import type { Question, TextQuestion, TableQuestion } from "./types";
import { TableQuestionEditor } from "./TableQuestionEditor";
import InlineMathInput from "@/components/InlineMathInput";

// A simple text editor for prompt/unit etc.
const TextQuestionEditor: React.FC<{ question: TextQuestion, onChange: (q: TextQuestion) => void }> = ({ question, onChange }) => {
    return (
        <div className="flex items-center gap-2">
            <InlineMathInput
              value={question.prefill ?? ""}
              onChange={(v) => onChange({ ...question, prefill: v })}
              placeholder="Your answer prefill..."
              className="flex-1"
              inputClassName="border rounded-md px-3 py-2 w-full"
              renderClassName="border rounded-md px-3 py-2 w-full bg-white"
            />
            <InlineMathInput
              value={question.unit ?? ""}
              onChange={(v) => onChange({ ...question, unit: v })}
              placeholder="Unit"
              className="w-32"
              inputClassName="border rounded-md px-2 py-2 w-full"
              renderClassName="border rounded-md px-2 py-2 w-full bg-white"
            />
          </div>
    )
}


export const QuestionEditor: React.FC<{
  question: Question;
  onChange: (question: Question) => void;
  onDelete: (questionId: string) => void;
}> = ({ question, onChange, onDelete }) => {
  const handlePromptChange = (newVal: string) => {
    onChange({ ...question, prompt: newVal });
  };

  return (
    <div className="rounded-md border border-gray-300 p-4 bg-white shadow-sm">
      <div className="flex justify-between items-center mb-4">
         <label className="block font-medium text-gray-700">Question Prompt</label>
         <button onClick={() => onDelete(question.id)} className="text-red-500 hover:text-red-700 text-sm">
            Delete Question
         </button>
      </div>
      <InlineMathInput
        value={question.prompt}
        onChange={handlePromptChange}
        placeholder="Enter question prompt (supports LaTeX)"
        className="mb-4"
        inputClassName="w-full border rounded-md px-3 py-2"
        renderClassName="w-full border rounded-md px-3 py-2 bg-white"
      />

      {question.type === "text" && (
        <TextQuestionEditor question={question} onChange={onChange as (q: TextQuestion) => void} />
      )}
      {question.type === "table" && (
        <TableQuestionEditor question={question} onChange={onChange as (q: TableQuestion) => void} />
      )}
    </div>
  );
};