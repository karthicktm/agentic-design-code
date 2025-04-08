// src/lib/agents/eds-mapper/types.ts

import { FigmaComponent, FigmaNode } from '../figma-parser/types';

/**
 * Represents an EDS component
 */
export interface EDSComponent {
  id: string;
  name: string;
  type: string;
  description: string;
  properties: Record<string, any>;
  variants: any[];
  tags: string[];
  category: string;
}

/**
 * Represents an EDS library
 */
export interface EDSLibrary {
  id: string;
  name: string;
  version: string;
  description: string;
  components: EDSComponent[];
}

/**
 * Represents a property mapping between Figma and EDS
 */
export interface PropertyMapping {
  figmaProperty: string;
  edsProperty: string;
  value: any;
  confidence: number;
}

/**
 * Represents a component mapping between Figma and EDS
 */
export interface ComponentMapping {
  id: string;
  figmaComponent: FigmaComponent;
  edsComponent: EDSComponent;
  patternType: string;
  confidence: number;
  propertyMappings: PropertyMapping[];
  matchedNodes: string[];
}

/**
 * Results of component mapping
 */
export interface MappingResult {
  success: boolean;
  message: string;
  mappings: ComponentMapping[];
  mappedCount: number;
  totalCount: number;
  unmappedComponents: FigmaComponent[];
}
