import React, { useState, useEffect, useMemo } from "react";
import { v4 as uuidv4 } from 'uuid';

// You can reuse your existing types.ts file
import type { Experiment, Question, TableHeader, TableQuestion, TableRow } from "../admin/types";
import axiosInstance from "@/lib/axios";
// A mock experiment data for demonstration. In your app, you'd pass this as a prop.



// --- Reusable Component to Render a Single Question for Answering ---

const QuestionAnswerer: React.FC<{
    question: Question;
    answerData: any;
    onAnswerChange: (newAnswer: any) => void;
}> = ({ question, answerData, onAnswerChange }) => {
    
    // --- Table Rendering Logic (reused from editor) ---
    const getLeafCount = (header: TableHeader): number => {
      if (!header.children || header.children.length === 0) return 1;
      return header.children.reduce((acc, child) => acc + getLeafCount(child), 0);
    };
    const getMaxDepth = (headers: TableHeader[]): number => {
      if (!headers || headers.length === 0) return 0;
      let maxChildDepth = 0;
      for (const h of headers) { if (h.children) maxChildDepth = Math.max(maxChildDepth, getMaxDepth(h.children)); }
      return 1 + maxChildDepth;
    };

    switch (question.type) {
        case "text":
            return (
                <div className="mb-6 p-4 border rounded-lg bg-white shadow-sm">
                    <label className="block font-medium mb-2">{question.prompt}</label>
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={answerData ?? ""}
                            onChange={(e) => onAnswerChange(e.target.value)}
                            className="border rounded-md px-3 py-2 flex-1 border-gray-300"
                            placeholder="Your answer..."
                        />
                        {question.unit && <span className="text-gray-500">{question.unit}</span>}
                    </div>
                </div>
            );

        case "table":
            const tableQuestion = question as TableQuestion;
            const headerRows = useMemo(() => {
                const maxDepth = getMaxDepth(tableQuestion.headers);
                if (maxDepth === 0) return [];
                const rows: TableHeader[][] = Array.from({ length: maxDepth }, () => []);
                const buildRows = (headers: TableHeader[], currentDepth: number) => {
                    headers.forEach(header => {
                        const colSpan = getLeafCount(header);
                        const hasChildren = header.children && header.children.length > 0;
                        const rowSpan = hasChildren ? 1 : maxDepth - currentDepth;
                        rows[currentDepth].push({ ...header, colSpan, rowSpan });
                        if (hasChildren) buildRows(header.children!, currentDepth + 1);
                    });
                };
                buildRows(tableQuestion.headers, 0);
                return rows.filter(row => row.length > 0);
            }, [tableQuestion.headers]);

            const orderedColumnKeys = useMemo(() => {
                const keys: string[] = [];
                const findKeys = (headers: TableHeader[]) => {
                    headers.forEach(h => {
                        if (h.children && h.children.length > 0) findKeys(h.children);
                        else if (h.key) keys.push(h.key);
                    });
                };
                findKeys(tableQuestion.headers);
                return keys;
            }, [tableQuestion.headers]);
            
            const handleCellChange = (rowId: string, columnKey: string, value: string) => {
                const updatedRows = answerData.map((row: TableRow) => {
                    if (row.id === rowId) return { ...row, values: { ...row.values, [columnKey]: value } };
                    return row;
                });
                onAnswerChange(updatedRows);
            };

            const handleAddRow = () => {
                const newRow: TableRow = {
                    id: uuidv4(),
                    values: orderedColumnKeys.reduce((acc, key) => ({...acc, [key]: ''}), {})
                };
                onAnswerChange([...answerData, newRow]);
            };

            const handleDeleteRow = (rowId: string) => {
                onAnswerChange(answerData.filter((row: TableRow) => row.id !== rowId));
            };

            return (
                <div className="mb-6 p-4 border rounded-lg bg-white shadow-sm">
                    <p className="font-medium mb-2">{tableQuestion.prompt}</p>
                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                        <table className="w-full border-collapse text-sm">
                            <thead className="bg-gray-100">
                                {headerRows.map((row, rowIndex) => (
                                    <tr key={rowIndex}>
                                        {row.map(header => (
                                            <th key={header.id} colSpan={header.colSpan} rowSpan={header.rowSpan} className="border-b border-r p-2 text-left font-semibold">
                                                {header.label}
                                            </th>
                                        ))}
                                    </tr>
                                ))}
                            </thead>
                            <tbody>
                                {(answerData as TableRow[]).map((row) => (
                                    <tr key={row.id} className="hover:bg-gray-50">
                                        {orderedColumnKeys.map((key, index) => (
                                            <td key={`${key}-${row.id}`} className="border-b border-r p-0">
                                                <input type="text" value={row.values[key] ?? ""} onChange={(e) => handleCellChange(row.id, key, e.target.value)} className="w-full p-2 border-0 focus:ring-1 focus:ring-blue-400"/>
                                            </td>
                                        ))}
                                        {/* Delete button only appears if rows are not locked */}
                                        {!tableQuestion.rowsLocked && (
                                            <td className="border-b border-r text-center p-0 w-12">
                                                <button onClick={() => handleDeleteRow(row.id)} className="text-red-500 px-2 py-2 hover:bg-red-100 rounded-full" title="Delete Row">&ndash;</button>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {/* Add Row button only appears if rows are not locked */}
                    {!tableQuestion.rowsLocked && (
                        <div className="mt-2">
                            <button onClick={handleAddRow} className="text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded">+ Add Row</button>
                        </div>
                    )}
                </div>
            );

        default:
            return <div>Unsupported question type</div>;
    }
};


// --- The Main Component to Display and Answer the Whole Experiment ---

export const AnswerExperiment = () => {
    const [experiment, setExperiment] = useState<Experiment | null>(null);
    const [answers, setAnswers] = useState<Record<string, any>>({});
    
    useEffect(() => {
        // In a real app, you would fetch this data via an API call
        const fetchData = async () => {
            const response = await axiosInstance.get("/user/experiment/1"); // Replace with actual endpoint
            setExperiment(response.data);

        // Initialize the answers state from the experiment data
        const initialAnswers = response.data.questions.questions.reduce((acc: Record<string, any>, q:any) => {
            if (q.type === 'text') {
                acc[q.id] = q.prefill ?? '';
            } else if (q.type === 'table') {
                // For tables, the initial answer is the set of rows provided in the question
                acc[q.id] = q.rows;
            }
            return acc;
        }, {});
        setAnswers(initialAnswers);
        };
        fetchData();
    }, []);

    const handleAnswerChange = (questionId: string, newAnswerData: any) => {
        setAnswers(prevAnswers => ({
            ...prevAnswers,
            [questionId]: newAnswerData,
        }));
    };

    const handleSubmit = () => {
        console.log("--- FINAL SUBMISSION DATA ---");
        console.log(JSON.stringify(answers, null, 2));
        alert("Experiment submitted! Check the console for the final JSON data.");
        // Here you would send the 'answers' object to your backend API
    };

    if (!experiment) {
        return <div className="p-6">Loading experiment...</div>;
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                    <h1 className="text-3xl font-bold mb-2">{experiment.title}</h1>
                    <p className="text-gray-600">{experiment.description}</p>
                </div>
                
                {experiment.questions.questions.map(q => (
                    // Only render if we have an initialized answer state for it
                    answers[q.id] && (
                        <QuestionAnswerer
                            key={q.id}
                            question={q}
                            answerData={answers[q.id]}
                            onAnswerChange={(newAnswer) => handleAnswerChange(q.id, newAnswer)}
                        />
                    )
                ))}
                
                <div className="mt-6 text-right">
                    <button 
                        onClick={handleSubmit} 
                        className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 transition-colors"
                    >
                        Submit Experiment
                    </button>
                </div>
            </div>
        </div>
    );
};