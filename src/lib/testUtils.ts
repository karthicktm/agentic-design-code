// src/lib/testUtils.ts

/**
 * Test utilities for the Figma-to-Code application
 * 
 * This file contains helper functions and mock data for testing the application
 */

import { 
  FigmaDesign, 
  FigmaNode, 
  FigmaComponent, 
  FigmaStyle,
  ComponentPattern,
  EDSComponent,
  EDSLibrary,
  ComponentMapping
} from './agents';

/**
 * Generate mock Figma design data for testing
 */
export const generateMockFigmaDesign = (): FigmaDesign => {
  return {
    id: 'mock-design-1',
    name: 'Test Design',
    document: {
      id: 'doc-1',
      name: 'Document',
      type: 'DOCUMENT',
      children: [
        {
          id: 'page-1',
          name: 'Page 1',
          type: 'CANVAS',
          children: []
        }
      ]
    },
    version: '1.0',
    lastModified: new Date().toISOString(),
    thumbnailUrl: '',
    schemaVersion: 0
  };
};

/**
 * Generate mock Figma nodes for testing
 */
export const generateMockFigmaNodes = (): FigmaNode[] => {
  return [
    {
      id: 'node-1',
      name: 'Button',
      type: 'COMPONENT',
      children: [
        {
          id: 'node-1-1',
          name: 'Label',
          type: 'TEXT',
          characters: 'Button',
          style: {
            fontFamily: 'Inter',
            fontSize: 16,
            fontWeight: 500,
            textAlignHorizontal: 'CENTER',
            textAlignVertical: 'CENTER'
          },
          parent: 'node-1'
        }
      ],
      parent: 'page-1',
      absoluteBoundingBox: { x: 0, y: 0, width: 120, height: 40 },
      styles: {
        fill: 'style-1',
        text: 'style-2'
      }
    },
    {
      id: 'node-2',
      name: 'Input Field',
      type: 'COMPONENT',
      children: [
        {
          id: 'node-2-1',
          name: 'Placeholder',
          type: 'TEXT',
          characters: 'Enter text...',
          style: {
            fontFamily: 'Inter',
            fontSize: 14,
            fontWeight: 400,
            textAlignHorizontal: 'LEFT',
            textAlignVertical: 'CENTER'
          },
          parent: 'node-2'
        }
      ],
      parent: 'page-1',
      absoluteBoundingBox: { x: 0, y: 50, width: 240, height: 40 },
      styles: {
        fill: 'style-3',
        stroke: 'style-4'
      }
    },
    {
      id: 'node-3',
      name: 'Card',
      type: 'COMPONENT',
      children: [
        {
          id: 'node-3-1',
          name: 'Title',
          type: 'TEXT',
          characters: 'Card Title',
          style: {
            fontFamily: 'Inter',
            fontSize: 18,
            fontWeight: 600,
            textAlignHorizontal: 'LEFT',
            textAlignVertical: 'CENTER'
          },
          parent: 'node-3'
        },
        {
          id: 'node-3-2',
          name: 'Content',
          type: 'RECTANGLE',
          parent: 'node-3',
          absoluteBoundingBox: { x: 10, y: 40, width: 280, height: 100 },
          styles: {
            fill: 'style-5'
          }
        }
      ],
      parent: 'page-1',
      absoluteBoundingBox: { x: 0, y: 100, width: 300, height: 200 },
      styles: {
        fill: 'style-6',
        effect: 'style-7'
      }
    }
  ];
};

/**
 * Generate mock Figma components for testing
 */
export const generateMockFigmaComponents = (): FigmaComponent[] => {
  return [
    {
      id: 'component-1',
      name: 'Button',
      type: 'COMPONENT',
      nodeId: 'node-1',
      description: 'A standard button component',
      properties: {
        variant: 'primary',
        size: 'medium',
        label: 'Button'
      }
    },
    {
      id: 'component-2',
      name: 'Input Field',
      type: 'COMPONENT',
      nodeId: 'node-2',
      description: 'A text input field',
      properties: {
        placeholder: 'Enter text...',
        disabled: false
      }
    },
    {
      id: 'component-3',
      name: 'Card',
      type: 'COMPONENT',
      nodeId: 'node-3',
      description: 'A card container',
      properties: {
        title: 'Card Title',
        withShadow: true
      }
    }
  ];
};

/**
 * Generate mock Figma styles for testing
 */
