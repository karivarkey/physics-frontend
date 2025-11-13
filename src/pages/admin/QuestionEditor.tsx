// src/components/QuestionEditor.tsx
import React, { useEffect, useState } from "react";
import type { Question, TextQuestion, TableQuestion } from "./types";
import { TableQuestionEditor } from "./TableQuestionEditor";
import InlineMathInput from "@/components/InlineMathInput";
import axiosInstance from "@/lib/axios";
import toast from "react-hot-toast";

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
  experimentId: string;
  question: Question;
  onChange: (question: Question) => void;
  onDelete: (questionId: string) => void;
}> = ({ experimentId, question, onChange, onDelete }) => {
  const [lowerLimit, setLowerLimit] = useState<string>("");
  const [upperLimit, setUpperLimit] = useState<string>("");
  const [marks, setMarks] = useState(0);
  const [limitsLoading, setLimitsLoading] = useState<boolean>(false);
  const handlePromptChange = (newVal: string) => {
    onChange({ ...question, prompt: newVal });
  };

  useEffect(() => {
    const fetchLimits = async () => {
      if (!(question as any).validate) return;
      setLimitsLoading(true);
      try {
        const { data } = await axiosInstance.get(
          `/admin/experiments/limits/${experimentId}/${question.id}`
        );
        const first =
          Array.isArray(data?.limits) && data.limits.length > 0
            ? data.limits[0]
            : null;
        setLowerLimit(first?.min_value ?? "");
        setUpperLimit(first?.max_value ?? "");
        setMarks(first?.marks ?? 0);
      } catch (_) {
      } finally {
        setLimitsLoading(false);
      }
    };
    fetchLimits();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [(question as any).validate, question.id]);

  const handleSaveLimits = async () => {
    if (!(question as any).validate) return;
    const minValue = lowerLimit.trim() === "" ? null : Number(lowerLimit);
    const maxValue = upperLimit.trim() === "" ? null : Number(upperLimit);
    if (minValue !== null && Number.isNaN(minValue))
      return toast.error("Lower limit must be a number");
    if (maxValue !== null && Number.isNaN(maxValue))
      return toast.error("Upper limit must be a number");
    if (minValue !== null && maxValue !== null && minValue > maxValue)
      return toast.error("Lower limit cannot exceed upper limit");
    try {
      setLimitsLoading(true);
      await axiosInstance.put(`/admin/experiments/limits`, {
        experimentId,
        questionId: question.id,
        minValue,
        maxValue,
        marks,
      });
      toast.success("Validation limits saved");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to save limits");
    } finally {
      setLimitsLoading(false);
    }
  };

  return (
    <div className="rounded-md border border-gray-300 p-4 bg-white shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <label className="block font-medium text-gray-700">
          Question Prompt
        </label>
        <button
          onClick={() => onDelete(question.id)}
          className="text-red-500 hover:text-red-700 text-sm"
        >
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
        <TextQuestionEditor
          question={question}
          onChange={onChange as (q: TextQuestion) => void}
        />
      )}
      {question.type === "table" && (
        <TableQuestionEditor
          question={question}
          onChange={onChange as (q: TableQuestion) => void}
        />
      )}

      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <label className="text-sm text-gray-700">
            Require validation for this question
          </label>
          <input
            type="checkbox"
            checked={(question as any).validate ?? false}
            onChange={(e) =>
              onChange({ ...question, validate: e.target.checked } as Question)
            }
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </div>

        {(question as any).validate && (
          <div className="rounded-md border p-3 bg-gray-50">
            <div className="text-xs text-gray-600 mb-2">
              Set acceptable range (saved separately from the question JSON)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-end">
              <div>
                <label className="block text-xs text-gray-700 mb-1">
                  Lower limit
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  value={lowerLimit}
                  onChange={(e) => setLowerLimit(e.target.value)}
                  className="w-full border rounded-md px-3 py-2"
                  placeholder="e.g. 0"
                  disabled={limitsLoading}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-700 mb-1">
                  Upper limit
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  value={upperLimit}
                  onChange={(e) => setUpperLimit(e.target.value)}
                  className="w-full border rounded-md px-3 py-2"
                  placeholder="e.g. 100"
                  disabled={limitsLoading}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-700 mb-1">
                  Marks
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  value={marks}
                  onChange={(e) => setMarks(Number(e.target.value))}
                  className="w-full border rounded-md px-3 py-2"
                  placeholder="e.g. 100"
                  disabled={limitsLoading}
                />
              </div>
              <button
                onClick={handleSaveLimits}
                className="mt-2 sm:mt-0 bg-blue-600 hover:bg-blue-700 text-white rounded-md px-3 py-2 disabled:opacity-60"
                disabled={limitsLoading}
                title="Save validation limits"
              >
                {limitsLoading ? "Saving..." : "Save limits"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}