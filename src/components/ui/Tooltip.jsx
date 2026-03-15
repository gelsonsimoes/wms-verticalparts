import React, { useState } from 'react';

export default function Tooltip({ text, children, showIcon = false }) {
  const [show, setShow] = useState(false);

  if (!text) return <>{children}</>;

  return (
    <div className="relative inline-flex items-center" 
         onMouseEnter={() => setShow(true)} 
         onMouseLeave={() => setShow(false)}>
      {children}
      {showIcon && (
        <span className="ml-1 text-slate-400 cursor-help opacity-50 hover:opacity-100 transition-opacity">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </span>
      )}
      
      {show && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-[9px] font-black uppercase tracking-wider rounded shadow-xl border border-slate-700 z-[9999] animate-in fade-in zoom-in-95 duration-200 pointer-events-none whitespace-nowrap">
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
        </div>
      )}
    </div>
  );
}
