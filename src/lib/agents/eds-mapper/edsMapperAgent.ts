// src/lib/agents/eds-mapper/edsMapperAgent.ts

import { 
  FigmaNode, 
  FigmaComponent, 
  FigmaStyle 
} from '../figma-parser/types';
import { 
  ComponentPattern 
} from '../design-analyzer/types';
import {
  EDSLibrary,
  EDSComponent,
  ComponentMapping,
  PropertyMapping,
  MappingResult
} from './types';

/**
 * EDS Mapper Agent
 * 
 * Responsible for:
 * 1. Loading EDS library components
 * 2. Mapping Figma components to EDS components
 * 3. Converting layouts to EDS-compatible formats
 * 4. Generating an EDS component tree
 */
export class EDSMapperAgent {
  private edsLibrary: EDSLibrary | null = null;
  private figmaComponents: FigmaComponent[] = [];
  private figmaNodes: FigmaNode[] = [];
  private detectedPatterns: ComponentPattern[] = [];
  private componentMappings: ComponentMapping[] = [];
  private libraries: Map<string, EDSLibrary> = new Map();

  /**
   * Initialize the EDS Mapper with data from the Figma Parser and Design Analyzer
   * @param figmaComponents Components from the Figma Parser
   * @param figmaNodes Nodes from the Figma Parser
   * @param detectedPatterns Patterns from the Design Analyzer
   */
  public initialize(
    figmaComponents: FigmaComponent[],
    figmaNodes: FigmaNode[],
    detectedPatterns: ComponentPattern[]
  ): void {
    console.log('EDSMapperAgent: Initializing with Figma data and patterns');
    
    this.figmaComponents = figmaComponents;
    this.figmaNodes = figmaNodes;
    this.detectedPatterns = detectedPatterns;
  }

