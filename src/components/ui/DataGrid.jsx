import React from 'react';

/**
 * DataGrid Component (Tabela de Alta Densidade)
 */
export default function DataGrid({ columns = [], data = [], onRowClick }) {
  return (
    <div className="w-full overflow-x-auto border border-[var(--vp-border)] rounded-sm">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-[var(--vp-bg-alt)] border-b border-[var(--vp-border)] h-[40px]">
            {columns.map((col, index) => (
              <th 
                key={index}
                scope="col"
                className="px-4 text-left text-[11px] font-black text-[var(--vp-text-label)] uppercase tracking-wider"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((row, rowIndex) => (
              <tr 
                key={rowIndex} 
                onClick={() => onRowClick && onRowClick(row)}
                className={`h-[40px] border-b border-[var(--vp-border)] hover:bg-[var(--vp-hover)] transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
              >
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className="px-4 text-[13px] text-[var(--vp-text-data)]">
                    {col.render ? col.render(row[col.accessor], row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr className="h-[100px]">
              <td colSpan={columns.length} className="text-center text-gray-400 text-sm italic">
                Nenhum dado encontrado para exibição.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
