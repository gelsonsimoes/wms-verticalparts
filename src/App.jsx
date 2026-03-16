import React, { useState, useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import { AppProvider } from './context/AppContext';
import ChatAssistant from './components/chat/ChatAssistant';
import Login from './pages/Login';
import WelcomePage from './pages/WelcomePage';
import NotFound from './pages/NotFound';
import AuthCallbackPage from './pages/AuthCallbackPage';
import { supabase } from './services/supabaseClient';
import { appRoutes } from './routes';
import { Loader2 } from 'lucide-react';

// Loader customizado para Suspense fallback
const FallbackLoader = () => (
  <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-white">
    <Loader2 className="w-10 h-10 animate-spin text-primary" />
    <span className="mt-4 text-xs font-black uppercase tracking-widest text-slate-400">Carregando Tela...</span>
  </div>
);

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // ── Autenticação via Supabase ────────────────────────────────
  const [session, setSession] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Busca dados completos do usuário (nome, cargo, nível) logado
  const fetchUserProfile = async (authUser) => {
    // Constrói dados básicos a partir do auth (fallback caso DB não responda)
    const basicUserData = {
      id: authUser.id,
      login: authUser.email?.split('@')[0] || authUser.email,
      nome: authUser.email?.split('@')[0] || 'Usuário',
      role: 'gestor',
      nivel: 'Administrador',
      email: authUser.email,
    };

    try {
      // Timeout de 7s — se o banco não responder, usa dados básicos
      await Promise.race([
        supabase
          .from('operadores')
          .select('*')
          .eq('id', authUser.id)
          .maybeSingle(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('DB_TIMEOUT')), 7000)
        )
      ]);

      // Busca o perfil + grupo de acesso via join
      const { data: profile, error } = await supabase
        .from('operadores')
        .select('*, grupos_acesso(paginas)')
        .eq('id', authUser.id)
        .maybeSingle();

      if (error) {
        console.warn("[App] Perfil não encontrado no DB (fallback ativo) ", error);
      }

      const isGestor = profile?.role === 'gestor';

      return {
        id:                 authUser.id,
        login:              profile?.employee_id || authUser.email,
        nome:               profile?.nome || authUser.email.split('@')[0],
        role:               profile?.role || 'gestor',
        nivel:              isGestor ? 'Administrador' : 'Operador',
        email:              authUser.email,
        grupo_acesso_id:    profile?.grupo_acesso_id ?? null,
        // null = sem restrição (gestor); array de paths = páginas do grupo
        paginas_permitidas: isGestor ? null : (profile?.grupos_acesso?.paginas ?? []),
      };
    } catch (e) {
      if (e.message === 'DB_TIMEOUT') {
        console.info("[App] Perfil carregado via Auth (DB offline/lento)");
      } else {
        console.error("[App] Erro crítico no carregamento do perfil:", e);
      }
      return basicUserData;
    }
  };

  useEffect(() => {
    let isMounted = true;

    // 1. Initial Check Session (Lê direto a fonte de verdade do Supabase)
    const initAuth = async () => {
      console.log('[App] initAuth iniciando...');
      // Safety timeout: não deixar o usuário preso na tela de loading por mais de 8s
      const authTimeout = setTimeout(() => {
        if (isMounted && isCheckingAuth) {
          console.warn("Auth initialization timed out - forcing continue");
          setIsCheckingAuth(false);
        }
      }, 8000);

      try {
        console.log('[App] Chamando getSession...');
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Supabase getSession error:", error);
          if (isMounted) {
            setSession(null);
            setIsCheckingAuth(false);
            clearTimeout(authTimeout);
          }
          return;
        }

        if (!isMounted) return;
        
        if (currentSession?.user) {
          console.log('[App] Sessão encontrada, buscando perfil...');
          const userData = await fetchUserProfile(currentSession.user);
          console.log('[App] Perfil carregado:', userData?.nome);
          if (isMounted) setSession(userData);
        } else {
          console.log('[App] Sem sessão ativa');
          if (isMounted) setSession(null);
        }
      } catch (e) {
        console.error("Auth initialization failed:", e);
      } finally {
        if (isMounted) {
          setIsCheckingAuth(false);
          clearTimeout(authTimeout);
        }
      }
    };

    initAuth();

    // 2. On Auth State Change Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, supabaseSession) => {
      console.log('[App] onAuthStateChange:', event);
      if (!isMounted) return;

      if (event === 'SIGNED_OUT') {
        setSession(null);
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (supabaseSession?.user) {
          console.log('[App] onAuthStateChange: buscando perfil para', supabaseSession.user.id);
          // Usuário convidado que ainda não trocou a senha → forçar UpdatePassword
          if (supabaseSession.user.user_metadata?.must_change_password) {
            if (window.location.pathname !== '/auth/update-password') {
              window.location.href = '/auth/update-password';
            }
            return;
          }
          const userData = await fetchUserProfile(supabaseSession.user);
          console.log('[App] onAuthStateChange: perfil carregado, setando session');
          if (isMounted) setSession(userData);
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleLogin = (user) => {
    // Esse callback ainda é recebido do <Login/> porque o Login 
    // chama signInWithPassword no form. Mas a maior parte o onAuthStateChange 
    // já cuida acima. Pode ser usado pras transições imeditas de UI.
    setSession(user);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  // Rotas de autenticação: interceptar ANTES do check de sessão
  // Necessário para o fluxo de convite e reset de senha via Supabase
  const currentPath = window.location.pathname;
  if (currentPath === '/auth/callback' || currentPath === '/auth/reset-password') {
    return <AuthCallbackPage />;
  }

  // Enquanto resolvemos a resposta Async do Supabase:
  if (isCheckingAuth) {
    return <FallbackLoader />;
  }

  // Não autenticado: login em /login, página pública em qualquer outra rota
  if (!session) {
    if (currentPath === '/login') {
      return <Login onLogin={handleLogin} />;
    }
    return <WelcomePage />;
  }

  return (
    <AppProvider session={session}>
      <Router>
        <div className="flex min-h-screen bg-white text-[var(--vp-text-data)] font-sans">
          <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

          <main className={`flex-1 flex flex-col ${isSidebarOpen ? 'lg:ml-72' : 'lg:ml-20'} min-w-0 transition-all duration-300 ease-in-out`}>
            <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} onLogout={handleLogout} session={session} />

            <div className="flex-1 overflow-x-hidden bg-white">
              <Suspense fallback={<FallbackLoader />}>
                <Routes>
                  {appRoutes.map((route) => (
                    <Route 
                      key={route.path} 
                      path={route.path} 
                      element={route.element} 
                    />
                  ))}
                  {/* Rota não existente vai para 404 Personalizado */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </div>
          </main>
          <ChatAssistant />
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;
