'use client';

import React from 'react';
import Image from 'next/image';
import { Calendar, LogOut, Menu, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '../ui/AuthContext';
import { useToast } from '../ui/ToastContext';
import { useRouter } from 'next/navigation';

interface NavbarProps {
  onMenuClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const toast = useToast();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    router.push('/login');
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <button onClick={onMenuClick} className="lg:hidden text-gray-600 hover:text-gray-900">
              <Menu size={24} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Calendar className="text-white" size={24} />
              </div>
              <span className="text-xl font-bold text-gray-900">AppointmentHub</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/profile')}
              className="flex items-center gap-2 hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden relative">
                {user?.profile?.image_url ? (
                  <Image
                    src={user.profile.image_url}
                    alt="Profile"
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserIcon className="text-gray-400" size={18} />
                )}
              </div>
              <div className="text-left hidden md:block">
                <div className="text-sm font-medium text-gray-900">
                  {user?.profile?.name || 'User'}
                </div>
                <div className="text-xs text-gray-500">{user?.email}</div>
              </div>
            </button>
            <Button variant="secondary" size="sm" icon={<LogOut size={16} />} onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};