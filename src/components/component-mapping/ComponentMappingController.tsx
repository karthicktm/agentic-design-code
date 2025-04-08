'use client';

import React, { useState } from 'react';
import ComponentMapping from './ComponentMapping';
import { 
  EDSMapperAgent, 
  FigmaComponent, 
  EDSComponent,
  ComponentMapping as ComponentMappingType,
  ComponentPattern,
  PropertyMapping
} from '../../lib/agents';

interface ComponentMappingControllerProps {
  figmaComponents: FigmaComponent[];
  edsComponents: EDSComponent[];
  patterns: ComponentPattern[];
  initialMappings?: ComponentMappingType[];
  onComplete?: (mappings: ComponentMappingType[]) => void;
}

/**
 * Controller component that connects the ComponentMapping UI with the EDSMapperAgent
 */
export const ComponentMappingController: React.FC<ComponentMappingControllerProps> = ({
  figmaComponents,
  edsComponents,
  patterns,
  initialMappings = [],
  onComplete
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [mappings, setMappings] = useState<ComponentMappingType[]>(initialMappings);
  const [selectedMapping, setSelectedMapping] = useState<ComponentMappingType | null>(null);
  const [propertyMappings, setPropertyMappings] = useState<PropertyMapping[]>([]);

  // Initialize the EDS Mapper Agent
  const edsMapperAgent = React.useMemo(() => {
    const agent = new EDSMapperAgent();
    // Initialize with existing data
    if (figmaComponents.length > 0 && edsComponents.length > 0) {
      agent.initialize(figmaComponents, [], patterns);
    }
    return agent;
  }, [figmaComponents, edsComponents, patterns]);

  /**
   * Create a new component mapping
   */
  const handleCreateMapping = (figmaComponentId: string, edsComponentId: string) => {
    // Find the Figma component
    const figmaComponent = figmaComponents.find(c => c.id === figmaComponentId);
    if (!figmaComponent) {
      setError(`Figma component with ID ${figmaComponentId} not found`);
      return;
    }
    
    // Find the EDS component
    const edsComponent = edsComponents.find(c => c.id === edsComponentId);
    if (!edsComponent) {
      setError(`EDS component with ID ${edsComponentId} not found`);
      return;
    }
    
    // Create a new mapping
    const newMapping: ComponentMappingType = {
      id: `mapping-${Date.now()}`,
      figmaComponent,
      edsComponent,
      patternType: 'manual',
      confidence: 0.8,
      propertyMappings: [],
      matchedNodes: []
    };
    
    // Add the mapping to the list
    const updatedMappings = [...mappings, newMapping];
    setMappings(updatedMappings);
    setSelectedMapping(newMapping);
    
    // Call onComplete if provided
    if (onComplete) {
      onComplete(updatedMappings);
    }
  };

  /**
   * Handle mapping selection
   */
  const handleSelectMapping = (mappingId: string) => {
    const mapping = mappings.find(m => m.id === mappingId);
    if (mapping) {
      setSelectedMapping(mapping);
      setPropertyMappings(mapping.propertyMappings);
    }
  };

  /**
   * Update a property mapping
   */
  const handleUpdatePropertyMapping = (propertyMapping: PropertyMapping) => {
    if (!selectedMapping) {
      setError('No mapping selected');
      return;
    }
    
    // Update the property mapping in the selected mapping
    const updatedMapping = {
      ...selectedMapping,
      propertyMappings: selectedMapping.propertyMappings.map(pm => 
        pm.figmaProperty === propertyMapping.figmaProperty ? propertyMapping : pm
      )
    };
    
    // Update the mapping in the list
    const updatedMappings = mappings.map(m => 
      m.id === selectedMapping.id ? updatedMapping : m
    );
    
    setMappings(updatedMappings);
    setSelectedMapping(updatedMapping);
    
    // Call onComplete if provided
    if (onComplete) {
      onComplete(updatedMappings);
    }
  };

  /**
   * Delete a component mapping
   */
  const handleDeleteMapping = (mappingId: string) => {
    // Remove the mapping from the list
    const updatedMappings = mappings.filter(m => m.id !== mappingId);
    setMappings(updatedMappings);
    
    // Clear the selected mapping if it was deleted
    if (selectedMapping && selectedMapping.id === mappingId) {
      setSelectedMapping(null);
    }
    
    // Call onComplete if provided
    if (onComplete) {
      onComplete(updatedMappings);
    }
  };

  /**
   * Get all component mappings
   */
  const getAllMappings = (): ComponentMappingType[] => {
    return mappings;
  };

  return (
    <div className="component-mapping-controller">
      <ComponentMapping 
        figmaDesign={null}
        edsLibrary={null}
        detectedPatterns={null}
      />
    </div>
  );
};
