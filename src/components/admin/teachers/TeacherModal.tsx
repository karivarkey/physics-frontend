import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";
import { Skeleton } from "@/components/ui/skeleton";
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

type Props = {
  isOpen: boolean;
  onClose: () => void;
  classItem: ClassItem;
};

export default function TeacherModal({ isOpen, onClose, classItem }: Props) {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const fetchTeachers = async () => {
        try {
          setLoading(true);
          setError(null);
          const res = await axiosInstance.get("/admin/teachers");
          setTeachers(res.data);
        } catch (error) {
          console.error("Error fetching teachers:", error);
          setError("Failed to fetch teachers. Please try again.");
        } finally {
          setLoading(false);
        }
      };
      fetchTeachers();
    }
  }, [isOpen]);

  const handleSave = async () => {
    if (!selectedTeacherId) {
      setError("Please select a teacher.");
      return;
    }
    try {
      await axiosInstance.put(`/admin/update-teacher`, {
        id: selectedTeacherId,
        class_id: classItem.class_id,
      });
      toast.success("Teacher assigned successfully");
      onClose();
    } catch (error) {
      console.error("Error assigning teacher:", error);
      setError("Failed to assign teacher. Please try again.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Appoint Teacher for {classItem.class_name}</DialogTitle>
          <DialogDescription>
            Select a teacher from the dropdown to assign to this class.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {loading ? (
            <Skeleton className="h-10 w-full" />
          ) : error ? (
            <p className="text-sm text-red-500">{error}</p>
          ) : (
            <Select
              onValueChange={setSelectedTeacherId}
              defaultValue={selectedTeacherId ?? undefined}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a teacher" />
              </SelectTrigger>
              <SelectContent>
                {teachers.map(
                  (teacher) =>
                    teacher && (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.name}
                      </SelectItem>
                    )
                )}
              </SelectContent>
            </Select>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading || !selectedTeacherId}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
