/**
 * Tooltip — componente reutilizável para o WMS VerticalParts
 *
 * Uso básico:
 *   <Tooltip content="Filtra os resultados pelo período selecionado">
 *     <button>Exibir</button>
 *   </Tooltip>
 *
 * Com ícone de ajuda ao lado do label:
 *   <Tooltip content="O EAN é o código de barras impresso na embalagem" showIcon>
 *     <label>EAN</label>
 *   </Tooltip>
 *
 * Props:
 *   content   {string|ReactNode}  Texto ou JSX do tooltip (obrigatório)
 *   side      {'top'|'bottom'|'left'|'right'}  Posição — default: 'top'
 *   delay     {number}  Delay em ms antes de mostrar — default: 350
 *   showIcon  {boolean} Adiciona ícone ⓘ ao lado do children — default: false
 *   maxW      {string}  Tailwind max-width class — default: 'max-w-[220px]'
 *   disabled  {boolean} Desativa o tooltip — default: false
 */

import React, { useState, useRef, useCallback, useId } from 'react';

const POSITIONS = {
  top:    'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left:   'right-full top-1/2 -translate-y-1/2 mr-2',
  right:  'left-full top-1/2 -translate-y-1/2 ml-2',
};

const ARROWS = {
  top:    'absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800',
  bottom: 'absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-slate-800',
  left:   'absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-slate-800',
  right:  'absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-800',
};

export default function Tooltip({
  content,
  children,
  side     = 'top',
  delay    = 350,
  showIcon = false,
  maxW     = 'max-w-[220px]',
  disabled = false,
}) {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef(null);
  const uid = useId();
  const tooltipId = `tooltip-${uid.replace(/:/g, '')}`;

  const show = useCallback(() => {
    if (disabled) return;
    timerRef.current = setTimeout(() => setVisible(true), delay);
  }, [disabled, delay]);

  const hide = useCallback(() => {
    clearTimeout(timerRef.current);
    setVisible(false);
  }, []);

  if (!content || disabled) return <>{children}</>;

  return (
    <span
      className="relative inline-flex items-center"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocusCapture={show}
      onBlurCapture={hide}
    >
      {/* Elemento filho — recebe aria-describedby para acessibilidade */}
      {React.isValidElement(children)
        ? React.cloneElement(children, {
            'aria-describedby': visible ? tooltipId : undefined,
          })
        : children}

      {/* Ícone ⓘ opcional ao lado do children */}
      {showIcon && (
        <span className="ml-1 text-slate-400 cursor-help opacity-60 hover:opacity-100 transition-opacity shrink-0" aria-hidden="true">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </span>
      )}

      {/* Balão do tooltip */}
      {visible && (
        <span
          id={tooltipId}
          role="tooltip"
          className={[
            'absolute z-[9999] pointer-events-none',
            'px-3 py-2 rounded-xl shadow-2xl',
            'bg-slate-800 text-white',
            'text-[10px] font-semibold leading-relaxed tracking-wide',
            'animate-in fade-in zoom-in-95 duration-150',
            'border border-slate-700/50',
            maxW,
            'whitespace-normal break-words text-center',
            POSITIONS[side] ?? POSITIONS.top,
          ].join(' ')}
        >
          {content}
          {/* Seta direcional */}
          <span className={ARROWS[side] ?? ARROWS.top} aria-hidden="true" />
        </span>
      )}
    </span>
  );
}
