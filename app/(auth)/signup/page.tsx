'use client';

import { useAuth } from "@/components/ui/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/ToastContext";
import { Lock, Mail, UserPlus } from "lucide-react";
import { useState } from "react";
import { motion } from 'framer-motion';
import { useRouter } from "next/navigation";
import { Heading } from "@/components/ui/Heading";


const SignupPage: React.FC = () => {
  const { signup } = useAuth();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await signup(email, password);
      toast.success('Account created successfully!');
      router.push('dashboard');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Signup failed';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative bg-black min-h-screen flex items-center justify-center px-4 py-20 overflow-hidden">
        {/* Background Glow */}
       <div className='fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none mb-10 size-140 bg-purple-500/20 rounded-full blur-[200px]'></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="inline-flex items-center justify-center w-16 h-16 bg-purple-500/10 border border-purple-500/20 rounded-full mb-4"
            >
              <UserPlus className="text-purple-400" size={32} />
            </motion.div>
            
            <Heading title="Create Account" tagline="Start managing appointments" align="center" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="your@email.com"
              icon={<Mail size={20} />}
              required
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="••••••••"
              icon={<Lock size={20} />}
              required
            />
            <Input
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="••••••••"
              icon={<Lock size={20} />}
              required
            />

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-red-500/10 border border-red-500/20 text-red-200 p-3 rounded-lg text-sm"
              >
                {error}
              </motion.div>
            )}

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </Button>
          </form>

          <p className="text-center text-white/40 mt-6 text-sm">
            Already have an account?{' '}
            <button
              onClick={() => router.push('login')}
              className="text-green-400 font-medium hover:text-green-300 transition-colors"
            >
              Sign In
            </button>
          </p>
        </div>
      </motion.div>
    </section>
  );
};

export default SignupPage;