import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Loader2 } from 'lucide-react';

/**
 * AuthCallback
 * Ponto de aterrissagem para links de e-mail do Supabase (convites e reset de senha).
 *
 * Suporta dois formatos de URL:
 *   1. Hash fragment:  /auth/callback#access_token=...&refresh_token=...
 *   2. Query param:    /auth/callback?code=...  (fluxo PKCE)
 *
 * Após processar o token, redireciona para /auth/update-password.
 */
export default function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('Verificando seu acesso...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // --- Formato 1: hash fragment (#access_token=...&refresh_token=...) ---
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const searchParams = new URLSearchParams(window.location.search);

        const accessToken  = hashParams.get('access_token')  || searchParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token') || searchParams.get('refresh_token');

        if (accessToken && refreshToken) {
          setStatus('Token encontrado, autenticando...');
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (error) throw error;

          setStatus('Redirecionando para definição de senha...');
          navigate('/auth/update-password', { replace: true });
          return;
        }

        // --- Formato 2: código PKCE (?code=...) ---
        const code = searchParams.get('code');
        if (code) {
          setStatus('Processando código de acesso...');
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;

          setStatus('Redirecionando para definição de senha...');
          navigate('/auth/update-password', { replace: true });
          return;
        }

        // --- Nenhum parâmetro encontrado ---
        setStatus('Link inválido ou expirado. Redirecionando...');
        setTimeout(() => navigate('/', { replace: true }), 3000);

      } catch (err) {
        console.error('[AuthCallback]', err);
        setStatus('Erro ao processar o link. Redirecionando...');
        setTimeout(() => navigate('/', { replace: true }), 3000);
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#1A1A1A]"
    >
      <Loader2 className="w-10 h-10 animate-spin text-yellow-400" />
      <p className="text-white font-bold text-sm">{status}</p>
      <p className="text-gray-500 text-xs font-black uppercase tracking-[0.3em]">
        VerticalParts WMS
      </p>
    </div>
  );
}
