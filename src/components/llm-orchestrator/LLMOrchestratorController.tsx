'use client';

import React, { useState } from 'react';
import LLMOrchestrator from './LLMOrchestrator';
import { 
  LLMOrchestratorAgent, 
  ComponentMapping,
  EDSComponent,
  ComponentPattern,
  CodeGenerationRequest,
  CodeGenerationResult,
  FrameworkConfig
} from '../../lib/agents';

interface LLMOrchestratorControllerProps {
  componentMappings: ComponentMapping[];
  edsComponents: EDSComponent[];
  patterns: ComponentPattern[];
  onComplete?: (result: CodeGenerationResult) => void;
}

/**
 * Controller component that connects the LLMOrchestrator UI with the LLMOrchestratorAgent
 */
export const LLMOrchestratorController: React.FC<LLMOrchestratorControllerProps> = ({
  componentMappings,
  edsComponents,
  patterns,
  onComplete
}) => {
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [generationResult, setGenerationResult] = useState<CodeGenerationResult | null>(null);
  const [selectedFramework, setSelectedFramework] = useState<string>('react');
  const [frameworkOptions, setFrameworkOptions] = useState<Record<string, any>>({
    typescript: true,
    styling: 'tailwind'
  });

  // Initialize the LLM Orchestrator Agent
  const llmOrchestratorAgent = React.useMemo(() => {
    const agent = new LLMOrchestratorAgent();
    // Initialize with existing data
    if (componentMappings.length > 0) {
      agent.initialize(componentMappings, edsComponents, patterns);
    }
    return agent;
  }, [componentMappings, edsComponents, patterns]);

  /**
   * Handle framework selection
   */
  const handleFrameworkChange = (framework: string) => {
    setSelectedFramework(framework);
    
    // Set default options for the selected framework
    switch (framework) {
      case 'react':
        setFrameworkOptions({
          typescript: true,
          styling: 'tailwind'
        });
        break;
      case 'vue':
        setFrameworkOptions({
          typescript: false,
          styling: 'scoped'
        });
        break;
      case 'angular':
        setFrameworkOptions({
          styling: 'scss'
        });
        break;
      case 'html':
        setFrameworkOptions({
          includeJs: true
        });
        break;
      default:
        setFrameworkOptions({});
    }
  };

  /**
   * Handle framework options change
   */
  const handleOptionsChange = (options: Record<string, any>) => {
    setFrameworkOptions(options);
  };

  /**
   * Handle code generation
   */
  const handleGenerateCode = async (mappingIds: string[], generateLayout: boolean) => {
    if (mappingIds.length === 0) {
      setError('No component mappings selected for code generation');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Set the framework configuration
      const frameworkConfig: FrameworkConfig = {
        name: selectedFramework,
        options: frameworkOptions
      };
      llmOrchestratorAgent.setFrameworkConfig(frameworkConfig);
      
      // Create the code generation request
      const request: CodeGenerationRequest = {
        mappingIds,
        generateLayout,
        options: frameworkOptions
      };
      
      // Generate the code
      const result = llmOrchestratorAgent.generateCode(request);
      
      // Update state with the generation result
      setGenerationResult(result);
      
      console.log('Code generation completed successfully:', result);

      if (onComplete) {
        onComplete(result);
      }
    } catch (err) {
      console.error('Error generating code:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setGenerationResult(null);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="llm-orchestrator-controller">
      <LLMOrchestrator 
        mappings={componentMappings}
      />
    </div>
  );
};
