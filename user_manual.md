# Figma-to-Code User Manual

## Introduction

Welcome to the Figma-to-Code system! This tool allows you to convert your Figma designs into production-ready frontend code by using a multi-agent approach that handles everything from parsing Figma files to generating and validating code.

This user manual will guide you through the process of using the system, from installation to generating your first code from a Figma design.

## Getting Started

### Installation

1. **Prerequisites**:
   - Node.js 18.0.0 or higher
   - npm or pnpm package manager

2. **Installation Steps**:
   ```bash
   # Clone the repository (if applicable)
   git clone https://github.com/your-organization/figma-to-code.git
   cd figma-to-code

   # Install dependencies
   npm install
   # or
   pnpm install

   # Start the development server
   npm run dev
   # or
   pnpm dev
   ```

3. **Access the Application**:
   - Open your browser and navigate to http://localhost:3000
   - You should see the Figma-to-Code dashboard

## Using the Application

The application guides you through a step-by-step workflow to convert your Figma designs to code:

### Step 1: Figma Import

1. Navigate to the "Figma Import" section from the dashboard
2. Choose one of the following methods:
   - **Upload Figma JSON**: Click "Choose File" and select your exported Figma JSON file
   - **Use Figma API**: Enter your Figma API token and file ID, then click "Fetch Design"
3. Wait for the import to complete
4. Review the imported design structure in the preview panel
5. Click "Continue" to proceed to the next step

**Tips**:
- To export a Figma file as JSON, open your design in Figma, right-click on the canvas, and select "Copy/Paste as" > "Copy as JSON"
- For large Figma files, the JSON method is recommended for better performance

### Step 2: Design Analysis

1. Review the design information displayed in the analysis panel
2. Click "Analyze Design" to start the analysis process
3. The system will detect component patterns, validate styles, and extract metadata
4. Review the detected patterns and style issues
5. Click "Continue" to proceed to the next step

**What to Look For**:
- **Component Patterns**: Check if the system correctly identified buttons, inputs, cards, etc.
- **Style Issues**: Review any inconsistencies in colors, typography, or spacing
- **Metadata**: See overall statistics about your design

### Step 3: EDS Library Import

1. Upload your Enterprise Design System (EDS) component library JSON file
2. The system will parse the library and display the available components
3. Review the component library in the browser panel
4. Click "Continue" to proceed to the next step

**Sample EDS Library Format**:
```json
{
  "name": "My Design System",
  "version": "1.0.0",
  "components": [
    {
      "id": "button",
      "name": "Button",
      "type": "button",
      "properties": {
        "variant": ["primary", "secondary", "outline"],
        "size": ["sm", "md", "lg"]
      }
    },
    // More components...
  ]
}
```

### Step 4: Component Mapping

1. Review the automatic mappings between Figma components and EDS components
2. Adjust mappings as needed:
   - Select a Figma component from the left panel
   - Select an EDS component from the right panel
   - Click "Create Mapping" to create a new mapping
3. Fine-tune property mappings for each component
4. Click "Continue" to proceed to the next step

**Tips**:
- Components with high confidence scores (>0.8) are likely correct mappings
- Pay special attention to components with low confidence scores
- Ensure all important components have mappings before proceeding

### Step 5: Code Generation

1. Select your target framework:
   - React
   - Vue
   - Angular
   - HTML/CSS
2. Configure framework options:
   - TypeScript (for React, Vue)
   - Styling approach (CSS, Tailwind, etc.)
3. Select components to include in the generation
4. Choose whether to generate layout code
5. Click "Generate Code" to start the code generation process
6. Review the generated code in the preview panel
7. Click "Continue" to proceed to the next step

**Framework-Specific Options**:
- **React**: TypeScript, styling (CSS Modules, Tailwind, Styled Components)
- **Vue**: TypeScript, styling (Scoped CSS, Tailwind)
- **Angular**: Styling (CSS, SCSS)
- **HTML/CSS**: Include JavaScript, CSS preprocessor

### Step 6: Code Validation

1. Review the validation results:
   - Syntax check
   - Style check
   - Responsiveness check
2. Address any critical issues identified by the validator
3. View the overall validation score and production readiness assessment
4. Download the generated code by clicking "Download Code"

**Validation Metrics**:
- **Syntax Score**: Measures code correctness and structure
- **Style Score**: Measures adherence to coding standards
- **Responsiveness Score**: Measures how well the code adapts to different screen sizes
- **Overall Score**: Weighted average of all scores

## Advanced Features

### Custom Templates

You can customize code generation templates by:

1. Navigating to the settings panel
2. Selecting "Code Templates"
3. Choosing a framework and component type
4. Editing the template
5. Saving your changes

### Batch Processing

For processing multiple components at once:

1. Select multiple components in the mapping interface
2. Click "Batch Map" to apply similar mappings to all selected components
3. Review and adjust the batch mappings as needed

### Project Export

To export your entire project:

1. Click on "Export Project" in the dashboard
2. Choose export options (include source files, documentation, etc.)
3. Click "Export" to download the complete project

## Troubleshooting

### Common Issues

1. **Figma Import Fails**
   - Ensure your Figma JSON is valid and complete
   - Try using a smaller portion of your design
   - Check your API token and file ID if using the API method

2. **Component Mapping Issues**
   - Verify your EDS library format matches the expected schema
   - Try manually mapping components with low confidence scores
   - Ensure component names are consistent between Figma and EDS

3. **Code Generation Errors**
   - Check that all required properties are mapped
   - Verify framework configuration options
   - Try generating code for fewer components at a time

4. **Validation Failures**
   - Address critical syntax issues first
   - Check for responsive design issues on components
   - Ensure style consistency across components

### Getting Help

If you encounter issues not covered in this manual:

1. Check the documentation for more detailed information
2. Contact the support team at support@figma-to-code.com
3. Visit our GitHub repository to report issues or contribute improvements

## Best Practices

1. **Organize Your Figma File**
   - Use consistent naming conventions for components
   - Group related components together
   - Use Figma's component system for reusable elements

2. **Prepare Your EDS Library**
   - Ensure component definitions are complete
   - Include all possible properties and variants
   - Use descriptive names that match your Figma components

3. **Review Mappings Carefully**
   - Pay attention to property mappings
   - Verify that interactive elements are correctly mapped
   - Check that styling properties are properly transferred

4. **Validate Generated Code**
   - Address all critical issues before using in production
   - Test the code in different browsers and screen sizes
   - Review the code for any custom logic that may need adjustment

## Conclusion

The Figma-to-Code system streamlines the process of converting designs to code, saving you time and ensuring consistency between your design and implementation. By following this user manual, you should be able to successfully convert your Figma designs into production-ready code for your chosen framework.

Happy coding!
