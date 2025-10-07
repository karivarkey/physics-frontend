import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import ClassTeacherCard from "./ClassTeacherCard";
import TeacherModal from "./TeacherModal";
import toast from "react-hot-toast";

type Teacher = {
  id: string;
  name: string;
  email: string;
} | null;

type ClassItem = {
  class_name: string;
  class_id: string;
  name_short: string;
  teacher: Teacher;
};

// fetcher fn for react-query
const fetchClasses = async (): Promise<ClassItem[]> => {
  const res = await axiosInstance.get("/admin/classes");
  return res.data.classes;
};

export default function TeachersTab() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);

  // ✅ React Query for fetching
  const { data: classes = [], isLoading } = useQuery<ClassItem[]>({
    queryKey: ["classes"],
    queryFn: fetchClasses,
  });

  // ✅ React Query for delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (classId: string) => {
      await axiosInstance.delete(`/admin/remove-teacher/${classId}`);
    },
    onSuccess: (_, classId) => {
      // Optimistic update or invalidate
      queryClient.setQueryData<ClassItem[]>(["classes"], (oldClasses) =>
        oldClasses
          ? oldClasses.map((cls) =>
              cls.class_id === classId ? { ...cls, teacher: null } : cls
            )
          : []
      );
      toast.success("Teacher removed successfully");
    },
    onError: (error) => {
      console.error("Error deleting teacher:", error);
      toast.error("Failed to remove teacher");
    },
  });

  const handleOpenModal = (cls: ClassItem) => {
    setSelectedClass(cls);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedClass(null);
    queryClient.invalidateQueries({ queryKey: ["classes"] });
  };

  const handleDeleteTeacher = (classId: string) => {
    deleteMutation.mutate(classId);
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="border rounded-lg p-4">
            <Skeleton className="h-6 w-2/3 mb-2" />
            <Skeleton className="h-4 w-1/2 mb-4" />
            <Skeleton className="h-10 w-full" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 pb-20">
        {classes
          ?.slice()
          ?.sort((a, b) =>
            (a?.class_name ?? "").localeCompare(b?.class_name ?? "")
          )
          ?.map((cls) => (
            <ClassTeacherCard
              key={cls.class_id}
              cls={cls}
              onDelete={handleDeleteTeacher}
              onOpenModal={handleOpenModal}
            />
          ))}
      </div>
      {selectedClass && (
        <TeacherModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          classItem={selectedClass}
        />
      )}
    </>
  );
}
