import React from 'react';

interface TreeProps {
  children: React.ReactNode;
  className?: string;
}

export const Tree: React.FC<TreeProps> = ({ children, className }) => {
  return (
    <div className={`tree-root ${className || ''}`}>
      <ul className="tree-node-list pl-0">{children}</ul>
    </div>
  );
};

interface TreeItemProps {
  id: string;
  label: string;
  icon?: string;
  children?: React.ReactNode;
  onClick?: () => void;
}

export const TreeItem: React.FC<TreeItemProps> = ({ id, label, icon, children, onClick }) => {
  const [expanded, setExpanded] = React.useState(false);
  const hasChildren = React.Children.count(children) > 0;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.();
  };

  return (
    <li className="tree-node">
      <div 
        className="flex items-center py-1 px-2 rounded-md hover:bg-accent cursor-pointer"
        onClick={handleClick}
      >
        {hasChildren && (
          <button 
            onClick={handleToggle}
            className="w-4 h-4 flex items-center justify-center mr-1 text-xs"
          >
            {expanded ? '▼' : '►'}
          </button>
        )}
        {!hasChildren && <span className="w-4 h-4 mr-1"></span>}
        {icon && <span className="mr-2">{icon}</span>}
        <span className="text-sm">{label}</span>
      </div>
      {hasChildren && expanded && (
        <ul className="tree-node-list pl-4 mt-1">
          {children}
        </ul>
      )}
    </li>
  );
};
