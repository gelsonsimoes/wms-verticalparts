import React, { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff, ShieldCheck, AlertCircle, CheckCircle2, Loader2, Key } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

const INPUT_BASE =
  'w-full px-4 py-3 rounded-xl text-sm font-bold text-white placeholder-slate-600 outline-none transition-all';

export default function AuthCallbackPage() {
  const isResetRoute = window.location.pathname === '/auth/reset-password';

  const [state, setState] = useState('loading');   // 'loading' | 'set-password' | 'success' | 'error'
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    const fetchEmployee = async (userId, email) => {
      const { data: profile } = await supabase
        .from('operadores')
        .select('employee_id')
        .eq('id', userId)
        .maybeSingle();
      return profile?.employee_id || email?.split('@')[0] || '';
    };

    // Listener para detectar SIGNED_IN / PASSWORD_RECOVERY via detectSessionInUrl
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mountedRef.current) return;
      if (event === 'SIGNED_IN' || event === 'PASSWORD_RECOVERY') {
        if (session?.user) {
          const eid = await fetchEmployee(session.user.id, session.user.email);
          if (!mountedRef.current) return;
          setEmployeeId(eid);
          setState('set-password');
        }
      }
    });

    // Verifica se sessão já foi estabelecida antes do listener (race condition)
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mountedRef.current) return;
      if (session?.user && state === 'loading') {
        const eid = await fetchEmployee(session.user.id, session.user.email);
        if (!mountedRef.current) return;
        setEmployeeId(eid);
        setState('set-password');
      }
    });

    // Timeout de segurança: link inválido ou expirado
    const timeout = setTimeout(() => {
      if (mountedRef.current) {
        setState(s => s === 'loading' ? 'error' : s);
      }
    }, 12000);

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const handleSetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setError('As senhas não coincidem. Digite novamente.');
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
    } else {
      setState('success');
      setTimeout(() => {
        window.location.href = '/';
      }, 2500);
    }
  };

  const borderClass = (field) =>
    focusedField === field ? 'border-[#FFD700]' : 'border-white/10';

  // ── Tela: Carregando ─────────────────────────────────────────
  if (state === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#1A1A1A' }}>
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-yellow-400 mx-auto mb-4" />
          <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Verificando seu convite...</p>
        </div>
      </div>
    );
  }

  // ── Tela: Link inválido/expirado ─────────────────────────────
  if (state === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#1A1A1A' }}>
        <div className="w-full max-w-sm mx-4 text-center">
          <div className="rounded-3xl p-8 border" style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(239,68,68,0.3)' }}>
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-black text-white mb-2">Link Inválido</h2>
            <p className="text-slate-400 text-sm mb-6">Este link de convite é inválido ou já expirou. Solicite um novo convite ao administrador do sistema.</p>
            <button
              onClick={() => window.location.href = '/'}
              className="w-full py-3 rounded-xl font-black text-sm uppercase tracking-widest bg-primary text-secondary hover:bg-primary-hover transition-all"
            >
              Ir para o Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Tela: Sucesso ────────────────────────────────────────────
  if (state === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#1A1A1A' }}>
        <div className="w-full max-w-sm mx-4 text-center">
          <div className="rounded-3xl p-8 border" style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(34,197,94,0.3)' }}>
            <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h2 className="text-xl font-black text-white mb-2">Acesso Ativado!</h2>
            <p className="text-slate-400 text-sm">Sua senha foi definida com sucesso. Redirecionando para o sistema...</p>
            <div className="mt-4 flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-yellow-400" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Tela: Formulário de definir senha ────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ backgroundColor: '#1A1A1A' }}>
      {/* Fundo decorativo */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #FFD700 0%, transparent 70%)', transform: 'translate(-30%, -30%)' }} />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #FFD700 0%, transparent 70%)', transform: 'translate(30%, 30%)' }} />
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(255,215,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,215,0,0.03) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />
      </div>

      <div className="relative w-full max-w-sm mx-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4 overflow-hidden" aria-hidden="true">
            <img src="/img/logo_amarelo.svg" alt="VerticalParts Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">VerticalParts</h1>
          <p className="text-xs font-bold mt-1 text-primary tracking-[0.2em]">WAREHOUSE MANAGEMENT SYSTEM</p>
        </div>

        {/* Card */}
        <div className="rounded-3xl p-8 border" style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,215,0,0.15)', backdropFilter: 'blur(20px)' }}>

          {/* Título */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <h2 className="text-base font-black text-white uppercase tracking-tight">
                {isResetRoute ? 'Redefinir Senha' : 'Ativar Conta'}
              </h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                {isResetRoute ? 'Crie sua nova senha de acesso' : 'Primeiro acesso ao WMS'}
              </p>
            </div>
          </div>

          {/* Login info */}
          <div className="mb-5 p-3 rounded-xl border" style={{ backgroundColor: 'rgba(255,215,0,0.05)', borderColor: 'rgba(255,215,0,0.2)' }}>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Seu Login no Sistema</p>
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-yellow-400 flex-shrink-0" />
              <span className="text-yellow-400 font-black text-sm tracking-widest uppercase">{employeeId}</span>
            </div>
            <p className="text-[9px] text-slate-600 font-bold mt-1">Use este login + a senha que você criar para entrar no WMS.</p>
          </div>

          <form onSubmit={handleSetPassword} className="space-y-5" noValidate>
            {/* Campo Senha */}
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                Nova Senha
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('pass')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Mínimo 8 caracteres"
                  autoComplete="new-password"
                  autoFocus
                  required
                  className={`${INPUT_BASE} pr-12 border-2 ${borderClass('pass')}`}
                  style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
                />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  aria-label={showPass ? 'Ocultar senha' : 'Mostrar senha'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-300 transition-colors">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Campo Confirmar Senha */}
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                Confirmar Senha
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  onFocus={() => setFocusedField('confirm')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Repita a senha"
                  autoComplete="new-password"
                  required
                  className={`${INPUT_BASE} pr-12 border-2 ${borderClass('confirm')}`}
                  style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
                />
                <button type="button" onClick={() => setShowConfirm(v => !v)}
                  aria-label={showConfirm ? 'Ocultar senha' : 'Mostrar senha'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-300 transition-colors">
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Erro */}
            {error && (
              <div role="alert" className="flex items-center gap-2 text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Botão */}
            <button
              type="submit"
              disabled={loading || !password || !confirmPassword}
              className="w-full py-3 rounded-xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed bg-primary text-secondary hover:bg-primary-hover"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Salvando...
                </span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  {isResetRoute ? 'Redefinir Senha' : 'Ativar Minha Conta'}
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6 font-medium">
          VerticalParts WMS · v4.3.18 · {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
