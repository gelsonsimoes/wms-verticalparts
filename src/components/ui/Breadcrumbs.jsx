import React from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export default function Breadcrumbs({ items }) {
  return (
    <nav className="text-sm font-medium text-gray-500 mb-4" aria-label="Breadcrumb">
      <ol className="flex items-center list-none p-0">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />}
            {item.path ? (
              <NavLink
                to={item.path}
                className="text-gray-600 hover:text-yellow-500 transition-colors"
              >
                {item.label}
              </NavLink>
            ) : (
              <span className="text-gray-800 font-semibold">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
