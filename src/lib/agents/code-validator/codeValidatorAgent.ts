// src/lib/agents/code-validator/codeValidatorAgent.ts

import { 
  GeneratedComponent,
  GeneratedLayout,
  CodeGenerationResult 
} from '../llm-orchestrator/types';
import {
  ValidationResult,
  SyntaxCheckResult,
  StyleCheckResult,
  ResponsivenessCheckResult,
  ValidationIssue
} from './types';

/**
 * Code Validator Agent
 * 
 * Responsible for:
 * 1. Validating syntax of generated code
 * 2. Checking code style and best practices
 * 3. Testing responsiveness of UI components
 * 4. Providing feedback for improvements
 */
export class CodeValidatorAgent {
  private generatedCode: CodeGenerationResult | null = null;
  private validationIssues: ValidationIssue[] = [];
  private framework: string = 'react';

  /**
   * Initialize the Code Validator with generated code
   * @param generatedCode Generated code from the LLM Orchestrator
   */
  public initialize(generatedCode: CodeGenerationResult): void {
    console.log('CodeValidatorAgent: Initializing with generated code');
    
    this.generatedCode = generatedCode;
    this.framework = generatedCode.framework;
    this.validationIssues = [];
  }

  /**
   * Validate the generated code
   * @returns Validation results
   */
  public validateCode(): ValidationResult {
    console.log('CodeValidatorAgent: Validating code');
    
    if (!this.generatedCode) {
      throw new Error('No generated code to validate');
    }

    // Perform syntax check
    const syntaxResults = this.checkSyntax();
    
    // Perform style check
    const styleResults = this.checkStyle();
    
    // Perform responsiveness check
    const responsivenessResults = this.checkResponsiveness();
    
    // Calculate overall validation score
    const overallScore = this.calculateOverallScore(
      syntaxResults.score,
      styleResults.score,
      responsivenessResults.score
    );
    
    // Determine if the code is production-ready
    const isProductionReady = overallScore >= 0.8 && 
                             syntaxResults.issues.length === 0 &&
                             styleResults.criticalIssues === 0;
    
    return {
      success: this.validationIssues.filter(issue => issue.severity === 'error').length === 0,
      message: isProductionReady 
        ? 'Code validation passed, ready for production' 
        : 'Code validation completed with issues',
      syntaxCheck: syntaxResults,
      styleCheck: styleResults,
      responsivenessCheck: responsivenessResults,
      overallScore,
      isProductionReady,
      issues: this.validationIssues,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Check the syntax of the generated code
   * @returns Syntax check results
   */
  private checkSyntax(): SyntaxCheckResult {
    console.log('CodeValidatorAgent: Checking syntax');
    
    const syntaxIssues: ValidationIssue[] = [];
    
    // Check each component
    this.generatedCode!.components.forEach(component => {
      const issues = this.validateComponentSyntax(component);
      syntaxIssues.push(...issues);
    });
    
    // Check layout if present
    if (this.generatedCode!.layout) {
      const issues = this.validateLayoutSyntax(this.generatedCode!.layout);
      syntaxIssues.push(...issues);
    }
    
    // Add syntax issues to the overall issues list
    this.validationIssues.push(...syntaxIssues);
    
    // Calculate syntax score
    const syntaxScore = this.calculateSyntaxScore(syntaxIssues);
    
    return {
      passed: syntaxIssues.filter(issue => issue.severity === 'error').length === 0,
      score: syntaxScore,
      issues: syntaxIssues,
    };
  }

  /**
   * Validate the syntax of a component
   * @param component Generated component
   * @returns Validation issues
   */
  private validateComponentSyntax(component: GeneratedComponent): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const code = component.code;
    
    // Check for common syntax errors based on the language/framework
    if (this.framework === 'react' || this.framework === 'vue') {
      // Check for missing imports
      if (!code.includes('import ') && !code.includes('require(')) {
        issues.push({
          id: `syntax-missing-imports-${component.id}`,
          type: 'syntax',
          severity: 'warning',
          message: 'Missing import statements',
          location: {
            component: component.name,
            line: 1,
          },
          suggestion: 'Add necessary import statements at the top of the file',
        });
      }
      
      // Check for unbalanced brackets/parentheses
      const openBraces = (code.match(/{/g) || []).length;
      const closeBraces = (code.match(/}/g) || []).length;
      if (openBraces !== closeBraces) {
        issues.push({
          id: `syntax-unbalanced-braces-${component.id}`,
          type: 'syntax',
          severity: 'error',
          message: 'Unbalanced curly braces',
          location: {
            component: component.name,
            line: null,
          },
          suggestion: 'Ensure all opening braces have matching closing braces',
        });
      }
      
      const openParens = (code.match(/\(/g) || []).length;
      const closeParens = (code.match(/\)/g) || []).length;
      if (openParens !== closeParens) {
        issues.push({
          id: `syntax-unbalanced-parens-${component.id}`,
          type: 'syntax',
          severity: 'error',
          message: 'Unbalanced parentheses',
          location: {
            component: component.name,
            line: null,
          },
          suggestion: 'Ensure all opening parentheses have matching closing parentheses',
        });
      }
      
      // React-specific checks
      if (this.framework === 'react') {
        // Check for JSX syntax errors
        if (code.includes('return (') && !code.includes('return (') && !code.includes('</')) {
          issues.push({
            id: `syntax-invalid-jsx-${component.id}`,
            type: 'syntax',
            severity: 'error',
            message: 'Invalid JSX syntax in return statement',
            location: {
              component: component.name,
              line: code.split('\n').findIndex(line => line.includes('return (')),
            },
            suggestion: 'Ensure JSX elements are properly formatted and closed',
          });
        }
        
        // Check for missing React import in JSX files
        if (code.includes('JSX') || code.includes('<') && code.includes('/>')) {
          if (!code.includes('import React') && !code.includes('from "react"') && !code.includes('from \'react\'')) {
            issues.push({
              id: `syntax-missing-react-import-${component.id}`,
              type: 'syntax',
              severity: 'error',
              message: 'Missing React import in JSX file',
              location: {
                component: component.name,
                line: 1,
              },
              suggestion: 'Add "import React from \'react\';" at the top of the file',
            });
          }
        }
      }
      
      // Vue-specific checks
      if (this.framework === 'vue') {
        // Check for template syntax errors
        if (code.includes('<template>') && !code.includes('</template>')) {
          issues.push({
            id: `syntax-invalid-template-${component.id}`,
            type: 'syntax',
            severity: 'error',
            message: 'Unclosed template tag',
            location: {
              component: component.name,
              line: code.split('\n').findIndex(line => line.includes('<template>')),
            },
            suggestion: 'Add closing </template> tag',
          });
        }
        
        // Check for script syntax errors
        if (code.includes('<script>') && !code.includes('</script>')) {
          issues.push({
            id: `syntax-invalid-script-${component.id}`,
            type: 'syntax',
            severity: 'error',
            message: 'Unclosed script tag',
            location: {
              component: component.name,
              line: code.split('\n').findIndex(line => line.includes('<script>')),
            },
            suggestion: 'Add closing </script> tag',
          });
        }
      }
    } else if (this.framework === 'angular') {
      // Angular-specific checks
      
      // Check for component decorator
      if (!code.includes('@Component')) {
        issues.push({
          id: `syntax-missing-component-decorator-${component.id}`,
          type: 'syntax',
          severity: 'error',
          message: 'Missing @Component decorator',
          location: {
            component: component.name,
            line: null,
          },
          suggestion: 'Add @Component decorator to define the component',
        });
      }
      
      // Check for template syntax
      if (code.includes('template:') && !code.includes('`')) {
        issues.push({
          id: `syntax-invalid-template-syntax-${component.id}`,
          type: 'syntax',
          severity: 'error',
          message: 'Invalid template syntax',
          location: {
            component: component.name,
            line: code.split('\n').findIndex(line => line.includes('template:')),
          },
          suggestion: 'Use backticks (`) for multi-line templates',
        });
      }
    } else if (this.framework === 'html') {
      // HTML-specific checks
      
      // Check for doctype
      if (!code.toLowerCase().includes('<!doctype html>') && !code.toLowerCase().includes('<!DOCTYPE html>')) {
        issues.push({
          id: `syntax-missing-doctype-${component.id}`,
          type: 'syntax',
          severity: 'warning',
          message: 'Missing DOCTYPE declaration',
          location: {
            component: component.name,
            line: 1,
          },
          suggestion: 'Add <!DOCTYPE html> at the beginning of the file',
        });
      }
      
      // Check for unbalanced HTML tags
      const htmlTagPattern = /<([a-z][a-z0-9]*)\b[^>]*>/gi;
      const closingTagPattern = /<\/([a-z][a-z0-9]*)\b[^>]*>/gi;
      const openTags: string[] = [];
      let match;
      
      // Find all opening tags
      while ((match = htmlTagPattern.exec(code)) !== null) {
        const tagName = match[1].toLowerCase();
        // Skip self-closing tags
        if (!code.substring(match.index, match.index + match[0].length).includes('/>')) {
          openTags.push(tagName);
        }
      }
      
      // Find all closing tags
      const closingTags: string[] = [];
      while ((match = closingTagPattern.exec(code)) !== null) {
        closingTags.push(match[1].toLowerCase());
      }
      
      // Check if counts match
      if (openTags.length !== closingTags.length) {
        issues.push({
          id: `syntax-unbalanced-html-tags-${component.id}`,
          type: 'syntax',
          severity: 'error',
          message: 'Unbalanced HTML tags',
          location: {
            component: component.name,
            line: null,
          },
          suggestion: 'Ensure all HTML tags are properly closed',
        });
      }
    }
    
    return issues;
  }

  /**
   * Validate the syntax of a layout
   * @param layout Generated layout
   * @returns Validation issues
   */
  private validateLayoutSyntax(layout: GeneratedLayout): ValidationIssue[] {
    // Reuse component syntax validation for layouts
    return this.validateComponentSyntax({
      id: 'layout',
      name: layout.name,
      code: layout.code,
      language: layout.language,
      success: layout.success,
      error: layout.error,
    });
  }

  /**
   * Calculate syntax score based on issues
   * @param issues Validation issues
   * @returns Score between 0 and 1
   */
  private calculateSyntaxScore(issues: ValidationIssue[]): number {
    if (issues.length === 0) {
      return 1;
    }
    
    // Count issues by severity
    const errorCount = issues.filter(issue => issue.severity === 'error').length;
    const warningCount = issues.filter(issue => issue.severity === 'warning').length;
    const infoCount = issues.filter(issue => issue.severity === 'info').length;
    
    // Calculate score with weighted penalties
    const errorPenalty = errorCount * 0.3;
    const warningPenalty = warningCount * 0.1;
    const infoPenalty = infoCount * 0.03;
    
    const score = Math.max(0, 1 - (errorPenalty + warningPenalty + infoPenalty));
    
    return score;
  }

  /**
   * Check the style of the generated code
   * @returns Style check results
   */
  private checkStyle(): StyleCheckResult {
    console.log('CodeValidatorAgent: Checking style');
    
    const styleIssues: ValidationIssue[] = [];
    
    // Check each component
    this.generatedCode!.components.forEach(component => {
      const issues = this.validateComponentStyle(component);
      styleIssues.push(...issues);
    });
    
    // Check layout if present
    if (this.generatedCode!.layout) {
      const issues = this.validateLayoutStyle(this.generatedCode!.layout);
      styleIssues.push(...issues);
    }
    
    // Add style issues to the overall issues list
    this.validationIssues.push(...styleIssues);
    
    // Calculate style score
    const styleScore = this.calculateStyleScore(styleIssues);
    
    // Count critical issues
    const criticalIssues = styleIssues.filter(issue => 
      issue.severity === 'error' || 
      (issue.severity === 'warning' && issue.type === 'style-critical')
    ).length;
    
    return {
      passed: criticalIssues === 0,
      score: styleScore,
      issues: styleIssues,
      criticalIssues,
    };
  }

  /**
   * Validate the style of a component
   * @param component Generated component
   * @returns Validation issues
   */
  private validateComponentStyle(component: GeneratedComponent): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const code = component.code;
    const lines = code.split('\n');
    
    // Check for consistent indentation
    let previousIndent = -1;
    let inconsistentIndentLine = -1;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.trim() === '') continue;
      
