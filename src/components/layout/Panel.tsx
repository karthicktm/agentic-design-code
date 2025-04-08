"use client"

import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PanelProps {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  position?: 'left' | 'right' | 'bottom';
  width?: string;
  height?: string;
}

const Panel = ({ 
  title, 
  children, 
  isOpen, 
  onClose, 
  position = 'right',
  width = '320px',
  height = '100%'
}: PanelProps) => {
  const positionClasses = {
    'right': 'right-0 top-14 bottom-10 border-l',
    'left': 'left-0 top-14 bottom-10 border-r',
    'bottom': 'left-0 right-0 bottom-10 border-t'
  };

  const sizeStyles = position === 'bottom' 
    ? { height } 
    : { width };

  return (
    <div 
      className={cn(
        "fixed bg-background z-30 transition-all duration-300 ease-in-out",
        positionClasses[position],
        isOpen ? 'translate-x-0 translate-y-0' : position === 'right' 
          ? 'translate-x-full' 
          : position === 'left' 
            ? '-translate-x-full' 
            : 'translate-y-full'
      )}
      style={sizeStyles}
    >
      <div className="flex items-center justify-between border-b p-4">
        <h3 className="font-medium">{title}</h3>
        <button 
          onClick={onClose}
          className="rounded-full p-1 hover:bg-muted transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="p-4 h-[calc(100%-56px)] overflow-auto">
        {children}
      </div>
    </div>
  );
};

export default Panel;
