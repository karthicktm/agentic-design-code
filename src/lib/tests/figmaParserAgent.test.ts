// src/lib/tests/figmaParserAgent.test.ts

import { 
  FigmaParserAgent,
  FigmaDesign,
  FigmaNode,
  FigmaComponent,
  FigmaStyle
} from '../agents';
import {
  generateMockFigmaDesign
} from '../testUtils';

/**
 * Test suite for the FigmaParserAgent
 */
describe('FigmaParserAgent', () => {
  let figmaParserAgent: FigmaParserAgent;
  let mockFigmaData: any;

  beforeEach(() => {
    figmaParserAgent = new FigmaParserAgent();
    
    // Create mock Figma data
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
  });

  test('should parse Figma JSON correctly', () => {
    // Parse the mock data
    const result = figmaParserAgent.parseJson(mockFigmaData);
    
    // Check that the result is a FigmaDesign object
    expect(result).toBeDefined();
    expect(result.name).toBe('Test Design');
    expect(result.document).toBeDefined();
    expect(result.document.children.length).toBe(1);
    
    // Check that the document structure is preserved
    const page = result.document.children[0];
    expect(page.name).toBe('Page 1');
    expect(page.type).toBe('CANVAS');
    expect(page.children.length).toBe(1);
    
    // Check that the component is parsed correctly
    const component = page.children[0];
    expect(component.name).toBe('Button');
    expect(component.type).toBe('COMPONENT');
    expect(component.children.length).toBe(1);
    
    // Check that the text node is parsed correctly
    const textNode = component.children[0];
    expect(textNode.name).toBe('Label');
    expect(textNode.type).toBe('TEXT');
    expect(textNode.characters).toBe('Button');
  });

  test('should flatten nodes correctly', () => {
    // Parse the mock data
    figmaParserAgent.parseJson(mockFigmaData);
    
    // Get the flattened nodes
    const flattenedNodes = figmaParserAgent.getFlattenedNodes();
    
    // Check that all nodes are included
    expect(flattenedNodes.length).toBe(3); // Button + Label + Page
    
    // Check that the nodes have the correct structure
    const buttonNode = flattenedNodes.find(node => node.name === 'Button');
    expect(buttonNode).toBeDefined();
    expect(buttonNode?.type).toBe('COMPONENT');
    expect(buttonNode?.id).toBe('2:1');
    
    const labelNode = flattenedNodes.find(node => node.name === 'Label');
    expect(labelNode).toBeDefined();
    expect(labelNode?.type).toBe('TEXT');
    expect(labelNode?.id).toBe('3:1');
    expect(labelNode?.parent).toBe('2:1');
  });

  test('should extract components correctly', () => {
    // Parse the mock data
    figmaParserAgent.parseJson(mockFigmaData);
    
    // Get the components
    const components = figmaParserAgent.getComponents();
    
    // Check that the components are extracted correctly
    expect(components.length).toBe(1);
    expect(components[0].name).toBe('Button');
    expect(components[0].type).toBe('COMPONENT');
    expect(components[0].nodeId).toBe('2:1');
  });

  test('should extract styles correctly', () => {
    // Parse the mock data
    figmaParserAgent.parseJson(mockFigmaData);
    
    // Get the styles
    const styles = figmaParserAgent.getExtractedStyles();
    
    // Check that styles are extracted
    expect(Object.keys(styles).length).toBeGreaterThan(0);
  });
});
