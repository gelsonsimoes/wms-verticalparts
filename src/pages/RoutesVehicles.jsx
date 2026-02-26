import React, { useState, useMemo, useRef } from 'react';
import {
  Truck,
  MapPin,
  Plus,
  Save,
  Trash2,
  Edit3,
  Search,
  Users,
  CheckCircle2,
  XCircle,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  ArrowLeft,
  ArrowRightLeft,
  Star,
  StarOff,
  X,
  Route,
  Building2,
  Weight,
  Gauge,
  Hash,
  Tag,
  ToggleLeft,
  ToggleRight,
  AlertTriangle,
  GripVertical,
  Check,
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...i) { return twMerge(clsx(i)); }

// ─── ENUMS ────────────────────────────────────────────────────────────
const CLASSIFICACOES = ['2 Eixos', '3 Eixos', '4 Eixos', 'Semi-Reboque', 'Furgão', 'Van', 'Moto'];
const TRANSPORTADORAS = ['Transporte Rápido Ltda', 'LogBrasil S/A', 'SpeedLog', 'Frota Própria', 'TransElevadores', 'Expresso Sul'];
const PRIORIDADES = ['Alta', 'Média', 'Baixa'];

// ─── MOCK VEÍCULOS ────────────────────────────────────────────────────
const VEICULOS_INIT = [
  { id:'V001', placa:'ABC-1D23', codigo:'VEI-001', classificacao:'3 Eixos', modelo:'Volvo FH 460', transportadora:'LogBrasil S/A', tara:7200, lotacao:25000, disponivel:true },
  { id:'V002', placa:'DEF-4E56', codigo:'VEI-002', classificacao:'2 Eixos', modelo:'Mercedes Atego 1719', transportadora:'Frota Própria', tara:4800, lotacao:12000, disponivel:true },
  { id:'V003', placa:'GHI-7F89', codigo:'VEI-003', classificacao:'Semi-Reboque', modelo:'Scania R450', transportadora:'TransElevadores', tara:9100, lotacao:35000, disponivel:false },
  { id:'V004', placa:'JKL-0G12', codigo:'VEI-004', classificacao:'Furgão', modelo:'Sprinter 415CDI', transportadora:'Frota Própria', tara:2200, lotacao:1800, disponivel:true },
];

// ─── MOCK ROTAS ───────────────────────────────────────────────────────
const CLIENTES_ALL = [
  { id:'C01', nome:'Elevadores SP Ltda',          cidade:'São Paulo/SP' },
  { id:'C02', nome:'Condomínio Torre Norte',       cidade:'Campinas/SP' },
  { id:'C03', nome:'Shopping Paulista',            cidade:'São Paulo/SP' },
  { id:'C04', nome:'Hospital Regional ABC',        cidade:'Santo André/SP' },
  { id:'C05', nome:'Edifício Infinity',            cidade:'Guarulhos/SP' },
  { id:'C06', nome:'Parque Tecnológico Sul',       cidade:'São Bernardo/SP' },
  { id:'C07', nome:'Fórum da Comarca Central',     cidade:'São Paulo/SP' },
  { id:'C08', nome:'Aeroporto Regional Viracopos', cidade:'Campinas/SP' },
  { id:'C09', nome:'Construtora Alvenaria',        cidade:'Sorocaba/SP' },
  { id:'C10', nome:'Centro Logístico Jundiaí',     cidade:'Jundiaí/SP' },
  { id:'C11', nome:'Residencial Villa Nova',       cidade:'Indaiatuba/SP' },
  { id:'C12', nome:'Chácara Industrial Leste',     cidade:'Mogi das Cruzes/SP' },
];

const ROTAS_INIT = [
  { id:'R001', codigo:'RTA-SP-01', descricao:'Grande São Paulo - Zona Leste', prioridade:'Alta',  clientes:['C01','C05','C07'] },
  { id:'R002', codigo:'RTA-CP-01', descricao:'Campinas e Região Metropolitana', prioridade:'Média', clientes:['C02','C08'] },
  { id:'R003', codigo:'RTA-ABC-01', descricao:'ABC Paulista - Santo André / SBC / São Caetano', prioridade:'Alta', clientes:['C04','C06'] },
  { id:'R004', codigo:'RTA-INT-01', descricao:'Interior SP - Sorocaba / Jundiaí / Indaiatuba', prioridade:'Baixa', clientes:['C09','C10','C11'] },
];

