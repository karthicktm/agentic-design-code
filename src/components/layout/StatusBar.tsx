"use client"

import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';

interface StatusBarProps {
  status?: string;
  isLoading?: boolean;
  progress?: number;
}

const StatusBar = ({ status = 'Ready', isLoading = false, progress = 0 }: StatusBarProps) => {
  return (
    <div className="border-t border-border bg-muted/40 py-2 px-4 fixed bottom-0 left-0 right-0 z-10">
      <div className="container flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          <span className="text-sm text-muted-foreground">{status}</span>
        </div>
        
        {progress > 0 && (
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-32 rounded-full bg-muted overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-300 ease-in-out" 
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground">{progress}%</span>
          </div>
        )}
        
        <div className="text-xs text-muted-foreground">
          Figma-to-Code v1.0.0
        </div>
      </div>
    </div>
  );
};

export default StatusBar;
