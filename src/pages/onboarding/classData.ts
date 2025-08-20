// Defines the structure for a division
export interface Division {
  code: string;
  name: string;
}

// Defines the structure for a branch, including its allowed divisions
export interface BranchWithDivisions {
  code: string;
  name: string;
  divisions: Division[];
}

// The new data source for allowed combinations
export const allowedCombinations: BranchWithDivisions[] = [
  {
    code: "CS",
    name: "Computer Science and Engineering",
    divisions: [
      { code: "A", name: "Alpha" },
      { code: "B", name: "Beta" },
      { code: "C", name: "Gamma" },
      { code: "D", name: "Delta" },
    ],
  },
  {
    code: "EC",
    name: "Electronics and Communications Engineering",
    divisions: [
      { code: "A", name: "Alpha" },
      { code: "B", name: "Beta" },
      { code: "C", name: "Gamma" },
    ],
  },
  {
    code: "ME",
    name: "Mechanical Engineering",
    divisions: [
      { code: "A", name: "Alpha" },
      { code: "B", name: "Beta" },
    ],
  },
  {
    code: "EEE",
    name: "Electrical and Electronics Engineering",
    divisions: [], // No divisions
  },
  {
    code: "AD",
    name: "Artificial Intelligence and Data Science",
    divisions: [], // No divisions
  },
  {
    code: "AEI",
    name: "Applied Electronics and Instrumentation",
    divisions: [], // No divisions
  },
  {
    code: "CU",
    name: "Computer Science and Business Systems",
    divisions: [], // No divisions
  },
  {
    code: "CE",
    name: "Civil Engineering",
    divisions: [], // No divisions
  },
  {
    code: "IT",
    name: "Information Technology",
    divisions: [], // No divisions
  },
];