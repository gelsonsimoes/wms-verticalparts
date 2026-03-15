import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  FileText,
  UserCheck,
  Trash2,
  UserX,
  Mail,
  Edit3,
  Shield,
  Download,
  RefreshCcw,
  Search,
  X,
  AlertTriangle,
  Clock,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { getActivityLogs } from '../lib/supabaseClient';
import { cn } from '../utils/cn';

// ─── CONFIGURAÇÃO DE AÇÕES ────────────────────────────────────────────────────
const ACTION_CFG = {
  CRIAR_USUARIO:    { label: 'Criou usuário',       icon: UserCheck, color: 'text-green-700  bg-green-100  border-green-200',  dot: 'bg-green-500'  },
  ATUALIZAR_USUARIO:{ label: 'Atualizou usuário',   icon: Edit3,     color: 'text-blue-700   bg-blue-100   border-blue-200',   dot: 'bg-blue-500'   },
  INATIVAR_USUARIO: { label: 'Inativou usuário',    icon: UserX,     color: 'text-amber-700  bg-amber-100  border-amber-200',  dot: 'bg-amber-500'  },
  EXCLUIR_USUARIO:  { label: 'Excluiu usuário',     icon: Trash2,    color: 'text-red-700    bg-red-100    border-red-200',    dot: 'bg-red-500'    },
  ENVIAR_CONVITE:   { label: 'Enviou convite',      icon: Mail,      color: 'text-violet-700 bg-violet-100 border-violet-200', dot: 'bg-violet-500' },
  REDEFINIR_SENHA:  { label: 'Redefiniu senha',     icon: Shield,    color: 'text-slate-700  bg-slate-100  border-slate-200',  dot: 'bg-slate-400'  },
};

const DEFAULT_CFG = {
  label: 'Ação',
  icon: FileText,
  color: 'text-slate-700 bg-slate-100 border-slate-200',
  dot:   'bg-slate-400',
};

const PAGE_SIZE = 25;

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

