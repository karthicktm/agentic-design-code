// src/lib/agents/design-analyzer/designAnalyzerAgent.ts

import { 
  FigmaNode, 
  FigmaDesign, 
  FigmaComponent, 
  FigmaStyle 
} from '../figma-parser/types';
import { 
  AnalysisResult, 
  PatternDetectionResult, 
  StyleValidationResult, 
  ComponentPattern,
  StyleIssue
} from './types';

/**
 * Design Analyzer Agent
 * 
 * Responsible for:
 * 1. Detecting UI patterns in the design
 * 2. Validating styles against design system guidelines
 * 3. Extracting metadata from components
 * 4. Enriching design data with analysis results
 */
export class DesignAnalyzerAgent {
  private designTree: FigmaDesign | null = null;
  private flattenedNodes: FigmaNode[] = [];
  private styles: Record<string, FigmaStyle> = {};
  private components: FigmaComponent[] = [];
  private patterns: ComponentPattern[] = [];
  private styleIssues: StyleIssue[] = [];

  /**
   * Initialize the Design Analyzer with data from the Figma Parser
   * @param designTree The Figma design tree
   * @param flattenedNodes Flattened nodes from the design
   * @param styles Extracted styles from the design
   * @param components Identified components from the design
   */
  public initialize(
    designTree: FigmaDesign,
    flattenedNodes: FigmaNode[],
    styles: Record<string, FigmaStyle>,
    components: FigmaComponent[]
  ): void {
    console.log('DesignAnalyzerAgent: Initializing with Figma Parser data');
    
    this.designTree = designTree;
    this.flattenedNodes = flattenedNodes;
    this.styles = styles;
    this.components = components;
  }

  /**
   * Analyze the design to detect patterns and validate styles
   * @returns Analysis results
   */
  public analyzeDesign(): AnalysisResult {
    console.log('DesignAnalyzerAgent: Analyzing design');
    
    if (!this.designTree || this.flattenedNodes.length === 0) {
      throw new Error('Design data not initialized');
    }

    // Detect patterns in the design
    const patternResults = this.detectPatterns();
    
    // Validate styles against design system guidelines
    const styleResults = this.validateStyles();
    
    // Extract metadata from components
    const metadata = this.extractMetadata();
    
    // Enrich the design data with analysis results
    const enrichedData = this.enrichData();

    return {
      success: true,
      message: 'Design analysis completed successfully',
      patternDetection: patternResults,
      styleValidation: styleResults,
      metadata,
      enrichedData,
    };
  }

  /**
   * Detect UI patterns in the design
   * @returns Pattern detection results
   */
  private detectPatterns(): PatternDetectionResult {
    console.log('DesignAnalyzerAgent: Detecting patterns');
    
    this.patterns = [];
    
    // Detect button patterns
    this.detectButtonPatterns();
    
    // Detect input field patterns
    this.detectInputFieldPatterns();
    
    // Detect card patterns
    this.detectCardPatterns();
    
    // Detect navigation patterns
    this.detectNavigationPatterns();
    
    // Detect layout patterns
    this.detectLayoutPatterns();

    return {
      patternsDetected: this.patterns.length,
      patterns: this.patterns,
      confidence: this.calculatePatternConfidence(),
    };
  }

  /**
   * Detect button patterns in the design
   */
  private detectButtonPatterns(): void {
    // Look for nodes that might be buttons
    const buttonCandidates = this.flattenedNodes.filter(node => {
      // Check if the node name contains button-related keywords
      const nameHint = node.name.toLowerCase().includes('button') || 
                       node.name.toLowerCase().includes('btn');
      
      // Check if the node has typical button properties
      const hasButtonShape = node.properties.cornerRadius !== undefined;
      const hasButtonFill = node.properties.fills && 
                           Array.isArray(node.properties.fills) && 
                           node.properties.fills.some(fill => fill.visible !== false);
      
      // Check if the node has a text child
      const hasTextChild = this.flattenedNodes.some(child => 
        child.parentId === node.id && child.type === 'TEXT'
      );
      
      return (nameHint || (hasButtonShape && hasButtonFill)) && hasTextChild;
    });

    // Create patterns for detected buttons
    buttonCandidates.forEach(node => {
      // Find text child to get button label
      const textChild = this.flattenedNodes.find(child => 
        child.parentId === node.id && child.type === 'TEXT'
      );
      
      const label = textChild ? textChild.properties.characters || 'Button' : 'Button';
      
      // Determine button variant based on properties
      let variant = 'primary';
      if (node.properties.fills && Array.isArray(node.properties.fills)) {
        const fill = node.properties.fills.find(f => f.visible !== false);
        if (fill && fill.opacity && fill.opacity < 1) {
          variant = 'secondary';
        } else if (!fill || fill.type === 'SOLID' && fill.color && fill.color.a === 0) {
          variant = 'outline';
        }
      }
      
      // Determine button size based on dimensions or text size
      let size = 'md';
      if (textChild && textChild.properties.fontSize) {
        if (textChild.properties.fontSize < 14) {
          size = 'sm';
        } else if (textChild.properties.fontSize > 16) {
          size = 'lg';
        }
      }
      
      // Create the pattern
      this.patterns.push({
        id: `button-${node.id}`,
        type: 'button',
        nodeId: node.id,
        name: node.name,
        confidence: 0.85, // Initial confidence
        properties: {
          variant,
          size,
          label,
          disabled: node.properties.opacity !== undefined && node.properties.opacity < 1,
        },
        matchedNodes: [node.id, ...(textChild ? [textChild.id] : [])],
      });
    });

    console.log(`DesignAnalyzerAgent: Detected ${buttonCandidates.length} button patterns`);
  }

