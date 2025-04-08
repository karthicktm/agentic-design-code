// src/lib/agents/llm-orchestrator/types.ts

import { ComponentMapping } from '../eds-mapper/types';

/**
 * Framework configuration for code generation
 */
export interface FrameworkConfig {
  name: string;
  version?: string;
  options?: Record<string, any>;
}

/**
 * Prompt template for code generation
 */
export interface PromptTemplate {
  id: string;
  name: string;
  template: string;
  placeholders: string[];
}

/**
 * Code generation request
 */
export interface CodeGenerationRequest {
  mappingIds: string[];
  generateLayout: boolean;
  options: Record<string, any>;
}

/**
 * Generated component code
 */
export interface GeneratedComponent {
  id: string;
  name: string;
  code: string;
  language: string;
  success: boolean;
  error?: string;
}

/**
 * Generated layout code
 */
export interface GeneratedLayout {
  name: string;
  code: string;
  language: string;
  success: boolean;
  error?: string;
}

/**
 * Code generation result
 */
export interface CodeGenerationResult {
  success: boolean;
  message: string;
  components: GeneratedComponent[];
  layout: GeneratedLayout | null;
  framework: string;
  timestamp: string;
}
