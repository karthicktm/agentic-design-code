// src/lib/agents/llm-orchestrator/llmOrchestratorAgent.ts

import { 
  FigmaNode, 
  FigmaComponent 
} from '../figma-parser/types';
import { 
  ComponentPattern 
} from '../design-analyzer/types';
import {
  EDSComponent,
  ComponentMapping
} from '../eds-mapper/types';
import {
  CodeGenerationRequest,
  CodeGenerationResult,
  FrameworkConfig,
  PromptTemplate
} from './types';

/**
 * LLM Orchestrator Agent
 * 
 * Responsible for:
 * 1. Preparing prompts for code generation
 * 2. Calling LLM services (or using templates)
 * 3. Extracting and formatting generated code
 * 4. Handling retries and fallbacks
 */
export class LLMOrchestratorAgent {
  private mappings: ComponentMapping[] = [];
  private edsComponents: EDSComponent[] = [];
  private patterns: ComponentPattern[] = [];
  private frameworkConfig: FrameworkConfig | null = null;
  private promptTemplates: Record<string, PromptTemplate> = {};

  /**
   * Initialize the LLM Orchestrator with data from other agents
   * @param mappings Component mappings from the EDS Mapper
   * @param edsComponents EDS components
   * @param patterns Detected patterns from the Design Analyzer
   */
  public initialize(
    mappings: ComponentMapping[],
    edsComponents: EDSComponent[],
    patterns: ComponentPattern[]
  ): void {
    console.log('LLMOrchestratorAgent: Initializing with component mappings and patterns');
    
    this.mappings = mappings;
    this.edsComponents = edsComponents;
    this.patterns = patterns;
    
    // Initialize default prompt templates
    this.initializePromptTemplates();
  }

  /**
   * Set the framework configuration
   * @param config Framework configuration
   */
  public setFrameworkConfig(config: FrameworkConfig): void {
    console.log(`LLMOrchestratorAgent: Setting framework config to ${config.name}`);
    this.frameworkConfig = config;
  }

