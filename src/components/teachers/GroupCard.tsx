import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { X, Trash2 } from "lucide-react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "react-hot-toast";
import type { Group, UngroupedStudent } from "./types";
import SubmissionDeadlinesModal from "./SubmissionDeadlinesModal";

type Props = {
  group: Group;
  class_short: string;
};

const GroupCard = ({ group, class_short }: Props) => {
  const queryClient = useQueryClient();
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetching students who are not in a group
  const { data: ungroupedStudentsData, isLoading: isLoadingUngrouped } =
    useQuery<UngroupedStudent[]>({
      queryKey: ["ungrouped-students", class_short, activeGroupId],
      queryFn: () =>
        axiosInstance
          .get(`/teacher/students/${class_short}/groups`)
          .then((res) => res.data),
      enabled: !!activeGroupId,
      retry: (failureCount, error) => {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          return false;
        }
        return failureCount < 2;
      },
    });

  // Memoized filtered students list
  const filteredUngroupedStudents = useMemo(() => {
    if (!ungroupedStudentsData) return [];
    return ungroupedStudentsData.filter(
      (student) =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.roll.toString().includes(searchTerm)
    );
  }, [ungroupedStudentsData, searchTerm]);

  // Mutation for adding students to a group
  const addStudentsMutation = useMutation({
    mutationFn: (variables: { groupId: string; studentIds: string[] }) =>
      axiosInstance.post("/teacher/groups/students", {
        group_id: variables.groupId,
        student_ids: variables.studentIds,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups", class_short] });
      queryClient.invalidateQueries({
        queryKey: ["ungrouped-students", class_short],
      });
      setSelectedStudents([]);
      setSearchTerm("");
      toast.success("Students added to the group!");
    },
    onError: () => {
      toast.error("Failed to add students.");
    },
  });

  const deleteGroupMutation = useMutation({
    mutationFn: (groupId: string) =>
      axiosInstance.delete(`/teacher/groups/${groupId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups", class_short] });
      toast.success("Group deleted successfully.");
    },
    onError: () => {
      toast.error("Failed to delete group.");
    },
  });

  // Mutation for removing a student from a group
  const removeStudentMutation = useMutation({
    mutationFn: (variables: { groupId: string; studentId: string }) =>
      axiosInstance.delete(`/teacher/groups/students`, {
        data: {
          group_id: variables.groupId,
          student_id: variables.studentId,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups", class_short] });
      queryClient.invalidateQueries({
        queryKey: ["ungrouped-students", class_short],
      });
      toast.success("Student removed successfully.");
    },
    onError: () => {
      toast.error("Failed to remove student.");
    },
  });

  const handleAddStudents = (groupId: string) => {
    if (selectedStudents.length > 0) {
      addStudentsMutation.mutate({ groupId, studentIds: selectedStudents });
    }
  };

  const handleStudentSelection = (studentId: string) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleRemoveStudent = (groupId: string, studentId: string) => {
    removeStudentMutation.mutate({ groupId, studentId });
  };

  const handleDeleteGroup = (groupId: string) => {
    deleteGroupMutation.mutate(groupId);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Group {group.group_name}</CardTitle>
            <CardDescription>{group.students.length} members</CardDescription>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive/80"
                disabled={deleteGroupMutation.isPending}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  Group {group.group_name} and remove all students from it.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleDeleteGroup(group.group_id)}
                  disabled={deleteGroupMutation.isPending}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  {deleteGroupMutation.isPending ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex -space-x-2 overflow-hidden">
          {group.students.slice(0, 5).map((student) => (
            <Avatar key={student.id}>
              <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
            </Avatar>
          ))}
          {group.students.length > 5 && (
            <Avatar>
              <AvatarFallback>+{group.students.length - 5}</AvatarFallback>
            </Avatar>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col gap-2">
        <div className="flex gap-2 w-full">
          <Dialog
            onOpenChange={(isOpen) => {
              if (isOpen) {
                setActiveGroupId(group.group_id);
              } else {
                setActiveGroupId(null);
                setSelectedStudents([]);
                setSearchTerm("");
              }
            }}
          >
            <DialogTrigger asChild>
              <Button variant="outline" className="flex-1">View Members</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Group {group.group_name} Members</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 max-h-48 overflow-y-auto pr-2">
                {group.students.map((student) => {
                  const isBeingRemoved =
                    removeStudentMutation.isPending &&
                    removeStudentMutation.variables?.studentId === student.id;

                  return (
                    <div
                      key={student.id}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p className="font-semibold">{student.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {student.email}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <p className="text-sm text-muted-foreground">
                          Roll: {student.roll}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            handleRemoveStudent(group.group_id, student.id)
                          }
                          disabled={isBeingRemoved}
                          className="text-red-500 hover:text-red-600"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 border-t pt-6">
                <h3 className="text-lg font-semibold mb-2">Add Students</h3>
                <Input
                  placeholder="Search by name or roll..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mb-4"
                />
                {isLoadingUngrouped ? (
                  <p>Loading students...</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                    {filteredUngroupedStudents.length > 0 ? (
                      filteredUngroupedStudents.map((student) => (
                        <div
                          key={student.id}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={student.id}
                            onCheckedChange={() =>
                              handleStudentSelection(student.id)
                            }
                            checked={selectedStudents.includes(student.id)}
                          />
                          <label
                            htmlFor={student.id}
                            className="text-sm font-medium leading-none"
                          >
                            {student.name} (Roll: {student.roll})
                          </label>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No students found.
                      </p>
                    )}
                  </div>
                )}
                <Button
                  className="mt-4 w-full"
                  onClick={() => handleAddStudents(group.group_id)}
                  disabled={
                    addStudentsMutation.isPending ||
                    selectedStudents.length === 0
                  }
                >
                  {addStudentsMutation.isPending
                    ? "Adding..."
                    : `Add ${selectedStudents.length} Selected Student(s)`}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <SubmissionDeadlinesModal 
            groupId={group.group_id} 
            groupName={group.group_name} 
          />
        </div>
      </CardFooter>
    </Card>
  );
};

export default GroupCard;
