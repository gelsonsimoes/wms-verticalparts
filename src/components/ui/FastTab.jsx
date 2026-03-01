import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

/**
 * FastTab Component (Acordeão Enterprise)
 */
export default function FastTab({ title, defaultOpen = true, children }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-white border border-[var(--vp-border)] rounded-sm shadow-sm overflow-hidden mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between bg-[var(--vp-bg-alt)] hover:bg-gray-100 transition-colors border-b border-[var(--vp-border)]"
      >
        <span className="text-xs font-black text-[var(--vp-text-data)] uppercase tracking-widest flex items-center gap-2">
          {isOpen ? <ChevronDown size={16} className="text-[var(--vp-primary)]" /> : <ChevronRight size={16} className="text-gray-400" />}
          {title}
        </span>
      </button>
      
      {isOpen && (
        <div className="p-5 bg-white">
          {children}
        </div>
      )}
    </div>
  );
}
