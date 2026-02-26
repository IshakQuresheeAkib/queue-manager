'use client';

import React from 'react';

interface HeadingProps {
    title: string;
    tagline?: string;
    align?: 'left' | 'center';
    className?: string;
}

export const Heading: React.FC<HeadingProps> = ({ 
    title, 
    tagline, 
    align = 'left',
    className = ''
}) => {
    return (
        <div className={`heading-two ${align === 'center' ? 'heading-alt-two' : ''} ${className}`}>
            <h1 className="text-3xl font-extrabold tracking-wide text-white/70 bg-clip-text bg-gradient-to-r from-white to-green-400 hidden sm:inline leading-tight relative">
                {title}
                {tagline && <span className='text-[11px]'>{tagline}</span>}
            </h1>
        </div>
    );
};