"use client";

import  { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import toast from "react-hot-toast";
import { StepBack, GripVertical, FileText, ListChecks } from "lucide-react";

// shadcn/ui Component Imports
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import axiosInstance from "@/lib/axios";
import type { Experiment, Question, TextQuestion, TableQuestion } from "./types";
import { QuestionEditor } from "./QuestionEditor";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// --- Sortable Item for the Left-Side Outline (Styled with shadcn principles) ---
const SortableQuestionItem = ({ id, question, isSelected, onSelect, onDelete }: { 
  id: string, 
  question: Question, 
  isSelected: boolean, 
  onSelect: (id: string) => void,
  onDelete: (id: string) => void,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const QuestionIcon = question.type === 'text' ? FileText : ListChecks;

  return (
    <div ref={setNodeRef} style={style} className={`group flex items-center rounded-md transition-colors ${isSelected ? 'bg-muted' : 'hover:bg-muted/50'}`}>
      <span {...attributes} {...listeners} className="p-2 cursor-grab touch-none text-muted-foreground hover:text-foreground">
        <GripVertical size={18} />
      </span>
      <button onClick={() => onSelect(id)} className="flex-1 text-left p-2 truncate">
        <div className="flex items-center gap-2">
            <QuestionIcon size={16} className="text-muted-foreground flex-shrink-0" />
            <span className="text-sm font-medium text-foreground">{question.prompt || "Untitled Question"}</span>
        </div>
      </button>
      <Button 
        variant="ghost"
        size="icon"
        onClick={(e) => { e.stopPropagation(); onDelete(id); }}
        className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-red-500"
        title="Delete Question"
      >
        &times;
      </Button>
    </div>
  );
};


// ---------- Main Component (Redesigned) ----------
const EditExperiment = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [experiment, setExperiment] = useState<Experiment | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    axiosInstance.get(`/user/experiment/${id}`).then((res) => {
      const fetchedExperiment = res.data;
      setExperiment(fetchedExperiment);
      // Automatically select the first question on load
      if (fetchedExperiment?.questions?.questions?.length > 0) {
        setSelectedQuestionId(fetchedExperiment.questions.questions[0].id);
      }
    }).catch((err) => {
      console.error("Failed to fetch experiment data:", err);
      toast.error("Failed to load experiment.");
    }).finally(() => setLoading(false));
  }, [id]);

  const handleQuestionChange = (updatedQuestion: Question) => {
    if (!experiment) return;
    const updatedQuestions = experiment.questions.questions.map((q) =>
      q.id === updatedQuestion.id ? updatedQuestion : q
    );
    setExperiment({
      ...experiment,
      questions: { ...experiment.questions, questions: updatedQuestions },
    });
  };

  const handleQuestionDelete = (questionIdToDelete: string) => {
    if (!experiment) return;
    const updatedQuestions = experiment.questions.questions.filter((q) => q.id !== questionIdToDelete);
    
    // If the deleted question was the selected one, select another one
    if (selectedQuestionId === questionIdToDelete) {
        const currentIndex = experiment.questions.questions.findIndex(q => q.id === questionIdToDelete);
        if (updatedQuestions.length > 0) {
            // Select the previous one, or the first one if it was the first
            const newIndex = Math.max(0, currentIndex - 1);
            setSelectedQuestionId(updatedQuestions[newIndex].id);
        } else {
            setSelectedQuestionId(null); // No questions left
        }
    }

    setExperiment({ ...experiment, questions: { ...experiment.questions, questions: updatedQuestions }});
  };

  const handleAddQuestion = (type: "text" | "table") => {
    if (!experiment) return;
    let newQuestion: Question;
    
    if (type === 'text') { 
      newQuestion = { id: uuidv4(), type: 'text', prompt: 'New Text Question', unit: 'units', prefill: null } as TextQuestion; 
    } else { 
      newQuestion = { id: uuidv4(), type: 'table', prompt: 'New Table Question', rowsLocked: false, headers: [ { id: uuidv4(), key: 'c1', label: 'Column 1', colSpan: 1 }, { id: uuidv4(), key: 'c2', label: 'Column 2', colSpan: 1 } ], rows: [ { id: uuidv4(), values: { c1: '', c2: '' } } ] } as TableQuestion; 
    }

    const updatedQuestions = [...experiment.questions.questions, newQuestion];
    setExperiment({ ...experiment, questions: { ...experiment.questions, questions: updatedQuestions }});
    // Automatically select the newly created question
    setSelectedQuestionId(newQuestion.id);
  };

  const handleSave = () => {
    axiosInstance.put(`/admin/update-question`, { id, experiment: experiment?.questions })
      .then(() => toast.success("Experiment saved successfully!"))
      .catch((err) => toast.error(`Error saving: ${err.message}`));
  };

  // --- DND Logic ---
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      if (!experiment) return;
      const oldIndex = experiment.questions.questions.findIndex(q => q.id === active.id);
      const newIndex = experiment.questions.questions.findIndex(q => q.id === over.id);
      const reorderedQuestions = arrayMove(experiment.questions.questions, oldIndex, newIndex);
      setExperiment({ ...experiment, questions: { ...experiment.questions, questions: reorderedQuestions }});
    }
  };

  const selectedQuestion = experiment?.questions.questions.find(q => q.id === selectedQuestionId);

  if (loading) return <div className="p-6 bg-background text-foreground">Loading experiment...</div>;
  if (!experiment) return <div className="p-6 bg-background text-destructive">Experiment not found</div>;

  return (
    // --- SCROLL FIX: Parent is fixed height and hides overflow ---
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      
      {/* ----- Left Panel: Outline ----- */}
      <div className="w-1/3 max-w-sm flex flex-col border-r border-border h-full">
        <div className="p-4 border-b border-border">
            <div className="flex items-center gap-2 mb-4">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><StepBack className="h-4 w-4"/></Button>
                <h2 className="text-lg font-semibold">Experiment Outline</h2>
            </div>
            <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => handleAddQuestion("text")} className="flex-1">+ Text</Button>
                <Button variant="secondary" size="sm" onClick={() => handleAddQuestion("table")} className="flex-1">+ Table</Button>
            </div>
        </div>

        {/* This panel scrolls independently */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={experiment.questions.questions.map(q => q.id)} strategy={verticalListSortingStrategy}>
                    {experiment.questions.questions.map((q) => (
                        <SortableQuestionItem key={q.id} id={q.id} question={q} isSelected={selectedQuestionId === q.id} onSelect={setSelectedQuestionId} onDelete={handleQuestionDelete}/>
                    ))}
                </SortableContext>
            </DndContext>
        </div>
      </div>

      {/* ----- Right Panel: Editor ----- */}
      <div className="flex-1 flex flex-col h-full">
        <div className="p-4 flex items-center justify-between border-b border-border bg-background/50 backdrop-blur-sm">
            <div className="space-y-1 flex-1">
                <Input type="text" value={experiment.title} onChange={(e) => setExperiment({ ...experiment, title: e.target.value })} placeholder="Experiment Title" className=" font-bold h-10 !text-base border-0 shadow-none focus-visible:ring-0 px-0"/>
                <Textarea value={experiment.description ?? ""} onChange={(e) => setExperiment({ ...experiment, description: e.target.value })} placeholder="Add a description..." className="text-sm text-muted-foreground border-0 shadow-none focus-visible:ring-0 resize-none p-0"/>
            </div>
            <Button onClick={handleSave}>Save Changes</Button>
        </div>
        
        {/* This main content panel scrolls independently */}
        <div className="flex-1 p-6 overflow-y-auto">
            {selectedQuestion ? (
                <QuestionEditor
                    experimentId={id as string}
                    key={selectedQuestion.id}
                    question={selectedQuestion}
                    onChange={handleQuestionChange}
                    onDelete={handleQuestionDelete}
                />
            ) : (
                <div className="flex items-center justify-center h-full text-center text-muted-foreground">
                    <div>
                        <p>Select a question from the left to edit.</p>
                        <p className="text-sm">Or, add a new question to get started.</p>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default EditExperiment;