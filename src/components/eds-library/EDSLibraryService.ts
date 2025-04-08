import axios from 'axios';

export interface EDSComponent {
  id: string;
  name: string;
  type: string;
  description?: string;
  properties: EDSComponentProperty[];
  variants?: EDSComponentVariant[];
  importStatement?: string;
  defaultProps?: Record<string, any>;
}

export interface EDSComponentProperty {
  name: string;
  type: string;
  description?: string;
  required: boolean;
  defaultValue?: any;
  options?: any[];
  isStyle?: boolean;
}

export interface EDSComponentVariant {
  id: string;
  name: string;
  description?: string;
  previewImage?: string;
  properties: Record<string, any>;
}

export interface EDSLibrary {
  id: string;
  name: string;
  version: string;
  description?: string;
  components: EDSComponent[];
  styles?: Record<string, any>;
  metadata?: Record<string, any>;
}

class EDSLibraryService {
  private libraries: Map<string, EDSLibrary> = new Map();

  async importLibraryFromUrl(url: string, name: string, description?: string): Promise<EDSLibrary> {
    try {
      const response = await axios.get(url);
      const libraryData = response.data;
      
      return this.processLibraryData(libraryData, name, description);
    } catch (error) {
      console.error('Error importing EDS library from URL:', error);
      throw new Error(`Failed to import EDS library: ${error.message}`);
    }
  }

  importLibraryFromJson(jsonContent: string, name: string, description?: string): EDSLibrary {
    try {
      const libraryData = JSON.parse(jsonContent);
      
      return this.processLibraryData(libraryData, name, description);
    } catch (error) {
      console.error('Error importing EDS library from JSON:', error);
      throw new Error(`Failed to parse EDS library JSON: ${error.message}`);
    }
  }

  getLibrary(id: string): EDSLibrary | undefined {
    return this.libraries.get(id);
  }

  getAllLibraries(): EDSLibrary[] {
    return Array.from(this.libraries.values());
  }

  private processLibraryData(data: any, name: string, description?: string): EDSLibrary {
    // Validate that this is an EDS library
    if (!data.components || !Array.isArray(data.components)) {
      throw new Error('Invalid EDS library format: missing components array');
    }

    const library: EDSLibrary = {
      id: this.generateId(),
      name: name || data.name || 'Unnamed Library',
      version: data.version || '1.0.0',
      description: description || data.description || '',
      components: this.processComponents(data.components),
      styles: data.styles || {},
      metadata: data.metadata || {}
    };

    // Store the library
    this.libraries.set(library.id, library);
    
    return library;
  }

  private processComponents(components: any[]): EDSComponent[] {
    return components.map(component => ({
      id: component.id || this.generateId(),
      name: component.name,
      type: component.type || 'unknown',
      description: component.description || '',
      properties: this.processComponentProperties(component.properties || {}),
      variants: component.variants || [],
      importStatement: component.importStatement || `import { ${component.name} } from 'library'`,
      defaultProps: component.defaultProps || {}
    }));
  }

  private processComponentProperties(properties: Record<string, any>): EDSComponentProperty[] {
    const processedProperties: EDSComponentProperty[] = [];
    
    for (const [propName, propDef] of Object.entries(properties)) {
      processedProperties.push({
        name: propName,
        type: (propDef as any).type || 'string',
        description: (propDef as any).description || '',
        required: (propDef as any).required || false,
        defaultValue: (propDef as any).defaultValue,
        options: (propDef as any).options || [],
        isStyle: (propDef as any).isStyle || false
      });
    }
    
    return processedProperties;
  }

  private generateId(): string {
    return `eds-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }
}

// Export as singleton
export const edsLibraryService = new EDSLibraryService();
export default edsLibraryService;
