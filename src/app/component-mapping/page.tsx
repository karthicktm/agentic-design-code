import React from 'react';
import { useRouter } from 'next/navigation';
import ComponentMapping from '@/components/component-mapping/ComponentMapping';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function ComponentMappingPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Component Mapping</h1>
          <p className="text-muted-foreground">
            Map Figma components to EDS library components
          </p>
        </div>
        
        <Button>
          Continue to Code Generation
        </Button>
      </div>
      
      <ComponentMapping figmaDesign={null} edsLibrary={null} detectedPatterns={null} />
    </div>
  );
}
