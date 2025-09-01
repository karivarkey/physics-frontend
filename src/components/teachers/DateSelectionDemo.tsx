import { useState } from "react";
import { Calendar, Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// This is just a demo component to showcase the improved date selection UI
const DateSelectionDemo = () => {
  const [deadline, setDeadline] = useState("");

  const formatDateForDisplay = (dateString: string) => {
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

  const isDeadlinePast = (dateString: string) => {
    if (!dateString) return false;
    try {
      return new Date(dateString) < new Date();
    } catch {
      return false;
    }
  };

  const getStatusIcon = () => {
    if (!deadline) {
      return <AlertCircle className="h-4 w-4 text-amber-500" />;
    }
    
    if (isDeadlinePast(deadline)) {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
    
    return <CheckCircle2 className="h-4 w-4 text-green-500" />;
  };

  const getStatusText = () => {
    if (!deadline) {
      return "No deadline set";
    }
    
    if (isDeadlinePast(deadline)) {
      return "Deadline passed";
    }
    
    return "Active deadline";
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <div className="relative p-6 border rounded-xl bg-gradient-to-br from-white to-gray-50/50 shadow-sm hover:shadow-md transition-all duration-200">
        {/* Status indicator */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          {getStatusIcon()}
          <span className="text-xs font-medium text-muted-foreground">
            {getStatusText()}
          </span>
        </div>

        <div className="space-y-4">
          {/* Experiment info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Sample Experiment
            </h3>
            <p className="text-sm text-muted-foreground">
              ID: 68af4469...
            </p>
          </div>

          {/* Current deadline display */}
          <div className="bg-blue-50/50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Current Deadline</span>
            </div>
            <p className="text-sm text-blue-800 font-mono">
              {formatDateForDisplay(deadline)}
            </p>
          </div>

          {/* Date picker section */}
          <div className="space-y-3">
            <Label 
              htmlFor="demo-deadline" 
              className="text-sm font-medium text-gray-700 flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Set New Deadline
            </Label>
            
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <Input
                  id="demo-deadline"
                  type="datetime-local"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>
            </div>
            
            {/* Helper text */}
            <p className="text-xs text-muted-foreground">
              Select a date and time for when students must submit this experiment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DateSelectionDemo;
