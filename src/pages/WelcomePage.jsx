import React from 'react';
import { ShieldCheck, Mail, LogIn } from 'lucide-react';

export default function WelcomePage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ backgroundColor: '#1A1A1A' }}
    >
      {/* Fundo decorativo */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div
          className="absolute top-0 left-0 w-96 h-96 rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #FFD700 0%, transparent 70%)', transform: 'translate(-30%,-30%)' }}
        />
        <div
          className="absolute bottom-0 right-0 w-96 h-96 rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #FFD700 0%, transparent 70%)', transform: 'translate(30%,30%)' }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,215,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,215,0,0.03) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="relative w-full max-w-sm mx-4 text-center">
        {/* Logo */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4 overflow-hidden">
            <img src="/img/logo_amarelo.svg" alt="VerticalParts" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">VerticalParts</h1>
          <p className="text-xs font-bold mt-1 tracking-[0.2em] uppercase" style={{ color: '#FFD700' }}>
            Warehouse Management System
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-3xl p-8 border"
          style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,215,0,0.15)', backdropFilter: 'blur(20px)' }}
        >
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl mx-auto mb-5"
            style={{ backgroundColor: 'rgba(255,215,0,0.08)', border: '1px solid rgba(255,215,0,0.2)' }}>
            <ShieldCheck className="w-7 h-7" style={{ color: '#FFD700' }} />
          </div>

          <h2 className="text-lg font-black text-white uppercase tracking-tight mb-2">
            Acesso Restrito
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed mb-6">
            O acesso ao WMS é restrito a usuários convidados. Para utilizar o sistema, você precisa ser convidado por um administrador.
          </p>

          {/* Botão login */}
          <button
            onClick={() => { window.location.href = '/login'; }}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm uppercase tracking-widest transition-all hover:opacity-90 mb-4"
            style={{ backgroundColor: '#FFD700', color: '#1A1A1A' }}
          >
            <LogIn className="w-4 h-4" />
            Já tenho acesso — Entrar
          </button>

          {/* Solicitar acesso */}
          <a
            href="mailto:ti@verticalparts.com.br?subject=Solicitação de acesso ao WMS"
            className="flex items-center justify-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-300 transition-colors"
          >
            <Mail className="w-3.5 h-3.5" />
            Solicitar acesso ao administrador
          </a>
        </div>

        <p className="text-center text-xs text-slate-700 mt-6 font-medium">
          VerticalParts WMS · {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