// ─── HELPERS ─────────────────────────────────────────────────────────
const inputCls = "w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-secondary rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200 outline-none transition-all";
const selectCls = inputCls + " appearance-none cursor-pointer";

function Field({ label, children, className }) {
  return (
    <div className={cn('space-y-1', className)}>
      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
      {children}
    </div>
  );
}

const priColor = { Alta:'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', Média:'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', Baixa:'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' };

// ─── MODAL VINCULAR CLIENTES (Dual-Listbox) ──────────────────────────
function ModalVincularClientes({ rota, onClose, onSave }) {
  const [disponiveis, setDisponiveis] = useState(
    CLIENTES_ALL.filter(c => !rota.clientes.includes(c.id))
  );
  const [vinculados, setVinculados]   = useState(
    CLIENTES_ALL.filter(c =>  rota.clientes.includes(c.id))
  );
  const [selDisp, setSelDisp] = useState([]);
  const [selVinc, setSelVinc] = useState([]);
  const [dragOver, setDragOver] = useState(null); // 'disp' | 'vinc'
  const [searchDisp, setSearchDisp] = useState('');
  const [searchVinc, setSearchVinc] = useState('');

  const toggleSel = (list, setList, id) => {
    setList(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const moveToVinc = () => {
    const moving = disponiveis.filter(c => selDisp.includes(c.id));
    setVinculados(v => [...v, ...moving]);
    setDisponiveis(d => d.filter(c => !selDisp.includes(c.id)));
    setSelDisp([]);
  };

  const moveToDisp = () => {
    const moving = vinculados.filter(c => selVinc.includes(c.id));
    setDisponiveis(d => [...d, ...moving]);
    setVinculados(v => v.filter(c => !selVinc.includes(c.id)));
    setSelVinc([]);
  };

  const moveAllToVinc = () => {
    setVinculados(v => [...v, ...disponiveis]);
    setDisponiveis([]);
    setSelDisp([]);
  };

  const moveAllToDisp = () => {
    setDisponiveis(d => [...d, ...vinculados]);
    setVinculados([]);
    setSelVinc([]);
  };

  // Drag & Drop entre listas
  const handleDragStart = (e, clienteId, from) => {
    e.dataTransfer.setData('clienteId', clienteId);
    e.dataTransfer.setData('from',      from);
  };

  const handleDrop = (e, to) => {
    e.preventDefault();
    setDragOver(null);
    const id   = e.dataTransfer.getData('clienteId');
    const from = e.dataTransfer.getData('from');
    if (from === to) return;
    if (from === 'disp' && to === 'vinc') {
      const c = disponiveis.find(x => x.id === id);
      if (c) { setVinculados(v => [...v, c]); setDisponiveis(d => d.filter(x => x.id !== id)); }
    } else {
      const c = vinculados.find(x => x.id === id);
      if (c) { setDisponiveis(d => [...d, c]); setVinculados(v => v.filter(x => x.id !== id)); }
    }
  };

  const filtDisp = disponiveis.filter(c => c.nome.toLowerCase().includes(searchDisp.toLowerCase()) || c.cidade.toLowerCase().includes(searchDisp.toLowerCase()));
  const filtVinc = vinculados.filter(c =>  c.nome.toLowerCase().includes(searchVinc.toLowerCase())  || c.cidade.toLowerCase().includes(searchVinc.toLowerCase()));

  const ClienteItem = ({ c, selList, onToggle, from }) => (
    <div
      draggable
      onDragStart={e => handleDragStart(e, c.id, from)}
      onClick={() => onToggle(c.id)}
      className={cn(
        'flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all select-none border-2',
        selList.includes(c.id)
          ? 'border-secondary/60 bg-secondary/10'
          : 'border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
      )}>
      <GripVertical className="w-3 h-3 text-slate-400 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{c.nome}</p>
        <p className="text-[9px] text-slate-400 font-medium">{c.cidade}</p>
      </div>
      {selList.includes(c.id) && <Check className="w-3.5 h-3.5 text-secondary shrink-0" />}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-[28px] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3 bg-white dark:bg-slate-900 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-secondary/10 flex items-center justify-center">
            <Users className="w-4 h-4 text-secondary" />
          </div>
          <div>
            <p className="text-xs font-black text-slate-800 dark:text-white">Vincular Clientes à Rota</p>
            <p className="text-[10px] text-slate-400 font-medium">{rota.codigo} · {rota.descricao}</p>
          </div>
          <button onClick={onClose} className="ml-auto text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dual-listbox */}
        <div className="flex items-stretch gap-3 p-5 flex-1 overflow-hidden min-h-0">
          {/* Lista DISPONÍVEIS */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Disponíveis ({disponiveis.length})</p>
            </div>
            <div className="relative mb-2 shrink-0">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input value={searchDisp} onChange={e => setSearchDisp(e.target.value)} placeholder="Buscar..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:border-secondary transition-all" />
            </div>
            <div
              onDragOver={e => { e.preventDefault(); setDragOver('disp'); }}
              onDragLeave={() => setDragOver(null)}
              onDrop={e => handleDrop(e, 'disp')}
              className={cn('flex-1 overflow-y-auto border-2 border-dashed rounded-2xl p-2 space-y-1 transition-all',
                dragOver === 'disp' ? 'border-secondary bg-secondary/5' : 'border-slate-200 dark:border-slate-700'
              )}>
              {filtDisp.length === 0
                ? <p className="text-center text-[10px] text-slate-400 py-6">Nenhum disponível</p>
                : filtDisp.map(c => (
                  <ClienteItem key={c.id} c={c} selList={selDisp} onToggle={id => toggleSel(selDisp, setSelDisp, id)} from="disp" />
                ))
              }
            </div>
          </div>

          {/* Controles centrais */}
          <div className="flex flex-col items-center justify-center gap-2 shrink-0 py-6">
            <button onClick={moveToVinc} disabled={selDisp.length === 0}
              title="Mover selecionados →"
              className="w-8 h-8 rounded-lg bg-secondary/10 hover:bg-secondary/20 text-secondary flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed">
              <ChevronRight className="w-4 h-4" />
            </button>
            <button onClick={moveAllToVinc} disabled={disponiveis.length === 0}
              title="Mover todos →"
              className="w-8 h-8 rounded-lg bg-secondary/10 hover:bg-secondary/20 text-secondary flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed">
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-auto" />
            <button onClick={moveToDisp} disabled={selVinc.length === 0}
              title="← Remover selecionados"
              className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={moveAllToDisp} disabled={vinculados.length === 0}
              title="← Remover todos"
              className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed">
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Lista VINCULADOS */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Vinculados ({vinculados.length})</p>
            </div>
            <div className="relative mb-2 shrink-0">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input value={searchVinc} onChange={e => setSearchVinc(e.target.value)} placeholder="Buscar..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:border-secondary transition-all" />
            </div>
            <div
              onDragOver={e => { e.preventDefault(); setDragOver('vinc'); }}
              onDragLeave={() => setDragOver(null)}
              onDrop={e => handleDrop(e, 'vinc')}
              className={cn('flex-1 overflow-y-auto border-2 border-dashed rounded-2xl p-2 space-y-1 transition-all',
                dragOver === 'vinc' ? 'border-secondary bg-secondary/5' : 'border-green-300 dark:border-green-800/50 bg-green-50/30 dark:bg-green-950/10'
              )}>
              {filtVinc.length === 0
                ? <p className="text-center text-[10px] text-slate-400 py-6">Arraste clientes para aqui</p>
                : filtVinc.map(c => (
                  <ClienteItem key={c.id} c={c} selList={selVinc} onToggle={id => toggleSel(selVinc, setSelVinc, id)} from="vinc" />
                ))
              }
            </div>
          </div>
        </div>

        {/* Dica drag-and-drop */}
        <div className="px-5 pb-2 flex items-center gap-1.5 text-[9px] text-slate-400 font-medium shrink-0">
          <GripVertical className="w-3 h-3" />Arraste itens entre as listas, ou selecione e use as setas do centro
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2 shrink-0">
          <button onClick={onClose} className="px-4 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs font-black text-slate-500 hover:border-slate-400 transition-all">Cancelar</button>
          <button onClick={() => onSave(vinculados.map(c => c.id))}
            className="px-5 py-2 bg-secondary text-primary rounded-xl text-xs font-black hover:brightness-105 active:scale-95 transition-all shadow-md flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5" />Salvar Vínculos ({vinculados.length} clientes)
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── SEÇÃO VEÍCULOS ───────────────────────────────────────────────────
function SecaoVeiculos() {
  const [veiculos, setVeiculos] = useState(VEICULOS_INIT);
  const [editando, setEditando] = useState(null);
  const [isNew,    setIsNew]    = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [search,   setSearch]   = useState('');

  const empty = () => ({ id:'V' + Date.now(), placa:'', codigo:'', classificacao:CLASSIFICACOES[0], modelo:'', transportadora:TRANSPORTADORAS[0], tara:0, lotacao:0, disponivel:true });

  const filtered = useMemo(() =>
    veiculos.filter(v => v.placa.toLowerCase().includes(search.toLowerCase()) || v.modelo.toLowerCase().includes(search.toLowerCase())),
    [veiculos, search]);

  const startNew = () => { setEditando(empty()); setIsNew(true); setSaved(false); };
  const startEdit = (v) => { setEditando({ ...v }); setIsNew(false); setSaved(false); };
  const cancelEdit = () => { setEditando(null); setIsNew(false); };

  const handleSave = () => {
    if (!editando.placa) return;
    setVeiculos(vs => isNew ? [editando, ...vs] : vs.map(v => v.id === editando.id ? editando : v));
    setSaved(true);
    setTimeout(() => { setSaved(false); setEditando(null); setIsNew(false); }, 1500);
  };

  const handleDelete = (id) => setVeiculos(vs => vs.filter(v => v.id !== id));

  const toggleDisp = (id) => setVeiculos(vs => vs.map(v => v.id === id ? { ...v, disponivel: !v.disponivel } : v));

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Placa ou Modelo..."
            className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 focus:border-secondary rounded-xl text-xs font-medium outline-none transition-all" />
        </div>
        <button onClick={startNew}
          className="flex items-center gap-1.5 px-4 py-2 bg-secondary text-primary rounded-xl text-xs font-black hover:brightness-105 active:scale-95 transition-all shadow-md shrink-0">
          <Plus className="w-3.5 h-3.5" />Novo Veículo
        </button>
      </div>

      {/* Formulário inline */}
      {editando && (
        <div className="bg-secondary/5 border-2 border-secondary/30 rounded-2xl p-5 space-y-3">
          <p className="text-[10px] font-black text-secondary uppercase tracking-widest">{isNew ? '➕ Novo Veículo' : '✏️ Editando Veículo'}</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Field label="Placa">
              <input value={editando.placa} onChange={e => setEditando(v => ({ ...v, placa: e.target.value.toUpperCase() }))}
                maxLength={8} className={inputCls + " font-mono uppercase tracking-widest"} placeholder="ABC-1D23" />
            </Field>
            <Field label="Código Interno">
              <input value={editando.codigo} onChange={e => setEditando(v => ({ ...v, codigo: e.target.value }))}
                className={inputCls} placeholder="Ex: VEI-001" />
            </Field>
            <Field label="Classificação">
              <select value={editando.classificacao} onChange={e => setEditando(v => ({ ...v, classificacao: e.target.value }))} className={selectCls}>
                {CLASSIFICACOES.map(c => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Modelo">
              <input value={editando.modelo} onChange={e => setEditando(v => ({ ...v, modelo: e.target.value }))}
                className={inputCls} placeholder="Ex: Volvo FH 460" />
            </Field>
            <Field label="Transportadora">
              <select value={editando.transportadora} onChange={e => setEditando(v => ({ ...v, transportadora: e.target.value }))} className={selectCls}>
                {TRANSPORTADORAS.map(t => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Status">
              <button type="button" onClick={() => setEditando(v => ({ ...v, disponivel: !v.disponivel }))}
                className={cn('w-full flex items-center justify-between px-3 py-2 rounded-xl border-2 transition-all font-bold text-sm',
                  editando.disponivel ? 'border-green-400 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400' : 'border-red-300 bg-red-50 dark:bg-red-950/20 text-red-600'
                )}>
                <span className="text-xs">{editando.disponivel ? 'Disponível' : 'Indisponível'}</span>
                {editando.disponivel ? <ToggleRight className="w-5 h-5 text-green-600" /> : <ToggleLeft className="w-5 h-5 text-red-500" />}
              </button>
            </Field>
            <Field label="Tara (kg — Peso Vazio)">
              <input type="number" min="0" value={editando.tara} onChange={e => setEditando(v => ({ ...v, tara: +e.target.value }))} className={inputCls} />
            </Field>
            <Field label="Lotação (kg — Capacidade)">
              <input type="number" min="0" value={editando.lotacao} onChange={e => setEditando(v => ({ ...v, lotacao: +e.target.value }))} className={inputCls} />
            </Field>
            {/* Peso líquido calculado */}
            <Field label="Peso Líquido (calculado)">
              <div className="px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm font-black text-secondary">
                {(editando.lotacao - editando.tara).toLocaleString('pt-BR')} kg
              </div>
            </Field>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button onClick={cancelEdit} className="px-4 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs font-black text-slate-500 hover:border-slate-400 transition-all">Cancelar</button>
            <button onClick={handleSave} disabled={!editando.placa}
              className="px-5 py-2 bg-secondary text-primary rounded-xl text-xs font-black hover:brightness-105 disabled:opacity-40 transition-all flex items-center gap-1.5 shadow-md">
              {saved ? <><CheckCircle2 className="w-3.5 h-3.5" />Salvo!</> : <><Save className="w-3.5 h-3.5" />Salvar</>}
            </button>
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-100 dark:border-slate-800 overflow-hidden flex-1">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800 border-b-2 border-slate-100 dark:border-slate-700">
              {['Status','Placa','Código','Classificação','Modelo','Transportadora','Tara','Lotação','Ações'].map(h => (
                <th key={h} className="p-3 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(v => (
              <tr key={v.id} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all group">
                <td className="p-3">
                  <button onClick={() => toggleDisp(v.id)} className="flex items-center gap-1.5 group/tog">
                    {v.disponivel
                      ? <ToggleRight className="w-5 h-5 text-green-500 group-hover/tog:text-green-600" />
                      : <ToggleLeft className="w-5 h-5 text-slate-400 group-hover/tog:text-red-500" />}
                    <span className={cn('text-[9px] font-black uppercase', v.disponivel ? 'text-green-600' : 'text-slate-400')}>
                      {v.disponivel ? 'Disponível' : 'Indispon.'}
                    </span>
                  </button>
                </td>
                <td className="p-3"><code className="text-xs font-black text-slate-700 dark:text-white tracking-widest">{v.placa}</code></td>
                <td className="p-3 text-[10px] text-slate-500 font-bold">{v.codigo}</td>
                <td className="p-3"><span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-black px-2 py-0.5 rounded-full">{v.classificacao}</span></td>
                <td className="p-3 text-xs font-bold text-slate-700 dark:text-slate-300">{v.modelo}</td>
                <td className="p-3 text-xs text-slate-500">{v.transportadora}</td>
                <td className="p-3 text-right text-xs font-bold text-slate-600 dark:text-slate-400 whitespace-nowrap">{v.tara.toLocaleString('pt-BR')} kg</td>
                <td className="p-3 text-right text-xs font-black text-secondary whitespace-nowrap">{v.lotacao.toLocaleString('pt-BR')} kg</td>
                <td className="p-3">
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => startEdit(v)} className="p-1.5 hover:bg-secondary/10 rounded-lg text-slate-400 hover:text-secondary transition-all">
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(v.id)} className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg text-slate-400 hover:text-red-500 transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={9} className="p-8 text-center text-slate-400 text-xs">Nenhum veículo encontrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── SEÇÃO ROTAS ──────────────────────────────────────────────────────
function SecaoRotas() {
  const [rotas,    setRotas]    = useState(ROTAS_INIT);
  const [editando, setEditando] = useState(null);
  const [isNew,    setIsNew]    = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [modalRota, setModalRota] = useState(null);
  const [search,   setSearch]   = useState('');

  const empty = () => ({ id:'R' + Date.now(), codigo:'', descricao:'', prioridade:'Média', clientes:[] });

  const filtered = useMemo(() =>
    rotas.filter(r => r.codigo.toLowerCase().includes(search.toLowerCase()) || r.descricao.toLowerCase().includes(search.toLowerCase())),
    [rotas, search]);

  const startNew = () => { setEditando(empty()); setIsNew(true); setSaved(false); };
  const startEdit = (r) => { setEditando({ ...r }); setIsNew(false); setSaved(false); };
  const cancelEdit = () => { setEditando(null); setIsNew(false); };

  const handleSave = () => {
    if (!editando.codigo) return;
    setRotas(rs => isNew ? [editando, ...rs] : rs.map(r => r.id === editando.id ? editando : r));
    setSaved(true);
    setTimeout(() => { setSaved(false); setEditando(null); setIsNew(false); }, 1500);
  };

  const handleDelete = (id) => setRotas(rs => rs.filter(r => r.id !== id));

  const handleSaveVinculos = (ids) => {
    setRotas(rs => rs.map(r => r.id === modalRota.id ? { ...r, clientes: ids } : r));
    setModalRota(null);
  };

  return (
    <>
      {modalRota && <ModalVincularClientes rota={modalRota} onClose={() => setModalRota(null)} onSave={handleSaveVinculos} />}

      <div className="flex flex-col gap-4 h-full">
        {/* Toolbar */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Código ou Descrição da Rota..."
              className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 focus:border-secondary rounded-xl text-xs font-medium outline-none transition-all" />
          </div>
          <button onClick={startNew}
            className="flex items-center gap-1.5 px-4 py-2 bg-secondary text-primary rounded-xl text-xs font-black hover:brightness-105 active:scale-95 transition-all shadow-md shrink-0">
            <Plus className="w-3.5 h-3.5" />Nova Rota
          </button>
        </div>

        {/* Formulário inline */}
        {editando && (
          <div className="bg-secondary/5 border-2 border-secondary/30 rounded-2xl p-5 space-y-3">
            <p className="text-[10px] font-black text-secondary uppercase tracking-widest">{isNew ? '➕ Nova Rota' : '✏️ Editando Rota'}</p>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Código da Rota">
                <input value={editando.codigo} onChange={e => setEditando(r => ({ ...r, codigo: e.target.value.toUpperCase() }))}
                  className={inputCls + " font-mono uppercase"} placeholder="RTA-SP-01" />
              </Field>
              <Field label="Prioridade">
                <select value={editando.prioridade} onChange={e => setEditando(r => ({ ...r, prioridade: e.target.value }))} className={selectCls}>
                  {PRIORIDADES.map(p => <option key={p}>{p}</option>)}
                </select>
              </Field>
              <div />
              <Field label="Descrição da Rota" className="col-span-3">
                <input value={editando.descricao} onChange={e => setEditando(r => ({ ...r, descricao: e.target.value }))}
                  className={inputCls} placeholder="Ex: São Paulo - Zona Sul" />
              </Field>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button onClick={cancelEdit} className="px-4 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs font-black text-slate-500 hover:border-slate-400 transition-all">Cancelar</button>
              <button onClick={handleSave} disabled={!editando.codigo}
                className="px-5 py-2 bg-secondary text-primary rounded-xl text-xs font-black hover:brightness-105 disabled:opacity-40 transition-all flex items-center gap-1.5 shadow-md">
                {saved ? <><CheckCircle2 className="w-3.5 h-3.5" />Salvo!</> : <><Save className="w-3.5 h-3.5" />Salvar</>}
              </button>
            </div>
          </div>
        )}

        {/* Grid */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-100 dark:border-slate-800 overflow-hidden flex-1">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 border-b-2 border-slate-100 dark:border-slate-700">
                {['Código','Descrição da Rota','Prioridade','Clientes','Ações'].map(h => (
                  <th key={h} className="p-3 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => {
                const nomes = r.clientes.map(id => CLIENTES_ALL.find(c => c.id === id)?.nome).filter(Boolean);
                return (
                  <tr key={r.id} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all group">
                    <td className="p-3"><code className="text-xs font-black text-secondary">{r.codigo}</code></td>
                    <td className="p-3 text-xs font-bold text-slate-700 dark:text-slate-300 max-w-[220px]">{r.descricao}</td>
                    <td className="p-3">
                      <span className={cn('text-[9px] font-black px-2.5 py-1 rounded-full', priColor[r.prioridade])}>{r.prioridade}</span>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {nomes.slice(0, 2).map(n => (
                          <span key={n} className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-lg font-bold truncate max-w-[90px]">{n}</span>
                        ))}
                        {nomes.length > 2 && <span className="text-[9px] bg-secondary/10 text-secondary px-2 py-0.5 rounded-lg font-black">+{nomes.length - 2}</span>}
                        {nomes.length === 0 && <span className="text-[9px] text-slate-300 italic">Nenhum vinculado</span>}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setModalRota(r)}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-secondary/10 hover:bg-secondary/20 text-secondary rounded-xl text-[9px] font-black transition-all whitespace-nowrap">
                          <Users className="w-3 h-3" />Clientes
                        </button>
                        <button onClick={() => startEdit(r)} className="p-1.5 hover:bg-secondary/10 rounded-lg text-slate-400 hover:text-secondary transition-all opacity-0 group-hover:opacity-100">
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(r.id)} className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg text-slate-400 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-slate-400 text-xs">Nenhuma rota encontrada.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────
export default function RoutesVehicles() {
  const [tab, setTab] = useState(0);

  const TABS = [
    { label: 'Veículos',         icon: Truck,  desc: 'Frota e status de disponibilidade' },
    { label: 'Rotas e Pré-Carga',icon: Route,  desc: 'Rotas de entrega e vínculo de clientes' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col animate-in fade-in duration-700">

      {/* HEADER */}
      <div className="bg-white dark:bg-slate-900 border-b-2 border-slate-100 dark:border-slate-800 px-6 py-5 relative overflow-hidden shrink-0">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-700 via-secondary to-blue-700" />
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-700 to-blue-900 flex items-center justify-center shadow-lg shrink-0">
            <Truck className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Cat. 1 — Cadastros e Segurança</p>
            <h1 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Gestão de Rotas e Veículos</h1>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Frota · Transportadoras · Rotas de entrega · Vínculo de destinatários</p>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="bg-white dark:bg-slate-900 border-b-2 border-slate-100 dark:border-slate-800 px-6 flex gap-1 shrink-0">
        {TABS.map((t, i) => (
          <button key={i} onClick={() => setTab(i)}
            className={cn('flex items-center gap-2 px-5 py-3.5 text-xs font-black border-b-2 transition-all -mb-[2px]',
              tab === i ? 'border-secondary text-secondary' : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            )}>
            <t.icon className="w-4 h-4" />{t.label}
            <span className={cn('text-[8px] font-medium', tab === i ? 'text-secondary/70' : 'text-slate-400')}>{t.desc}</span>
          </button>
        ))}
      </div>

      {/* CONTENT */}
      <div className="flex-1 p-5 overflow-auto">
        {tab === 0 && <SecaoVeiculos />}
        {tab === 1 && <SecaoRotas />}
      </div>
    </div>
  );
}
