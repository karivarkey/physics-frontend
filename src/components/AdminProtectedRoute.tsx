import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged, getIdTokenResult } from "firebase/auth";
import { auth } from '@/lib/firebase';

import type { PropsWithChildren } from "react";
import type { User } from "firebase/auth";

export default function AdminProtectedRoute({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Get the user's ID token to access custom claims
        const tokenResult = await getIdTokenResult(currentUser);
        // Check for the 'admin' claim set by your backend
        setIsAdmin(tokenResult.claims.admin === true);
      } else {
        // No user is logged in
        setUser(null);
        setIsAdmin(false);
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

  // Redirect if user is not logged in OR if they are not an admin
  if (!user || !isAdmin) {
    return <Navigate to="/teacher/login" replace />;
  }

  // If authenticated and is an admin, render the child components
  return children;
}