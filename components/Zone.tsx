import React from 'react';

interface ZoneProps {
  title: string;
  count?: number;
  className?: string;
  contentClassName?: string;
  children?: React.ReactNode;
}

export const Zone: React.FC<ZoneProps> = ({ 
    title, 
    count, 
    className = '', 
    contentClassName = 'flex flex-wrap gap-1 items-center justify-center', 
    children 
}) => {
  return (
    <div className={`border border-red-900/30 rounded p-2 bg-black/20 flex flex-col ${className}`}>
      <div className="text-red-500/50 text-xs font-cinzel mb-1 uppercase flex justify-between shrink-0">
        <span>{title}</span>
        {count !== undefined && <span>{count}</span>}
      </div>
      <div className={`flex-1 min-h-0 ${contentClassName}`}>
        {children}
      </div>
    </div>
  );
};
