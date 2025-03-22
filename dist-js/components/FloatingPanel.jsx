import React from 'react';
export function FloatingPanel({ children, position = 'bottom-right' }) {
    // Map position to CSS classes
    const positionClasses = {
        'bottom-right': 'bottom-4 right-4',
        'bottom-left': 'bottom-4 left-4',
        'top-right': 'top-4 right-4',
        'top-left': 'top-4 left-4'
    };
    return (<div className={`fixed ${positionClasses[position]} flex flex-col gap-2 items-center z-50`}>
      <div className="bg-background/80 backdrop-blur-sm rounded-full shadow-lg p-2 flex flex-col gap-2">
        {children}
      </div>
    </div>);
}
