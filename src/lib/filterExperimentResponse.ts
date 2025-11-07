import type { TextQuestion, Question } from "@/pages/admin/types";
export type RawAnswerEntry = {
  name?: string;
  roll_number?: number | string;
  submission: Record<string, any>; // some keys -> string | null, some keys -> TableRow[]
  date_of_submission?: string;
};

export type CleanAnswerEntry = {
  name?: string;
  roll_number?: number | string;
  submission: Record<string, string | null>;
  date_of_submission?: string;
};

export type CleanResult = {
  question: TextQuestion[]; // only text questions remain
  answers: CleanAnswerEntry[];
};

/**
 * cleanSubmissions
 * - Removes all table-type questions from `questions` input.
 * - From each answer.submission, removes keys whose value is an array (table rows),
 *   keeping only textual answers (string|null).
 *
 * Accepts either a single Question or an array of Question.
 */
export function cleanSubmissions(
  questionsInput: Question | Question[],
  answers: RawAnswerEntry[] | RawAnswerEntry
): CleanResult {
  // Normalize inputs
  const questionsArr: Question[] = Array.isArray(questionsInput)
    ? questionsInput
    : [questionsInput];

  const answersArr: RawAnswerEntry[] = Array.isArray(answers)
    ? answers
    : [answers];

  // Keep only text questions
  const textQuestions: TextQuestion[] = questionsArr.filter(
    (q): q is TextQuestion => q.type === "text"
  );

  // For each answer, remove keys whose value is an array (table rows)
  const cleanedAnswers: CleanAnswerEntry[] = answersArr.map((ans) => {
    const cleanedSubmission: Record<string, string | null> = {};

    if (ans && typeof ans.submission === "object" && ans.submission !== null) {
      for (const [key, val] of Object.entries(ans.submission)) {
        // Keep only primitive textual values (string or null).
        // Also accept numbers (coerce to string) if you prefer; currently we convert numbers to string.
        if (val === null) {
          cleanedSubmission[key] = null;
        } else if (typeof val === "string") {
          cleanedSubmission[key] = val;
        } else if (typeof val === "number") {
          cleanedSubmission[key] = String(val);
        } else {
          // Skip arrays/objects (table rows and complex values)
          continue;
        }
      }
    }

    return {
      name: ans.name,
      roll_number: ans.roll_number,
      submission: cleanedSubmission,
      date_of_submission: ans.date_of_submission,
    };
  });

  return {
    question: textQuestions,
    answers: cleanedAnswers,
  };
}
