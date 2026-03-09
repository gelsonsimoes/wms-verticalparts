import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function RedefinirSenha() {
  const navigate = useNavigate();
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [mostrar, setMostrar] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [erro, setErro] = useState('');
  const [sessaoOk, setSessaoOk] = useState(false);

  useEffect(() => {
    // Supabase injeta o token da URL automaticamente ao carregar a sessão
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setSessaoOk(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setSessaoOk(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');

    if (novaSenha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (novaSenha !== confirmar) {
      setErro('As senhas não coincidem.');
      return;
    }

    setStatus('loading');
    const { error } = await supabase.auth.updateUser({ password: novaSenha });

    if (error) {
      setErro(error.message);
      setStatus('error');
    } else {
      setStatus('success');
      setTimeout(() => navigate('/'), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 p-8">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-xl font-black text-white uppercase tracking-widest">Redefinir Senha</h1>
          <p className="text-xs text-slate-400 mt-1">VerticalParts WMS</p>
        </div>

        {status === 'success' ? (
          <div className="flex flex-col items-center gap-4 text-center">
            <CheckCircle2 className="w-12 h-12 text-green-400" />
            <p className="text-white font-bold">Senha redefinida com sucesso!</p>
            <p className="text-slate-400 text-sm">Redirecionando para o login...</p>
          </div>
        ) : !sessaoOk ? (
          <div className="flex flex-col items-center gap-4 text-center">
            <AlertCircle className="w-10 h-10 text-amber-400" />
            <p className="text-amber-300 font-bold text-sm">Link inválido ou expirado</p>
            <p className="text-slate-400 text-xs">Solicite um novo link de redefinição na tela de login.</p>
            <button
              onClick={() => navigate('/')}
              className="mt-2 px-6 py-2 bg-primary text-slate-950 font-black text-xs uppercase rounded-xl"
            >
              Ir para o Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                Nova Senha
              </label>
              <div className="relative">
                <input
                  type={mostrar ? 'text' : 'password'}
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  required
                  minLength={6}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm font-bold outline-none focus:ring-2 focus:ring-primary pr-12"
                />
                <button
                  type="button"
                  onClick={() => setMostrar(!mostrar)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                >
                  {mostrar ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                Confirmar Senha
              </label>
              <input
                type={mostrar ? 'text' : 'password'}
                value={confirmar}
                onChange={(e) => setConfirmar(e.target.value)}
                required
                placeholder="Repita a senha"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm font-bold outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {erro && (
              <div className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {erro}
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-primary text-slate-950 font-black text-sm uppercase tracking-widest py-3 rounded-xl hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {status === 'loading' ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</>
              ) : (
                'Salvar Nova Senha'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
