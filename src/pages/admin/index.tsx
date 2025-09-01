import { useState } from "react";
import { motion } from "framer-motion";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"; // React Query
import { cn } from "@/lib/utils";

import AdminStudents from "@/components/admin/students";
import AdminQuestions from "@/components/admin/experiments";
import TeachersTab from "@/components/admin/teachers";
// Demo tab components (replace with real ones)

const MarksTab = () => <div>📝 Marks Overview (Demo Content)</div>;

const tabs = [
  { id: "students", label: "Students", component: AdminStudents },
  { id: "teachers", label: "Teachers", component: TeachersTab },
  { id: "questions", label: "Questions", component: AdminQuestions },
  { id: "marks", label: "Marks", component: MarksTab },
];

const queryClient = new QueryClient();

const AdminHome = () => {
  const [activeTab, setActiveTab] = useState("students");

  const ActiveComponent =
    tabs.find((tab) => tab.id === activeTab)?.component ?? (() => null);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="relative min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900">
        {/* Floating Tab Bar */}
        <div className="fixed top-1/12 left-1/2 -translate-x-1/2 z-50">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex items-center gap-6 bg-white/60 backdrop-blur-md px-6 py-3 rounded-full shadow-lg border border-gray-200"
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative text-sm font-medium transition-colors duration-200",
                  activeTab === tab.id
                    ? "text-gray-900"
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="active-pill"
                    className="absolute -inset-x-3 -inset-y-1 bg-gray-200/50 rounded-full"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </motion.div>
        </div>

        {/* Page Content */}
        <div className="pt-28 px-10 text-xl font-semibold">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <ActiveComponent />
          </motion.div>
        </div>
      </div>
    </QueryClientProvider>
  );
};

export default AdminHome;
