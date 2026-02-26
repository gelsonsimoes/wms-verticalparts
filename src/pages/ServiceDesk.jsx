import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Terminal,
  Cpu,
  Database,
  Users,
  Tag,
  Download,
  Package,
  ChevronDown,
  ChevronUp,
  Calendar,
  Filter,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Activity,
  Server,
  Zap,
  MemoryStick,
  BarChart3,
  ClipboardList,
  FileSearch,
  HardDrive,
  Layers,
  Circle,
  History,
  Plus,
  Clock,
  LifeBuoy,
  UserCheck,
  MessageSquare,
  Search,
  Filter as FilterIcon,
  X,
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...i) { return twMerge(clsx(i)); }

// ─── CONSTANTES ───────────────────────────────────────────────────────
const WMS_VERSION = '4.11.3-RELEASE';
const BUILD       = '20260218.1142';

const PRIORITIES = {
  CRITICAL: { label: 'CRÍTICA', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  HIGH:     { label: 'ALTA',     color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  MEDIUM:   { label: 'MÉDIA',    color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  LOW:      { label: 'BAIXA',    color: 'text-slate-400', bg: 'bg-slate-400/10', border: 'border-slate-400/20' },
};

const TICKET_STATUS = {
  OPEN:        { label: 'Aberto',          color: 'text-green-400',  bg: 'bg-green-400/10' },
  IN_PROGRESS: { label: 'Em Atendimento',   color: 'text-blue-400',   bg: 'bg-blue-400/10' },
  DONE:        { label: 'Concluído',       color: 'text-slate-500',  bg: 'bg-slate-500/10' },
};

const MOCK_TICKETS = [
  { id: 'TK-8821', title: 'Impressora ZP-001 offline no Picking', priority: 'CRITICAL', status: 'IN_PROGRESS', author: 'Joao Silva', date: 'Hoje, 10:45', category: 'Hardware' },
  { id: 'TK-8822', title: 'Lentidão ao confirmar conferência cega', priority: 'HIGH', status: 'OPEN', author: 'Fernanda Reis', date: 'Hoje, 11:20', category: 'Software' },
  { id: 'TK-8819', title: 'Dúvida sobre faturamento de palete térmico', priority: 'MEDIUM', status: 'DONE', author: 'Carlos Luz', date: 'Ontem, 16:00', category: 'Processos' },
  { id: 'TK-8815', title: 'Solicitação de nova senha coletor RF-04', priority: 'LOW', status: 'DONE', author: 'Pedro Santos', date: 'Ontem, 14:30', category: 'Acessos' },
];

// ─── GERADOR DE LINHAS DE LOG ─────────────────────────────────────────
const LOG_TEMPLATES = [
  (t) => `[${t}] [INFO ] [main] com.vp.wms.http.RequestFilter - GET /api/v1/stock/query 200 OK (38ms)`,
  (t) => `[${t}] [INFO ] [scheduler-1] com.vp.wms.job.SyncJob - Sincronização ERP concluída. 142 pedidos processados.`,
  (t) => `[${t}] [WARN ] [async-pool-3] com.vp.wms.nfe.SefazClient - Endpoint homologação lento: 298ms`,
  (t) => `[${t}] [INFO ] [async-pool-2] com.vp.wms.auth.SessionManager - Sessão renovada: user_id=8821 (joao.silva)`,
  (t) => `[${t}] [DEBUG] [main] com.vp.wms.db.HikariPool - Pool stats: active=12, idle=4, pending=0`,
  (t) => `[${t}] [INFO ] [http-8080-6] com.vp.wms.picking.WaveService - Onda SEP-0921 iniciada. 8 operadores alocados.`,
  (t) => `[${t}] [ERROR] [async-pool-1] com.vp.wms.integration.OmieAdapter - Timeout ao buscar pedidos. Retry 1/3`,
  (t) => `[${t}] [INFO ] [main] com.vp.wms.http.RequestFilter - POST /api/v1/nfe/transmit 202 Accepted (115ms)`,
  (t) => `[${t}] [INFO ] [gc-notifier] com.vp.wms.core.GCListener - GC pause: 42ms (YoungGen)`,
  (t) => `[${t}] [WARN ] [scheduler-2] com.vp.wms.cert.CertificateWatcher - Certificado vence em 25 dias!`,
  (t) => `[${t}] [INFO ] [async-pool-4] com.vp.wms.inventory.AuditJob - Auditoria parcial concluída. 312 SKUs verificados.`,
  (t) => `[${t}] [INFO ] [http-8080-3] com.vp.wms.auth.LoginController - Login: fernanda.reis@vp.com (IP: 10.0.4.21)`,
  (t) => `[${t}] [DEBUG] [main] com.vp.wms.cache.EhcacheManager - Cache hit ratio: 94.3%`,
  (t) => `[${t}] [ERROR] [async-pool-2] com.vp.wms.xml.XmlValidator - NF 000.922 rejeitada pela SEFAZ: cStat=302`,
  (t) => `[${t}] [INFO ] [http-8080-11] com.vp.wms.label.PrintService - 14 etiquetas enviadas p/ impressora ZP-001`,
];

function fmtTimestamp() {
  return new Date().toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit', second:'2-digit' }) +
    '.' + String(Math.floor(Math.random() * 999)).padStart(3, '0');
}

function gerarLog() {
  const tpl = LOG_TEMPLATES[Math.floor(Math.random() * LOG_TEMPLATES.length)];
  return tpl(fmtTimestamp());
}

function logColor(line) {
  if (line.includes('[ERROR]')) return 'text-red-400';
  if (line.includes('[WARN ]')) return 'text-amber-400';
  if (line.includes('[DEBUG]')) return 'text-slate-500';
  return 'text-green-400';
}

function logPrefix(line) {
  if (line.includes('[ERROR]')) return '✖';
  if (line.includes('[WARN ]')) return '⚠';
  if (line.includes('[DEBUG]')) return '·';
  return '▶';
}

// ─── RAM GRÁFICO ─────────────────────────────────────────────────────
function RamBar({ pct }) {
  const color = pct < 60 ? 'from-green-500 to-green-400' : pct < 80 ? 'from-amber-500 to-amber-400' : 'from-red-600 to-red-500';
  return (
    <div className="space-y-1.5 mt-2">
      <div className="flex justify-between text-[9px] font-black text-slate-500">
        <span>0 GB</span><span className={cn('font-black', pct >= 80 ? 'text-red-500' : pct >= 60 ? 'text-amber-500' : 'text-green-500')}>{pct}%</span><span>32 GB</span>
      </div>
      <div className="relative w-full h-5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
        <div className={cn('absolute top-0 left-0 h-full rounded-full bg-gradient-to-r transition-all duration-700', color)}
          style={{ width: `${pct}%` }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[9px] font-black text-white drop-shadow">{(pct * 0.32).toFixed(1)} GB / 32 GB</span>
        </div>
      </div>
      {/* Segmentos */}
      <div className="grid grid-cols-4 gap-0.5">
        {['Heap JVM','OS','Buffers','Livre'].map((l, i) => {
          const vals = [pct * 0.5, 12, 8, 100 - pct - 20].map(v => Math.max(0, v));
          const segColor = i === 0 ? 'bg-green-600' : i === 1 ? 'bg-blue-600' : i === 2 ? 'bg-purple-600' : 'bg-slate-700';
          return (
            <div key={l} className="text-center">
              <div className={cn('h-1 rounded-full mb-1', segColor)} />
              <p className="text-[7px] text-slate-500 font-bold">{l}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── CARD KPI ─────────────────────────────────────────────────────────
function KpiCard({ icon: Icon, label, value, sub, color, extra }) {
  return (
    <div className="bg-slate-900 border-2 border-slate-800 rounded-[20px] p-5 shadow-md space-y-2 flex flex-col">
      <div className="flex items-center justify-between">
        <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center', color + '/20 border border-' + color + '/30')}>
          <Icon className={cn('w-4.5 h-4.5', 'text-' + color.split('-')[1] + '-' + (color.includes('green') ? 'green-400' : 'white'))} style={{}} />
        </div>
        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
      </div>
      <p className={cn('text-2xl font-black leading-none', color.includes('red') ? 'text-red-400' : color.includes('amber') ? 'text-amber-400' : color.includes('blue') ? 'text-blue-400' : color.includes('green') ? 'text-green-400' : 'text-white')}>{value}</p>
      {sub  && <p className="text-[10px] text-slate-500 font-medium">{sub}</p>}
      {extra}
    </div>
  );
}

// ─── TIPOLOGIA DE LOG ─────────────────────────────────────────────────
const TIPOS_LOG = ['Todos', 'Logs de Erro', 'Logs Tomcat / JBoss', 'Logs de Integração'];

// ─── COMPONENTE ROOT ─────────────────────────────────────────────────
export default function ServiceDesk() {
  const [activeTab, setActiveTab] = useState('tickets'); // 'tickets' ou 'health'

  // ── sistema health (simula refresh) ──
  const [ram,        setRam]        = useState(68);
  const [dbConn,     setDbConn]     = useState(14);
  const [usersOnl,   setUsersOnl]   = useState(7);
  const [uptime,     setUptime]     = useState(99.98);
  const [refreshing, setRefreshing] = useState(false);

  // ── tickets ──
  const [tickets,     setTickets]     = useState(MOCK_TICKETS);
  const [searchQuery, setsearchQuery] = useState('');
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);

  // ── coleta de logs ──
  const [dtIni,    setDtIni]    = useState('2026-02-22T00:00');
  const [dtFim,    setDtFim]    = useState('2026-02-22T23:59');
  const [tipoLog,  setTipoLog]  = useState('Todos');
  const [gerandoZip, setGerandoZip] = useState(false);
  const [zipMsg,   setZipMsg]   = useState(null);

  // ── console ──
  const [consoleOpen, setConsoleOpen] = useState(true);
  const [logLines,    setLogLines]    = useState(() => Array.from({ length: 20 }, gerarLog));
  const [paused,      setPaused]      = useState(false);
  const [filter,      setFilter]      = useState('');
  const consoleRef = useRef(null);
  const pausedRef  = useRef(paused);
  useEffect(() => { pausedRef.current = paused; }, [paused]);

  // ── streaming de logs ──
  useEffect(() => {
    const interval = setInterval(() => {
      if (!pausedRef.current) {
        setLogLines(prev => [...prev.slice(-49), gerarLog()]);
      }
    }, 1400);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll
  useEffect(() => {
    if (!paused && consoleOpen && consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [logLines, paused, consoleOpen]);

  // Linhas filtradas no console
  const filteredLines = useMemo(() =>
    filter ? logLines.filter(l => l.toLowerCase().includes(filter.toLowerCase())) : logLines,
  [logLines, filter]);

  // ── refresh de métricas ──
  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRam(Math.floor(Math.random() * 30 + 55));
      setDbConn(Math.floor(Math.random() * 10 + 8));
      setUsersOnl(Math.floor(Math.random() * 6 + 5));
      setUptime(+(99 + Math.random() * 0.99).toFixed(2));
      setRefreshing(false);
    }, 1200);
  };

  // ── gerar pacote ZIP ──
  const gerarZip = () => {
    setGerandoZip(true);
    setZipMsg(null);
    setTimeout(() => {
      // gera arquivo de texto simulado como blob
      const conteudo = [
        '=== VerticalParts WMS Diagnostic Package ===',
        `Gerado em: ${new Date().toLocaleString('pt-BR')}`,
        `Versão: ${WMS_VERSION} (build ${BUILD})`,
        `Período: ${dtIni} → ${dtFim}`,
        `Tipo de Log: ${tipoLog}`,
        `RAM: ${ram}% | DB Connections: ${dbConn} | Usuários: ${usersOnl}`,
        '',
        '=== ÚLTIMAS LINHAS DE LOG ===',
        ...logLines.slice(-50),
      ].join('\n');
      const blob = new Blob([conteudo], { type: 'text/plain' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url;
      a.download = `vp_diagnostic_${new Date().toISOString().slice(0,10)}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      setGerandoZip(false);
      setZipMsg('✓ Pacote gerado e baixado com sucesso!');
      setTimeout(() => setZipMsg(null), 5000);
    }, 2800);
  };

  const errorCount   = logLines.filter(l => l.includes('[ERROR]')).length;
  const warnCount    = logLines.filter(l => l.includes('[WARN ]')).length;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col animate-in fade-in duration-700">

      {/* ══════ HEADER ══════ */}
      <div className="bg-slate-900 border-b-2 border-slate-800 px-6 py-5 relative overflow-hidden shrink-0">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-slate-700 via-green-600 to-slate-700" />
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 flex items-center justify-center shrink-0 overflow-hidden">
            <img src="/logo.svg" alt="VerticalParts Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Cat. 11 — Administração e Manutenção &gt; Service Desk</p>
            <h1 className="text-lg font-black text-white uppercase tracking-tight">
              {activeTab === 'tickets' ? 'Portal de Suporte Operacional' : 'Saúde e Diagnóstico do Sistema'}
            </h1>
            <div className="flex items-center gap-4 mt-2">
              <button 
                onClick={() => setActiveTab('tickets')}
                className={cn(
                  "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                  activeTab === 'tickets' ? "bg-primary text-slate-900" : "text-slate-500 hover:text-slate-300"
                )}
              >
                Tickets Operacionais
              </button>
              <button 
                onClick={() => setActiveTab('health')}
                className={cn(
                  "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                  activeTab === 'health' ? "bg-primary text-slate-900" : "text-slate-500 hover:text-slate-300"
                )}
              >
                Saúde do Sistema
              </button>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-3">
            {activeTab === 'health' && (
              <>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-950/40 border border-green-800/40 rounded-xl">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-black text-green-400 uppercase tracking-wider">Uptime {uptime}%</span>
                </div>
                <button onClick={handleRefresh} disabled={refreshing}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-700 rounded-xl text-[10px] font-black text-slate-400 hover:border-slate-500 hover:text-white transition-all">
                  <RefreshCw className={cn('w-3.5 h-3.5', refreshing && 'animate-spin text-green-400')} />
                  {refreshing ? 'Atualizando...' : 'Atualizar'}
                </button>
              </>
            )}
            {activeTab === 'tickets' && (
              <button 
                onClick={() => setShowNewTicketModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-secondary text-primary rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-secondary/20"
              >
                <Plus className="w-4 h-4" /> Novo Chamado
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-5 space-y-5">
          {activeTab === 'tickets' ? (
            <div className="animate-in slide-in-from-bottom-4 duration-500">
              {/* === TABS TICKETS (RESUMO) === */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Total de Tickets', value: tickets.filter(t => t.status !== 'DONE').length, icon: ClipboardList, color: 'text-white' },
                  { label: 'Em Aberto', value: tickets.filter(t => t.status === 'OPEN').length, icon: Circle, color: 'text-green-400' },
                  { label: 'Em Atendimento', value: tickets.filter(t => t.status === 'IN_PROGRESS').length, icon: MessageSquare, color: 'text-blue-400' },
                  { label: 'Resolvidos (Hoje)', value: tickets.filter(t => t.status === 'DONE').length, icon: CheckCircle2, color: 'text-slate-500' },
                ].map((k, i) => (
                  <div key={i} className="bg-slate-900 border-2 border-slate-800 rounded-2xl p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
                      <k.icon className={cn("w-5 h-5", k.color)} />
                    </div>
                    <div>
                      <p className="text-xl font-black text-white">{k.value}</p>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{k.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* === FILTROS E BUSCA === */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1 relative">
                  <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text"
                    placeholder="Buscar chamados por título, ID ou autor..."
                    className="w-full bg-slate-900 border-2 border-slate-800 rounded-2xl pl-12 pr-4 py-3 text-xs font-bold text-white outline-none focus:border-primary transition-all"
                  />
                </div>
                <button className="px-5 py-3 bg-slate-900 border-2 border-slate-800 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 hover:bg-slate-800 transition-all">
                  <FilterIcon className="w-4 h-4" /> Filtros
                </button>
              </div>

              {/* === GRID DE TICKETS === */}
              <div className="bg-slate-900 border-2 border-slate-800 rounded-[2rem] overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b-2 border-slate-800">
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Ticket</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Prioridade</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Responsável</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                      <th className="px-12 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {tickets.map(ticket => (
                      <tr key={ticket.id} className="group hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-400">
                              {ticket.category.charAt(0)}
                            </div>
                            <div>
                              <p className="text-[11px] font-black text-white">{ticket.title}</p>
                              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">
                                {ticket.id} • {ticket.category} • {ticket.date}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex justify-center">
                            <span className={cn(
                              "px-3 py-1 rounded-full text-[8px] font-black border uppercase tracking-widest",
                              PRIORITIES[ticket.priority].color,
                              PRIORITIES[ticket.priority].bg,
                              PRIORITIES[ticket.priority].border,
                            )}>
                              {PRIORITIES[ticket.priority].label}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[8px] font-black text-slate-300">
                              {ticket.author.charAt(0)}
                            </div>
                            <span className="text-[10px] font-bold text-slate-400">{ticket.author}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className={cn(
                            "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter",
                            TICKET_STATUS[ticket.status].bg,
                            TICKET_STATUS[ticket.status].color,
                          )}>
                            {TICKET_STATUS[ticket.status].label}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all">
                            Gerenciar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-5">
              {/* ══════ CARDS SAÚDE DO SISTEMA (CONTEÚDO EXISTENTE) ══════ */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Versão WMS */}
            <div className="bg-slate-900 border-2 border-slate-800 rounded-[20px] p-5 shadow-md">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600/15 border border-blue-600/30 flex items-center justify-center">
                  <Tag className="w-4 h-4 text-blue-400" />
                </div>
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Versão WMS</span>
              </div>
              <p className="text-xl font-black text-white font-mono">{WMS_VERSION}</p>
              <p className="text-[9px] text-slate-500 font-medium mt-1">Build: {BUILD}</p>
              <div className="mt-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-green-500" />
                <span className="text-[9px] font-bold text-green-500">Atualizado</span>
              </div>
            </div>

            {/* RAM */}
            <div className="bg-slate-900 border-2 border-slate-800 rounded-[20px] p-5 shadow-md">
              <div className="flex items-center justify-between mb-1">
                <div className="w-9 h-9 rounded-xl bg-amber-600/15 border border-amber-600/30 flex items-center justify-center">
                  <HardDrive className="w-4 h-4 text-amber-400" />
                </div>
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">RAM</span>
              </div>
              <p className={cn('text-xl font-black', ram >= 80 ? 'text-red-400' : ram >= 60 ? 'text-amber-400' : 'text-green-400')}>{ram}%</p>
              <RamBar pct={ram} />
            </div>

            {/* Conexões DB */}
            <div className="bg-slate-900 border-2 border-slate-800 rounded-[20px] p-5 shadow-md">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-purple-600/15 border border-purple-600/30 flex items-center justify-center">
                  <Database className="w-4 h-4 text-purple-400" />
                </div>
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Conexões DB</span>
              </div>
              <p className="text-2xl font-black text-purple-400">{dbConn}</p>
              <p className="text-[9px] text-slate-500 font-medium mt-1">Pool HikariCP · max: 30</p>
              <div className="mt-2 w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-purple-600 rounded-full transition-all duration-700" style={{ width: `${(dbConn / 30) * 100}%` }} />
              </div>
              <div className="flex justify-between text-[8px] text-slate-600 mt-0.5 font-bold">
                <span>0</span><span className="text-purple-500">{Math.round((dbConn / 30) * 100)}% utilização</span><span>30</span>
              </div>
            </div>

            {/* Usuários Online */}
            <div className="bg-slate-900 border-2 border-slate-800 rounded-[20px] p-5 shadow-md">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-green-600/15 border border-green-600/30 flex items-center justify-center">
                  <Users className="w-4 h-4 text-green-400" />
                </div>
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Usuários Online</span>
              </div>
              <p className="text-2xl font-black text-green-400">{usersOnl}</p>
              <p className="text-[9px] text-slate-500 font-medium mt-1">Sessões ativas no momento</p>
              <div className="flex gap-1 mt-2">
                {Array.from({ length: usersOnl }).map((_, i) => (
                  <div key={i} className="w-5 h-5 rounded-full bg-green-700/60 border border-green-600/50 flex items-center justify-center">
                    <Users className="w-2.5 h-2.5 text-green-400" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Linha 2 — mini KPIs extras */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: AlertCircle, label: 'Erros últimos 50 logs', value: errorCount, c: errorCount > 0 ? 'text-red-400' : 'text-slate-500', bg: 'bg-red-600/10 border-red-700/30' },
              { icon: Activity,    label: 'Warnings últimos 50 logs', value: warnCount, c: warnCount > 0 ? 'text-amber-400' : 'text-slate-500', bg: 'bg-amber-600/10 border-amber-700/30' },
              { icon: Server,      label: 'Servidor de Aplicação', value: 'Jboss 7.4', c: 'text-blue-400', bg: 'bg-blue-600/10 border-blue-700/30' },
            ].map(k => (
              <div key={k.label} className={cn('bg-slate-900 border-2 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm', k.bg)}>
                <k.icon className={cn('w-5 h-5 shrink-0', k.c)} />
                <div>
                  <p className={cn('text-lg font-black', k.c)}>{k.value}</p>
                  <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{k.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ══════ COLETA DE LOGS ══════ */}
          <div className="bg-slate-900 border-2 border-slate-800 rounded-[24px] p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <FileSearch className="w-4 h-4 text-blue-400" />
              <p className="text-xs font-black text-white uppercase tracking-wider">Coleta e Exportação de Logs</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
              {/* Data/Hora Início */}
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                  <Calendar className="w-3 h-3" />Data/Hora Início
                </label>
                <input type="datetime-local" value={dtIni} onChange={e => setDtIni(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border-2 border-slate-700 focus:border-blue-500 rounded-xl text-xs font-bold text-white outline-none transition-all" />
              </div>
              {/* Data/Hora Fim */}
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                  <Calendar className="w-3 h-3" />Data/Hora Fim
                </label>
                <input type="datetime-local" value={dtFim} onChange={e => setDtFim(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border-2 border-slate-700 focus:border-blue-500 rounded-xl text-xs font-bold text-white outline-none transition-all" />
              </div>
              {/* Tipo de Log */}
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                  <Layers className="w-3 h-3" />Tipo de Log
                </label>
                <div className="relative">
                  <select value={tipoLog} onChange={e => setTipoLog(e.target.value)}
                    className="w-full appearance-none pl-3 pr-8 py-2 bg-slate-800 border-2 border-slate-700 focus:border-blue-500 rounded-xl text-xs font-bold text-white outline-none cursor-pointer transition-all">
                    {TIPOS_LOG.map(t => <option key={t}>{t}</option>)}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
              {/* Botão */}
              <div>
                <button onClick={gerarZip} disabled={gerandoZip}
                  className={cn('w-full py-2.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 uppercase tracking-widest transition-all shadow-lg',
                    gerandoZip
                      ? 'bg-slate-700 text-slate-500 cursor-wait'
                      : 'bg-gradient-to-r from-blue-700 to-blue-600 text-white hover:scale-[1.02] hover:shadow-blue-900/40 active:scale-[0.98]'
                  )}>
                  {gerandoZip
                    ? <><Loader2 className="w-4 h-4 animate-spin" />Gerando...</>
                    : <><Package className="w-4 h-4" />Gerar Pacote (.ZIP)</>}
                </button>
              </div>
            </div>

            {gerandoZip && (
              <div className="bg-blue-950/30 border border-blue-800/40 rounded-xl p-3">
                <div className="flex items-center gap-2 text-[10px] text-blue-300 font-bold">
                  <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                  Coletando arquivos de log... capturando métricas do sistema... comprimindo pacote de diagnóstico...
                </div>
                <div className="mt-2 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-700 to-blue-400 rounded-full animate-pulse" style={{ width: '70%' }} />
                </div>
              </div>
            )}

            {zipMsg && (
              <div className="flex items-center gap-2 px-3 py-2 bg-green-950/30 border border-green-800/40 rounded-xl text-[11px] font-black text-green-400">
                <CheckCircle2 className="w-4 h-4 shrink-0" />{zipMsg}
              </div>
            )}

            <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-3 flex items-start gap-2 text-[10px] text-slate-500">
              <ClipboardList className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-600" />
              <span>O pacote incluirá: <strong className="text-slate-400">logs filtrados</strong>, dump de métricas de memória, status dos endpoints SEFAZ e informações de versão — pronto para envio ao Suporte Nível 3.</span>
            </div>
          </div>

          {/* ══════ CONSOLE / TERMINAL ══════ */}
          <div className="bg-black border-2 border-slate-800 rounded-[24px] overflow-hidden shadow-2xl">
            {/* Barra de título estilo terminal */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <span className="text-[10px] font-black text-slate-400 font-mono ml-2">
                  vp-wms-server — /opt/jboss/standalone/log/server.log
                </span>
                <div className={cn('w-2 h-2 rounded-full ml-2', paused ? 'bg-amber-500' : 'bg-green-500 animate-pulse')} />
                <span className={cn('text-[9px] font-black', paused ? 'text-amber-400' : 'text-green-400')}>{paused ? 'Pausado' : 'Ao vivo'}</span>
              </div>
              <div className="flex items-center gap-2">
                {/* Filtro de console */}
                <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Filtrar logs..."
                  className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-[10px] font-mono text-slate-300 outline-none focus:border-green-500 w-36 transition-all" />
                <button onClick={() => setPaused(p => !p)}
                  className={cn('px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all',
                    paused ? 'bg-green-700 text-white' : 'bg-amber-800/60 text-amber-300 hover:bg-amber-700/60'
                  )}>
                  {paused ? '▶ Retomar' : '⏸ Pausar'}
                </button>
                <button onClick={() => setConsoleOpen(o => !o)}
                  className="text-slate-500 hover:text-slate-300 transition-colors p-1">
                  {consoleOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {consoleOpen && (
              <div ref={consoleRef}
                className="h-64 overflow-y-auto p-3 space-y-0.5 font-mono text-[11px] leading-relaxed scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-black">
                {filteredLines.length === 0
                  ? <p className="text-slate-600">Nenhuma linha corresponde ao filtro.</p>
                  : filteredLines.map((line, i) => (
                    <div key={i} className={cn('flex items-start gap-2 group hover:bg-white/5 px-1 rounded transition-all', logColor(line))}>
                      <span className="shrink-0 opacity-50 select-none text-[10px] w-4">{logPrefix(line)}</span>
                      <span className="break-all select-text">{line}</span>
                    </div>
                  ))}
              </div>
            )}

            {/* Barra de status do console */}
            <div className="flex items-center gap-4 px-4 py-1.5 bg-slate-900/80 border-t border-slate-800 text-[9px] font-mono font-bold">
              <span className="text-slate-600">{filteredLines.length} linha{filteredLines.length !== 1 ? 's' : ''}</span>
              <span className="text-red-400">{logLines.filter(l => l.includes('[ERROR]')).length} erros</span>
              <span className="text-amber-400">{logLines.filter(l => l.includes('[WARN ]')).length} warnings</span>
              <span className="ml-auto text-slate-600">UTF-8 · tail -f server.log</span>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>

  {/* ══════ MODAL NOVO CHAMADO ══════ */}
  {showNewTicketModal && (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-slate-900 border-2 border-slate-800 rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="px-8 py-6 border-b border-slate-800 flex items-center justify-between bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Plus className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white uppercase tracking-tight">Novo Chamado</h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Suporte Operacional WMS</p>
            </div>
          </div>
          <button 
            onClick={() => setShowNewTicketModal(false)}
            className="w-10 h-10 rounded-xl hover:bg-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form className="p-8 space-y-5" onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          const newTicket = {
            id: `TK-${Math.floor(Math.random() * 9000 + 1000)}`,
            title: formData.get('title'),
            category: formData.get('category'),
            priority: formData.get('priority'),
            status: 'OPEN',
            author: 'Gestor Logístico',
            date: 'Hoje, agora'
          };
          setTickets([newTicket, ...tickets]);
          setShowNewTicketModal(false);
        }}>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Assunto do Incidente</label>
            <input 
              name="title"
              required
              placeholder="Ex: Impressora de etiquetas sem comunicação"
              className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl px-5 py-3.5 text-xs font-bold text-white outline-none focus:border-primary transition-all placeholder:text-slate-700"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Categoria</label>
              <select name="category" className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl px-4 py-3.5 text-xs font-bold text-white outline-none focus:border-primary transition-all appearance-none cursor-pointer">
                <option>Hardware</option>
                <option>Software</option>
                <option>Processos</option>
                <option>Acessos</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Prioridade</label>
              <select name="priority" className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl px-4 py-3.5 text-xs font-bold text-white outline-none focus:border-primary transition-all appearance-none cursor-pointer">
                <option value="CRITICAL">Muito Alta / Crítica</option>
                <option value="HIGH">Alta</option>
                <option value="MEDIUM">Média</option>
                <option value="LOW">Baixa</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5 pt-2">
            <button 
              type="submit"
              className="w-full bg-primary text-slate-950 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/20"
            >
              Confirmar e Abrir Chamado
            </button>
            <p className="text-center text-[9px] text-slate-600 font-bold uppercase tracking-widest">
              O SLA de atendimento inicial é de 15 minutos para tickets críticos.
            </p>
          </div>
        </form>
      </div>
    </div>
  )}
</div>
);
}
