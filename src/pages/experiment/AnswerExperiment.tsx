"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

import { StepBack } from "lucide-react";
// Import types
import type {
  Question,
  TableHeader,
  TableQuestion,
  TableRow,
} from "../admin/types";

// Import shadcn/ui components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import TeleprompterText from "@/components/TeleprompterText";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// --- Type Definitions for this specific view ---
type ExperimentData = {
  id: string;
  title: string;
  description: string;
  created_at: string; // Assuming created_at is provided
  questions: {
    questions: Question[];
  };
};

// --- API Functions ---
const fetchExperiment = async (id: string): Promise<ExperimentData> => {
  const { data } = await axiosInstance.get(`/user/experiment/${id}`);
  return data;
};

const submitExperiment = async (submission: {
  experimentId: string;
  answers: Record<string, any>;
}) => {
  const { data } = await axiosInstance.post(
    "/user/submit-answer",
    submission
  );
  return data;
};

// --- Reusable Renderer for a Single Question ---
const QuestionRenderer: React.FC<{
  question: Question;
  answerData: any;
  onAnswerChange: (newAnswer: any) => void;
}> = ({ question, answerData, onAnswerChange }) => {
  // ... (This entire sub-component's logic remains the same, so it is collapsed for brevity)
  // Recursive helpers for rendering complex table headers
  const getLeafCount = (header: TableHeader): number => {
    if (!header.children || header.children.length === 0) return 1;
    return header.children.reduce((acc, child) => acc + getLeafCount(child), 0);
  };
  const getMaxDepth = (headers: TableHeader[]): number => {
    if (!headers || headers.length === 0) return 0;
    let maxChildDepth = 0;
    for (const h of headers) {
      if (h.children)
        maxChildDepth = Math.max(maxChildDepth, getMaxDepth(h.children));
    }
    return 1 + maxChildDepth;
  };

  switch (question.type) {
    case "text":
      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              <ReactMarkdown
                components={{
                  a: ({ node, ...props }) => (
                    <a {...props} target="_blank" rel="noopener noreferrer" />
                  ),
                }}
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
              >
                {question.prompt}
              </ReactMarkdown>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Input
                type="text"
                value={answerData ?? ""}
                onChange={(e) => onAnswerChange(e.target.value)}
                placeholder="Your answer..."
              />
              {question.unit && (
                <span className="text-muted-foreground whitespace-nowrap">
                  <ReactMarkdown rehypePlugins={[rehypeRaw, rehypeKatex]} remarkPlugins={[remarkMath]}>
                    {question.unit}
                  </ReactMarkdown>
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      );

    case "table":
      const tableQuestion = question as TableQuestion;
      const headerRows = useMemo(() => {
        const maxDepth = getMaxDepth(tableQuestion.headers);
        if (maxDepth === 0) return [];
        const rows: TableHeader[][] = Array.from(
          { length: maxDepth },
          () => []
        );
        const buildRows = (headers: TableHeader[], currentDepth: number) => {
          headers.forEach((header) => {
            const colSpan = getLeafCount(header);
            const hasChildren = header.children && header.children.length > 0;
            const rowSpan = hasChildren ? 1 : maxDepth - currentDepth;
            rows[currentDepth].push({ ...header, colSpan, rowSpan });
            if (hasChildren) buildRows(header.children!, currentDepth + 1);
          });
        };
        buildRows(tableQuestion.headers, 0);
        return rows.filter((row) => row.length > 0);
      }, [tableQuestion.headers]);

      const orderedColumnKeys = useMemo(() => {
        const keys: string[] = [];
        const findKeys = (headers: TableHeader[]) => {
          headers.forEach((h) => {
            if (h.children && h.children.length > 0) findKeys(h.children);
            else if (h.key) keys.push(h.key);
          });
        };
        findKeys(tableQuestion.headers);
        return keys;
      }, [tableQuestion.headers]);

      const handleCellChange = (
        rowId: string,
        columnKey: string,
        value: string
      ) => {
        const updatedRows = answerData.map((row: TableRow) => {
          if (row.id === rowId)
            return { ...row, values: { ...row.values, [columnKey]: value } };
          return row;
        });
        onAnswerChange(updatedRows);
      };

      const handleAddRow = () => {
        const newRow: TableRow = {
          id: uuidv4(),
          values: orderedColumnKeys.reduce(
            (acc, key) => ({ ...acc, [key]: "" }),
            {}
          ),
        };
        onAnswerChange([...answerData, newRow]);
      };

      const handleDeleteRow = (rowId: string) => {
        onAnswerChange(answerData.filter((row: TableRow) => row.id !== rowId));
      };
       const columnEditableMap = useMemo(() => {
        const map = new Map<string, boolean>();
        const findEditableKeys = (headers: TableHeader[]) => {
            headers.forEach(h => {
                if (h.children && h.children.length > 0) {
                    findEditableKeys(h.children);
                } else if (h.key) {
                    // A column is editable if `isEditable` is true or undefined.
                    map.set(h.key, h.isEditable ?? true);
                }
            });
        };
        findEditableKeys(tableQuestion.headers);
        return map;
      }, [tableQuestion.headers]);

      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              <ReactMarkdown
                components={{
                  a: ({ node, ...props }) => (
                    <a {...props} target="_blank" rel="noopener noreferrer" />
                  ),
                }}
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
              >
                {tableQuestion.prompt}
              </ReactMarkdown>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative -mx-4 sm:mx-0">
              <div className="overflow-x-auto rounded-md border">
                <table className="min-w-[640px] sm:min-w-full text-[13px] md:text-sm">
                  <thead className="bg-muted/50">
                    {headerRows.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {row.map((header, headerIndex) => (
                          <th
                            key={header.id}
                            colSpan={header.colSpan}
                            rowSpan={header.rowSpan}
                            className={`border-b border-r p-2 md:p-3 text-left font-semibold align-top whitespace-pre-wrap break-words [&_*]:m-0 ${headerIndex === 0 ? 'sticky left-0 z-10 bg-background' : ''}`}
                          >
                            <ReactMarkdown
                              components={{
                                a: ({ node, ...props }) => (
                                  <a {...props} target="_blank" rel="noopener noreferrer" />
                                ),
                              }}
                              remarkPlugins={[remarkMath]}
                              rehypePlugins={[rehypeKatex]}
                            >
                              {header.label}
                            </ReactMarkdown>
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody>
                    {(answerData as TableRow[]).map((row) => (
                      <tr key={row.id} className="hover:bg-muted/50">
                        {orderedColumnKeys.map((key, cellIndex) => (
                          <td
                            key={`${key}-${row.id}`}
                            className={`border-b border-r p-0 align-top ${cellIndex === 0 ? 'sticky left-0 z-10 bg-background' : ''}`}
                          >
                            {columnEditableMap.get(key) ? (
                              <Input
                                type="text"
                                value={row.values[key] ?? ""}
                                onChange={(e) =>
                                  handleCellChange(row.id, key, e.target.value)
                                }
                                className="w-full border-0 shadow-none focus-visible:ring-0 rounded-none text-[13px] md:text-sm px-2 py-2"
                              />
                            ) : (
                              <div className="p-2 md:p-3 min-h-[2.5rem] whitespace-pre-wrap break-words [&_*]:m-0">
                                {row.values[key] ? (
                                  <ReactMarkdown
                                    components={{
                                      a: ({ node, ...props }) => (
                                        <a
                                          {...props}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                        />
                                      ),
                                    }}
                                    remarkPlugins={[remarkMath]}
                                    rehypePlugins={[rehypeKatex]}
                                  >
                                    {row.values[key]}
                                  </ReactMarkdown>
                                ) : null}
                              </div>
                            )}
                          </td>
                        ))}
                        {!tableQuestion.rowsLocked && (
                          <td className="border-b border-r text-center p-0 w-10 md:w-12">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteRow(row.id)}
                              className="text-muted-foreground hover:text-destructive"
                              title="Delete Row"
                            >
                              &ndash;
                            </Button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Subtle scroll hint gradients for mobile */}
              <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-background to-transparent sm:hidden" />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-background to-transparent sm:hidden" />
            </div>
            {!tableQuestion.rowsLocked && (
              <div className="mt-3 md:mt-4">
                <Button variant="secondary" onClick={handleAddRow}>
                  + Add Row
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      );
    default:
      return <Alert variant="destructive">Unsupported question type</Alert>;
  }
};

// --- Main View Component (Redesigned) ---
const AnswerExperiment = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);

  const {
    data: experiment,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["experiment", id],
    queryFn: () => fetchExperiment(id!),
    enabled: !!id,
  });

  useEffect(() => {
    if (experiment) {
      const initialAnswers = experiment.questions.questions.reduce(
        (acc: Record<string, any>, q) => {
          if (q.type === "text") {
            acc[q.id] = q.prefill ?? "";
          } else if (q.type === "table") {
            acc[q.id] = (q as TableQuestion).rows;
          }
          return acc;
        },
        {}
      );
      setAnswers(initialAnswers);
    }
  }, [experiment]);

  const submissionMutation = useMutation({
    mutationFn: submitExperiment,
    onSuccess: () => {
      toast.success("Experiment submitted successfully!");
      queryClient.invalidateQueries({ queryKey: ["user-experiments-list"] });
      navigate("/home");
    },
    onError: (error) => {
      toast.error(`Submission failed: ${error.message}`);
    },
  });

  const handleAnswerChange = (questionId: string, newAnswerData: any) => {
    setAnswers((prev) => ({ ...prev, [questionId]: newAnswerData }));
  };

  const handleSubmit = () => {
    if (!id) return;
    submissionMutation.mutate({ experimentId: id, answers });
  };

  const totalQuestions = experiment?.questions.questions.length ?? 0;
  const answeredCount = React.useMemo(() => {
    if (!experiment) return 0;
    let count = 0;
    for (const q of experiment.questions.questions) {
      const val = answers[q.id];
      if (q.type === "text") {
        if (typeof val === "string" && val.trim().length > 0) count += 1;
      } else if (q.type === "table") {
        if (Array.isArray(val) && val.length > 0) count += 1;
      }
    }
    return count;
  }, [answers, experiment]);

  if (isLoading) {
    // A simple loading state for the redesigned layout
    return (
      <div className="bg-muted/20 min-h-screen">
        <header className="bg-background border-b">
          <div className="container mx-auto flex items-center justify-between p-4 h-20">
            <div className="space-y-2">
              <Skeleton className="h-7 w-64" />
              <Skeleton className="h-4 w-80" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
        </header>
        <div className="container mx-auto max-w-4xl py-8 space-y-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (isError) return <div className="p-6">Failed to load experiment</div>;
  if (!experiment) return null;

  return (
    <div className="bg-muted/20 min-h-screen">
      {/* Header scrolls away on scroll */}
      <header className="bg-background border-b">
        <div className="container mx-auto p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start sm:items-center justify-start gap-3">
            <button
              onClick={() => {
                navigate(-1);
              }}
              className="cursor-pointer"
            >
              <StepBack className="w-10 mr-2" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold leading-tight">{experiment.title}</h1>
              <div className="mt-2">
                <TeleprompterText heightRem={6} durationSec={20}>
                  <div className="text-sm text-muted-foreground [&_p]:m-0">
                    <ReactMarkdown
                      components={{
                        a: ({ node, ...props }) => (
                          <a {...props} target="_blank" rel="noopener noreferrer" />
                        ),
                      }}
                    >
                      {experiment.description}
                    </ReactMarkdown>
                  </div>
                </TeleprompterText>
                <span className="block mt-2 text-xs text-muted-foreground">
                  Created on: {format(new Date(experiment.created_at), "dd MMM yyyy")}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:self-start sm:mt-1">
            <span className="text-xs text-muted-foreground hidden sm:block">
              {answeredCount}/{totalQuestions} answered
            </span>
            <Button
              onClick={() => setIsConfirmOpen(true)}
              disabled={submissionMutation.isPending}
              size="lg"
              aria-label="Submit experiment"
              title="Review and submit your answers"
            >
              {submissionMutation.isPending ? "Submitting..." : "Submit Experiment"}
            </Button>
          </div>
        </div>
      </header>

      {/* --- Centered Content Area --- */}
      <main className="container mx-auto max-w-4xl py-8 space-y-8">
        {experiment.questions.questions.map(
          (q) =>
            answers[q.id] !== undefined && (
              <QuestionRenderer
                key={q.id}
                question={q}
                answerData={answers[q.id]}
                onAnswerChange={(newAnswer) =>
                  handleAnswerChange(q.id, newAnswer)
                }
              />
            )
        )}
      </main>
      {/* Submit confirmation dialog */}
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit experiment?</AlertDialogTitle>
            <AlertDialogDescription>
              You have answered {answeredCount} of {totalQuestions} questions. You can still review your inputs before submitting.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submissionMutation.isPending}>Review</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setIsConfirmOpen(false);
                handleSubmit();
              }}
              disabled={submissionMutation.isPending}
            >
              Submit now
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AnswerExperiment;
