'use client';

import React, { useState } from 'react';
import CodeValidator from './CodeValidator';
import { 
  CodeValidatorAgent, 
  CodeGenerationResult,
  ValidationResult,
  ValidationIssue,
  SyntaxCheckResult,
  StyleCheckResult,
  ResponsivenessCheckResult
} from '../../lib/agents';

interface CodeValidatorControllerProps {
  generatedCode: CodeGenerationResult | null;
  onComplete?: () => void;
}

/**
 * Controller component that connects the CodeValidator UI with the CodeValidatorAgent
 */
export const CodeValidatorController: React.FC<CodeValidatorControllerProps> = ({
  generatedCode,
  onComplete
}) => {
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [syntaxCheck, setSyntaxCheck] = useState<SyntaxCheckResult | null>(null);
  const [styleCheck, setStyleCheck] = useState<StyleCheckResult | null>(null);
  const [responsivenessCheck, setResponsivenessCheck] = useState<ResponsivenessCheckResult | null>(null);
  const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>([]);

  // Initialize the Code Validator Agent
  const codeValidatorAgent = React.useMemo(() => {
    const agent = new CodeValidatorAgent();
    // Initialize with existing data if available
    if (generatedCode) {
      agent.initialize(generatedCode);
    }
    return agent;
  }, [generatedCode]);

  /**
   * Handle code validation
   */
  const handleValidateCode = async () => {
    if (!generatedCode) {
      setError('No generated code available to validate');
      return;
    }

    setIsValidating(true);
    setError(null);

    try {
      // Initialize the agent with the generated code if not already initialized
      if (generatedCode !== null) {
        codeValidatorAgent.initialize(generatedCode);
      }
      
      // Validate the code
      const result = codeValidatorAgent.validateCode();
      
      // Update state with the validation results
      setValidationResult(result);
      setSyntaxCheck(result.syntaxCheck);
      setStyleCheck(result.styleCheck);
      setResponsivenessCheck(result.responsivenessCheck);
      setValidationIssues(result.issues);
      
      console.log('Code validation completed successfully:', result);
    } catch (err) {
      console.error('Error validating code:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setValidationResult(null);
      setSyntaxCheck(null);
      setStyleCheck(null);
      setResponsivenessCheck(null);
      setValidationIssues([]);
    } finally {
      setIsValidating(false);
    }
  };

  /**
   * Get validation issues by component
   */
  const getIssuesByComponent = (componentId: string): ValidationIssue[] => {
    if (!validationIssues) return [];
    
    return validationIssues.filter(issue => 
      issue.location.component === componentId || 
      issue.id.includes(componentId)
    );
  };

  return (
    <div className="code-validator-controller">
      <CodeValidator 
        generatedCode={generatedCode?.components[0]?.code || null}
        framework={generatedCode?.framework || 'react'}
      />
    </div>
  );
};
