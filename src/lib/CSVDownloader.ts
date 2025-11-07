import axiosInstance from "./axios";
type ExperimentEntry = {
  experiment_id: string;
  experiment_title: string;
  marks: number | null;
  date_submitted: string | null;
};

type StudentRecord = {
  name: string;
  roll: number | string;
  // any other fields returned by your endpoint that you want to preserve can be added here
  experiments: ExperimentEntry[];
};

export async function exportClassExperimentsToCsv(
  classShortName: string,
  options?: { downloadFilename?: string; triggerDownload?: boolean }
): Promise<string> {
  const filename =
    options?.downloadFilename ?? `${classShortName}_experiments.csv`;
  const triggerDownload = options?.triggerDownload ?? true;

  // fetch data from your API - adjust URL to your route
  const res = await axiosInstance.get<StudentRecord[]>(
    `/teacher/download/${encodeURIComponent(classShortName)}`
  );
  const students = res.data;

  // collect experiment titles in insertion order
  const experimentTitleMap = new Map<string, string>(); // experiment_id -> title
  for (const s of students) {
    for (const ex of s.experiments || []) {
      if (!experimentTitleMap.has(ex.experiment_id)) {
        experimentTitleMap.set(ex.experiment_id, ex.experiment_title);
      }
    }
  }

  // Build headers: basic fields then one column per experiment title
  const baseHeaders = ["name", "roll"]; // add other static columns here if needed
  const experimentHeaders = Array.from(experimentTitleMap.values()); // titles in discovered order
  const headers = [...baseHeaders, ...experimentHeaders];

  // helper to escape CSV cell
  const esc = (v: unknown) => {
    if (v === null || v === undefined) return "";
    const s = String(v);
    // quote if contains comma, quote or newline
    if (/[",\n]/.test(s)) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  // build rows
  const rows: string[] = [];
  rows.push(headers.map(esc).join(","));

  for (const s of students) {
    const baseValues = [s.name, s.roll];
    // map experiment_id -> submission summary for quick lookup
    const subMap = new Map<string, ExperimentEntry>();
    for (const ex of s.experiments || []) subMap.set(ex.experiment_id, ex);

    const expValues = Array.from(experimentTitleMap.keys()).map((expId) => {
      const sub = subMap.get(expId);
      if (!sub) return ""; // no submission for this experiment

      // single-cell representation: "marks (YYYY-MM-DD)" or just marks
      const marks =
        sub.marks === null || sub.marks === undefined ? "" : String(sub.marks);
      const date = sub.date_submitted ? String(sub.date_submitted) : "";
      if (marks && date) return `${marks} (${date})`;
      if (marks) return marks;
      if (date) return date;
      return "";
    });

    const row = [...baseValues, ...expValues].map(esc).join(",");
    rows.push(row);
  }

  const csv = rows.join("\n");

  if (triggerDownload && typeof window !== "undefined") {
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return csv;
}
