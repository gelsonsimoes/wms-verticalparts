import React, { useState, useRef, useEffect } from 'react';
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

const APP_VERSION = 'v4.3.18';

// Estilo base compartilhado para os inputs (evita repetição)
const INPUT_BASE =
    'w-full px-4 py-3 rounded-xl text-sm font-bold text-white placeholder-slate-600 outline-none transition-all';

export default function Login() {
    const [form,         setForm]         = useState({ login: '', senha: '' });
    const [showSenha,    setShowSenha]    = useState(false);
    const [error,        setError]        = useState('');
    const [loading,      setLoading]      = useState(false);
    // Estado para controle de foco sem manipulação direta do DOM
    const [focusedField, setFocusedField] = useState(null);

    // Ref para limpeza do timeout e prevenção de memory leak
    const timeoutRef = useRef(null);
    useEffect(() => {
        return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
    }, []);

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
