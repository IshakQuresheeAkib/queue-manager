'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/ui/AuthContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, loading, initializing } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Only redirect after initialization complete and confirmed no user
    if (!initializing && !loading && !user) {
      router.push('/login');
    }
  }, [user, loading, initializing, router]);

  // Show loading during initialization or explicit auth operations
  if (loading || initializing) {
    return <LoadingSpinner size="xl" text="Loading..." fullScreen />;
  }

  // No user after initialization - redirect will happen via useEffect
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background Glow - lower opacity than auth pages */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none w-[600px] h-[600px] bg-green-500/15 rounded-full blur-[180px] z-0" />
      <div className="fixed inset-0 bg-green-500/5 pointer-events-none z-0" />
      <Navbar 
        onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
        isSidebarOpen={sidebarOpen} 
      />
      <div className="flex relative z-10 pt-16">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 p-4 sm:p-6 max-w-7xl mx-auto w-full">{children}</main>
      </div>
    </div>
  );
}