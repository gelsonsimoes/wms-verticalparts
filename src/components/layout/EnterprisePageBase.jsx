import React from 'react';
import Breadcrumbs from '../ui/Breadcrumbs';
import ActionPane from '../ui/ActionPane';
import { LayoutGrid } from 'lucide-react';


export default function EnterprisePageBase({ title, breadcrumbItems = [], actions, actionGroups: actionGroupsProp, children }) {
  const breadcrumbs = [
    { label: 'WMS', path: '/' },
    ...breadcrumbItems,
    { label: title, active: true }
  ];

  // Usa os actionGroups passados pela página ou um padrão vazio
  const resolvedGroups = actionGroupsProp || [];

  return (
    <div className="flex flex-col h-full bg-white animate-in fade-in duration-500">
      <div className="px-4 py-2 border-b border-[var(--vp-border)] bg-[#F8F9FA]">
        <Breadcrumbs items={breadcrumbs} />
      </div>

      <div className="px-4 py-1 border-b border-[var(--vp-border)] bg-white sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
             <div className="p-1.5 bg-black rounded-sm">
                <LayoutGrid className="w-4 h-4 text-[var(--vp-primary)]" />
             </div>
             <h1 className="text-sm font-black text-black uppercase tracking-tight">{title}</h1>
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
        {!actions && resolvedGroups.length > 0 && <ActionPane groups={resolvedGroups} />}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        {children}
      </div>

      <div className="px-4 py-2 border-t border-[var(--vp-border)] bg-[#F8F9FA] flex justify-between items-center">
         <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">VerticalParts WMS Enterprise v2.5</span>
         <div className="flex gap-4">
            <span className="text-[9px] font-black text-green-600 uppercase tracking-widest flex items-center gap-1.5">
               <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Conectado ao Gateway
            </span>
         </div>
      </div>
    </div>
  );
}
