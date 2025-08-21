"use client";

import { useParams } from "react-router-dom";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ExperimentsList from "@/components/teachers/classes/experimentsList";
import StudentsList from "@/components/teachers/classes/studentsList";
import { motion, AnimatePresence, easeOut } from "framer-motion";

const tabVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: easeOut } },
  exit: { opacity: 0, y: -15, transition: { duration: 0.2 } },
};

const ClassDetails = () => {
  const params = useParams<{ classId: string }>();
  const [activeTab, setActiveTab] = useState("students");

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6 text-black">
        Class {params.classId}
      </h1>

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
