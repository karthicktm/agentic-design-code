// src/lib/agents/figma-parser/figmaParserAgent.ts

import { FigmaNode, FigmaDesign, FigmaComponent, FigmaStyle } from './types';

/**
 * Figma Parser Agent
 * 
 * Responsible for:
 * 1. Fetching Figma files (via API or file upload)
 * 2. Parsing JSON structure
 * 3. Flattening component hierarchy
 * 4. Extracting styles and properties
 */
export class FigmaParserAgent {
  private designTree: FigmaDesign | null = null;
  private flattenedNodes: FigmaNode[] = [];
  private extractedStyles: Record<string, FigmaStyle> = {};
  private components: FigmaComponent[] = [];

  /**
   * Parse a Figma JSON file
   * @param jsonData The raw Figma JSON data
   * @returns Processed design tree
   */
  public parseJson(jsonData: any): FigmaDesign {
    console.log('FigmaParserAgent: Parsing JSON data');
    
    try {
      // Validate that this is a Figma file
      if (!jsonData.document || !jsonData.document.children) {
        throw new Error('Invalid Figma file format');
      }

      // Create the design tree
      this.designTree = {
        name: jsonData.name || 'Untitled Design',
        document: jsonData.document,
        pages: [],
        lastModified: jsonData.lastModified || new Date().toISOString(),
        thumbnailUrl: jsonData.thumbnailUrl || '',
        version: jsonData.version || '1',
        schemaVersion: jsonData.schemaVersion || 0,
      };

      // Extract pages
      this.designTree.pages = jsonData.document.children.map((page: any) => ({
        id: page.id,
        name: page.name,
        type: page.type,
        children: page.children || [],
      }));

      // Process the design tree
      this.flattenNodes();
      this.extractStyles();
      this.identifyComponents();

      return this.designTree;
    } catch (error) {
      console.error('Error parsing Figma JSON:', error);
      throw new Error(`Failed to parse Figma file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Flatten the node hierarchy for easier processing
   */
  private flattenNodes(): void {
    console.log('FigmaParserAgent: Flattening nodes');
    
    if (!this.designTree) {
      throw new Error('Design tree not initialized');
    }

    this.flattenedNodes = [];
    
    // Recursive function to traverse the node tree
    const traverseNodes = (node: any, parentId: string | null = null, depth: number = 0) => {
      const flatNode: FigmaNode = {
        id: node.id,
        name: node.name,
        type: node.type,
        parentId,
        depth,
        children: [],
        properties: {},
      };

      // Extract node properties
      if (node.fills) flatNode.properties.fills = node.fills;
      if (node.strokes) flatNode.properties.strokes = node.strokes;
      if (node.effects) flatNode.properties.effects = node.effects;
      if (node.styles) flatNode.properties.styles = node.styles;
      if (node.layout) flatNode.properties.layout = node.layout;
      if (node.layoutMode) flatNode.properties.layoutMode = node.layoutMode;
      if (node.primaryAxisSizingMode) flatNode.properties.primaryAxisSizingMode = node.primaryAxisSizingMode;
      if (node.counterAxisSizingMode) flatNode.properties.counterAxisSizingMode = node.counterAxisSizingMode;
      if (node.paddingLeft) flatNode.properties.paddingLeft = node.paddingLeft;
      if (node.paddingRight) flatNode.properties.paddingRight = node.paddingRight;
      if (node.paddingTop) flatNode.properties.paddingTop = node.paddingTop;
      if (node.paddingBottom) flatNode.properties.paddingBottom = node.paddingBottom;
      if (node.itemSpacing) flatNode.properties.itemSpacing = node.itemSpacing;
      if (node.strokeWeight) flatNode.properties.strokeWeight = node.strokeWeight;
      if (node.cornerRadius) flatNode.properties.cornerRadius = node.cornerRadius;
      if (node.opacity) flatNode.properties.opacity = node.opacity;
      if (node.blendMode) flatNode.properties.blendMode = node.blendMode;
      if (node.characters) flatNode.properties.characters = node.characters;
      if (node.fontSize) flatNode.properties.fontSize = node.fontSize;
      if (node.fontName) flatNode.properties.fontName = node.fontName;
      if (node.textAlignHorizontal) flatNode.properties.textAlignHorizontal = node.textAlignHorizontal;
      if (node.textAlignVertical) flatNode.properties.textAlignVertical = node.textAlignVertical;
      if (node.letterSpacing) flatNode.properties.letterSpacing = node.letterSpacing;
      if (node.lineHeight) flatNode.properties.lineHeight = node.lineHeight;
      if (node.textCase) flatNode.properties.textCase = node.textCase;
      if (node.textDecoration) flatNode.properties.textDecoration = node.textDecoration;
      if (node.textStyleId) flatNode.properties.textStyleId = node.textStyleId;
      if (node.visible !== undefined) flatNode.properties.visible = node.visible;

      // Add to flattened nodes array
      this.flattenedNodes.push(flatNode);

      // Process children recursively
      if (node.children && Array.isArray(node.children)) {
        flatNode.children = node.children.map((child: any) => child.id);
        node.children.forEach((child: any) => {
          traverseNodes(child, node.id, depth + 1);
        });
      }
    };

    // Start traversal from each page
    this.designTree.pages.forEach((page) => {
      traverseNodes(page);
    });

    console.log(`FigmaParserAgent: Flattened ${this.flattenedNodes.length} nodes`);
  }

  /**
   * Extract styles from the design
   */
  private extractStyles(): void {
    console.log('FigmaParserAgent: Extracting styles');
    
    if (!this.designTree || this.flattenedNodes.length === 0) {
      throw new Error('Design tree or flattened nodes not initialized');
    }

    // Process styles from nodes
    this.flattenedNodes.forEach((node) => {
      // Extract fill styles
      if (node.properties.fills && Array.isArray(node.properties.fills)) {
        node.properties.fills.forEach((fill) => {
          if (fill.type && fill.visible !== false) {
            const styleId = `fill-${node.id}-${fill.type}`;
            this.extractedStyles[styleId] = {
              id: styleId,
              name: `${node.name} Fill`,
              type: 'FILL',
              value: fill,
              nodeId: node.id,
            };
          }
        });
      }

      // Extract text styles
      if (node.type === 'TEXT' && node.properties.fontSize) {
        const styleId = `text-${node.id}`;
        this.extractedStyles[styleId] = {
          id: styleId,
          name: `${node.name} Text`,
          type: 'TEXT',
          value: {
            fontSize: node.properties.fontSize,
            fontName: node.properties.fontName,
            textAlignHorizontal: node.properties.textAlignHorizontal,
            textAlignVertical: node.properties.textAlignVertical,
            letterSpacing: node.properties.letterSpacing,
            lineHeight: node.properties.lineHeight,
            textCase: node.properties.textCase,
            textDecoration: node.properties.textDecoration,
          },
          nodeId: node.id,
        };
      }

      // Extract effect styles
      if (node.properties.effects && Array.isArray(node.properties.effects)) {
        node.properties.effects.forEach((effect) => {
          if (effect.type && effect.visible !== false) {
            const styleId = `effect-${node.id}-${effect.type}`;
            this.extractedStyles[styleId] = {
              id: styleId,
              name: `${node.name} Effect`,
              type: 'EFFECT',
              value: effect,
              nodeId: node.id,
            };
          }
        });
      }
    });

    console.log(`FigmaParserAgent: Extracted ${Object.keys(this.extractedStyles).length} styles`);
  }

  /**
   * Identify components in the design
   */
  private identifyComponents(): void {
    console.log('FigmaParserAgent: Identifying components');
    
    if (!this.designTree || this.flattenedNodes.length === 0) {
      throw new Error('Design tree or flattened nodes not initialized');
    }

    // Find component nodes
    this.components = this.flattenedNodes
      .filter((node) => node.type === 'COMPONENT' || node.type === 'INSTANCE')
      .map((node) => {
        // Find all child nodes
        const childNodes = this.flattenedNodes.filter(
          (childNode) => childNode.parentId === node.id
        );

        // Create component object
        const component: FigmaComponent = {
          id: node.id,
          name: node.name,
          type: node.type,
          children: childNodes.map((child) => child.id),
          properties: node.properties,
          styles: {},
        };

        // Associate styles with this component
        Object.values(this.extractedStyles).forEach((style) => {
          if (style.nodeId === node.id) {
            component.styles[style.id] = style;
          }
        });

        return component;
      });

    console.log(`FigmaParserAgent: Identified ${this.components.length} components`);
  }

  /**
   * Get the flattened nodes
   * @returns Array of flattened nodes
   */
  public getFlattenedNodes(): FigmaNode[] {
    return this.flattenedNodes;
  }

  /**
   * Get the extracted styles
   * @returns Record of extracted styles
   */
  public getExtractedStyles(): Record<string, FigmaStyle> {
    return this.extractedStyles;
  }

  /**
   * Get the identified components
   * @returns Array of components
   */
  public getComponents(): FigmaComponent[] {
    return this.components;
  }

  /**
   * Get the design tree
   * @returns The design tree
   */
  public getDesignTree(): FigmaDesign | null {
    return this.designTree;
  }
}
