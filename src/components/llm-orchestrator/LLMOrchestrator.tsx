import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Code, RefreshCw, Copy, Check, Wand2 } from 'lucide-react';
import Editor from '@monaco-editor/react';

interface LLMOrchestratorProps {
  mappings: any[] | null;
}

const LLMOrchestrator: React.FC<LLMOrchestratorProps> = ({ mappings }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedFramework, setSelectedFramework] = useState('react');
  const [selectedStyle, setSelectedStyle] = useState('tailwind');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [promptTemplate, setPromptTemplate] = useState(
    `Generate a UI component based on the following specifications:
- Framework: {framework}
- Styling: {styling}
- Component structure: {component_structure}
- Properties: {properties}

The component should follow best practices for the selected framework and styling approach.
`
  );
  const [copied, setCopied] = useState(false);
  
  const handleGenerateCode = async () => {
    if (!mappings || mappings.length === 0) return;
    
    setIsGenerating(true);
    
    try {
      // In a real implementation, this would call the LLM service
      console.log('Generating code with framework:', selectedFramework, 'and style:', selectedStyle);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Generate mock code based on selected framework
      const mockCode = generateMockCode(selectedFramework, selectedStyle);
      setGeneratedCode(mockCode);
      
      // Handle success
      console.log('Code generated successfully');
    } catch (error) {
      console.error('Error generating code:', error);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const generateMockCode = (framework: string, style: string): string => {
    if (framework === 'react') {
      if (style === 'tailwind') {
        return `import React from 'react';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  disabled = false,
  onClick,
}) => {
  const baseClasses = "rounded font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variantClasses = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500",
    outline: "border border-gray-300 bg-transparent hover:bg-gray-50 focus:ring-gray-500"
  };
  
  const sizeClasses = {
    sm: "py-1 px-3 text-sm",
    md: "py-2 px-4 text-base",
    lg: "py-3 px-6 text-lg"
  };
  
  const classes = \`\${baseClasses} \${variantClasses[variant]} \${sizeClasses[size]}\`;
  
  return (
    <button
      className={classes}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button;`;
      } else {
        return `import React from 'react';
import styled from 'styled-components';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}

const StyledButton = styled.button<{
  variant: 'primary' | 'secondary' | 'outline';
  size: 'sm' | 'md' | 'lg';
}>\`
  border-radius: 4px;
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: \${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: \${props => props.disabled ? 0.6 : 1};
  
  /* Variant styles */
  background-color: \${props => {
    switch (props.variant) {
      case 'primary':
        return '#3B82F6';
      case 'secondary':
        return '#E5E7EB';
      case 'outline':
        return 'transparent';
    }
  }};
  
  color: \${props => {
    switch (props.variant) {
      case 'primary':
        return '#FFFFFF';
      case 'secondary':
      case 'outline':
        return '#111827';
    }
  }};
  
  border: \${props => props.variant === 'outline' ? '1px solid #D1D5DB' : 'none'};
  
  /* Size styles */
  padding: \${props => {
    switch (props.size) {
      case 'sm':
        return '0.25rem 0.75rem';
      case 'md':
        return '0.5rem 1rem';
      case 'lg':
        return '0.75rem 1.5rem';
    }
  }};
  
  font-size: \${props => {
    switch (props.size) {
      case 'sm':
        return '0.875rem';
      case 'md':
        return '1rem';
      case 'lg':
        return '1.125rem';
    }
  }};
  
  &:hover:not(:disabled) {
    background-color: \${props => {
      switch (props.variant) {
        case 'primary':
          return '#2563EB';
        case 'secondary':
          return '#D1D5DB';
        case 'outline':
          return '#F3F4F6';
      }
    }};
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px \${props => {
      switch (props.variant) {
        case 'primary':
          return 'rgba(59, 130, 246, 0.5)';
        case 'secondary':
        case 'outline':
          return 'rgba(209, 213, 219, 0.5)';
      }
    }};
  }
\`;

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  disabled = false,
  onClick,
}) => {
  return (
    <StyledButton
      variant={variant}
      size={size}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </StyledButton>
  );
};

export default Button;`;
      }
    } else if (framework === 'vue') {
      return `<template>
  <button
    :class="[
      'button',
      \`button--\${variant}\`,
      \`button--\${size}\`,
      { 'button--disabled': disabled }
    ]"
    :disabled="disabled"
    @click="onClick"
  >
    <slot></slot>
  </button>
</template>

<script>
export default {
  name: 'Button',
  props: {
    variant: {
      type: String,
      default: 'primary',
      validator: (value) => ['primary', 'secondary', 'outline'].includes(value)
    },
    size: {
      type: String,
      default: 'md',
      validator: (value) => ['sm', 'md', 'lg'].includes(value)
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    onClick() {
      this.$emit('click');
    }
  }
}
</script>

<style scoped>
.button {
  border-radius: 4px;
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;
}

.button--disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Variant styles */
.button--primary {
  background-color: #3B82F6;
  color: white;
  border: none;
}

.button--primary:hover:not(.button--disabled) {
  background-color: #2563EB;
}

.button--secondary {
  background-color: #E5E7EB;
  color: #111827;
  border: none;
}

.button--secondary:hover:not(.button--disabled) {
  background-color: #D1D5DB;
}

.button--outline {
  background-color: transparent;
  color: #111827;
  border: 1px solid #D1D5DB;
}

.button--outline:hover:not(.button--disabled) {
  background-color: #F3F4F6;
}

/* Size styles */
.button--sm {
  padding: 0.25rem 0.75rem;
  font-size: 0.875rem;
}

.button--md {
  padding: 0.5rem 1rem;
  font-size: 1rem;
}

.button--lg {
  padding: 0.75rem 1.5rem;
  font-size: 1.125rem;
}

.button:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5);
}
</style>`;
    } else {
      return `import { Component, Input, Output, EventEmitter } from '@angular/core';

type ButtonVariant = 'primary' | 'secondary' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-button',
  template: \`
    <button
      [ngClass]="[
        'button',
        'button--' + variant,
        'button--' + size,
        { 'button--disabled': disabled }
      ]"
      [disabled]="disabled"
      (click)="onClick()"
    >
      <ng-content></ng-content>
    </button>
  \`,
  styles: [\`
    .button {
      border-radius: 4px;
      font-weight: 500;
      transition: all 0.2s ease;
      cursor: pointer;
    }
    
    .button--disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    /* Variant styles */
    .button--primary {
      background-color: #3B82F6;
      color: white;
      border: none;
    }
    
    .button--primary:hover:not(.button--disabled) {
      background-color: #2563EB;
    }
    
    .button--secondary {
      background-color: #E5E7EB;
      color: #111827;
      border: none;
    }
    
    .button--secondary:hover:not(.button--disabled) {
      background-color: #D1D5DB;
    }
    
    .button--outline {
      background-color: transparent;
      color: #111827;
      border: 1px solid #D1D5DB;
    }
    
    .button--outline:hover:not(.button--disabled) {
      background-color: #F3F4F6;
    }
    
    /* Size styles */
    .button--sm {
      padding: 0.25rem 0.75rem;
      font-size: 0.875rem;
    }
    
    .button--md {
      padding: 0.5rem 1rem;
      font-size: 1rem;
    }
    
    .button--lg {
      padding: 0.75rem 1.5rem;
      font-size: 1.125rem;
    }
    
    .button:focus {
      outline: none;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5);
    }
  \`]
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'md';
  @Input() disabled: boolean = false;
  @Output() buttonClick = new EventEmitter<void>();
  
  onClick(): void {
    if (!this.disabled) {
      this.buttonClick.emit();
    }
  }
}`;
    }
  };
  
  const handleCopyCode = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  const handleRegenerateCode = () => {
    handleGenerateCode();
  };
  
  if (!mappings || mappings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Code Generation</CardTitle>
          <CardDescription>Generate code from component mappings</CardDescription>
        </CardHeader>
        <CardContent className="h-96 flex items-center justify-center">
          <p className="text-muted-foreground">
            Please create component mappings first
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Code Generation Settings</CardTitle>
          <CardDescription>Configure code generation options</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Target Framework</label>
                <Select 
                  value={selectedFramework} 
                  onValueChange={setSelectedFramework}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select framework" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="react">React</SelectItem>
                    <SelectItem value="vue">Vue</SelectItem>
                    <SelectItem value="angular">Angular</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  The frontend framework to generate code for
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium">Styling Approach</label>
                <Select 
                  value={selectedStyle} 
                  onValueChange={setSelectedStyle}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select styling approach" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tailwind">Tailwind CSS</SelectItem>
                    <SelectItem value="styled">Styled Components</SelectItem>
                    <SelectItem value="css">CSS Modules</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  The styling approach to use in the generated code
                </p>
              </div>
              
              <div>
                <Button 
                  onClick={handleGenerateCode} 
                  disabled={isGenerating}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="mr-2 h-4 w-4" />
                      Generate Code
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium">Prompt Template</label>
              <Textarea 
                value={promptTemplate}
                onChange={(e) => setPromptTemplate(e.target.value)}
                className="h-[180px] font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Customize the prompt template for code generation
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {generatedCode && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Generated Code</CardTitle>
                <CardDescription>
                  {selectedFramework.charAt(0).toUpperCase() + selectedFramework.slice(1)} component with {selectedStyle} styling
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleRegenerateCode}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Regenerate
                </Button>
                <Button variant="outline" size="sm" onClick={handleCopyCode}>
                  {copied ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Code
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[500px] border-t">
              <Editor
                height="500px"
                language={
                  selectedFramework === 'vue' 
                    ? 'html' 
                    : selectedFramework === 'angular' 
                      ? 'typescript' 
                      : 'typescript'
                }
                value={generatedCode}
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  fontSize: 14,
                }}
                theme="vs-dark"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LLMOrchestrator;