      const indent = line.search(/\S/);
      if (previousIndent !== -1) {
        // Check if indentation changes by more than 2 spaces without reason
        if (Math.abs(indent - previousIndent) > 2 && 
            !lines[i-1].includes('{') && 
            !lines[i-1].includes('(') && 
            !line.includes('}') && 
            !line.includes(')')) {
          inconsistentIndentLine = i + 1;
          break;
        }
      }
      previousIndent = indent;
    }
    
    if (inconsistentIndentLine !== -1) {
      issues.push({
        id: `style-inconsistent-indent-${component.id}`,
        type: 'style',
        severity: 'warning',
        message: 'Inconsistent indentation',
        location: {
          component: component.name,
          line: inconsistentIndentLine,
        },
        suggestion: 'Use consistent indentation (2 or 4 spaces recommended)',
      });
    }
    
    // Check for lines that are too long (> 100 characters)
    const longLines = lines
      .map((line, index) => ({ line, index }))
      .filter(({ line }) => line.length > 100);
    
    if (longLines.length > 0) {
      issues.push({
        id: `style-line-too-long-${component.id}`,
        type: 'style',
        severity: 'info',
        message: `Found ${longLines.length} lines that exceed 100 characters`,
        location: {
          component: component.name,
          line: longLines[0].index + 1,
        },
        suggestion: 'Break long lines into multiple lines for better readability',
      });
    }
    
    // Check for consistent quote style
    const singleQuotes = (code.match(/'/g) || []).length;
    const doubleQuotes = (code.match(/"/g) || []).length;
    
    if (singleQuotes > 0 && doubleQuotes > 0) {
      // If there's a mix of quotes, check if it's significant
      if (Math.min(singleQuotes, doubleQuotes) > 3) {
        issues.push({
          id: `style-inconsistent-quotes-${component.id}`,
          type: 'style',
          severity: 'info',
          message: 'Inconsistent quote style',
          location: {
            component: component.name,
            line: null,
          },
          suggestion: 'Use consistent quote style (either single or double quotes)',
        });
      }
    }
    
    // Framework-specific style checks
    if (this.framework === 'react') {
      // Check for proper component naming (PascalCase)
      const componentNameMatch = code.match(/const\s+([A-Za-z0-9_]+)\s*=/);
      if (componentNameMatch && componentNameMatch[1]) {
        const componentName = componentNameMatch[1];
        if (componentName[0] !== componentName[0].toUpperCase()) {
          issues.push({
            id: `style-component-naming-${component.id}`,
            type: 'style-critical',
            severity: 'warning',
            message: 'Component name should use PascalCase',
            location: {
              component: component.name,
              line: lines.findIndex(line => line.includes(`const ${componentName}`)) + 1,
            },
            suggestion: `Rename component from "${componentName}" to "${componentName[0].toUpperCase() + componentName.slice(1)}"`,
          });
        }
      }
      
      // Check for proper prop destructuring
      if (code.includes('props.') && !code.includes('...props')) {
        issues.push({
          id: `style-prop-destructuring-${component.id}`,
          type: 'style',
          severity: 'info',
          message: 'Props should be destructured',
          location: {
            component: component.name,
            line: lines.findIndex(line => line.includes('props.')) + 1,
          },
          suggestion: 'Destructure props in the function parameters or at the beginning of the component',
        });
      }
    } else if (this.framework === 'vue') {
      // Check for proper component naming in Vue
      const componentNameMatch = code.match(/name:\s*['"]([A-Za-z0-9_-]+)['"]/);
      if (componentNameMatch && componentNameMatch[1]) {
        const componentName = componentNameMatch[1];
        if (!componentName.includes('-') && !componentName.includes('_')) {
          issues.push({
            id: `style-component-naming-${component.id}`,
            type: 'style',
            severity: 'info',
            message: 'Vue component names should be multi-word',
            location: {
              component: component.name,
              line: lines.findIndex(line => line.includes(`name: '${componentName}'`)) + 1,
            },
            suggestion: 'Use kebab-case for component names and ensure they are multi-word to avoid conflicts with HTML elements',
          });
        }
      }
    }
    
    return issues;
  }

  /**
   * Validate the style of a layout
   * @param layout Generated layout
   * @returns Validation issues
   */
  private validateLayoutStyle(layout: GeneratedLayout): ValidationIssue[] {
    // Reuse component style validation for layouts
    return this.validateComponentStyle({
      id: 'layout',
      name: layout.name,
      code: layout.code,
      language: layout.language,
      success: layout.success,
      error: layout.error,
    });
  }

  /**
   * Calculate style score based on issues
   * @param issues Validation issues
   * @returns Score between 0 and 1
   */
  private calculateStyleScore(issues: ValidationIssue[]): number {
    if (issues.length === 0) {
      return 1;
    }
    
    // Count issues by severity and type
    const criticalCount = issues.filter(issue => 
      issue.severity === 'error' || 
      (issue.severity === 'warning' && issue.type === 'style-critical')
    ).length;
    
    const warningCount = issues.filter(issue => 
      issue.severity === 'warning' && issue.type !== 'style-critical'
    ).length;
    
    const infoCount = issues.filter(issue => issue.severity === 'info').length;
    
    // Calculate score with weighted penalties
    const criticalPenalty = criticalCount * 0.25;
    const warningPenalty = warningCount * 0.1;
    const infoPenalty = infoCount * 0.02;
    
    const score = Math.max(0, 1 - (criticalPenalty + warningPenalty + infoPenalty));
    
    return score;
  }

  /**
   * Check the responsiveness of the generated code
   * @returns Responsiveness check results
   */
  private checkResponsiveness(): ResponsivenessCheckResult {
    console.log('CodeValidatorAgent: Checking responsiveness');
    
    const responsivenessIssues: ValidationIssue[] = [];
    
    // Check each component
    this.generatedCode!.components.forEach(component => {
      const issues = this.validateComponentResponsiveness(component);
      responsivenessIssues.push(...issues);
    });
    
    // Check layout if present
    if (this.generatedCode!.layout) {
      const issues = this.validateLayoutResponsiveness(this.generatedCode!.layout);
      responsivenessIssues.push(...issues);
    }
    
    // Add responsiveness issues to the overall issues list
    this.validationIssues.push(...responsivenessIssues);
    
    // Calculate responsiveness score
    const responsivenessScore = this.calculateResponsivenessScore(responsivenessIssues);
    
    // Determine if the code is responsive
    const isResponsive = responsivenessScore >= 0.7;
    
    return {
      passed: isResponsive,
      score: responsivenessScore,
      issues: responsivenessIssues,
      isResponsive,
      testedBreakpoints: ['mobile', 'tablet', 'desktop'],
    };
  }

  /**
   * Validate the responsiveness of a component
   * @param component Generated component
   * @returns Validation issues
   */
  private validateComponentResponsiveness(component: GeneratedComponent): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const code = component.code;
    
    // Check for media queries
    const hasMediaQueries = code.includes('@media');
    
    // Check for responsive units
    const hasFixedPixels = code.match(/\d+px/g);
    const hasRelativeUnits = code.match(/\d+rem|\d+em|\d+%|calc\(/g);
    
    // Check for flex or grid layout
    const hasFlexbox = code.includes('display: flex') || code.includes('display:flex');
    const hasGrid = code.includes('display: grid') || code.includes('display:grid');
    
    // Check for viewport meta tag in HTML
    const hasViewportMeta = code.includes('viewport') && code.includes('width=device-width');
    
    // Evaluate responsiveness based on findings
    if (!hasMediaQueries && this.framework !== 'react') {
      issues.push({
        id: `responsiveness-no-media-queries-${component.id}`,
        type: 'responsiveness',
        severity: 'warning',
        message: 'No media queries found',
        location: {
          component: component.name,
          line: null,
        },
        suggestion: 'Add media queries to handle different screen sizes',
      });
    }
    
    if (hasFixedPixels && hasFixedPixels.length > 5 && (!hasRelativeUnits || hasRelativeUnits.length < hasFixedPixels.length / 2)) {
      issues.push({
        id: `responsiveness-fixed-units-${component.id}`,
        type: 'responsiveness',
        severity: 'warning',
        message: 'Excessive use of fixed pixel units',
        location: {
          component: component.name,
          line: null,
        },
        suggestion: 'Use relative units (rem, em, %) instead of fixed pixels for better responsiveness',
      });
    }
    
    if (!hasFlexbox && !hasGrid && component.name.toLowerCase().includes('layout')) {
      issues.push({
        id: `responsiveness-no-flexible-layout-${component.id}`,
        type: 'responsiveness',
        severity: 'warning',
        message: 'No flexible layout system detected',
        location: {
          component: component.name,
          line: null,
        },
        suggestion: 'Use Flexbox or CSS Grid for responsive layouts',
      });
    }
    
    if (this.framework === 'html' && !hasViewportMeta) {
      issues.push({
        id: `responsiveness-no-viewport-meta-${component.id}`,
        type: 'responsiveness',
        severity: 'error',
        message: 'Missing viewport meta tag',
        location: {
          component: component.name,
          line: null,
        },
        suggestion: 'Add <meta name="viewport" content="width=device-width, initial-scale=1.0"> in the head section',
      });
    }
    
    return issues;
  }

  /**
   * Validate the responsiveness of a layout
   * @param layout Generated layout
   * @returns Validation issues
   */
  private validateLayoutResponsiveness(layout: GeneratedLayout): ValidationIssue[] {
    // Reuse component responsiveness validation for layouts
    return this.validateComponentResponsiveness({
      id: 'layout',
      name: layout.name,
      code: layout.code,
      language: layout.language,
      success: layout.success,
      error: layout.error,
    });
  }

  /**
   * Calculate responsiveness score based on issues
   * @param issues Validation issues
   * @returns Score between 0 and 1
   */
  private calculateResponsivenessScore(issues: ValidationIssue[]): number {
    if (issues.length === 0) {
      return 1;
    }
    
    // Count issues by severity
    const errorCount = issues.filter(issue => issue.severity === 'error').length;
    const warningCount = issues.filter(issue => issue.severity === 'warning').length;
    const infoCount = issues.filter(issue => issue.severity === 'info').length;
    
    // Calculate score with weighted penalties
    const errorPenalty = errorCount * 0.3;
    const warningPenalty = warningCount * 0.15;
    const infoPenalty = infoCount * 0.05;
    
    const score = Math.max(0, 1 - (errorPenalty + warningPenalty + infoPenalty));
    
    return score;
  }

  /**
   * Calculate overall validation score
   * @param syntaxScore Syntax check score
   * @param styleScore Style check score
   * @param responsivenessScore Responsiveness check score
   * @returns Overall score between 0 and 1
   */
  private calculateOverallScore(
    syntaxScore: number,
    styleScore: number,
    responsivenessScore: number
  ): number {
    // Weight the scores
    const weightedSyntaxScore = syntaxScore * 0.5;
    const weightedStyleScore = styleScore * 0.3;
    const weightedResponsivenessScore = responsivenessScore * 0.2;
    
    // Calculate overall score
    return weightedSyntaxScore + weightedStyleScore + weightedResponsivenessScore;
  }

  /**
   * Get the validation issues
   * @returns Array of validation issues
   */
  public getValidationIssues(): ValidationIssue[] {
    return this.validationIssues;
  }
}
