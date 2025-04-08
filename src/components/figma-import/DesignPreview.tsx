import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tree, TreeItem } from '@/components/ui/tree';
import { FigmaNode, FigmaComponent, FigmaStyle } from '../../lib/agents';

interface DesignPreviewProps {
  designData: {
    id: string;
    name: string;
    document: any;
  } | null;
  nodes: FigmaNode[];
  components: FigmaComponent[];
  styles: Record<string, FigmaStyle>;
}

const DesignPreview: React.FC<DesignPreviewProps> = ({ designData, nodes, components, styles }) => {
  const [selectedNode, setSelectedNode] = useState<FigmaNode | null>(null);

  if (!designData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Design Preview</CardTitle>
          <CardDescription>Import a Figma design to see the preview</CardDescription>
        </CardHeader>
        <CardContent className="h-96 flex items-center justify-center">
          <p className="text-muted-foreground">No design imported yet</p>
        </CardContent>
      </Card>
    );
  }

  const renderTreeItems = (node: any): React.ReactNode => {
    return (
      <TreeItem
        key={node.id || 'root'}
        id={node.id || 'root'}
        label={node.name || 'Root'}
        icon={getNodeIcon(node.type || 'unknown')}
        onClick={() => setSelectedNode(node as FigmaNode)}
      >
        {node.children && node.children.map((child: any) => renderTreeItems(child))}
      </TreeItem>
    );
  };

  const getNodeIcon = (type: string): string => {
    switch (type) {
      case 'FRAME':
        return '🖼️';
      case 'GROUP':
        return '📁';
      case 'COMPONENT':
        return '🧩';
      case 'INSTANCE':
        return '📋';
      case 'TEXT':
        return '📝';
      case 'RECTANGLE':
        return '⬜';
      case 'ELLIPSE':
        return '⭕';
      default:
        return '📄';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Component Tree</CardTitle>
          <CardDescription>Hierarchical view of design components</CardDescription>
        </CardHeader>
        <CardContent className="h-96 overflow-auto">
          <Tree>
            {designData.document && renderTreeItems(designData.document)}
          </Tree>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Component Details</CardTitle>
          <CardDescription>Selected component properties</CardDescription>
        </CardHeader>
        <CardContent className="h-96 overflow-auto">
          {selectedNode ? (
            <Tabs defaultValue="properties">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="properties">Properties</TabsTrigger>
                <TabsTrigger value="styles">Styles</TabsTrigger>
                <TabsTrigger value="json">JSON</TabsTrigger>
              </TabsList>
              <TabsContent value="properties" className="pt-4">
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="font-medium">ID</div>
                    <div className="text-sm text-muted-foreground">{selectedNode.id}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="font-medium">Name</div>
                    <div className="text-sm text-muted-foreground">{selectedNode.name}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="font-medium">Type</div>
                    <div className="text-sm text-muted-foreground">{selectedNode.type}</div>
                  </div>
                  {selectedNode.properties?.size && (
                    <>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="font-medium">Width</div>
                        <div className="text-sm text-muted-foreground">{selectedNode.properties.size.width}px</div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="font-medium">Height</div>
                        <div className="text-sm text-muted-foreground">{selectedNode.properties.size.height}px</div>
                      </div>
                    </>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="styles" className="pt-4">
                <pre className="text-xs p-4 bg-muted rounded-md overflow-auto">
                  {JSON.stringify((selectedNode as any).styles || {}, null, 2)}
                </pre>
              </TabsContent>
              <TabsContent value="json" className="pt-4">
                <pre className="text-xs p-4 bg-muted rounded-md overflow-auto">
                  {JSON.stringify(selectedNode, null, 2)}
                </pre>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Select a component to view details</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DesignPreview;
