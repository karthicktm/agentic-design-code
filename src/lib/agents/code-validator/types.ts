// src/lib/agents/code-validator/types.ts

/**
 * Represents a validation issue
 */
export interface ValidationIssue {
  id: string;
  type: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  location: {
    component: string;
    line: number | null;
  };
  suggestion: string;
}

/**
 * Results of syntax check
 */
export interface SyntaxCheckResult {
  passed: boolean;
  score: number;
  issues: ValidationIssue[];
}

/**
 * Results of style check
 */
export interface StyleCheckResult {
  passed: boolean;
  score: number;
  issues: ValidationIssue[];
  criticalIssues: number;
}

/**
 * Results of responsiveness check
 */
export interface ResponsivenessCheckResult {
  passed: boolean;
  score: number;
  issues: ValidationIssue[];
  isResponsive: boolean;
  testedBreakpoints: string[];
}

/**
 * Complete validation results
 */
export interface ValidationResult {
  success: boolean;
  message: string;
  syntaxCheck: SyntaxCheckResult;
  styleCheck: StyleCheckResult;
  responsivenessCheck: ResponsivenessCheckResult;
  overallScore: number;
  isProductionReady: boolean;
  issues: ValidationIssue[];
  timestamp: string;
}
