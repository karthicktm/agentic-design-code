import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Link2, Settings, Puzzle } from 'lucide-react';
import { FigmaNode } from '@/components/figma-import/FigmaService';
import { EDSComponent } from '@/components/eds-library/EDSLibraryService';
import { DetectedPattern } from '@/components/design-analyzer/DesignAnalyzerService';

interface ComponentMappingProps {
  figmaDesign: {
    id: string;
    name: string;
    document: FigmaNode;
  } | null;
  edsLibrary: {
    id: string;
    name: string;
    components: EDSComponent[];
  } | null;
  detectedPatterns: DetectedPattern[] | null;
}

interface MappingItem {
  id: string;
  figmaNodeId: string;
  figmaNodeName: string;
  edsComponentId: string;
  edsComponentName: string;
  confidence: number;
  properties: PropertyMapping[];
}

interface PropertyMapping {
  figmaProperty: string;
  edsProperty: string;
  transformRule?: string;
  defaultValue?: any;
}

const ComponentMapping: React.FC<ComponentMappingProps> = ({ 
  figmaDesign, 
  edsLibrary, 
  detectedPatterns 
}) => {
  const [selectedFigmaNode, setSelectedFigmaNode] = useState<FigmaNode | null>(null);
  const [selectedEDSComponent, setSelectedEDSComponent] = useState<EDSComponent | null>(null);
  const [mappings, setMappings] = useState<MappingItem[]>([]);
  const [searchFigma, setSearchFigma] = useState('');
  const [searchEDS, setSearchEDS] = useState('');
  
  const handleCreateMapping = () => {
    if (!selectedFigmaNode || !selectedEDSComponent) return;
    
    // Check if mapping already exists
    const existingMapping = mappings.find(m => m.figmaNodeId === selectedFigmaNode.id);
    if (existingMapping) {
      // Update existing mapping
      const updatedMappings = mappings.map(m => 
        m.figmaNodeId === selectedFigmaNode.id 
          ? {
              ...m,
              edsComponentId: selectedEDSComponent.id,
              edsComponentName: selectedEDSComponent.name,
              // Auto-generate property mappings based on names
              properties: generatePropertyMappings(selectedFigmaNode, selectedEDSComponent)
            }
          : m
      );
      setMappings(updatedMappings);
    } else {
      // Create new mapping
      const newMapping: MappingItem = {
        id: `mapping-${Date.now()}`,
        figmaNodeId: selectedFigmaNode.id,
        figmaNodeName: selectedFigmaNode.name,
        edsComponentId: selectedEDSComponent.id,
        edsComponentName: selectedEDSComponent.name,
        confidence: getConfidenceScore(selectedFigmaNode, selectedEDSComponent),
        properties: generatePropertyMappings(selectedFigmaNode, selectedEDSComponent)
      };
      
      setMappings([...mappings, newMapping]);
    }
  };
  
  const generatePropertyMappings = (figmaNode: FigmaNode, edsComponent: EDSComponent): PropertyMapping[] => {
    const propertyMappings: PropertyMapping[] = [];
    
    // Extract Figma node properties
    const figmaProperties = extractFigmaProperties(figmaNode);
    
    // For each EDS component property, try to find a matching Figma property
    for (const edsProp of edsComponent.properties) {
      const matchingFigmaProp = findMatchingFigmaProperty(edsProp.name, figmaProperties);
      
      if (matchingFigmaProp) {
        propertyMappings.push({
          figmaProperty: matchingFigmaProp,
          edsProperty: edsProp.name,
          transformRule: getTransformRule(matchingFigmaProp, edsProp.name)
        });
      } else if (edsProp.required) {
        // If required EDS property has no matching Figma property, add with default value
        propertyMappings.push({
          figmaProperty: '',
          edsProperty: edsProp.name,
          defaultValue: edsProp.defaultValue || getDefaultValueForType(edsProp.type)
        });
      }
    }
    
    return propertyMappings;
  };
  
  const extractFigmaProperties = (figmaNode: FigmaNode): string[] => {
    const properties: string[] = [];
    
    // Extract basic properties
    if (figmaNode.name) properties.push('name');
    if (figmaNode.type) properties.push('type');
    
    // Extract from node properties
    if (figmaNode.properties) {
      for (const key in figmaNode.properties) {
        properties.push(key);
      }
    }
    
    // Extract text content if it's a text node
    if (figmaNode.type === 'TEXT' && figmaNode.properties?.characters) {
      properties.push('characters');
    }
    
    // Extract size and position
    if (figmaNode.properties?.size) {
      properties.push('width');
      properties.push('height');
    }
    
    return properties;
  };
  
  const findMatchingFigmaProperty = (edsPropertyName: string, figmaProperties: string[]): string => {
    // Direct match
    if (figmaProperties.includes(edsPropertyName)) {
      return edsPropertyName;
    }
    
    // Common mappings
    const commonMappings: Record<string, string[]> = {
      'text': ['characters', 'content'],
      'label': ['name', 'characters'],
      'children': ['characters', 'content'],
      'variant': ['variant', 'style'],
      'disabled': ['visible'],
      'size': ['size'],
      'width': ['width'],
      'height': ['height'],
      'color': ['fills', 'color'],
      'backgroundColor': ['fills', 'backgroundColor'],
      'borderColor': ['strokes', 'borderColor'],
      'borderWidth': ['strokeWeight', 'borderWidth'],
      'borderRadius': ['cornerRadius', 'borderRadius'],
      'padding': ['padding', 'paddingLeft', 'paddingRight', 'paddingTop', 'paddingBottom']
    };
    
    for (const [edsProp, figmaProps] of Object.entries(commonMappings)) {
      if (edsPropertyName.toLowerCase().includes(edsProp.toLowerCase())) {
        for (const figmaProp of figmaProps) {
          if (figmaProperties.includes(figmaProp)) {
            return figmaProp;
          }
        }
      }
    }
    
    return '';
  };
  
  const getTransformRule = (figmaProperty: string, edsProperty: string): string | undefined => {
    // Define common transform rules
    if (figmaProperty === 'visible' && edsProperty.includes('disabled')) {
      return '!{value}'; // Invert boolean
    }
    
    if (figmaProperty === 'cornerRadius' && edsProperty.includes('borderRadius')) {
      return '{value}px'; // Add px unit
    }
    
    if (figmaProperty === 'strokeWeight' && edsProperty.includes('borderWidth')) {
      return '{value}px'; // Add px unit
    }
    
    return undefined;
  };
  
  const getDefaultValueForType = (type: string): any => {
    switch (type.toLowerCase()) {
      case 'string':
        return '';
      case 'number':
        return 0;
      case 'boolean':
        return false;
      case 'array':
        return [];
      case 'object':
        return {};
      default:
        return null;
    }
  };
  
  const getConfidenceScore = (figmaNode: FigmaNode, edsComponent: EDSComponent): number => {
    // Find if there's a detected pattern for this node
    const pattern = detectedPatterns?.find(p => p.nodeId === figmaNode.id);
    if (pattern && pattern.type.toLowerCase() === edsComponent.type.toLowerCase()) {
      return pattern.confidence;
    }
    
    // Calculate based on name similarity
    const nameSimilarity = calculateStringSimilarity(
      figmaNode.name.toLowerCase(),
      edsComponent.name.toLowerCase()
    );
    
    // Calculate based on property matching
    const figmaProps = extractFigmaProperties(figmaNode);
    const matchingPropsCount = edsComponent.properties.filter(
      edsProp => findMatchingFigmaProperty(edsProp.name, figmaProps) !== ''
    ).length;
    const propMatchRatio = edsComponent.properties.length > 0 
      ? matchingPropsCount / edsComponent.properties.length 
      : 0;
    
    // Combine scores
    return Math.min(0.3 + (nameSimilarity * 0.4) + (propMatchRatio * 0.3), 1.0);
  };
  
  const calculateStringSimilarity = (str1: string, str2: string): number => {
    // Simple Levenshtein distance-based similarity
    const maxLength = Math.max(str1.length, str2.length);
    if (maxLength === 0) return 1.0;
    
    let distance = 0;
    for (let i = 0; i < Math.min(str1.length, str2.length); i++) {
      if (str1[i] !== str2[i]) distance++;
    }
    distance += Math.abs(str1.length - str2.length);
    
    return 1 - (distance / maxLength);
  };
  
  // Filter components based on search
  const filteredFigmaNodes = figmaDesign?.document?.children?.filter(node => 
    node.name.toLowerCase().includes(searchFigma.toLowerCase())
  ) || [];
  
  const filteredEDSComponents = edsLibrary?.components.filter(component => 
    component.name.toLowerCase().includes(searchEDS.toLowerCase()) ||
    component.type.toLowerCase().includes(searchEDS.toLowerCase())
  ) || [];
  
  if (!figmaDesign || !edsLibrary) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Component Mapping</CardTitle>
          <CardDescription>Map Figma components to EDS library components</CardDescription>
        </CardHeader>
        <CardContent className="h-96 flex items-center justify-center">
          <p className="text-muted-foreground">
            Please import a Figma design and EDS library first
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Component Mapping</CardTitle>
          <CardDescription>Map Figma components to EDS library components</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Figma Components */}
            <Card className="col-span-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Figma Components</CardTitle>
                <CardDescription>
                  Select a component from your Figma design
                </CardDescription>
                <div className="relative mt-2">
                  <input
                    type="text"
                    placeholder="Search components..."
                    className="w-full px-3 py-2 border rounded-md"
                    value={searchFigma}
                    onChange={(e) => setSearchFigma(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[400px] px-4">
                  <div className="space-y-1 py-2">
                    {filteredFigmaNodes.length === 0 ? (
                      <p className="text-center py-4 text-muted-foreground">No components found</p>
                    ) : (
                      filteredFigmaNodes.map(node => {
                        const isSelected = selectedFigmaNode?.id === node.id;
                        const isMapped = mappings.some(m => m.figmaNodeId === node.id);
                        
                        return (
                          <div
                            key={node.id}
                            className={`flex items-center justify-between p-2 rounded-md cursor-pointer ${
                              isSelected ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
                            } ${isMapped ? 'border-l-4 border-green-500 pl-1' : ''}`}
                            onClick={() => setSelectedFigmaNode(node)}
                          >
                            <div className="flex items-center">
                              <span className="text-sm font-medium">{node.name}</span>
                            </div>
                            <Badge variant={isSelected ? "outline" : "secondary"}>
                              {node.type}
                            </Badge>
                          </div>
                        );
                      })
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
            
            {/* Mapping Controls */}
            <Card className="col-span-1 flex flex-col justify-center items-center">
              <CardContent className="pt-6 flex flex-col items-center justify-center h-full">
                <div className="space-y-6 flex flex-col items-center">
                  {selectedFigmaNode && (
                    <div className="text-center p-4 border rounded-md bg-muted/50 w-full">
                      <h3 className="font-medium">Selected Figma Component</h3>
                      <p className="text-sm mt-1">{selectedFigmaNode.name}</p>
                      <Badge className="mt-2">{selectedFigmaNode.type}</Badge>
                    </div>
                  )}
                  
                  <ArrowRight className="h-8 w-8 text-muted-foreground" />
                  
                  {selectedEDSComponent && (
                    <div className="text-center p-4 border rounded-md bg-muted/50 w-full">
                      <h3 className="font-medium">Selected EDS Component</h3>
                      <p className="text-sm mt-1">{selectedEDSComponent.name}</p>
                      <Badge className="mt-2">{selectedEDSComponent.type}</Badge>
                    </div>
                  )}
                  
                  <Button 
                    onClick={handleCreateMapping}
                    disabled={!selectedFigmaNode || !selectedEDSComponent}
                    className="mt-4"
                  >
                    <Link2 className="mr-2 h-4 w-4" />
                    {mappings.some(m => m.figmaNodeId === selectedFigmaNode?.id)
                      ? 'Update Mapping'
                      : 'Create Mapping'
                    }
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* EDS Components */}
            <Card className="col-span-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">EDS Components</CardTitle>
                <CardDescription>
                  Select a component from your EDS library
                </CardDescription>
                <div className="relative mt-2">
                  <input
                    type="text"
                    placeholder="Search components..."
                    className="w-full px-3 py-2 border rounded-md"
                    value={searchEDS}
                    onChange={(e) => setSearchEDS(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[400px] px-4">
                  <div className="space-y-1 py-2">
                    {filteredEDSComponents.length === 0 ? (
                      <p className="text-center py-4 text-muted-foreground">No components found</p>
                    ) : (
                      filteredEDSComponents.map(component => {
                        const isSelected = selectedEDSComponent?.id === component.id;
                        
                        return (
                          <div
                            key={component.id}
                            className={`flex items-center justify-between p-2 rounded-md cursor-pointer ${
                              isSelected ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
                            }`}
                            onClick={() => setSelectedEDSComponent(component)}
                          >
                            <div className="flex items-center">
                              <span className="text-sm font-medium">{component.name}</span>
                            </div>
                            <Badge variant={isSelected ? "outline" : "secondary"}>
                              {component.type}
                            </Badge>
                          </div>
                        );
                      })
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
      
      {/* Mappings List */}
      <Card>
        <CardHeader>
          <CardTitle>Mapping Results</CardTitle>
          <CardDescription>
            {mappings.length} component{mappings.length !== 1 ? 's' : ''} mapped
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mappings.length === 0 ? (
            <div className="text-center py-8">
              <Puzzle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No Mappings Created Yet</h3>
              <p className="text-muted-foreground mt-1">
                Select a Figma component and an EDS component to create a mapping
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {mappings.map(mapping => (
                <div key={mapping.id} className="border rounded-md p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{mapping.figmaNodeName}</h3>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      <h3 className="font-medium">{mapping.edsComponentName}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={mapping.confidence > 0.8 ? "default" : "secondary"}
                        className={mapping.confidence > 0.8 ? "bg-green-500" : ""}
                      >
                        {Math.round(mapping.confidence * 100)}% match
                      </Badge>
                      <Button variant="ghost" size="icon">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="border rounded-md overflow-hidden">
                    <table className="min-w-full divide-y divide-border">
                      <thead className="bg-muted">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Figma Property</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">EDS Property</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Transform</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Default</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {mapping.properties.map((prop, index) => (
                          <tr key={index}>
                            <td className="px-3 py-2 text-sm">
                              {prop.figmaProperty || <span className="text-muted-foreground italic">None</span>}
                            </td>
                            <td className="px-3 py-2 text-sm">{prop.edsProperty}</td>
                            <td className="px-3 py-2 text-sm text-muted-foreground">
                              {prop.transformRule || <span className="italic">None</span>}
                            </td>
                            <td className="px-3 py-2 text-sm text-muted-foreground">
                              {prop.defaultValue !== undefined 
                                ? JSON.stringify(prop.defaultValue) 
                                : <span className="italic">None</span>
                              }
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ComponentMapping;
