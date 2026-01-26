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
    <div className="min-h-screen bg-black relative">
      <div className="fixed inset-0 bg-green-500/5 pointer-events-none z-0" />
      <Navbar onMenuClick={() => setSidebarOpen(true)} />
      <div className="flex relative z-10">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 p-6 max-w-7xl mx-auto w-full">{children}</main>
      </div>
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-10 lg:hidden"
        />
      )}
    </div>
  );
}