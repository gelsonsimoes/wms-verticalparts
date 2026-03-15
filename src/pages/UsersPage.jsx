import React, { useState, useId, useRef, useMemo } from 'react';
import { useApp } from '../hooks/useApp';
import { supabase } from '../services/supabaseClient';
import {
  User,
  Plus,
  Save,
  Trash2,
  FileText,
  LayoutGrid,
  Shield,
  Building2,
  Printer,
  CheckCircle2,
  AlertCircle,
  X,
  Mail,
  Key,
  History,
  UserCheck,
  UserMinus,
  RefreshCcw,
  Lock,
  CheckSquare,
  Square,
  Send,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import ActionPane from '../components/ui/ActionPane';
import DataGrid from '../components/ui/DataGrid';
import FastTab from '../components/ui/FastTab';

// ─── Lista de todas as páginas agrupadas por seção ────────────────────────────
const PAGE_SECTIONS = [
  {
    section: '2. OPERAR', items: [
      { path: '/operacao/cruzar-docas',           label: '2.1 Cruzar Docas' },
      { path: '/operacao/processar-devolucoes',   label: '2.2 Processar Devoluções' },
      { path: '/operacao/pesar-cargas',           label: '2.3 Pesar Cargas' },
      { path: '/operacao/gerenciar-recebimento',  label: '2.4 Gerenciar Recebimento' },
      { path: '/operacao/conferir-recebimento',   label: '2.5 Conferir Recebimento' },
      { path: '/operacao/gerar-mapa',             label: '2.6 Gerar Mapa de Alocação' },
      { path: '/operacao/conferencia-cega',       label: '2.7 Conferência Cega' },
      { path: '/operacao/alocar-estoque',         label: '2.8 Alocar Estoque' },
      { path: '/operacao/kanban-alocacao',        label: '2.9 Kanban de Alocação' },
      { path: '/operacao/separar-pedidos',        label: '2.10 Separar Pedidos' },
      { path: '/operacao/embalar-pedidos',        label: '2.11 Embalar Pedidos' },
      { path: '/operacao/monitorar-saida',        label: '2.12 Monitorar Saída' },
      { path: '/operacao/recebimento',            label: '2.13 Recebimento (Check-in)' },
      { path: '/operacao/estacao-kits',           label: '2.14 Estação de Kits' },
      { path: '/operacao/conferencia-colmeia',    label: '2.15 Conferência Colmeia' },
      { path: '/operacao/mapa-visual',            label: '2.16 Mapa Visual de Estoque' },
      { path: '/operacao/buffer-1',               label: '2.17 Buffer 1' },
      { path: '/operacao/buffer-2',               label: '2.18 Buffer 2' },
      { path: '/operacao/ordem-servico',          label: '2.19 Ordem de Serviço' },
      { path: '/operacao/gestao-seguros',         label: '2.20 Gestão de Seguros' },
      { path: '/operacao/pesagem-rodoviaria',     label: '2.21 Pesagem Rodoviária' },
      { path: '/operacao/gerenciamento-pedidos',  label: '2.22 Gerenciamento de Pedidos' },
    ]
  },
  {
    section: '3. PLANEJAR', items: [
      { path: '/planejamento/gerar-ondas',          label: '3.1 Gerar Ondas de Separação' },
      { path: '/planejamento/monitorar-prazos',     label: '3.2 Monitorar Prazos (SLA)' },
      { path: '/planejamento/agendar-transportes',  label: '3.3 Agendar Transportes' },
      { path: '/planejamento/monitorar-atividades', label: '3.4 Monitorar Atividades' },
      { path: '/planejamento/gerenciar-manifestos', label: '3.5 Gerenciar Manifestos' },
      { path: '/planejamento/expedir-cargas',       label: '3.6 Expedir Cargas' },
      { path: '/planejamento/gerenciar-portaria',   label: '3.7 Gerenciar Portaria' },
      { path: '/planejamento/atividades-docas',     label: '3.8 Atividades de Docas' },
    ]
  },
  {
    section: '4. CONTROLAR', items: [
      { path: '/estoque/auditar-inventario',  label: '4.1 Auditar Inventário' },
      { path: '/estoque/consultar-kardex',    label: '4.2 Consultar Kardex' },
      { path: '/estoque/analisar-estoque',    label: '4.3 Analisar Estoque' },
      { path: '/estoque/remanejar',           label: '4.4 Remanejar Produtos' },
      { path: '/estoque/controlar-lotes',     label: '4.5 Controlar Lotes e Validade' },
      { path: '/estoque/monitorar-avarias',   label: '4.6 Monitorar Avarias' },
      { path: '/estoque/gestao-inventario',   label: '4.7 Gestão de Inventário' },
    ]
  },
  {
    section: '5. FISCAL', items: [
      { path: '/fiscal/gerenciar-nfe',    label: '5.1 Gerenciar NF-e' },
      { path: '/fiscal/gerenciar-cte',    label: '5.2 Gerenciar CT-e' },
      { path: '/fiscal/emitir-cobertura', label: '5.3 Emitir Cobertura Fiscal' },
      { path: '/fiscal/armazem-geral',    label: '5.4 Controlar Armazém Geral' },
    ]
  },
  {
    section: '6. FINANCEIRO', items: [
      { path: '/financeiro/calcular-diarias', label: '6.1 Calcular Diárias' },
      { path: '/financeiro/contratos',        label: '6.2 Gerenciar Contratos' },
    ]
  },
  {
    section: '7. CADASTRAR', items: [
      { path: '/cadastros/empresas',       label: '7.1 Gerenciar Empresas' },
      { path: '/cadastros/armazens',       label: '7.2 Configurar Armazéns' },
      { path: '/cadastros/clientes',       label: '7.3 Catálogo de Clientes' },
      { path: '/cadastros/enderecos',      label: '7.4 Cadastrar Endereços' },
      { path: '/cadastros/produtos',       label: '7.5 Catálogo de Produtos' },
      { path: '/cadastros/rotas-veiculos', label: '7.6 Cadastrar Rotas e Veículos' },
      { path: '/cadastros/areas',          label: '7.7 Configurar Áreas' },
      { path: '/cadastros/setores',        label: '7.8 Configurar Setores' },
      { path: '/config/gerar-sku',         label: '7.9 Gerar SKU' },
      { path: '/config/etiquetas',         label: '7.10 Gerenciar Etiquetas' },
    ]
  },
  {
    section: '8. INDICADORES', items: [
      { path: '/indicadores/financeiro',  label: '8.1 Dashboard Financeiro' },
      { path: '/indicadores/ocupacao',    label: '8.2 Analisar Ocupação' },
      { path: '/indicadores/produtividade', label: '8.3 Medir Produtividade' },
      { path: '/indicadores/auditoria',   label: '8.4 Auditar Logs do Sistema' },
      { path: '/indicadores/integracao',  label: '8.5 Resultados de Integração' },
    ]
  },
  {
    section: '9. INTEGRAR', items: [
      { path: '/integrar/alertas',    label: '9.1 Alertas de Integração' },
      { path: '/integrar/ordens-erp', label: '9.2 Sincronizar Ordens ERP' },
      { path: '/integrar/omie',       label: '9.3 Conectar Omie ERP' },
      { path: '/integrar/arquivos',   label: '9.4 Mapear Arquivos (Layouts)' },
      { path: '/integrar/apis',       label: '9.5 Configurar APIs REST' },
      { path: '/integrar/ondas',      label: '9.6 Integrar Ondas (Arquivo)' },
    ]
  },
  {
    section: '10. CONFIGURAR', items: [
      { path: '/config/geral',          label: '10.1 Ajustar Configurações' },
      { path: '/config/balancas',       label: '10.2 Integrar Balanças (Serial)' },
      { path: '/config/service-desk',   label: '10.3 Gerenciar Service Desk' },
      { path: '/config/expurgo',        label: '10.4 Expurgar Dados Antigos' },
      { path: '/config/certificados',   label: '10.5 Gerenciar Certificados' },
    ]
  },
  {
    section: '11. SEGURANÇA', items: [
      { path: '/seguranca/usuarios',                label: '11.1 Gerenciar Usuários' },
      { path: '/seguranca/grupos',                  label: '11.2 Definir Grupos de Acesso' },
      { path: '/seguranca/relatorio-colaboradores', label: '11.3 Relatório de Colaboradores' },
    ]
  },
];

const ALL_PATHS = PAGE_SECTIONS.flatMap(s => s.items.map(i => i.path));

// ─── Modal de Convite com seletor de páginas ──────────────────────────────────
function InviteModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    email: '', nome: '', cargo: 'Operador de Armazém',
  });
  const [selectedPages, setSelectedPages] = useState([]);
  const [openSections, setOpenSections] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const firstInputRef = useRef(null);

  // Fechar com Escape
  React.useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    firstInputRef.current?.focus();
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const togglePage = (path) =>
    setSelectedPages(prev =>
      prev.includes(path) ? prev.filter(p => p !== path) : [...prev, path]
    );

  const toggleSection = (section) => {
    const paths = PAGE_SECTIONS.find(s => s.section === section)?.items.map(i => i.path) || [];
    const allSelected = paths.every(p => selectedPages.includes(p));
    setSelectedPages(prev =>
      allSelected ? prev.filter(p => !paths.includes(p)) : [...new Set([...prev, ...paths])]
    );
  };

  const toggleAll = () => {
    setSelectedPages(prev => prev.length === ALL_PATHS.length ? [] : [...ALL_PATHS]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email.includes('@')) { setError('E-mail inválido.'); return; }
    if (!form.nome.trim()) { setError('Nome é obrigatório.'); return; }
    if (selectedPages.length === 0) { setError('Selecione ao menos uma página.'); return; }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/invite-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email:              form.email.toLowerCase().trim(),
          nome:               form.nome.trim(),
          cargo:              form.cargo,
          employee_id:        form.email.split('@')[0],
          paginas_permitidas: selectedPages,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Falha ao enviar convite.');
      onSuccess(form.email);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Convidar novo usuário"
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-500 p-2 rounded-lg">
              <Send className="w-4 h-4 text-black" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-tight text-gray-800">Convidar Novo Usuário</h2>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">O usuário receberá um e-mail para definir sua senha</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-700 transition-colors" aria-label="Fechar">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          {/* Dados do usuário */}
          <div className="px-6 py-4 border-b border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">E-mail Corporativo *</label>
              <input
                ref={firstInputRef}
                type="email"
                required
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full border border-gray-200 rounded-lg py-2.5 px-3 text-sm focus:border-yellow-500 outline-none transition-all"
                placeholder="colaborador@verticalparts.com.br"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Função / Cargo *</label>
              <select
                value={form.cargo}
                onChange={e => setForm({ ...form, cargo: e.target.value })}
                className="w-full h-[42px] border border-gray-200 rounded-lg px-3 text-sm focus:border-yellow-500 outline-none font-bold"
              >
                <option>Operador de Armazém</option>
                <option>Supervisor de Operações</option>
                <option>Almoxarife</option>
                <option>Analista Fiscal</option>
                <option>Analista de Inventário</option>
                <option>Operador de Recebimento</option>
                <option>Operador de Expedição</option>
                <option>Estratégias e Processos</option>
                <option>Time de Compras / Vendas</option>
                <option>Importação</option>
              </select>
            </div>
            <div className="md:col-span-3 space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Nome Completo *</label>
              <input
                type="text"
                required
                value={form.nome}
                onChange={e => setForm({ ...form, nome: e.target.value })}
                className="w-full border border-gray-200 rounded-lg py-2.5 px-3 text-sm focus:border-yellow-500 outline-none transition-all"
                placeholder="Ex: Ana Paula Rodrigues"
              />
            </div>
          </div>

          {/* Seletor de páginas */}
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                Páginas Visíveis para este Usuário
              </h3>
              <button
                type="button"
                onClick={toggleAll}
                className="text-[10px] font-black text-yellow-600 hover:text-yellow-700 uppercase tracking-widest transition-colors"
              >
                {selectedPages.length === ALL_PATHS.length ? 'Desmarcar Tudo' : 'Selecionar Tudo'}
              </button>
            </div>

            <div className="space-y-1.5 max-h-[320px] overflow-y-auto pr-1">
              {PAGE_SECTIONS.map(({ section, items }) => {
                const sectionPaths = items.map(i => i.path);
                const allSel = sectionPaths.every(p => selectedPages.includes(p));
                const someSel = sectionPaths.some(p => selectedPages.includes(p));
                const isOpen = openSections[section];

                return (
                  <div key={section} className="border border-gray-100 rounded-lg overflow-hidden">
                    {/* Cabeçalho da seção */}
                    <div className="flex items-center bg-gray-50">
                      <button
                        type="button"
                        onClick={() => toggleSection(section)}
                        className="flex items-center gap-2 p-3 flex-shrink-0"
                        aria-label={`Selecionar toda a seção ${section}`}
                      >
                        {allSel
                          ? <CheckSquare className="w-4 h-4 text-yellow-500" />
                          : someSel
                            ? <CheckSquare className="w-4 h-4 text-yellow-300" />
                            : <Square className="w-4 h-4 text-gray-300" />
                        }
                      </button>
                      <button
                        type="button"
                        onClick={() => setOpenSections(prev => ({ ...prev, [section]: !isOpen }))}
                        className="flex-1 flex items-center justify-between px-2 py-3 text-left"
                      >
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">{section}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-gray-400">
                            {sectionPaths.filter(p => selectedPages.includes(p)).length}/{items.length}
                          </span>
                          {isOpen
                            ? <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                            : <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                          }
                        </div>
                      </button>
                    </div>

                    {/* Itens da seção */}
                    {isOpen && (
                      <div className="divide-y divide-gray-50">
                        {items.map(item => (
                          <label
                            key={item.path}
                            className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-yellow-50 transition-colors"
                          >
                            <input
                              type="checkbox"
                              className="w-4 h-4 accent-yellow-500"
                              checked={selectedPages.includes(item.path)}
                              onChange={() => togglePage(item.path)}
                            />
                            <span className="text-xs font-bold text-gray-600">{item.label}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <p className="text-[10px] text-gray-400 font-bold mt-2">
              {selectedPages.length} página(s) selecionada(s) de {ALL_PATHS.length}
            </p>
          </div>

          {/* Erro */}
          {error && (
            <div className="mx-6 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600 text-xs font-bold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            <Lock className="w-3.5 h-3.5" />
            Usuário definirá própria senha no 1º acesso
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-gray-200 rounded-lg text-xs font-black text-gray-500 hover:bg-gray-100 transition-all uppercase tracking-widest"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form=""
              onClick={e => { e.preventDefault(); document.querySelector('form[data-invite]')?.requestSubmit(); }}
              disabled={loading}
              className="px-6 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black rounded-lg text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-yellow-500/20 disabled:opacity-50 flex items-center gap-2"
            >
              {loading
                ? <><span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />Enviando...</>
                : <><Send className="w-3.5 h-3.5" />Enviar Convite</>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Corrige o form submit — atribui data-invite ao form para o botão externo funcionar
// Solução mais limpa: reescrever o botão para usar onSubmit direto
function InviteModalFixed({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    email: '', nome: '', cargo: 'Operador de Armazém',
  });
  const [selectedPages, setSelectedPages] = useState([]);
  const [openSections, setOpenSections] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const firstInputRef = useRef(null);

  React.useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    firstInputRef.current?.focus();
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const togglePage = (path) =>
    setSelectedPages(prev =>
      prev.includes(path) ? prev.filter(p => p !== path) : [...prev, path]
    );

  const toggleSection = (section) => {
    const paths = PAGE_SECTIONS.find(s => s.section === section)?.items.map(i => i.path) || [];
    const allSelected = paths.every(p => selectedPages.includes(p));
    setSelectedPages(prev =>
      allSelected ? prev.filter(p => !paths.includes(p)) : [...new Set([...prev, ...paths])]
    );
  };

  const toggleAll = () =>
    setSelectedPages(prev => prev.length === ALL_PATHS.length ? [] : [...ALL_PATHS]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email.includes('@')) { setError('E-mail inválido.'); return; }
    if (!form.nome.trim()) { setError('Nome é obrigatório.'); return; }
    if (selectedPages.length === 0) { setError('Selecione ao menos uma página.'); return; }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/invite-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email:              form.email.toLowerCase().trim(),
          nome:               form.nome.trim(),
          cargo:              form.cargo,
          employee_id:        form.email.split('@')[0],
          paginas_permitidas: selectedPages,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Falha ao enviar convite.');
      onSuccess(form.email);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        role="dialog" aria-modal="true" aria-label="Convidar novo usuário"
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-500 p-2 rounded-lg">
              <Send className="w-4 h-4 text-black" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-tight text-gray-800">Convidar Novo Usuário</h2>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                O usuário receberá um e-mail para definir sua própria senha
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-700 transition-colors" aria-label="Fechar">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto flex flex-col">
          {/* Dados */}
          <div className="px-6 py-4 border-b border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">E-mail Corporativo *</label>
              <input
                ref={firstInputRef}
                type="email" required value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full border border-gray-200 rounded-lg py-2.5 px-3 text-sm focus:border-yellow-500 outline-none transition-all"
                placeholder="colaborador@verticalparts.com.br"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Função / Cargo *</label>
              <select
                value={form.cargo}
                onChange={e => setForm({ ...form, cargo: e.target.value })}
                className="w-full h-[42px] border border-gray-200 rounded-lg px-3 text-sm focus:border-yellow-500 outline-none font-bold"
              >
                <option>Operador de Armazém</option>
                <option>Supervisor de Operações</option>
                <option>Almoxarife</option>
                <option>Analista Fiscal</option>
                <option>Analista de Inventário</option>
                <option>Operador de Recebimento</option>
                <option>Operador de Expedição</option>
                <option>Estratégias e Processos</option>
                <option>Time de Compras / Vendas</option>
                <option>Importação</option>
              </select>
            </div>
            <div className="md:col-span-3 space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Nome Completo *</label>
              <input
                type="text" required value={form.nome}
                onChange={e => setForm({ ...form, nome: e.target.value })}
                className="w-full border border-gray-200 rounded-lg py-2.5 px-3 text-sm focus:border-yellow-500 outline-none transition-all"
                placeholder="Ex: Ana Paula Rodrigues"
              />
            </div>
          </div>

          {/* Seletor de páginas */}
          <div className="px-6 py-4 flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-yellow-500" />
                Páginas Visíveis para este Usuário
              </h3>
              <button type="button" onClick={toggleAll}
                className="text-[10px] font-black text-yellow-600 hover:text-yellow-700 uppercase tracking-widest"
              >
                {selectedPages.length === ALL_PATHS.length ? 'Desmarcar Tudo' : 'Selecionar Tudo'}
              </button>
            </div>

            <div className="space-y-1.5 overflow-y-auto flex-1 max-h-[280px] pr-1">
              {PAGE_SECTIONS.map(({ section, items }) => {
                const sectionPaths = items.map(i => i.path);
                const allSel = sectionPaths.every(p => selectedPages.includes(p));
                const someSel = !allSel && sectionPaths.some(p => selectedPages.includes(p));
                const isOpen = openSections[section];
                const countSel = sectionPaths.filter(p => selectedPages.includes(p)).length;

                return (
                  <div key={section} className="border border-gray-100 rounded-lg overflow-hidden">
                    <div className="flex items-center bg-gray-50 hover:bg-gray-100 transition-colors">
                      <button type="button" onClick={() => toggleSection(section)}
                        className="p-3 flex-shrink-0" aria-label={`Selecionar seção ${section}`}>
                        {allSel
                          ? <CheckSquare className="w-4 h-4 text-yellow-500" />
                          : someSel
                            ? <CheckSquare className="w-4 h-4 text-yellow-300" />
                            : <Square className="w-4 h-4 text-gray-300" />
                        }
                      </button>
                      <button type="button"
                        onClick={() => setOpenSections(prev => ({ ...prev, [section]: !isOpen }))}
                        className="flex-1 flex items-center justify-between px-2 py-3 text-left"
                      >
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">{section}</span>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold ${countSel > 0 ? 'text-yellow-600' : 'text-gray-300'}`}>
                            {countSel}/{items.length}
                          </span>
                          {isOpen
                            ? <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                            : <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                          }
                        </div>
                      </button>
                    </div>
                    {isOpen && (
                      <div className="divide-y divide-gray-50">
                        {items.map(item => (
                          <label key={item.path}
                            className="flex items-center gap-3 px-5 py-2.5 cursor-pointer hover:bg-yellow-50 transition-colors">
                            <input type="checkbox" className="w-4 h-4 accent-yellow-500"
                              checked={selectedPages.includes(item.path)}
                              onChange={() => togglePage(item.path)} />
                            <span className="text-xs font-bold text-gray-600">{item.label}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <p className="text-[10px] text-gray-400 font-bold mt-2">
              {selectedPages.length} de {ALL_PATHS.length} páginas selecionadas
            </p>
          </div>

          {error && (
            <div className="mx-6 mb-2 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600 text-xs font-bold">
              <AlertCircle className="w-4 h-4 shrink-0" />{error}
            </div>
          )}

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-3 sticky bottom-0">
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              <Lock className="w-3.5 h-3.5" />
              Usuário definirá própria senha no 1º acesso
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={onClose}
                className="px-5 py-2.5 border border-gray-200 rounded-lg text-xs font-black text-gray-500 hover:bg-gray-100 transition-all uppercase tracking-widest">
                Cancelar
              </button>
              <button type="submit" disabled={loading}
                className="px-6 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black rounded-lg text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-yellow-500/20 disabled:opacity-50 flex items-center gap-2">
                {loading
                  ? <><span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />Enviando...</>
                  : <><Send className="w-3.5 h-3.5" />Enviar Convite</>
                }
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function UsersPage() {
  const { users, usersCrud, userGroups } = useApp();

  const fieldId = useId();
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    id: '', usuario: '', nomeUsuario: '', email: '',
    nivel: 'Operador', departamento: '', entidade: 'VerticalParts Matriz',
    cargo: '', status: 'Ativo', hasTransactions: false
  });
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Toast
  const [toast, setToast] = useState(null);
  const toastTimeoutRef = useRef(null);
  const showToast = (message, type = 'success') => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ message, type });
    toastTimeoutRef.current = setTimeout(() => setToast(null), 4000);
  };

  const handleSelect = (user) => {
    setSelectedUser(user);
    setFormData({
      id: user.id || '', usuario: user.usuario || '', nomeUsuario: user.nomeUsuario || '',
      email: user.email || '', nivel: user.nivel || 'Operador',
      departamento: user.departamento || '', entidade: user.entidade || 'VerticalParts Matriz',
      cargo: user.cargo || '', status: user.status || 'Ativo',
      hasTransactions: user.hasTransactions || false
    });
  };

  const handleResetPassword = async () => {
    if (!formData.email) { showToast('E-mail é obrigatório para resetar a senha.', 'error'); return; }
    const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    });
    if (error) showToast(error.message, 'error');
    else showToast(`Link de redefinição enviado para ${formData.email}`, 'info');
  };

  const handleNew = () => {
    setSelectedUser({ id: 'NOVO' });
    setFormData({ id: 'AUTO', usuario: '', nomeUsuario: '', nivel: 'Operador',
      departamento: '', entidade: 'VerticalParts Matriz', cargo: '', status: 'Ativo' });
  };

  const handleSave = () => {
    if (selectedUser?.id === 'NOVO') usersCrud.add(formData);
    else usersCrud.update(formData.id, formData);
    showToast('Registro salvo com sucesso!', 'success');
  };

  const handleDelete = () => {
    if (!selectedUser || selectedUser.id === 'NOVO' || selectedUser.id === 'AUTO') {
      showToast('Selecione um usuário para excluir.', 'error'); return;
    }
    if (formData.hasTransactions) {
      if (window.confirm(`Usuário possui histórico. Deseja INATIVAR o acesso de ${selectedUser.usuario}?`)) {
        const updated = { ...formData, status: 'Inativo' };
        usersCrud.update(formData.id, updated);
        setFormData(updated);
        showToast('Usuário inativado para preservar histórico.', 'info');
      }
      return;
    }
    if (window.confirm(`Deseja excluir ${selectedUser.usuario}?`)) {
      usersCrud.remove(selectedUser.id);
      setSelectedUser(null);
      setFormData({ id: '', usuario: '', nomeUsuario: '', email: '', nivel: 'Operador',
        departamento: '', entidade: 'VerticalParts Matriz', cargo: '', status: 'Ativo', hasTransactions: false });
      showToast('Usuário excluído.', 'info');
    }
  };

  const breadcrumbItems = [
    { label: 'WMS' }, { label: 'Configurar' }, { label: '11.1 Segurança e Usuários' }
  ];

  const actionGroups = [
    [
      { label: 'Novo', primary: true, icon: <Plus className="w-3.5 h-3.5" />, onClick: handleNew },
      { label: 'Salvar', icon: <Save className="w-3.5 h-3.5" />, onClick: handleSave },
    ],
    [
      { label: 'Excluir', icon: <Trash2 className="w-3.5 h-3.5" />, onClick: handleDelete,
        disabled: !selectedUser || selectedUser.id === 'NOVO' },
    ],
    [
      { label: 'Imprimir Crachá', icon: <Printer className="w-3.5 h-3.5" /> },
      { label: 'Relatórios',      icon: <FileText className="w-3.5 h-3.5" /> },
    ],
  ];

  const columns = [
    { header: 'ID',           accessor: 'id' },
    { header: 'Login',        accessor: 'usuario' },
    { header: 'Nome Completo',accessor: 'nomeUsuario' },
    { header: 'Cargo / Função',accessor: 'cargo' },
    {
      header: 'Nível de Acesso', accessor: 'nivel',
      render: (val) => {
        const isAdm = val === 'Administrador';
        return (
          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${isAdm ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
            {val}
          </span>
        );
      }
    },
    {
      header: 'Status', accessor: 'status',
      render: (val) => {
        const isActive = val === 'Ativo';
        return (
          <div className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
            <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-green-600' : 'text-gray-400'}`}>{val}</span>
          </div>
        );
      }
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Modal de Convite */}
      {showInviteModal && (
        <InviteModalFixed
          onClose={() => setShowInviteModal(false)}
          onSuccess={(email) => {
            setShowInviteModal(false);
            showToast(`Convite enviado para ${email}! Usuário definirá a senha no 1º acesso.`, 'success');
          }}
        />
      )}

      <div className="px-6 py-4 border-b border-gray-100">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-500 p-2 rounded-sm shadow-lg shadow-yellow-500/20">
              <User className="w-5 h-5 text-black" />
            </div>
            <h1 className="text-xl font-black uppercase tracking-tight text-gray-800">
              11.1 Gestão de Usuários e Segurança
            </h1>
          </div>
          {/* Botão de Convite em destaque */}
          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black font-black text-xs uppercase tracking-widest rounded-sm transition-all shadow-lg shadow-yellow-500/20 active:scale-95"
          >
            <Send className="w-3.5 h-3.5" />
            Convidar Usuário
          </button>
        </div>
      </div>

      <ActionPane groups={actionGroups} />

      <div className="p-6 space-y-6 max-w-[1600px]">
        <section>
          <div className="flex items-center gap-2 mb-3">
            <LayoutGrid className="w-4 h-4 text-gray-400" />
            <h2 className="text-xs font-black uppercase tracking-widest text-gray-500">Listagem de Colaboradores</h2>
          </div>
          <DataGrid columns={columns} data={users} onRowClick={handleSelect} />
        </section>

        {(selectedUser || formData.usuario !== '') && (
          <section className="animate-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-gray-400" />
              <h2 className="text-xs font-black uppercase tracking-widest text-gray-500">Detalhes do Registro</h2>
            </div>

            <FastTab title="Informações do Usuário" defaultOpen={true}>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-2">
                <div className="space-y-1">
                  <label htmlFor={`${fieldId}-usuario`} className="text-[10px] font-black uppercase tracking-widest text-gray-400">Login (Username)</label>
                  <input id={`${fieldId}-usuario`} type="text"
                    className="w-full bg-white border border-gray-200 rounded-sm py-2 px-3 text-sm focus:border-yellow-500 outline-none transition-all"
                    value={formData.usuario}
                    onChange={(e) => setFormData({...formData, usuario: e.target.value.toLowerCase()})}
                    placeholder="ex: danilo.supervisor" />
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label htmlFor={`${fieldId}-nome`} className="text-[10px] font-black uppercase tracking-widest text-gray-400">Nome Completo</label>
                  <input id={`${fieldId}-nome`} type="text"
                    className="w-full bg-white border border-gray-200 rounded-sm py-2 px-3 text-sm focus:border-yellow-500 outline-none transition-all"
                    value={formData.nomeUsuario}
                    onChange={(e) => setFormData({...formData, nomeUsuario: e.target.value})}
                    placeholder="Digite o nome completo" />
                </div>
                <div className="space-y-1">
                  <label htmlFor={`${fieldId}-cargo`} className="text-[10px] font-black uppercase tracking-widest text-gray-400">Função / Cargo</label>
                  <select id={`${fieldId}-cargo`}
                    className="w-full h-[38px] bg-white border border-gray-200 rounded-sm px-3 text-sm focus:border-yellow-500 outline-none transition-all font-bold"
                    value={formData.cargo}
                    onChange={(e) => setFormData({...formData, cargo: e.target.value})}>
                    <option value="">Selecione um cargo</option>
                    <option>Supervisor de Operações</option>
                    <option>Operador de Armazém</option>
                    <option>Almoxarife</option>
                    <option>Estratégias e Processos</option>
                    <option>Operador de Expedição</option>
                    <option>Analista Fiscal</option>
                    <option>Analista de Inventário</option>
                    <option>Operador de Recebimento</option>
                    <option>Time de Compras / Vendas</option>
                    <option>Importação</option>
                  </select>
                </div>

                <div className="md:col-span-2 space-y-1">
                  <label htmlFor={`${fieldId}-email`} className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                    <Mail className="w-3 h-3 text-yellow-500" />
                    E-mail Corporativo (Login APP/WEB)
                  </label>
                  <input id={`${fieldId}-email`} type="email"
                    className="w-full bg-white border border-gray-200 rounded-sm py-2 px-3 text-sm focus:border-yellow-500 outline-none transition-all font-bold"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value.toLowerCase()})}
                    placeholder="ex: colaborador@verticalparts.com.br" />
                </div>

                <div className="space-y-1">
                  <label htmlFor={`${fieldId}-status`} className="text-[10px] font-black uppercase tracking-widest text-gray-400">Status da Conta</label>
                  <select id={`${fieldId}-status`}
                    className={`w-full h-[38px] border rounded-sm px-3 text-sm focus:border-yellow-500 outline-none transition-all font-black uppercase cursor-pointer ${formData.status === 'Ativo' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}>
                    <option value="Ativo">🟢 Ativo</option>
                    <option value="Inativo">🔴 Inativo</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Padrão de Segurança</label>
                  <div className="flex items-center gap-2 h-[38px] px-3 bg-gray-50 border border-gray-100 rounded-sm">
                    {formData.hasTransactions
                      ? <><History className="w-3.5 h-3.5 text-blue-500" /><span className="text-[10px] font-black text-blue-600 uppercase">Histórico Protegido</span></>
                      : <><UserCheck className="w-3.5 h-3.5 text-green-500" /><span className="text-[10px] font-black text-green-600 uppercase">Conta Limpa</span></>
                    }
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor={`${fieldId}-nivel`} className="text-[10px] font-black uppercase tracking-widest text-gray-400">Nível de Acesso</label>
                  <select id={`${fieldId}-nivel`}
                    className="w-full h-[38px] bg-white border border-gray-200 rounded-sm px-3 text-sm focus:border-yellow-500 outline-none transition-all"
                    value={formData.nivel}
                    onChange={(e) => setFormData({...formData, nivel: e.target.value})}>
                    <option>Administrador</option>
                    <option>Supervisor</option>
                    <option>Operador</option>
                    <option>Consulta</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label htmlFor={`${fieldId}-depto`} className="text-[10px] font-black uppercase tracking-widest text-gray-400">Departamento</label>
                  <input id={`${fieldId}-depto`} type="text"
                    className="w-full bg-white border border-gray-200 rounded-sm py-2 px-3 text-sm focus:border-yellow-500 outline-none transition-all"
                    value={formData.departamento}
                    onChange={(e) => setFormData({...formData, departamento: e.target.value})} />
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Entidade Vinculada</label>
                  <input type="text" value={formData.entidade} disabled
                    className="w-full bg-gray-50 border border-gray-200 rounded-sm py-2 px-3 text-sm outline-none cursor-not-allowed" />
                </div>
              </div>
            </FastTab>

            <FastTab title="Acesso e Segurança">
              <div className="p-6 bg-slate-900 rounded-sm border border-slate-800 relative overflow-hidden group">
                <Shield className="absolute -right-8 -bottom-8 w-40 h-40 text-white/5 group-hover:text-yellow-500/10 transition-all duration-700" />
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-yellow-500/10 rounded-lg"><Key className="w-5 h-5 text-yellow-500" /></div>
                      <h3 className="text-lg font-black text-white uppercase tracking-tight">Gestão de Acesso Supabase</h3>
                    </div>
                    <p className="text-gray-400 text-xs font-bold leading-relaxed max-w-md">
                      Clique em <span className="text-yellow-500">"Convidar Usuário"</span> no cabeçalho para criar um novo acesso.
                      O usuário receberá um link por e-mail e deverá definir sua própria senha no primeiro acesso.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button onClick={() => setShowInviteModal(true)}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-black text-xs uppercase tracking-widest rounded-sm transition-all shadow-lg shadow-yellow-500/20 active:scale-95">
                      <Send className="w-4 h-4" />
                      Convidar por E-mail
                    </button>
                    <button onClick={handleResetPassword}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-transparent border border-white/20 hover:border-yellow-500 text-white hover:text-yellow-500 font-black text-xs uppercase tracking-widest rounded-sm transition-all active:scale-95">
                      <RefreshCcw className="w-4 h-4" />
                      Resetar Senha
                    </button>
                  </div>
                </div>
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-white/5 pt-6">
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-sm border border-white/5">
                    <UserCheck className="w-4 h-4 text-green-500" />
                    <div><p className="text-[10px] font-black text-white uppercase leading-none mb-1">SSO Ativo</p><p className="text-[9px] text-gray-500 font-bold">Web & App Mobile</p></div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-sm border border-white/5">
                    <Lock className="w-4 h-4 text-blue-500" />
                    <div><p className="text-[10px] font-black text-white uppercase leading-none mb-1">Criptografia</p><p className="text-[9px] text-gray-500 font-bold">SHA-256 Hashes</p></div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-sm border border-white/5">
                    <History className="w-4 h-4 text-red-500" />
                    <div><p className="text-[10px] font-black text-white uppercase leading-none mb-1">Log de Acesso</p><p className="text-[9px] text-gray-500 font-bold">Auditoria Ativada</p></div>
                  </div>
                </div>
              </div>
            </FastTab>

            <FastTab title="Permissões e Vínculos">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-2">
                <div className="p-4 bg-gray-50 rounded-sm border border-gray-100">
                  <div className="flex items-center gap-2 mb-4">
                    <Shield className="w-4 h-4 text-blue-500" />
                    <h3 className="text-[11px] font-black uppercase text-gray-600">Grupos de Segurança</h3>
                  </div>
                  <div className="space-y-2">
                    {userGroups.map(group => (
                      <label key={group.id} className="flex items-center gap-3 p-2 bg-white border border-gray-100 rounded-sm cursor-pointer hover:border-yellow-500 transition-colors group">
                        <input type="checkbox" className="w-4 h-4 accent-yellow-500" />
                        <span className="text-[11px] font-bold text-gray-700 group-hover:text-yellow-600 transition-colors">{group.grupo}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-sm border border-gray-100">
                  <div className="flex items-center gap-2 mb-4">
                    <Building2 className="w-4 h-4 text-orange-500" />
                    <h3 className="text-[11px] font-black uppercase text-gray-600">Filiais / Depositantes</h3>
                  </div>
                  <div className="p-4 border border-dashed border-gray-300 rounded-sm text-center">
                    <p className="text-[10px] text-gray-400 uppercase font-black">VerticalParts Matriz (Padrão)</p>
                  </div>
                </div>
              </div>
            </FastTab>
          </section>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[200] animate-in slide-in-from-right-4 duration-300" role="status">
          <div className={`flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border-l-4 text-white
            ${toast.type === 'success' ? 'bg-green-500 border-green-700' :
              toast.type === 'error'   ? 'bg-red-500 border-red-700' :
              'bg-blue-600 border-blue-800'}`}>
            {toast.type === 'success'
              ? <CheckCircle2 className="w-5 h-5" />
              : <AlertCircle className="w-5 h-5" />
            }
            <div>
              <p className="text-xs font-black uppercase tracking-widest opacity-70 leading-none mb-1">Notificação</p>
              <p className="text-sm font-bold">{toast.message}</p>
            </div>
            <button onClick={() => setToast(null)} className="ml-4 p-1 hover:bg-black/10 rounded-full transition-colors" aria-label="Fechar">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
