import { useParams, useNavigate } from "react-router-dom"
import axiosInstance from "@/lib/axios"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Loader2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useQuery } from "@tanstack/react-query"

type Student = {
  id: string
  name: string
  email: string
  roll: number
  onboarding_complete: boolean
  teacher: string | null
  class: {
    id: string
    class_name: string
    name_short: string
    locked: boolean | null
  }
  group: {
    id: string
    group_number: number
  }
  deadlines: {
    experiment_id: string
    title: string
    deadline: string
  }[]
  submissions: {
    id: string
    marks: number | null
    date_submitted: string
    answer: string
    experiment: {
      id: string
      title: string
      description: string
      questions: any
    }
  }[]
}

async function fetchStudent(id: string): Promise<Student> {
  const res = await axiosInstance.get(`/teacher/students/${id}`)
  return res.data.user_data
}

export default function StudentDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const {
    data: student,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["student", id],
    queryFn: () => fetchStudent(id!),
    enabled: !!id, // only run if id is present
  })

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (isError || !student) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Student not found.
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        className="flex items-center gap-2"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle>{student.name}</CardTitle>
          <CardDescription>{student.email}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline">Roll {student.roll}</Badge>
            <Badge>{student.class.name_short}</Badge>
            <Badge
              variant={student.onboarding_complete ? "default" : "destructive"}
            >
              {student.onboarding_complete ? "Onboarded" : "Pending"}
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground">
            Class: {student.class.class_name} <br />
            Group: {student.group.group_number}
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Deadlines */}
      <Card>
        <CardHeader>
          <CardTitle>Deadlines</CardTitle>
        </CardHeader>
        <CardContent>
          {student.deadlines.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No deadlines assigned.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Experiment</TableHead>
                  <TableHead>Deadline</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {student.deadlines.map((d) => (
                  <TableRow key={d.experiment_id}>
                    <TableCell>{d.title}</TableCell>
                    <TableCell>
                      {new Date(d.deadline).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Submissions */}
      <Card>
        <CardHeader>
          <CardTitle>Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          {student.submissions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No submissions yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Experiment</TableHead>
                  <TableHead>Marks</TableHead>
                  <TableHead>Submitted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {student.submissions.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>{s.experiment.title}</TableCell>
                    <TableCell>{s.marks ?? "-"}</TableCell>
                    <TableCell>
                      {new Date(s.date_submitted).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
