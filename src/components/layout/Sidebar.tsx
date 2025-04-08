"use client"

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  FileCode, 
  Settings, 
  Layers,
  PanelLeft,
  Code,
  Figma,
  Package,
  Puzzle
} from 'lucide-react';

interface SidebarItemProps {
  href: string;
  icon: React.ReactNode;
  title: string;
}

const SidebarItem = ({ href, icon, title }: SidebarItemProps) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link 
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
        isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
      )}
    >
      {icon}
      <span>{title}</span>
    </Link>
  );
};

interface SidebarProps {
  currentStep: number;
  workflowSteps: { id: number; name: string; description: string; }[];
  completedSteps: number[];
  onStepSelect: (stepId: number) => void;
  workflowStatus: string;
}

const Sidebar = ({ 
  currentStep, 
  workflowSteps, 
  completedSteps, 
  onStepSelect, 
  workflowStatus 
}: SidebarProps) => {
  console.log('Sidebar workflowSteps:', workflowSteps);
  
  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 border-r bg-background pt-14 lg:block">
      <div className="flex h-full flex-col gap-2 p-4">
        <div className="px-3 py-2">
          <h2 className="text-lg font-semibold tracking-tight">Projects</h2>
          <p className="text-sm text-muted-foreground">Manage your design projects</p>
        </div>
        
        <nav className="flex flex-col gap-1">
          <SidebarItem 
            href="/dashboard" 
            icon={<LayoutDashboard className="h-4 w-4" />} 
            title="Dashboard" 
          />
          <SidebarItem 
            href="/projects" 
            icon={<Layers className="h-4 w-4" />} 
            title="Projects" 
          />
          
          <div className="mt-6 px-3 py-2">
            <h2 className="text-lg font-semibold tracking-tight">Design to Code</h2>
            <p className="text-sm text-muted-foreground">Convert designs to code</p>
          </div>
          
          <SidebarItem 
            href="/figma-import" 
            icon={<Figma className="h-4 w-4" />} 
            title="Figma Import" 
          />
          <SidebarItem 
            href="/eds-library" 
            icon={<Package className="h-4 w-4" />} 
            title="EDS Library" 
          />
          <SidebarItem 
            href="/component-mapping" 
            icon={<Puzzle className="h-4 w-4" />} 
            title="Component Mapping" 
          />
          <SidebarItem 
            href="/code-generation" 
            icon={<Code className="h-4 w-4" />} 
            title="Code Generation" 
          />
          
          <div className="mt-6 px-3 py-2">
            <h2 className="text-lg font-semibold tracking-tight">System</h2>
            <p className="text-sm text-muted-foreground">System settings</p>
          </div>
          
          <SidebarItem 
            href="/settings" 
            icon={<Settings className="h-4 w-4" />} 
            title="Settings" 
          />
          
          {/* Workflow Steps */}
          <div className="px-3 py-2 mt-4">
            <h2 className="text-lg font-semibold tracking-tight">Workflow</h2>
            <p className="text-sm text-muted-foreground">Current status: {workflowStatus}</p>
          </div>
          
          <div className="flex flex-col gap-1">
            {workflowSteps && workflowSteps.map((step) => {
              const isCompleted = completedSteps.includes(step.id);
              const isCurrent = currentStep === step.id;
              const isClickable = isCompleted || isCurrent || currentStep + 1 === step.id;
              
              return (
                <button
                  key={step.id}
                  onClick={() => isClickable && onStepSelect(step.id)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                    isCurrent ? "bg-primary/10 text-primary" : "hover:bg-muted",
                    !isClickable && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full border">
                    {isCompleted ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    ) : (
                      <span>{step.id + 1}</span>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium">{step.name}</span>
                    <span className="text-xs text-muted-foreground">{step.description}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </nav>
        
        <div className="mt-auto">
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-medium">Need help?</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Check our documentation or contact support.
            </p>
            <Link 
              href="/help" 
              className="mt-3 inline-flex items-center text-sm font-medium text-primary"
            >
              View Documentation
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
