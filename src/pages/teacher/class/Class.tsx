"use client";
import { exportClassExperimentsToCsv } from "@/lib/CSVDownloader";
import { useParams } from "react-router-dom";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ExperimentsList from "@/components/teachers/classes/experimentsList";
import StudentsList from "@/components/teachers/classes/studentsList";
import GroupsList from "@/components/teachers/GroupsList";
import { motion, AnimatePresence, easeOut } from "framer-motion";
import axiosInstance from "@/lib/axios";
const tabVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: easeOut } },
  exit: { opacity: 0, y: -15, transition: { duration: 0.2 } },
};

const ClassDetails = () => {
  const params = useParams<{ classId: string }>();
  const [activeTab, setActiveTab] = useState("students");
  const downloadReport = async () => {
    const classId = params.classId;
    if (!classId) return;

    try {
      const response = await axiosInstance.get(`/teacher/evaluate/${classId}`, {
        responseType: "blob", // Important: This tells axios to treat the response as binary data
      });

      // Create a URL for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      // Set the filename (you can also parse content-disposition header if needed)
      link.setAttribute("download", `Report_${classId}.xlsx`);

      document.body.appendChild(link);
      link.click();

      // Cleanup
      if (link.parentNode) link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download report:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6 text-black">
        Class {params.classId}
      </h1>
      <div className="flex  gap-3">
        <button
          onClick={() => exportClassExperimentsToCsv(params.classId || "")}
          className="relative overflow-hidden rounded-md border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:border-neutral-500 hover:bg-neutral-800 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-neutral-600"
        >
          <span className="relative z-10 flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-neutral-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 16.5v-9m0 9l-3-3m3 3l3-3M6 19.5h12M3 9h18"
              />
            </svg>
            Download CSV
          </span>

          {/* Hover light effect */}
          <span className="absolute inset-0 z-0 bg-gradient-to-r from-neutral-700/10 to-transparent opacity-0 transition-opacity duration-300 hover:opacity-100" />
        </button>
        <button
          onClick={downloadReport}
          className="relative overflow-hidden rounded-md border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:border-neutral-500 hover:bg-neutral-800 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-neutral-600"
        >
          <span className="relative z-10 flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-neutral-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 16.5v-9m0 9l-3-3m3 3l3-3M6 19.5h12M4.5 4.5h15"
              />
            </svg>
            Download Report
          </span>
        </button>
      </div>

      <Tabs
        defaultValue="students"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="flex justify-center mb-8 bg-gray-700 rounded-full p-1 w-fit mx-auto">
          <TabsTrigger
            value="students"
            className="px-6 py-2 rounded-full transition-all data-[state=active]:bg-gray-900 data-[state=active]:shadow-md data-[state=active]:text-white text-gray-300"
          >
            Students wise
          </TabsTrigger>
          <TabsTrigger
            value="experiments"
            className="px-6 py-2 rounded-full transition-all data-[state=active]:bg-gray-900 data-[state=active]:shadow-md data-[state=active]:text-white text-gray-300"
          >
            Experiment wise
          </TabsTrigger>
          <TabsTrigger
            value="groups"
            className="px-6 py-2 rounded-full transition-all data-[state=active]:bg-gray-900 data-[state=active]:shadow-md data-[state=active]:text-white text-gray-300"
          >
            Group wise
          </TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          {activeTab === "students" && (
            <TabsContent value="students">
              <motion.div
                key="students"
                variants={tabVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="mt-4"
              >
                <StudentsList class_short_name={params.classId ?? ""} />
              </motion.div>
            </TabsContent>
          )}

          {activeTab === "groups" && (
            <TabsContent value="groups">
              <motion.div
                key="groups"
                variants={tabVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="mt-4"
              >
                <GroupsList class_short={params.classId ?? ""} />
              </motion.div>
            </TabsContent>
          )}

          {activeTab === "experiments" && (
            <TabsContent value="experiments">
              <motion.div
                key="experiments"
                variants={tabVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="mt-4"
              >
                <ExperimentsList shortName={params.classId ?? ""} />
              </motion.div>
            </TabsContent>
          )}
        </AnimatePresence>
      </Tabs>
    </div>
  );
};

export default ClassDetails;
