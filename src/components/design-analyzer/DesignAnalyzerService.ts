import { FigmaNode } from '@/components/figma-import/FigmaService';

export interface DetectedPattern {
  id: string;
  nodeId: string;
  nodeName: string;
  type: string;
  confidence: number;
  metadata: Record<string, any>;
}

export interface ValidationIssue {
  id: string;
  nodeId: string;
  nodeName: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  suggestion?: string;
}

export interface AnalysisResult {
  designId: string;
  patterns: DetectedPattern[];
  issues: ValidationIssue[];
  timestamp: string;
}

class DesignAnalyzerService {
  private patternDetectors: Map<string, PatternDetector>;
  private styleValidators: Map<string, StyleValidator>;

  constructor() {
    this.patternDetectors = this.initializePatternDetectors();
    this.styleValidators = this.initializeStyleValidators();
  }

  async analyzeDesign(design: { id: string; name: string; document: FigmaNode }): Promise<AnalysisResult> {
    try {
      console.log(`Analyzing design: ${design.name}`);
      
      // Detect patterns
      const patterns = await this.detectPatterns(design.document);
      
      // Validate styles
      const issues = await this.validateStyles(design.document);
      
      return {
        designId: design.id,
        patterns,
        issues,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error analyzing design:', error);
      throw new Error(`Failed to analyze design: ${error.message}`);
    }
  }

  private async detectPatterns(document: FigmaNode): Promise<DetectedPattern[]> {
    const patterns: DetectedPattern[] = [];
    
    // Traverse the document tree and detect patterns
    this.traverseNodes(document, (node) => {
      for (const [patternType, detector] of this.patternDetectors.entries()) {
        if (detector.matches(node)) {
          const confidence = detector.calculateConfidence(node);
          const metadata = detector.extractMetadata(node);
          
          patterns.push({
            id: `pattern-${patterns.length + 1}`,
            nodeId: node.id,
            nodeName: node.name,
            type: patternType,
            confidence,
            metadata
          });
          
          // Once a pattern is detected, we don't need to check other patterns for this node
          break;
        }
      }
    });
    
    return patterns;
  }

  private async validateStyles(document: FigmaNode): Promise<ValidationIssue[]> {
    const issues: ValidationIssue[] = [];
    
    // Traverse the document tree and validate styles
    this.traverseNodes(document, (node) => {
      for (const [validatorName, validator] of this.styleValidators.entries()) {
        const validationIssues = validator.validate(node);
        
        for (const issue of validationIssues) {
          issues.push({
            id: `issue-${issues.length + 1}`,
            nodeId: node.id,
            nodeName: node.name,
            ...issue
          });
        }
      }
    });
    
    return issues;
  }

  private traverseNodes(node: FigmaNode, callback: (node: FigmaNode) => void): void {
    // Process the current node
    callback(node);
    
    // Process children recursively
    if (node.children && Array.isArray(node.children)) {
      for (const child of node.children) {
        this.traverseNodes(child, callback);
      }
    }
  }

  private initializePatternDetectors(): Map<string, PatternDetector> {
    const detectors = new Map<string, PatternDetector>();
    
    // Button detector
    detectors.set('Button', {
      matches: (node: FigmaNode) => {
        // Check if node name contains button-related keywords
        const nameMatch = /button|btn/i.test(node.name);
        
        // Check if node has typical button characteristics
        const hasButtonShape = node.properties?.cornerRadius > 0;
        const hasText = node.children?.some((child: FigmaNode) => child.type === 'TEXT');
        
        return nameMatch || (hasButtonShape && hasText);
      },
      calculateConfidence: (node: FigmaNode) => {
        let confidence = 0;
        
        // Name-based confidence
        if (/^button$/i.test(node.name)) confidence += 0.5;
        else if (/button|btn/i.test(node.name)) confidence += 0.3;
        
        // Shape-based confidence
        if (node.properties?.cornerRadius > 0) confidence += 0.2;
        
        // Content-based confidence
        if (node.children?.some((child: FigmaNode) => child.type === 'TEXT')) confidence += 0.3;
        
        return Math.min(confidence, 1.0);
      },
      extractMetadata: (node: FigmaNode) => {
        const metadata: any = {
          variant: 'default'
        };
        
        // Determine button variant based on styling
        if (node.properties?.fills?.some((fill: any) => fill.opacity > 0)) {
          metadata.variant = 'filled';
        } else if (node.properties?.strokes?.some((stroke: any) => stroke.opacity > 0)) {
          metadata.variant = 'outlined';
        }
        
        // Extract text content
        const textNode = node.children?.find((child: FigmaNode) => child.type === 'TEXT');
        if (textNode) {
          metadata.text = textNode.properties?.characters;
        }
        
        // Determine size based on dimensions
        const { width, height } = node.properties?.size || {};
        if (width && height) {
          if (width < 80) metadata.size = 'small';
          else if (width > 150) metadata.size = 'large';
          else metadata.size = 'medium';
        }
        
        return metadata;
      }
    });
    
    // Input field detector
    detectors.set('Input', {
      matches: (node: FigmaNode) => {
        // Check if node name contains input-related keywords
        const nameMatch = /input|field|textfield|text field/i.test(node.name);
        
        // Check if node has typical input field characteristics
        const hasRectangularShape = node.type === 'RECTANGLE' || 
                                   (node.children?.some((child: FigmaNode) => 
                                     child.type === 'RECTANGLE' && child.properties?.cornerRadius >= 0));
        const hasText = node.children?.some((child: FigmaNode) => child.type === 'TEXT');
        
        return nameMatch || (hasRectangularShape && hasText);
      },
      calculateConfidence: (node: FigmaNode) => {
        let confidence = 0;
        
        // Name-based confidence
        if (/^(input|textfield|text field)$/i.test(node.name)) confidence += 0.5;
        else if (/input|field|textfield|text field/i.test(node.name)) confidence += 0.3;
        
        // Shape-based confidence
        if (node.type === 'RECTANGLE' || 
            node.children?.some((child: FigmaNode) => child.type === 'RECTANGLE')) {
          confidence += 0.2;
        }
        
        // Content-based confidence
        const textNodes = node.children?.filter((child: FigmaNode) => child.type === 'TEXT') || [];
        if (textNodes.length === 1) confidence += 0.2;
        if (textNodes.length === 2) confidence += 0.3; // Likely has label and placeholder
        
        return Math.min(confidence, 1.0);
      },
      extractMetadata: (node: FigmaNode) => {
        const metadata: any = {
          variant: 'default'
        };
        
        // Extract text content (potential label or placeholder)
        const textNodes = node.children?.filter((child: FigmaNode) => child.type === 'TEXT') || [];
        
        if (textNodes.length >= 1) {
          // First text node is likely the label
          metadata.label = textNodes[0].properties?.characters;
        }
        
        if (textNodes.length >= 2) {
          // Second text node is likely the placeholder
          metadata.placeholder = textNodes[1].properties?.characters;
        }
        
        // Determine if multiline based on height
        const { height } = node.properties?.size || {};
        if (height && height > 50) {
          metadata.multiline = true;
        }
        
        return metadata;
      }
    });
    
    // Card detector
    detectors.set('Card', {
      matches: (node: FigmaNode) => {
        // Check if node name contains card-related keywords
        const nameMatch = /card|tile|panel/i.test(node.name);
        
        // Check if node has typical card characteristics
        const hasCardShape = node.properties?.cornerRadius > 0;
        const hasMultipleChildren = node.children?.length > 1;
        const hasShadow = node.properties?.effects?.some((effect: any) => 
          effect.type === 'DROP_SHADOW' || effect.type === 'INNER_SHADOW');
        
        return nameMatch || (hasCardShape && (hasMultipleChildren || hasShadow));
      },
      calculateConfidence: (node: FigmaNode) => {
        let confidence = 0;
        
        // Name-based confidence
        if (/^card$/i.test(node.name)) confidence += 0.5;
        else if (/card|tile|panel/i.test(node.name)) confidence += 0.3;
        
        // Shape-based confidence
        if (node.properties?.cornerRadius > 0) confidence += 0.2;
        
        // Shadow-based confidence
        if (node.properties?.effects?.some((effect: any) => 
          effect.type === 'DROP_SHADOW' || effect.type === 'INNER_SHADOW')) {
          confidence += 0.3;
        }
        
        // Content-based confidence
        if (node.children?.length > 1) confidence += 0.2;
        
        return Math.min(confidence, 1.0);
      },
      extractMetadata: (node: FigmaNode) => {
        const metadata: any = {
          variant: 'default'
        };
        
        // Determine if card has elevation based on shadows
        if (node.properties?.effects?.some((effect: any) => effect.type === 'DROP_SHADOW')) {
          metadata.elevated = true;
          
          // Calculate elevation level based on shadow intensity
          const shadow = node.properties.effects.find((effect: any) => effect.type === 'DROP_SHADOW');
          if (shadow) {
            const intensity = shadow.radius;
            if (intensity < 2) metadata.elevation = 1;
            else if (intensity < 4) metadata.elevation = 2;
            else if (intensity < 8) metadata.elevation = 3;
            else metadata.elevation = 4;
          }
        }
        
        // Determine if card has border
        if (node.properties?.strokes?.some((stroke: any) => stroke.opacity > 0)) {
          metadata.bordered = true;
        }
        
        // Analyze content structure
        const childTypes = node.children?.map((child: FigmaNode) => child.type) || [];
        metadata.contentStructure = this.analyzeContentStructure(childTypes);
        
        return metadata;
      },
      analyzeContentStructure: (childTypes: string[]): string => {
        if (childTypes.includes('TEXT') && childTypes.includes('RECTANGLE')) {
          return 'text-and-image';
        } else if (childTypes.filter(type => type === 'TEXT').length > 1) {
          return 'multi-text';
        } else if (childTypes.includes('TEXT')) {
          return 'text-only';
        } else if (childTypes.includes('RECTANGLE') || childTypes.includes('ELLIPSE')) {
          return 'image-only';
        } else {
          return 'complex';
        }
      }
    });
    
    return detectors;
  }

  private initializeStyleValidators(): Map<string, StyleValidator> {
    const validators = new Map<string, StyleValidator>();
    
    // Color validator
    validators.set('ColorValidator', {
      validate: (node: FigmaNode) => {
        const issues: Omit<ValidationIssue, 'id' | 'nodeId' | 'nodeName'>[] = [];
        
        // Check fill colors
        if (node.properties?.fills && Array.isArray(node.properties.fills)) {
          for (const fill of node.properties.fills) {
            if (fill.type === 'SOLID' && fill.color) {
              const colorIssue = this.validateColor(fill.color, fill.opacity);
              if (colorIssue) {
                issues.push(colorIssue);
              }
            }
          }
        }
        
        // Check stroke colors
        if (node.properties?.strokes && Array.isArray(node.properties.strokes)) {
          for (const stroke of node.properties.strokes) {
            if (stroke.type === 'SOLID' && stroke.color) {
              const colorIssue = this.validateColor(stroke.color, stroke.opacity);
              if (colorIssue) {
                issues.push(colorIssue);
              }
            }
          }
        }
        
        return issues;
      },
      validateColor: (color: any, opacity: number = 1) => {
        // Mock design system colors
        const designSystemColors = [
          { name: 'primary', value: 'rgba(0, 122, 255, 1)' },
          { name: 'secondary', value: 'rgba(142, 142, 147, 1)' },
          { name: 'success', value: 'rgba(52, 199, 89, 1)' },
          { name: 'danger', value: 'rgba(255, 59, 48, 1)' },
          { name: 'warning', value: 'rgba(255, 204, 0, 1)' },
          { name: 'info', value: 'rgba(90, 200, 250, 1)' },
          { name: 'background', value: 'rgba(255, 255, 255, 1)' },
          { name: 'surface', value: 'rgba(248, 248, 248, 1)' },
          { name: 'text', value: 'rgba(0, 0, 0, 1)' },
          { name: 'text-secondary', value: 'rgba(60, 60, 67, 0.6)' }
        ];
        
        // Convert color to rgba string
        const r = Math.round(color.r * 255);
        const g = Math.round(color.g * 255);
        const b = Math.round(color.b * 255);
        const a = opacity !== undefined ? opacity : (color.a !== undefined ? color.a : 1);
        const rgba = `rgba(${r}, ${g}, ${b}, ${a})`;
        
        // Check if color is in design system
        const exactMatch = designSystemColors.find(c => c.value === rgba);
        if (exactMatch) {
          return null; // No issue
        }
        
        // Find closest color
        let closestColor = designSystemColors[0];
        let minDistance = Number.MAX_VALUE;
        
        for (const dsColor of designSystemColors) {
          const [dsr, dsg, dsb, dsa] = this.parseRgba(dsColor.value);
          const distance = Math.sqrt(
            Math.pow(r - dsr, 2) + 
            Math.pow(g - dsg, 2) + 
            Math.pow(b - dsb, 2) + 
            Math.pow(a * 255 - dsa * 255, 2)
          );
          
          if (distance < minDistance) {
            minDistance = distance;
            closestColor = dsColor;
          }
        }
        
        // If distance is small, it's a warning, otherwise an error
        if (minDistance < 30) {
          return {
            type: 'warning',
            message: `Color ${rgba} is not in the design system`,
            suggestion: `Use ${closestColor.name} (${closestColor.value}) instead`
          };
        } else {
          return {
            type: 'error',
            message: `Color ${rgba} is not in the design system and has no close match`,
            suggestion: `Use a color from the design system palette`
          };
        }
      },
      parseRgba: (rgba: string) => {
        const match = rgba.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
        if (match) {
          return [
            parseInt(match[1], 10),
            parseInt(match[2], 10),
            parseInt(match[3], 10),
            parseFloat(match[4])
          ];
        }
        return [0, 0, 0, 0];
      }
    });
    
    // Typography validator
    validators.set('TypographyValidator', {
      validate: (node: FigmaNode) => {
        const issues: Omit<ValidationIssue, 'id' | 'nodeId' | 'nodeName'>[] = [];
        
        if (node.type === 'TEXT' && node.properties?.textStyle) {
          const textStyle = node.properties.textStyle;
          
          // Check font family
          if (textStyle.fontFamily && !this.isValidFontFamily(textStyle.fontFamily)) {
            issues.push({
              type: 'warning',
              message: `Font family "${textStyle.fontFamily}" is not in the design system`,
              suggestion: `Use "Inter", "Roboto", or "SF Pro" instead`
            });
          }
          
          // Check font size
          if (textStyle.fontSize && !this.isValidFontSize(textStyle.fontSize)) {
            const closestSize = this.getClosestValidFontSize(textStyle.fontSize);
            issues.push({
              type: 'warning',
              message: `Font size ${textStyle.fontSize}px is not in the design system`,
              suggestion: `Use ${closestSize}px instead`
            });
          }
          
          // Check font weight
          if (textStyle.fontWeight && !this.isValidFontWeight(textStyle.fontWeight)) {
            const closestWeight = this.getClosestValidFontWeight(textStyle.fontWeight);
            issues.push({
              type: 'info',
              message: `Font weight ${textStyle.fontWeight} is not in the design system`,
              suggestion: `Use font weight ${closestWeight} instead`
            });
          }
        }
        
        return issues;
      },
      isValidFontFamily: (fontFamily: string) => {
        const validFontFamilies = ['Inter', 'Roboto', 'SF Pro', 'Arial', 'Helvetica'];
        return validFontFamilies.includes(fontFamily);
      },
      isValidFontSize: (fontSize: number) => {
        const validFontSizes = [12, 14, 16, 18, 20, 24, 30, 36, 48, 60, 72];
        return validFontSizes.includes(fontSize);
      },
      getClosestValidFontSize: (fontSize: number) => {
        const validFontSizes = [12, 14, 16, 18, 20, 24, 30, 36, 48, 60, 72];
        return validFontSizes.reduce((prev, curr) => 
          Math.abs(curr - fontSize) < Math.abs(prev - fontSize) ? curr : prev
        );
      },
      isValidFontWeight: (fontWeight: number) => {
        const validFontWeights = [400, 500, 600, 700];
        return validFontWeights.includes(fontWeight);
      },
      getClosestValidFontWeight: (fontWeight: number) => {
        const validFontWeights = [400, 500, 600, 700];
        return validFontWeights.reduce((prev, curr) => 
          Math.abs(curr - fontWeight) < Math.abs(prev - fontWeight) ? curr : prev
        );
      }
    });
    
    // Spacing validator
    validators.set('SpacingValidator', {
      validate: (node: FigmaNode) => {
        const issues: Omit<ValidationIssue, 'id' | 'nodeId' | 'nodeName'>[] = [];
        
        // Check padding
        const paddingProps = [
          { name: 'paddingLeft', value: node.properties?.paddingLeft },
          { name: 'paddingRight', value: node.properties?.paddingRight },
          { name: 'paddingTop', value: node.properties?.paddingTop },
          { name: 'paddingBottom', value: node.properties?.paddingBottom }
        ];
        
        for (const prop of paddingProps) {
          if (prop.value !== undefined && !this.isValidSpacing(prop.value)) {
            const closestSpacing = this.getClosestValidSpacing(prop.value);
            issues.push({
              type: 'info',
              message: `${prop.name} value ${prop.value}px is not in the design system`,
              suggestion: `Use ${closestSpacing}px instead`
            });
          }
        }
        
        // Check item spacing
        if (node.properties?.itemSpacing !== undefined && !this.isValidSpacing(node.properties.itemSpacing)) {
          const closestSpacing = this.getClosestValidSpacing(node.properties.itemSpacing);
          issues.push({
            type: 'info',
            message: `Item spacing value ${node.properties.itemSpacing}px is not in the design system`,
            suggestion: `Use ${closestSpacing}px instead`
          });
        }
        
        return issues;
      },
      isValidSpacing: (spacing: number) => {
        const validSpacingValues = [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128];
        return validSpacingValues.includes(spacing);
      },
      getClosestValidSpacing: (spacing: number) => {
        const validSpacingValues = [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128];
        return validSpacingValues.reduce((prev, curr) => 
          Math.abs(curr - spacing) < Math.abs(prev - spacing) ? curr : prev
        );
      }
    });
    
    return validators;
  }
}

interface PatternDetector {
  matches: (node: FigmaNode) => boolean;
  calculateConfidence: (node: FigmaNode) => number;
  extractMetadata: (node: FigmaNode) => Record<string, any>;
  analyzeContentStructure?: (childTypes: string[]) => string;
}

interface StyleValidator {
  validate: (node: FigmaNode) => Omit<ValidationIssue, 'id' | 'nodeId' | 'nodeName'>[];
  validateColor?: (color: any, opacity?: number) => Omit<ValidationIssue, 'id' | 'nodeId' | 'nodeName'> | null;
  parseRgba?: (rgba: string) => number[];
  isValidFontFamily?: (fontFamily: string) => boolean;
  isValidFontSize?: (fontSize: number) => boolean;
  getClosestValidFontSize?: (fontSize: number) => number;
  isValidFontWeight?: (fontWeight: number) => boolean;
  getClosestValidFontWeight?: (fontWeight: number) => number;
  isValidSpacing?: (spacing: number) => boolean;
  getClosestValidSpacing?: (spacing: number) => number;
}

// Export as singleton
export const designAnalyzerService = new DesignAnalyzerService();
export default designAnalyzerService;
