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
            <h1 className="text-3xl font-bold text-white relative">
                {title}
                {tagline && <span>{tagline}</span>}
            </h1>
        </div>
    );
};