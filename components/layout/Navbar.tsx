'use client';

import React from 'react';
import Image from 'next/image';
import { Calendar, LogOut, Menu, SwatchBook, User as UserIcon } from 'lucide-react';
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
    <nav className="bg-green-950/20 backdrop-blur-3xl shadow-2xl shadow-green-900/20 border-b border-white/20 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <button onClick={onMenuClick} className="lg:hidden text-white/70 hover:text-white">
              <Menu size={24} />
            </button>
            <div className="flex items-center gap-2 text-gray-400">
              <div className="w-10 h-10  rounded-lg flex items-center justify-center">
                <SwatchBook className="text-green-400" size={28}/>
              </div>
              <span className="text-xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-green-400">AppointmentHub</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/profile')}
              className="flex items-center gap-2 hover:bg-white/5 px-3 py-2 rounded-lg transition-colors border border-transparent hover:border-white/10"
            >
              <div className="avatar-container w-10 h-10">
                {user?.profile?.image_url ? (
                  <Image
                    src={user.profile.image_url}
                    alt="Profile"
                    width={40}
                    height={40}
                    className="avatar-mask w-full h-full object-cover"
                  />
                ) : (
                  <div className="avatar-mask w-full h-full bg-white/10 flex items-center justify-center">
                    <UserIcon className="text-white/60" size={20} />
                  </div>
                )}
                <span className="avatar-indicator"></span>
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