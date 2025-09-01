export type Student = {
  id: string;
  name: string;
  email: string;
  roll: number;
};

export type Group = {
  group_id: string;
  group_name: number;
  students: Student[];
};

export type ApiResponse = {
  groups: Group[];
}[];

export type UngroupedStudent = {
  id: string;
  name: string;
  roll: number;
};

export type Experiment = {
  experiment_id: string;
  title: string;
  deadline_id: string | null;
  deadline: string | null;
};

export type SubmissionDeadline = {
  experiment_id: string;
  deadline: string;
};
