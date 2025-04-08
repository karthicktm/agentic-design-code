// src/lib/tests/llmOrchestratorAgent.test.ts

import { 
  LLMOrchestratorAgent,
  ComponentMapping,
  EDSComponent,
  ComponentPattern,
  CodeGenerationRequest,
  CodeGenerationResult,
  FrameworkConfig
} from '../agents';
import {
  generateMockComponentMappings,
  generateMockEDSComponents,
  generateMockComponentPatterns
} from '../testUtils';

/**
 * Test suite for the LLMOrchestratorAgent
 */
describe('LLMOrchestratorAgent', () => {
  let llmOrchestratorAgent: LLMOrchestratorAgent;
  let mockComponentMappings: ComponentMapping[];
  let mockEDSComponents: EDSComponent[];
  let mockPatterns: ComponentPattern[];

  beforeEach(() => {
    llmOrchestratorAgent = new LLMOrchestratorAgent();
    
    // Create mock data
    mockComponentMappings = generateMockComponentMappings();
    mockEDSComponents = generateMockEDSComponents();
    mockPatterns = generateMockComponentPatterns();
    
    // Initialize the agent with mock data
    llmOrchestratorAgent.initialize(mockComponentMappings, mockEDSComponents, mockPatterns);
  });

  test('should set framework config correctly', () => {
    // Create a framework config
    const frameworkConfig: FrameworkConfig = {
      name: 'react',
      options: {
        typescript: true,
        styling: 'tailwind'
      }
    };
    
    // Set the framework config
    llmOrchestratorAgent.setFrameworkConfig(frameworkConfig);
    
    // No direct way to test this, but we can test that code generation works with this config
    const request: CodeGenerationRequest = {
      mappingIds: [mockComponentMappings[0].id],
      generateLayout: false,
      options: frameworkConfig.options
    };
    
    const result = llmOrchestratorAgent.generateCode(request);
    
    // Check that the result uses the correct framework
    expect(result.framework).toBe('react');
  });

  test('should generate component code correctly', () => {
    // Set the framework config
    llmOrchestratorAgent.setFrameworkConfig({
      name: 'react',
      options: {
        typescript: false
      }
    });
    
    // Create a code generation request for a single component
    const request: CodeGenerationRequest = {
      mappingIds: [mockComponentMappings[0].id], // Button component
      generateLayout: false,
      options: {
        typescript: false
      }
    };
    
    // Generate the code
    const result = llmOrchestratorAgent.generateCode(request);
    
    // Check that the result is correct
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.components.length).toBe(1);
    
    // Check that the component code is generated correctly
    const componentCode = result.components[0];
    expect(componentCode.id).toBe(mockComponentMappings[0].id);
    expect(componentCode.name).toBe(mockComponentMappings[0].figmaComponent.name);
    expect(componentCode.code).toContain('import React');
    expect(componentCode.code).toContain('Button');
    expect(componentCode.language).toBe('javascript');
    expect(componentCode.success).toBe(true);
  });

  test('should generate layout code correctly', () => {
    // Set the framework config
    llmOrchestratorAgent.setFrameworkConfig({
      name: 'react',
      options: {
        typescript: false
      }
    });
    
    // Create a code generation request with layout
    const request: CodeGenerationRequest = {
      mappingIds: [
        mockComponentMappings[0].id, // Button
        mockComponentMappings[1].id  // Input
      ],
      generateLayout: true,
      options: {
        typescript: false
      }
    };
    
    // Generate the code
    const result = llmOrchestratorAgent.generateCode(request);
    
    // Check that the result is correct
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.components.length).toBe(2);
    expect(result.layout).toBeDefined();
    
    // Check that the layout code is generated correctly
    const layoutCode = result.layout;
    expect(layoutCode?.name).toBe('Layout');
    expect(layoutCode?.code).toContain('import React');
    expect(layoutCode?.code).toContain('Button');
    expect(layoutCode?.code).toContain('Input');
    expect(layoutCode?.language).toBe('javascript');
    expect(layoutCode?.success).toBe(true);
  });

  test('should handle different frameworks correctly', () => {
    // Test React with TypeScript
    llmOrchestratorAgent.setFrameworkConfig({
      name: 'react',
      options: {
        typescript: true
      }
    });
    
    let request: CodeGenerationRequest = {
      mappingIds: [mockComponentMappings[0].id],
      generateLayout: false,
      options: {
        typescript: true
      }
    };
    
    let result = llmOrchestratorAgent.generateCode(request);
    expect(result.framework).toBe('react');
    expect(result.components[0].language).toBe('typescript');
    expect(result.components[0].code).toContain('interface');
    
    // Test Vue
    llmOrchestratorAgent.setFrameworkConfig({
      name: 'vue',
      options: {
        typescript: false
      }
    });
    
    request = {
      mappingIds: [mockComponentMappings[0].id],
      generateLayout: false,
      options: {
        typescript: false
      }
    };
    
    result = llmOrchestratorAgent.generateCode(request);
    expect(result.framework).toBe('vue');
    expect(result.components[0].code).toContain('<template>');
    expect(result.components[0].code).toContain('<script>');
    
    // Test Angular
    llmOrchestratorAgent.setFrameworkConfig({
      name: 'angular',
      options: {}
    });
    
    request = {
      mappingIds: [mockComponentMappings[0].id],
      generateLayout: false,
      options: {}
    };
    
    result = llmOrchestratorAgent.generateCode(request);
    expect(result.framework).toBe('angular');
    expect(result.components[0].code).toContain('@Component');
    
    // Test HTML
    llmOrchestratorAgent.setFrameworkConfig({
      name: 'html',
      options: {}
    });
    
    request = {
      mappingIds: [mockComponentMappings[0].id],
      generateLayout: false,
      options: {}
    };
    
    result = llmOrchestratorAgent.generateCode(request);
    expect(result.framework).toBe('html');
    expect(result.components[0].code).toContain('<!DOCTYPE html>');
    expect(result.components[0].code).toContain('<style>');
    expect(result.components[0].code).toContain('<script>');
  });

  test('should handle errors gracefully', () => {
    // Set the framework config
    llmOrchestratorAgent.setFrameworkConfig({
      name: 'react',
      options: {}
    });
    
    // Create a request with an invalid mapping ID
    const request: CodeGenerationRequest = {
      mappingIds: ['invalid-id'],
      generateLayout: false,
      options: {}
    };
    
    // This should throw an error
    expect(() => {
      llmOrchestratorAgent.generateCode(request);
    }).toThrow();
  });
});
