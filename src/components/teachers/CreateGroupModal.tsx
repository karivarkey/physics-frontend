import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { toast } from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  class_short: string;
};

const CreateGroupModal = ({ class_short }: Props) => {
  const queryClient = useQueryClient();
  const [newGroupName, setNewGroupName] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const createGroupMutation = useMutation({
    mutationFn: (groupNumber: number) =>
      axiosInstance.post("/teacher/groups", {
        number: groupNumber,
        short_name: class_short,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups", class_short] });
      setNewGroupName("");
      setIsOpen(false);
      toast.success("Group created successfully!");
    },
    onError: () => {
      toast.error("Failed to create group.");
    },
  });

  const handleCreateGroup = () => {
    const groupNumber = parseInt(newGroupName, 10);
    if (!isNaN(groupNumber)) {
      createGroupMutation.mutate(groupNumber);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Create Group</Button>
      </DialogTrigger>
      <DialogContent>
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
  );
};

export default CreateGroupModal;
