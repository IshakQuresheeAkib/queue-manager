'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Calendar, Mail, Lock, SwatchBook } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DemoInfo } from '@/components/ui/DemoInfo';
import { useAuth } from '@/components/ui/AuthContext';
import { useToast } from '@/components/ui/ToastContext';

export default function LoginPage() {
  const router = useRouter();
  const { login, demoLogin } = useAuth();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      toast.success('Welcome back!');
      router.push('/dashboard');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (): Promise<void> => {
    setLoading(true);
    try {
      await demoLogin();
      toast.success('Welcome to the demo account!');
      router.push('/dashboard');
    } catch {
      setError('Demo login failed');
      toast.error('Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className='relative bg-black min-h-screen flex flex-col md:flex-row items-center justify-center px-4 py-20 gap-20 overflow-hidden'>
       {/* Background Glow */}
       <div className='fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none mb-10 size-140 bg-green-500/20 rounded-full blur-[200px]'></div>

       <div className='absolute top-4 right-4 z-20'>
        <DemoInfo />
      </div>

       <div className='flex flex-col md:flex-row max-w-6xl w-full z-10 gap-12 items-center'>
          {/* Left Side Info */}
          <div className='text-center md:text-left flex-1 space-y-6'>

            <h1 className='font-medium text-4xl md:text-6xl leading-tight bg-gradient-to-r from-white to-green-300 bg-clip-text text-transparent'>
                Manage Queues & Appointments Smarter
            </h1>
            <p className='text-lg text-white/60 max-w-md mx-auto md:mx-0'>
                Streamline your business operations with our advanced scheduling and queue management system.
            </p> 
          </div>

          {/* Right Side Form */}
          <div className='w-full max-w-md bg-[#00A63E]/5 backdrop-blur-md border border-white/10 rounded-xl p-8 relative'>
             <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/10 rounded-full mb-4 border border-green-500/20">
                    <SwatchBook className="text-white" size={32}/>
                </div>
                <h2 className='text-2xl font-bold text-white'>Welcome Back</h2>
                <p className='text-white/40 text-sm'>Sign in to your dashboard</p>
             </div>

             <form onSubmit={handleSubmit} className='space-y-6'>
                <Input 
                   label="Email"
                   type="email"
                   required
                   placeholder="Eden@example.com" 
                   value={email}
                   onChange={setEmail}
                   icon={<Mail size={18} />}
                />

                <Input 
                    label="Password"
                    type="password" 
                    required
                    placeholder="••••••••" 
                    value={password}
                    onChange={setPassword}
                    icon={<Lock size={18} />}
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
    
                <div className='space-y-4'>
                    <Button type="submit" variant="primary" className='w-full' disabled={loading}>
                        {loading ? 'Submitting...' : 'Sign In'}
                    </Button>
                    
                    <div className="relative flex justify-center text-xs">
                        <span className="px-2 bg-transparent text-white/20 uppercase tracking-wider">Or continue with</span>
                    </div>

                    <Button variant="secondary" className="w-full" onClick={handleDemoLogin} disabled={loading} type="button">
                        Try Demo Account
                    </Button>
                </div>

                <p className='text-center text-xs text-white/40 mt-6'>
                    Don&apos;t have an account? <button type="button" onClick={() => router.push('/signup')} className='text-green-400 hover:text-green-300'>Sign Up</button>
                </p>
             </form>
          </div>
       </div>
    </section>
  );
}