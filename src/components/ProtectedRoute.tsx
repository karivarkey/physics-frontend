import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {auth} from '@/lib/firebase'

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

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  
  return children;
}
