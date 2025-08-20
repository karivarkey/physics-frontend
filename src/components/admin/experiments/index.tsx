"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

type Experiment = {
  id: string;
  title: string;
  description?: string;
  status?: string;
};

const fetchExperiments = async (): Promise<Experiment[]> => {
  const { data } = await axiosInstance.get("/user/experiments");
  return data;
};

const AdminQuestions = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["user-experiments"],
    queryFn: fetchExperiments,
  });

  if (isLoading) return <div className="p-6">Loading experiments...</div>;
  if (isError)
    return <div className="p-6 text-red-500">Failed to load experiments</div>;

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Experiments</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {data?.map((experiment) => (
          <div
            key={experiment.id}
            className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white flex flex-col justify-between"
          >
            <div>
              <h3 className="font-semibold text-lg">{experiment.title}</h3>
              {experiment.description && (
                <p className="text-gray-600 mt-2 text-sm">
                  {experiment.description}
                </p>
              )}
              {experiment.status && (
                <span
                  className={`mt-3 inline-block px-2 py-1 text-xs font-medium rounded ${
                    experiment.status === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {experiment.status}
                </span>
              )}
            </div>

            <button
              onClick={() =>
                (window.location.href = `/admin/experiment/${experiment.id}`)
              }
              className="mt-4 py-2 text-sm font-medium text-white bg-gray-600 hover:bg-blue-700 rounded-md transition-colors"
            >
              Open
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminQuestions;
