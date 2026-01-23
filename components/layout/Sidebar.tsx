'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, Calendar, List, Users, Briefcase } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const pathname = usePathname();

  const menuItems = [
    { id: 'dashboard', path: '/dashboard', icon: <Home size={20} />, label: 'Dashboard' },
    { id: 'appointments', path: '/appointments', icon: <Calendar size={20} />, label: 'Appointments' },
    { id: 'queue', path: '/queue', icon: <List size={20} />, label: 'Queue' },
    { id: 'staff', path: '/staff', icon: <Users size={20} />, label: 'Staff' },
    { id: 'services', path: '/services', icon: <Briefcase size={20} />, label: 'Services' },
  ];

  const handleNavigate = (path: string): void => {
    router.push(path);
    onClose();
  };

  return (
    <motion.aside
      initial={false}
      animate={{
        x: isOpen || (typeof window !== 'undefined' && window.innerWidth >= 1024) ? 0 : -280,
      }}
      className="fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white shadow-lg z-20 overflow-y-auto"
    >
      <div className="p-4 space-y-2">
        {menuItems.map((item) => (
          <motion.button
            key={item.id}
            whileHover={{ x: 4 }}
            onClick={() => handleNavigate(item.path)}
            className={`
              w-full flex items-center gap-3 px-4 py-3 rounded-lg
              transition-colors duration-200
              ${
                pathname === item.path
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }
            `}
          >
            {item.icon}
            {item.label}
          </motion.button>
        ))}
      </div>
    </motion.aside>
  );
};