export const generateMockFigmaStyles = (): Record<string, FigmaStyle> => {
  return {
    'style-1': {
      id: 'style-1',
      name: 'Primary/Blue',
      type: 'FILL',
      description: 'Primary blue color',
      value: {
        color: { r: 0.2, g: 0.4, b: 0.8, a: 1 }
      }
    },
    'style-2': {
      id: 'style-2',
      name: 'Text/White',
      type: 'TEXT',
      description: 'White text',
      value: {
        fontFamily: 'Inter',
        fontSize: 16,
        fontWeight: 500,
        color: { r: 1, g: 1, b: 1, a: 1 }
      }
    },
    'style-3': {
      id: 'style-3',
      name: 'Background/White',
      type: 'FILL',
      description: 'White background',
      value: {
        color: { r: 1, g: 1, b: 1, a: 1 }
      }
    },
    'style-4': {
      id: 'style-4',
      name: 'Border/Gray',
      type: 'STROKE',
      description: 'Gray border',
      value: {
        color: { r: 0.8, g: 0.8, b: 0.8, a: 1 },
        width: 1
      }
    },
    'style-5': {
      id: 'style-5',
      name: 'Background/Light Gray',
      type: 'FILL',
      description: 'Light gray background',
      value: {
        color: { r: 0.95, g: 0.95, b: 0.95, a: 1 }
      }
    },
    'style-6': {
      id: 'style-6',
      name: 'Background/White',
      type: 'FILL',
      description: 'White background',
      value: {
        color: { r: 1, g: 1, b: 1, a: 1 }
      }
    },
    'style-7': {
      id: 'style-7',
      name: 'Shadow/Medium',
      type: 'EFFECT',
      description: 'Medium shadow',
      value: {
        type: 'DROP_SHADOW',
        color: { r: 0, g: 0, b: 0, a: 0.1 },
        offset: { x: 0, y: 2 },
        radius: 4,
        spread: 0
      }
    }
  };
};

/**
 * Generate mock component patterns for testing
 */
export const generateMockComponentPatterns = (): ComponentPattern[] => {
  return [
    {
      id: 'pattern-1',
      name: 'Button Pattern',
      type: 'button',
      confidence: 0.95,
      componentIds: ['component-1'],
      description: 'Standard button pattern with label',
      properties: {
        hasLabel: true,
        hasIcon: false,
        isInteractive: true
      }
    },
    {
      id: 'pattern-2',
      name: 'Input Pattern',
      type: 'input',
      confidence: 0.9,
      componentIds: ['component-2'],
      description: 'Text input field with placeholder',
      properties: {
        hasPlaceholder: true,
        hasLabel: false,
        isInteractive: true
      }
    },
    {
      id: 'pattern-3',
      name: 'Card Pattern',
      type: 'card',
      confidence: 0.85,
      componentIds: ['component-3'],
      description: 'Card container with title and content',
      properties: {
        hasTitle: true,
        hasContent: true,
        hasShadow: true
      }
    }
  ];
};

/**
 * Generate mock EDS library for testing
 */
export const generateMockEDSLibrary = (): EDSLibrary => {
  return {
    name: 'Test EDS Library',
    version: '1.0.0',
    description: 'A test EDS library for development',
    components: generateMockEDSComponents()
  };
};

/**
 * Generate mock EDS components for testing
 */
export const generateMockEDSComponents = (): EDSComponent[] => {
  return [
    {
      id: 'eds-button',
      name: 'Button',
      type: 'button',
      description: 'A customizable button component',
      properties: {
        variant: ['primary', 'secondary', 'outline'],
        size: ['sm', 'md', 'lg'],
        disabled: false,
        label: 'Button'
      },
      variants: [
        { name: 'Primary Button', properties: { variant: 'primary' } },
        { name: 'Secondary Button', properties: { variant: 'secondary' } },
        { name: 'Outline Button', properties: { variant: 'outline' } }
      ],
      tags: ['interactive', 'form', 'action'],
      category: 'inputs'
    },
    {
      id: 'eds-input',
      name: 'Input',
      type: 'input',
      description: 'A text input field component',
      properties: {
        placeholder: 'Enter text...',
        type: ['text', 'password', 'email', 'number'],
        disabled: false,
        required: false
      },
      variants: [
        { name: 'Text Input', properties: { type: 'text' } },
        { name: 'Password Input', properties: { type: 'password' } }
      ],
      tags: ['interactive', 'form', 'input'],
      category: 'inputs'
    },
    {
      id: 'eds-card',
      name: 'Card',
      type: 'card',
      description: 'A card container component',
      properties: {
        withHeader: true,
        withFooter: false,
        elevation: [0, 1, 2, 3],
        padding: ['none', 'sm', 'md', 'lg']
      },
      variants: [
        { name: 'Basic Card', properties: { elevation: 1, padding: 'md' } },
        { name: 'Elevated Card', properties: { elevation: 3, padding: 'md' } }
      ],
      tags: ['container', 'layout'],
      category: 'containers'
    }
  ];
};

