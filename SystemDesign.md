# Figma-to-Code System User Manual

## Introduction

Welcome to the Figma-to-Code system! This application allows you to convert your Figma designs into production-ready code for various frontend frameworks. The system uses a multi-agent architecture to analyze your designs, map components to your Custom Library, and generate optimized code.

## Getting Started

### System Requirements

To use the Figma-to-Code system, you need:
- A modern web browser (Chrome, Firefox, Safari, or Edge)
- A Figma account (for API access)
- Your Custom Library (Custom Library) library in JSON format

## Step-by-Step Guide

### 1. Import Figma Design

1. From the dashboard, click on "Import Figma Design" or navigate to the Figma Import page from the sidebar.
2. Choose one of the import methods:
   - **Figma API**: Enter your Figma API key and file URL
   - **File Upload**: Upload a Figma JSON file exported from Figma
3. Click "Import Design" to start the import process.
4. Once imported, you'll see a preview of your design with a component tree on the left.

### 2. Import Custom Library Library

1. Navigate to the Custom Library Library page from the sidebar.
2. Choose one of the import methods:
   - **URL Import**: Enter the URL of your Custom Library library
   - **File Upload**: Upload a JSON, JavaScript, or TypeScript file containing your library
3. Click "Import Library" to start the import process.
4. Once imported, you can browse the library components and their properties.

### 3. Analyze Design

1. Navigate to the Design Analyzer page from the sidebar.
2. Click "Start Analysis" to begin analyzing your Figma design.
3. The system will detect patterns, validate styles, and identify potential issues.
4. Review the analysis results, which include:
   - Detected components and patterns
   - Style validation results
   - Suggestions for improvements

### 4. Map Components

1. Navigate to the Component Mapping page from the sidebar.
2. The system will display Figma components on the left and Custom Library components on the right.
3. For each Figma component:
   - Select the corresponding Custom Library component from the dropdown
   - Map properties between the components
   - Adjust confidence scores if needed
4. Click "Save Mappings" to save your component mappings.

### 5. Generate Code

1. Navigate to the Code Generation page from the sidebar.
2. Configure the code generation settings:
   - **Target Framework**: Select React, Vue, or Angular
   - **Styling Approach**: Select Tailwind CSS, Styled Components, or CSS Modules
   - **Prompt Template**: Customize the prompt for code generation if needed
3. Click "Generate Code" to start the code generation process.
4. Once generated, you can view and copy the code.

### 6. Validate and Preview Code

1. Navigate to the Code Validator page from the sidebar.
2. The system will display the generated code in an editor.
3. Click "Validate Code" to check for syntax and style issues.
4. Review the validation results and make any necessary changes.
5. Click "Run Preview" to see a live preview of your component.
6. Click "Download Code" to download the final code.

## Features and Capabilities

### Figma Import Features

- Support for Figma API and file upload
- Component tree visualization
- Property inspection
- Design preview

### Custom Library Library Features

- Support for multiple import methods
- Component browser with search and filtering
- Property inspection
- Component preview

### Design Analyzer Features

- Pattern detection
- Style validation
- Accessibility checking
- Suggestions for improvements

### Component Mapping Features

- Visual mapping interface
- Property mapping
- Confidence scoring
- Bulk mapping options

### Code Generation Features

- Support for multiple frameworks (React, Vue, Angular)
- Support for multiple styling approaches
- Customizable prompt templates
- Syntax highlighting

### Code Validator Features

- Syntax checking
- Style checking
- Responsiveness testing
- Live preview

## Tips and Best Practices

1. **Organize Your Figma File**: Well-organized Figma files with proper naming conventions lead to better code generation.
2. **Use Components in Figma**: The system works best with Figma components rather than loose elements.
3. **Consistent Styling**: Use consistent styles in your Figma design for better mapping to your Custom Library.
4. **Review Mappings**: Always review the component mappings before generating code.
5. **Validate Generated Code**: Always validate the generated code and make necessary adjustments.

## Troubleshooting

### Common Issues

1. **Figma Import Fails**:
   - Ensure your API key has the correct permissions
   - Check that the file URL is correct
   - Try exporting the file as JSON and using the file upload method

2. **Custom Library Library Import Fails**:
   - Ensure the library file is in the correct format
   - Check for any syntax errors in the JSON file
   - Try a different import method

3. **Component Mapping Issues**:
   - Ensure both Figma and Custom Library components are properly imported
   - Check for naming inconsistencies
   - Try mapping at a higher level of the component hierarchy

4. **Code Generation Issues**:
   - Ensure all required components are mapped
   - Try a different framework or styling approach
   - Adjust the prompt template for better results

5. **Preview Issues**:
   - Check for any syntax errors in the generated code
   - Ensure all dependencies are properly referenced
   - Try a different browser if the preview doesn't render correctly
