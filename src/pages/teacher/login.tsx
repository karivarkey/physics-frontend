import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/firebase";
import { getIdTokenResult } from "firebase/auth";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";


const TeacherLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);

      const user = await auth.currentUser;

      if (user) {
        const idTokenResult = await getIdTokenResult(user);
        // The 'admin' claim will be available on the claims object.
        const isTeacher = idTokenResult.claims.teacher;

        if (isTeacher) {
            toast.success("Logged in successfully!");
          navigate('/teacher/home')
          // Show admin UI elements
        } else {
            toast.error("User is not registered as a teacher , please contact admin")
          
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      if (user) {
        const idTokenResult = await getIdTokenResult(user);
        const isTeacher = idTokenResult.claims.teacher;
        if (isTeacher) {
          toast.success("Logged in with Google!");
          navigate("/teacher/home");
        } else {
          toast.error("User is not registered as a teacher , please contact admin");
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Google sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-[400px] p-6 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-center font-bold">
              Sign in to your account (Teachers)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleLogin}>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-gray-100"
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-gray-100"
              />
              <Button
                type="submit"
                className="w-full bg-black text-white hover:bg-gray-900"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            <div className="my-4 flex items-center justify-center">
              <span className="text-gray-400">or</span>
            </div>

            <Button
              onClick={handleGoogleSignIn}
              className="w-full border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 flex items-center justify-center gap-2"
              disabled={loading}
            >
              <img src="/google-icon.svg" alt="Google" className="w-5 h-5" />
              Sign in with Google
            </Button>


            <p className="mt-4 text-center text-sm text-gray-500">
              Not a teacher?{" "}
              <button onClick={() => navigate('/login')} className="text-black underline">
                Login as Student
              </button>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default TeacherLogin;
