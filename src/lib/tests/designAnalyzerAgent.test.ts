// src/lib/tests/designAnalyzerAgent.test.ts

import { 
  DesignAnalyzerAgent,
  FigmaDesign,
  FigmaNode,
  FigmaComponent,
  FigmaStyle,
  ComponentPattern,
  StyleIssue,
  AnalysisResult
} from '../agents';
import {
  generateMockFigmaDesign,
  generateMockFigmaNodes,
  generateMockFigmaComponents,
  generateMockFigmaStyles
} from '../testUtils';

/**
 * Test suite for the DesignAnalyzerAgent
 */
describe('DesignAnalyzerAgent', () => {
  let designAnalyzerAgent: DesignAnalyzerAgent;
  let mockDesign: FigmaDesign;
  let mockNodes: FigmaNode[];
  let mockComponents: FigmaComponent[];
  let mockStyles: Record<string, FigmaStyle>;

  beforeEach(() => {
    designAnalyzerAgent = new DesignAnalyzerAgent();
    
    // Create mock data
    mockDesign = generateMockFigmaDesign();
    mockNodes = generateMockFigmaNodes();
    mockComponents = generateMockFigmaComponents();
    mockStyles = generateMockFigmaStyles();
    
    // Initialize the agent with mock data
    designAnalyzerAgent.initialize(mockDesign, mockNodes, mockStyles, mockComponents);
  });

  test('should detect patterns correctly', () => {
    // Analyze the design
    const result = designAnalyzerAgent.analyzeDesign();
    
    // Get the patterns
    const patterns = designAnalyzerAgent.getPatterns();
    
    // Check that patterns are detected
    expect(patterns.length).toBeGreaterThan(0);
    
    // Check that the button pattern is detected
    const buttonPattern = patterns.find(pattern => pattern.type === 'button');
    expect(buttonPattern).toBeDefined();
    expect(buttonPattern?.confidence).toBeGreaterThan(0.7);
    expect(buttonPattern?.componentIds).toContain('component-1');
    
    // Check that the input pattern is detected
    const inputPattern = patterns.find(pattern => pattern.type === 'input');
    expect(inputPattern).toBeDefined();
    expect(inputPattern?.confidence).toBeGreaterThan(0.7);
    expect(inputPattern?.componentIds).toContain('component-2');
  });

  test('should validate styles correctly', () => {
    // Analyze the design
    const result = designAnalyzerAgent.analyzeDesign();
    
    // Get the style issues
    const styleIssues = designAnalyzerAgent.getStyleIssues();
    
    // Check that style validation is performed
    expect(styleIssues).toBeDefined();
  });

  test('should extract metadata correctly', () => {
    // Analyze the design
    const result = designAnalyzerAgent.analyzeDesign();
    
    // Check that metadata is extracted
    expect(result.metadata).toBeDefined();
    expect(result.metadata.componentCount).toBe(mockComponents.length);
    expect(result.metadata.nodeCount).toBe(mockNodes.length);
  });

  test('should enrich data correctly', () => {
    // Analyze the design
    const result = designAnalyzerAgent.analyzeDesign();
    
    // Check that the data is enriched
    expect(result.enrichedData).toBeDefined();
    expect(result.enrichedData.components).toBeDefined();
    expect(result.enrichedData.components.length).toBe(mockComponents.length);
    
    // Check that components are enriched with pattern information
    const enrichedButton = result.enrichedData.components.find(c => c.name === 'Button');
    expect(enrichedButton).toBeDefined();
    expect(enrichedButton?.patternType).toBe('button');
  });
});
