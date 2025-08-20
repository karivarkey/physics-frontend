import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from '@/lib/firebase';

import type { PropsWithChildren } from "react";
import type { User } from "firebase/auth";

export default function ProtectedRoute({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading)
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-pulse rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 w-16 h-16 mb-6"></div>
        <p className="text-gray-700 dark:text-gray-200 text-lg font-semibold">
          Loading ...
        </p>
      </div>
    );

  if (!user) return <Navigate to="/login" replace />;

  return children;
}
