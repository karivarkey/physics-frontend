import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Trash2, Plus } from "lucide-react";

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
  cls: ClassItem;
  onDelete: (classId: string) => void;
  onOpenModal: (cls: ClassItem) => void;
};

export default function ClassTeacherCard({
  cls,
  onDelete,
  onOpenModal,
}: Props) {
  return (
    <Card className="border rounded-lg shadow-sm hover:shadow-md transition-all bg-white">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          {cls.class_name}
        </CardTitle>
        <CardDescription>{cls.name_short}</CardDescription>
      </CardHeader>
      <CardContent>
        {cls.teacher ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarFallback>
                  {cls.teacher.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{cls.teacher.name}</p>
                <p className="text-sm text-muted-foreground">
                  {cls.teacher.email}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(cls.class_id)}
            >
              <Trash2 className="h-5 w-5 text-red-500" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground italic">
              No teacher assigned
            </p>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onOpenModal(cls)}
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
