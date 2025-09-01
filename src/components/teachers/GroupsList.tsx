import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { X, Trash2 } from "lucide-react"; // Import Trash2 icon
import axios from "axios"; // Import axios for type checking
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
  DialogDescription,
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
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState, useMemo } from "react";
import { toast } from "react-hot-toast";
import { Checkbox } from "@/components/ui/checkbox";

// Define the types for our data
type Student = {
  id: string;
  name: string;
  email: string;
  roll: number;
};

type Group = {
  group_id: string;
  group_name: number;
  students: Student[];
};

type ApiResponse = {
  groups: Group[];
}[];

// Type for students not in a group
type UngroupedStudent = {
  id: string;
  name: string;
  roll: number;
};

type Props = {
  class_short: string;
};

const GroupsList = ({ class_short }: Props) => {
  const queryClient = useQueryClient();
  const [newGroupName, setNewGroupName] = useState("");
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetching groups
  const {
    data: groupsData,
    isLoading,
    isError,
  } = useQuery<ApiResponse>({
    queryKey: ["groups", class_short],
    queryFn: () =>
      axiosInstance
        .get(`/teacher/groups/${class_short}`)
        .then((res) => res.data),
  });

  // Fetching students who are not in a group
  const { data: ungroupedStudentsData, isLoading: isLoadingUngrouped } =
    useQuery<UngroupedStudent[]>({
      queryKey: ["ungrouped-students", class_short, activeGroupId],
      queryFn: () =>
        axiosInstance
          .get(`/teacher/students/${class_short}/groups`)
          .then((res) => res.data),
      enabled: !!activeGroupId,
      // *** MODIFICATION HERE ***
      // Prevent retrying on 404 errors, as it's an expected state (no students found)
      retry: (failureCount, error) => {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          return false; // Don't retry if the error is 404
        }
        // For other errors, retry up to 2 times (default behavior)
        return failureCount < 2;
      },
    });

  // Memoized filtered students list
  const filteredUngroupedStudents = useMemo(() => {
    // If the query resulted in a 404, ungroupedStudentsData will be undefined.
    // So we return an empty array, which is the desired behavior.
    if (!ungroupedStudentsData) return [];
    return ungroupedStudentsData.filter(
      (student) =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.roll.toString().includes(searchTerm)
    );
  }, [ungroupedStudentsData, searchTerm]);

  // Mutation for creating a new group
  const createGroupMutation = useMutation({
    mutationFn: (groupNumber: number) =>
      axiosInstance.post("/teacher/groups", {
        number: groupNumber,
        short_name: class_short,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups", class_short] });
      setNewGroupName("");
      setIsCreateGroupModalOpen(false);
      toast.success("Group created successfully!");
    },
    onError: () => {
      toast.error("Failed to create group.");
    },
  });

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

  const handleCreateGroup = () => {
    const groupNumber = parseInt(newGroupName, 10);
    if (!isNaN(groupNumber)) {
      createGroupMutation.mutate(groupNumber);
    }
  };

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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error fetching groups</div>;
  }

  const groups = groupsData?.[0]?.groups || [];
  const sortedGroups = useMemo(() => {
    // Create a shallow copy using [...] before sorting to avoid mutating the original array from the query cache.
    return [...groups].sort((a, b) => a.group_name - b.group_name);
  }, [groups]);

  return (
    <div className="p-4">
      {/* ... JSX is unchanged from the previous version ... */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Manage Groups</h1>
        <Dialog
          open={isCreateGroupModalOpen}
          onOpenChange={setIsCreateGroupModalOpen}
        >
          <DialogTrigger asChild>
            <Button>Create Group</Button>
          </DialogTrigger>
          <DialogContent>
            {/* ... Create Group Modal Content ... */}
            <DialogHeader>
              <DialogTitle>Create a New Group</DialogTitle>
              <DialogDescription>
                Enter the group number to create a new group.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="group-name" className="text-right">
                  Group Number
                </Label>
                <Input
                  id="group-name"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="col-span-3"
                  type="number"
                />
              </div>
            </div>
            <Button
              onClick={handleCreateGroup}
              disabled={createGroupMutation.isPending}
            >
              {createGroupMutation.isPending ? "Creating..." : "Create"}
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sortedGroups.map((group) => (
          <Card key={group.group_id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Group {group.group_name}</CardTitle>
                  <CardDescription>
                    {group.students.length} members
                  </CardDescription>
                </div>

                {/* *** DELETE GROUP BUTTON & DIALOG *** */}
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
                      <AlertDialogTitle>
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete Group {group.group_name} and remove all students
                        from it.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeleteGroup(group.group_id)}
                        disabled={deleteGroupMutation.isPending}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        {deleteGroupMutation.isPending
                          ? "Deleting..."
                          : "Delete"}
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
                    <AvatarFallback>
                      +{group.students.length - 5}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            </CardContent>
            <CardFooter>
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
                  <Button variant="outline">View Members</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Group {group.group_name} Members</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 max-h-48 overflow-y-auto pr-2">
                    {group.students.map((student) => {
                      const isBeingRemoved =
                        removeStudentMutation.isPending &&
                        removeStudentMutation.variables?.studentId ===
                          student.id;

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
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default GroupsList;
