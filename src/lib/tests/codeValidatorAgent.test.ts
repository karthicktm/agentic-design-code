// src/lib/tests/codeValidatorAgent.test.ts

import { 
  CodeValidatorAgent,
  CodeGenerationResult,
  ValidationResult,
  ValidationIssue,
  SyntaxCheckResult,
  StyleCheckResult,
  ResponsivenessCheckResult
} from '../agents';
import {
  generateMockCodeGenerationResult
} from '../testUtils';

/**
 * Test suite for the CodeValidatorAgent
 */
describe('CodeValidatorAgent', () => {
  let codeValidatorAgent: CodeValidatorAgent;
  let mockGeneratedCode: CodeGenerationResult;

  beforeEach(() => {
    codeValidatorAgent = new CodeValidatorAgent();
    
    // Create mock data
    mockGeneratedCode = generateMockCodeGenerationResult();
    
    // Initialize the agent with mock data
    codeValidatorAgent.initialize(mockGeneratedCode);
  });

  test('should validate code correctly', () => {
    // Validate the code
    const result = codeValidatorAgent.validateCode();
    
    // Check that the result is correct
    expect(result).toBeDefined();
    expect(result.success).toBeDefined();
    expect(result.syntaxCheck).toBeDefined();
    expect(result.styleCheck).toBeDefined();
    expect(result.responsivenessCheck).toBeDefined();
    expect(result.overallScore).toBeGreaterThan(0);
    expect(result.isProductionReady).toBeDefined();
    expect(result.issues).toBeDefined();
  });

  test('should perform syntax check correctly', () => {
    // Validate the code
    const result = codeValidatorAgent.validateCode();
    
    // Check that the syntax check is correct
    const syntaxCheck = result.syntaxCheck;
    expect(syntaxCheck).toBeDefined();
    expect(syntaxCheck.passed).toBeDefined();
    expect(syntaxCheck.score).toBeGreaterThan(0);
    expect(syntaxCheck.issues).toBeDefined();
  });

  test('should perform style check correctly', () => {
    // Validate the code
    const result = codeValidatorAgent.validateCode();
    
    // Check that the style check is correct
    const styleCheck = result.styleCheck;
    expect(styleCheck).toBeDefined();
    expect(styleCheck.passed).toBeDefined();
    expect(styleCheck.score).toBeGreaterThan(0);
    expect(styleCheck.issues).toBeDefined();
    expect(styleCheck.criticalIssues).toBeDefined();
  });

  test('should perform responsiveness check correctly', () => {
    // Validate the code
    const result = codeValidatorAgent.validateCode();
    
    // Check that the responsiveness check is correct
    const responsivenessCheck = result.responsivenessCheck;
    expect(responsivenessCheck).toBeDefined();
    expect(responsivenessCheck.passed).toBeDefined();
    expect(responsivenessCheck.score).toBeGreaterThan(0);
    expect(responsivenessCheck.issues).toBeDefined();
    expect(responsivenessCheck.isResponsive).toBeDefined();
    expect(responsivenessCheck.testedBreakpoints).toBeDefined();
    expect(responsivenessCheck.testedBreakpoints.length).toBeGreaterThan(0);
  });

  test('should calculate overall score correctly', () => {
    // Validate the code
    const result = codeValidatorAgent.validateCode();
    
    // Check that the overall score is calculated correctly
    expect(result.overallScore).toBeGreaterThan(0);
    expect(result.overallScore).toBeLessThanOrEqual(1);
    
    // The overall score should be a weighted average of the individual scores
    const expectedScore = (
      result.syntaxCheck.score * 0.5 + 
      result.styleCheck.score * 0.3 + 
      result.responsivenessCheck.score * 0.2
    );
    
    // Allow for small floating-point differences
    expect(Math.abs(result.overallScore - expectedScore)).toBeLessThan(0.001);
  });

  test('should identify validation issues correctly', () => {
    // Validate the code
    const result = codeValidatorAgent.validateCode();
    
    // Check that validation issues are identified
    expect(result.issues).toBeDefined();
    
    // Get the validation issues
    const issues = codeValidatorAgent.getValidationIssues();
    expect(issues).toBeDefined();
    expect(issues.length).toBe(result.issues.length);
    
    // Check that issues have the correct structure
    if (issues.length > 0) {
      const issue = issues[0];
      expect(issue.id).toBeDefined();
      expect(issue.type).toBeDefined();
      expect(issue.severity).toBeDefined();
      expect(issue.message).toBeDefined();
      expect(issue.location).toBeDefined();
      expect(issue.suggestion).toBeDefined();
    }
  });

  test('should handle different frameworks correctly', () => {
    // Test with React code
    let reactCode = {
      ...mockGeneratedCode,
      framework: 'react'
    };
    codeValidatorAgent.initialize(reactCode);
    let result = codeValidatorAgent.validateCode();
    expect(result).toBeDefined();
    
    // Test with Vue code
    let vueCode = {
      ...mockGeneratedCode,
      framework: 'vue',
      components: [
        {
          ...mockGeneratedCode.components[0],
          code: `<template>
  <button class="button">Button</button>
</template>

<script>
export default {
  name: 'Button',
  props: {
    label: String
  }
}
</script>

<style scoped>
.button {
  background-color: blue;
  color: white;
}
</style>`
        }
      ]
    };
    codeValidatorAgent.initialize(vueCode);
    result = codeValidatorAgent.validateCode();
    expect(result).toBeDefined();
    
    // Test with Angular code
    let angularCode = {
      ...mockGeneratedCode,
      framework: 'angular',
      components: [
        {
          ...mockGeneratedCode.components[0],
          code: `import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-button',
  template: \`
    <button class="button">{{ label }}</button>
  \`,
  styleUrls: ['./button.component.css']
})
export class ButtonComponent {
  @Input() label: string = 'Button';
}`
        }
      ]
    };
    codeValidatorAgent.initialize(angularCode);
    result = codeValidatorAgent.validateCode();
    expect(result).toBeDefined();
    
    // Test with HTML code
    let htmlCode = {
      ...mockGeneratedCode,
      framework: 'html',
      components: [
        {
          ...mockGeneratedCode.components[0],
          code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Button</title>
  <style>
    .button {
      background-color: blue;
      color: white;
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <button class="button">Button</button>
  
  <script>
    document.querySelector('.button').addEventListener('click', function() {
      alert('Button clicked!');
    });
  </script>
</body>
</html>`
        }
      ]
    };
    codeValidatorAgent.initialize(htmlCode);
    result = codeValidatorAgent.validateCode();
    expect(result).toBeDefined();
  });
});
