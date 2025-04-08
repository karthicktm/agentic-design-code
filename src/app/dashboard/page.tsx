'use client';
import { FigmaImportController } from '@/components/figma-import/FigmaImportController';
import { DesignAnalyzerController } from '@/components/design-analyzer/DesignAnalyzerController';
import { EDSLibraryImportController } from '@/components/eds-library/EDSLibraryImportController';
import { ComponentMappingController } from '@/components/component-mapping/ComponentMappingController';
import { LLMOrchestratorController } from '@/components/llm-orchestrator/LLMOrchestratorController';
import { CodeValidatorController } from '@/components/code-validator/CodeValidatorController';
import Layout from '@/components/layout/Layout';

import { 
  FigmaDesign, 
  FigmaNode,
  FigmaComponent, 
  FigmaStyle,
  ComponentPattern,
  EDSComponent,
  ComponentMapping,
  CodeGenerationResult
} from '@/lib/agents';
import { useState } from 'react';

/**
 * Main Dashboard Page
 * Orchestrates the flow between different modules and maintains application state
 */
export default function Dashboard() {
  // Figma Import state
  const [designData, setDesignData] = useState<FigmaDesign | null>(null);
  const [figmaNodes, setFigmaNodes] = useState<FigmaNode[]>([]);
  const [figmaComponents, setFigmaComponents] = useState<FigmaComponent[]>([]);
  const [figmaStyles, setFigmaStyles] = useState<Record<string, FigmaStyle>>({});
  
  // Design Analyzer state
  const [patterns, setPatterns] = useState<ComponentPattern[]>([]);
  const [styleIssues, setStyleIssues] = useState<any[]>([]);
  const [designMetadata, setDesignMetadata] = useState<Record<string, any> | null>(null);
  
  // EDS Library state
  const [edsComponents, setEdsComponents] = useState<EDSComponent[]>([]);
  
  // Component Mapping state
  const [componentMappings, setComponentMappings] = useState<ComponentMapping[]>([]);
  
  // Code Generation state
  const [generatedCode, setGeneratedCode] = useState<CodeGenerationResult | null>(null);
  
  // Workflow state
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [workflowStatus, setWorkflowStatus] = useState<string>('Not Started');

  // Define workflow steps
  const workflowSteps = [
    { id: 0, name: 'Figma Import', description: 'Import Figma design file' },
    { id: 1, name: 'Design Analysis', description: 'Analyze design patterns and styles' },
    { id: 2, name: 'EDS Library Import', description: 'Import EDS component library' },
    { id: 3, name: 'Component Mapping', description: 'Map Figma components to EDS components' },
    { id: 4, name: 'Code Generation', description: 'Generate code from component mappings' },
    { id: 5, name: 'Code Validation', description: 'Validate and preview generated code' }
  ];

  console.log('workflowSteps:', workflowSteps);

  // Event handlers for data flow between components
  
  // Handle Figma Import completion
  const handleFigmaImportComplete = (
    design: FigmaDesign, 
    nodes: FigmaNode[], 
    components: FigmaComponent[], 
    styles: Record<string, FigmaStyle>
  ) => {
    setDesignData(design);
    setFigmaNodes(nodes);
    setFigmaComponents(components);
    setFigmaStyles(styles);
    
    // Mark step as completed
    markStepCompleted(0);
    
    // Move to next step
    setCurrentStep(1);
    setWorkflowStatus('Design imported successfully');
  };
  
  // Handle Design Analysis completion
  const handleDesignAnalysisComplete = (
    detectedPatterns: ComponentPattern[], 
    detectedStyleIssues: any[],
    metadata: Record<string, any>
  ) => {
    setPatterns(detectedPatterns);
    setStyleIssues(detectedStyleIssues);
    setDesignMetadata(metadata);
    
    // Mark step as completed
    markStepCompleted(1);
    
    // Move to next step
    setCurrentStep(2);
    setWorkflowStatus('Design analysis completed');
  };
  
  // Handle EDS Library Import completion
  const handleEDSLibraryImportComplete = (components: EDSComponent[]) => {
    setEdsComponents(components);
    
    // Mark step as completed
    markStepCompleted(2);
    
    // Move to next step
    setCurrentStep(3);
    setWorkflowStatus('EDS library imported successfully');
  };
  
  // Handle Component Mapping completion
  const handleComponentMappingComplete = (mappings: ComponentMapping[]) => {
    setComponentMappings(mappings);
    
    // Mark step as completed
    markStepCompleted(3);
    
    // Move to next step
    setCurrentStep(4);
    setWorkflowStatus('Component mapping completed');
  };
  
  // Handle Code Generation completion
  const handleCodeGenerationComplete = (result: CodeGenerationResult) => {
    setGeneratedCode(result);
    
    // Mark step as completed
    markStepCompleted(4);
    
    // Move to next step
    setCurrentStep(5);
    setWorkflowStatus('Code generation completed');
  };
  
  // Handle Code Validation completion
  const handleCodeValidationComplete = () => {
    // Mark step as completed
    markStepCompleted(5);
    
    setWorkflowStatus('Code validation completed - Workflow finished');
  };
  
  // Helper function to mark a step as completed
  const markStepCompleted = (stepId: number) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId]);
    }
  };
  
  // Helper function to check if a step is completed
  const isStepCompleted = (stepId: number) => {
    return completedSteps.includes(stepId);
  };
  
  // Helper function to navigate to a specific step
  const navigateToStep = (stepId: number) => {
    // Only allow navigation to completed steps or the current step + 1
    if (isStepCompleted(stepId) || stepId === currentStep || stepId === currentStep + 1) {
      setCurrentStep(stepId);
    }
  };

  return (
    <Layout 
      currentStep={currentStep}
      workflowSteps={workflowSteps}
      completedSteps={completedSteps}
      onStepSelect={navigateToStep}
      workflowStatus={workflowStatus}
    >
      {/* Render the appropriate component based on the current step */}
      {currentStep === 0 && (
        <FigmaImportController 
          onComplete={handleFigmaImportComplete}
        />
      )}
      
      {currentStep === 1 && designData && (
        <DesignAnalyzerController 
          designData={designData}
          nodes={figmaNodes}
          components={figmaComponents}
          styles={figmaStyles}
          onComplete={handleDesignAnalysisComplete}
        />
      )}
      
      {currentStep === 2 && (
        <EDSLibraryImportController 
          figmaNodes={figmaNodes}
          figmaComponents={figmaComponents}
          patterns={patterns}
          onComplete={handleEDSLibraryImportComplete}
        />
      )}
      
      {currentStep === 3 && (
        <ComponentMappingController 
          figmaComponents={figmaComponents}
          edsComponents={edsComponents}
          patterns={patterns}
          initialMappings={componentMappings}
        />
      )}
      
      {currentStep === 4 && (
        <LLMOrchestratorController 
          componentMappings={componentMappings}
          edsComponents={edsComponents}
          patterns={patterns}
        />
      )}
      
      {currentStep === 5 && generatedCode && (
        <CodeValidatorController 
          generatedCode={generatedCode}
        />
      )}
    </Layout>
  );
}