function fmtDateShort(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function initials(name = '') {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '??';
}

const AVATAR_COLORS = [
  'bg-violet-600', 'bg-blue-600', 'bg-emerald-600', 'bg-amber-600',
  'bg-rose-600',   'bg-cyan-600', 'bg-indigo-600',  'bg-teal-600',
];

function avatarColor(email = '') {
  let h = 0;
  for (const c of email) h = (h * 31 + c.charCodeAt(0)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[h];
}

function exportXLS(rows) {
  const headers = ['Data/Hora', 'Colaborador', 'E-mail', 'Ação', 'Tipo Recurso', 'Nome do Recurso', 'Detalhes'];
  const lines = rows.map(r => [
    fmtDate(r.created_at),
    r.user_name || r.user_email,
    r.user_email,
    ACTION_CFG[r.action]?.label || r.action,
    r.resource_type || '—',
    r.resource_name || '—',
    JSON.stringify(r.details ?? {}),
  ].join(';'));

  const csv = '\uFEFF' + [headers.join(';'), ...lines].join('\r\n');
  const blob = new Blob([csv], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `relatorio_colaboradores_${new Date().toISOString().slice(0,10)}.xls`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── EMPTY STATE ──────────────────────────────────────────────────────────────
function EmptyState({ hasFilters }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-6">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
        <FileText className="w-8 h-8 text-slate-400" />
      </div>
      {hasFilters ? (
        <>
          <p className="text-sm font-black text-slate-600 uppercase tracking-widest">Nenhum registro encontrado</p>
          <p className="text-xs text-slate-400 mt-1">Tente ajustar os filtros.</p>
        </>
      ) : (
        <>
          <p className="text-sm font-black text-slate-600 uppercase tracking-widest">Nenhuma atividade registrada ainda</p>
          <p className="text-xs text-slate-400 mt-2 max-w-md">
            Os registros aparecem automaticamente conforme os colaboradores realizam ações no sistema
            (criar usuários, enviar convites, inativar, etc.).
          </p>
          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 text-left max-w-lg">
            <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-2 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Pré-requisito — Supabase SQL
            </p>
            <pre className="text-[10px] text-amber-800 font-mono whitespace-pre-wrap leading-relaxed">{`CREATE TABLE IF NOT EXISTS activity_logs (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email    TEXT NOT NULL,
  user_name     TEXT,
  action        TEXT NOT NULL,
  resource_type TEXT,
  resource_id   TEXT,
  resource_name TEXT,
  details       JSONB DEFAULT '{}',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leitura livre" ON activity_logs
  FOR SELECT USING (true);
CREATE POLICY "Inserção autenticada" ON activity_logs
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);`}</pre>
          </div>
        </>
      )}
    </div>
  );
}

// ─── COMPONENTE PRINCIPAL ────────────────────────────────────────────────────
export default function CollaboratorReport() {
  const [logs,        setLogs]        = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [collaborators, setCollaborators] = useState([]); // lista de emails únicos

  // Filtros
  const [filterEmail,  setFilterEmail]  = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [filterFrom,   setFilterFrom]   = useState('');
  const [filterTo,     setFilterTo]     = useState('');
  const [search,       setSearch]       = useState('');

  // Paginação
  const [page, setPage] = useState(1);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await getActivityLogs({
      userEmail: filterEmail || null,
      dateFrom:  filterFrom  || null,
      dateTo:    filterTo    || null,
      action:    filterAction || null,
      limit:     500,
    });
    if (err) {
      setError('Não foi possível carregar os registros. Verifique se a tabela activity_logs existe no Supabase.');
    } else {
      setLogs(data);
      // Extrai colaboradores únicos para o seletor
      const emails = [...new Set(data.map(d => d.user_email))].filter(Boolean);
      setCollaborators(emails);
    }
    setLoading(false);
  }, [filterEmail, filterAction, filterFrom, filterTo]);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    fetchLogs();
    setPage(1);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [fetchLogs]);

  // Filtro por texto livre (busca local)
  const filtered = useMemo(() => {
    if (!search.trim()) return logs;
    const q = search.toLowerCase();
    return logs.filter(l =>
      (l.user_name   || '').toLowerCase().includes(q) ||
      (l.user_email  || '').toLowerCase().includes(q) ||
      (l.action      || '').toLowerCase().includes(q) ||
      (l.resource_name || '').toLowerCase().includes(q) ||
      (ACTION_CFG[l.action]?.label || '').toLowerCase().includes(q)
    );
  }, [logs, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const hasFilters = !!(filterEmail || filterAction || filterFrom || filterTo || search);

  const clearFilters = () => {
    setFilterEmail('');
    setFilterAction('');
    setFilterFrom('');
    setFilterTo('');
    setSearch('');
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ══ HEADER ══════════════════════════════════════════════════════════ */}
      <div className="bg-white border-b-2 border-slate-100 px-6 py-5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-600 via-yellow-400 to-violet-600" />
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-violet-700 flex items-center justify-center shadow-lg shrink-0">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Cat. 11 — Segurança</p>
              <h1 className="text-lg font-black text-slate-900 uppercase tracking-tight">11.3 Relatório de Atividades dos Colaboradores</h1>
              <p className="text-xs text-slate-400 font-medium">Histórico completo · Quem fez o quê, quando e em qual recurso</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchLogs}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-black rounded-xl transition-all uppercase tracking-wider"
            >
              <RefreshCcw className={cn('w-3.5 h-3.5', loading && 'animate-spin')} /> Atualizar
            </button>
            <button
              onClick={() => exportXLS(filtered)}
              disabled={filtered.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-green-700 text-white text-xs font-black rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-md uppercase tracking-wider disabled:opacity-40"
            >
              <Download className="w-3.5 h-3.5" /> Excel ({filtered.length})
            </button>
          </div>
        </div>
      </div>

      {/* ══ FILTROS ═════════════════════════════════════════════════════════ */}
      <div className="bg-white border-b border-slate-100 px-6 py-4">
        <div className="flex flex-wrap gap-3 items-end">

          {/* Busca livre */}
          <div className="relative min-w-[200px] flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Buscar colaborador, ação..."
              className="w-full pl-9 pr-4 py-2.5 text-xs font-medium rounded-xl border-2 border-slate-200 focus:border-violet-400 outline-none transition-all bg-slate-50"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Colaborador */}
          <div className="flex flex-col gap-1 min-w-[200px]">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <Filter className="w-2.5 h-2.5" /> Colaborador
            </label>
            <div className="relative">
              <select
                value={filterEmail}
                onChange={e => { setFilterEmail(e.target.value); setPage(1); }}
                className="w-full py-2.5 pl-3 pr-8 text-xs font-medium rounded-xl border-2 border-slate-200 focus:border-violet-400 outline-none bg-slate-50 appearance-none cursor-pointer"
              >
                <option value="">Todos</option>
                {collaborators.map(email => (
                  <option key={email} value={email}>{email}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Tipo de ação */}
          <div className="flex flex-col gap-1 min-w-[180px]">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Tipo de Ação</label>
            <div className="relative">
              <select
                value={filterAction}
                onChange={e => { setFilterAction(e.target.value); setPage(1); }}
                className="w-full py-2.5 pl-3 pr-8 text-xs font-medium rounded-xl border-2 border-slate-200 focus:border-violet-400 outline-none bg-slate-50 appearance-none cursor-pointer"
              >
                <option value="">Todas</option>
                {Object.entries(ACTION_CFG).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Data inicial */}
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">De</label>
            <input
              type="date"
              value={filterFrom}
              onChange={e => { setFilterFrom(e.target.value); setPage(1); }}
              className="py-2.5 px-3 text-xs font-medium rounded-xl border-2 border-slate-200 focus:border-violet-400 outline-none bg-slate-50"
            />
          </div>

          {/* Data final */}
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Até</label>
            <input
              type="date"
              value={filterTo}
              onChange={e => { setFilterTo(e.target.value); setPage(1); }}
              className="py-2.5 px-3 text-xs font-medium rounded-xl border-2 border-slate-200 focus:border-violet-400 outline-none bg-slate-50"
            />
          </div>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border-2 border-slate-200 text-xs font-black text-slate-500 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all uppercase tracking-wider"
            >
              <X className="w-3 h-3" /> Limpar
            </button>
          )}
        </div>
      </div>

      {/* ══ RESUMO KPIs ═══════════════════════════════════════════════════ */}
      {!loading && logs.length > 0 && (
        <div className="px-6 pt-5 pb-0">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            {[
              { label: 'Total de Ações',    value: filtered.length,                                color: 'from-violet-600 to-violet-700' },
              { label: 'Colaboradores',     value: new Set(filtered.map(l => l.user_email)).size,  color: 'from-blue-600   to-blue-700'   },
              { label: 'Criações',          value: filtered.filter(l => l.action === 'CRIAR_USUARIO').length,   color: 'from-green-600  to-green-700'  },
              { label: 'Exclusões/Inativ.', value: filtered.filter(l => ['EXCLUIR_USUARIO','INATIVAR_USUARIO'].includes(l.action)).length, color: 'from-red-600    to-red-700'    },
            ].map(k => (
              <div key={k.label} className={cn('rounded-2xl bg-gradient-to-br text-white p-4 shadow-md', k.color)}>
                <p className="text-2xl font-black">{k.value}</p>
                <p className="text-[10px] font-bold opacity-70 uppercase tracking-wider mt-1">{k.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══ CONTEÚDO PRINCIPAL ════════════════════════════════════════════ */}
      <div className="px-6 pb-8">

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20 gap-3">
            <RefreshCcw className="w-5 h-5 text-violet-500 animate-spin" />
            <span className="text-sm font-bold text-slate-500">Carregando registros...</span>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-start gap-3 mt-4">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-black text-red-700">Erro ao carregar registros</p>
              <p className="text-xs text-red-600 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filtered.length === 0 && (
          <EmptyState hasFilters={hasFilters} />
        )}

        {/* Tabela */}
        {!loading && !error && filtered.length > 0 && (
          <div className="bg-white rounded-[24px] border-2 border-slate-100 overflow-hidden shadow-sm mt-4">
            {/* Toolbar */}
            <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <p className="text-xs font-black text-slate-600 uppercase tracking-wider">Histórico de Atividades</p>
                <span className="text-[9px] bg-violet-100 text-violet-700 font-black px-2 py-0.5 rounded-full">{filtered.length} registros</span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">
                Página {page} de {totalPages}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b-2 border-slate-100">
                    <th scope="col" className="p-3 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Data / Hora</th>
                    <th scope="col" className="p-3 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Colaborador</th>
                    <th scope="col" className="p-3 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Ação</th>
                    <th scope="col" className="p-3 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Recurso</th>
                    <th scope="col" className="p-3 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Detalhes</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((log, idx) => {
                    const cfg  = ACTION_CFG[log.action] ?? DEFAULT_CFG;
                    const Icon = cfg.icon;
                    return (
                      <tr
                        key={log.id ?? idx}
                        className="border-t border-slate-100 hover:bg-slate-50/60 transition-colors"
                      >
                        {/* Data */}
                        <td className="p-3 whitespace-nowrap">
                          <p className="text-[10px] font-black text-slate-700">{fmtDateShort(log.created_at)}</p>
                          <p className="text-[9px] text-slate-400">{new Date(log.created_at).toLocaleTimeString('pt-BR', { second: '2-digit', hour: '2-digit', minute: '2-digit' })}</p>
                        </td>

                        {/* Colaborador */}
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-[9px] font-black text-white shrink-0', avatarColor(log.user_email))}>
                              {initials(log.user_name || log.user_email)}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-800 whitespace-nowrap">
                                {log.user_name || log.user_email?.split('@')[0] || 'Desconhecido'}
                              </p>
                              <p className="text-[9px] text-slate-400 lowercase italic">{log.user_email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Ação */}
                        <td className="p-3">
                          <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[10px] font-black whitespace-nowrap', cfg.color)}>
                            <Icon className="w-3 h-3 shrink-0" aria-hidden="true" />
                            {cfg.label}
                          </span>
                        </td>

                        {/* Recurso */}
                        <td className="p-3">
                          {log.resource_name ? (
                            <div>
                              <p className="text-xs font-bold text-slate-700">{log.resource_name}</p>
                              {log.resource_type && (
                                <p className="text-[9px] text-slate-400 uppercase tracking-wider">{log.resource_type}</p>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs">—</span>
                          )}
                        </td>

                        {/* Detalhes */}
                        <td className="p-3 max-w-[240px]">
                          {log.details && Object.keys(log.details).length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {Object.entries(log.details).slice(0, 3).map(([k, v]) => (
                                <span key={k} className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-lg font-medium">
                                  {k}: {String(v).slice(0, 30)}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Paginação */}
            {totalPages > 1 && (
              <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-bold">
                  Exibindo {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft className="w-3.5 h-3.5 text-slate-600" />
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const p = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                    return (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={cn(
                          'w-7 h-7 rounded-lg text-[10px] font-black transition-all',
                          p === page
                            ? 'bg-violet-600 text-white shadow-md'
                            : 'border border-slate-200 text-slate-600 hover:bg-slate-100'
                        )}
                      >
                        {p}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
