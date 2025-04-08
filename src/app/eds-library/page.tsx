import React from 'react';
import { useRouter } from 'next/navigation';
import EDSLibraryImport from '@/components/eds-library/EDSLibraryImport';
import LibraryBrowser from '@/components/eds-library/LibraryBrowser';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function EDSLibraryPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">EDS Library Import</h1>
          <p className="text-muted-foreground">
            Import your Enterprise Design System library for component mapping
          </p>
        </div>
        
        <Button>
          Continue to Component Mapping
        </Button>
      </div>
      
      <EDSLibraryImport />
      
      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">Library Browser</h2>
        <LibraryBrowser library={null} />
      </div>
    </div>
  );
}
