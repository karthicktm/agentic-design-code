import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Wand2, AlertTriangle, Check, Info } from 'lucide-react';
import { FigmaNode, FigmaDesign, ComponentPattern, StyleIssue, AnalysisResult } from '../../lib/agents';

interface DesignAnalyzerProps {
  designData: FigmaDesign | null;
  onAnalyze: () => Promise<void>;
  isAnalyzing: boolean;
  error: string | null;
  analysisResult: AnalysisResult | null;
  patterns: ComponentPattern[];
  styleIssues: StyleIssue[];
  metadata: Record<string, any> | null;
}

interface DetectedPattern {
  id: string;
  nodeId: string;
  nodeName: string;
  type: string;
  confidence: number;
  metadata: Record<string, any>;
}

interface ValidationIssue {
  id: string;
  nodeId: string;
  nodeName: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  suggestion?: string;
}

const DesignAnalyzer: React.FC<DesignAnalyzerProps> = ({ 
  designData, 
  onAnalyze, 
  isAnalyzing, 
  error, 
  analysisResult, 
  patterns, 
  styleIssues, 
  metadata 
}) => {
  const [detectedPatterns, setDetectedPatterns] = useState<DetectedPattern[]>([]);
  const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>([]);
  const [selectedPattern, setSelectedPattern] = useState<DetectedPattern | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<ValidationIssue | null>(null);
  
  const handleAnalyze = async () => {
    if (!designData) return;
    
    try {
      // In a real implementation, this would call the design analyzer service
      console.log('Analyzing design:', designData.name);
      
      // Simulate analysis
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock detected patterns
      const mockPatterns: DetectedPattern[] = [
        {
          id: 'pattern-1',
          nodeId: 'node-1',
          nodeName: 'Button Primary',
          type: 'Button',
          confidence: 0.95,
          metadata: {
            variant: 'primary',
            size: 'medium',
            hasIcon: false
          }
        },
        {
          id: 'pattern-2',
          nodeId: 'node-2',
          nodeName: 'Input Field',
          type: 'Input',
          confidence: 0.88,
          metadata: {
            variant: 'outlined',
            hasLabel: true,
            hasPlaceholder: true
          }
        },
        {
          id: 'pattern-3',
          nodeId: 'node-3',
          nodeName: 'Card Component',
          type: 'Card',
          confidence: 0.92,
          metadata: {
            variant: 'elevated',
            hasHeader: true,
            hasFooter: false
          }
        }
      ];
      
      // Mock validation issues
      const mockIssues: ValidationIssue[] = [
        {
          id: 'issue-1',
          nodeId: 'node-4',
          nodeName: 'Text Label',
          type: 'warning',
          message: 'Font size 13px is not in the design system',
          suggestion: 'Use 14px (size-sm) instead'
        },
        {
          id: 'issue-2',
          nodeId: 'node-5',
          nodeName: 'Container',
          type: 'error',
          message: 'Color #FF5533 is not in the design system',
          suggestion: 'Use #FF5500 (color-danger) instead'
        },
        {
          id: 'issue-3',
          nodeId: 'node-6',
          nodeName: 'Spacing Group',
          type: 'info',
          message: 'Spacing value 18px is close to design system value',
          suggestion: 'Consider using 16px (spacing-4) for consistency'
        }
      ];
      
      setDetectedPatterns(mockPatterns);
      setValidationIssues(mockIssues);
      
      // Handle success
      console.log('Design analysis completed');
    } catch (error) {
      console.error('Error analyzing design:', error);
    }
  };

  if (!designData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Design Analyzer</CardTitle>
          <CardDescription>Analyze your design to detect patterns and validate styles</CardDescription>
        </CardHeader>
        <CardContent className="h-96 flex items-center justify-center">
          <p className="text-muted-foreground">No design imported yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Design Analysis</CardTitle>
          <CardDescription>Analyze your Figma design for patterns and issues</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">{designData?.name || 'Untitled Design'}</h3>
              <p className="text-sm text-muted-foreground">
                {designData ? `${patterns.length} patterns detected, ${styleIssues.length} style issues found` : 'No design loaded'}
              </p>
            </div>
            <Button 
              onClick={onAnalyze} 
              disabled={isAnalyzing || !designData}
            >
              {isAnalyzing ? (
                <>
                  <Wand2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Analyze Design
                </>
              )}
            </Button>
          </div>
          
          {error && (
            <div className="mt-4 p-4 bg-destructive/10 text-destructive rounded-md">
              <p>{error}</p>
            </div>
          )}
          
          {analysisResult && (
            <div className="mt-6">
              <Tabs defaultValue="patterns">
                <TabsList>
                  <TabsTrigger value="patterns">Patterns</TabsTrigger>
                  <TabsTrigger value="issues">Style Issues</TabsTrigger>
                  <TabsTrigger value="metadata">Metadata</TabsTrigger>
                </TabsList>
                
                <TabsContent value="patterns" className="pt-4">
                  <ScrollArea className="h-[400px] rounded-md border p-4">
                    {patterns.length > 0 ? (
                      <div className="space-y-4">
                        {patterns.map((pattern) => (
                          <div key={pattern.id} className="p-4 border rounded-md">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium">{pattern.name}</h4>
                                <p className="text-sm text-muted-foreground">Type: {pattern.type}</p>
                              </div>
                              <Badge variant={pattern.confidence > 0.8 ? "default" : "secondary"}>
                                {Math.round(pattern.confidence * 100)}% confidence
                              </Badge>
                            </div>
                            {pattern.properties && (
                              <div className="mt-2 text-xs">
                                <pre className="bg-muted p-2 rounded-md overflow-auto">
                                  {JSON.stringify(pattern.properties, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-muted-foreground">No patterns detected</p>
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="issues" className="pt-4">
                  <ScrollArea className="h-[400px] rounded-md border p-4">
                    {styleIssues.length > 0 ? (
                      <div className="space-y-4">
                        {styleIssues.map((issue) => (
                          <div key={issue.id} className="p-4 border rounded-md">
                            <div className="flex items-start gap-3">
                              {issue.severity === 'error' ? (
                                <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                              ) : issue.severity === 'warning' ? (
                                <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                              ) : (
                                <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                              )}
                              <div>
                                <h4 className="font-medium">{issue.type}</h4>
                                <p className="text-sm text-muted-foreground">{issue.message}</p>
                                {issue.suggestion && (
                                  <div className="mt-2 text-sm">
                                    <span className="font-medium">Suggestion: </span>
                                    {issue.suggestion}
                                  </div>
                                )}
                                {issue.details && (
                                  <div className="mt-2 text-xs">
                                    <pre className="bg-muted p-2 rounded-md overflow-auto">
                                      {JSON.stringify(issue.details, null, 2)}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-muted-foreground">No style issues found</p>
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="metadata" className="pt-4">
                  <ScrollArea className="h-[400px] rounded-md border p-4">
                    {metadata ? (
                      <pre className="text-xs bg-muted p-4 rounded-md overflow-auto">
                        {JSON.stringify(metadata, null, 2)}
                      </pre>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-muted-foreground">No metadata available</p>
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DesignAnalyzer;
