import axios from 'axios';

export interface FigmaFile {
  id: string;
  name: string;
  lastModified: string;
  thumbnail?: string;
}

export interface FigmaComponent {
  id: string;
  name: string;
  type: string;
  description?: string;
}

export interface FigmaNode {
  id: string;
  name: string;
  type: string;
  children?: FigmaNode[];
  properties?: Record<string, any>;
  styles?: Record<string, any>;
}

export interface FigmaDesign {
  id: string;
  name: string;
  lastModified: string;
  components: FigmaComponent[];
  document: FigmaNode;
  styles: Record<string, any>;
}

class FigmaService {
  private apiKey: string = '';
  private baseUrl = 'https://api.figma.com/v1';

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
  }

  getApiKey(): string {
    return this.apiKey;
  }

  async fetchFile(fileId: string): Promise<FigmaDesign> {
    try {
      const response = await axios.get(`${this.baseUrl}/files/${fileId}`, {
        headers: {
          'X-Figma-Token': this.apiKey
        }
      });

      // Process the response to match our FigmaDesign interface
      const { name, lastModified, components, styles, document } = response.data;
      
      return {
        id: fileId,
        name,
        lastModified,
        components: this.processComponents(components),
        document: this.processDocument(document),
        styles: this.processStyles(styles)
      };
    } catch (error) {
      console.error('Error fetching Figma file:', error);
      throw new Error(`Failed to fetch Figma file: ${error.message}`);
    }
  }

  async fetchRecentFiles(): Promise<FigmaFile[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/me/files/recent`, {
        headers: {
          'X-Figma-Token': this.apiKey
        }
      });

      return response.data.files.map((file: any) => ({
        id: file.key,
        name: file.name,
        lastModified: file.last_modified,
        thumbnail: file.thumbnail_url
      }));
    } catch (error) {
      console.error('Error fetching recent files:', error);
      throw new Error(`Failed to fetch recent files: ${error.message}`);
    }
  }

  async fetchFileImages(fileId: string, nodeIds: string[]): Promise<Record<string, string>> {
    try {
      const nodeIdsParam = nodeIds.join(',');
      const response = await axios.get(
        `${this.baseUrl}/images/${fileId}?ids=${nodeIdsParam}&format=png&scale=2`,
        {
          headers: {
            'X-Figma-Token': this.apiKey
          }
        }
      );

      return response.data.images;
    } catch (error) {
      console.error('Error fetching Figma images:', error);
      throw new Error(`Failed to fetch Figma images: ${error.message}`);
    }
  }

  extractFileIdFromUrl(url: string): string {
    // Figma URLs are in the format: https://www.figma.com/file/{fileId}/{title}
    const match = url.match(/figma\.com\/file\/([^/]+)/);
    if (match && match[1]) {
      return match[1];
    }
    throw new Error('Invalid Figma URL format');
  }

  parseJsonFile(jsonContent: string): FigmaDesign {
    try {
      const data = JSON.parse(jsonContent);
      
      // Validate that this is a Figma file JSON
      if (!data.document || !data.name) {
        throw new Error('Invalid Figma JSON format');
      }

      return {
        id: data.document.id || 'local-file',
        name: data.name,
        lastModified: new Date().toISOString(),
        components: this.processComponents(data.components || {}),
        document: this.processDocument(data.document),
        styles: this.processStyles(data.styles || {})
      };
    } catch (error) {
      console.error('Error parsing Figma JSON:', error);
      throw new Error(`Failed to parse Figma JSON: ${error.message}`);
    }
  }

  private processComponents(components: Record<string, any>): FigmaComponent[] {
    const processedComponents: FigmaComponent[] = [];
    
    for (const [id, component] of Object.entries(components)) {
      processedComponents.push({
        id,
        name: component.name,
        type: component.type || 'COMPONENT',
        description: component.description || ''
      });
    }
    
    return processedComponents;
  }

  private processDocument(document: any): FigmaNode {
    return this.processNode(document);
  }

  private processNode(node: any): FigmaNode {
    const processedNode: FigmaNode = {
      id: node.id,
      name: node.name,
      type: node.type,
      properties: this.extractNodeProperties(node),
      styles: node.styles
    };

    if (node.children && Array.isArray(node.children)) {
      processedNode.children = node.children.map((child: any) => this.processNode(child));
    }

    return processedNode;
  }

  private extractNodeProperties(node: any): Record<string, any> {
    const properties: Record<string, any> = {};
    
    // Extract common properties
    if (node.visible !== undefined) properties.visible = node.visible;
    if (node.opacity !== undefined) properties.opacity = node.opacity;
    if (node.blendMode !== undefined) properties.blendMode = node.blendMode;
    
    // Extract size and position
    if (node.absoluteBoundingBox) {
      properties.position = {
        x: node.absoluteBoundingBox.x,
        y: node.absoluteBoundingBox.y
      };
      properties.size = {
        width: node.absoluteBoundingBox.width,
        height: node.absoluteBoundingBox.height
      };
    }
    
    // Extract fills
    if (node.fills) properties.fills = node.fills;
    
    // Extract strokes
    if (node.strokes) properties.strokes = node.strokes;
    if (node.strokeWeight !== undefined) properties.strokeWeight = node.strokeWeight;
    
    // Extract text properties
    if (node.type === 'TEXT') {
      if (node.characters) properties.characters = node.characters;
      if (node.style) properties.textStyle = node.style;
    }
    
    // Extract layout properties
    if (node.layoutMode) properties.layoutMode = node.layoutMode;
    if (node.primaryAxisAlignItems) properties.primaryAxisAlignItems = node.primaryAxisAlignItems;
    if (node.counterAxisAlignItems) properties.counterAxisAlignItems = node.counterAxisAlignItems;
    if (node.paddingLeft) properties.paddingLeft = node.paddingLeft;
    if (node.paddingRight) properties.paddingRight = node.paddingRight;
    if (node.paddingTop) properties.paddingTop = node.paddingTop;
    if (node.paddingBottom) properties.paddingBottom = node.paddingBottom;
    if (node.itemSpacing) properties.itemSpacing = node.itemSpacing;
    
    return properties;
  }

  private processStyles(styles: Record<string, any>): Record<string, any> {
    const processedStyles: Record<string, any> = {};
    
    for (const [id, style] of Object.entries(styles)) {
      processedStyles[id] = {
        id,
        name: style.name,
        description: style.description || '',
        styleType: style.styleType
      };
    }
    
    return processedStyles;
  }
}

// Export as singleton
export const figmaService = new FigmaService();
export default figmaService;