  /**
   * Initialize default prompt templates
   */
  private initializePromptTemplates(): void {
    // React template
    this.promptTemplates['react'] = {
      id: 'react-template',
      name: 'React Component Template',
      template: `
import React from 'react';
{{imports}}

/**
 * {{componentName}} Component
 {{componentDescription}}
 */
const {{componentName}} = ({{props}}) => {
  {{hooks}}
  
  return (
    {{jsx}}
  );
};

export default {{componentName}};
      `,
      placeholders: ['imports', 'componentName', 'componentDescription', 'props', 'hooks', 'jsx'],
    };
    
    // React with TypeScript template
    this.promptTemplates['react-ts'] = {
      id: 'react-ts-template',
      name: 'React TypeScript Component Template',
      template: `
import React from 'react';
{{imports}}

/**
 * Props for {{componentName}} component
 */
export interface {{componentName}}Props {
  {{propsInterface}}
}

/**
 * {{componentName}} Component
 {{componentDescription}}
 */
const {{componentName}}: React.FC<{{componentName}}Props> = ({
  {{destructuredProps}}
}) => {
  {{hooks}}
  
  return (
    {{jsx}}
  );
};

export default {{componentName}};
      `,
      placeholders: ['imports', 'componentName', 'propsInterface', 'componentDescription', 'destructuredProps', 'hooks', 'jsx'],
    };
    
    // Vue template
    this.promptTemplates['vue'] = {
      id: 'vue-template',
      name: 'Vue Component Template',
      template: `
<template>
  {{template}}
</template>

<script>
{{imports}}

export default {
  name: '{{componentName}}',
  props: {
    {{props}}
  },
  {{options}}
};
</script>

<style scoped>
{{styles}}
</style>
      `,
      placeholders: ['template', 'imports', 'componentName', 'props', 'options', 'styles'],
    };
    
    // Vue with TypeScript template
    this.promptTemplates['vue-ts'] = {
      id: 'vue-ts-template',
      name: 'Vue TypeScript Component Template',
      template: `
<template>
  {{template}}
</template>

<script lang="ts">
import { defineComponent } from 'vue';
{{imports}}

export default defineComponent({
  name: '{{componentName}}',
  props: {
    {{props}}
  },
  {{options}}
});
</script>

<style scoped>
{{styles}}
</style>
      `,
      placeholders: ['template', 'imports', 'componentName', 'props', 'options', 'styles'],
    };
    
    // Angular template
    this.promptTemplates['angular'] = {
      id: 'angular-template',
      name: 'Angular Component Template',
      template: `
import { Component, Input, Output, EventEmitter } from '@angular/core';
{{imports}}

@Component({
  selector: 'app-{{kebabCaseName}}',
  template: \`
    {{template}}
  \`,
  styleUrls: ['./{{kebabCaseName}}.component.css']
})
export class {{componentName}}Component {
  {{inputs}}
  
  {{outputs}}
  
  {{methods}}
}
      `,
      placeholders: ['imports', 'kebabCaseName', 'template', 'componentName', 'inputs', 'outputs', 'methods'],
    };
    
    // HTML/CSS template
    this.promptTemplates['html'] = {
      id: 'html-template',
      name: 'HTML/CSS Template',
      template: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{title}}</title>
  <style>
    {{styles}}
  </style>
</head>
<body>
  {{body}}
  
  <script>
    {{script}}
  </script>
</body>
</html>
      `,
      placeholders: ['title', 'styles', 'body', 'script'],
    };
  }

  /**
   * Generate code based on component mappings and framework
   * @param request Code generation request
   * @returns Generated code
   */
  public generateCode(request: CodeGenerationRequest): CodeGenerationResult {
    console.log(`LLMOrchestratorAgent: Generating code for ${request.mappingIds.length} components`);
    
    if (!this.frameworkConfig) {
      throw new Error('Framework configuration not set');
    }

    // Get the selected mappings
    const selectedMappings = this.mappings.filter(
      mapping => request.mappingIds.includes(mapping.id)
    );
    
    if (selectedMappings.length === 0) {
      throw new Error('No valid component mappings selected');
    }
    
    // Generate code for each mapping
    const generatedComponents = selectedMappings.map(mapping => {
      try {
        return this.generateComponentCode(mapping, request.options);
      } catch (error) {
        console.error(`Error generating code for component ${mapping.figmaComponent.name}:`, error);
        return {
          id: mapping.id,
          name: mapping.figmaComponent.name,
          code: `// Error generating code: ${error instanceof Error ? error.message : 'Unknown error'}`,
          language: this.getLanguageFromFramework(),
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    });
    
    // Generate container/layout code if needed
    let layoutCode = null;
    if (request.generateLayout) {
      try {
        layoutCode = this.generateLayoutCode(selectedMappings, request.options);
      } catch (error) {
        console.error('Error generating layout code:', error);
        layoutCode = {
          name: 'Layout',
          code: `// Error generating layout code: ${error instanceof Error ? error.message : 'Unknown error'}`,
          language: this.getLanguageFromFramework(),
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }
    
    return {
      success: generatedComponents.every(comp => comp.success),
      message: generatedComponents.every(comp => comp.success) 
        ? 'Code generation completed successfully' 
        : 'Some components failed to generate',
      components: generatedComponents,
      layout: layoutCode,
      framework: this.frameworkConfig.name,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Generate code for a single component
   * @param mapping Component mapping
   * @param options Generation options
   * @returns Generated component code
   */
  private generateComponentCode(mapping: ComponentMapping, options: Record<string, any>): any {
    console.log(`LLMOrchestratorAgent: Generating code for component ${mapping.figmaComponent.name}`);
    
    // Get the appropriate template based on framework
    const templateKey = this.getTemplateKeyFromFramework();
    const template = this.promptTemplates[templateKey];
    
    if (!template) {
      throw new Error(`No template found for framework ${this.frameworkConfig?.name}`);
    }
    
    // Prepare template variables
    const templateVars = this.prepareTemplateVariables(mapping, options);
    
    // Generate code using template
    const code = this.fillTemplate(template.template, templateVars);
    
    return {
      id: mapping.id,
      name: mapping.figmaComponent.name,
      code,
      language: this.getLanguageFromFramework(),
      success: true,
    };
  }

  /**
   * Generate layout code for multiple components
   * @param mappings Component mappings
   * @param options Generation options
   * @returns Generated layout code
   */
  private generateLayoutCode(mappings: ComponentMapping[], options: Record<string, any>): any {
    console.log('LLMOrchestratorAgent: Generating layout code');
    
    // Get the appropriate template based on framework
    const templateKey = this.getTemplateKeyFromFramework();
    const template = this.promptTemplates[templateKey];
    
    if (!template) {
      throw new Error(`No template found for framework ${this.frameworkConfig?.name}`);
    }
    
    // Prepare layout template variables
    const templateVars = this.prepareLayoutTemplateVariables(mappings, options);
    
    // Generate code using template
    const code = this.fillTemplate(template.template, templateVars);
    
    return {
      name: 'Layout',
      code,
      language: this.getLanguageFromFramework(),
      success: true,
    };
  }

  /**
   * Prepare template variables for a component
   * @param mapping Component mapping
   * @param options Generation options
   * @returns Template variables
   */
  private prepareTemplateVariables(mapping: ComponentMapping, options: Record<string, any>): Record<string, string> {
    const vars: Record<string, string> = {};
    const framework = this.frameworkConfig?.name || 'react';
    const useTypescript = options.typescript || false;
    
    // Common variables
    const componentName = this.formatComponentName(mapping.figmaComponent.name);
    vars['componentName'] = componentName;
    vars['componentDescription'] = ` * ${mapping.edsComponent.description || 'A component generated from Figma design'}`;
    
    if (framework === 'react') {
      // React-specific variables
      vars['imports'] = this.generateReactImports(mapping, useTypescript);
      
      if (useTypescript) {
        vars['propsInterface'] = this.generateTypeScriptProps(mapping);
        vars['destructuredProps'] = this.generateDestructuredProps(mapping);
      } else {
        vars['props'] = this.generateReactProps(mapping);
      }
      
      vars['hooks'] = this.generateReactHooks(mapping);
      vars['jsx'] = this.generateReactJSX(mapping);
    } else if (framework === 'vue') {
      // Vue-specific variables
      vars['imports'] = this.generateVueImports(mapping, useTypescript);
      vars['props'] = this.generateVueProps(mapping, useTypescript);
      vars['options'] = this.generateVueOptions(mapping);
      vars['template'] = this.generateVueTemplate(mapping);
      vars['styles'] = this.generateVueStyles(mapping);
    } else if (framework === 'angular') {
      // Angular-specific variables
      vars['imports'] = this.generateAngularImports(mapping);
      vars['kebabCaseName'] = this.toKebabCase(componentName);
      vars['template'] = this.generateAngularTemplate(mapping);
      vars['inputs'] = this.generateAngularInputs(mapping);
      vars['outputs'] = this.generateAngularOutputs(mapping);
      vars['methods'] = this.generateAngularMethods(mapping);
    } else if (framework === 'html') {
      // HTML-specific variables
      vars['title'] = componentName;
      vars['styles'] = this.generateHTMLStyles(mapping);
      vars['body'] = this.generateHTMLBody(mapping);
      vars['script'] = this.generateHTMLScript(mapping);
    }
    
    return vars;
  }

  /**
   * Prepare template variables for layout
   * @param mappings Component mappings
   * @param options Generation options
   * @returns Template variables
   */
  private prepareLayoutTemplateVariables(mappings: ComponentMapping[], options: Record<string, any>): Record<string, string> {
    const vars: Record<string, string> = {};
    const framework = this.frameworkConfig?.name || 'react';
    const useTypescript = options.typescript || false;
    
    // Common variables
    const layoutName = 'Layout';
    vars['componentName'] = layoutName;
    vars['componentDescription'] = ' * Layout component that combines multiple components';
    
    if (framework === 'react') {
      // React-specific variables
      vars['imports'] = this.generateLayoutReactImports(mappings, useTypescript);
      
      if (useTypescript) {
        vars['propsInterface'] = this.generateLayoutTypeScriptProps(mappings);
        vars['destructuredProps'] = this.generateLayoutDestructuredProps(mappings);
      } else {
        vars['props'] = this.generateLayoutReactProps(mappings);
      }
      
      vars['hooks'] = this.generateLayoutReactHooks(mappings);
      vars['jsx'] = this.generateLayoutReactJSX(mappings);
    } else if (framework === 'vue') {
      // Vue-specific variables
      vars['imports'] = this.generateLayoutVueImports(mappings, useTypescript);
      vars['props'] = this.generateLayoutVueProps(mappings, useTypescript);
      vars['options'] = this.generateLayoutVueOptions(mappings);
      vars['template'] = this.generateLayoutVueTemplate(mappings);
      vars['styles'] = this.generateLayoutVueStyles(mappings);
    } else if (framework === 'angular') {
      // Angular-specific variables
      vars['imports'] = this.generateLayoutAngularImports(mappings);
      vars['kebabCaseName'] = 'layout';
      vars['template'] = this.generateLayoutAngularTemplate(mappings);
      vars['inputs'] = this.generateLayoutAngularInputs(mappings);
      vars['outputs'] = this.generateLayoutAngularOutputs(mappings);
      vars['methods'] = this.generateLayoutAngularMethods(mappings);
    } else if (framework === 'html') {
      // HTML-specific variables
      vars['title'] = 'Layout';
      vars['styles'] = this.generateLayoutHTMLStyles(mappings);
      vars['body'] = this.generateLayoutHTMLBody(mappings);
      vars['script'] = this.generateLayoutHTMLScript(mappings);
    }
    
    return vars;
  }

  /**
   * Fill a template with variables
   * @param template Template string
   * @param variables Template variables
   * @returns Filled template
   */
  private fillTemplate(template: string, variables: Record<string, string>): string {
    let result = template;
    
    // Replace all variables in the template
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      result = result.replace(new RegExp(placeholder, 'g'), value);
    });
    
    // Remove any remaining placeholders
    result = result.replace(/{{[^}]+}}/g, '');
    
    return result;
  }

  /**
   * Format a component name to PascalCase
   * @param name Component name
   * @returns Formatted name
   */
  private formatComponentName(name: string): string {
    // Remove special characters and spaces
    const cleanName = name.replace(/[^\w\s]/g, '');
    
    // Convert to PascalCase
    return cleanName
      .split(/[\s_-]+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
  }

  /**
   * Convert a string to kebab-case
   * @param str String to convert
   * @returns Kebab-case string
   */
  private toKebabCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[\s_]+/g, '-')
      .toLowerCase();
  }

  /**
   * Get the template key based on the current framework
   * @returns Template key
   */
  private getTemplateKeyFromFramework(): string {
    if (!this.frameworkConfig) {
      return 'react';
    }
    
    const { name, options } = this.frameworkConfig;
    const useTypescript = options?.typescript || false;
    
    if (name === 'react') {
      return useTypescript ? 'react-ts' : 'react';
    } else if (name === 'vue') {
      return useTypescript ? 'vue-ts' : 'vue';
    } else if (name === 'angular') {
      return 'angular';
    } else if (name === 'html') {
      return 'html';
    }
    
    return 'react';
  }

  /**
   * Get the language based on the current framework
   * @returns Language string
   */
  private getLanguageFromFramework(): string {
    if (!this.frameworkConfig) {
      return 'javascript';
    }
    
    const { name, options } = this.frameworkConfig;
    const useTypescript = options?.typescript || false;
    
    if (name === 'react' || name === 'vue') {
      return useTypescript ? 'typescript' : 'javascript';
    } else if (name === 'angular') {
      return 'typescript';
    } else if (name === 'html') {
      return 'html';
    }
    
    return 'javascript';
  }

  // React-specific code generation methods
  
  /**
   * Generate React imports
   * @param mapping Component mapping
   * @param useTypescript Whether to use TypeScript
   * @returns Import statements
   */
  private generateReactImports(mapping: ComponentMapping, useTypescript: boolean): string {
    const imports = ['import React from \'react\';'];
    
    // Add imports based on component type
    if (mapping.edsComponent.type === 'button') {
      imports.push('import { Button } from \'your-ui-library\';');
    } else if (mapping.edsComponent.type === 'input') {
      imports.push('import { Input } from \'your-ui-library\';');
    } else if (mapping.edsComponent.type === 'card') {
      imports.push('import { Card, CardHeader, CardContent, CardFooter } from \'your-ui-library\';');
    } else if (mapping.edsComponent.type === 'navigation') {
      imports.push('import { Nav, NavItem } from \'your-ui-library\';');
    }
    
    return imports.join('\n');
  }
  
  /**
   * Generate React props
   * @param mapping Component mapping
   * @returns Props object
   */
  private generateReactProps(mapping: ComponentMapping): string {
    const props = ['{ '];
    
    // Add props based on component type
    if (mapping.edsComponent.type === 'button') {
      props.push('variant = \'primary\',');
      props.push('size = \'md\',');
      props.push('label = \'Button\',');
      props.push('onClick,');
      props.push('disabled = false,');
      props.push('...rest');
    } else if (mapping.edsComponent.type === 'input') {
      props.push('type = \'text\',');
      props.push('placeholder = \'\',');
      props.push('value = \'\',');
      props.push('onChange,');
      props.push('disabled = false,');
      props.push('...rest');
    } else if (mapping.edsComponent.type === 'card') {
      props.push('title = \'\',');
      props.push('content = \'\',');
      props.push('footer = null,');
      props.push('...rest');
    } else if (mapping.edsComponent.type === 'navigation') {
      props.push('items = [],');
      props.push('activeItem = null,');
      props.push('onItemClick,');
      props.push('...rest');
    } else {
      props.push('...props');
    }
    
    props.push(' }');
    return props.join(' ');
  }
  
  /**
   * Generate TypeScript props interface
   * @param mapping Component mapping
   * @returns Props interface
   */
  private generateTypeScriptProps(mapping: ComponentMapping): string {
    const props = [];
    
    // Add props based on component type
    if (mapping.edsComponent.type === 'button') {
      props.push('  /** Button variant */');
      props.push('  variant?: \'primary\' | \'secondary\' | \'outline\';');
      props.push('  /** Button size */');
      props.push('  size?: \'sm\' | \'md\' | \'lg\';');
      props.push('  /** Button label */');
      props.push('  label?: string;');
      props.push('  /** Click handler */');
      props.push('  onClick?: () => void;');
      props.push('  /** Whether the button is disabled */');
      props.push('  disabled?: boolean;');
    } else if (mapping.edsComponent.type === 'input') {
      props.push('  /** Input type */');
      props.push('  type?: string;');
      props.push('  /** Placeholder text */');
      props.push('  placeholder?: string;');
      props.push('  /** Input value */');
      props.push('  value?: string;');
      props.push('  /** Change handler */');
      props.push('  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;');
      props.push('  /** Whether the input is disabled */');
      props.push('  disabled?: boolean;');
    } else if (mapping.edsComponent.type === 'card') {
      props.push('  /** Card title */');
      props.push('  title?: string;');
      props.push('  /** Card content */');
      props.push('  content?: React.ReactNode;');
      props.push('  /** Card footer */');
      props.push('  footer?: React.ReactNode;');
    } else if (mapping.edsComponent.type === 'navigation') {
      props.push('  /** Navigation items */');
      props.push('  items?: Array<{ id: string; label: string }>;');
      props.push('  /** Active item ID */');
      props.push('  activeItem?: string | null;');
      props.push('  /** Item click handler */');
      props.push('  onItemClick?: (id: string) => void;');
    } else {
      props.push('  [key: string]: any;');
    }
    
    return props.join('\n');
  }
  
  /**
   * Generate destructured props
   * @param mapping Component mapping
   * @returns Destructured props
   */
  private generateDestructuredProps(mapping: ComponentMapping): string {
    const props = [];
    
    // Add props based on component type
    if (mapping.edsComponent.type === 'button') {
      props.push('  variant = \'primary\',');
      props.push('  size = \'md\',');
      props.push('  label = \'Button\',');
      props.push('  onClick,');
      props.push('  disabled = false,');
      props.push('  ...rest');
    } else if (mapping.edsComponent.type === 'input') {
      props.push('  type = \'text\',');
      props.push('  placeholder = \'\',');
      props.push('  value = \'\',');
      props.push('  onChange,');
      props.push('  disabled = false,');
      props.push('  ...rest');
    } else if (mapping.edsComponent.type === 'card') {
      props.push('  title = \'\',');
      props.push('  content = \'\',');
      props.push('  footer = null,');
      props.push('  ...rest');
    } else if (mapping.edsComponent.type === 'navigation') {
      props.push('  items = [],');
      props.push('  activeItem = null,');
      props.push('  onItemClick,');
      props.push('  ...rest');
    } else {
      props.push('  ...props');
    }
    
    return props.join('\n');
  }
  
  /**
   * Generate React hooks
   * @param mapping Component mapping
   * @returns Hooks code
   */
  private generateReactHooks(mapping: ComponentMapping): string {
    // Add hooks based on component type
    if (mapping.edsComponent.type === 'button') {
      return '// No hooks needed for this component';
    } else if (mapping.edsComponent.type === 'input') {
      return `// Example of a controlled input hook
// const [inputValue, setInputValue] = React.useState(value);
// 
// React.useEffect(() => {
//   setInputValue(value);
// }, [value]);`;
    } else if (mapping.edsComponent.type === 'navigation') {
      return `// Track active item
const [active, setActive] = React.useState(activeItem);

React.useEffect(() => {
  setActive(activeItem);
}, [activeItem]);

const handleItemClick = (id) => {
  setActive(id);
  if (onItemClick) {
    onItemClick(id);
  }
};`;
    }
    
    return '// No hooks needed for this component';
  }
  
  /**
   * Generate React JSX
   * @param mapping Component mapping
   * @returns JSX code
   */
  private generateReactJSX(mapping: ComponentMapping): string {
    // Generate JSX based on component type
    if (mapping.edsComponent.type === 'button') {
      return `<Button
  variant={variant}
  size={size}
  disabled={disabled}
  onClick={onClick}
  {...rest}
>
  {label}
</Button>`;
    } else if (mapping.edsComponent.type === 'input') {
      return `<Input
  type={type}
  placeholder={placeholder}
  value={value}
  onChange={onChange}
  disabled={disabled}
  {...rest}
/>`;
    } else if (mapping.edsComponent.type === 'card') {
      return `<Card {...rest}>
  {title && <CardHeader>{title}</CardHeader>}
  <CardContent>
    {content}
  </CardContent>
  {footer && <CardFooter>{footer}</CardFooter>}
</Card>`;
    } else if (mapping.edsComponent.type === 'navigation') {
      return `<Nav {...rest}>
  {items.map((item) => (
    <NavItem
      key={item.id}
      active={item.id === active}
      onClick={() => handleItemClick(item.id)}
    >
      {item.label}
    </NavItem>
  ))}
</Nav>`;
    } else {
      return `<div className="${this.toKebabCase(mapping.figmaComponent.name)}">
  {/* ${mapping.figmaComponent.name} component content */}
</div>`;
    }
  }

  // Vue-specific code generation methods
  
  /**
   * Generate Vue imports
   * @param mapping Component mapping
   * @param useTypescript Whether to use TypeScript
   * @returns Import statements
   */
  private generateVueImports(mapping: ComponentMapping, useTypescript: boolean): string {
    const imports = [];
    
    // Add imports based on component type
    if (mapping.edsComponent.type === 'button') {
      imports.push('import { Button } from \'your-ui-library\';');
    } else if (mapping.edsComponent.type === 'input') {
      imports.push('import { Input } from \'your-ui-library\';');
    } else if (mapping.edsComponent.type === 'card') {
      imports.push('import { Card, CardHeader, CardContent, CardFooter } from \'your-ui-library\';');
    } else if (mapping.edsComponent.type === 'navigation') {
      imports.push('import { Nav, NavItem } from \'your-ui-library\';');
    }
    
    return imports.join('\n');
  }
  
  /**
   * Generate Vue props
   * @param mapping Component mapping
   * @param useTypescript Whether to use TypeScript
   * @returns Props object
   */
  private generateVueProps(mapping: ComponentMapping, useTypescript: boolean): string {
    const props = [];
    
    // Add props based on component type
    if (mapping.edsComponent.type === 'button') {
      if (useTypescript) {
        props.push('    variant: { type: String as PropType<\'primary\' | \'secondary\' | \'outline\'>, default: \'primary\' },');
        props.push('    size: { type: String as PropType<\'sm\' | \'md\' | \'lg\'>, default: \'md\' },');
      } else {
        props.push('    variant: { type: String, default: \'primary\' },');
        props.push('    size: { type: String, default: \'md\' },');
      }
      props.push('    label: { type: String, default: \'Button\' },');
      props.push('    disabled: { type: Boolean, default: false },');
    } else if (mapping.edsComponent.type === 'input') {
      props.push('    type: { type: String, default: \'text\' },');
      props.push('    placeholder: { type: String, default: \'\' },');
      props.push('    modelValue: { type: String, default: \'\' },');
      props.push('    disabled: { type: Boolean, default: false },');
    } else if (mapping.edsComponent.type === 'card') {
      props.push('    title: { type: String, default: \'\' },');
      props.push('    withHeader: { type: Boolean, default: true },');
      props.push('    withFooter: { type: Boolean, default: false },');
    } else if (mapping.edsComponent.type === 'navigation') {
      if (useTypescript) {
        props.push('    items: { type: Array as PropType<Array<{ id: string; label: string }>>, default: () => [] },');
      } else {
        props.push('    items: { type: Array, default: () => [] },');
      }
      props.push('    activeItem: { type: String, default: null },');
    }
    
    return props.join('\n');
  }
  
  /**
   * Generate Vue options
   * @param mapping Component mapping
   * @returns Vue options
   */
  private generateVueOptions(mapping: ComponentMapping): string {
    const options = [];
    
    // Add options based on component type
    if (mapping.edsComponent.type === 'button') {
      options.push('  emits: [\'click\'],');
      options.push('  methods: {');
      options.push('    handleClick() {');
      options.push('      if (!this.disabled) {');
      options.push('        this.$emit(\'click\');');
      options.push('      }');
      options.push('    }');
      options.push('  }');
    } else if (mapping.edsComponent.type === 'input') {
      options.push('  emits: [\'update:modelValue\'],');
      options.push('  methods: {');
      options.push('    handleInput(event) {');
      options.push('      this.$emit(\'update:modelValue\', event.target.value);');
      options.push('    }');
      options.push('  }');
    } else if (mapping.edsComponent.type === 'navigation') {
      options.push('  emits: [\'item-click\'],');
      options.push('  data() {');
      options.push('    return {');
      options.push('      active: this.activeItem');
      options.push('    };');
      options.push('  },');
      options.push('  watch: {');
      options.push('    activeItem(newValue) {');
      options.push('      this.active = newValue;');
      options.push('    }');
      options.push('  },');
      options.push('  methods: {');
      options.push('    handleItemClick(id) {');
      options.push('      this.active = id;');
      options.push('      this.$emit(\'item-click\', id);');
      options.push('    }');
      options.push('  }');
    } else {
      options.push('  // Component options');
    }
    
    return options.join('\n');
  }
  
  /**
   * Generate Vue template
   * @param mapping Component mapping
   * @returns Vue template
   */
  private generateVueTemplate(mapping: ComponentMapping): string {
    // Generate template based on component type
    if (mapping.edsComponent.type === 'button') {
      return `<button 
  :class="['button', \`button--\${variant}\`, \`button--\${size}\`, { 'button--disabled': disabled }]"
  :disabled="disabled"
  @click="handleClick"
>
  {{ label }}
</button>`;
    } else if (mapping.edsComponent.type === 'input') {
      return `<input
  :type="type"
  :placeholder="placeholder"
  :value="modelValue"
  :disabled="disabled"
  @input="handleInput"
  class="input"
/>`;
    } else if (mapping.edsComponent.type === 'card') {
      return `<div class="card">
  <div v-if="withHeader && title" class="card-header">
    {{ title }}
  </div>
  <div class="card-content">
    <slot></slot>
  </div>
  <div v-if="withFooter" class="card-footer">
    <slot name="footer"></slot>
  </div>
</div>`;
    } else if (mapping.edsComponent.type === 'navigation') {
      return `<nav class="nav">
  <ul class="nav-list">
    <li 
      v-for="item in items" 
      :key="item.id"
      :class="['nav-item', { 'nav-item--active': item.id === active }]"
      @click="handleItemClick(item.id)"
    >
      {{ item.label }}
    </li>
  </ul>
</nav>`;
    } else {
      return `<div class="${this.toKebabCase(mapping.figmaComponent.name)}">
  <!-- ${mapping.figmaComponent.name} component content -->
  <slot></slot>
</div>`;
    }
  }
  
  /**
   * Generate Vue styles
   * @param mapping Component mapping
   * @returns Vue styles
   */
  private generateVueStyles(mapping: ComponentMapping): string {
    // Generate styles based on component type
    if (mapping.edsComponent.type === 'button') {
      return `.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
}

.button--primary {
  background-color: #3b82f6;
  color: white;
  border: none;
}

.button--secondary {
  background-color: #e5e7eb;
  color: #1f2937;
  border: none;
}

.button--outline {
  background-color: transparent;
  color: #3b82f6;
  border: 1px solid #3b82f6;
}

.button--sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.button--md {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
}

.button--lg {
  padding: 1rem 2rem;
  font-size: 1.125rem;
}

.button--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}`;
    } else if (mapping.edsComponent.type === 'input') {
      return `.input {
  display: block;
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  line-height: 1.5;
  color: #1f2937;
  background-color: #fff;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  transition: border-color 0.15s ease-in-out;
}

.input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.input:disabled {
  background-color: #f3f4f6;
  opacity: 0.7;
  cursor: not-allowed;
}`;
    } else if (mapping.edsComponent.type === 'card') {
      return `.card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  font-weight: 600;
  font-size: 1.125rem;
}

.card-content {
  padding: 1.5rem;
}

.card-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  background-color: #f9fafb;
}`;
    } else if (mapping.edsComponent.type === 'navigation') {
      return `.nav {
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.nav-list {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-item {
  padding: 1rem 1.5rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.nav-item:hover {
  background-color: #f3f4f6;
}

.nav-item--active {
  color: #3b82f6;
  font-weight: 500;
  border-bottom: 2px solid #3b82f6;
}`;
    } else {
      return `.${this.toKebabCase(mapping.figmaComponent.name)} {
  /* Component styles */
}`;
    }
  }

  // Angular-specific code generation methods
  
  /**
   * Generate Angular imports
   * @param mapping Component mapping
   * @returns Import statements
   */
  private generateAngularImports(mapping: ComponentMapping): string {
    const imports = [];
    
    // Add imports based on component type
    if (mapping.edsComponent.type === 'button') {
      imports.push('import { ButtonModule } from \'your-ui-library\';');
    } else if (mapping.edsComponent.type === 'input') {
      imports.push('import { InputModule } from \'your-ui-library\';');
    } else if (mapping.edsComponent.type === 'card') {
      imports.push('import { CardModule } from \'your-ui-library\';');
    } else if (mapping.edsComponent.type === 'navigation') {
      imports.push('import { NavModule } from \'your-ui-library\';');
    }
    
    return imports.join('\n');
  }
  
  /**
   * Generate Angular template
   * @param mapping Component mapping
   * @returns Angular template
   */
  private generateAngularTemplate(mapping: ComponentMapping): string {
    // Generate template based on component type
    if (mapping.edsComponent.type === 'button') {
      return `<button
  [ngClass]="['button', 'button--' + variant, 'button--' + size, { 'button--disabled': disabled }]"
  [disabled]="disabled"
  (click)="onClick.emit($event)"
>
  {{ label }}
</button>`;
    } else if (mapping.edsComponent.type === 'input') {
      return `<input
  [type]="type"
  [placeholder]="placeholder"
  [value]="value"
  [disabled]="disabled"
  (input)="onInput($event)"
  class="input"
/>`;
    } else if (mapping.edsComponent.type === 'card') {
      return `<div class="card">
  <div *ngIf="title" class="card-header">
    {{ title }}
  </div>
  <div class="card-content">
    <ng-content></ng-content>
  </div>
  <div *ngIf="withFooter" class="card-footer">
    <ng-content select="[footer]"></ng-content>
  </div>
</div>`;
    } else if (mapping.edsComponent.type === 'navigation') {
      return `<nav class="nav">
  <ul class="nav-list">
    <li 
      *ngFor="let item of items"
      [ngClass]="['nav-item', { 'nav-item--active': item.id === activeItem }]"
      (click)="handleItemClick(item.id)"
    >
      {{ item.label }}
    </li>
  </ul>
</nav>`;
    } else {
      return `<div class="${this.toKebabCase(mapping.figmaComponent.name)}">
  <!-- ${mapping.figmaComponent.name} component content -->
  <ng-content></ng-content>
</div>`;
    }
  }
  
  /**
   * Generate Angular inputs
   * @param mapping Component mapping
   * @returns Angular inputs
   */
  private generateAngularInputs(mapping: ComponentMapping): string {
    const inputs = [];
    
    // Add inputs based on component type
    if (mapping.edsComponent.type === 'button') {
      inputs.push('  @Input() variant: \'primary\' | \'secondary\' | \'outline\' = \'primary\';');
      inputs.push('  @Input() size: \'sm\' | \'md\' | \'lg\' = \'md\';');
      inputs.push('  @Input() label = \'Button\';');
      inputs.push('  @Input() disabled = false;');
    } else if (mapping.edsComponent.type === 'input') {
      inputs.push('  @Input() type = \'text\';');
      inputs.push('  @Input() placeholder = \'\';');
      inputs.push('  @Input() value = \'\';');
      inputs.push('  @Input() disabled = false;');
    } else if (mapping.edsComponent.type === 'card') {
      inputs.push('  @Input() title = \'\';');
      inputs.push('  @Input() withFooter = false;');
    } else if (mapping.edsComponent.type === 'navigation') {
      inputs.push('  @Input() items: { id: string; label: string }[] = [];');
      inputs.push('  @Input() activeItem: string | null = null;');
    }
    
    return inputs.join('\n');
  }
  
  /**
   * Generate Angular outputs
   * @param mapping Component mapping
   * @returns Angular outputs
   */
  private generateAngularOutputs(mapping: ComponentMapping): string {
    const outputs = [];
    
    // Add outputs based on component type
    if (mapping.edsComponent.type === 'button') {
      outputs.push('  @Output() onClick = new EventEmitter<MouseEvent>();');
    } else if (mapping.edsComponent.type === 'input') {
      outputs.push('  @Output() valueChange = new EventEmitter<string>();');
    } else if (mapping.edsComponent.type === 'navigation') {
      outputs.push('  @Output() itemClick = new EventEmitter<string>();');
    }
    
    return outputs.join('\n');
  }
  
  /**
   * Generate Angular methods
   * @param mapping Component mapping
   * @returns Angular methods
   */
  private generateAngularMethods(mapping: ComponentMapping): string {
    const methods = [];
    
    // Add methods based on component type
    if (mapping.edsComponent.type === 'input') {
      methods.push('  onInput(event: Event): void {');
      methods.push('    const target = event.target as HTMLInputElement;');
      methods.push('    this.valueChange.emit(target.value);');
      methods.push('  }');
    } else if (mapping.edsComponent.type === 'navigation') {
      methods.push('  handleItemClick(id: string): void {');
      methods.push('    this.activeItem = id;');
      methods.push('    this.itemClick.emit(id);');
      methods.push('  }');
    }
    
    return methods.join('\n');
  }

  // HTML-specific code generation methods
  
  /**
   * Generate HTML styles
   * @param mapping Component mapping
   * @returns HTML styles
   */
  private generateHTMLStyles(mapping: ComponentMapping): string {
    // Generate styles based on component type
    if (mapping.edsComponent.type === 'button') {
      return `.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  font-family: sans-serif;
}

.button-primary {
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 10px 20px;
}

.button-secondary {
  background-color: #e5e7eb;
  color: #1f2937;
  border: none;
  padding: 10px 20px;
}

.button-outline {
  background-color: transparent;
  color: #3b82f6;
  border: 1px solid #3b82f6;
  padding: 10px 20px;
}

.button-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}`;
    } else if (mapping.edsComponent.type === 'input') {
      return `.input-container {
  margin-bottom: 15px;
}

.input {
  display: block;
  width: 100%;
  padding: 10px 15px;
  font-size: 16px;
  line-height: 1.5;
  color: #1f2937;
  background-color: #fff;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-family: sans-serif;
}

.input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.input:disabled {
  background-color: #f3f4f6;
  opacity: 0.7;
  cursor: not-allowed;
}

.input-label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  font-family: sans-serif;
}`;
    } else if (mapping.edsComponent.type === 'card') {
      return `.card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  font-family: sans-serif;
  margin-bottom: 20px;
}

.card-header {
  padding: 15px 20px;
  border-bottom: 1px solid #e5e7eb;
  font-weight: 600;
  font-size: 18px;
}

.card-content {
  padding: 20px;
}

.card-footer {
  padding: 15px 20px;
  border-top: 1px solid #e5e7eb;
  background-color: #f9fafb;
}`;
    } else if (mapping.edsComponent.type === 'navigation') {
      return `.nav {
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  font-family: sans-serif;
}

.nav-list {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-item {
  padding: 15px 20px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.nav-item:hover {
  background-color: #f3f4f6;
}

.nav-item-active {
  color: #3b82f6;
  font-weight: 500;
  border-bottom: 2px solid #3b82f6;
}`;
    } else {
      return `.${this.toKebabCase(mapping.figmaComponent.name)} {
  /* Component styles */
  font-family: sans-serif;
}`;
    }
  }
  
  /**
   * Generate HTML body
   * @param mapping Component mapping
   * @returns HTML body
   */
  private generateHTMLBody(mapping: ComponentMapping): string {
    // Generate body based on component type
    if (mapping.edsComponent.type === 'button') {
      return `<button class="button button-primary" id="myButton">
  Button Text
</button>`;
    } else if (mapping.edsComponent.type === 'input') {
      return `<div class="input-container">
  <label for="myInput" class="input-label">Input Label</label>
  <input type="text" id="myInput" class="input" placeholder="Enter text...">
</div>`;
    } else if (mapping.edsComponent.type === 'card') {
      return `<div class="card">
  <div class="card-header">
    Card Title
  </div>
  <div class="card-content">
    <p>This is the card content. You can put any content here.</p>
  </div>
  <div class="card-footer">
    <button class="button button-primary">Action</button>
  </div>
</div>`;
    } else if (mapping.edsComponent.type === 'navigation') {
      return `<nav class="nav">
  <ul class="nav-list">
    <li class="nav-item nav-item-active" data-id="home">Home</li>
    <li class="nav-item" data-id="about">About</li>
    <li class="nav-item" data-id="services">Services</li>
    <li class="nav-item" data-id="contact">Contact</li>
  </ul>
</nav>`;
    } else {
      return `<div class="${this.toKebabCase(mapping.figmaComponent.name)}">
  <!-- ${mapping.figmaComponent.name} component content -->
  <p>This is a custom component.</p>
</div>`;
    }
  }
  
  /**
   * Generate HTML script
   * @param mapping Component mapping
   * @returns HTML script
   */
  private generateHTMLScript(mapping: ComponentMapping): string {
    // Generate script based on component type
    if (mapping.edsComponent.type === 'button') {
      return `document.getElementById('myButton').addEventListener('click', function() {
  alert('Button clicked!');
});`;
    } else if (mapping.edsComponent.type === 'input') {
      return `document.getElementById('myInput').addEventListener('input', function(e) {
  console.log('Input value:', e.target.value);
});`;
    } else if (mapping.edsComponent.type === 'navigation') {
      return `document.querySelectorAll('.nav-item').forEach(function(item) {
  item.addEventListener('click', function() {
    // Remove active class from all items
    document.querySelectorAll('.nav-item').forEach(function(i) {
      i.classList.remove('nav-item-active');
    });
    
    // Add active class to clicked item
    this.classList.add('nav-item-active');
    
    console.log('Navigation item clicked:', this.dataset.id);
  });
});`;
    } else {
      return `// JavaScript for ${mapping.figmaComponent.name} component
console.log('${mapping.figmaComponent.name} component loaded');`;
    }
  }

  // Layout-specific code generation methods
  
  /**
   * Generate layout React imports
   * @param mappings Component mappings
   * @param useTypescript Whether to use TypeScript
   * @returns Import statements
   */
  private generateLayoutReactImports(mappings: ComponentMapping[], useTypescript: boolean): string {
    const imports = ['import React from \'react\';'];
    
    // Add imports for each component
    mappings.forEach(mapping => {
      const componentName = this.formatComponentName(mapping.figmaComponent.name);
      imports.push(`import ${componentName} from './${componentName}';`);
    });
    
    return imports.join('\n');
  }
  
  /**
   * Generate layout React props
   * @param mappings Component mappings
   * @returns Props object
   */
  private generateLayoutReactProps(mappings: ComponentMapping[]): string {
    return '{ ...props }';
  }
  
  /**
   * Generate layout TypeScript props interface
   * @param mappings Component mappings
   * @returns Props interface
   */
  private generateLayoutTypeScriptProps(mappings: ComponentMapping[]): string {
    return '  // Layout props\n  [key: string]: any;';
  }
  
  /**
   * Generate layout destructured props
   * @param mappings Component mappings
   * @returns Destructured props
   */
  private generateLayoutDestructuredProps(mappings: ComponentMapping[]): string {
    return '  ...props';
  }
  
  /**
   * Generate layout React hooks
   * @param mappings Component mappings
   * @returns Hooks code
   */
  private generateLayoutReactHooks(mappings: ComponentMapping[]): string {
    return '// No hooks needed for this layout component';
  }
  
  /**
   * Generate layout React JSX
   * @param mappings Component mappings
   * @returns JSX code
   */
  private generateLayoutReactJSX(mappings: ComponentMapping[]): string {
    const jsx = ['<div className="layout">'];
    
    // Add each component to the layout
    mappings.forEach(mapping => {
      const componentName = this.formatComponentName(mapping.figmaComponent.name);
      jsx.push(`  <${componentName} />`);
    });
    
    jsx.push('</div>');
    
    return jsx.join('\n');
  }
  
  /**
   * Generate layout Vue imports
   * @param mappings Component mappings
   * @param useTypescript Whether to use TypeScript
   * @returns Import statements
   */
  private generateLayoutVueImports(mappings: ComponentMapping[], useTypescript: boolean): string {
    const imports = [];
    
    // Add imports for each component
    mappings.forEach(mapping => {
      const componentName = this.formatComponentName(mapping.figmaComponent.name);
      imports.push(`import ${componentName} from './${componentName}.vue';`);
    });
    
    return imports.join('\n');
  }
  
  /**
   * Generate layout Vue props
   * @param mappings Component mappings
   * @param useTypescript Whether to use TypeScript
   * @returns Props object
   */
  private generateLayoutVueProps(mappings: ComponentMapping[], useTypescript: boolean): string {
    return '    // Layout props';
  }
  
  /**
   * Generate layout Vue options
   * @param mappings Component mappings
   * @returns Vue options
   */
  private generateLayoutVueOptions(mappings: ComponentMapping[]): string {
    const options = ['  components: {'];
    
    // Add each component
    mappings.forEach(mapping => {
      const componentName = this.formatComponentName(mapping.figmaComponent.name);
      options.push(`    ${componentName},`);
    });
    
    options.push('  }');
    
    return options.join('\n');
  }
  
  /**
   * Generate layout Vue template
   * @param mappings Component mappings
   * @returns Vue template
   */
  private generateLayoutVueTemplate(mappings: ComponentMapping[]): string {
    const template = ['<div class="layout">'];
    
    // Add each component to the template
    mappings.forEach(mapping => {
      const componentName = this.formatComponentName(mapping.figmaComponent.name);
      const kebabName = this.toKebabCase(componentName);
      template.push(`  <${kebabName} />`);
    });
    
    template.push('</div>');
    
    return template.join('\n');
  }
  
  /**
   * Generate layout Vue styles
   * @param mappings Component mappings
   * @returns Vue styles
   */
  private generateLayoutVueStyles(mappings: ComponentMapping[]): string {
    return `.layout {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
}`;
  }
  
  /**
   * Generate layout Angular imports
   * @param mappings Component mappings
   * @returns Import statements
   */
  private generateLayoutAngularImports(mappings: ComponentMapping[]): string {
    const imports = [];
    
    // Add imports for each component
    mappings.forEach(mapping => {
      const componentName = this.formatComponentName(mapping.figmaComponent.name);
      imports.push(`import { ${componentName}Component } from './${this.toKebabCase(componentName)}/${this.toKebabCase(componentName)}.component';`);
    });
    
    return imports.join('\n');
  }
  
  /**
   * Generate layout Angular template
   * @param mappings Component mappings
   * @returns Angular template
   */
  private generateLayoutAngularTemplate(mappings: ComponentMapping[]): string {
    const template = ['<div class="layout">'];
    
    // Add each component to the template
    mappings.forEach(mapping => {
      const componentName = this.formatComponentName(mapping.figmaComponent.name);
      const selector = `app-${this.toKebabCase(componentName)}`;
      template.push(`  <${selector}></${selector}>`);
    });
    
    template.push('</div>');
    
    return template.join('\n');
  }
  
  /**
   * Generate layout Angular inputs
   * @param mappings Component mappings
   * @returns Angular inputs
   */
  private generateLayoutAngularInputs(mappings: ComponentMapping[]): string {
    return '  // Layout inputs';
  }
  
  /**
   * Generate layout Angular outputs
   * @param mappings Component mappings
   * @returns Angular outputs
   */
  private generateLayoutAngularOutputs(mappings: ComponentMapping[]): string {
    return '  // Layout outputs';
  }
  
  /**
   * Generate layout Angular methods
   * @param mappings Component mappings
   * @returns Angular methods
   */
  private generateLayoutAngularMethods(mappings: ComponentMapping[]): string {
    return '  // Layout methods';
  }
  
  /**
   * Generate layout HTML styles
   * @param mappings Component mappings
   * @returns HTML styles
   */
  private generateLayoutHTMLStyles(mappings: ComponentMapping[]): string {
    return `.layout {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  font-family: sans-serif;
}`;
  }
  
  /**
   * Generate layout HTML body
   * @param mappings Component mappings
   * @returns HTML body
   */
  private generateLayoutHTMLBody(mappings: ComponentMapping[]): string {
    const body = ['<div class="layout">'];
    
    // Add each component to the body
    mappings.forEach(mapping => {
      const componentName = this.toKebabCase(mapping.figmaComponent.name);
      body.push(`  <div class="${componentName}">
    <!-- ${mapping.figmaComponent.name} component -->
  </div>`);
    });
    
    body.push('</div>');
    
    return body.join('\n');
  }
  
  /**
   * Generate layout HTML script
   * @param mappings Component mappings
   * @returns HTML script
   */
  private generateLayoutHTMLScript(mappings: ComponentMapping[]): string {
    return `// JavaScript for layout
console.log('Layout loaded with ${mappings.length} components');`;
  }
}
