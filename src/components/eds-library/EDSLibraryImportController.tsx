'use client';

import React, { useState } from 'react';
import EDSLibraryImport from './EDSLibraryImport';
import LibraryBrowser from './LibraryBrowser';
import { 
  EDSMapperAgent, 
  EDSComponent,
  FigmaNode, 
  FigmaComponent, 
  ComponentPattern,
  ComponentMapping,
  MappingResult
} from '../../lib/agents';
import { EDSLibrary } from './EDSLibraryService';

interface EDSLibraryImportControllerProps {
  figmaNodes: FigmaNode[];
  figmaComponents: FigmaComponent[];
  patterns: ComponentPattern[];
  onComplete: (components: EDSComponent[]) => void;
}

/**
 * Controller component that connects the EDSLibraryImport UI with the EDSMapperAgent
 */
export const EDSLibraryImportController: React.FC<EDSLibraryImportControllerProps> = ({
  figmaNodes,
  figmaComponents,
  patterns,
  onComplete
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [edsLibrary, setEdsLibrary] = useState<EDSLibrary | null>(null);
  const [edsComponents, setEdsComponents] = useState<EDSComponent[]>([]);
  const [mappingResult, setMappingResult] = useState<MappingResult | null>(null);
  const [componentMappings, setComponentMappings] = useState<ComponentMapping[]>([]);

  // Initialize the EDS Mapper Agent
  const edsMapperAgent = React.useMemo(() => new EDSMapperAgent(), []);

  /**
   * Handle library file upload
   */
  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Read the file content
      const fileContent = await readFileAsText(file);
      
      // Parse the JSON content
      const libraryData = JSON.parse(fileContent);
      
      // Process the library data
      const processedLibrary = edsMapperAgent.processLibraryData(libraryData);
      
      // Add the library to the agent
      const library = edsMapperAgent.addLibrary(processedLibrary);
      
      // Transform components to match service type
      const transformedComponents = library.components.map(component => ({
        id: component.id,
        name: component.name,
        type: component.type,
        description: component.description,
        properties: Object.entries(component.properties).map(([name, value]) => ({
          name,
          type: typeof value,
          description: '',
          required: false,
          defaultValue: value
        })),
        variants: component.variants.map(variant => ({
          id: variant.id || String(Math.random()),
          name: variant.name || 'Default',
          properties: variant.properties || {}
        })),
        tags: component.tags || [],
        category: component.category || 'Uncategorized'
      }));
      
      // Create library with transformed components
      const libraryWithId = {
        id: library.id,
        name: library.name,
        version: library.version,
        description: library.description,
        components: transformedComponents
      };
      
      // Update state
      setEdsLibrary(libraryWithId);
      setEdsComponents(transformedComponents);
      
      console.log('EDS library imported successfully:', libraryWithId);
      
      // Call the onComplete callback with the components
      onComplete(transformedComponents);
    } catch (err) {
      console.error('Error importing EDS library:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle mapping components
   */
  const handleMapComponents = async () => {
    if (!edsLibrary || figmaComponents.length === 0) {
      setError('No EDS library or Figma components available for mapping');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Initialize the mapper with Figma data
      edsMapperAgent.initialize(figmaComponents, figmaNodes, patterns);
      
      // Map components
      const result = await edsMapperAgent.mapComponents();
      
      // Update state
      setMappingResult(result);
      setComponentMappings(result.mappings);
      
      console.log('Components mapped successfully:', result);
    } catch (err) {
      console.error('Error mapping components:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Helper function to read a file as text
   */
  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  return (
    <div className="space-y-4">
      <EDSLibraryImport
        onFileUpload={handleFileUpload}
        onMapComponents={handleMapComponents}
        isLoading={isLoading}
        error={error}
      />
      <LibraryBrowser library={edsLibrary} />
    </div>
  );
};
