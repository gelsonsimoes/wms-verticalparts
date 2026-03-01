import React, { useState } from 'react';
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';

// Credenciais válidas do sistema
const CREDENTIALS = [
    { login: 'OP001',             senha: 'VP123',  nome: 'Danilo',  role: 'gestor',    nivel: 'Administrador' },
    { login: 'danilo.supervisor', senha: '9999',   nome: 'Danilo',  role: 'gestor',    nivel: 'Administrador' },
    { login: 'matheus.oper',      senha: '1234',   nome: 'Matheus', role: 'operador',  nivel: 'Operador' },
    { login: 'thiago.almox',      senha: '1234',   nome: 'Thiago',  role: 'operador',  nivel: 'Operador' },
    { login: 'gelson.estrat',     senha: '9999',   nome: 'Gelson',  role: 'gestor',    nivel: 'Administrador' },
];

export default function Login({ onLogin }) {
    const [form, setForm] = useState({ login: '', senha: '' });
    const [showSenha, setShowSenha] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        setTimeout(() => {
            const user = CREDENTIALS.find(
                c => c.login === form.login.trim() && c.senha === form.senha
            );

            if (user) {
                localStorage.setItem('vp_session', JSON.stringify({
                    login: user.login,
                    nome: user.nome,
                    role: user.role,
                    nivel: user.nivel,
                    loginAt: new Date().toISOString(),
                }));
                onLogin(user);
            } else {
                setError('Login ou senha inválidos. Verifique suas credenciais.');
                setLoading(false);
            }
        }, 600);
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center relative overflow-hidden"
            style={{ backgroundColor: '#1A1A1A' }}
        >
            {/* Fundo decorativo */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-96 h-96 rounded-full opacity-5"
                    style={{ background: 'radial-gradient(circle, #FFD700 0%, transparent 70%)', transform: 'translate(-30%, -30%)' }} />
                <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full opacity-5"
                    style={{ background: 'radial-gradient(circle, #FFD700 0%, transparent 70%)', transform: 'translate(30%, 30%)' }} />
                {/* Grade decorativa */}
                <div className="absolute inset-0" style={{
                    backgroundImage: 'linear-gradient(rgba(255,215,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,215,0,0.03) 1px, transparent 1px)',
                    backgroundSize: '60px 60px'
                }} />
            </div>

            {/* Card de Login */}
            <div className="relative w-full max-w-sm mx-4">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
                        style={{ backgroundColor: '#FFD700' }}>
                        <span className="text-2xl font-black" style={{ color: '#1A1A1A' }}>VP</span>
                    </div>
                    <h1 className="text-2xl font-black text-white tracking-tight">VerticalParts</h1>
                    <p className="text-xs font-bold mt-1" style={{ color: '#FFD700', letterSpacing: '0.2em' }}>
                        WAREHOUSE MANAGEMENT SYSTEM
                    </p>
                </div>

                {/* Form Card */}
                <div className="rounded-3xl p-8 border" style={{
                    backgroundColor: 'rgba(255,255,255,0.04)',
                    borderColor: 'rgba(255,215,0,0.15)',
                    backdropFilter: 'blur(20px)'
                }}>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Login */}
                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                                Login
                            </label>
                            <input
                                type="text"
                                value={form.login}
                                onChange={e => setForm(f => ({ ...f, login: e.target.value }))}
                                placeholder="Ex: OP001"
                                autoComplete="username"
                                autoFocus
                                required
                                className="w-full px-4 py-3 rounded-xl text-sm font-bold text-white placeholder-slate-600 outline-none transition-all"
                                style={{
                                    backgroundColor: 'rgba(255,255,255,0.06)',
                                    border: '1.5px solid rgba(255,255,255,0.1)',
                                    fontFamily: 'Poppins, sans-serif'
                                }}
                                onFocus={e => e.target.style.borderColor = '#FFD700'}
                                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                            />
                        </div>

                        {/* Senha */}
                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                                Senha
                            </label>
                            <div className="relative">
                                <input
                                    type={showSenha ? 'text' : 'password'}
                                    value={form.senha}
                                    onChange={e => setForm(f => ({ ...f, senha: e.target.value }))}
                                    placeholder="••••••"
                                    autoComplete="current-password"
                                    required
                                    className="w-full px-4 py-3 pr-12 rounded-xl text-sm font-bold text-white placeholder-slate-600 outline-none transition-all"
                                    style={{
                                        backgroundColor: 'rgba(255,255,255,0.06)',
                                        border: '1.5px solid rgba(255,255,255,0.1)',
                                        fontFamily: 'Poppins, sans-serif'
                                    }}
                                    onFocus={e => e.target.style.borderColor = '#FFD700'}
                                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowSenha(!showSenha)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-300 transition-colors"
                                >
                                    {showSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Erro */}
                        {error && (
                            <div className="flex items-center gap-2 text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        {/* Botão */}
                        <button
                            type="submit"
                            disabled={loading || !form.login || !form.senha}
                            className="w-full py-3 rounded-xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                                backgroundColor: '#FFD700',
                                color: '#1A1A1A',
                                fontFamily: 'Poppins, sans-serif'
                            }}
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                    Verificando...
                                </span>
                            ) : (
                                <>
                                    <LogIn className="w-4 h-4" />
                                    Entrar
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Rodapé */}
                <p className="text-center text-xs text-slate-600 mt-6 font-medium">
                    VerticalParts WMS · v1.0 · {new Date().getFullYear()}
                </p>
            </div>
        </div>
    );
}
