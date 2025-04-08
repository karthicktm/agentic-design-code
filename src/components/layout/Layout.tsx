"use client"

import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import MainContent from './MainContent';
import StatusBar from './StatusBar';
import Panel from './Panel';

interface LayoutProps {
  children: React.ReactNode;
  currentStep: number;
  workflowSteps: { id: number; name: string; description: string; }[];
  completedSteps: number[];
  onStepSelect: (stepId: number) => void;
  workflowStatus: string;
}

const Layout = ({ 
  children, 
  currentStep, 
  workflowSteps = [], 
  completedSteps = [], 
  onStepSelect = () => {}, 
  workflowStatus = 'Not Started' 
}: LayoutProps) => {
  const [isPropertiesOpen, setIsPropertiesOpen] = useState(false);
  const [isMappingOpen, setIsMappingOpen] = useState(false);
  
  console.log('Layout workflowSteps:', workflowSteps);
  
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <Sidebar 
        currentStep={currentStep}
        workflowSteps={workflowSteps}
        completedSteps={completedSteps}
        onStepSelect={onStepSelect}
        workflowStatus={workflowStatus}
      />
      <MainContent>
        {children}
      </MainContent>
      <StatusBar status={workflowStatus} />
      
      <Panel 
        title="Properties" 
        isOpen={isPropertiesOpen} 
        onClose={() => setIsPropertiesOpen(false)}
        position="right"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Select a component to view and edit its properties.
          </p>
        </div>
      </Panel>
      
      <Panel 
        title="Component Mapping" 
        isOpen={isMappingOpen} 
        onClose={() => setIsMappingOpen(false)}
        position="bottom"
        height="320px"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Map Figma components to EDS library components.
          </p>
        </div>
      </Panel>
    </div>
  );
};

export default Layout;
