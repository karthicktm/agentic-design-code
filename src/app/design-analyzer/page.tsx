import React from 'react';
import { useRouter } from 'next/navigation';
import DesignAnalyzer from '@/components/design-analyzer/DesignAnalyzer';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function DesignAnalyzerPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Design Analyzer</h1>
          <p className="text-muted-foreground">
            Analyze your design to detect patterns and validate styles
          </p>
        </div>
        
        <Button>
          Continue to Component Mapping
        </Button>
      </div>
      
      <DesignAnalyzer design={null} />
    </div>
  );
}
