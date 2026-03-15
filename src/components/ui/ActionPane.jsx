import React from 'react';
import Tooltip from './Tooltip';

/**
 * ActionPane Component
 * @param {string} title - Título da barra de comandos
 * @param {Array} groups - Array de grupos de ações [[{label, onClick, primary, icon, disabled, tooltip}]]
 */
export default function ActionPane({ title, groups = [] }) {
  return (
    <div className="bg-white border-b border-[var(--vp-border)] px-6 py-2 flex items-center justify-between shadow-sm sticky top-0 z-10">
      {title && (
        <h2 className="text-sm font-bold text-[var(--vp-text-label)] uppercase tracking-tight mr-4">
          {title}
        </h2>
      )}
      
      <div className="flex items-center flex-1 overflow-x-auto no-scrollbar">
        {groups.map((group, groupIndex) => (
          <React.Fragment key={groupIndex}>
            <div className="flex items-center gap-1">
              {group.map((action, actionIndex) => {
                const buttonContent = (
                  <button
                    key={actionIndex}
                    disabled={action.disabled}
                    onClick={action.onClick || (() => console.log('Ação: ' + action.label))}
                    className={`
                      flex items-center gap-2 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-all
                      ${action.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-95'}
                      ${action.primary 
                        ? 'btn-primary' 
                        : 'btn-secondary'
                      }
                    `}
                  >
                    {action.icon && <span className="shrink-0">{action.icon}</span>}
                    <span className="whitespace-nowrap">{action.label}</span>
                  </button>
                );

                if (action.tooltip) {
                  return (
                    <Tooltip key={actionIndex} text={action.tooltip}>
                      {buttonContent}
                    </Tooltip>
                  );
                }

                return buttonContent;
              })}
            </div>
            
            {/* Divisor vertical entre grupos */}
            {groupIndex < groups.length - 1 && (
              <div className="h-4 w-[1px] bg-gray-200 mx-3 shrink-0" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

