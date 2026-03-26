import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield, Plus, Edit2, Trash2, Save, X, ChevronDown, ChevronRight,
  Users, CheckSquare, Square, Loader2, Lock, Unlock, Search
} from 'lucide-react';
import { gruposAcessoService } from '../services/gruposAcessoService';
import EnterprisePageBase from '../components/layout/EnterprisePageBase';

// ── Todas as páginas do WMS organizadas por seção ────────────
const PAGE_SECTIONS = [
  {
    label: 'PRINCIPAL',
    items: [{ path: '/', label: '1.1 Dashboard Geral' }],
  },
  {
    label: 'OPERAR',
    items: [
      { path: '/operacao/cruzar-docas',         label: '2.1 Cruzar Docas' },
      { path: '/operacao/processar-devolucoes',  label: '2.2 Processar Devoluções' },
      { path: '/operacao/pesar-cargas',          label: '2.3 Pesar Cargas' },
      { path: '/operacao/gerenciar-recebimento', label: '2.4 Gerenciar Recebimento' },
      { path: '/operacao/conferir-recebimento',  label: '2.5 Conferir Recebimento' },
      { path: '/operacao/gerar-mapa',            label: '2.6 Gerar Mapa de Alocação' },
      { path: '/operacao/conferencia-cega',      label: '2.7 Conferência Cega' },
      { path: '/operacao/alocar-estoque',        label: '2.8 Alocar Estoque' },
      { path: '/operacao/kanban-alocacao',       label: '2.9 Kanban de Alocação' },
      { path: '/operacao/separar-pedidos',       label: '2.10 Separar Pedidos' },
      { path: '/operacao/embalar-pedidos',       label: '2.11 Embalar Pedidos' },
      { path: '/operacao/monitorar-saida',       label: '2.12 Monitorar Saída' },
      { path: '/operacao/recebimento',           label: '2.13 Recebimento (Check-in)' },
      { path: '/operacao/estacao-kits',          label: '2.14 Estação de Kits' },
      { path: '/operacao/conferencia-colmeia',   label: '2.15 Conferência Colmeia' },
      { path: '/operacao/mapa-visual',           label: '2.16 Mapa Visual de Estoque' },
      { path: '/operacao/buffer-1',              label: '2.17 Buffer 1' },
      { path: '/operacao/buffer-2',              label: '2.18 Buffer 2' },
      { path: '/operacao/ordem-servico',         label: '2.19 Ordem de Serviço' },
      { path: '/operacao/gestao-seguros',        label: '2.20 Gestão de Seguros' },
      { path: '/operacao/pesagem-rodoviaria',    label: '2.21 Pesagem Rodoviária' },
      { path: '/operacao/gerenciamento-pedidos', label: '2.22 Gerenciamento de Pedidos' },
    ],
  },
  {
    label: 'PLANEJAR',
    items: [
      { path: '/planejamento/gerar-ondas',         label: '3.1 Gerar Ondas de Separação' },
      { path: '/planejamento/monitorar-prazos',    label: '3.2 Monitorar Prazos (SLA)' },
      { path: '/planejamento/agendar-transportes', label: '3.3 Agendar Transportes' },
      { path: '/planejamento/monitorar-atividades',label: '3.4 Monitorar Atividades' },
      { path: '/planejamento/gerenciar-manifestos',label: '3.5 Gerenciar Manifestos' },
      { path: '/planejamento/expedir-cargas',      label: '3.6 Expedir Cargas' },
      { path: '/planejamento/gerenciar-portaria',  label: '3.7 Gerenciar Portaria' },
      { path: '/planejamento/atividades-docas',    label: '3.8 Atividades de Docas' },
    ],
  },
  {
    label: 'CONTROLAR',
    items: [
      { path: '/estoque/auditar-inventario', label: '4.1 Auditar Inventário' },
      { path: '/estoque/consultar-kardex',   label: '4.2 Consultar Kardex' },
      { path: '/estoque/analisar-estoque',   label: '4.3 Analisar Estoque' },
      { path: '/estoque/remanejar',          label: '4.4 Remanejar Produtos' },
      { path: '/estoque/controlar-lotes',    label: '4.5 Controlar Lotes e Validade' },
      { path: '/estoque/monitorar-avarias',  label: '4.6 Monitorar Avarias' },
    ],
  },
  {
    label: 'FISCAL',
    items: [
      { path: '/fiscal/gerenciar-nfe',   label: '5.1 Gerenciar NF-e' },
      { path: '/fiscal/gerenciar-cte',   label: '5.2 Gerenciar CT-e' },
      { path: '/fiscal/emitir-cobertura',label: '5.3 Emitir Cobertura Fiscal' },
      { path: '/fiscal/armazem-geral',   label: '5.4 Controlar Armazém Geral' },
    ],
  },
  {
    label: 'FINANCEIRO',
    items: [
      { path: '/financeiro/calcular-diarias', label: '6.1 Calcular Diárias' },
      { path: '/financeiro/contratos',        label: '6.2 Gerenciar Contratos' },
    ],
  },
  {
    label: 'CADASTRAR',
    items: [
      { path: '/cadastros/empresas',       label: '7.1 Gerenciar Empresas' },
      { path: '/cadastros/armazens',       label: '7.2 Configurar Armazéns' },
      { path: '/cadastros/enderecos',      label: '7.3 Cadastrar Endereços' },
      { path: '/cadastros/clientes',       label: '7.3.1 Catálogo de Clientes' },
      { path: '/cadastros/produtos',       label: '7.5 Cadastro de Produtos' },
      { path: '/cadastros/rotas-veiculos', label: '7.6 Cadastrar Rotas e Veículos' },
      { path: '/cadastros/areas',          label: '7.7 Configurar Áreas' },
      { path: '/cadastros/setores',        label: '7.8 Configurar Setores' },
      { path: '/config/etiquetas',         label: '7.9 Gerenciar Etiquetas' },
    ],
  },
  {
    label: 'INDICADORES',
    items: [
      { path: '/indicadores/financeiro',   label: '8.1 Dashboard Financeiro' },
      { path: '/indicadores/ocupacao',     label: '8.2 Analisar Ocupação' },
      { path: '/indicadores/produtividade',label: '8.3 Medir Produtividade' },
      { path: '/indicadores/auditoria',    label: '8.4 Auditar Logs do Sistema' },
      { path: '/indicadores/integracao',   label: '8.5 Resultados de Integração' },
    ],
  },
  {
    label: 'INTEGRAR',
    items: [
      { path: '/integrar/alertas',    label: '9.1 Alertas de Integração' },
      { path: '/integrar/ordens-erp', label: '9.2 Sincronizar Ordens ERP' },
      { path: '/integrar/omie',       label: '9.3 Conectar Omie ERP' },
      { path: '/integrar/arquivos',   label: '9.4 Mapear Arquivos (Layouts)' },
      { path: '/integrar/apis',       label: '9.5 Configurar APIs REST' },
      { path: '/integrar/ondas',      label: '9.6 Integrar Ondas (Arquivo)' },
    ],
  },
  {
    label: 'CONFIGURAR',
    items: [
      { path: '/config/geral',         label: '10.1 Ajustar Configurações' },
      { path: '/config/balancas',      label: '10.2 Integrar Balanças (Serial)' },
      { path: '/config/service-desk',  label: '10.3 Gerenciar Service Desk' },
      { path: '/config/expurgo',       label: '10.4 Expurgar Dados Antigos' },
      { path: '/config/certificados',  label: '10.5 Gerenciar Certificados' },
    ],
  },
];

