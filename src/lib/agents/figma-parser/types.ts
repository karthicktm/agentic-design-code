// src/lib/agents/figma-parser/types.ts

/**
 * Represents a node in the Figma design tree
 */
export interface FigmaNode {
  id: string;
  name: string;
  type: string;
  parentId: string | null;
  depth: number;
  children: string[];
  properties: Record<string, any>;
}

/**
 * Represents a style in the Figma design
 */
export interface FigmaStyle {
  id: string;
  name: string;
  type: string;
  value: any;
  nodeId: string;
}

/**
 * Represents a component in the Figma design
 */
export interface FigmaComponent {
  id: string;
  name: string;
  type: string;
  children: string[];
  properties: Record<string, any>;
  styles: Record<string, FigmaStyle>;
}

/**
 * Represents a page in the Figma design
 */
export interface FigmaPage {
  id: string;
  name: string;
  type: string;
  children: any[];
}

/**
 * Represents the entire Figma design
 */
export interface FigmaDesign {
  name: string;
  document: any;
  pages: FigmaPage[];
  lastModified: string;
  thumbnailUrl: string;
  version: string;
  schemaVersion: number;
}

/**
 * Response from the Figma Parser Agent
 */
export interface FigmaParserResponse {
  success: boolean;
  message: string;
  design?: FigmaDesign;
  nodes?: FigmaNode[];
  styles?: Record<string, FigmaStyle>;
  components?: FigmaComponent[];
  error?: string;
}
