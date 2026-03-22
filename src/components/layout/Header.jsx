import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell, Search, Menu, LogOut, Settings, User,
  Package, Zap, MapPin, ChevronRight, Loader2,
  Smartphone, Download, Copy, Check, X
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useApp } from '../../hooks/useApp';
import { supabase } from '../../lib/supabaseClient';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚠️  BLOCO PROTEGIDO — NÃO REMOVER  ⚠️
// Botão APP + Modal de download do app mobile VerticalParts
// Qualquer remoção deste bloco quebra o fluxo de instalação do app Android.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// APK_URL fallback (sobrescrita pelos dados dinâmicos de app_versions)
const APK_FALLBACK = 'https://github.com/gelsonsimoes/WMS_VerticalParts_Mobile/releases/download/v4.3.25/app-release.apk';

function AppDownloadModal({ onClose }) {
  const [copied, setCopied] = useState(false);
  const [apkUrl, setApkUrl]   = useState(APK_FALLBACK);
  const [versao, setVersao]   = useState('4.3.25');
  const [tamanho, setTamanho] = useState('30.8');
  const [loadingVer, setLoadingVer] = useState(true);
  const ref = useRef(null);

  // Busca versão mais recente do Supabase
  useEffect(() => {
    supabase
      .from('app_versions')
      .select('versao, apk_url, tamanho_mb, release_notes')
      .eq('ativo', true)
      .eq('plataforma', 'android')
      .order('criado_em', { ascending: false })
      .limit(1)
      .single()
      .then(({ data }) => {
        if (data) {
          setApkUrl(data.apk_url || APK_FALLBACK);
          setVersao(data.versao || '4.3.25');
          setTamanho(data.tamanho_mb ? String(data.tamanho_mb) : '30.8');
        }
        setLoadingVer(false);
      });
  }, []);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const handleCopy = () => {
    navigator.clipboard.writeText(apkUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div ref={ref} className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="bg-[var(--vp-primary)] px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-black" />
            <div>
              <span className="font-black text-sm uppercase tracking-widest text-black block">App Mobile</span>
              {!loadingVer && <span className="text-[9px] font-bold text-black/60 uppercase tracking-widest">v{versao} · {tamanho}MB</span>}
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-black/10 rounded transition-colors">
            <X className="w-4 h-4 text-black" />
          </button>
        </div>
        <div className="p-5 flex flex-col items-center gap-4">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest text-center">
            Escaneie com a câmera do celular
          </p>
          <div className="p-3 border-2 border-[var(--vp-primary)] rounded-xl bg-white shadow-inner">
            <QRCodeSVG
              value={apkUrl}
              size={180}
              bgColor="#ffffff"
              fgColor="#0a0a0a"
              level="M"
              imageSettings={{
                src: '/img/logo amarelosvg.svg',
                x: undefined, y: undefined,
                height: 28, width: 28,
                excavate: true,
              }}
            />
          </div>
          <p className="text-[10px] text-gray-400 text-center leading-relaxed">
            Android · v{versao} · {tamanho} MB<br/>
            Aceite &quot;instalar de fontes desconhecidas&quot; se solicitado
          </p>
          <div className="w-full flex flex-col gap-2">
            <a
              href={apkUrl}
              download
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-[var(--vp-primary)] text-black rounded-lg font-black text-xs uppercase tracking-widest hover:bg-[#F2C94C] transition-colors"
            >
              <Download className="w-4 h-4" />
              Baixar APK
            </a>
            <button
              onClick={handleCopy}
              className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-200 text-gray-600 rounded-lg font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Link copiado!' : 'Copiar link (WhatsApp)'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FIM DO BLOCO PROTEGIDO
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default function Header({ toggleSidebar, onLogout, session }) {
  const navigate = useNavigate();
  const { currentUser } = useApp();
  const user = session || currentUser;

  const [showAppModal, setShowAppModal] = useState(false);
  const handleCloseAppModal = useCallback(() => setShowAppModal(false), []);

  // ─── Lógica de Busca Global ──────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (!searchQuery.trim() || searchQuery.length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const query = searchQuery.trim();
        const searchResults = [];

        // 1. Buscar Produtos (SKU ou Descrição)
        const { data: prods } = await supabase
          .from('produtos')
          .select('id, sku, descricao')
          .or(`sku.ilike.%${query}%,descricao.ilike.%${query}%`)
          .limit(3);
        
        if (prods) {
          prods.forEach(p => searchResults.push({
            type: 'produto',
            title: p.sku,
            subtitle: p.descricao,
            link: `/cadastros/produtos?sku=${p.sku}`
          }));
        }

        // 2. Buscar Tarefas (ID)
        // Se for número, tenta buscar por ID
        if (!isNaN(query)) {
          const { data: task } = await supabase
            .from('tarefas')
            .select('id, tipo, status')
            .eq('id', query)
            .single();
          
          if (task) {
            searchResults.push({
              type: 'tarefa',
              title: `Tarefa #${task.id}`,
              subtitle: `${task.tipo} — ${task.status}`,
              link: `/operacao/kanban-alocacao?id=${task.id}`
            });
          }
        }

        // 3. Buscar Endereços
        const { data: addrs } = await supabase
          .from('enderecos')
          .select('id, status')
          .ilike('id', `%${query}%`)
          .limit(3);
        
        if (addrs) {
          addrs.forEach(a => searchResults.push({
            type: 'endereco',
            title: a.id,
            subtitle: `Status: ${a.status}`,
            link: `/operacao/mapa-visual?endereco=${a.id}`
          }));
        }

        setResults(searchResults);
      } catch (err) {
        console.error('[Header] Global search error:', err);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // Fechar busca ao clicar fora
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') setIsSearching(false); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-[var(--vp-border)] px-6 py-3 flex items-center justify-between shadow-sm">
      {/* Left Section: Menu Toggle + Logo */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 text-[var(--vp-text-label)] hover:bg-[var(--vp-bg-alt)] rounded-sm transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden lg:flex items-center gap-2">
          <div className="w-10 h-10 flex items-center justify-center shrink-0 overflow-hidden rounded-lg bg-black p-1 shadow-sm">
            <img 
              src="/img/logo amarelosvg.svg" 
              alt="VP" 
              className="w-full h-full object-contain"
              onError={(e) => { e.target.src = '/Favicon.svg'; }}
            />
          </div>
          <span className="text-sm font-black uppercase tracking-widest text-[var(--vp-text-data)]">
            VerticalParts WMS
          </span>
        </div>
      </div>

      {/* Center Section: Search Bar */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-8 relative">
        <div className="w-full relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearching(true)}
            placeholder="Buscar pedido, produto, carga..."
            className="w-full pl-4 pr-10 py-2 border border-[var(--vp-border)] rounded-sm text-sm bg-[var(--vp-bg-main)] focus:border-[var(--vp-primary)] focus:outline-none transition-colors shadow-inner font-bold"
          />
          {loading ? (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-500"></div>
            </div>
          ) : (
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--vp-text-label)] pointer-events-none" />
          )}
        </div>

        {/* Search Results Dropdown */}
        {isSearching && searchQuery.length > 1 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[var(--vp-border)] rounded-sm shadow-2xl overflow-hidden z-50 max-h-[400px] overflow-y-auto">
            {results.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {results.map((res, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      navigate(res.link);
                      setIsSearching(false);
                      setSearchQuery('');
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-yellow-50 flex items-center justify-between transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-50 rounded group-hover:bg-yellow-100 transition-colors">
                        {res.type === 'produto' && <Package size={16} className="text-blue-500" />}
                        {res.type === 'tarefa' && <Zap size={16} className="text-yellow-500" />}
                        {res.type === 'endereco' && <MapPin size={16} className="text-red-500" />}
                      </div>
                      <div>
                        <p className="text-[11px] font-black uppercase text-black">{res.title}</p>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none mt-1">{res.subtitle}</p>
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-gray-300 group-hover:text-yellow-600" />
                  </button>
                ))}
              </div>
            ) : !loading && (
              <div className="px-4 py-6 text-center">
                <p className="text-[10px] font-black uppercase text-gray-400">Nenhum resultado encontrado para "{searchQuery}"</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Section: Status, Notifications & User */}
      <div className="flex items-center gap-4">

        {/* ── BOTÃO APP — BLOCO PROTEGIDO, NÃO REMOVER ── */}
        <button
          onClick={() => setShowAppModal(true)}
          title="Baixar App Mobile"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-black text-[var(--vp-primary)] rounded-sm border border-[var(--vp-primary)]/30 hover:bg-[var(--vp-primary)] hover:text-black transition-colors"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span className="text-[10px] font-black uppercase tracking-widest">App</span>
        </button>
        {/* ── FIM BOTÃO APP ── */}

        {/* Status Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-800 rounded-sm border border-green-200">
          <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Sistema Online</span>
        </div>

        {/* Notifications */}
        <button className="p-2 text-[var(--vp-text-label)] hover:bg-[var(--vp-bg-alt)] rounded-sm transition-colors relative group">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-600 rounded-full" />
        </button>

        {/* Divider */}
        <div className="h-6 w-px bg-[var(--vp-border)]" />

        {/* User Menu */}
        <div className="flex items-center gap-3 group relative">
          <div className="hidden sm:block text-right">
            <p className="text-xs font-black text-[var(--vp-text-data)] uppercase">{user?.nome || 'Convidado'}</p>
            <p className="text-[10px] font-bold text-[var(--vp-text-label)] uppercase tracking-widest leading-none mt-0.5">
              {user?.login ? `ID: ${user.login}` : user?.role === 'gestor' ? 'Supervisor' : user?.role || 'Usuário'}
            </p>
          </div>
          <div className="w-8 h-8 bg-[var(--vp-primary)] rounded-sm flex items-center justify-center cursor-pointer hover:bg-[#F2C94C] transition-colors shadow-sm">
            <span className="text-xs font-black text-black">
              {user?.nome?.substring(0, 2).toUpperCase() || 'VP'}
            </span>
          </div>

          {/* Dropdown Menu */}
          <div className="absolute right-0 top-full mt-2 hidden group-hover:block bg-white border border-[var(--vp-border)] rounded-sm shadow-xl overflow-hidden min-w-[180px]">
            <div className="px-4 py-3 border-b border-[var(--vp-border)]">
              <p className="text-[10px] font-black text-[var(--vp-text-data)] uppercase">{user?.nome}</p>
              <p className="text-[9px] font-bold text-[var(--vp-text-label)] uppercase tracking-widest mt-0.5">{user?.nivel || user?.role}</p>
            </div>
            <button onClick={() => { navigate('/seguranca/usuarios'); setIsSearching(false); }} className="w-full px-4 py-2 text-left text-[10px] font-black uppercase text-[var(--vp-text-data)] hover:bg-[var(--vp-bg-alt)] flex items-center gap-2 transition-colors">
              <User size={14} /> Perfil
            </button>
            <button onClick={() => { navigate('/config/geral'); setIsSearching(false); }} className="w-full px-4 py-2 text-left text-[10px] font-black uppercase text-[var(--vp-text-data)] hover:bg-[var(--vp-bg-alt)] flex items-center gap-2 transition-colors">
              <Settings size={14} /> Configurações
            </button>
            <div className="h-px bg-[var(--vp-border)]" />
            <button
              onClick={onLogout}
              className="w-full px-4 py-2 text-left text-[10px] font-black uppercase text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
            >
              <LogOut size={14} /> Sair do sistema
            </button>
          </div>
        </div>
      </div>

      {/* ── MODAL APP — BLOCO PROTEGIDO, NÃO REMOVER ── */}
      {showAppModal && <AppDownloadModal onClose={handleCloseAppModal} />}
      {/* ── FIM MODAL APP ── */}
    </header>
  );
}
