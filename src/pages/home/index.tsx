import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/lib/axios";
import { format, formatDistanceToNow, isPast } from "date-fns";

// Import shadcn/ui components
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

// --- Type Definition ---
type Experiment = {
  id: string;
  title: string;
  description?: string | null;
  deadline?: string | null;
  date_submitted?: string | null;
};

// --- Data Fetching Function ---
const fetchExperiments = async (): Promise<Experiment[]> => {
  const { data } = await axiosInstance.get("/user/experiments");
  return data;
};

// --- Helper Component for Experiment Status ---
const ExperimentStatus = ({
  deadline,
  date_submitted,
}: Partial<Experiment>) => {
  if (date_submitted) {
    return (
      <Badge variant="default" className="bg-green-600 hover:bg-green-700">
        Submitted on {format(new Date(date_submitted), "dd MMM yyyy")}
      </Badge>
    );
  }
  if (deadline) {
    const deadlineDate = new Date(deadline);
    if (isPast(deadlineDate)) {
      return <Badge variant="destructive">Overdue</Badge>;
    }
    return (
      <Badge variant="secondary">
        Due {formatDistanceToNow(deadlineDate, { addSuffix: true })}
      </Badge>
    );
  }
  return <Badge variant="outline">Open</Badge>;
};

// --- Main Home Component ---
const Home = () => {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["user-experiments-list"],
    queryFn: fetchExperiments,
  });

  const handleCardClick = (id: string) => {
    // Navigate to the specific experiment page
    navigate(`/experiment/${id}`);
  };

  // --- Loading State ---
  if (isLoading) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-semibold mb-6">Welcome to RSETLABS 🚀</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full mt-2" />
              </CardHeader>
              <CardFooter>
                <Skeleton className="h-6 w-24" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>
    );
  }

  // --- Error State ---
  if (isError) {
    return (
      <main className="p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load experiments. Please try again later.
          </AlertDescription>
        </Alert>
      </main>
    );
  }

  // --- Success State ---
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Welcome to RSETLABS 🚀</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.map((experiment) => (
          <Card
            key={experiment.id}
            onClick={() => handleCardClick(experiment.id)}
            className="cursor-pointer hover:border-primary transition-colors flex flex-col justify-between"
          >
            <CardHeader>
              <CardTitle>{experiment.title}</CardTitle>
              {experiment.description && (
                <CardDescription>{experiment.description.slice(0, 100)}...</CardDescription>
              )}
            </CardHeader>
            <CardFooter>
              <ExperimentStatus
                deadline={experiment.deadline}
                date_submitted={experiment.date_submitted}
              />
            </CardFooter>
          </Card>
        ))}
      </div>
    </main>
  );
};

export default Home;
