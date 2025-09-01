import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { toast } from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Save, Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import type { Experiment, SubmissionDeadline } from "./types";

type Props = {
  groupId: string;
  groupName: number;
};

const SubmissionDeadlinesModal = ({ groupId, groupName }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [deadlines, setDeadlines] = useState<Record<string, string>>({});
  const [changedDeadlines, setChangedDeadlines] = useState<Set<string>>(new Set());

  // Fetch experiments and their deadlines
  const { data: experiments, isLoading } = useQuery<Experiment[]>({
    queryKey: ["group-submissions", groupId],
    queryFn: () =>
      axiosInstance
        .get(`/teacher/groups/${groupId}/submissions`)
        .then((res) => res.data),
    enabled: isOpen,
  });

  // Set deadlines mutation
  const setDeadlineMutation = useMutation({
    mutationFn: (data: SubmissionDeadline) =>
      axiosInstance.put(`/teacher/groups/${groupId}/submissions`, data),
    onSuccess: (_, variables) => {
      setChangedDeadlines(prev => {
        const newSet = new Set(prev);
        newSet.delete(variables.experiment_id);
        return newSet;
      });
      toast.success("Deadline updated successfully!");
    },
    onError: () => {
      toast.error("Failed to update deadline.");
    },
  });

  // Initialize deadlines when experiments data loads
  useEffect(() => {
    if (experiments) {
      const initialDeadlines: Record<string, string> = {};
      experiments.forEach(exp => {
        initialDeadlines[exp.experiment_id] = exp.deadline || "";
      });
      setDeadlines(initialDeadlines);
      setChangedDeadlines(new Set());
    }
  }, [experiments]);

  const handleDeadlineChange = (experimentId: string, value: string) => {
    setDeadlines(prev => ({
      ...prev,
      [experimentId]: value
    }));
    
    // Check if this is a change from the original value
    const originalDeadline = experiments?.find(exp => exp.experiment_id === experimentId)?.deadline || "";
    if (value !== originalDeadline) {
      setChangedDeadlines(prev => new Set(prev).add(experimentId));
    } else {
      setChangedDeadlines(prev => {
        const newSet = new Set(prev);
        newSet.delete(experimentId);
        return newSet;
      });
    }
  };

  const handleSaveDeadline = (experimentId: string) => {
    const deadline = deadlines[experimentId];
    if (deadline) {
      setDeadlineMutation.mutate({
        experiment_id: experimentId,
        deadline: deadline
      });
    }
  };

  const formatDateForDisplay = (dateString: string | null) => {
    if (!dateString) return "No deadline set";
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return "Invalid date";
    }
  };

  const isDeadlinePast = (dateString: string | null) => {
    if (!dateString) return false;
    try {
      return new Date(dateString) < new Date();
    } catch {
      return false;
    }
  };

  const getStatusIcon = (experiment: Experiment) => {
    const currentDeadline = deadlines[experiment.experiment_id];
    
    if (!currentDeadline) {
      return <AlertCircle className="h-4 w-4 text-amber-500" />;
    }
    
    if (isDeadlinePast(currentDeadline)) {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
    
    return <CheckCircle2 className="h-4 w-4 text-green-500" />;
  };

  const getStatusText = (experiment: Experiment) => {
    const currentDeadline = deadlines[experiment.experiment_id];
    
    if (!currentDeadline) {
      return "No deadline set";
    }
    
    if (isDeadlinePast(currentDeadline)) {
      return "Deadline passed";
    }
    
    return "Active deadline";
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Submission Deadlines
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Submission Deadlines - Group {groupName}
          </DialogTitle>
          <DialogDescription>
            Set and manage submission deadlines for experiments in this group.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                Loading experiments...
              </div>
            </div>
          ) : experiments && experiments.length > 0 ? (
            <div className="grid gap-4">
              {experiments.map((experiment) => (
                <div
                  key={experiment.experiment_id}
                  className="relative p-6 border rounded-xl bg-gradient-to-br from-white to-gray-50/50 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  {/* Status indicator */}
                  <div className="absolute top-4 right-4 flex items-center gap-2">
                    {getStatusIcon(experiment)}
                    <span className="text-xs font-medium text-muted-foreground">
                      {getStatusText(experiment)}
                    </span>
                  </div>

                  <div className="space-y-4">
                    {/* Experiment info */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {experiment.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        ID: {experiment.experiment_id.slice(0, 8)}...
                      </p>
                    </div>

                    {/* Current deadline display */}
                    <div className="bg-blue-50/50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">Current Deadline</span>
                      </div>
                      <p className="text-sm text-blue-800 font-mono">
                        {formatDateForDisplay(deadlines[experiment.experiment_id])}
                      </p>
                    </div>

                    {/* Date picker section */}
                    <div className="space-y-3">
                      <Label 
                        htmlFor={`deadline-${experiment.experiment_id}`} 
                        className="text-sm font-medium text-gray-700 flex items-center gap-2"
                      >
                        <Calendar className="h-4 w-4" />
                        Set New Deadline
                      </Label>
                      
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <Input
                            id={`deadline-${experiment.experiment_id}`}
                            type="datetime-local"
                            value={deadlines[experiment.experiment_id] || ""}
                            onChange={(e) => handleDeadlineChange(experiment.experiment_id, e.target.value)}
                            className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            min={new Date().toISOString().slice(0, 16)}
                          />
                        </div>
                        
                        {changedDeadlines.has(experiment.experiment_id) && (
                          <Button
                            size="sm"
                            onClick={() => handleSaveDeadline(experiment.experiment_id)}
                            disabled={setDeadlineMutation.isPending}
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                          >
                            <Save className="h-4 w-4" />
                            {setDeadlineMutation.isPending ? "Saving..." : "Save"}
                          </Button>
                        )}
                      </div>
                      
                      {/* Helper text */}
                      <p className="text-xs text-muted-foreground">
                        Select a date and time for when students must submit this experiment.
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No experiments found</h3>
              <p className="text-muted-foreground">
                There are no experiments available for this group yet.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SubmissionDeadlinesModal;
