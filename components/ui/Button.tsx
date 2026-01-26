'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  type?: 'button' | 'submit';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  icon,
  disabled = false,
  type = 'button',
}) => {
  const sizes = {
    sm: 'px-6 py-2 text-xs',
    md: 'px-8 py-3 text-sm',
    lg: 'px-10 py-4 text-base',
  };

  const innerClasses = `
    ${sizes[size]} 
    text-white rounded-full font-medium 
    bg-gray-900/80 backdrop-blur 
    flex items-center gap-2 justify-center
    disabled:opacity-50 disabled:cursor-not-allowed
    w-full h-full
  `;

  if (variant === 'primary') {
    return (
      <motion.div
        whileHover={{ scale: disabled ? 1 : 1.05 }}
        whileTap={{ scale: disabled ? 1 : 1.0 }}
        className={`rainbow relative z-0 bg-white/15 overflow-hidden p-[2px] rounded-full group ${className} ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <button
          onClick={onClick}
          disabled={disabled}
          type={type}
          className={innerClasses}
        >
          {icon}
          {children}
        </button>
      </motion.div>
    );
  }

  // Other variants (glass style)
  const otherVariantClasses = {
    secondary: 'bg-white/10 hover:bg-white/20 border-white/10 text-white',
    danger: 'bg-red-500/20 hover:bg-red-500/30 border-red-500/20 text-red-50',
    success: 'bg-green-500/20 hover:bg-green-500/30 border-green-500/20 text-green-50',
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled}
      type={type}
      className={`
        ${otherVariantClasses[variant as keyof typeof otherVariantClasses] || otherVariantClasses.secondary}
        ${sizes[size]} 
        rounded-full font-medium border
        transition-all duration-200 
        flex items-center gap-2 justify-center
        disabled:opacity-50 disabled:cursor-not-allowed
        shadow-md hover:shadow-lg backdrop-blur-sm
        ${className}
      `}
    >
      {icon}
      {children}
    </motion.button>
  );
};