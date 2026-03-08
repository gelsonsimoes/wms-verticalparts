import React from 'react';
import { Link } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] bg-slate-50 dark:bg-slate-950 p-4">
      <div className="w-24 h-24 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6">
        <AlertCircle className="w-12 h-12 text-red-500" />
      </div>
      <h1 className="text-4xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">
        404 - Página Não Encontrada
      </h1>
      <p className="text-slate-500 dark:text-slate-400 font-medium mb-8 text-center max-w-md">
        A rota que você tentou acessar não existe ou está em construção. Verifique o endereço e tente novamente.
      </p>
      <Link
        to="/"
        className="flex items-center gap-2 bg-secondary text-primary px-8 py-3 rounded-2xl font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-lg"
      >
        <Home className="w-5 h-5" />
        Voltar ao Dashboard
      </Link>
    </div>
  );
}
