
import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={`flex items-center ${className} select-none`}>
      <span className="text-primary font-black tracking-tighter text-4xl lowercase font-sans">
        ago natura
      </span>
    </div>
  );
};
