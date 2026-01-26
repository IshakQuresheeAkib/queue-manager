'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = false,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={
        hover ? { y: -4, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 0 15px rgba(0, 166, 62, 0.2)' } : {}
      }
      className={`
        bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 
        transition-all duration-300
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
};