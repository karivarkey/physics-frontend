import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged, getIdTokenResult } from "firebase/auth";
import { auth } from '@/lib/firebase';

import type { PropsWithChildren } from "react";
import type { User } from "firebase/auth";

export default function TeacherProtectedRoute({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [isTeacher, setIsTeacher] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Get the user's ID token to access custom claims
        const tokenResult = await getIdTokenResult(currentUser);
        // Check for the 'teacher' claim set by your backend
        setIsTeacher(tokenResult.claims.teacher === true);
      } else {
        // No user is logged in
        setUser(null);
        setIsTeacher(false);
      }
      setLoading(false);
    });
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-pulse rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 w-16 h-16 mb-6"></div>
        <p className="text-gray-700 dark:text-gray-200 text-lg font-semibold">
          Authenticating...
        </p>
      </div>
    );
  }

  // Redirect if user is not logged in OR if they are not a teacher
  if (!user || !isTeacher) {
    return <Navigate to="/teacher/login" replace />;
  }

  // If authenticated and is a teacher, render the child components
  return children;
}