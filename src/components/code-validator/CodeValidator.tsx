import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Check, AlertTriangle, Info, Play, Download, ExternalLink } from 'lucide-react';
import Editor from '@monaco-editor/react';

interface CodeValidatorProps {
  generatedCode: string | null;
  framework: string;
}

interface ValidationResult {
  id: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  line?: number;
  column?: number;
  suggestion?: string;
}

const CodeValidator: React.FC<CodeValidatorProps> = ({ generatedCode, framework }) => {
  const [isValidating, setIsValidating] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedResult, setSelectedResult] = useState<ValidationResult | null>(null);
  const [editorValue, setEditorValue] = useState<string | null>(generatedCode);
  
  const handleValidateCode = async () => {
    if (!editorValue) return;
    
    setIsValidating(true);
    
    try {
      // In a real implementation, this would call the validation service
      console.log('Validating code for framework:', framework);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate mock validation results
      const mockResults = generateMockValidationResults(framework);
      setValidationResults(mockResults);
      
      // Handle success
      console.log('Code validation completed');
    } catch (error) {
      console.error('Error validating code:', error);
    } finally {
      setIsValidating(false);
    }
  };
  
  const handleRunPreview = async () => {
    if (!editorValue) return;
    
    setIsRunning(true);
    
    try {
      // In a real implementation, this would create a preview environment
      console.log('Creating preview for framework:', framework);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Set mock preview URL
      setPreviewUrl('https://preview.figma-to-code.example.com/preview/123');
      
      // Handle success
      console.log('Preview created successfully');
    } catch (error) {
      console.error('Error creating preview:', error);
    } finally {
      setIsRunning(false);
    }
  };
  
  const generateMockValidationResults = (framework: string): ValidationResult[] => {
    // Generate different validation results based on the framework
    if (framework === 'react') {
      return [
        {
          id: 'validation-1',
          type: 'warning',
          message: 'Component should use React.FC type for better type checking',
          line: 3,
          column: 1,
          suggestion: 'Use React.FC<ButtonProps> type annotation'
        },
        {
          id: 'validation-2',
          type: 'info',
          message: 'Consider using React.memo for better performance',
          line: 42,
          column: 1,
          suggestion: 'Wrap component with React.memo() for memoization'
        }
      ];
    } else if (framework === 'vue') {
      return [
        {
          id: 'validation-1',
          type: 'error',
          message: 'Missing key in v-for directive',
          line: 12,
          column: 5,
          suggestion: 'Add :key attribute to elements in v-for loops'
        },
        {
          id: 'validation-2',
          type: 'warning',
          message: 'Consider using computed property instead of method',
          line: 25,
          column: 3,
          suggestion: 'Replace method with computed property for better caching'
        }
      ];
    } else {
      return [
        {
          id: 'validation-1',
          type: 'warning',
          message: 'OnPush change detection strategy recommended',
          line: 5,
          column: 1,
          suggestion: 'Add changeDetection: ChangeDetectionStrategy.OnPush'
        },
        {
          id: 'validation-2',
          type: 'info',
          message: 'Consider using trackBy function with ngFor',
          line: 18,
          column: 7,
          suggestion: 'Add trackBy function to improve performance'
        }
      ];
    }
  };
  
  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setEditorValue(value);
    }
  };
  
  const getLanguageForFramework = (framework: string): string => {
    switch (framework) {
      case 'vue':
        return 'html';
      case 'angular':
      case 'react':
      default:
        return 'typescript';
    }
  };
  
  if (!generatedCode) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Code Validator</CardTitle>
          <CardDescription>Validate and preview generated code</CardDescription>
        </CardHeader>
        <CardContent className="h-96 flex items-center justify-center">
          <p className="text-muted-foreground">
            Please generate code first
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Code Editor</CardTitle>
              <CardDescription>
                Edit and validate your generated code
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={handleValidateCode}
                disabled={isValidating || !editorValue}
              >
                {isValidating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Validating...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Validate Code
                  </>
                )}
              </Button>
              <Button 
                onClick={handleRunPreview}
                disabled={isRunning || !editorValue}
              >
                {isRunning ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Preview...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Run Preview
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-[500px] border-t">
            <Editor
              height="500px"
              language={getLanguageForFramework(framework)}
              value={editorValue || ''}
              onChange={handleEditorChange}
              options={{
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                fontSize: 14,
                lineNumbers: 'on',
              }}
              theme="vs-dark"
            />
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Validation Results */}
        <Card>
          <CardHeader>
            <CardTitle>Validation Results</CardTitle>
            <CardDescription>
              {validationResults.length} issue{validationResults.length !== 1 ? 's' : ''} found
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[300px] px-4">
              <div className="space-y-2 py-2">
                {validationResults.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-[250px]">
                    <Check className="h-12 w-12 text-green-500 mb-4" />
                    <p className="text-muted-foreground">
                      {isValidating ? 'Validating code...' : 'No validation results yet'}
                    </p>
                  </div>
                ) : (
                  validationResults.map(result => (
                    <div
                      key={result.id}
                      className={`flex items-start p-3 rounded-md cursor-pointer hover:bg-accent ${
                        selectedResult?.id === result.id ? 'bg-accent' : ''
                      }`}
                      onClick={() => setSelectedResult(result)}
                    >
                      {result.type === 'error' && (
                        <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 mr-3 flex-shrink-0" />
                      )}
                      {result.type === 'warning' && (
                        <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 mr-3 flex-shrink-0" />
                      )}
                      {result.type === 'info' && (
                        <Info className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                      )}
                      <div>
                        <p className="font-medium text-sm">{result.message}</p>
                        {result.line && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Line {result.line}{result.column ? `, Column ${result.column}` : ''}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
        
        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>
              Live preview of your component
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {previewUrl ? (
              <div className="h-[300px] border-t">
                <div className="h-full flex flex-col">
                  <div className="bg-muted p-2 border-b flex items-center justify-between">
                    <span className="text-xs text-muted-foreground truncate">
                      {previewUrl}
                    </span>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <a href={previewUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex-1 bg-white p-4 flex items-center justify-center">
                    <div className="border rounded-md p-4 shadow-sm">
                      <button className="bg-blue-600 text-white py-2 px-4 rounded font-medium hover:bg-blue-700 transition-colors">
                        Button Example
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-[300px] flex flex-col items-center justify-center">
                <Play className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {isRunning ? 'Creating preview...' : 'Run preview to see your component'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Selected Issue Details */}
      {selectedResult && (
        <Alert variant={selectedResult.type === 'error' ? 'destructive' : 'default'}>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>
            {selectedResult.type.charAt(0).toUpperCase() + selectedResult.type.slice(1)}: {selectedResult.message}
          </AlertTitle>
          {selectedResult.suggestion && (
            <AlertDescription>
              Suggestion: {selectedResult.suggestion}
            </AlertDescription>
          )}
        </Alert>
      )}
    </div>
  );
};

export default CodeValidator;
