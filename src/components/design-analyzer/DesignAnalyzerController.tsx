// src/components/design-analyzer/DesignAnalyzerController.tsx
'use client';

import React, { useState } from 'react';
import DesignAnalyzer from './DesignAnalyzer';
import { 
  DesignAnalyzerAgent, 
  FigmaNode, 
  FigmaDesign, 
  FigmaComponent, 
  FigmaStyle,
  ComponentPattern,
  StyleIssue,
  AnalysisResult
} from '../../lib/agents';

interface DesignAnalyzerControllerProps {
  designData: FigmaDesign | null;
  nodes: FigmaNode[];
  components: FigmaComponent[];
  styles: Record<string, FigmaStyle>;
  onComplete: (patterns: ComponentPattern[], styleIssues: StyleIssue[], metadata: Record<string, any>) => void;
}

/**
 * Controller component that connects the DesignAnalyzer UI with the DesignAnalyzerAgent
 */
export const DesignAnalyzerController: React.FC<DesignAnalyzerControllerProps> = ({
  designData,
  nodes,
  components,
  styles,
  onComplete
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [patterns, setPatterns] = useState<ComponentPattern[]>([]);
  const [styleIssues, setStyleIssues] = useState<StyleIssue[]>([]);
  const [metadata, setMetadata] = useState<Record<string, any> | null>(null);

  /**
   * Handle analysis request
   */
  const handleAnalyze = async () => {
    if (!designData) return;
    
    setIsAnalyzing(true);
    setError(null);
    
    try {
      // Initialize the design analyzer agent
      const analyzerAgent = new DesignAnalyzerAgent();
      
      // Initialize the agent with the design data
      analyzerAgent.initialize(designData, nodes, styles, components);
      
      // Analyze the design
      const result = analyzerAgent.analyzeDesign();
      
      // Extract patterns and style issues
      const detectedPatterns = result.patternDetection.patterns;
      const detectedStyleIssues = result.styleValidation.issues;
      
      // Update state
      setPatterns(detectedPatterns);
      setStyleIssues(detectedStyleIssues);
      setAnalysisResult(result);
      
      console.log('Design analysis completed successfully:', result);
      
      // Call the onComplete callback with the parsed data
      onComplete(detectedPatterns, detectedStyleIssues, result.metadata);
    } catch (err) {
      console.error('Error analyzing design:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="design-analyzer-controller">
      <DesignAnalyzer 
        onAnalyze={handleAnalyze}
        isAnalyzing={isAnalyzing}
        error={error}
        analysisResult={analysisResult}
        patterns={patterns}
        styleIssues={styleIssues}
        metadata={metadata}
        designData={designData}
      />
    </div>
  );
};
