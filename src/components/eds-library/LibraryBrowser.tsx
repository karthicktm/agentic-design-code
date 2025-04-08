import React, { useState } from 'react';
import { EDSLibrary, EDSComponent } from './EDSLibraryService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface LibraryBrowserProps {
  library: EDSLibrary | null;
}

const LibraryBrowser: React.FC<LibraryBrowserProps> = ({ library }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedComponent, setSelectedComponent] = useState<EDSComponent | null>(null);

  if (!library) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Library Browser</CardTitle>
          <CardDescription>Import a library to browse components</CardDescription>
        </CardHeader>
        <CardContent className="h-96 flex items-center justify-center">
          <p className="text-muted-foreground">No library imported yet</p>
        </CardContent>
      </Card>
    );
  }

  const filteredComponents = library.components.filter(component => 
    component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    component.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Components</CardTitle>
          <CardDescription>
            {library.name} - {library.components.length} components
          </CardDescription>
          <Input
            placeholder="Search components..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mt-2"
          />
        </CardHeader>
        <CardContent className="h-96 p-0">
          <ScrollArea className="h-96 px-4">
            <div className="space-y-1 py-2">
              {filteredComponents.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground">No components found</p>
              ) : (
                filteredComponents.map(component => (
                  <div
                    key={component.id}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-accent cursor-pointer"
                    onClick={() => setSelectedComponent(component)}
                  >
                    <div className="flex items-center">
                      <span className="text-sm font-medium">{component.name}</span>
                    </div>
                    <Badge variant="outline">{component.type}</Badge>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Component Details</CardTitle>
          <CardDescription>Selected component properties</CardDescription>
        </CardHeader>
        <CardContent className="h-96 overflow-auto">
          {selectedComponent ? (
            <Tabs defaultValue="properties">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="properties">Properties</TabsTrigger>
                <TabsTrigger value="variants">Variants</TabsTrigger>
                <TabsTrigger value="code">Code</TabsTrigger>
              </TabsList>
              <TabsContent value="properties" className="pt-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">Name</h3>
                    <p className="text-sm text-muted-foreground">{selectedComponent.name}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium">Type</h3>
                    <p className="text-sm text-muted-foreground">{selectedComponent.type}</p>
                  </div>
                  
                  {selectedComponent.description && (
                    <div>
                      <h3 className="font-medium">Description</h3>
                      <p className="text-sm text-muted-foreground">{selectedComponent.description}</p>
                    </div>
                  )}
                  
                  <div>
                    <h3 className="font-medium">Properties</h3>
                    {selectedComponent.properties.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No properties defined</p>
                    ) : (
                      <div className="border rounded-md overflow-hidden">
                        <table className="min-w-full divide-y divide-border">
                          <thead className="bg-muted">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Name</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Type</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Required</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {selectedComponent.properties.map((prop, index) => (
                              <tr key={index}>
                                <td className="px-3 py-2 text-sm">{prop.name}</td>
                                <td className="px-3 py-2 text-sm text-muted-foreground">{prop.type}</td>
                                <td className="px-3 py-2 text-sm">
                                  {prop.required ? (
                                    <Badge variant="default" className="bg-primary">Yes</Badge>
                                  ) : (
                                    <Badge variant="outline">No</Badge>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="variants" className="pt-4">
                {selectedComponent.variants && selectedComponent.variants.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    {selectedComponent.variants.map(variant => (
                      <div key={variant.id} className="border rounded-md p-3">
                        <h3 className="font-medium">{variant.name}</h3>
                        {variant.description && (
                          <p className="text-sm text-muted-foreground mt-1">{variant.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No variants defined for this component</p>
                )}
              </TabsContent>
              <TabsContent value="code" className="pt-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">Import Statement</h3>
                    <pre className="text-xs p-3 bg-muted rounded-md mt-1 overflow-auto">
                      {selectedComponent.importStatement || `import { ${selectedComponent.name} } from 'library'`}
                    </pre>
                  </div>
                  
                  <div>
                    <h3 className="font-medium">Usage Example</h3>
                    <pre className="text-xs p-3 bg-muted rounded-md mt-1 overflow-auto">
                      {`<${selectedComponent.name}${
                        selectedComponent.properties.length > 0 
                          ? '\n  ' + selectedComponent.properties
                              .filter(p => p.required)
                              .map(p => `${p.name}={${getExampleValue(p)}}`)
                              .join('\n  ')
                          : ''
                      }${selectedComponent.properties.length > 0 ? '\n/>' : '/>'}`}
                    </pre>
                  </div>
                </div>
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

// Helper function to generate example values for properties
function getExampleValue(prop: any): string {
  switch (prop.type.toLowerCase()) {
    case 'string':
      return `"example"`;
    case 'number':
      return '42';
    case 'boolean':
      return 'true';
    case 'array':
      return '[]';
    case 'object':
      return '{}';
    default:
      return `{/* ${prop.type} value */}`;
  }
}

export default LibraryBrowser;
