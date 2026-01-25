'use client';

import React, { memo } from 'react';
import {
  Skeleton,
  SkeletonCard,
  SkeletonStatCard,
  SkeletonListItem,
  SkeletonAppointmentCard,
  SkeletonGridCard,
  SkeletonQueueItem,
  SkeletonFilterCard,
  SkeletonProfile,
} from './Skeleton';

/**
 * Dashboard page skeleton
 * Displays: Header + 4 stat cards + staff list + activity log
 */
export const DashboardSkeleton: React.FC = memo(function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="space-y-2">
          <Skeleton width="w-40" height="h-8" />
          <Skeleton width="w-56" height="h-5" />
        </div>
        <Skeleton width="w-40" height="h-10" rounded="lg" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <SkeletonStatCard />
        <SkeletonStatCard />
        <SkeletonStatCard />
        <SkeletonStatCard />
      </div>

      {/* Staff Load Summary */}
      <SkeletonCard>
        <Skeleton width="w-48" height="h-6" className="mb-4" />
        <div className="space-y-3">
          <SkeletonListItem />
          <SkeletonListItem />
          <SkeletonListItem />
        </div>
      </SkeletonCard>

      {/* Activity Log */}
      <SkeletonCard>
        <div className="flex items-center gap-2 mb-4">
          <Skeleton width="w-6" height="h-6" rounded="md" />
          <Skeleton width="w-36" height="h-6" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex items-start gap-3 p-2">
              <Skeleton width="w-14" height="h-4" />
              <Skeleton width="w-full" height="h-4" className="max-w-md" />
            </div>
          ))}
        </div>
      </SkeletonCard>
    </div>
  );
});

/**
 * Appointments page skeleton
 * Displays: Header + filter card + 3 appointment cards
 */
export const AppointmentsSkeleton: React.FC = memo(function AppointmentsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="space-y-2">
          <Skeleton width="w-44" height="h-8" />
          <Skeleton width="w-48" height="h-5" />
        </div>
        <Skeleton width="w-44" height="h-10" rounded="lg" />
      </div>

      {/* Filters */}
      <SkeletonFilterCard columns={2} />

      {/* Appointments List */}
      <div className="grid grid-cols-1 gap-4">
        <SkeletonAppointmentCard />
        <SkeletonAppointmentCard />
        <SkeletonAppointmentCard />
      </div>
    </div>
  );
});

/**
 * Queue page skeleton
 * Displays: Header + 3 queue item cards
 */
export const QueueSkeleton: React.FC = memo(function QueueSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="space-y-2">
          <Skeleton width="w-32" height="h-8" />
          <Skeleton width="w-64" height="h-5" />
        </div>
        <Skeleton width="w-24" height="h-8" rounded="full" />
      </div>

      {/* Queue Items */}
      <div className="space-y-4">
        <SkeletonQueueItem />
        <SkeletonQueueItem />
        <SkeletonQueueItem />
      </div>
    </div>
  );
});

/**
 * Services page skeleton
 * Displays: Header + 3 service cards in grid
 */
export const ServicesSkeleton: React.FC = memo(function ServicesSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="space-y-2">
          <Skeleton width="w-28" height="h-8" />
          <Skeleton width="w-52" height="h-5" />
        </div>
        <Skeleton width="w-36" height="h-10" rounded="lg" />
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <SkeletonGridCard />
        <SkeletonGridCard />
        <SkeletonGridCard />
      </div>
    </div>
  );
});

/**
 * Staff page skeleton
 * Displays: Header + 3 staff cards in grid
 */
export const StaffSkeleton: React.FC = memo(function StaffSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="space-y-2">
          <Skeleton width="w-36" height="h-8" />
          <Skeleton width="w-56" height="h-5" />
        </div>
        <Skeleton width="w-40" height="h-10" rounded="lg" />
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <SkeletonGridCard />
        <SkeletonGridCard />
        <SkeletonGridCard />
      </div>
    </div>
  );
});

/**
 * Profile page skeleton
 * Displays: Avatar section + form fields
 */
export const ProfilePageSkeleton: React.FC = memo(function ProfilePageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton width="w-32" height="h-8" />
        <Skeleton width="w-64" height="h-5" />
      </div>

      {/* Profile Content */}
      <SkeletonProfile />
    </div>
  );
});

/**
 * Form skeleton for new/edit pages
 */
export const FormSkeleton: React.FC<{ 
  fields?: number;
  hasHeader?: boolean;
  className?: string;
}> = memo(function FormSkeleton({ fields = 5, hasHeader = true, className = '' }) {
  return (
    <div className={`space-y-6 ${className}`}>
      {hasHeader && (
        <div className="space-y-2">
          <Skeleton width="w-48" height="h-8" />
          <Skeleton width="w-64" height="h-5" />
        </div>
      )}

      <SkeletonCard>
        <div className="space-y-4">
          {Array.from({ length: fields }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton width="w-24" height="h-4" />
              <Skeleton width="w-full" height="h-10" rounded="lg" />
            </div>
          ))}
        </div>
        <div className="flex gap-3 mt-6 pt-4 border-t">
          <Skeleton width="w-32" height="h-10" rounded="lg" />
          <Skeleton width="w-24" height="h-10" rounded="lg" />
        </div>
      </SkeletonCard>
    </div>
  );
});