/**
 * Generate mock component mappings for testing
 */
export const generateMockComponentMappings = (): ComponentMapping[] => {
  return [
    {
      id: 'mapping-1',
      figmaComponent: generateMockFigmaComponents()[0],
      edsComponent: generateMockEDSComponents()[0],
      patternType: 'button',
      confidence: 0.95,
      propertyMappings: [
        {
          figmaProperty: 'variant',
          edsProperty: 'variant',
          value: 'primary',
          confidence: 0.9
        },
        {
          figmaProperty: 'size',
          edsProperty: 'size',
          value: 'md',
          confidence: 0.85
        },
        {
          figmaProperty: 'label',
          edsProperty: 'label',
          value: 'Button',
          confidence: 1.0
        }
      ],
      matchedNodes: ['node-1']
    },
    {
      id: 'mapping-2',
      figmaComponent: generateMockFigmaComponents()[1],
      edsComponent: generateMockEDSComponents()[1],
      patternType: 'input',
      confidence: 0.9,
      propertyMappings: [
        {
          figmaProperty: 'placeholder',
          edsProperty: 'placeholder',
          value: 'Enter text...',
          confidence: 1.0
        },
        {
          figmaProperty: 'disabled',
          edsProperty: 'disabled',
          value: false,
          confidence: 1.0
        }
      ],
      matchedNodes: ['node-2']
    },
    {
      id: 'mapping-3',
      figmaComponent: generateMockFigmaComponents()[2],
      edsComponent: generateMockEDSComponents()[2],
      patternType: 'card',
      confidence: 0.85,
      propertyMappings: [
        {
          figmaProperty: 'title',
          edsProperty: 'withHeader',
          value: true,
          confidence: 0.9
        },
        {
          figmaProperty: 'withShadow',
          edsProperty: 'elevation',
          value: 2,
          confidence: 0.8
        }
      ],
      matchedNodes: ['node-3']
    }
  ];
};

/**
 * Generate mock code generation result for testing
 */
export const generateMockCodeGenerationResult = (): any => {
  return {
    success: true,
    message: 'Code generation completed successfully',
    components: [
      {
        id: 'component-1',
        name: 'Button',
        code: `import React from 'react';

/**
 * Button Component
 * A standard button component
 */
const Button = ({ 
  variant = 'primary', 
  size = 'md', 
  label = 'Button', 
  onClick, 
  disabled = false,
  ...rest 
}) => {
  return (
    <button
      className={\`button button--\${variant} button--\${size} \${disabled ? 'button--disabled' : ''}\`}
      onClick={onClick}
      disabled={disabled}
      {...rest}
    >
      {label}
    </button>
  );
};

export default Button;`,
        language: 'javascript',
        success: true
      },
      {
        id: 'component-2',
        name: 'Input',
        code: `import React from 'react';

/**
 * Input Component
 * A text input field
 */
const Input = ({ 
  type = 'text', 
  placeholder = 'Enter text...', 
  value = '', 
  onChange, 
  disabled = false,
  ...rest 
}) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className="input"
      {...rest}
    />
  );
};

export default Input;`,
        language: 'javascript',
        success: true
      },
      {
        id: 'component-3',
        name: 'Card',
        code: `import React from 'react';

/**
 * Card Component
 * A card container
 */
const Card = ({ 
  title = '', 
  children, 
  elevation = 1,
  ...rest 
}) => {
  return (
    <div className={\`card card--elevation-\${elevation}\`} {...rest}>
      {title && <div className="card-header">{title}</div>}
      <div className="card-content">
        {children}
      </div>
    </div>
  );
};

export default Card;`,
        language: 'javascript',
        success: true
      }
    ],
    layout: {
      name: 'Layout',
      code: `import React from 'react';
import Button from './Button';
import Input from './Input';
import Card from './Card';

/**
 * Layout Component
 * Layout component that combines multiple components
 */
const Layout = ({ ...props }) => {
  return (
    <div className="layout">
      <Card title="Sample Form">
        <Input placeholder="Enter your name" />
        <div className="button-container">
          <Button label="Submit" variant="primary" />
          <Button label="Cancel" variant="outline" />
        </div>
      </Card>
    </div>
  );
};

export default Layout;`,
      language: 'javascript',
      success: true
    },
    framework: 'react',
    timestamp: new Date().toISOString()
  };
};