  /**
   * Detect input field patterns in the design
   */
  private detectInputFieldPatterns(): void {
    // Look for nodes that might be input fields
    const inputCandidates = this.flattenedNodes.filter(node => {
      // Check if the node name contains input-related keywords
      const nameHint = node.name.toLowerCase().includes('input') || 
                       node.name.toLowerCase().includes('field') ||
                       node.name.toLowerCase().includes('text field');
      
      // Check if the node has typical input field properties
      const hasRectangularShape = node.type === 'RECTANGLE' || node.type === 'FRAME';
      const hasBorder = node.properties.strokes && 
                        Array.isArray(node.properties.strokes) && 
                        node.properties.strokes.some(stroke => stroke.visible !== false);
      
      // Check if the node has a text child or placeholder
      const hasTextChild = this.flattenedNodes.some(child => 
        child.parentId === node.id && child.type === 'TEXT'
      );
      
      return (nameHint || (hasRectangularShape && hasBorder)) && hasTextChild;
    });

    // Create patterns for detected input fields
    inputCandidates.forEach(node => {
      // Find text child to get placeholder or value
      const textChild = this.flattenedNodes.find(child => 
        child.parentId === node.id && child.type === 'TEXT'
      );
      
      const placeholder = textChild ? textChild.properties.characters || 'Placeholder' : 'Placeholder';
      
      // Determine input type based on name or properties
      let type = 'text';
      const nodeName = node.name.toLowerCase();
      if (nodeName.includes('email')) {
        type = 'email';
      } else if (nodeName.includes('password')) {
        type = 'password';
      } else if (nodeName.includes('number')) {
        type = 'number';
      } else if (nodeName.includes('search')) {
        type = 'search';
      }
      
      // Create the pattern
      this.patterns.push({
        id: `input-${node.id}`,
        type: 'input',
        nodeId: node.id,
        name: node.name,
        confidence: 0.8, // Initial confidence
        properties: {
          type,
          placeholder,
          disabled: node.properties.opacity !== undefined && node.properties.opacity < 1,
          required: false, // Default value, can't reliably detect from design
        },
        matchedNodes: [node.id, ...(textChild ? [textChild.id] : [])],
      });
    });

    console.log(`DesignAnalyzerAgent: Detected ${inputCandidates.length} input field patterns`);
  }

  /**
   * Detect card patterns in the design
   */
  private detectCardPatterns(): void {
    // Look for nodes that might be cards
    const cardCandidates = this.flattenedNodes.filter(node => {
      // Check if the node name contains card-related keywords
      const nameHint = node.name.toLowerCase().includes('card');
      
      // Check if the node has typical card properties
      const isContainer = node.type === 'FRAME' || node.type === 'GROUP' || node.type === 'COMPONENT';
      const hasCardShape = node.properties.cornerRadius !== undefined && node.properties.cornerRadius > 0;
      const hasShadow = node.properties.effects && 
                        Array.isArray(node.properties.effects) && 
                        node.properties.effects.some(effect => effect.type === 'DROP_SHADOW' && effect.visible !== false);
      
      // Check if the node has multiple children (typical for cards)
      const hasMultipleChildren = this.flattenedNodes.filter(child => 
        child.parentId === node.id
      ).length >= 2;
      
      return (nameHint || (isContainer && (hasCardShape || hasShadow))) && hasMultipleChildren;
    });

    // Create patterns for detected cards
    cardCandidates.forEach(node => {
      // Find children to determine card content
      const children = this.flattenedNodes.filter(child => 
        child.parentId === node.id
      );
      
      // Check for header, content, and footer sections
      const hasHeader = children.some(child => 
        child.name.toLowerCase().includes('header') || 
        (child.type === 'TEXT' && child.depth === node.depth + 1)
      );
      
      const hasFooter = children.some(child => 
        child.name.toLowerCase().includes('footer') || 
        (child.type === 'FRAME' && child.depth === node.depth + 1 && 
         this.flattenedNodes.some(btn => btn.parentId === child.id && btn.name.toLowerCase().includes('button')))
      );
      
      // Create the pattern
      this.patterns.push({
        id: `card-${node.id}`,
        type: 'card',
        nodeId: node.id,
        name: node.name,
        confidence: 0.75, // Initial confidence
        properties: {
          hasHeader,
          hasFooter,
          hasShadow: node.properties.effects && 
                    Array.isArray(node.properties.effects) && 
                    node.properties.effects.some(effect => effect.type === 'DROP_SHADOW'),
          cornerRadius: node.properties.cornerRadius || 0,
        },
        matchedNodes: [node.id, ...children.map(child => child.id)],
      });
    });

    console.log(`DesignAnalyzerAgent: Detected ${cardCandidates.length} card patterns`);
  }

