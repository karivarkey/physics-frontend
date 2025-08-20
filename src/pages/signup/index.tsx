import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { auth } from '@/lib/firebase';
import { createUserWithEmailAndPassword, sendEmailVerification,signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axiosInstance from '@/lib/axios';

const Signup = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }

    setLoading(true);

    try {
      if (!email.endsWith('@rajagiri.edu.in')){
        toast.error('Please use your Rajagiri email address');
        return;
      }
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await axiosInstance.post('/user/create')
      await sendEmailVerification(userCredential.user);
      await signOut(auth);
      toast.success('Account created! Please check your email to verify the account');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.message || 'Signup failed.');
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
              Create your account
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSignup}>
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
              <Input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="bg-gray-100"
              />
              <Button
                type="submit"
                className="w-full bg-black text-white hover:bg-gray-900"
                disabled={loading}
              >
                {loading ? 'Creating account...' : 'Sign up'}
              </Button>
            </form>

            <p className="mt-4 text-center text-sm text-gray-500">
              Already have an account?{' '}
              <a href="/login" className="text-black underline">
                Sign in
              </a>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Signup;
