'use client';

import React, { memo } from 'react';

interface SkeletonProps {
  /** Width of skeleton - can be Tailwind class or CSS value */
  width?: string;
  /** Height of skeleton - can be Tailwind class or CSS value */
  height?: string;
  /** Additional CSS classes */
  className?: string;
  /** Border radius variant */
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Number of skeleton items to render */
  count?: number;
}

const roundedMap: Record<string, string> = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  full: 'rounded-full',
};

/**
 * Base skeleton component with pulse animation
 */
export const Skeleton: React.FC<SkeletonProps> = memo(function Skeleton({
  width = 'w-full',
  height = 'h-4',
  className = '',
  rounded = 'md',
  count = 1,
}) {
  const baseClasses = `animate-pulse bg-white/10 ${roundedMap[rounded]} ${width} ${height} ${className}`;

  if (count === 1) {
    return <div className={baseClasses} />;
  }

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={baseClasses} />
      ))}
    </>
  );
});

/**
 * Text line skeleton
 */
export const SkeletonText: React.FC<{
  lines?: number;
  className?: string;
  lastLineWidth?: string;
}> = memo(function SkeletonText({ lines = 1, className = '', lastLineWidth = 'w-3/4' }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          height="h-4"
          width={index === lines - 1 && lines > 1 ? lastLineWidth : 'w-full'}
        />
      ))}
    </div>
  );
});

/**
 * Circle skeleton for avatars
 */
export const SkeletonCircle: React.FC<{
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}> = memo(function SkeletonCircle({ size = 'md', className = '' }) {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  return <Skeleton width={sizeMap[size].split(' ')[0]} height={sizeMap[size].split(' ')[1]} rounded="full" className={className} />;
});

/**
 * Card skeleton wrapper
 */
export const SkeletonCard: React.FC<{
  children?: React.ReactNode;
  className?: string;
}> = memo(function SkeletonCard({ children, className = '' }) {
  return (
    <div className={`
        bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 
        transition-all duration-300 shadow-lg ${className}`}>
      {children}
    </div>
  );
});

/**
 * Stat card skeleton for dashboard
 */
export const SkeletonStatCard: React.FC<{ className?: string }> = memo(function SkeletonStatCard({ className = '' }) {
  return (
    <SkeletonCard className={className}>
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton width="w-20" height="h-4" />
          <Skeleton width="w-16" height="h-8" />
        </div>
        <SkeletonCircle size="lg" />
      </div>
    </SkeletonCard>
  );
});

/**
 * List item skeleton
 */
export const SkeletonListItem: React.FC<{
  hasAvatar?: boolean;
  hasAction?: boolean;
  className?: string;
}> = memo(function SkeletonListItem({ hasAvatar = true, hasAction = true, className = '' }) {
  return (
    <div className={`flex items-center justify-between p-3 bg-white/5 rounded-lg ${className}`}>
      <div className="flex items-center gap-3 flex-1">
        {hasAvatar && <SkeletonCircle size="md" />}
        <div className="space-y-2 flex-1">
          <Skeleton width="w-32" height="h-4" />
          <Skeleton width="w-24" height="h-3" />
        </div>
      </div>
      {hasAction && (
        <div className="flex items-center gap-2">
          <Skeleton width="w-12" height="h-5" rounded="full" />
        </div>
      )}
    </div>
  );
});

/**
 * Appointment card skeleton
 */
export const SkeletonAppointmentCard: React.FC<{ className?: string }> = memo(function SkeletonAppointmentCard({ className = '' }) {
  return (
    <SkeletonCard className={className}>
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="flex-1 min-w-[250px]">
          <div className="flex items-center gap-3 mb-3">
            <Skeleton width="w-40" height="h-6" />
            <Skeleton width="w-20" height="h-5" rounded="full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Skeleton width="w-36" height="h-4" />
            <Skeleton width="w-28" height="h-4" />
            <Skeleton width="w-32" height="h-4" />
            <Skeleton width="w-24" height="h-4" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton width="w-24" height="h-9" rounded="lg" />
          <Skeleton width="w-20" height="h-9" rounded="lg" />
          <Skeleton width="w-16" height="h-9" rounded="lg" />
        </div>
      </div>
    </SkeletonCard>
  );
});

/**
 * Service/Staff card skeleton for grid layouts
 */
export const SkeletonGridCard: React.FC<{ className?: string }> = memo(function SkeletonGridCard({ className = '' }) {
  return (
    <SkeletonCard className={className}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <SkeletonCircle size="lg" />
          <div className="space-y-2">
            <Skeleton width="w-32" height="h-5" />
            <Skeleton width="w-20" height="h-4" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton width="w-8" height="h-8" rounded="lg" />
          <Skeleton width="w-8" height="h-8" rounded="lg" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton width="w-full" height="h-4" />
        <Skeleton width="w-3/4" height="h-4" />
      </div>
    </SkeletonCard>
  );
});

/**
 * Queue item skeleton
 */
export const SkeletonQueueItem: React.FC<{ className?: string }> = memo(function SkeletonQueueItem({ className = '' }) {
  return (
    <SkeletonCard className={className}>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Skeleton width="w-12" height="h-12" rounded="lg" />
          <div className="space-y-2">
            <Skeleton width="w-36" height="h-5" />
            <div className="flex gap-4">
              <Skeleton width="w-24" height="h-4" />
              <Skeleton width="w-20" height="h-4" />
            </div>
          </div>
        </div>
        <Skeleton width="w-28" height="h-9" rounded="lg" />
      </div>
    </SkeletonCard>
  );
});

/**
 * Filter card skeleton
 */
export const SkeletonFilterCard: React.FC<{ columns?: number; className?: string }> = memo(function SkeletonFilterCard({ columns = 2, className = '' }) {
  return (
    <SkeletonCard className={className}>
      <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-4`}>
        {Array.from({ length: columns }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton width="w-24" height="h-4" />
            <Skeleton width="w-full" height="h-10" rounded="lg" />
          </div>
        ))}
      </div>
    </SkeletonCard>
  );
});

/**
 * Profile skeleton
 */
export const SkeletonProfile: React.FC<{ className?: string }> = memo(function SkeletonProfile({ className = '' }) {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Avatar section */}
      <SkeletonCard>
        <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
          <Skeleton width="w-24" height="h-24" rounded="full" className="flex-shrink-0" />
          <div className="flex-1 space-y-3 text-center sm:text-left">
            <Skeleton width="w-48" height="h-6" className="mx-auto sm:mx-0" />
            <Skeleton width="w-64" height="h-4" className="mx-auto sm:mx-0" />
            <Skeleton width="w-32" height="h-9" rounded="lg" className="mx-auto sm:mx-0" />
          </div>
        </div>
      </SkeletonCard>

      {/* Form section */}
      <SkeletonCard>
        <Skeleton width="w-40" height="h-6" className="mb-6" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton width="w-20" height="h-4" />
              <Skeleton width="w-full" height="h-10" rounded="lg" />
            </div>
          ))}
        </div>
        <Skeleton width="w-32" height="h-10" rounded="lg" className="mt-6" />
      </SkeletonCard>
    </div>
  );
});

export default Skeleton;
