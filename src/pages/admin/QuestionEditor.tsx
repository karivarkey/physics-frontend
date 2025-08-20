// src/components/QuestionEditor.tsx
import React from "react";
import type { Question, TextQuestion, TableQuestion } from "./types";
import { TableQuestionEditor } from "./TableQuestionEditor";

// A simple text editor for prompt/unit etc.
const TextQuestionEditor: React.FC<{ question: TextQuestion, onChange: (q: TextQuestion) => void }> = ({ question, onChange }) => {
    return (
        <div className="flex items-center gap-2">
            <input
              type="text"
              value={question.prefill ?? ""}
              onChange={e => onChange({...question, prefill: e.target.value})}
              className="border rounded-md px-3 py-2 flex-1"
            />
            {question.unit && (
              <input
                type="text"
                value={question.unit}
                onChange={e => onChange({...question, unit: e.target.value})}
                className="border rounded-md px-2 py-2 w-20"
              />
            )}
          </div>
    )
}


export const QuestionEditor: React.FC<{
  question: Question;
  onChange: (question: Question) => void;
  onDelete: (questionId: string) => void;
}> = ({ question, onChange, onDelete }) => {
  const handlePromptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...question, prompt: e.target.value });
  };

  return (
    <div className="rounded-md border border-gray-300 p-4 bg-white shadow-sm">
      <div className="flex justify-between items-center mb-4">
         <label className="block font-medium text-gray-700">Question Prompt</label>
         <button onClick={() => onDelete(question.id)} className="text-red-500 hover:text-red-700 text-sm">
            Delete Question
         </button>
      </div>
      <input
        type="text"
        value={question.prompt}
        onChange={handlePromptChange}
        className="w-full border rounded-md px-3 py-2 mb-4"
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