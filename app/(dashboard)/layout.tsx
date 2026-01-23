'use client';

import React, {  useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/ui/AuthContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) {
    return null; 
  }

  return (
    <div className="min-h-screen bg-gray-50">
       <Navbar onMenuClick={() => setSidebarOpen(true)} />
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 p-6 max-w-7xl mx-auto w-full">{children}</main>
      </div>
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-10 lg:hidden"
        />
      )}
    </div>
  );
}