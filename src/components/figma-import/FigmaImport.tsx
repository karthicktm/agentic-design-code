import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Figma, Upload, FileCode } from 'lucide-react';
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

const figmaFormSchema = z.object({
  apiKey: z.string().min(1, { message: 'Figma API key is required' }),
  fileUrl: z.string().url({ message: 'Please enter a valid Figma file URL' }),
});

type FigmaFormValues = z.infer<typeof figmaFormSchema>;

interface FigmaImportProps {
  onFileUpload: (file: File) => Promise<void>;
  onApiSubmit: (token: string, fileId: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const FigmaImportForm = ({ onApiSubmit, isLoading }: { onApiSubmit: (token: string, fileId: string) => Promise<void>; isLoading: boolean }) => {
  const form = useForm<FigmaFormValues>({
    resolver: zodResolver(figmaFormSchema),
    defaultValues: {
      apiKey: '',
      fileUrl: '',
    },
  });

  const onSubmit = async (data: FigmaFormValues) => {
    isLoading = true;
    
    try {
      // In a real implementation, this would call the Figma API
      console.log('Importing Figma file:', data);
      
      // Simulate API call
      await onApiSubmit(data.apiKey, data.fileUrl);
      
      // Handle success
      console.log('Figma file imported successfully');
    } catch (error) {
      console.error('Error importing Figma file:', error);
    } finally {
      isLoading = false;
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="apiKey"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Figma API Key</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter your Figma API key" 
                  {...field} 
                  type="password"
                />
              </FormControl>
              <FormDescription>
                Your personal access token from Figma. 
                <a 
                  href="https://www.figma.com/developers/api#access-tokens" 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-primary ml-1 hover:underline"
                >
                  Learn how to get your API key
                </a>
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="fileUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Figma File URL</FormLabel>
              <FormControl>
                <Input 
                  placeholder="https://www.figma.com/file/..." 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                The URL of the Figma file you want to import
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Figma className="mr-2 h-4 w-4 animate-spin" />
              Importing...
            </>
          ) : (
            <>
              <Figma className="mr-2 h-4 w-4" />
              Import Figma File
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
    
    isLoading = true;
    
    try {
      // In a real implementation, this would process the uploaded file
      console.log('Uploading file:', file.name);
      
      // Simulate processing
      await onFileUpload(file);
      
      // Handle success
      console.log('File uploaded successfully');
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      isLoading = false;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <label htmlFor="figma-file" className="text-sm font-medium">
          Figma JSON File
        </label>
        <Input
          id="figma-file"
          type="file"
          accept=".json"
          onChange={handleFileUpload}
          disabled={isLoading}
        />
        <p className="text-sm text-muted-foreground">
          Upload a Figma JSON file exported from Figma
        </p>
      </div>
      
      <Button disabled={isLoading}>
        {isLoading ? (
          <>
            <Upload className="mr-2 h-4 w-4 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            Upload File
          </>
        )}
      </Button>
    </div>
  );
};

const FigmaImport: React.FC<FigmaImportProps> = ({ onFileUpload, onApiSubmit, isLoading, error }) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Figma Import</h1>
        <p className="text-muted-foreground">
          Import your Figma designs to convert them to code
        </p>
      </div>
      
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Import Figma Design</CardTitle>
          <CardDescription>
            Import your Figma design using the Figma API or by uploading a JSON file
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="api" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="api">Figma API</TabsTrigger>
              <TabsTrigger value="upload">File Upload</TabsTrigger>
            </TabsList>
            <TabsContent value="api" className="pt-4">
              <FigmaImportForm onApiSubmit={onApiSubmit} isLoading={isLoading} />
            </TabsContent>
            <TabsContent value="upload" className="pt-4">
              <FileUploadForm onFileUpload={onFileUpload} isLoading={isLoading} />
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-6">
          <div className="text-sm text-muted-foreground">
            <FileCode className="inline-block mr-1 h-4 w-4" />
            Supported formats: Figma API, JSON
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default FigmaImport;
