// src/lib/tests/edsMapperAgent.test.ts

import { 
  EDSMapperAgent,
  FigmaComponent,
  FigmaNode,
  EDSComponent,
  ComponentPattern,
  ComponentMapping,
  MappingResult
} from '../agents';
import {
  generateMockFigmaComponents,
  generateMockFigmaNodes,
  generateMockComponentPatterns,
  generateMockEDSComponents,
  generateMockEDSLibrary
} from '../testUtils';

/**
 * Test suite for the EDSMapperAgent
 */
describe('EDSMapperAgent', () => {
  let edsMapperAgent: EDSMapperAgent;
  let mockFigmaComponents: FigmaComponent[];
  let mockFigmaNodes: FigmaNode[];
  let mockPatterns: ComponentPattern[];
  let mockEDSComponents: EDSComponent[];
  let mockEDSLibrary: any;

  beforeEach(() => {
    edsMapperAgent = new EDSMapperAgent();
    
    // Create mock data
    mockFigmaComponents = generateMockFigmaComponents();
    mockFigmaNodes = generateMockFigmaNodes();
    mockPatterns = generateMockComponentPatterns();
    mockEDSComponents = generateMockEDSComponents();
    mockEDSLibrary = generateMockEDSLibrary();
    
    // Initialize the agent with mock data
    edsMapperAgent.initialize(mockFigmaComponents, mockFigmaNodes, mockPatterns);
  });

  test('should load EDS library correctly', () => {
    // Load the EDS library
    const library = edsMapperAgent.loadEDSLibrary(mockEDSLibrary);
    
    // Check that the library is loaded correctly
    expect(library).toBeDefined();
    expect(library.name).toBe(mockEDSLibrary.name);
    expect(library.components.length).toBe(mockEDSLibrary.components.length);
    
    // Check that the components are loaded correctly
    const buttonComponent = library.components.find(c => c.type === 'button');
    expect(buttonComponent).toBeDefined();
    expect(buttonComponent?.name).toBe('Button');
    
    const inputComponent = library.components.find(c => c.type === 'input');
    expect(inputComponent).toBeDefined();
    expect(inputComponent?.name).toBe('Input');
  });

  test('should map components correctly', () => {
    // Load the EDS library
    edsMapperAgent.loadEDSLibrary(mockEDSLibrary);
    
    // Map the components
    const result = edsMapperAgent.mapComponents();
    
    // Check that the mapping result is correct
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.mappings.length).toBeGreaterThan(0);
    
    // Check that the mappings are correct
    const buttonMapping = result.mappings.find(m => 
      m.figmaComponent.name === 'Button' && m.edsComponent.type === 'button'
    );
    expect(buttonMapping).toBeDefined();
    expect(buttonMapping?.confidence).toBeGreaterThan(0.7);
    
    const inputMapping = result.mappings.find(m => 
      m.figmaComponent.name === 'Input Field' && m.edsComponent.type === 'input'
    );
    expect(inputMapping).toBeDefined();
    expect(inputMapping?.confidence).toBeGreaterThan(0.7);
  });

  test('should create component mapping correctly', () => {
    // Load the EDS library
    edsMapperAgent.loadEDSLibrary(mockEDSLibrary);
    
    // Get a Figma component and an EDS component
    const figmaComponent = mockFigmaComponents.find(c => c.name === 'Button');
    const edsComponent = mockEDSComponents.find(c => c.type === 'button');
    
    if (!figmaComponent || !edsComponent) {
      throw new Error('Test components not found');
    }
    
    // Create a mapping
    const mapping = edsMapperAgent.createComponentMapping(figmaComponent, edsComponent);
    
    // Check that the mapping is created correctly
    expect(mapping).toBeDefined();
    expect(mapping.figmaComponent).toBe(figmaComponent);
    expect(mapping.edsComponent).toBe(edsComponent);
    expect(mapping.propertyMappings.length).toBeGreaterThan(0);
  });

  test('should update property mapping correctly', () => {
    // Load the EDS library
    edsMapperAgent.loadEDSLibrary(mockEDSLibrary);
    
    // Map the components
    const result = edsMapperAgent.mapComponents();
    
    // Get a mapping
    const mapping = result.mappings[0];
    
    // Get a property mapping
    const propertyMapping = mapping.propertyMappings[0];
    
    // Update the property mapping
    const updatedValue = 'updated-value';
    const updatedPropertyMapping = {
      ...propertyMapping,
      value: updatedValue
    };
    
    const updatedMapping = edsMapperAgent.updatePropertyMapping(
      mapping.id,
      updatedPropertyMapping
    );
    
    // Check that the property mapping is updated correctly
    expect(updatedMapping).toBeDefined();
    const updatedProperty = updatedMapping.propertyMappings.find(p => 
      p.figmaProperty === propertyMapping.figmaProperty && 
      p.edsProperty === propertyMapping.edsProperty
    );
    expect(updatedProperty).toBeDefined();
    expect(updatedProperty?.value).toBe(updatedValue);
  });

  test('should delete component mapping correctly', () => {
    // Load the EDS library
    edsMapperAgent.loadEDSLibrary(mockEDSLibrary);
    
    // Map the components
    const result = edsMapperAgent.mapComponents();
    
    // Get the initial mappings count
    const initialCount = edsMapperAgent.getComponentMappings().length;
    
    // Delete a mapping
    const mappingToDelete = result.mappings[0];
    edsMapperAgent.deleteComponentMapping(mappingToDelete.id);
    
    // Check that the mapping is deleted
    const remainingMappings = edsMapperAgent.getComponentMappings();
    expect(remainingMappings.length).toBe(initialCount - 1);
    expect(remainingMappings.find(m => m.id === mappingToDelete.id)).toBeUndefined();
  });
});
