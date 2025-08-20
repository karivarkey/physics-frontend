"use client";

import { useEffect, useState } from "react";
import Header from "@/components/home/header/Header";
import { auth } from "@/lib/firebase";
import axiosInstance from "@/lib/axios";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

type ClassData = {
  long_name: string;
  short_name: string;
  
  enrolled_students: number;
};

const TeacherHome = () => {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);

  const userName = auth.currentUser?.displayName || "Teacher";
  const userEmail = auth.currentUser?.email || "";
  const navigate = useNavigate();
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await axiosInstance.get("/teacher/classes");
        console.log(res.data)
        setClasses(res.data || []);
      } catch (err) {
        console.error("Error fetching classes", err);
      } finally {
        setLoading(false);
      }
    };

    if (userEmail) fetchClasses();
  }, [userEmail]);

  return (
    <div className="min-h-screen bg-gradient-to-tr from-gray-50 to-gray-100">
      <Header userEmail={userEmail} userName={userName} teacher={true} />

      <main className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-6">Your Classes</h1>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        ) : classes.length === 0 ? (
          <p className="text-center text-gray-500">
            You haven’t been assigned to any classes yet.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {classes.map((cls, i) => (
              <motion.div
                key={cls.short_name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-all">
                  <CardHeader>
                    <CardTitle>{cls.long_name}</CardTitle>
                    <CardDescription>
                      {cls.short_name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      Enrolled Students: {cls.enrolled_students}
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full"
                    onClick={() => {
                      navigate(`/teacher/class/${cls.short_name}`);
                    }}
                    >View Class</Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default TeacherHome;