  /**
   * Detect navigation patterns in the design
   */
  private detectNavigationPatterns(): void {
    // Look for nodes that might be navigation components
    const navCandidates = this.flattenedNodes.filter(node => {
      // Check if the node name contains navigation-related keywords
      const nameHint = node.name.toLowerCase().includes('nav') || 
                       node.name.toLowerCase().includes('menu') ||
                       node.name.toLowerCase().includes('sidebar') ||
                       node.name.toLowerCase().includes('header');
      
      // Check if the node is a container
      const isContainer = node.type === 'FRAME' || node.type === 'GROUP' || node.type === 'COMPONENT';
      
      // Check if the node has multiple text or button children (typical for navigation)
      const children = this.flattenedNodes.filter(child => 
        child.parentId === node.id
      );
      
      const hasNavItems = children.length >= 2 && children.some(child => 
        child.type === 'TEXT' || 
        child.name.toLowerCase().includes('link') ||
        child.name.toLowerCase().includes('item') ||
        child.name.toLowerCase().includes('button')
      );
      
      return (nameHint || (isContainer && hasNavItems));
    });

    // Create patterns for detected navigation components
    navCandidates.forEach(node => {
      // Find children to determine navigation items
      const children = this.flattenedNodes.filter(child => 
        child.parentId === node.id
      );
      
      // Determine navigation type based on layout or name
      let navType = 'horizontal';
      if (node.name.toLowerCase().includes('sidebar') || 
          node.name.toLowerCase().includes('vertical')) {
        navType = 'vertical';
      } else if (node.properties.layoutMode === 'VERTICAL') {
        navType = 'vertical';
      }
      
      // Count navigation items
      const navItems = children.filter(child => 
        child.type === 'TEXT' || 
        child.name.toLowerCase().includes('link') ||
        child.name.toLowerCase().includes('item') ||
        child.name.toLowerCase().includes('button')
      );
      
      // Create the pattern
      this.patterns.push({
        id: `nav-${node.id}`,
        type: 'navigation',
        nodeId: node.id,
        name: node.name,
        confidence: 0.7, // Initial confidence
        properties: {
          type: navType,
          itemCount: navItems.length,
          isHeader: node.name.toLowerCase().includes('header'),
          isSidebar: node.name.toLowerCase().includes('sidebar'),
        },
        matchedNodes: [node.id, ...navItems.map(item => item.id)],
      });
    });

    console.log(`DesignAnalyzerAgent: Detected ${navCandidates.length} navigation patterns`);
  }

  /**
   * Detect layout patterns in the design
   */
  private detectLayoutPatterns(): void {
    // Look for nodes that might be layout components
    const layoutCandidates = this.flattenedNodes.filter(node => {
      // Check if the node has layout properties
      const hasLayoutProperties = node.properties.layoutMode !== undefined || 
                                 node.properties.primaryAxisSizingMode !== undefined ||
                                 node.properties.counterAxisSizingMode !== undefined;
      
      // Check if the node name contains layout-related keywords
      const nameHint = node.name.toLowerCase().includes('layout') || 
                       node.name.toLowerCase().includes('container') ||
                       node.name.toLowerCase().includes('grid') ||
                       node.name.toLowerCase().includes('flex');
      
      // Check if the node is a container with multiple children
      const isContainer = node.type === 'FRAME' || node.type === 'GROUP' || node.type === 'COMPONENT';
      const hasMultipleChildren = this.flattenedNodes.filter(child => 
        child.parentId === node.id
      ).length >= 2;
      
      return (hasLayoutProperties || nameHint) && isContainer && hasMultipleChildren;
    });

    // Create patterns for detected layout components
    layoutCandidates.forEach(node => {
      // Determine layout type based on properties or name
      let layoutType = 'flex';
      if (node.name.toLowerCase().includes('grid')) {
        layoutType = 'grid';
      } else if (node.properties.layoutMode === 'VERTICAL') {
        layoutType = 'flex-column';
      } else if (node.properties.layoutMode === 'HORIZONTAL') {
        layoutType = 'flex-row';
      }
      
      // Determine spacing and alignment
      const spacing = node.properties.itemSpacing || 0;
      let alignment = 'start';
      if (node.properties.primaryAxisAlignItems === 'CENTER') {
        alignment = 'center';
      } else if (node.properties.primaryAxisAlignItems === 'END') {
        alignment = 'end';
      } else if (node.properties.primaryAxisAlignItems === 'SPACE_BETWEEN') {
        alignment = 'space-between';
      }
      
      // Create the pattern
      this.patterns.push({
        id: `layout-${node.id}`,
        type: 'layout',
        nodeId: node.id,
        name: node.name,
        confidence: 0.8, // Initial confidence
        properties: {
          type: layoutType,
          spacing,
          alignment,
          padding: {
            top: node.properties.paddingTop || 0,
            right: node.properties.paddingRight || 0,
            bottom: node.properties.paddingBottom || 0,
            left: node.properties.paddingLeft || 0,
          },
        },
        matchedNodes: [node.id],
      });
    });

    console.log(`DesignAnalyzerAgent: Detected ${layoutCandidates.length} layout patterns`);
  }

