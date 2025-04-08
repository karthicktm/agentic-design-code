import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Package, Upload, FileJson, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

interface EDSLibraryImportProps {
  onFileUpload: (file: File) => Promise<void>;
  onMapComponents: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const edsFormSchema = z.object({
  name: z.string().min(1, { message: 'Library name is required' }),
  description: z.string().optional(),
  url: z.string().url({ message: 'Please enter a valid URL' }).optional().or(z.literal('')),
});

type EDSFormValues = z.infer<typeof edsFormSchema>;

const EDSLibraryImportForm = ({ onMapComponents, isLoading }: { onMapComponents: () => Promise<void>; isLoading: boolean }) => {
  const form = useForm<EDSFormValues>({
    resolver: zodResolver(edsFormSchema),
    defaultValues: {
      name: '',
      description: '',
      url: '',
    },
  });

  const onSubmit = async (data: EDSFormValues) => {
    try {
      await onMapComponents();
    } catch (error) {
      console.error('Error mapping components:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Library Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter library name" {...field} />
              </FormControl>
              <FormDescription>
                A descriptive name for your component library
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter library description" 
                  className="resize-none" 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                A brief description of your component library
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Library URL</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/library" {...field} />
              </FormControl>
              <FormDescription>
                URL to the component library documentation or repository
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Package className="mr-2 h-4 w-4 animate-spin" />
              Mapping Components...
            </>
          ) : (
            <>
              <Package className="mr-2 h-4 w-4" />
              Map Components
            </>
          )}
        </Button>
      </form>
    </Form>
  );
};

const FileUploadForm = ({ onFileUpload, isLoading }: { onFileUpload: (file: File) => Promise<void>; isLoading: boolean }) => {
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      await onFileUpload(file);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed rounded-lg p-8 text-center">
        <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-2 text-sm font-medium">Upload Component Library</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload a JSON file containing your component library definition
        </p>
        <div className="mt-4">
          <label
            htmlFor="file-upload"
            className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            <FileJson className="mr-2 h-4 w-4" />
            Select File
          </label>
          <input
            id="file-upload"
            name="file-upload"
            type="file"
            className="sr-only"
            accept=".json"
            onChange={handleFileUpload}
            disabled={isLoading}
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          JSON up to 10MB
        </p>
      </div>
      
      {isLoading && (
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Uploading and processing library...</p>
        </div>
      )}
    </div>
  );
};

const EDSLibraryImport: React.FC<EDSLibraryImportProps> = ({ 
  onFileUpload, 
  onMapComponents, 
  isLoading, 
  error 
}) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>EDS Library Import</CardTitle>
          <CardDescription>Import your Enterprise Design System component library</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="upload">
            <TabsList>
              <TabsTrigger value="upload">Upload Library</TabsTrigger>
              <TabsTrigger value="map">Map Components</TabsTrigger>
            </TabsList>
            <TabsContent value="upload" className="pt-4">
              <FileUploadForm onFileUpload={onFileUpload} isLoading={isLoading} />
            </TabsContent>
            <TabsContent value="map" className="pt-4">
              <EDSLibraryImportForm onMapComponents={onMapComponents} isLoading={isLoading} />
            </TabsContent>
          </Tabs>
          
          {error && (
            <div className="mt-4 p-4 bg-destructive/10 text-destructive rounded-md">
              <p>{error}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EDSLibraryImport;
