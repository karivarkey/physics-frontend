"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

type Student = {
  student_info: {
    name: string;
    class: string;
    assigned_teacher_name: string | null;
    roll_number: number | null;
    group_id: number | null;
  };
};

const fetchStudents = async (): Promise<Student[]> => {
  const { data } = await axiosInstance.get("/admin/students");
  return data;
};

const AdminStudents = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-students"],
    queryFn: fetchStudents,
  });

  if (isLoading) return <div className="p-6">Loading students...</div>;
  if (isError) return <div className="p-6 text-red-500">Failed to load students</div>;

  // Sort first by class, then by name
  const sortedStudents = [...(data ?? [])].sort((a, b) => {
    const classCompare = a.student_info.class.localeCompare(b.student_info.class);
    if (classCompare !== 0) return classCompare;
    return a.student_info.name.localeCompare(b.student_info.name);
  });

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">Students</h2>
      <div className="overflow-x-auto border rounded-md shadow-sm bg-white">
        <table className="w-full table-auto text-left border-collapse">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-2 text-gray-600">Name</th>
              <th className="px-4 py-2 text-gray-600">Class</th>
              <th className="px-4 py-2 text-gray-600">Assigned Teacher</th>
              <th className="px-4 py-2 text-gray-600">Roll Number</th>
              <th className="px-4 py-2 text-gray-600">Group ID</th>
            </tr>
          </thead>
          <tbody>
            {sortedStudents.map((student, idx) => (
              <tr
                key={idx}
                className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
              >
                <td className="px-4 py-2">{student.student_info.name}</td>
                <td className="px-4 py-2">{student.student_info.class}</td>
                <td className="px-4 py-2">
                  {student.student_info.assigned_teacher_name ?? "N/A"}
                </td>
                <td className="px-4 py-2">
                  {student.student_info.roll_number ?? "-"}
                </td>
                <td className="px-4 py-2">
                  {student.student_info.group_id ?? "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminStudents;
