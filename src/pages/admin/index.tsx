import  { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils"; // shadcn utility

const tabs = [
  { id: "students", label: "Students" },
  { id: "teachers", label: "Teachers" },
  { id: "questions", label: "Questions" },
  { id: "marks", label: "Marks" },
];

const AdminHome = () => {
  const [activeTab, setActiveTab] = useState("students");

  return (
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
      <div className="pt-28 px-10">
        {activeTab === "students" && (
          <motion.div
            key="students"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="text-xl font-semibold"
          >
            👩‍🎓 Students Dashboard (Demo Content)
          </motion.div>
        )}

        {activeTab === "teachers" && (
          <motion.div
            key="teachers"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="text-xl font-semibold"
          >
            👨‍🏫 Teachers Management (Demo Content)
          </motion.div>
        )}

        {activeTab === "questions" && (
          <motion.div
            key="questions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="text-xl font-semibold"
          >
            ❓ Questions Bank (Demo Content)
          </motion.div>
        )}

        {activeTab === "marks" && (
          <motion.div
            key="marks"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="text-xl font-semibold"
          >
            📝 Marks Overview (Demo Content)
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdminHome;
