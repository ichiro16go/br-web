import React from 'react';

interface ZoneProps {
  title: string;
  count?: number;
  className?: string;
  children?: React.ReactNode;
}

export const Zone: React.FC<ZoneProps> = ({ title, count, className = '', children }) => {
  return (
    <div className={`border border-red-900/30 rounded p-2 bg-black/20 ${className}`}>
      <div className="text-red-500/50 text-xs font-cinzel mb-1 uppercase flex justify-between">
        <span>{title}</span>
        {count !== undefined && <span>{count}</span>}
      </div>
      <div className="flex flex-wrap gap-1 items-center justify-center min-h-[4rem]">
        {children}
      </div>
    </div>
  );
};
