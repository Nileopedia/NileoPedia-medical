'use client';

import React from 'react';
import Image from 'next/image';
import { cn } from '../../utils/cn';

interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ src, alt, name, size = 'md', className }) => {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div
      className={cn(
        'rounded-full bg-blue-600 text-white flex items-center justify-center font-medium overflow-hidden',
        sizes[size],
        className
      )}
    >
      {src ? (
        <Image src={src} alt={alt || name || 'Avatar'} className="w-full h-full object-cover" width={48} height={48} />
      ) : (
        <span>{name ? getInitials(name) : '?'}</span>
      )}
    </div>
  );
};
