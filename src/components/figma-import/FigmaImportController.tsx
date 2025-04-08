// src/components/figma-import/FigmaImportController.tsx
'use client';

import React, { useState } from 'react';
import FigmaImport from './FigmaImport';
import DesignPreview from './DesignPreview';
import { FigmaParserAgent, FigmaDesign, FigmaNode, FigmaComponent, FigmaStyle } from '../../lib/agents';

interface FigmaImportControllerProps {
  onComplete: (design: FigmaDesign, nodes: FigmaNode[], components: FigmaComponent[], styles: Record<string, FigmaStyle>) => void;
}

/**
 * Controller component that connects the FigmaImport UI with the FigmaParserAgent
 */
export const FigmaImportController: React.FC<FigmaImportControllerProps> = ({ onComplete }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [designData, setDesignData] = useState<FigmaDesign | null>(null);
  const [flattenedNodes, setFlattenedNodes] = useState<FigmaNode[]>([]);
  const [components, setComponents] = useState<FigmaComponent[]>([]);
  const [styles, setStyles] = useState<Record<string, FigmaStyle>>({});

  // Initialize the Figma Parser Agent
  const figmaParserAgent = React.useMemo(() => new FigmaParserAgent(), []);

  /**
   * Handle file upload
   */
  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    setError(null);

    try {
      // Read the file as text
      const fileContent = await readFileAsText(file);
      
      // Parse the JSON content
      const jsonData = JSON.parse(fileContent);
      
      // Process the Figma data using the agent
      const designTree = figmaParserAgent.parseJson(jsonData);
      
      // Get the processed data
      const nodes = figmaParserAgent.getFlattenedNodes();
      const extractedStyles = figmaParserAgent.getExtractedStyles();
      const identifiedComponents = figmaParserAgent.getComponents();
      
      // Update state with the processed data
      setDesignData(designTree);
      setFlattenedNodes(nodes);
      setComponents(identifiedComponents);
      setStyles(extractedStyles);
      
      console.log('Figma design parsed successfully:', designTree);
      
      // Call the onComplete callback with the parsed data
      onComplete(designTree, nodes, identifiedComponents, extractedStyles);
    } catch (err) {
      console.error('Error parsing Figma file:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setDesignData(null);
      setFlattenedNodes([]);
      setComponents([]);
      setStyles({});
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle Figma API token and file ID submission
   */
  const handleApiSubmit = async (token: string, fileId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // In a real implementation, this would make an API call to Figma
      // For now, we'll simulate a response
      console.log(`Fetching Figma file ${fileId} with token ${token.substring(0, 5)}...`);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate error for testing
      if (!token || !fileId) {
        throw new Error('Invalid token or file ID');
      }
      
      // Simulate successful response with mock data
      const mockData = {
        name: 'Sample Figma Design',
        document: {
          id: '0:1',
          name: 'Document',
          type: 'DOCUMENT',
          children: [
            {
              id: '1:1',
              name: 'Page 1',
              type: 'CANVAS',
              children: [
                {
                  id: '2:1',
                  name: 'Button',
                  type: 'COMPONENT',
                  fills: [{ type: 'SOLID', color: { r: 0.2, g: 0.4, b: 0.8, a: 1 } }],
                  children: [
                    {
                      id: '3:1',
                      name: 'Label',
                      type: 'TEXT',
                      characters: 'Button',
                      fontSize: 16,
                      fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1, a: 1 } }]
                    }
                  ]
                }
              ]
            }
          ]
        }
      };
      
      // Process the mock data using the agent
      const designTree = figmaParserAgent.parseJson(mockData);
      
      // Get the processed data
      const nodes = figmaParserAgent.getFlattenedNodes();
      const extractedStyles = figmaParserAgent.getExtractedStyles();
      const identifiedComponents = figmaParserAgent.getComponents();
      
      // Update state with the processed data
      setDesignData(designTree);
      setFlattenedNodes(nodes);
      setComponents(identifiedComponents);
      setStyles(extractedStyles);
      
      console.log('Figma design fetched and parsed successfully:', designTree);
      
      // Call the onComplete callback with the parsed data
      onComplete(designTree, nodes, identifiedComponents, extractedStyles);
    } catch (err) {
      console.error('Error fetching Figma file:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setDesignData(null);
      setFlattenedNodes([]);
      setComponents([]);
      setStyles({});
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
    <div className="space-y-6">
      <FigmaImport 
        onFileUpload={handleFileUpload}
        onApiSubmit={handleApiSubmit}
        isLoading={isLoading}
        error={error}
      />
      
      {designData && (
        <DesignPreview 
          designData={{
            id: 'figma-design',
            name: designData.name || 'Untitled Design',
            document: designData.document || {}
          }}
          nodes={flattenedNodes}
          components={components}
          styles={styles}
        />
      )}
    </div>
  );
};
