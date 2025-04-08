// src/lib/agents/design-analyzer/types.ts

import { FigmaNode, FigmaDesign, FigmaComponent, FigmaStyle } from '../figma-parser/types';

/**
 * Represents a detected component pattern in the design
 */
export interface ComponentPattern {
  id: string;
  type: string;
  nodeId: string;
  name: string;
  confidence: number;
  properties: Record<string, any>;
  matchedNodes: string[];
}

/**
 * Represents a style issue detected in the design
 */
export interface StyleIssue {
  id: string;
  type: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  details: Record<string, any>;
  suggestion: string;
}

/**
 * Results of pattern detection analysis
 */
export interface PatternDetectionResult {
  patternsDetected: number;
  patterns: ComponentPattern[];
  confidence: number;
}

/**
 * Results of style validation analysis
 */
export interface StyleValidationResult {
  issuesFound: number;
  issues: StyleIssue[];
  consistency: number;
}

/**
 * Complete analysis results from the Design Analyzer
 */
export interface AnalysisResult {
  success: boolean;
  message: string;
  patternDetection: PatternDetectionResult;
  styleValidation: StyleValidationResult;
  metadata: Record<string, any>;
  enrichedData: any;
}
