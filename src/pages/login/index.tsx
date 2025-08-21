import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { auth } from '@/lib/firebase';
import { 
  signInWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup 
} from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axiosInstance from '@/lib/axios';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      
      if(auth.currentUser?.email && !auth.currentUser.email.endsWith('@rajagiri.edu.in') ) {
        await auth.signOut();
        toast.error('Please use your Rajagiri email address');
        return;
      }

      if (!auth.currentUser?.emailVerified){
        await auth.signOut();
        toast.error('Please verify your email address');
        return;
      }

      const onboard = (await axiosInstance.get(`/user/check/onboard`)).data.isOnboarded;

      toast.success('Logged in successfully!');
      if (onboard) {
        // User is onboarded, navigate to dashboard
        
        navigate('/home');
      }else{
        navigate('/onboarding');
      }
    

      

      
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const userEmail = result.user.email;

      if (!userEmail?.endsWith('@rajagiri.edu.in')) {
        // Sign out immediately if domain is wrong
        await auth.signOut();
        toast.error('Please sign in using @rajagiri.edu.in email.');
        return;
      }

      toast.success('Logged in with Google!');
      navigate('/home');
    } catch (err: any) {
      toast.error(err.message || 'Google sign-in failed.');
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
              Sign in to your account
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
                {loading ? 'Signing in...' : 'Sign in'}
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
              Don’t have an account?{' '}
              <button onClick={() => navigate('/signup')} className="text-black underline">
                Sign up
              </button>
            </p>
            <p className="mt-4 text-center text-sm text-gray-500">
              Not a student?{' '}
              <button onClick={() => navigate('/teacher/login')} className="text-black underline">
                Login as Teacher
              </button>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;
