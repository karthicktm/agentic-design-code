// src/lib/tests/integration.test.ts

import { 
  FigmaParserAgent,
  DesignAnalyzerAgent,
  EDSMapperAgent,
  LLMOrchestratorAgent,
  CodeValidatorAgent
} from '../agents';
import {
  generateMockFigmaDesign,
  generateMockFigmaNodes,
  generateMockFigmaComponents,
  generateMockFigmaStyles,
  generateMockEDSLibrary,
  generateMockComponentPatterns
} from '../testUtils';

/**
 * Integration test suite for the complete agent system
 * 
 * This test simulates the entire workflow from Figma import to code validation
 */
describe('Complete Agent System Integration', () => {
  // Initialize all agents
  let figmaParserAgent: FigmaParserAgent;
  let designAnalyzerAgent: DesignAnalyzerAgent;
  let edsMapperAgent: EDSMapperAgent;
  let llmOrchestratorAgent: LLMOrchestratorAgent;
  let codeValidatorAgent: CodeValidatorAgent;
  
  // Initialize mock data
  let mockFigmaData: any;
  let mockEDSLibrary: any;

  beforeEach(() => {
    // Create agents
    figmaParserAgent = new FigmaParserAgent();
    designAnalyzerAgent = new DesignAnalyzerAgent();
    edsMapperAgent = new EDSMapperAgent();
    llmOrchestratorAgent = new LLMOrchestratorAgent();
    codeValidatorAgent = new CodeValidatorAgent();
    
    // Create mock data
    mockFigmaData = {
      name: 'Test Design',
      document: {
        id: '0:1',
        name: 'Document',
        type: 'DOCUMENT',
        children: [
          {
            id: '1:1',
            name: 'Page 1',
            type: 'CANVAS',
            children: [
              {
                id: '2:1',
                name: 'Button',
                type: 'COMPONENT',
                fills: [{ type: 'SOLID', color: { r: 0.2, g: 0.4, b: 0.8, a: 1 } }],
                children: [
                  {
                    id: '3:1',
                    name: 'Label',
                    type: 'TEXT',
                    characters: 'Button',
                    fontSize: 16,
                    fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1, a: 1 } }]
                  }
                ]
              }
            ]
          }
        ]
      }
    };
    
    mockEDSLibrary = generateMockEDSLibrary();
  });

  test('should process the entire workflow successfully', () => {
    // Step 1: Parse Figma JSON
    const designTree = figmaParserAgent.parseJson(mockFigmaData);
    const figmaNodes = figmaParserAgent.getFlattenedNodes();
    const figmaComponents = figmaParserAgent.getComponents();
    const figmaStyles = figmaParserAgent.getExtractedStyles();
    
    // Verify Figma parsing results
    expect(designTree).toBeDefined();
    expect(figmaNodes.length).toBeGreaterThan(0);
    expect(figmaComponents.length).toBeGreaterThan(0);
    expect(Object.keys(figmaStyles).length).toBeGreaterThan(0);
    
    // Step 2: Analyze design
    designAnalyzerAgent.initialize(designTree, figmaNodes, figmaStyles, figmaComponents);
    const analysisResult = designAnalyzerAgent.analyzeDesign();
    const patterns = designAnalyzerAgent.getPatterns();
    const styleIssues = designAnalyzerAgent.getStyleIssues();
    
    // Verify design analysis results
    expect(analysisResult).toBeDefined();
    expect(patterns.length).toBeGreaterThan(0);
    expect(styleIssues).toBeDefined();
    
    // Step 3: Load EDS library and map components
    edsMapperAgent.initialize(figmaComponents, figmaNodes, patterns);
    const edsLibrary = edsMapperAgent.loadEDSLibrary(mockEDSLibrary);
    const mappingResult = edsMapperAgent.mapComponents();
    const componentMappings = edsMapperAgent.getComponentMappings();
    
    // Verify EDS mapping results
    expect(edsLibrary).toBeDefined();
    expect(mappingResult.success).toBe(true);
    expect(componentMappings.length).toBeGreaterThan(0);
    
    // Step 4: Generate code
    llmOrchestratorAgent.initialize(componentMappings, edsLibrary.components, patterns);
    llmOrchestratorAgent.setFrameworkConfig({
      name: 'react',
      options: {
        typescript: true
      }
    });
    
    const codeGenerationRequest = {
      mappingIds: componentMappings.map(mapping => mapping.id),
      generateLayout: true,
      options: {
        typescript: true
      }
    };
    
    const generatedCode = llmOrchestratorAgent.generateCode(codeGenerationRequest);
    
    // Verify code generation results
    expect(generatedCode).toBeDefined();
    expect(generatedCode.success).toBe(true);
    expect(generatedCode.components.length).toBe(componentMappings.length);
    expect(generatedCode.layout).toBeDefined();
    
    // Step 5: Validate code
    codeValidatorAgent.initialize(generatedCode);
    const validationResult = codeValidatorAgent.validateCode();
    
    // Verify code validation results
    expect(validationResult).toBeDefined();
    expect(validationResult.syntaxCheck).toBeDefined();
    expect(validationResult.styleCheck).toBeDefined();
    expect(validationResult.responsivenessCheck).toBeDefined();
    expect(validationResult.overallScore).toBeGreaterThan(0);
    
    // Verify the complete workflow
    console.log('Complete workflow test passed successfully');
  });
});
