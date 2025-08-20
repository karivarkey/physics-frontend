import React, { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";

type Experiment = {
  experiment_id: string;
  title: string;
  description: string;
  deadline: string;
  completed_count: string;
  not_completed_count: string;
  completed_students: string[];
  not_completed_students: string[];
};

interface ExperimentsListProps {
  shortName: string; // class short_name
}

const ExperimentsList: React.FC<ExperimentsListProps> = ({ shortName }) => {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const fetchExperiments = async () => {
      try {
        const res = await axiosInstance.get(
          `/teacher/classes/${shortName}/experiments`
        );
        console.log(res.data);
        setExperiments(res.data);
      } catch (err) {
        console.error("Failed to fetch experiments:", err);
      }
    };

    if (shortName) fetchExperiments();
  }, [shortName]);

  const timeLeft = (deadline: string) => {
    const now = new Date();
    const end = new Date(deadline);
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return "Deadline passed";

    const mins = Math.floor(diff / 1000 / 60);
    const hrs = Math.floor(mins / 60);
    const days = Math.floor(hrs / 24);

    if (days > 0) return `${days} day${days > 1 ? "s" : ""} left`;
    if (hrs > 0) return `${hrs} hour${hrs > 1 ? "s" : ""} left`;
    return `${mins} minute${mins > 1 ? "s" : ""} left`;
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      {experiments.map((exp) => {
        const total =
          parseInt(exp.completed_count) + parseInt(exp.not_completed_count);
        const percent = total ? (parseInt(exp.completed_count) / total) * 100 : 0;

        return (
          <div
            key={exp.experiment_id}
            className="w-full max-w-2xl bg-white rounded-xl shadow-md border border-gray-200 p-6 transition hover:shadow-lg hover:scale-[1.01]"
          >
            <div
              className="cursor-pointer"
              onClick={() =>
                setExpanded(
                  exp.experiment_id === expanded ? null : exp.experiment_id
                )
              }
            >
              <h2 className="text-lg font-semibold text-gray-900">{exp.title}</h2>
              <p className="text-gray-600 text-sm mt-1">{exp.description}</p>

              {/* Deadline */}
              <div className="mt-2 text-sm text-gray-500">
                Deadline: {new Date(exp.deadline).toLocaleDateString()} (
                {timeLeft(exp.deadline)})
              </div>

              {/* Progress Bar */}
              <div className="mt-4 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-green-500 h-2 transition-all"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{exp.completed_count} completed</span>
                <span>{exp.not_completed_count} pending</span>
              </div>
            </div>

            {/* Expandable student list */}
            {expanded === exp.experiment_id && (
              <div className="mt-4 space-y-3">
                <div>
                  <h3 className="text-sm font-semibold text-green-600">
                    ✅ Completed
                  </h3>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {exp.completed_students.length > 0 ? (
                      exp.completed_students.map((s, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs"
                        >
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400">
                        No students yet
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-red-600">
                    ❌ Not Completed
                  </h3>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {exp.not_completed_students.length > 0 ? (
                      exp.not_completed_students.map((s, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs"
                        >
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400">
                        Everyone completed 🎉
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ExperimentsList;
