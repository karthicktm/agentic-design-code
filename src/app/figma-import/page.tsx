import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { FigmaImport } from '@/components/figma-import/FigmaImport';
import DesignPreview from '@/components/figma-import/DesignPreview';
import { figmaService, FigmaDesign } from '@/components/figma-import/FigmaService';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function FigmaImportPage() {
  const router = useRouter();
  const [design, setDesign] = useState<FigmaDesign | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleImportSuccess = (importedDesign: FigmaDesign) => {
    setDesign(importedDesign);
    setError(null);
  };
  
  const handleImportError = (errorMessage: string) => {
    setError(errorMessage);
  };
  
  const handleContinue = () => {
    if (design) {
      // In a real implementation, this would store the design data and navigate to the next step
      router.push('/eds-library');
    }
  };
  
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Figma Import</h1>
          <p className="text-muted-foreground">
            Import your Figma designs to convert them to code
          </p>
        </div>
        
        {design && (
          <Button onClick={handleContinue}>
            Continue to EDS Library
          </Button>
        )}
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <FigmaImport />
      
      {loading && (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading design...</span>
        </div>
      )}
      
      {design && !loading && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold tracking-tight">Design Preview</h2>
          <DesignPreview design={design} />
        </div>
      )}
    </div>
  );
}
