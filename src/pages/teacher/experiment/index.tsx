import React, { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";
import { useParams } from "react-router-dom";
import { cleanSubmissions } from "@/lib/filterExperimentResponse";
import type { Question } from "@/pages/admin/types";

type RawApiResponse = {
  question: Question[] | { questions?: Question[] } | any;
  answers: any[];
};

const ViewExperimentSubmissions: React.FC = () => {
  const params = useParams<{ class: string; exp: string }>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{
    question: Question[];
    answers: {
      name?: string;
      roll_number?: number | string;
      submission: Record<string, string | null>;
      date_of_submission?: string;
    }[];
  } | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  useEffect(() => {
    if (!params.class || !params.exp) {
      setError("Missing route params");
      return;
    }

    let mounted = true;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axiosInstance.get<RawApiResponse>(
          `/teacher/experiments/${params.class}/${params.exp}`
        );

        const rawQuestions =
          Array.isArray(res.data.question) && res.data.question.length
            ? res.data.question
            : res.data.question?.questions ?? [];

        const cleaned = cleanSubmissions(
          rawQuestions as Question[],
          res.data.answers
        );

        if (!mounted) return;
        setData(cleaned);
        setSelectedIndex(0);
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.message || "Failed to fetch");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    fetchData();
    return () => {
      mounted = false;
    };
  }, [params.class, params.exp]);

  // Simple guard UI
  if (loading) return <div className="p-6">Loading…</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!data) return <div className="p-6">No submissions found.</div>;

  const students = data.answers;
  const selected = students[selectedIndex];

  return (
    <div className="h-screen bg-white text-slate-900 antialiased">
      {/* Top bar */}
      <header className="border-b bg-white/60 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-4">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-slate-100 transition"
            aria-label="Go back"
          >
            ← Back
          </button>

          <div className="flex-1">
            <div className="text-sm text-slate-500">Experiment Submissions</div>
            <div className="text-base font-semibold">
              {students.length} students · {data.question.length} text questions
            </div>
          </div>

          <div className="text-sm text-slate-500">
            {selected?.date_of_submission
              ? new Date(selected.date_of_submission).toLocaleString()
              : ""}
          </div>
        </div>
      </header>

      {/* Main content: left list and right detail */}
      <main className="h-[calc(100vh-64px)] max-w-7xl mx-auto px-6 py-6 flex gap-6">
        {/* Left: student list (1/3) */}
        <aside className="w-1/3 max-w-xs flex-shrink-0">
          <div className="border rounded-xl shadow-sm h-full flex flex-col overflow-hidden">
            <div className="px-4 py-3 border-b bg-white">
              <div className="text-xs text-slate-500">Students</div>
              <div className="text-sm font-medium">{students.length}</div>
            </div>

            {/* scrollable list */}
            <ul
              className="overflow-auto divide-y"
              style={{ maxHeight: "calc(100vh - 220px)" }}
            >
              {students.map((s, i) => (
                <li
                  key={`${s.roll_number ?? i}-${s.name ?? i}`}
                  className={`cursor-pointer px-4 py-3 hover:bg-slate-50 transition flex items-center justify-between ${
                    i === selectedIndex ? "bg-slate-100" : ""
                  }`}
                  onClick={() => setSelectedIndex(i)}
                >
                  <div>
                    <div className="text-sm font-medium text-slate-900">
                      {s.name ?? "Unnamed"}
                    </div>
                    <div className="text-xs text-slate-500">
                      Roll: {s.roll_number ?? "-"}
                    </div>
                  </div>

                  <div className="text-xs text-slate-400">
                    {s.date_of_submission
                      ? new Date(s.date_of_submission).toLocaleDateString()
                      : ""}
                  </div>
                </li>
              ))}
            </ul>

            <div className="px-4 py-3 border-t text-xs text-slate-500">
              Click a student to view answers
            </div>
          </div>
        </aside>

        {/* Right: question -> answer mapping (2/3). This is independently scrollable */}
        <section className="flex-1">
          <div className="border rounded-xl shadow-sm h-full bg-white flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b">
              <div className="text-xs text-slate-500">Viewing</div>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold">
                    {selected?.name ?? `Roll ${selected?.roll_number ?? "—"}`}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    {selected?.roll_number
                      ? `Roll ${selected.roll_number}`
                      : ""}
                  </div>
                </div>

                <div className="text-xs text-slate-500">
                  {selected?.date_of_submission
                    ? new Date(selected.date_of_submission).toLocaleString()
                    : ""}
                </div>
              </div>
            </div>

            <div
              className="p-6 overflow-auto"
              style={{ maxHeight: "calc(100vh - 220px)" }}
            >
              <div className="space-y-6">
                {data.question.length === 0 && (
                  <div className="text-sm text-slate-500">
                    No text questions available.
                  </div>
                )}

                {data.question.map((q: Question) => {
                  if ((q as any).type !== "text") return null;
                  const textQ = q as {
                    id: string;
                    prompt: string;
                    unit?: string;
                    prefill?: string | null;
                  };

                  const answerValue = selected?.submission?.[textQ.id] ?? null;

                  return (
                    <article key={textQ.id} className="p-5 border rounded-lg">
                      <header className="mb-3">
                        <div className="text-xs text-slate-500">Question</div>
                        <div className="text-base font-medium text-slate-900">
                          {textQ.prompt}
                        </div>
                        {textQ.unit && (
                          <div className="text-xs text-slate-400 mt-1">
                            Unit: {textQ.unit}
                          </div>
                        )}
                      </header>

                      <div>
                        <div className="text-xs text-slate-500 mb-2">
                          Answer
                        </div>
                        <div className="text-sm text-slate-800">
                          {answerValue === null || answerValue === "" ? (
                            <span className="text-slate-400 italic">
                              No answer
                            </span>
                          ) : (
                            answerValue
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ViewExperimentSubmissions;
