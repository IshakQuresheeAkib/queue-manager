'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Calendar, List, Users, Briefcase, UserCircle, LogOut } from 'lucide-react';
import { useAuth } from '@/components/ui/AuthContext';
import { useToast } from '@/components/ui/ToastContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { logout } = useAuth();
  const toast = useToast();

  const menuItems = [
    { id: 'dashboard', path: '/dashboard', icon: <Home size={20} />, label: 'Dashboard' },
    { id: 'appointments', path: '/appointments', icon: <Calendar size={20} />, label: 'Appointments' },
    { id: 'queue', path: '/queue', icon: <List size={20} />, label: 'Queue' },
    { id: 'staff', path: '/staff', icon: <Users size={20} />, label: 'Staff' },
    { id: 'services', path: '/services', icon: <Briefcase size={20} />, label: 'Services' },
    { id: 'profile', path: '/profile', icon: <UserCircle size={20} />, label: 'Profile' },
  ];

  const handleNavigate = (path: string): void => {
    router.push(path);
    onClose();
  };

  const handleLogout = async (): Promise<void> => {
    await logout();
    toast.success('Logged out successfully');
    router.push('/login');
    onClose();
  };

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          />
        )}
      </AnimatePresence>
      
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: isOpen || (typeof window !== 'undefined' && window.innerWidth >= 1024) ? 0 : -280,
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-black/90 lg:bg-black/50 backdrop-blur-xl border-r border-white/10 z-40 lg:z-20 overflow-y-auto shadow-2xl lg:shadow-none flex flex-col"
      >
        <div className="p-4 space-y-2 flex-1">
        {menuItems.map((item) => (
          <motion.button
            key={item.id}
            whileHover={{ x: 4 }}
            onClick={() => handleNavigate(item.path)}
            className={`
              w-full flex items-center gap-3 px-4 py-3 rounded-lg
              transition-all duration-200 border border-transparent
              ${
                pathname === item.path
                  ? 'bg-[#00A63E]/10 text-green-400 font-medium border-green-500/20'
                  : 'text-white/70 hover:bg-white/5 hover:text-white hover:border-white/5'
              }
            `}
          >
            {item.icon}
            {item.label}
          </motion.button>
        ))}
      </div>
      
      {/* Logout Button - Only visible on mobile (<600px) */}
      <div className="p-4 border-t border-white/10 min-[600px]:hidden">
        <motion.button
          whileHover={{ x: 4 }}
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white/70 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition-all duration-200 border border-transparent"
        >
          <LogOut size={20} />
          Logout
        </motion.button>
      </div>
      </motion.aside>
    </>
  );
};
