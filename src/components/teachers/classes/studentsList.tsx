import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/lib/axios";
import { motion } from "framer-motion";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axiosInstance.get(
          `/teacher/classes/${class_short_name}`
        );
        setStudents(res.data.students);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [class_short_name]);

  return (
    <Card className="w-full">
      <CardHeader className="sticky top-0 z-10 bg-muted/40 border-b">
        <CardTitle className="grid grid-cols-3 text-sm font-semibold text-muted-foreground">
          <span className="text-left">Roll</span>
          <span className="text-left">Name / Group</span>
          <span className="text-left">Experiments</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className="h-[70vh]">
          <div className="divide-y">
            {students.map((student, idx) => (
              <motion.div
                key={student.student_id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-6 rounded-none px-4 py-3 hover:bg-accent"
                  onClick={() =>
                    navigate(`/teacher/students/${student.student_id}`, {
                      state: { class_short_name },
                    })
                  }
                >
                  {/* Roll number */}
                  <span className="w-[60px] font-medium text-foreground">
                    #{student.roll_number}
                  </span>

                  {/* Name + Group */}
                  <div className="flex-1 text-left">
                    <p className="font-semibold">{student.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Group {student.group_id}
                    </p>
                  </div>

                  {/* Experiments */}
                  <div className="flex flex-wrap gap-2">
                    {student.experiments.map((exp) => (
                      <Badge
                        key={exp.experiment_id}
                        variant={exp.completed ? "secondary" : "outline"}
                        className={`${
                          exp.completed
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {exp.title} –{" "}
                        <span className="ml-1 text-[10px] text-muted-foreground">
                          {new Date(exp.deadline).toLocaleDateString()}
                        </span>
                      </Badge>
                    ))}
                  </div>
                </Button>
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default StudentsList;
