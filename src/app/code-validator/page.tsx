import React from 'react';
import { useRouter } from 'next/navigation';
import CodeValidator from '@/components/code-validator/CodeValidator';
import { Button } from '@/components/ui/button';

export default function CodeValidatorPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Code Validator</h1>
          <p className="text-muted-foreground">
            Validate and preview your generated code
          </p>
        </div>
        
        <Button>
          Download Code
        </Button>
      </div>
      
      <CodeValidator generatedCode={null} framework="react" />
    </div>
  );
}