  /**
   * Load an EDS library
   * @param libraryData The EDS library data
   * @returns The loaded library
   */
  public loadEDSLibrary(libraryData: any): EDSLibrary {
    console.log('EDSMapperAgent: Loading EDS library');
    
    try {
      // Validate library data
      if (!libraryData.components || !Array.isArray(libraryData.components)) {
        throw new Error('Invalid EDS library format: missing components array');
      }

      // Create the library object with an ID
      const library: EDSLibrary = {
        id: `eds-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        name: libraryData.name || 'Unnamed Library',
        version: libraryData.version || '1.0.0',
        description: libraryData.description || '',
        components: libraryData.components.map((component: any) => ({
          id: component.id || `eds-component-${Math.random().toString(36).substr(2, 9)}`,
          name: component.name || 'Unnamed Component',
          type: component.type || 'unknown',
          description: component.description || '',
          properties: component.properties || {},
          variants: component.variants || [],
          tags: component.tags || [],
          category: component.category || 'uncategorized',
        })),
      };

      // Store the library
      this.edsLibrary = library;
      this.libraries.set(library.id, library);

      console.log(`EDSMapperAgent: Loaded library with ${library.components.length} components`);
      return library;
    } catch (error) {
      console.error('Error loading EDS library:', error);
      throw new Error(`Failed to load EDS library: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Map Figma components to EDS components
   * @returns Mapping results
   */
  public mapComponents(): MappingResult {
    console.log('EDSMapperAgent: Mapping components');
    
    if (!this.edsLibrary) {
      throw new Error('EDS library not loaded');
    }

    if (this.figmaComponents.length === 0) {
      throw new Error('No Figma components to map');
    }

    // Clear previous mappings
    this.componentMappings = [];

    // Map components based on patterns first
    this.mapComponentsBasedOnPatterns();
    
    // Map remaining components based on name and properties
    this.mapComponentsBasedOnNameAndProperties();
    
    // Calculate confidence scores for all mappings
    this.calculateMappingConfidence();

    return {
      success: true,
      message: 'Component mapping completed',
      mappings: this.componentMappings,
      mappedCount: this.componentMappings.length,
      totalCount: this.figmaComponents.length,
      unmappedComponents: this.figmaComponents.filter(
        component => !this.componentMappings.some(mapping => mapping.figmaComponent.id === component.id)
      ),
    };
  }

  /**
   * Map components based on detected patterns
   */
  private mapComponentsBasedOnPatterns(): void {
    console.log('EDSMapperAgent: Mapping components based on patterns');
    
    // Group patterns by node ID
    const patternsByNodeId = new Map<string, ComponentPattern[]>();
    
    this.detectedPatterns.forEach(pattern => {
      if (!patternsByNodeId.has(pattern.nodeId)) {
        patternsByNodeId.set(pattern.nodeId, []);
      }
      patternsByNodeId.get(pattern.nodeId)!.push(pattern);
    });
    
    // Map components based on patterns
    this.figmaComponents.forEach(figmaComponent => {
      const patterns = patternsByNodeId.get(figmaComponent.id) || [];
      
      if (patterns.length > 0) {
        // Sort patterns by confidence
        patterns.sort((a, b) => b.confidence - a.confidence);
        
        // Get the highest confidence pattern
        const topPattern = patterns[0];
        
        // Find matching EDS component based on pattern type
        const matchingEdsComponents = this.edsLibrary!.components.filter(
          edsComponent => edsComponent.type.toLowerCase() === topPattern.type.toLowerCase()
        );
        
        if (matchingEdsComponents.length > 0) {
          // Sort by name similarity if multiple matches
          if (matchingEdsComponents.length > 1) {
            matchingEdsComponents.sort((a, b) => {
              const aSimilarity = this.calculateNameSimilarity(figmaComponent.name, a.name);
              const bSimilarity = this.calculateNameSimilarity(figmaComponent.name, b.name);
              return bSimilarity - aSimilarity;
            });
          }
          
          const edsComponent = matchingEdsComponents[0];
          
          // Create property mappings based on pattern properties
          const propertyMappings: PropertyMapping[] = [];
          
          // Map common properties based on pattern type
          if (topPattern.type === 'button') {
            this.mapButtonProperties(topPattern, figmaComponent, edsComponent, propertyMappings);
          } else if (topPattern.type === 'input') {
            this.mapInputProperties(topPattern, figmaComponent, edsComponent, propertyMappings);
          } else if (topPattern.type === 'card') {
            this.mapCardProperties(topPattern, figmaComponent, edsComponent, propertyMappings);
          } else if (topPattern.type === 'navigation') {
            this.mapNavigationProperties(topPattern, figmaComponent, edsComponent, propertyMappings);
          } else if (topPattern.type === 'layout') {
            this.mapLayoutProperties(topPattern, figmaComponent, edsComponent, propertyMappings);
          }
          
          // Create the component mapping
          this.componentMappings.push({
            id: `mapping-${figmaComponent.id}-${edsComponent.id}`,
            figmaComponent,
            edsComponent,
            patternType: topPattern.type,
            confidence: topPattern.confidence,
            propertyMappings,
            matchedNodes: topPattern.matchedNodes,
          });
        }
      }
    });
    
    console.log(`EDSMapperAgent: Mapped ${this.componentMappings.length} components based on patterns`);
  }

  /**
   * Map button properties
   */
  private mapButtonProperties(
    pattern: ComponentPattern,
    figmaComponent: FigmaComponent,
    edsComponent: EDSComponent,
    propertyMappings: PropertyMapping[]
  ): void {
    // Map variant property
    if (pattern.properties.variant && edsComponent.properties.variant) {
      propertyMappings.push({
        figmaProperty: 'variant',
        edsProperty: 'variant',
        value: pattern.properties.variant,
        confidence: 0.9,
      });
    }
    
    // Map size property
    if (pattern.properties.size && edsComponent.properties.size) {
      propertyMappings.push({
        figmaProperty: 'size',
        edsProperty: 'size',
        value: pattern.properties.size,
        confidence: 0.8,
      });
    }
    
    // Map label property
    if (pattern.properties.label && edsComponent.properties.children) {
      propertyMappings.push({
        figmaProperty: 'label',
        edsProperty: 'children',
        value: pattern.properties.label,
        confidence: 0.9,
      });
    }
    
    // Map disabled property
    if (pattern.properties.disabled !== undefined && edsComponent.properties.disabled !== undefined) {
      propertyMappings.push({
        figmaProperty: 'disabled',
        edsProperty: 'disabled',
        value: pattern.properties.disabled,
        confidence: 0.9,
      });
    }
  }

  /**
   * Map input properties
   */
  private mapInputProperties(
    pattern: ComponentPattern,
    figmaComponent: FigmaComponent,
    edsComponent: EDSComponent,
    propertyMappings: PropertyMapping[]
  ): void {
    // Map type property
    if (pattern.properties.type && edsComponent.properties.type) {
      propertyMappings.push({
        figmaProperty: 'type',
        edsProperty: 'type',
        value: pattern.properties.type,
        confidence: 0.9,
      });
    }
    
    // Map placeholder property
    if (pattern.properties.placeholder && edsComponent.properties.placeholder) {
      propertyMappings.push({
        figmaProperty: 'placeholder',
        edsProperty: 'placeholder',
        value: pattern.properties.placeholder,
        confidence: 0.9,
      });
    }
    
    // Map disabled property
    if (pattern.properties.disabled !== undefined && edsComponent.properties.disabled !== undefined) {
      propertyMappings.push({
        figmaProperty: 'disabled',
        edsProperty: 'disabled',
        value: pattern.properties.disabled,
        confidence: 0.9,
      });
    }
    
    // Map required property
    if (pattern.properties.required !== undefined && edsComponent.properties.required !== undefined) {
      propertyMappings.push({
        figmaProperty: 'required',
        edsProperty: 'required',
        value: pattern.properties.required,
        confidence: 0.7, // Lower confidence since this is often not visually apparent
      });
    }
  }

  /**
   * Map card properties
   */
  private mapCardProperties(
    pattern: ComponentPattern,
    figmaComponent: FigmaComponent,
    edsComponent: EDSComponent,
    propertyMappings: PropertyMapping[]
  ): void {
    // Map hasHeader property
    if (pattern.properties.hasHeader !== undefined && edsComponent.properties.withHeader !== undefined) {
      propertyMappings.push({
        figmaProperty: 'hasHeader',
        edsProperty: 'withHeader',
        value: pattern.properties.hasHeader,
        confidence: 0.8,
      });
    }
    
    // Map hasFooter property
    if (pattern.properties.hasFooter !== undefined && edsComponent.properties.withFooter !== undefined) {
      propertyMappings.push({
        figmaProperty: 'hasFooter',
        edsProperty: 'withFooter',
        value: pattern.properties.hasFooter,
        confidence: 0.8,
      });
    }
    
    // Map hasShadow property
    if (pattern.properties.hasShadow !== undefined && edsComponent.properties.elevation !== undefined) {
      propertyMappings.push({
        figmaProperty: 'hasShadow',
        edsProperty: 'elevation',
        value: pattern.properties.hasShadow ? 1 : 0,
        confidence: 0.7,
      });
    }
    
    // Map cornerRadius property
    if (pattern.properties.cornerRadius !== undefined && edsComponent.properties.borderRadius !== undefined) {
      // Map to closest standard size
      const radius = pattern.properties.cornerRadius;
      let mappedRadius = radius;
      
      // Standard sizes in most design systems
      const standardSizes = [0, 2, 4, 8, 16, 24];
      
      // Find closest standard size
      if (!standardSizes.includes(radius)) {
        mappedRadius = standardSizes.reduce((prev, curr) => 
          Math.abs(curr - radius) < Math.abs(prev - radius) ? curr : prev
        );
      }
      
      propertyMappings.push({
        figmaProperty: 'cornerRadius',
        edsProperty: 'borderRadius',
        value: mappedRadius,
        confidence: radius === mappedRadius ? 0.9 : 0.7,
      });
    }
  }

  /**
   * Map navigation properties
   */
  private mapNavigationProperties(
    pattern: ComponentPattern,
    figmaComponent: FigmaComponent,
    edsComponent: EDSComponent,
    propertyMappings: PropertyMapping[]
  ): void {
    // Map type property (horizontal/vertical)
    if (pattern.properties.type && edsComponent.properties.orientation) {
      propertyMappings.push({
        figmaProperty: 'type',
        edsProperty: 'orientation',
        value: pattern.properties.type,
        confidence: 0.9,
      });
    }
    
    // Map isHeader property
    if (pattern.properties.isHeader !== undefined && edsComponent.properties.variant !== undefined) {
      propertyMappings.push({
        figmaProperty: 'isHeader',
        edsProperty: 'variant',
        value: pattern.properties.isHeader ? 'header' : 'default',
        confidence: 0.8,
      });
    }
    
    // Map isSidebar property
    if (pattern.properties.isSidebar !== undefined && edsComponent.properties.variant !== undefined) {
      propertyMappings.push({
        figmaProperty: 'isSidebar',
        edsProperty: 'variant',
        value: pattern.properties.isSidebar ? 'sidebar' : 'default',
        confidence: 0.8,
      });
    }
  }

  /**
   * Map layout properties
   */
  private mapLayoutProperties(
    pattern: ComponentPattern,
    figmaComponent: FigmaComponent,
    edsComponent: EDSComponent,
    propertyMappings: PropertyMapping[]
  ): void {
    // Map type property (flex/grid)
    if (pattern.properties.type && edsComponent.properties.display) {
      propertyMappings.push({
        figmaProperty: 'type',
        edsProperty: 'display',
        value: pattern.properties.type.startsWith('flex') ? 'flex' : 'grid',
        confidence: 0.9,
      });
    }
    
    // Map flex direction
    if (pattern.properties.type && 
        (pattern.properties.type === 'flex-row' || pattern.properties.type === 'flex-column') && 
        edsComponent.properties.flexDirection) {
      propertyMappings.push({
        figmaProperty: 'type',
        edsProperty: 'flexDirection',
        value: pattern.properties.type === 'flex-row' ? 'row' : 'column',
        confidence: 0.9,
      });
    }
    
    // Map spacing property
    if (pattern.properties.spacing !== undefined && edsComponent.properties.gap !== undefined) {
      propertyMappings.push({
        figmaProperty: 'spacing',
        edsProperty: 'gap',
        value: pattern.properties.spacing,
        confidence: 0.8,
      });
    }
    
    // Map alignment property
    if (pattern.properties.alignment && edsComponent.properties.justifyContent) {
      propertyMappings.push({
        figmaProperty: 'alignment',
        edsProperty: 'justifyContent',
        value: pattern.properties.alignment,
        confidence: 0.8,
      });
    }
    
    // Map padding properties
    if (pattern.properties.padding && edsComponent.properties.padding) {
      propertyMappings.push({
        figmaProperty: 'padding',
        edsProperty: 'padding',
        value: pattern.properties.padding,
        confidence: 0.9,
      });
    }
  }

  /**
   * Map components based on name and properties
   */
  private mapComponentsBasedOnNameAndProperties(): void {
    console.log('EDSMapperAgent: Mapping components based on name and properties');
    
    // Find components that haven't been mapped yet
    const unmappedComponents = this.figmaComponents.filter(
      component => !this.componentMappings.some(mapping => mapping.figmaComponent.id === component.id)
    );
    
    unmappedComponents.forEach(figmaComponent => {
      // Find potential matches based on name similarity
      const potentialMatches = this.edsLibrary!.components.map(edsComponent => ({
        component: edsComponent,
        similarity: this.calculateNameSimilarity(figmaComponent.name, edsComponent.name),
      }));
      
      // Sort by similarity
      potentialMatches.sort((a, b) => b.similarity - a.similarity);
      
      // If we have a good match, create a mapping
      if (potentialMatches.length > 0 && potentialMatches[0].similarity > 0.6) {
        const edsComponent = potentialMatches[0].component;
        
        // Create property mappings based on property name similarity
        const propertyMappings: PropertyMapping[] = [];
        
        // Map properties with similar names
        Object.keys(figmaComponent.properties).forEach(figmaProp => {
          const bestMatch = this.findBestPropertyMatch(figmaProp, edsComponent);
          
          if (bestMatch) {
            propertyMappings.push({
              figmaProperty: figmaProp,
              edsProperty: bestMatch.property,
              value: figmaComponent.properties[figmaProp],
              confidence: bestMatch.similarity,
            });
          }
        });
        
        // Create the component mapping
        this.componentMappings.push({
          id: `mapping-${figmaComponent.id}-${edsComponent.id}`,
          figmaComponent,
          edsComponent,
          patternType: 'unknown',
          confidence: potentialMatches[0].similarity,
          propertyMappings,
          matchedNodes: [figmaComponent.id],
        });
      }
    });
    
    console.log(`EDSMapperAgent: Mapped ${this.componentMappings.length} components in total`);
  }

  /**
   * Find the best matching property in an EDS component
   * @param figmaProperty Figma property name
   * @param edsComponent EDS component
   * @returns Best matching property and similarity score
   */
  private findBestPropertyMatch(figmaProperty: string, edsComponent: EDSComponent): { property: string, similarity: number } | null {
    const matches = Object.keys(edsComponent.properties).map(edsProp => ({
      property: edsProp,
      similarity: this.calculateNameSimilarity(figmaProperty, edsProp),
    }));
    
    matches.sort((a, b) => b.similarity - a.similarity);
    
    if (matches.length > 0 && matches[0].similarity > 0.7) {
      return matches[0];
    }
    
    return null;
  }

  /**
   * Calculate the similarity between two names
   * @param name1 First name
   * @param name2 Second name
   * @returns Similarity score between 0 and 1
   */
  private calculateNameSimilarity(name1: string, name2: string): number {
    // Convert to lowercase and remove special characters
    const clean1 = name1.toLowerCase().replace(/[^a-z0-9]/g, '');
    const clean2 = name2.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    // If either string is empty, return 0
    if (!clean1 || !clean2) {
      return 0;
    }
    
    // If the strings are identical, return 1
    if (clean1 === clean2) {
      return 1;
    }
    
    // If one string contains the other, return a high score
    if (clean1.includes(clean2) || clean2.includes(clean1)) {
      return 0.9;
    }
    
    // Calculate Levenshtein distance
    const distance = this.levenshteinDistance(clean1, clean2);
    const maxLength = Math.max(clean1.length, clean2.length);
    
    // Convert distance to similarity score
    return 1 - (distance / maxLength);
  }

  /**
   * Calculate Levenshtein distance between two strings
   * @param s1 First string
   * @param s2 Second string
   * @returns Levenshtein distance
   */
  private levenshteinDistance(s1: string, s2: string): number {
    const m = s1.length;
    const n = s2.length;
    
    // Create distance matrix
    const d: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
    
    // Initialize first row and column
    for (let i = 0; i <= m; i++) {
      d[i][0] = i;
    }
    
    for (let j = 0; j <= n; j++) {
      d[0][j] = j;
    }
    
    // Fill the matrix
    for (let j = 1; j <= n; j++) {
      for (let i = 1; i <= m; i++) {
        const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
        d[i][j] = Math.min(
          d[i - 1][j] + 1,      // deletion
          d[i][j - 1] + 1,      // insertion
          d[i - 1][j - 1] + cost // substitution
        );
      }
    }
    
    return d[m][n];
  }

  /**
   * Calculate confidence scores for all mappings
   */
  private calculateMappingConfidence(): void {
    this.componentMappings.forEach(mapping => {
      // Start with base confidence
      let confidence = mapping.confidence;
      
      // Adjust based on property mapping confidence
      if (mapping.propertyMappings.length > 0) {
        const avgPropertyConfidence = mapping.propertyMappings.reduce(
          (sum, prop) => sum + prop.confidence, 0
        ) / mapping.propertyMappings.length;
        
        // Weight property confidence at 40%
        confidence = confidence * 0.6 + avgPropertyConfidence * 0.4;
      }
      
      // Adjust based on number of properties mapped
      const propRatio = mapping.propertyMappings.length / Object.keys(mapping.edsComponent.properties).length;
      
      // Boost confidence if many properties are mapped
      if (propRatio > 0.7) {
        confidence = Math.min(1, confidence + 0.1);
      } else if (propRatio < 0.3) {
        // Reduce confidence if few properties are mapped
        confidence = Math.max(0, confidence - 0.1);
      }
      
      // Update the mapping confidence
      mapping.confidence = confidence;
    });
  }

  /**
   * Convert layouts to EDS-compatible formats
   * @returns Converted layouts
   */
  public convertLayouts(): any {
    console.log('EDSMapperAgent: Converting layouts');
    
    if (this.componentMappings.length === 0) {
      throw new Error('No component mappings available');
    }
    
    // Create a map of Figma node IDs to their EDS component mappings
    const mappingsByNodeId = new Map<string, ComponentMapping>();
    
    this.componentMappings.forEach(mapping => {
      mappingsByNodeId.set(mapping.figmaComponent.id, mapping);
    });
    
    // Convert layouts by traversing the node hierarchy
    const convertedLayouts = this.figmaNodes
      .filter(node => node.parentId === null) // Start with root nodes
      .map(node => this.convertNodeToEDSLayout(node, mappingsByNodeId));
    
    return convertedLayouts;
  }

  /**
   * Convert a Figma node to an EDS layout
   * @param node Figma node
   * @param mappingsByNodeId Map of node IDs to component mappings
   * @returns Converted layout
   */
  private convertNodeToEDSLayout(
    node: FigmaNode,
    mappingsByNodeId: Map<string, ComponentMapping>
  ): any {
    // Check if this node has a component mapping
    const mapping = mappingsByNodeId.get(node.id);
    
    if (mapping) {
      // This node is mapped to an EDS component
      return {
        type: mapping.edsComponent.type,
        componentId: mapping.edsComponent.id,
        properties: this.convertProperties(mapping),
        children: this.getNodeChildren(node).map(child => 
          this.convertNodeToEDSLayout(child, mappingsByNodeId)
        ),
      };
    } else {
      // This node is not mapped, convert based on node type
      if (node.type === 'FRAME' || node.type === 'GROUP') {
        // Convert to a generic container
        return {
          type: 'container',
          properties: {
            display: node.properties.layoutMode === 'VERTICAL' ? 'flex' : 'block',
            flexDirection: node.properties.layoutMode === 'VERTICAL' ? 'column' : 'row',
            gap: node.properties.itemSpacing || 0,
            padding: {
              top: node.properties.paddingTop || 0,
              right: node.properties.paddingRight || 0,
              bottom: node.properties.paddingBottom || 0,
              left: node.properties.paddingLeft || 0,
            },
          },
          children: this.getNodeChildren(node).map(child => 
            this.convertNodeToEDSLayout(child, mappingsByNodeId)
          ),
        };
      } else if (node.type === 'TEXT') {
        // Convert to a text element
        return {
          type: 'text',
          properties: {
            text: node.properties.characters || '',
            fontSize: node.properties.fontSize || 16,
            fontWeight: node.properties.fontWeight || 'normal',
            color: this.extractColor(node.properties.fills),
          },
          children: [],
        };
      } else {
        // Generic fallback
        return {
          type: 'element',
          properties: {},
          children: this.getNodeChildren(node).map(child => 
            this.convertNodeToEDSLayout(child, mappingsByNodeId)
          ),
        };
      }
    }
  }

  /**
   * Convert properties from a component mapping
   * @param mapping Component mapping
   * @returns Converted properties
   */
  private convertProperties(mapping: ComponentMapping): Record<string, any> {
    const properties: Record<string, any> = {};
    
    // Add properties from property mappings
    mapping.propertyMappings.forEach(propMapping => {
      properties[propMapping.edsProperty] = propMapping.value;
    });
    
    return properties;
  }

  /**
   * Get children of a node
   * @param node Parent node
   * @returns Array of child nodes
   */
  private getNodeChildren(node: FigmaNode): FigmaNode[] {
    return this.figmaNodes.filter(n => n.parentId === node.id);
  }

  /**
   * Extract color from fills
   * @param fills Array of fills
   * @returns Extracted color
   */
  private extractColor(fills: any[] | undefined): string {
    if (!fills || !Array.isArray(fills)) {
      return 'inherit';
    }
    
    const solidFill = fills.find(fill => fill.type === 'SOLID' && fill.visible !== false);
    
    if (solidFill && solidFill.color) {
      const { r, g, b, a } = solidFill.color;
      return `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a})`;
    }
    
    return 'inherit';
  }

  /**
   * Generate an EDS component tree
   * @returns Generated component tree
   */
  public generateEDSTree(): any {
    console.log('EDSMapperAgent: Generating EDS component tree');
    
    if (this.componentMappings.length === 0) {
      throw new Error('No component mappings available');
    }
    
    // Convert layouts
    const layouts = this.convertLayouts();
    
    // Create the component tree
    const componentTree = {
      type: 'root',
      children: layouts,
      mappings: this.componentMappings.map(mapping => ({
        id: mapping.id,
        figmaComponentId: mapping.figmaComponent.id,
        edsComponentId: mapping.edsComponent.id,
        confidence: mapping.confidence,
        propertyCount: mapping.propertyMappings.length,
      })),
    };
    
    return componentTree;
  }

  /**
   * Get the component mappings
   * @returns Array of component mappings
   */
  public getComponentMappings(): ComponentMapping[] {
    return this.componentMappings;
  }

  /**
   * Get the EDS library
   * @returns The EDS library
   */
  public getEDSLibrary(): EDSLibrary | null {
    return this.edsLibrary;
  }

  /**
   * Process library data and create an EDSLibrary object
   * @param libraryData The library data to process
   * @param name Optional name for the library
   * @param description Optional description for the library
   * @returns The processed library
   */
  public processLibraryData(libraryData: any, name?: string, description?: string): EDSLibrary {
    // Validate that this is an EDS library
    if (!libraryData.components || !Array.isArray(libraryData.components)) {
      throw new Error('Invalid EDS library format: missing components array');
    }

    const library: EDSLibrary = {
      id: `eds-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: name || libraryData.name || 'Unnamed Library',
      version: libraryData.version || '1.0.0',
      description: description || libraryData.description || '',
      components: libraryData.components.map((component: any) => ({
        id: component.id || `eds-component-${Math.random().toString(36).substr(2, 9)}`,
        name: component.name || 'Unnamed Component',
        type: component.type || 'unknown',
        description: component.description || '',
        properties: component.properties || {},
        variants: component.variants || [],
        tags: component.tags || [],
        category: component.category || 'uncategorized',
      })),
    };

    return library;
  }

  /**
   * Add a library to the agent's collection
   * @param library The library to add
   * @returns The added library
   */
  public addLibrary(library: EDSLibrary): EDSLibrary {
    this.libraries.set(library.id, library);
    this.edsLibrary = library;
    return library;
  }
}
