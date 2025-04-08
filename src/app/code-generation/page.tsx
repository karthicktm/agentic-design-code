import React from 'react';
import { useRouter } from 'next/navigation';
import LLMOrchestrator from '@/components/llm-orchestrator/LLMOrchestrator';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function CodeGenerationPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Code Generation</h1>
          <p className="text-muted-foreground">
            Generate code from component mappings using AI
          </p>
        </div>
        
        <Button>
          Continue to Code Validation
        </Button>
      </div>
      
      <LLMOrchestrator mappings={null} />
    </div>
  );
}
