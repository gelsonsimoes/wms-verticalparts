import React, { useState, useRef, useEffect } from 'react';
import { Eye, EyeOff, LogIn, AlertCircle, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

const APP_VERSION = 'v4.2.1';

// Estilo base compartilhado para os inputs (evita repetição)
const INPUT_BASE =
    'w-full px-4 py-3 rounded-xl text-sm font-bold text-white placeholder-slate-600 outline-none transition-all';

export default function Login({ onLogin }) {
    const [form,         setForm]         = useState({ login: '', senha: '' });
    const [showSenha,    setShowSenha]    = useState(false);
    const [error,        setError]        = useState('');
    const [loading,      setLoading]      = useState(false);
    const [focusedField, setFocusedField] = useState(null);

    // Estados para "Esqueceu a senha?"
    const [mode,         setMode]         = useState('login'); // 'login' | 'forgot' | 'forgot-sent'
    const [resetEmail,   setResetEmail]   = useState('');

    const timeoutRef = useRef(null);
    useEffect(() => {
        return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
    }, []);

    const handleForgot = async (e) => {
        e.preventDefault();
        setError('');
        if (!resetEmail.trim()) return;
        setLoading(true);
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(
            resetEmail.trim(),
            { redirectTo: 'https://wmsverticalparts.com.br/auth/reset-password' }
        );
        setLoading(false);
        if (resetError) {
            setError(resetError.message);
        } else {
            setMode('forgot-sent');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const email = form.login.includes('@') 
            ? form.login.trim() 
            : `${form.login.trim().toLowerCase()}@vp.internal`;

        console.log('[Login] Tentando autenticar:', email);

        // Safety timeout: se nada acontecer em 20s, mostra erro
        timeoutRef.current = setTimeout(() => {
            setLoading(false);
            setError('Tempo de conexão esgotado. Verifique sua internet e tente novamente.');
        }, 20000);

        // NOTA: O signInWithPassword do Supabase JS pode não resolver sua Promise,
        // mas o onAuthStateChange no App.jsx detecta o SIGNED_IN e faz a transição.
        // Por isso usamos um padrão fire-and-forget com tratamento de erro.
        supabase.auth.signInWithPassword({
            email: email,
            password: form.senha,
        }).then(({ error: authError }) => {
            if (authError) {
                console.error('[Login] Erro de auth:', authError.message);
                clearTimeout(timeoutRef.current);
                setError(authError.message === 'Invalid login credentials' 
                    ? 'Login ou senha inválidos. Verifique suas credenciais.' 
                    : authError.message);
                setLoading(false);
            } else {
                console.log('[Login] signInWithPassword resolveu com sucesso');
                clearTimeout(timeoutRef.current);
                // O App.jsx vai cuidar da transição via onAuthStateChange
            }
        }).catch((err) => {
            console.error('[Login] signInWithPassword catch:', err);
            // Não faz nada — o onAuthStateChange pode ter funcionado
        });
    };

    // Retorna a classe de borda conforme o campo focado
    const borderClass = (field) =>
        focusedField === field
            ? 'border-[#FFD700]'
            : 'border-white/10';

    // ── Tela: E-mail enviado ──────────────────────────────────────
    if (mode === 'forgot-sent') {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#1A1A1A' }}>
                <div className="w-full max-w-sm mx-4 text-center">
                    <div className="rounded-3xl p-8 border" style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(34,197,94,0.3)' }}>
                        <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-4" />
                        <h2 className="text-xl font-black text-white mb-2">E-mail Enviado!</h2>
                        <p className="text-slate-400 text-sm mb-1">Verifique a caixa de entrada de:</p>
                        <p className="text-yellow-400 font-black text-sm mb-4">{resetEmail}</p>
                        <p className="text-slate-500 text-xs mb-6">Clique no link do e-mail para redefinir sua senha. Verifique também a pasta de spam.</p>
                        <button
                            onClick={() => { setMode('login'); setResetEmail(''); setError(''); }}
                            className="w-full py-3 rounded-xl font-black text-sm uppercase tracking-widest bg-primary text-secondary hover:bg-primary-hover transition-all flex items-center justify-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" /> Voltar ao Login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ── Tela: Esqueceu a senha ────────────────────────────────────
    if (mode === 'forgot') {
        return (
            <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ backgroundColor: '#1A1A1A' }}>
                <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                    <div className="absolute top-0 left-0 w-96 h-96 rounded-full opacity-5"
                        style={{ background: 'radial-gradient(circle, #FFD700 0%, transparent 70%)', transform: 'translate(-30%, -30%)' }} />
                    <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full opacity-5"
                        style={{ background: 'radial-gradient(circle, #FFD700 0%, transparent 70%)', transform: 'translate(30%, 30%)' }} />
                </div>
                <div className="relative w-full max-w-sm mx-4">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4 overflow-hidden">
                            <img src="/img/logo_amarelo.svg" alt="VerticalParts Logo" className="w-full h-full object-contain" />
                        </div>
                        <h1 className="text-2xl font-black text-white tracking-tight">VerticalParts</h1>
                        <p className="text-xs font-bold mt-1 text-primary tracking-[0.2em]">WAREHOUSE MANAGEMENT SYSTEM</p>
                    </div>
                    <div className="rounded-3xl p-8 border" style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,215,0,0.15)', backdropFilter: 'blur(20px)' }}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-yellow-500/10 rounded-lg">
                                <Mail className="w-5 h-5 text-yellow-400" />
                            </div>
                            <div>
                                <h2 className="text-base font-black text-white uppercase tracking-tight">Redefinir Senha</h2>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Enviaremos um link por e-mail</p>
                            </div>
                        </div>
                        <form onSubmit={handleForgot} className="space-y-5" noValidate>
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                                    E-mail cadastrado
                                </label>
                                <input
                                    type="email"
                                    value={resetEmail}
                                    onChange={e => setResetEmail(e.target.value)}
                                    onFocus={() => setFocusedField('reset')}
                                    onBlur={() => setFocusedField(null)}
                                    placeholder="seu@email.com"
                                    autoFocus
                                    required
                                    className={`${INPUT_BASE} border-2 ${focusedField === 'reset' ? 'border-[#FFD700]' : 'border-white/10'}`}
                                    style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
                                />
                            </div>
                            {error && (
                                <div role="alert" className="flex items-center gap-2 text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                    {error}
                                </div>
                            )}
                            <button
                                type="submit"
                                disabled={loading || !resetEmail.trim()}
                                className="w-full py-3 rounded-xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed bg-primary text-secondary hover:bg-primary-hover"
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                        Enviando...
                                    </span>
                                ) : (
                                    <><Mail className="w-4 h-4" /> Enviar Link</>
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={() => { setMode('login'); setError(''); }}
                                className="w-full text-center text-[11px] font-bold text-slate-500 hover:text-yellow-400 transition-colors uppercase tracking-widest flex items-center justify-center gap-1"
                            >
                                <ArrowLeft className="w-3 h-3" /> Voltar ao Login
                            </button>
                        </form>
                    </div>
                    <p className="text-center text-xs text-slate-600 mt-6 font-medium">
                        VerticalParts WMS · {APP_VERSION} · {new Date().getFullYear()}
                    </p>
                </div>
            </div>
        );
    }

    // ── Tela: Login normal ────────────────────────────────────────
    return (
        <div
            className="min-h-screen flex items-center justify-center relative overflow-hidden"
            style={{ backgroundColor: '#1A1A1A' }}
        >
            {/* Fundo decorativo — aria-hidden pois é puramente estético */}
            <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                <div
                    className="absolute top-0 left-0 w-96 h-96 rounded-full opacity-5"
                    style={{ background: 'radial-gradient(circle, #FFD700 0%, transparent 70%)', transform: 'translate(-30%, -30%)' }}
                />
                <div
                    className="absolute bottom-0 right-0 w-96 h-96 rounded-full opacity-5"
                    style={{ background: 'radial-gradient(circle, #FFD700 0%, transparent 70%)', transform: 'translate(30%, 30%)' }}
                />
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: 'linear-gradient(rgba(255,215,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,215,0,0.03) 1px, transparent 1px)',
                        backgroundSize: '60px 60px',
                    }}
                />
            </div>

            {/* Card de Login */}
            <div className="relative w-full max-w-sm mx-4">

                {/* Logo */}
                <div className="text-center mb-8">
                    <div
                        className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4 overflow-hidden"
                        aria-hidden="true"
                    >
                        <img
                            src="/img/logo_amarelo.svg"
                            alt="VerticalParts Logo"
                            className="w-full h-full object-contain"
                        />
                    </div>
                    <h1 className="text-2xl font-black text-white tracking-tight">VerticalParts</h1>
                    <p className="text-xs font-bold mt-1 text-primary tracking-[0.2em]">
                        WAREHOUSE MANAGEMENT SYSTEM
                    </p>
                </div>

                {/* Form Card */}
                <div
                    className="rounded-3xl p-8 border"
                    style={{
                        backgroundColor: 'rgba(255,255,255,0.04)',
                        borderColor:     'rgba(255,215,0,0.15)',
                        backdropFilter:  'blur(20px)',
                    }}
                >
                    <form onSubmit={handleSubmit} className="space-y-5" noValidate>

                        {/* Campo Login */}
                        <div>
                            <label
                                htmlFor="login-input"
                                className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2"
                            >
                                Login
                            </label>
                            <input
                                id="login-input"
                                type="text"
                                value={form.login}
                                onChange={e => setForm(f => ({ ...f, login: e.target.value }))}
                                onFocus={() => setFocusedField('login')}
                                onBlur={() => setFocusedField(null)}
                                placeholder="Ex: OP001"
                                autoComplete="username"
                                autoFocus
                                required
                                aria-required="true"
                                className={`${INPUT_BASE} border-2 ${borderClass('login')}`}
                                style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
                            />
                        </div>

                        {/* Campo Senha */}
                        <div>
                            <label
                                htmlFor="senha-input"
                                className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2"
                            >
                                Senha
                            </label>
                            <div className="relative">
                                <input
                                    id="senha-input"
                                    type={showSenha ? 'text' : 'password'}
                                    value={form.senha}
                                    onChange={e => setForm(f => ({ ...f, senha: e.target.value }))}
                                    onFocus={() => setFocusedField('senha')}
                                    onBlur={() => setFocusedField(null)}
                                    placeholder="••••••"
                                    autoComplete="current-password"
                                    required
                                    aria-required="true"
                                    className={`${INPUT_BASE} pr-12 border-2 ${borderClass('senha')}`}
                                    style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowSenha(v => !v)}
                                    aria-label={showSenha ? 'Ocultar senha' : 'Mostrar senha'}
                                    aria-controls="senha-input"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-300 transition-colors"
                                >
                                    {showSenha
                                        ? <EyeOff className="w-4 h-4" aria-hidden="true" />
                                        : <Eye    className="w-4 h-4" aria-hidden="true" />
                                    }
                                </button>
                            </div>
                        </div>

                        {/* Mensagem de erro */}
                        {error && (
                            <div
                                role="alert"
                                className="flex items-center gap-2 text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5"
                            >
                                <AlertCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                                {error}
                            </div>
                        )}

                        {/* Botão de submit */}
                        <button
                            type="submit"
                            disabled={loading || !form.login || !form.senha}
                            className="w-full py-3 rounded-xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed bg-primary text-secondary hover:bg-primary-hover"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <span
                                        className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
                                        aria-hidden="true"
                                    />
                                    Verificando...
                                </span>
                            ) : (
                                <>
                                    <LogIn className="w-4 h-4" aria-hidden="true" />
                                    Entrar
                                </>
                            )}
                        </button>

                        {/* Link "Esqueceu a senha?" */}
                        <button
                            type="button"
                            onClick={() => { setMode('forgot'); setError(''); }}
                            className="w-full text-center text-[11px] font-bold text-slate-500 hover:text-yellow-400 transition-colors uppercase tracking-widest mt-1"
                        >
                            Esqueceu a senha?
                        </button>
                    </form>
                </div>

                {/* Rodapé */}
                <p className="text-center text-xs text-slate-600 mt-6 font-medium">
                    VerticalParts WMS · {APP_VERSION} · {new Date().getFullYear()}
                </p>
            </div>
        </div>
    );
}
