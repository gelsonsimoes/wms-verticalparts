import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { ShieldAlert, Lock, Eye, EyeOff, CheckCircle2, Save, ArrowRight } from 'lucide-react';

export default function UpdatePassword() {
  const [senha, setSenha] = useState('');
  const [confirmaSenha, setConfirmaSenha] = useState('');
  const [showSenha, setShowSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (senha !== confirmaSenha) {
      setError('As senhas não coincidem.');
      return;
    }
    if (senha.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: senha
      });

      if (updateError) throw updateError;

      // Limpa a trava de primeiro acesso (barreira)
      await supabase.auth.updateUser({
        data: { must_change_password: false }
      });

      setSuccess(true);
      // Força um reload completo para limpar todas as travas do App.jsx e garantir nova sessão
      setTimeout(() => {
        window.location.href = '/';
      }, 3000);
    } catch (err) {
      setError(err.message || 'Falha ao atualizar senha.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1A1A1A] text-white p-6">
        <div className="max-w-md w-full bg-white/5 border border-green-500/20 rounded-[40px] p-10 text-center space-y-6 backdrop-blur-xl animate-in zoom-in duration-500">
          <div className="inline-flex items-center justify-center w-32 h-32 bg-yellow-500/10 rounded-3xl mb-4 overflow-hidden border border-yellow-500/20">
            <img 
              src="/animations/escalator.png" 
              alt="Escada Rolante" 
              className="w-full h-full object-cover animate-pulse" 
            />
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-white">Acesso Liberado!</h1>
          <p className="text-slate-400 text-sm font-medium">Sua senha foi definida. Estamos subindo para o sistema...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1A1A1A] text-white p-6 font-sans relative overflow-hidden">
      {/* Background Decorativo */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
         <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px]" />
         <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-md w-full relative z-10 space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center bg-white/5 p-4 rounded-3xl border border-white/10 mb-2">
            <Lock className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl font-black uppercase tracking-tighter">Primeiro Acesso</h1>
          <p className="text-slate-400 text-xs font-black uppercase tracking-[0.2em]">Defina sua senha definitiva do WMS</p>
        </div>

        <form onSubmit={handleUpdate} className="bg-white/5 border border-white/10 p-8 rounded-[40px] backdrop-blur-xl space-y-6 shadow-2xl">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nova Senha Segura</label>
            <div className="relative">
              <input 
                type={showSenha ? "text" : "password"}
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full bg-white border-2 border-white/5 rounded-2xl py-4 px-5 text-sm font-bold text-slate-900 focus:border-primary outline-none transition-all placeholder-slate-400"
                placeholder="Mínimo 8 caracteres"
              />
              <button 
                type="button"
                onClick={() => setShowSenha(!showSenha)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-500 hover:text-white transition-colors"
              >
                {showSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Confirmar Nova Senha</label>
            <input 
              type={showSenha ? "text" : "password"}
              required
              value={confirmaSenha}
              onChange={(e) => setConfirmaSenha(e.target.value)}
              className="w-full bg-white border-2 border-white/5 rounded-2xl py-4 px-5 text-sm font-bold text-slate-900 focus:border-primary outline-none transition-all placeholder-slate-400"
              placeholder="Digite novamente"
            />
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 text-xs font-bold animate-shake">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-primary text-secondary rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:translate-y-[-2px] hover:shadow-xl hover:shadow-primary/20 active:translate-y-0 transition-all disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Processando...
              </span>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Confirmar Senha Definitiva
              </>
            )}
          </button>
        </form>

        <p className="text-center text-[9px] text-slate-600 font-black uppercase tracking-[0.3em] mt-8">
          Segurança VerticalParts · Proteção de Dados 2026
        </p>
      </div>
    </div>
  );
}