  /**
   * Calculate confidence scores for detected patterns
   * @returns Average confidence score
   */
  private calculatePatternConfidence(): number {
    if (this.patterns.length === 0) {
      return 0;
    }
    
    // Adjust confidence scores based on additional factors
    this.patterns.forEach(pattern => {
      // Increase confidence if the node name explicitly mentions the pattern type
      if (pattern.name.toLowerCase().includes(pattern.type)) {
        pattern.confidence = Math.min(1, pattern.confidence + 0.1);
      }
      
      // Increase confidence if the pattern has many matched nodes
      if (pattern.matchedNodes.length > 3) {
        pattern.confidence = Math.min(1, pattern.confidence + 0.05);
      }
      
      // Decrease confidence if the pattern has very few properties
      if (Object.keys(pattern.properties).length < 2) {
        pattern.confidence = Math.max(0, pattern.confidence - 0.1);
      }
    });
    
    // Calculate average confidence
    const totalConfidence = this.patterns.reduce((sum, pattern) => sum + pattern.confidence, 0);
    return totalConfidence / this.patterns.length;
  }

  /**
   * Validate styles against design system guidelines
   * @returns Style validation results
   */
  private validateStyles(): StyleValidationResult {
    console.log('DesignAnalyzerAgent: Validating styles');
    
    this.styleIssues = [];
    
    // Validate color usage
    this.validateColorUsage();
    
    // Validate typography
    this.validateTypography();
    
    // Validate spacing
    this.validateSpacing();
    
    // Validate border radius
    this.validateBorderRadius();
    
    // Validate shadow usage
    this.validateShadowUsage();

    return {
      issuesFound: this.styleIssues.length,
      issues: this.styleIssues,
      consistency: this.calculateStyleConsistency(),
    };
  }

  /**
   * Validate color usage in the design
   */
  private validateColorUsage(): void {
    // Extract all colors used in the design
    const usedColors = new Map<string, string[]>();
    
    this.flattenedNodes.forEach(node => {
      // Check fill colors
      if (node.properties.fills && Array.isArray(node.properties.fills)) {
        node.properties.fills.forEach(fill => {
          if (fill.type === 'SOLID' && fill.color && fill.visible !== false) {
            const colorKey = `rgba(${Math.round(fill.color.r * 255)},${Math.round(fill.color.g * 255)},${Math.round(fill.color.b * 255)},${fill.color.a})`;
            if (!usedColors.has(colorKey)) {
              usedColors.set(colorKey, []);
            }
            usedColors.get(colorKey)?.push(node.id);
          }
        });
      }
      
      // Check stroke colors
      if (node.properties.strokes && Array.isArray(node.properties.strokes)) {
        node.properties.strokes.forEach(stroke => {
          if (stroke.type === 'SOLID' && stroke.color && stroke.visible !== false) {
            const colorKey = `rgba(${Math.round(stroke.color.r * 255)},${Math.round(stroke.color.g * 255)},${Math.round(stroke.color.b * 255)},${stroke.color.a})`;
            if (!usedColors.has(colorKey)) {
              usedColors.set(colorKey, []);
            }
            usedColors.get(colorKey)?.push(node.id);
          }
        });
      }
    });
    
    // Check for too many similar colors
    const similarColorGroups = this.groupSimilarColors(usedColors);
    
    similarColorGroups.forEach(group => {
      if (group.colors.length > 1) {
        this.styleIssues.push({
          id: `color-similar-${group.colors[0]}`,
          type: 'color',
          severity: 'warning',
          message: `Found ${group.colors.length} similar colors that could be consolidated`,
          details: {
            colors: group.colors,
            affectedNodes: group.nodeIds,
          },
          suggestion: 'Consider using a consistent color palette to improve design consistency',
        });
      }
    });
    
    // Check for too many unique colors
    if (usedColors.size > 10) {
      this.styleIssues.push({
        id: 'color-too-many',
        type: 'color',
        severity: 'warning',
        message: `Found ${usedColors.size} unique colors which may indicate inconsistent color usage`,
        details: {
          colorCount: usedColors.size,
        },
        suggestion: 'Consider reducing the number of unique colors and using a color system',
      });
    }
  }