// ── Badges de tipo de grupo ───────────────────────────────────
const TYPE_BADGE = {
  padrao:        'bg-slate-100 text-slate-600',
  personalizado: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
};

export default function UserGroups() {
  const [groups, setGroups]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [selected, setSelected]       = useState(null);
  const [isNew, setIsNew]             = useState(false);
  const [saving, setSaving]           = useState(false);
  const [feedback, setFeedback]       = useState(null); // { type: 'ok'|'err', msg }
  const [searchTerm, setSearchTerm]   = useState('');

  // Campos do grupo em edição
  const [editNome, setEditNome]       = useState('');
  const [editDesc, setEditDesc]       = useState('');
  const [editPages, setEditPages]     = useState([]);
  const [expanded, setExpanded]       = useState({});   // { sectionLabel: bool }

  // ── Carregar grupos do Supabase ───────────────────────────
  const loadGroups = useCallback(async () => {
    setLoading(true);
    const { data, error } = await gruposAcessoService.getFullList();
    if (!error) setGroups(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { loadGroups(); }, [loadGroups]);

  // ── Selecionar grupo para editar ──────────────────────────
  const handleSelect = (group) => {
    setSelected(group);
    setIsNew(false);
    setEditNome(group.nome);
    setEditDesc(group.descricao || '');
    setEditPages(group.paginas || []);
    setExpanded({});
    setFeedback(null);
  };

  // ── Modo novo grupo ───────────────────────────────────────
  const handleNewGroup = () => {
    setSelected(null);
    setIsNew(true);
    setEditNome('');
    setEditDesc('');
    setEditPages([]);
    setExpanded({});
    setFeedback(null);
  };

  // ── Toggle página individual ──────────────────────────────
  const togglePage = (path) => {
    setEditPages(prev =>
      prev.includes(path) ? prev.filter(p => p !== path) : [...prev, path]
    );
  };

  // ── Toggle seção inteira ──────────────────────────────────
  const toggleSection = (items) => {
    const paths = items.map(i => i.path);
    const allIn = paths.every(p => editPages.includes(p));
    if (allIn) {
      setEditPages(prev => prev.filter(p => !paths.includes(p)));
    } else {
      setEditPages(prev => [...new Set([...prev, ...paths])]);
    }
  };

  // ── Salvar (criar ou atualizar) ───────────────────────────
  const handleSave = async () => {
    if (!editNome.trim()) {
      setFeedback({ type: 'err', msg: 'Nome do grupo é obrigatório.' });
      return;
    }
    setSaving(true);
    setFeedback(null);

    if (isNew) {
      const { error } = await gruposAcessoService.insert({
        nome:     editNome.trim(),
        descricao: editDesc.trim() || null,
        tipo:     'personalizado',
        paginas:  editPages,
      });
      if (error) {
        setFeedback({ type: 'err', msg: error.message });
      } else {
        setFeedback({ type: 'ok', msg: 'Grupo criado com sucesso.' });
        setIsNew(false);
        await loadGroups();
      }
    } else {
      const update = {
        descricao: editDesc.trim() || null,
        paginas:   editPages,
      };
      // Só permite renomear grupos personalizados
      if (selected.tipo === 'personalizado') update.nome = editNome.trim();

      const { error } = await gruposAcessoService.update(selected.id, update);

      if (error) {
        setFeedback({ type: 'err', msg: error.message });
      } else {
        setFeedback({ type: 'ok', msg: 'Grupo atualizado.' });
        await loadGroups();
        // Atualiza selected com dados novos
        setSelected(prev => ({ ...prev, ...update, nome: update.nome || prev.nome }));
      }
    }
    setSaving(false);
  };

  // ── Excluir grupo personalizado ───────────────────────────
  const handleDelete = async () => {
    if (!selected || selected.tipo === 'padrao') return;
    if (!window.confirm(`Excluir o grupo "${selected.nome}"? Usuários vinculados perderão o grupo.`)) return;
    const { error } = await gruposAcessoService.delete(selected.id);
    if (error) {
      setFeedback({ type: 'err', msg: error.message });
    } else {
      setSelected(null);
      setIsNew(false);
      await loadGroups();
    }
  };

  const filteredGroups = groups.filter(g =>
    g.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isAdminGroup = selected?.nome === 'Administrador';
  const canDelete    = selected?.tipo === 'personalizado';

  return (
    <EnterprisePageBase
      title="11.2 Definir Grupos de Acesso"
      breadcrumbItems={[{ label: 'SEGURANÇA', path: '/seguranca/usuarios' }]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* ── Coluna esquerda: lista de grupos ─────────────── */}
        <div className="lg:col-span-4 space-y-3">
          {/* Busca + Novo */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Buscar grupo..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pr-9 pl-4 py-2.5 bg-white border border-slate-200 rounded-sm text-xs font-bold outline-none focus:border-primary transition-all"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            </div>
            <button
              onClick={handleNewGroup}
              className="px-4 py-2.5 bg-secondary text-primary font-black text-[10px] uppercase tracking-widest rounded-sm hover:bg-secondary/90 transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Novo
            </button>
          </div>

          {/* Lista */}
          <div className="bg-white border border-slate-200 rounded-sm overflow-hidden shadow-sm">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
            ) : filteredGroups.length === 0 ? (
              <div className="py-12 text-center text-xs font-black uppercase tracking-widest text-slate-300">
                Nenhum grupo
              </div>
            ) : (
              <ul className="divide-y divide-slate-50">
                {filteredGroups.map(g => {
                  const isSelected = !isNew && selected?.id === g.id;
                  return (
                    <li key={g.id}>
                      <button
                        onClick={() => handleSelect(g)}
                        className={`w-full text-left px-4 py-3.5 transition-all flex items-start gap-3 ${
                          isSelected
                            ? 'bg-primary/5 border-l-4 border-l-primary'
                            : 'hover:bg-slate-50 border-l-4 border-l-transparent'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-sm bg-secondary/10 flex items-center justify-center shrink-0 mt-0.5">
                          {g.tipo === 'padrao'
                            ? <Lock className="w-3.5 h-3.5 text-primary" />
                            : <Unlock className="w-3.5 h-3.5 text-yellow-600" />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-black uppercase tracking-tight truncate">{g.nome}</p>
                          <p className="text-[10px] text-slate-400 font-medium mt-0.5 truncate">
                            {g.nome === 'Administrador'
                              ? 'Acesso total'
                              : `${g.paginas?.length ?? 0} página${(g.paginas?.length ?? 0) !== 1 ? 's' : ''}`
                            }
                          </p>
                        </div>
                        <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-sm shrink-0 ${TYPE_BADGE[g.tipo]}`}>
                          {g.tipo === 'padrao' ? 'PADRÃO' : 'CUSTOM'}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">
            {groups.length} grupo{groups.length !== 1 ? 's' : ''} — {groups.filter(g => g.tipo === 'padrao').length} padrão · {groups.filter(g => g.tipo === 'personalizado').length} custom
          </p>
        </div>

        {/* ── Coluna direita: editor ────────────────────────── */}
        <div className="lg:col-span-8">
          {!selected && !isNew ? (
            <div className="bg-white border border-slate-200 rounded-sm flex flex-col items-center justify-center py-20 text-slate-300">
              <Shield className="w-10 h-10 mb-3" />
              <p className="text-xs font-black uppercase tracking-widest">Selecione um grupo para editar</p>
              <p className="text-[10px] font-medium mt-1">ou clique em &quot;Novo&quot; para criar</p>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">

              {/* Header do editor */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-secondary rounded-sm flex items-center justify-center">
                    <Shield className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black uppercase tracking-tight">
                      {isNew ? 'Novo Grupo Personalizado' : selected?.nome}
                    </h2>
                    {!isNew && (
                      <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-sm ${TYPE_BADGE[selected?.tipo]}`}>
                        {selected?.tipo === 'padrao' ? 'GRUPO PADRÃO' : 'GRUPO PERSONALIZADO'}
                      </span>
                    )}
                  </div>
                </div>
                <button onClick={() => { setSelected(null); setIsNew(false); }} className="p-1.5 text-slate-400 hover:text-danger transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* Feedback */}
                {feedback && (
                  <div className={`px-4 py-3 rounded-sm text-xs font-black uppercase tracking-widest ${
                    feedback.type === 'ok'
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-red-50 text-danger border border-red-200'
                  }`}>
                    {feedback.msg}
                  </div>
                )}

                {/* Nome e descrição */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      Nome do Grupo {selected?.tipo === 'padrao' && !isNew && <span className="text-slate-300">(bloqueado)</span>}
                    </label>
                    <input
                      type="text"
                      value={editNome}
                      onChange={e => setEditNome(e.target.value)}
                      disabled={selected?.tipo === 'padrao' && !isNew}
                      placeholder="Ex: Supervisores"
                      className="w-full bg-white border-2 border-slate-100 rounded-sm py-2.5 px-4 text-sm font-bold focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-slate-300 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Descrição</label>
                    <input
                      type="text"
                      value={editDesc}
                      onChange={e => setEditDesc(e.target.value)}
                      placeholder="Breve descrição do grupo..."
                      className="w-full bg-white border-2 border-slate-100 rounded-sm py-2.5 px-4 text-sm font-bold focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-slate-300"
                    />
                  </div>
                </div>

                {/* Seletor de páginas */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      {isAdminGroup ? 'Acesso Total (não configurável)' : `Páginas Permitidas — ${editPages.length} selecionadas`}
                    </span>
                    {!isAdminGroup && (
                      <button
                        onClick={() => {
                          const all = PAGE_SECTIONS.flatMap(s => s.items.map(i => i.path));
                          setEditPages(prev => prev.length === all.length ? [] : all);
                        }}
                        className="text-[9px] font-black uppercase tracking-widest text-primary hover:underline"
                      >
                        {editPages.length === PAGE_SECTIONS.flatMap(s => s.items).length ? 'Desmarcar Tudo' : 'Selecionar Tudo'}
                      </button>
                    )}
                  </div>

                  {isAdminGroup ? (
                    <div className="bg-slate-50 border border-slate-200 rounded-sm px-4 py-3 flex items-center gap-3">
                      <Lock className="w-4 h-4 text-primary shrink-0" />
                      <p className="text-xs font-bold text-slate-500">
                        O grupo <strong>Administrador</strong> tem acesso a todas as páginas do sistema.
                        Não é possível restringir suas permissões.
                      </p>
                    </div>
                  ) : (
                    <div className="border border-slate-200 rounded-sm overflow-hidden max-h-[420px] overflow-y-auto">
                      {PAGE_SECTIONS.map(section => {
                        const paths = section.items.map(i => i.path);
                        const allIn = paths.every(p => editPages.includes(p));
                        const someIn = paths.some(p => editPages.includes(p));
                        const isOpen = !!expanded[section.label];

                        return (
                          <div key={section.label} className="border-b border-slate-100 last:border-0">
                            {/* Cabeçalho da seção */}
                            <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50">
                              <button
                                onClick={() => toggleSection(section.items)}
                                className="flex items-center gap-2 flex-1 text-left"
                                title={allIn ? 'Desmarcar seção' : 'Marcar seção'}
                              >
                                {allIn ? (
                                  <CheckSquare className="w-4 h-4 text-primary shrink-0" />
                                ) : someIn ? (
                                  <div className="w-4 h-4 border-2 border-primary rounded-sm bg-primary/20 shrink-0" />
                                ) : (
                                  <Square className="w-4 h-4 text-slate-300 shrink-0" />
                                )}
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-600">
                                  {section.label}
                                </span>
                                <span className="text-[8px] font-black text-slate-400">
                                  ({paths.filter(p => editPages.includes(p)).length}/{paths.length})
                                </span>
                              </button>
                              <button
                                onClick={() => setExpanded(prev => ({ ...prev, [section.label]: !isOpen }))}
                                className="p-1 text-slate-400 hover:text-primary transition-colors"
                              >
                                {isOpen
                                  ? <ChevronDown className="w-3.5 h-3.5" />
                                  : <ChevronRight className="w-3.5 h-3.5" />
                                }
                              </button>
                            </div>

                            {/* Itens da seção */}
                            {isOpen && (
                              <div className="divide-y divide-slate-50">
                                {section.items.map(item => (
                                  <button
                                    key={item.path}
                                    onClick={() => togglePage(item.path)}
                                    className={`w-full flex items-center gap-3 px-4 py-2 text-left transition-colors ${
                                      editPages.includes(item.path)
                                        ? 'bg-primary/5'
                                        : 'hover:bg-slate-50'
                                    }`}
                                  >
                                    {editPages.includes(item.path)
                                      ? <CheckSquare className="w-3.5 h-3.5 text-primary shrink-0" />
                                      : <Square className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                                    }
                                    <span className="text-[10px] font-bold text-slate-600">{item.label}</span>
                                    <span className="text-[9px] text-slate-300 font-mono ml-auto">{item.path}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Botões de ação */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 py-3 bg-secondary text-primary font-black text-[10px] uppercase tracking-widest rounded-sm hover:bg-secondary/90 transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {saving
                      ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      : <Save className="w-3.5 h-3.5" />
                    }
                    {isNew ? 'Criar Grupo' : 'Salvar Alterações'}
                  </button>

                  {canDelete && !isNew && (
                    <button
                      onClick={handleDelete}
                      className="px-5 py-3 bg-red-50 text-danger font-black text-[10px] uppercase tracking-widest rounded-sm hover:bg-danger hover:text-white transition-all border border-red-200 flex items-center gap-2"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Excluir
                    </button>
                  )}
                </div>

                {/* Info de usuários no grupo */}
                {!isNew && selected && (
                  <div className="flex items-center gap-2 pt-1 text-[10px] text-slate-400">
                    <Users className="w-3.5 h-3.5" />
                    <span>
                      {selected.nome === 'Administrador'
                        ? 'Usuários com role "gestor" pertencem automaticamente a este grupo.'
                        : `Usuários com este grupo acessam ${selected.paginas?.length ?? 0} página${(selected.paginas?.length ?? 0) !== 1 ? 's' : ''} do WMS.`
                      }
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </EnterprisePageBase>
  );
}
