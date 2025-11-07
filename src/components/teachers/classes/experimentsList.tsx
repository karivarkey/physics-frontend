import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import type { Question } from "@/pages/admin/types";
import { useNavigate } from "react-router-dom";
type Props = {
  shortName: string;
};

interface Experiment {
  id: string;
  title: string;
  description: string;
  questions: { questions: Question[] };
}

const ExperimentsList = ({ shortName }: Props) => {
  const navigate = useNavigate();
  const [experiments, setExperiments] = useState<Experiment[]>([]);

  const [loadingExperiments, setLoadingExperiments] = useState(false);

  const [error, setError] = useState<string | null>(null);

  // Fetch experiments
  useEffect(() => {
    const fetchExperiments = async () => {
      try {
        setLoadingExperiments(true);
        const { data } = await axiosInstance.get("/teacher/experiments");
        setExperiments(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoadingExperiments(false);
      }
    };
    fetchExperiments();
  }, []);

  return (
    <div className="max-w-5xl mx-auto py-10 space-y-6">
      {/* EXPERIMENTS */}
      <section>
        <h2 className="text-2xl font-semibold mb-3">Select an Experiment</h2>
        {loadingExperiments ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading experiments...
          </div>
        ) : error ? (
          <p className="text-red-500">Error: {error}</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {experiments.map((exp) => (
              <motion.div
                key={exp.id}
                layout
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <Card
                  className={`cursor-pointer transition-all ${"border-primary shadow-md"}`}
                  onClick={() => {
                    navigate(`/teacher/${shortName}/experiment/${exp.id}`);
                  }}
                >
                  <CardHeader>
                    <CardTitle>{exp.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {exp.description.slice(0, 80)}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default ExperimentsList;
