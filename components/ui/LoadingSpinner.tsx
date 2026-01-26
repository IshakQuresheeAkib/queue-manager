'use client';

import React, { memo } from 'react';

type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl';

interface LoadingSpinnerProps {
  /** Size of the spinner: sm (16px), md (24px), lg (32px), xl (48px) */
  size?: SpinnerSize;
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

const sizeMap: Record<SpinnerSize, { spinner: string; container: string }> = {
  sm: { spinner: 'h-4 w-4 border-b-2', container: 'text-xs' },
  md: { spinner: 'h-6 w-6 border-b-2', container: 'text-sm' },
  lg: { spinner: 'h-8 w-8 border-b-2', container: 'text-base' },
  xl: { spinner: 'h-12 w-12 border-b-4', container: 'text-base' },
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = memo(function LoadingSpinner({
  size = 'lg',
  text,
  fullScreen = false,
  className = '',
}) {
  const { spinner, container } = sizeMap[size];

  const spinnerElement = (
    <div className={`flex flex-col items-center justify-center gap-3 ${container} ${className}`}>
      <div
        className={`animate-spin rounded-full border-green-500 mx-auto ${spinner} ${fullScreen ? 'border-1' : ''}`}
        role="status"
        aria-label={text || 'Loading'}
      />
      {text && <p className="text-white/60">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
        {spinnerElement}
      </div>
    );
  }

  return spinnerElement;
});

export default LoadingSpinner;
