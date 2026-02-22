import React, { useState } from 'react';
import {
  Truck,
  Calendar,
  MapPin,
  CheckCircle2,
  Clock,
  Plus,
  Pencil,
  X,
  Search,
  ChevronDown,
  ArrowRight,
  DoorOpen,
  ParkingSquare,
  LogOut,
  Filter,
  Building2,
  BadgeCheck,
  TriangleAlert,
  FileText,
  User,
  ScrollText,
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// ===== CONSTANTES DE FLUXO =====
const FLOW = [
  { key: 'Agendado',               label: 'Agendado',            color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',    dot: 'bg-slate-400' },
  { key: 'Veículo Recepcionado',   label: 'Recepcionado',        color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',     dot: 'bg-blue-500' },
  { key: 'Veículo no Pátio',       label: 'No Pátio',            color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300', dot: 'bg-amber-500 animate-pulse' },
  { key: 'Veículo na Doca',        label: 'Na Doca',             color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300', dot: 'bg-purple-500' },
  { key: 'Finalizado',             label: 'Finalizado',          color: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300', dot: 'bg-green-500' },
  { key: 'Cancelado',              label: 'Cancelado',           color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',         dot: 'bg-red-500' },
];

const FLOW_BUTTONS = [
  { fromStatus: 'Agendado',             toStatus: 'Veículo Recepcionado', label: 'Veículo Chegou',    icon: BadgeCheck,    color: 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200 dark:shadow-blue-900' },
  { fromStatus: 'Veículo Recepcionado', toStatus: 'Veículo no Pátio',    label: 'Veículo no Pátio',  icon: ParkingSquare, color: 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-200 dark:shadow-amber-900' },
  { fromStatus: 'Veículo no Pátio',     toStatus: 'Veículo na Doca',     label: 'Veículo na Doca',   icon: DoorOpen,      color: 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-200 dark:shadow-purple-900', requiresDockModal: true },
  { fromStatus: 'Veículo na Doca',      toStatus: 'Finalizado',          label: 'Veículo Liberado',  icon: LogOut,        color: 'bg-green-600 hover:bg-green-700 text-white shadow-green-200 dark:shadow-green-900' },
];

const DOCAS = ['DOCA-01', 'DOCA-02', 'DOCA-03', 'DOCA-04', 'DOCA-05', 'DOCA-06'];

// ===== DADOS MOCK =====
function makeLog(status, user = 'danilo.supervisor') {
  return { status, user, ts: new Date().toLocaleString('pt-BR') };
}

const INITIAL_RECORDS = [
  {
    id: 1,
    agendamento: '22/02/2026 07:00',
    depositante: 'VerticalParts Matriz',
    transportadora: 'TBM Logística',
    placa: 'ABC-1D23',
    docaPrevista: 'DOCA-02',
    status: 'Agendado',
    motorista: 'João Pereira',
    logs: [makeLog('Agendado')],
    docaConfirmada: null,
  },
  {
    id: 2,
    agendamento: '22/02/2026 08:30',
    depositante: 'Filial BH',
    transportadora: 'Rápido São Paulo',
    placa: 'DEF-4E56',
    docaPrevista: 'DOCA-01',
    status: 'Veículo Recepcionado',
    motorista: 'Carlos Souza',
    logs: [makeLog('Agendado'), makeLog('Veículo Recepcionado')],
    docaConfirmada: null,
  },
  {
    id: 3,
    agendamento: '22/02/2026 09:00',
    depositante: 'Cliente Externo MG',
    transportadora: 'VPC Express',
    placa: 'GHI-7F89',
    docaPrevista: 'DOCA-04',
    status: 'Veículo no Pátio',
    motorista: 'Wellington Lima',
    logs: [makeLog('Agendado'), makeLog('Veículo Recepcionado'), makeLog('Veículo no Pátio')],
    docaConfirmada: null,
  },
  {
    id: 4,
    agendamento: '22/02/2026 10:00',
    depositante: 'Atacado Norte',
    transportadora: 'Tegma',
    placa: 'JKL-1G23',
    docaPrevista: 'DOCA-03',
    status: 'Veículo na Doca',
    motorista: 'Fabio Mendes',
    logs: [makeLog('Agendado'), makeLog('Veículo Recepcionado'), makeLog('Veículo no Pátio'), makeLog('Veículo na Doca')],
    docaConfirmada: 'DOCA-03',
  },
  {
    id: 5,
    agendamento: '21/02/2026 14:00',
    depositante: 'VerticalParts Matriz',
    transportadora: 'JSL Logística',
    placa: 'MNO-5H67',
    docaPrevista: 'DOCA-01',
    status: 'Finalizado',
    motorista: 'Ricardo Dias',
    logs: [makeLog('Agendado'), makeLog('Veículo Recepcionado'), makeLog('Veículo no Pátio'), makeLog('Veículo na Doca'), makeLog('Finalizado')],
    docaConfirmada: 'DOCA-01',
  },
];

// ===== MODAL DE AGENDAMENTO =====
function ScheduleModal({ onClose, onSave, record }) {
  const [form, setForm] = useState(record || {
    agendamento: '', depositante: '', transportadora: '', placa: '', docaPrevista: 'DOCA-01', motorista: '',
  });

  const handleSave = () => {
    if (!form.agendamento || !form.placa || !form.transportadora) return;
    onSave({
      ...form,
      id: record?.id || Date.now(),
      status: record?.status || 'Agendado',
      logs: record?.logs || [makeLog('Agendado')],
      docaConfirmada: record?.docaConfirmada || null,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-[28px] border-2 border-slate-100 dark:border-slate-800 shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="bg-secondary px-7 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-[9px] font-black text-primary/60 uppercase tracking-widest">Portaria</p>
              <h2 className="text-base font-black text-primary uppercase">{record ? 'Alterar Agendamento' : 'Novo Agendamento'}</h2>
            </div>
          </div>
          <button onClick={onClose} className="text-primary/50 hover:text-primary"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-7 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Data/Hora Agendamento', key: 'agendamento', placeholder: '22/02/2026 08:00', full: true },
              { label: 'Depositante', key: 'depositante', placeholder: 'VerticalParts Matriz' },
              { label: 'Transportadora', key: 'transportadora', placeholder: 'TBM Logística' },
              { label: 'Placa do Veículo', key: 'placa', placeholder: 'ABC-1D23' },
              { label: 'Nome do Motorista', key: 'motorista', placeholder: 'João Pereira' },
            ].map(f => (
              <div key={f.key} className={cn("space-y-1.5", f.full && "col-span-2")}>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{f.label}</label>
                <input
                  value={form[f.key] || ''}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:border-secondary transition-all"
                />
              </div>
            ))}
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Doca Prevista</label>
              <select
                value={form.docaPrevista}
                onChange={e => setForm(p => ({ ...p, docaPrevista: e.target.value }))}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:border-secondary transition-all"
              >
                {DOCAS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 py-3 rounded-2xl border-2 border-slate-200 dark:border-slate-700 text-sm font-black text-slate-500 hover:bg-slate-50 transition-all uppercase tracking-wider">Cancelar</button>
            <button onClick={handleSave} className="flex-1 py-3 rounded-2xl bg-secondary text-primary text-sm font-black hover:opacity-90 active:scale-95 transition-all uppercase tracking-wider flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== MODAL CONFIRMAR DOCA =====
function DockConfirmModal({ record, onClose, onConfirm }) {
  const [doca, setDoca] = useState(record?.docaPrevista || '');
  const [search, setSearch] = useState('');
  const filtered = DOCAS.filter(d => d.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-[28px] border-2 border-purple-200 dark:border-purple-900/50 shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="bg-purple-700 px-7 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <DoorOpen className="w-7 h-7 text-white" />
            <div>
              <p className="text-[9px] font-black text-white/60 uppercase tracking-widest">Portaria</p>
              <h2 className="text-base font-black text-white uppercase">Confirmar Doca</h2>
            </div>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-7 space-y-4">
          <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl">
            <TriangleAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <p className="text-[10px] font-bold text-amber-700 dark:text-amber-400 leading-snug">
              Veículo <strong>{record?.placa}</strong> — Doca prevista: <strong>{record?.docaPrevista}</strong>. Confirme a doca real de entrada.
            </p>
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Buscar Doca</label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                autoFocus
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Digite ou busque a doca..."
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:border-purple-500 transition-all"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {filtered.map(d => (
              <button
                key={d}
                onClick={() => setDoca(d)}
                className={cn(
                  "py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all border-2",
                  doca === d
                    ? "bg-purple-600 text-white border-purple-600 shadow-lg"
                    : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-purple-400"
                )}
              >
                {d}
              </button>
            ))}
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 py-3 rounded-2xl border-2 border-slate-200 dark:border-slate-700 text-sm font-black text-slate-500 hover:bg-slate-50 transition-all uppercase tracking-wider">Cancelar</button>
            <button
              disabled={!doca}
              onClick={() => onConfirm(doca)}
              className="flex-1 py-3 rounded-2xl bg-purple-600 text-white text-sm font-black hover:opacity-90 active:scale-95 transition-all uppercase tracking-wider disabled:opacity-30 flex items-center justify-center gap-2"
            >
              <DoorOpen className="w-4 h-4" /> Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== MODAL DE AUDIT LOG =====
function AuditLogModal({ record, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-[28px] border-2 border-slate-100 dark:border-slate-800 shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-secondary px-7 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ScrollText className="w-6 h-6 text-primary" />
            <div>
              <p className="text-[9px] font-black text-primary/60 uppercase tracking-widest">Rastreabilidade</p>
              <h2 className="text-base font-black text-primary uppercase">Histórico — {record.placa}</h2>
            </div>
          </div>
          <button onClick={onClose} className="text-primary/50 hover:text-primary"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-7 space-y-3">
          {record.logs.map((log, i) => {
            const flow = FLOW.find(f => f.key === log.status);
            return (
              <div key={i} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div className={cn("w-3 h-3 rounded-full mt-0.5 shrink-0", flow?.dot || 'bg-slate-400')} />
                  {i < record.logs.length - 1 && <div className="w-0.5 h-full bg-slate-200 dark:bg-slate-700 mt-1 min-h-[16px]" />}
                </div>
                <div className="pb-3">
                  <p className="text-xs font-black text-slate-900 dark:text-white">{log.status}</p>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                    <User className="w-3 h-3 inline mr-1" />{log.user} — {log.ts}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ===== COMPONENTE PRINCIPAL =====
export default function GateManager() {
  const [records, setRecords] = useState(INITIAL_RECORDS);
  const [selectedId, setSelectedId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showDockModal, setShowDockModal] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  const selectedRecord = records.find(r => r.id === selectedId);

  const filtered = records.filter(r => statusFilter === 'Todos' ? true : r.status === statusFilter);

  const currentFlowBtn = selectedRecord
    ? FLOW_BUTTONS.find(b => b.fromStatus === selectedRecord.status)
    : null;

  const advanceStatus = (toStatus, docaConfirmada = null) => {
    setRecords(prev => prev.map(r => r.id === selectedId
      ? {
          ...r,
          status: toStatus,
          docaConfirmada: docaConfirmada || r.docaConfirmada,
          logs: [...r.logs, makeLog(toStatus)],
        }
      : r
    ));
  };

  const handleFlowAction = () => {
    if (!currentFlowBtn) return;
    if (currentFlowBtn.requiresDockModal) {
      setShowDockModal(true);
    } else {
      advanceStatus(currentFlowBtn.toStatus);
    }
  };

  const handleDockConfirm = (doca) => {
    setShowDockModal(false);
    advanceStatus('Veículo na Doca', doca);
  };

  const handleSaveSchedule = (rec) => {
    setRecords(prev => {
      const idx = prev.findIndex(r => r.id === rec.id);
      if (idx >= 0) return prev.map(r => r.id === rec.id ? rec : r);
      return [rec, ...prev];
    });
    setSelectedId(rec.id);
  };

  const handleCancel = () => {
    if (!selectedId) return;
    setRecords(prev => prev.map(r => r.id === selectedId
      ? { ...r, status: 'Cancelado', logs: [...r.logs, makeLog('Cancelado')] }
      : r
    ));
    setSelectedId(null);
  };

  const statusCounts = FLOW.reduce((acc, f) => {
    acc[f.key] = records.filter(r => r.status === f.key).length;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 space-y-5 animate-in fade-in duration-700">

      {/* ===== HEADER ===== */}
      <div className="bg-white dark:bg-slate-900 rounded-[32px] border-2 border-slate-100 dark:border-slate-800 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-3xl bg-secondary flex items-center justify-center shadow-lg shadow-black/20 relative">
            <Truck className="w-8 h-8 text-primary" />
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
              <Building2 className="w-3 h-3 text-secondary" />
            </div>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Logística Externa</p>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Gerenciador de Portaria</h1>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Controle de fluxo de veículos — Portaria → Pátio → Doca → Liberação</p>
          </div>
        </div>

        {/* KPIs rápidos */}
        <div className="flex items-center gap-2 flex-wrap">
          {FLOW.slice(1, 5).map(f => (
            <div key={f.key} className={cn("flex items-center gap-2 px-3 py-2 rounded-xl border text-[10px] font-black uppercase tracking-wider", f.color, "border-current/20")}>
              <div className={cn("w-2 h-2 rounded-full", f.dot)} />
              {statusCounts[f.key] || 0} {f.label}
            </div>
          ))}
        </div>
      </div>

      {/* ===== TOOLBAR ===== */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-100 dark:border-slate-800 px-5 py-3 flex flex-wrap items-center gap-2 shadow-sm">

        {/* Apoio */}
        <button
          onClick={() => { setEditingRecord(null); setShowScheduleModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary text-primary text-xs font-black uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all shadow-md"
        >
          <Plus className="w-4 h-4" /> Cadastrar Agendamento
        </button>
        <button
          disabled={!selectedId || selectedRecord?.status === 'Finalizado' || selectedRecord?.status === 'Cancelado'}
          onClick={() => { setEditingRecord(selectedRecord); setShowScheduleModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-black uppercase tracking-wider hover:bg-slate-200 disabled:opacity-30 transition-all"
        >
          <Pencil className="w-4 h-4" /> Alterar
        </button>
        <button
          disabled={!selectedId || selectedRecord?.status === 'Finalizado' || selectedRecord?.status === 'Cancelado'}
          onClick={handleCancel}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-danger text-xs font-black uppercase tracking-wider hover:bg-red-50 disabled:opacity-30 transition-all"
        >
          <X className="w-4 h-4" /> Cancelar Agenda
        </button>

        <button
          disabled={!selectedId}
          onClick={() => setShowAuditModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-black uppercase tracking-wider hover:bg-slate-200 disabled:opacity-30 transition-all"
        >
          <ScrollText className="w-4 h-4" /> Histórico
        </button>

        <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />

        {/* Botão de fluxo dinâmico */}
        {currentFlowBtn ? (
          <button
            onClick={handleFlowAction}
            className={cn(
              "flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg active:scale-95",
              currentFlowBtn.color
            )}
          >
            <currentFlowBtn.icon className="w-4 h-4" />
            {currentFlowBtn.label}
            <ArrowRight className="w-3.5 h-3.5 opacity-70" />
          </button>
        ) : selectedRecord?.status === 'Finalizado' ? (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 text-xs font-black uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4" /> Fluxo Concluído
          </div>
        ) : selectedRecord?.status === 'Cancelado' ? (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-100 text-red-700 text-xs font-black uppercase tracking-wider">
            <X className="w-4 h-4" /> Agenda Cancelada
          </div>
        ) : (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 text-xs font-black uppercase tracking-wider">
            <Truck className="w-4 h-4" /> Selecione um registro
          </div>
        )}

        <div className="flex-1" />

        {/* Filtro */}
        <div className="relative">
          <button
            onClick={() => setShowFilterDropdown(p => !p)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-black uppercase tracking-wider hover:bg-slate-200 transition-all"
          >
            <Filter className="w-4 h-4" />
            {statusFilter === 'Todos' ? 'Exibir Todos' : statusFilter}
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          {showFilterDropdown && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-100 dark:border-slate-800 shadow-xl z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
              {['Todos', ...FLOW.map(f => f.key)].map(s => (
                <button
                  key={s}
                  onClick={() => { setStatusFilter(s); setShowFilterDropdown(false); }}
                  className={cn(
                    "w-full px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest transition-colors",
                    statusFilter === s
                      ? "bg-secondary text-primary"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  )}
                >
                  {s === 'Todos' ? '📋 Todos' : s}
                </button>
              ))}
            </div>
          )}
        </div>

        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{filtered.length} registros</span>
      </div>

      {/* ===== GRID PRINCIPAL ===== */}
      <div className="bg-white dark:bg-slate-900 rounded-[28px] border-2 border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800 border-b-2 border-slate-100 dark:border-slate-700">
              <th className="p-4 w-8"></th>
              <th className="p-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Data/Hora</th>
              <th className="p-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Depositante</th>
              <th className="p-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Transportadora</th>
              <th className="p-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Placa</th>
              <th className="p-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Doca Prevista</th>
              <th className="p-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Doca Real</th>
              <th className="p-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="p-12 text-center text-slate-400 text-sm font-medium">Nenhum agendamento encontrado.</td></tr>
            )}
            {filtered.map(rec => {
              const isSelected = rec.id === selectedId;
              const flowDef = FLOW.find(f => f.key === rec.status);
              return (
                <tr
                  key={rec.id}
                  onClick={() => setSelectedId(rec.id === selectedId ? null : rec.id)}
                  className={cn(
                    "border-t border-slate-100 dark:border-slate-800 cursor-pointer transition-all duration-150 group",
                    isSelected
                      ? "bg-secondary/5 dark:bg-primary/5 border-l-4 border-l-secondary"
                      : "hover:bg-slate-50 dark:hover:bg-slate-800/50 border-l-4 border-l-transparent"
                  )}
                >
                  <td className="p-4 text-center">
                    <div className={cn("w-2 h-2 rounded-full mx-auto", isSelected ? "bg-secondary scale-150" : "bg-transparent")} />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">{rec.agendamento}</span>
                    </div>
                  </td>
                  <td className="p-4 text-xs font-medium text-slate-600 dark:text-slate-400">{rec.depositante}</td>
                  <td className="p-4 text-xs font-bold text-slate-700 dark:text-slate-300">{rec.transportadora}</td>
                  <td className="p-4 text-center">
                    <code className="text-xs font-black text-secondary px-2.5 py-1 bg-secondary/10 rounded-xl">{rec.placa}</code>
                  </td>
                  <td className="p-4 text-center">
                    <span className="text-xs font-black text-slate-600 dark:text-slate-400">{rec.docaPrevista}</span>
                  </td>
                  <td className="p-4 text-center">
                    {rec.docaConfirmada ? (
                      <span className="text-xs font-black text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-2.5 py-0.5 rounded-lg">{rec.docaConfirmada}</span>
                    ) : (
                      <span className="text-slate-300 dark:text-slate-700 text-xs">—</span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider whitespace-nowrap", flowDef?.color)}>
                      <div className={cn("w-1.5 h-1.5 rounded-full", flowDef?.dot)} />
                      {flowDef?.label || rec.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* PAINEL DE DETALHE */}
      {selectedRecord && (
        <div className="bg-white dark:bg-slate-900 rounded-[28px] border-2 border-slate-100 dark:border-slate-800 p-6 shadow-sm animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <Truck className="w-5 h-5 text-secondary" />
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
              Veículo {selectedRecord.placa} — {selectedRecord.motorista}
            </h3>
            <div className="flex items-center gap-4 ml-auto flex-wrap">
              {/* Pipeline visual */}
              {FLOW_BUTTONS.map((btn, i) => {
                const done = FLOW_BUTTONS.slice(0, i + 1).every(b => {
                  const flowIdx = FLOW.findIndex(f => f.key === b.fromStatus);
                  const currIdx = FLOW.findIndex(f => f.key === selectedRecord.status);
                  return currIdx > flowIdx;
                });
                const active = btn.fromStatus === selectedRecord.status;
                return (
                  <React.Fragment key={btn.toStatus}>
                    <div className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all",
                      done ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800" :
                      active ? "bg-secondary text-primary border-secondary shadow-md" :
                      "bg-slate-50 text-slate-300 border-slate-200 dark:bg-slate-800 dark:text-slate-700 dark:border-slate-700"
                    )}>
                      {done ? <CheckCircle2 className="w-3 h-3" /> : <btn.icon className="w-3 h-3" />}
                      {btn.label}
                    </div>
                    {i < FLOW_BUTTONS.length - 1 && <ArrowRight className="w-3 h-3 text-slate-300 dark:text-slate-700" />}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            {[
              { label: 'Transportadora', value: selectedRecord.transportadora },
              { label: 'Depositante', value: selectedRecord.depositante },
              { label: 'Doca Prevista', value: selectedRecord.docaPrevista },
              { label: 'Doca Confirmada', value: selectedRecord.docaConfirmada || 'Aguardando...' },
            ].map(f => (
              <div key={f.label} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{f.label}</p>
                <p className="font-black text-slate-900 dark:text-white">{f.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAIS */}
      {showScheduleModal && (
        <ScheduleModal
          record={editingRecord}
          onClose={() => setShowScheduleModal(false)}
          onSave={handleSaveSchedule}
        />
      )}
      {showDockModal && selectedRecord && (
        <DockConfirmModal
          record={selectedRecord}
          onClose={() => setShowDockModal(false)}
          onConfirm={handleDockConfirm}
        />
      )}
      {showAuditModal && selectedRecord && (
        <AuditLogModal
          record={selectedRecord}
          onClose={() => setShowAuditModal(false)}
        />
      )}
    </div>
  );
}
