import { motion } from "framer-motion";
import { useEffect,useState } from "react";
import axiosInstance from "@/lib/axios";

interface StudentsListProps {
  class_short_name: string;
}

interface Experiment {
  experiment_id: number;
  title: string;
  deadline: string;
  completed: boolean;
}
interface Student {
  student_id: string;
  name: string;
  roll_number: number;
  group_id: number;
  experiments: Experiment[];
}
const StudentsList = ({ class_short_name }: StudentsListProps) => {
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axiosInstance.get(`/teacher/classes/${class_short_name}`);
        setStudents(res.data.students);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [class_short_name]);
  return (
    <div className="relative bg-white rounded-lg border shadow-sm">
      {/* Sticky header row */}
      <div className="sticky top-0 z-10 flex items-center gap-6 bg-gray-100 px-4 py-2 border-b text-sm font-semibold text-gray-600">
        <div className="flex-[0.2]">Roll</div>
        <div className="flex-[0.5]">Name / Group</div>
        <div className="flex-[1]">Experiments</div>
      </div>

      {/* Scrollable list */}
      <div className="space-y-3 overflow-y-auto max-h-[70vh] pr-2">
        {students.map((student, idx) => (
          <motion.div
            key={student.student_id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="flex items-center gap-6 px-4 py-3 border-b last:border-b-0 hover:bg-gray-50 transition"
          >
            {/* Roll number */}
            <div className="flex-[0.2] font-medium text-gray-800">
              #{student.roll_number}
            </div>

            {/* Name + Group */}
            <div className="flex-[0.5]">
              <p className="font-semibold">{student.name}</p>
              <p className="text-xs text-gray-500">Group {student.group_id}</p>
            </div>

            {/* Experiments */}
            <div className="flex-[1] flex flex-wrap gap-2">
              {student.experiments.map((exp) => (
                <span
                  key={exp.experiment_id}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    exp.completed
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {exp.title} –{" "}
                  <span className="text-[10px] text-gray-500">
                    {new Date(exp.deadline).toLocaleDateString()}
                  </span>
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default StudentsList;
