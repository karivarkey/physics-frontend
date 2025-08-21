"use client";

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { v4 as uuidv4 } from 'uuid'; // <-- Import uuid to generate unique IDs

import axiosInstance from "@/lib/axios";
import type { Experiment, Question, TextQuestion, TableQuestion } from "./types";
import { QuestionEditor } from "./QuestionEditor";

// ---------- Main Component ----------
const EditExperiment = () => {
  const { id } = useParams();
  const [experiment, setExperiment] = useState<Experiment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
        setLoading(false);
        console.error("No experiment ID found in URL.");
        return;
    };

    axiosInstance
      .get(`/user/experiment/${id}`)
      .then((res) => setExperiment(res.data))
      .catch(err => {
          console.error("Failed to fetch experiment data:", err);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleQuestionChange = (updatedQuestion: Question) => {
    if (!experiment) return;
    const updatedQuestions = experiment.questions.questions.map((q) =>
      q.id === updatedQuestion.id ? updatedQuestion : q
    );
    setExperiment({
      ...experiment,
      questions: { questions: updatedQuestions },
    });
  };

  const handleQuestionDelete = (questionId: string) => {
     if (!experiment) return;
     const updatedQuestions = experiment.questions.questions.filter(q => q.id !== questionId);
     setExperiment({
       ...experiment,
       questions: { questions: updatedQuestions },
     });
  };

  // --- NEW: Handler to add a new question ---
  const handleAddQuestion = (type: 'text' | 'table') => {
    if (!experiment) return;

    let newQuestion: Question;

    if (type === 'text') {
      newQuestion = {
        id: uuidv4(),
        type: 'text',
        prompt: 'New Text Question',
        unit: 'units',
        prefill: null,
      } as TextQuestion;
    } else {
      // Default new table question
      newQuestion = {
        id: uuidv4(),
        type: 'table',
        prompt: 'New Table Question',
        rowsLocked: false,
        headers: [
          { id: uuidv4(), key: 'c1', label: 'Column 1', colSpan: 1 },
          { id: uuidv4(), key: 'c2', label: 'Column 2', colSpan: 1 }
        ],
        rows: [
          { id: uuidv4(), values: { c1: '', c2: '' } }
        ]
      } as TableQuestion;
    }

    const updatedQuestions = [...experiment.questions.questions, newQuestion];
    setExperiment({
      ...experiment,
      questions: { questions: updatedQuestions },
    });
  };

  const handleSave = () => {
    console.log("Saving this JSON to the server:", JSON.stringify(experiment, null, 2));
    axiosInstance.put(`/user/experiment/${id}`, experiment)
        .then(() => alert("Experiment saved successfully!"))
        .catch(err => alert(`Error saving: ${err.message}`));
  };

  if (loading) return <div className="p-6">Loading experiment...</div>;
  if (!experiment) return <div className="p-6 text-red-500">Experiment not found</div>;

  return (
    <div className="flex gap-8 p-6">
      {/* ----- Left Side: The Editor UI ----- */}
      <div className="w-2/3 space-y-6">
        <h2 className="text-2xl font-bold">Edit Experiment</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            value={experiment.title}
            onChange={(e) => setExperiment({ ...experiment, title: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-lg p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={experiment.description ?? ''}
            onChange={(e) => setExperiment({ ...experiment, description: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
            rows={3}
          />
        </div>

        <hr />

        {experiment.questions.questions.map((q) => (
          <QuestionEditor
            key={q.id}
            question={q}
            onChange={handleQuestionChange}
            onDelete={handleQuestionDelete}
          />
        ))}

        {/* ----- NEW: Add Question Section ----- */}
        <div className="pt-4 border-t">
            <h3 className="font-semibold mb-2">Add a new question</h3>
            <div className="flex gap-4">
                <button
                    onClick={() => handleAddQuestion('text')}
                    className="rounded-md bg-gray-200 px-4 py-2 text-gray-800 font-semibold hover:bg-gray-300"
                >
                    + Add Text Question
                </button>
                <button
                    onClick={() => handleAddQuestion('table')}
                    className="rounded-md bg-gray-200 px-4 py-2 text-gray-800 font-semibold hover:bg-gray-300"
                >
                    + Add Table Question
                </button>
            </div>
        </div>

        <button
          onClick={handleSave}
          className="rounded-md bg-blue-600 px-4 py-2 text-white font-semibold hover:bg-blue-700"
        >
          Save Changes
        </button>
      </div>

      {/* ----- Right Side: Live JSON Preview ----- */}
      <div className="w-1/3">
        <h3 className="text-xl font-bold mb-2">Live JSON Preview</h3>
        <pre className="bg-gray-800 text-white p-4 rounded-lg text-xs overflow-auto h-[80vh]">
          {JSON.stringify(experiment, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default EditExperiment;