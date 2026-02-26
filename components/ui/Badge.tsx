import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'default';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
}) => {
  const variants = {
    success: 'bg-green-500/20 text-green-200 border border-green-500/30',
    warning: 'bg-yellow-500/20 text-yellow-200 border border-yellow-500/30',
    danger: 'bg-red-500/50 text-red-200 border border-red-500/30',
    info: 'bg-blue-500/20 text-blue-200 border border-blue-500/30',
    default: 'bg-white/10 text-white border border-white/20',
  };

  return (
    <span
      className={`
      px-2.5 py-0.5 rounded-full text-xs font-medium
      ${variants[variant]}
    `}
    >
      {children}
    </span>
  );
};