  /**
   * Group similar colors together
   * @param usedColors Map of colors and their node IDs
   * @returns Groups of similar colors
   */
  private groupSimilarColors(usedColors: Map<string, string[]>): { colors: string[], nodeIds: string[] }[] {
    const colorGroups: { colors: string[], nodeIds: string[] }[] = [];
    const processedColors = new Set<string>();
    
    // Helper function to calculate color distance (simple Euclidean distance)
    const colorDistance = (color1: string, color2: string): number => {
      const rgba1 = color1.match(/rgba?\((\d+),(\d+),(\d+),?([\d.]+)?\)/);
      const rgba2 = color2.match(/rgba?\((\d+),(\d+),(\d+),?([\d.]+)?\)/);
      
      if (!rgba1 || !rgba2) return 100; // Large distance if format doesn't match
      
      const r1 = parseInt(rgba1[1]);
      const g1 = parseInt(rgba1[2]);
      const b1 = parseInt(rgba1[3]);
      const a1 = rgba1[4] ? parseFloat(rgba1[4]) : 1;
      
      const r2 = parseInt(rgba2[1]);
      const g2 = parseInt(rgba2[2]);
      const b2 = parseInt(rgba2[3]);
      const a2 = rgba2[4] ? parseFloat(rgba2[4]) : 1;
      
      return Math.sqrt(
        Math.pow(r1 - r2, 2) + 
        Math.pow(g1 - g2, 2) + 
        Math.pow(b1 - b2, 2) + 
        Math.pow((a1 - a2) * 255, 2)
      );
    };
    
    // Group similar colors
    usedColors.forEach((nodeIds, color) => {
      if (processedColors.has(color)) return;
      
      const similarColors: string[] = [color];
      const allNodeIds: string[] = [...nodeIds];
      processedColors.add(color);
      
      usedColors.forEach((otherNodeIds, otherColor) => {
        if (color === otherColor || processedColors.has(otherColor)) return;
        
        const distance = colorDistance(color, otherColor);
        if (distance < 20) { // Threshold for similarity
          similarColors.push(otherColor);
          allNodeIds.push(...otherNodeIds);
          processedColors.add(otherColor);
        }
      });
      
      if (similarColors.length > 0) {
        colorGroups.push({
          colors: similarColors,
          nodeIds: allNodeIds,
        });
      }
    });
    
    return colorGroups;
  }

  /**
   * Validate typography in the design
   */
  private validateTypography(): void {
    // Extract all font sizes used in the design
    const usedFontSizes = new Map<number, string[]>();
    
    // Extract all font families used in the design
    const usedFontFamilies = new Map<string, string[]>();
    
    this.flattenedNodes.forEach(node => {
      if (node.type === 'TEXT' && node.properties.fontSize) {
        // Track font size
        const fontSize = node.properties.fontSize;
        if (!usedFontSizes.has(fontSize)) {
          usedFontSizes.set(fontSize, []);
        }
        usedFontSizes.get(fontSize)?.push(node.id);
        
        // Track font family
        if (node.properties.fontName) {
          const fontFamily = typeof node.properties.fontName === 'string' 
            ? node.properties.fontName 
            : node.properties.fontName.family;
          
          if (!usedFontFamilies.has(fontFamily)) {
            usedFontFamilies.set(fontFamily, []);
          }
          usedFontFamilies.get(fontFamily)?.push(node.id);
        }
      }
    });
    
    // Check for too many font sizes
    if (usedFontSizes.size > 5) {
      this.styleIssues.push({
        id: 'typography-too-many-sizes',
        type: 'typography',
        severity: 'warning',
        message: `Found ${usedFontSizes.size} different font sizes which may indicate inconsistent typography`,
        details: {
          fontSizes: Array.from(usedFontSizes.keys()),
        },
        suggestion: 'Consider using a type scale with fewer font sizes for better consistency',
      });
    }
    
    // Check for non-standard font sizes
    const standardSizes = [12, 14, 16, 18, 20, 24, 32, 40, 48, 56, 64];
    const nonStandardSizes: number[] = [];
    
    usedFontSizes.forEach((nodeIds, fontSize) => {
      if (!standardSizes.includes(fontSize) && !standardSizes.includes(Math.round(fontSize))) {
        nonStandardSizes.push(fontSize);
        
        this.styleIssues.push({
          id: `typography-non-standard-${fontSize}`,
          type: 'typography',
          severity: 'info',
          message: `Found non-standard font size: ${fontSize}px`,
          details: {
            fontSize,
            affectedNodes: nodeIds,
          },
          suggestion: `Consider using the nearest standard size: ${this.findNearestStandardSize(fontSize, standardSizes)}px`,
        });
      }
    });
    
    // Check for too many font families
    if (usedFontFamilies.size > 2) {
      this.styleIssues.push({
        id: 'typography-too-many-families',
        type: 'typography',
        severity: 'warning',
        message: `Found ${usedFontFamilies.size} different font families which may indicate inconsistent typography`,
        details: {
          fontFamilies: Array.from(usedFontFamilies.keys()),
        },
        suggestion: 'Consider using fewer font families (ideally 1-2) for better consistency',
      });
    }
  }

  /**
   * Find the nearest standard font size
   * @param size Font size to check
   * @param standardSizes Array of standard font sizes
   * @returns Nearest standard size
   */
  private findNearestStandardSize(size: number, standardSizes: number[]): number {
    return standardSizes.reduce((prev, curr) => 
      Math.abs(curr - size) < Math.abs(prev - size) ? curr : prev
    );
  }

