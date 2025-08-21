"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import toast from "react-hot-toast";
import { Trash2, Plus } from "lucide-react";

// Import shadcn/ui components
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";


type Experiment = {
  id: string;
  title: string;
  description?: string;
  status?: string;
};

// --- API Functions ---
const fetchExperiments = async (): Promise<Experiment[]> => {
  const { data } = await axiosInstance.get("/user/experiments");
  return data;
};

const deleteExperiment = async (id: string) => {
  const { data } = await axiosInstance.delete(`/admin/delete-question/${id}`);
  return data;
};

// --- NEW: The async function that performs the creation ---
const createExperiment = async (newExperiment: { title: string; description: string }) => {
  const { data } = await axiosInstance.post("/admin/create-question", newExperiment);
  return data;
};


const AdminQuestions = () => {
  const queryClient = useQueryClient();

  // --- NEW: State for the create dialog form ---
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["user-experiments"],
    queryFn: fetchExperiments,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteExperiment,
    onSuccess: () => {
      toast.success("Experiment deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["user-experiments"] });
    },
    onError: (error) => {
      toast.error(`Failed to delete experiment: ${error.message}`);
    },
  });

  // --- NEW: useMutation hook to handle the create operation ---
  const createMutation = useMutation({
    mutationFn: createExperiment,
    onSuccess: () => {
      toast.success("Experiment created successfully!");
      queryClient.invalidateQueries({ queryKey: ["user-experiments"] });
      // Close the dialog and reset the form
      setCreateDialogOpen(false);
      setNewTitle("");
      setNewDescription("");
    },
    onError: (error) => {
      toast.error(`Failed to create experiment: ${error.message}`);
    },
  });

  const handleCreateSubmit = () => {
    if (!newTitle.trim()) {
      toast.error("Title cannot be empty.");
      return;
    }
    createMutation.mutate({ title: newTitle, description: newDescription });
  };


  if (isLoading) return <div className="p-6">Loading experiments...</div>;
  if (isError) return <div className="p-6 text-red-500">Failed to load experiments</div>;

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Experiments</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {data?.map((experiment) => (
          <div key={experiment.id} className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white flex flex-col justify-between">
            {/* ... experiment card content ... */}
            <div>
              <h3 className="font-semibold text-lg">{experiment.title}</h3>
              {experiment.description && (<p className="text-gray-600 mt-2 text-sm">{experiment.description}</p>)}
              {experiment.status && (<span className={`mt-3 inline-block px-2 py-1 text-xs font-medium rounded ${ experiment.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700" }`}>{experiment.status}</span>)}
            </div>
            <div className="mt-4 flex gap-2">
              <Button asChild className="flex-1"><a href={`/admin/experiment/${experiment.id}`}>Open</a></Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="px-3" title="Delete Experiment" disabled={deleteMutation.isPending}><Trash2 size={16} /></Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>This action cannot be undone. This will permanently delete the experiment titled <span className="font-semibold">"{experiment.title}"</span>.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => deleteMutation.mutate(experiment.id)} className="bg-red-600 hover:bg-red-700">Yes, delete experiment</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ))}

        {/* --- NEW: Add New Experiment Card --- */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <button className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:text-blue-500 transition-colors text-gray-500">
              <Plus size={40} />
              <span className="mt-2 font-semibold text-lg">New Experiment</span>
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Experiment</DialogTitle>
              <DialogDescription>
                Provide a title and description for your new experiment. You can add questions after it's created.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">Title</Label>
                <Input id="title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="col-span-3" placeholder="e.g., Titration Experiment"/>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">Description</Label>
                <Textarea id="description" value={newDescription} onChange={(e) => setNewDescription(e.target.value)} className="col-span-3" placeholder="A short description of the experiment's objective."/>
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="submit" 
                onClick={handleCreateSubmit} 
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? "Creating..." : "Create Experiment"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminQuestions;