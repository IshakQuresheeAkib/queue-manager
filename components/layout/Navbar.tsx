'use client';

import React from 'react';
import { Calendar, LogOut, Menu } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '../ui/AuthContext';

interface NavbarProps {
  onMenuClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();

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
            <div className="text-sm text-gray-600">{user?.email}</div>
            <Button variant="secondary" size="sm" icon={<LogOut size={16} />} onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};