  /**
   * Validate spacing in the design
   */
  private validateSpacing(): void {
    // Extract all spacing values used in the design
    const usedSpacingValues = new Map<number, string[]>();
    
    this.flattenedNodes.forEach(node => {
      // Check item spacing
      if (node.properties.itemSpacing !== undefined) {
        const spacing = node.properties.itemSpacing;
        if (!usedSpacingValues.has(spacing)) {
          usedSpacingValues.set(spacing, []);
        }
        usedSpacingValues.get(spacing)?.push(node.id);
      }
      
      // Check padding values
      ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'].forEach(prop => {
        if (node.properties[prop] !== undefined) {
          const spacing = node.properties[prop];
          if (!usedSpacingValues.has(spacing)) {
            usedSpacingValues.set(spacing, []);
          }
          usedSpacingValues.get(spacing)?.push(node.id);
        }
      });
    });
    
    // Check for too many spacing values
    if (usedSpacingValues.size > 8) {
      this.styleIssues.push({
        id: 'spacing-too-many-values',
        type: 'spacing',
        severity: 'warning',
        message: `Found ${usedSpacingValues.size} different spacing values which may indicate inconsistent spacing`,
        details: {
          spacingValues: Array.from(usedSpacingValues.keys()),
        },
        suggestion: 'Consider using a spacing scale with fewer values for better consistency',
      });
    }
    
    // Check for non-standard spacing values
    const standardSpacing = [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64];
    const nonStandardSpacing: number[] = [];
    
    usedSpacingValues.forEach((nodeIds, spacing) => {
      if (!standardSpacing.includes(spacing) && !standardSpacing.includes(Math.round(spacing))) {
        nonStandardSpacing.push(spacing);
        
        this.styleIssues.push({
          id: `spacing-non-standard-${spacing}`,
          type: 'spacing',
          severity: 'info',
          message: `Found non-standard spacing value: ${spacing}px`,
          details: {
            spacing,
            affectedNodes: nodeIds,
          },
          suggestion: `Consider using the nearest standard spacing: ${this.findNearestStandardSize(spacing, standardSpacing)}px`,
        });
      }
    });
  }

  /**
   * Validate border radius in the design
   */
  private validateBorderRadius(): void {
    // Extract all border radius values used in the design
    const usedRadiusValues = new Map<number, string[]>();
    
    this.flattenedNodes.forEach(node => {
      if (node.properties.cornerRadius !== undefined) {
        const radius = node.properties.cornerRadius;
        if (!usedRadiusValues.has(radius)) {
          usedRadiusValues.set(radius, []);
        }
        usedRadiusValues.get(radius)?.push(node.id);
      }
    });
    
    // Check for too many radius values
    if (usedRadiusValues.size > 5) {
      this.styleIssues.push({
        id: 'radius-too-many-values',
        type: 'border-radius',
        severity: 'warning',
        message: `Found ${usedRadiusValues.size} different border radius values which may indicate inconsistent styling`,
        details: {
          radiusValues: Array.from(usedRadiusValues.keys()),
        },
        suggestion: 'Consider using a radius scale with fewer values for better consistency',
      });
    }
    
    // Check for non-standard radius values
    const standardRadius = [0, 2, 4, 8, 12, 16, 24, 32];
    const nonStandardRadius: number[] = [];
    
    usedRadiusValues.forEach((nodeIds, radius) => {
      if (!standardRadius.includes(radius) && !standardRadius.includes(Math.round(radius))) {
        nonStandardRadius.push(radius);
        
        this.styleIssues.push({
          id: `radius-non-standard-${radius}`,
          type: 'border-radius',
          severity: 'info',
          message: `Found non-standard border radius value: ${radius}px`,
          details: {
            radius,
            affectedNodes: nodeIds,
          },
          suggestion: `Consider using the nearest standard radius: ${this.findNearestStandardSize(radius, standardRadius)}px`,
        });
      }
    });
  }

  /**
   * Validate shadow usage in the design
   */
  private validateShadowUsage(): void {
    // Extract all shadow effects used in the design
    const usedShadows = new Map<string, string[]>();
    
    this.flattenedNodes.forEach(node => {
      if (node.properties.effects && Array.isArray(node.properties.effects)) {
        node.properties.effects.forEach(effect => {
          if (effect.type === 'DROP_SHADOW' && effect.visible !== false) {
            // Create a key based on shadow properties
            const shadowKey = `${effect.offset?.x || 0},${effect.offset?.y || 0},${effect.radius || 0},${effect.spread || 0}`;
            
            if (!usedShadows.has(shadowKey)) {
              usedShadows.set(shadowKey, []);
            }
            usedShadows.get(shadowKey)?.push(node.id);
          }
        });
      }
    });
    
    // Check for too many shadow variations
    if (usedShadows.size > 3) {
      this.styleIssues.push({
        id: 'shadow-too-many-variations',
        type: 'shadow',
        severity: 'warning',
        message: `Found ${usedShadows.size} different shadow variations which may indicate inconsistent styling`,
        details: {
          shadowCount: usedShadows.size,
        },
        suggestion: 'Consider using a shadow system with fewer variations (e.g., small, medium, large)',
      });
    }
  }

  /**
   * Calculate style consistency score
   * @returns Consistency score between 0 and 1
   */
  private calculateStyleConsistency(): number {
    // Base consistency score
    let consistencyScore = 1;
    
    // Reduce score based on number and severity of issues
    const issueImpact = {
      error: 0.2,
      warning: 0.1,
      info: 0.05,
    };
    
    this.styleIssues.forEach(issue => {
      consistencyScore -= issueImpact[issue.severity] || 0;
    });
    
    // Ensure score is between 0 and 1
    return Math.max(0, Math.min(1, consistencyScore));
  }

  /**
   * Extract metadata from components
   * @returns Extracted metadata
   */
  private extractMetadata(): Record<string, any> {
    console.log('DesignAnalyzerAgent: Extracting metadata');
    
    const metadata: Record<string, any> = {
      componentCount: this.components.length,
      nodeCount: this.flattenedNodes.length,
      styleCount: Object.keys(this.styles).length,
      patternCount: this.patterns.length,
      issueCount: this.styleIssues.length,
    };
    
    // Extract color palette
    metadata.colorPalette = this.extractColorPalette();
    
    // Extract typography system
    metadata.typographySystem = this.extractTypographySystem();
    
    // Extract spacing system
    metadata.spacingSystem = this.extractSpacingSystem();
    
    return metadata;
  }

  /**
   * Extract color palette from the design
   * @returns Color palette information
   */
  private extractColorPalette(): any {
    const colors = new Map<string, { count: number, nodes: string[] }>();
    
    // Extract colors from nodes
    this.flattenedNodes.forEach(node => {
      // Extract fill colors
      if (node.properties.fills && Array.isArray(node.properties.fills)) {
        node.properties.fills.forEach(fill => {
          if (fill.type === 'SOLID' && fill.color && fill.visible !== false) {
            const colorKey = `rgba(${Math.round(fill.color.r * 255)},${Math.round(fill.color.g * 255)},${Math.round(fill.color.b * 255)},${fill.color.a})`;
            
            if (!colors.has(colorKey)) {
              colors.set(colorKey, { count: 0, nodes: [] });
            }
            
            const colorData = colors.get(colorKey)!;
            colorData.count++;
            colorData.nodes.push(node.id);
          }
        });
      }
    });
    
    // Convert to array and sort by usage count
    const colorArray = Array.from(colors.entries()).map(([color, data]) => ({
      color,
      count: data.count,
      usage: data.count / this.flattenedNodes.length,
    }));
    
    colorArray.sort((a, b) => b.count - a.count);
    
    // Attempt to categorize colors
    const categorizedColors = {
      primary: colorArray.slice(0, 1).map(c => c.color),
      secondary: colorArray.slice(1, 2).map(c => c.color),
      accent: colorArray.slice(2, 3).map(c => c.color),
      neutral: colorArray.filter(c => {
        const rgba = c.color.match(/rgba?\((\d+),(\d+),(\d+),?([\d.]+)?\)/);
        if (!rgba) return false;
        
        const r = parseInt(rgba[1]);
        const g = parseInt(rgba[2]);
        const b = parseInt(rgba[3]);
        
        // Check if it's a grayscale color (R, G, B values are close)
        return Math.abs(r - g) < 10 && Math.abs(g - b) < 10 && Math.abs(r - b) < 10;
      }).map(c => c.color),
      all: colorArray.map(c => c.color),
    };
    
    return {
      colors: colorArray,
      categorized: categorizedColors,
    };
  }

  /**
   * Extract typography system from the design
   * @returns Typography system information
   */
  private extractTypographySystem(): any {
    const fontSizes = new Map<number, { count: number, nodes: string[] }>();
    const fontFamilies = new Map<string, { count: number, nodes: string[] }>();
    
    // Extract typography information from nodes
    this.flattenedNodes.forEach(node => {
      if (node.type === 'TEXT') {
        // Extract font size
        if (node.properties.fontSize) {
          const fontSize = node.properties.fontSize;
          
          if (!fontSizes.has(fontSize)) {
            fontSizes.set(fontSize, { count: 0, nodes: [] });
          }
          
          const sizeData = fontSizes.get(fontSize)!;
          sizeData.count++;
          sizeData.nodes.push(node.id);
        }
        
        // Extract font family
        if (node.properties.fontName) {
          const fontFamily = typeof node.properties.fontName === 'string' 
            ? node.properties.fontName 
            : node.properties.fontName.family;
          
          if (!fontFamilies.has(fontFamily)) {
            fontFamilies.set(fontFamily, { count: 0, nodes: [] });
          }
          
          const familyData = fontFamilies.get(fontFamily)!;
          familyData.count++;
          familyData.nodes.push(node.id);
        }
      }
    });
    
    // Convert to arrays and sort by usage count
    const fontSizeArray = Array.from(fontSizes.entries()).map(([size, data]) => ({
      size: Number(size),
      count: data.count,
      usage: data.count / this.flattenedNodes.filter(n => n.type === 'TEXT').length,
    }));
    
    const fontFamilyArray = Array.from(fontFamilies.entries()).map(([family, data]) => ({
      family,
      count: data.count,
      usage: data.count / this.flattenedNodes.filter(n => n.type === 'TEXT').length,
    }));
    
    fontSizeArray.sort((a, b) => a.size - b.size);
    fontFamilyArray.sort((a, b) => b.count - a.count);
    
    // Attempt to categorize font sizes
    const categorizedSizes = {
      heading1: Math.max(...fontSizeArray.map(f => f.size)),
      heading2: this.findSecondLargest(fontSizeArray.map(f => f.size)),
      heading3: this.findThirdLargest(fontSizeArray.map(f => f.size)),
      body: this.findMostCommonInRange(fontSizeArray, 14, 18),
      small: this.findMostCommonInRange(fontSizeArray, 10, 14),
      all: fontSizeArray.map(f => f.size),
    };
    
    return {
      fontSizes: fontSizeArray,
      fontFamilies: fontFamilyArray,
      categorized: {
        sizes: categorizedSizes,
        primaryFont: fontFamilyArray.length > 0 ? fontFamilyArray[0].family : null,
        secondaryFont: fontFamilyArray.length > 1 ? fontFamilyArray[1].family : null,
      },
    };
  }

  /**
   * Find the second largest value in an array
   * @param values Array of numbers
   * @returns Second largest value
   */
  private findSecondLargest(values: number[]): number | null {
    if (values.length < 2) return null;
    const sorted = [...values].sort((a, b) => b - a);
    return sorted[1];
  }

  /**
   * Find the third largest value in an array
   * @param values Array of numbers
   * @returns Third largest value
   */
  private findThirdLargest(values: number[]): number | null {
    if (values.length < 3) return null;
    const sorted = [...values].sort((a, b) => b - a);
    return sorted[2];
  }

  /**
   * Find the most common value in a specific range
   * @param values Array of objects with size and count properties
   * @param min Minimum value
   * @param max Maximum value
   * @returns Most common value in range
   */
  private findMostCommonInRange(values: { size: number, count: number }[], min: number, max: number): number | null {
    const inRange = values.filter(v => v.size >= min && v.size <= max);
    if (inRange.length === 0) return null;
    
    inRange.sort((a, b) => b.count - a.count);
    return inRange[0].size;
  }

  /**
   * Extract spacing system from the design
   * @returns Spacing system information
   */
  private extractSpacingSystem(): any {
    const spacingValues = new Map<number, { count: number, nodes: string[] }>();
    
    // Extract spacing information from nodes
    this.flattenedNodes.forEach(node => {
      // Extract item spacing
      if (node.properties.itemSpacing !== undefined) {
        const spacing = node.properties.itemSpacing;
        
        if (!spacingValues.has(spacing)) {
          spacingValues.set(spacing, { count: 0, nodes: [] });
        }
        
        const spacingData = spacingValues.get(spacing)!;
        spacingData.count++;
        spacingData.nodes.push(node.id);
      }
      
      // Extract padding values
      ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'].forEach(prop => {
        if (node.properties[prop] !== undefined) {
          const spacing = node.properties[prop];
          
          if (!spacingValues.has(spacing)) {
            spacingValues.set(spacing, { count: 0, nodes: [] });
          }
          
          const spacingData = spacingValues.get(spacing)!;
          spacingData.count++;
          spacingData.nodes.push(node.id);
        }
      });
    });
    
    // Convert to array and sort by value
    const spacingArray = Array.from(spacingValues.entries()).map(([spacing, data]) => ({
      value: Number(spacing),
      count: data.count,
    }));
    
    spacingArray.sort((a, b) => a.value - b.value);
    
    return {
      values: spacingArray,
      scale: spacingArray.map(s => s.value),
    };
  }

  /**
   * Enrich the design data with analysis results
   * @returns Enriched design data
   */
  private enrichData(): any {
    console.log('DesignAnalyzerAgent: Enriching design data');
    
    // Create a copy of the design tree to avoid modifying the original
    const enrichedDesign = { ...this.designTree };
    
    // Add pattern information to nodes
    const nodesWithPatterns = this.flattenedNodes.map(node => {
      const matchingPatterns = this.patterns.filter(pattern => 
        pattern.nodeId === node.id || pattern.matchedNodes.includes(node.id)
      );
      
      return {
        ...node,
        patterns: matchingPatterns.map(p => p.id),
      };
    });
    
    // Add style issues to nodes
    const nodesWithIssues = nodesWithPatterns.map(node => {
      const matchingIssues = this.styleIssues.filter(issue => 
        issue.details && issue.details.affectedNodes && 
        issue.details.affectedNodes.includes(node.id)
      );
      
      return {
        ...node,
        styleIssues: matchingIssues.map(i => i.id),
      };
    });
    
    return {
      design: enrichedDesign,
      nodes: nodesWithIssues,
      patterns: this.patterns,
      styleIssues: this.styleIssues,
    };
  }

  /**
   * Get the detected patterns
   * @returns Array of detected patterns
   */
  public getPatterns(): ComponentPattern[] {
    return this.patterns;
  }

  /**
   * Get the style issues
   * @returns Array of style issues
   */
  public getStyleIssues(): StyleIssue[] {
    return this.styleIssues;
  }
}
