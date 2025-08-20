// src/components/EditExperiment.tsx
"use client";

import  { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
// --- Mocks for demonstration since we don't have the API/router setup ---
// import { useParams } from "react-router-dom";
// import axiosInstance from "@/lib/axios";

import axiosInstance from "@/lib/axios";
import type { Experiment, Question } from "./types"; // We'll create a types file
import { QuestionEditor } from "./QuestionEditor";

// ---------- Main Component ----------
const EditExperiment = () => {
  // const { id } = useParams(); // Use this in your actual app
  const [experiment, setExperiment] = useState<Experiment | null>(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  useEffect(() => {
    if (!id) {
        setLoading(false);
        // Handle case where ID is missing, maybe redirect or show an error
        console.error("No experiment ID found in URL.");
        return;
    };

    axiosInstance
      .get(`/user/experiment/${id}`)
      .then((res) => setExperiment(res.data))
      .catch(err => {
          console.error("Failed to fetch experiment data:", err);
          // Optionally set an error state to show a message to the user
      })
      .finally(() => setLoading(false));
  }, [id]); // Re-run the effect if the ID in the URL changes
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

  const handleSave = () => {
    console.log("Saving this JSON to the server:", JSON.stringify(experiment, null, 2));
    // Here you would make your API call, e.g.,
    // axiosInstance.put(`/user/experiment/${id}`, experiment);
    alert("Experiment data saved to the console!");
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
            value={experiment.description}
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