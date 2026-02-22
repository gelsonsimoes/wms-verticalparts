import React, { useState } from 'react';
import {
  AlertTriangle,
  Scissors,
  Search,
  Plus,
  Pencil,
  Trash2,
  Link2,
  PackageSearch,
  CheckCircle2,
  ShieldAlert,
  X,
  ChevronRight,
  ChevronLeft,
  MapPin,
  ClipboardList,
  Filter,
  Eye,
  Lock,
  User,
  KeyRound,
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// ===== DADOS MOCK =====
const MOCK_RECORDS = [
  {
    id: 1,
    data: '22/02/2026',
    estado: 'Truncado/Desmembrado',
    motivo: 'Placa principal retirada para venda',
    usuario: 'danilo.supervisor',
    localOrigem: 'RUA-12-A1',
    localDestino: 'SEGREGADO-01',
    status: 'Finalizado',
    lotes: [{ sku: 'VEPEL-BPI-174FX', desc: 'Barreira de Proteção IR', qtdAfetada: 2 }],
  },
  {
    id: 2,
    data: '22/02/2026',
    estado: 'Danificado',
    motivo: 'Avaria estrutural em transporte',
    usuario: 'matheus.expedicao',
    localOrigem: 'RUA-05-B3',
    localDestino: 'SEGREGADO-02',
    status: 'Pendente',
    lotes: [],
  },
  {
    id: 3,
    data: '21/02/2026',
    estado: 'Truncado/Desmembrado',
    motivo: 'Motor removido para venda separada',
    usuario: 'thiago.logistica',
    localOrigem: 'RUA-08-C1',
    localDestino: 'SEGREGADO-01',
    status: 'Pendente',
    lotes: [{ sku: 'VPER-PAL-INO-1000', desc: 'Pallet de Aço Inox', qtdAfetada: 1 }],
  },
];

const MOCK_ESTOQUE = [
  { id: 1, sku: 'VEPEL-BPI-174FX', desc: 'Barreira de Proteção Infravermelha (174 Feixes)', lote: 'LT-2026001', qtdDisp: 18, local: 'RUA-12-A1' },
  { id: 2, sku: 'VPER-ESS-NY-27MM', desc: 'Escova de Segurança (Nylon - Base 27mm)', lote: 'LT-2026002', qtdDisp: 42, local: 'RUA-12-A2' },
  { id: 3, sku: 'VPER-PAL-INO-1000', desc: 'Pallet de Aço Inox (1000mm)', lote: 'LT-2026003', qtdDisp: 7, local: 'RUA-12-A1' },
  { id: 4, sku: 'VP-FL1', desc: 'Filtro de Óleo VP-FL1', lote: 'LT-2026004', qtdDisp: 120, local: 'RUA-12-A1' },
];

const MOTIVOS = [
  'Placa principal retirada para venda',
  'Motor removido para venda separada',
  'Avaria estrutural em transporte',
  'Amassado/deformação física',
  'Componente eletrônico queimado',
  'Desmontagem parcial para peças',
  'Avaria por manuseio indevido',
  'Outro motivo',
];

const STATUS_BADGE = {
  'Finalizado': 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  'Pendente': 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
};

const ESTADO_BADGE = {
  'Danificado': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  'Truncado/Desmembrado': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
};

// ===== MODAL DE AUTENTICAÇÃO DE SUPERVISOR =====
function SupervisorAuthModal({ onClose, onConfirm }) {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConfirm = () => {
    if (!user || !pass) {
      setError('Preencha usuário e senha.');
      return;
    }
    setLoading(true);
    setError('');
    // Simula validação
    setTimeout(() => {
      if (user === 'danilo.supervisor' && pass === '1234') {
        setLoading(false);
        onConfirm();
      } else {
        setLoading(false);
        setError('Credenciais de supervisor inválidas. Acesso negado.');
      }
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-[32px] border-2 border-red-200 dark:border-red-900/50 shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header vermelho de alerta */}
        <div className="bg-danger px-8 py-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
            <ShieldAlert className="w-7 h-7 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">Autorização Necessária</p>
            <h2 className="text-xl font-black text-white uppercase tracking-tight">Autenticação de Supervisor</h2>
          </div>
        </div>

        <div className="p-8 space-y-5">
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
            A operação de <strong className="text-danger">Finalizar Avaria</strong> requer autorização de um supervisor. 
            Informe as credenciais para confirmar a movimentação de estoque.
          </p>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Usuário Supervisor</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={user}
                  onChange={e => setUser(e.target.value)}
                  placeholder="danilo.supervisor"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none focus:border-danger transition-all"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Senha</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={pass}
                  onChange={e => setPass(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleConfirm()}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none focus:border-danger transition-all"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl">
              <AlertTriangle className="w-4 h-4 text-danger shrink-0" />
              <span className="text-xs font-bold text-danger">{error}</span>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-3.5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 text-sm font-black text-slate-500 hover:bg-slate-50 transition-all uppercase tracking-wider"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="flex-1 py-3.5 rounded-2xl bg-danger text-white text-sm font-black hover:opacity-90 active:scale-95 transition-all uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <Lock className="w-4 h-4 animate-pulse" />
              ) : (
                <ShieldAlert className="w-4 h-4" />
              )}
              {loading ? 'Validando...' : 'Autorizar'}
            </button>
          </div>
          <p className="text-center text-[10px] text-slate-400 font-medium">
            💡 Dica de demonstração: usuário <strong>danilo.supervisor</strong> senha <strong>1234</strong>
          </p>
        </div>
      </div>
    </div>
  );
}

// ===== MODAL DE CRIAÇÃO (2 PASSOS) =====
function CreateModal({ onClose, onSave }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    estado: '',
    localOrigem: '',
    localDestino: 'SEGREGADO-01',
    motivo: '',
    observacoes: '',
  });
  const [selectedLotes, setSelectedLotes] = useState({});
  const [savedRecord, setSavedRecord] = useState(null);

  const handleStep1Save = () => {
    if (!form.estado || !form.localOrigem || !form.motivo) return;
    const record = {
      id: Date.now(),
      data: new Date().toLocaleDateString('pt-BR'),
      ...form,
      usuario: 'danilo.supervisor',
      status: 'Pendente',
      lotes: [],
    };
    setSavedRecord(record);
    setStep(2);
  };

  const toggleLote = (id) => {
    setSelectedLotes(prev => {
      const updated = { ...prev };
      if (updated[id]) {
        delete updated[id];
      } else {
        updated[id] = { ...MOCK_ESTOQUE.find(l => l.id === id), qtdAvaria: 1 };
      }
      return updated;
    });
  };

  const setQtd = (id, val) => {
    setSelectedLotes(prev => ({
      ...prev,
      [id]: { ...prev[id], qtdAvaria: Math.max(1, parseInt(val) || 1) },
    }));
  };

  const handleFinalize = () => {
    const lotesVinculados = Object.values(selectedLotes).map(l => ({
      sku: l.sku,
      desc: l.desc,
      qtdAfetada: l.qtdAvaria,
    }));
    onSave({ ...savedRecord, lotes: lotesVinculados, status: 'Pendente' });
    onClose();
  };

  const isStep1Valid = form.estado && form.localOrigem && form.motivo;
  const hasLoteSelected = Object.keys(selectedLotes).length > 0;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-[32px] border-2 border-slate-100 dark:border-slate-800 shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-secondary px-8 py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-[9px] font-black text-primary/60 uppercase tracking-widest">Nova Ocorrência</p>
              <h2 className="text-lg font-black text-primary uppercase tracking-tight">
                {step === 1 ? 'Passo 1 — Dados Básicos' : 'Passo 2 — Vincular Lotes'}
              </h2>
            </div>
          </div>
          <button onClick={onClose} className="text-primary/50 hover:text-primary transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress */}
        <div className="px-8 pt-5 shrink-0">
          <div className="flex items-center gap-3">
            <div className={cn("flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all", step >= 1 ? "bg-secondary text-primary" : "bg-slate-100 text-slate-400")}>
              <span>1</span> Dados Básicos
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
            <div className={cn("flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all", step >= 2 ? "bg-secondary text-primary" : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500")}>
              <span>2</span> Vincular Lotes
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-8">
          {step === 1 && (
            <div className="space-y-5">
              {/* Estado */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado da Ocorrência *</label>
                <select
                  value={form.estado}
                  onChange={e => setForm(p => ({ ...p, estado: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-300 outline-none focus:border-secondary transition-all"
                >
                  <option value="">Selecione o estado...</option>
                  <option value="Danificado">⚠️ Danificado</option>
                  <option value="Truncado/Desmembrado">✂️ Truncado / Desmembrado</option>
                </select>
              </div>

              {/* Locais */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Local de Origem *</label>
                  <div className="relative">
                    <input
                      value={form.localOrigem}
                      onChange={e => setForm(p => ({ ...p, localOrigem: e.target.value }))}
                      placeholder="Ex: RUA-12-A1"
                      className="w-full pl-4 pr-10 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none focus:border-secondary transition-all"
                    />
                    <button className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-secondary transition-colors">
                      <Search className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Local de Destino *</label>
                  <div className="relative">
                    <input
                      value={form.localDestino}
                      onChange={e => setForm(p => ({ ...p, localDestino: e.target.value }))}
                      placeholder="Ex: SEGREGADO-01"
                      className="w-full pl-4 pr-10 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none focus:border-secondary transition-all"
                    />
                    <button className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-secondary transition-colors">
                      <Search className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Motivo */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Motivo da Ocorrência *</label>
                <select
                  value={form.motivo}
                  onChange={e => setForm(p => ({ ...p, motivo: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-300 outline-none focus:border-secondary transition-all"
                >
                  <option value="">Selecione o motivo...</option>
                  {MOTIVOS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              {/* Observações */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Observações</label>
                <textarea
                  value={form.observacoes}
                  onChange={e => setForm(p => ({ ...p, observacoes: e.target.value }))}
                  rows={3}
                  placeholder="Descreva detalhes adicionais da ocorrência..."
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium outline-none focus:border-secondary transition-all resize-none"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-secondary/5 border border-secondary/10 rounded-2xl">
                <MapPin className="w-4 h-4 text-secondary shrink-0" />
                <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                  Exibindo estoque disponível em <strong>{savedRecord?.localOrigem}</strong>. Selecione os lotes afetados e informe a quantidade.
                </p>
              </div>

              <div className="border-2 border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800">
                      <th className="w-10 p-3"></th>
                      <th className="p-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">SKU / Lote</th>
                      <th className="p-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Descrição</th>
                      <th className="p-3 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Disp.</th>
                      <th className="p-3 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Qtd Avaria</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_ESTOQUE.map((lote) => {
                      const selected = !!selectedLotes[lote.id];
                      return (
                        <tr key={lote.id} className={cn("border-t border-slate-100 dark:border-slate-800 transition-colors", selected && "bg-primary/5 dark:bg-primary/5")}>
                          <td className="p-3 text-center">
                            <input
                              type="checkbox"
                              checked={selected}
                              onChange={() => toggleLote(lote.id)}
                              className="w-4 h-4 accent-secondary rounded cursor-pointer"
                            />
                          </td>
                          <td className="p-3">
                            <p className="font-black text-xs text-slate-900 dark:text-white">{lote.sku}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{lote.lote}</p>
                          </td>
                          <td className="p-3 text-xs text-slate-600 dark:text-slate-400 font-medium max-w-[180px]">
                            <span className="line-clamp-2">{lote.desc}</span>
                          </td>
                          <td className="p-3 text-center">
                            <span className="font-black text-sm text-secondary">{lote.qtdDisp}</span>
                          </td>
                          <td className="p-3 text-center">
                            {selected ? (
                              <input
                                type="number"
                                min="1"
                                max={lote.qtdDisp}
                                value={selectedLotes[lote.id]?.qtdAvaria || 1}
                                onChange={e => setQtd(lote.id, e.target.value)}
                                className="w-16 text-center px-2 py-1.5 bg-white dark:bg-slate-900 border-2 border-secondary rounded-xl text-sm font-black outline-none focus:border-primary transition-all"
                              />
                            ) : (
                              <span className="text-slate-300 dark:text-slate-700">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {hasLoteSelected && (
                <div className="p-4 bg-secondary/5 border border-secondary/10 rounded-2xl space-y-2">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Resumo dos Lotes Selecionados</p>
                  {Object.values(selectedLotes).map(l => (
                    <div key={l.id} className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-700 dark:text-slate-300">{l.sku}</span>
                      <span className="font-black text-danger">−{l.qtdAvaria} un.</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
          {step === 1 ? (
            <>
              <button onClick={onClose} className="px-6 py-3 rounded-2xl border-2 border-slate-200 dark:border-slate-700 text-sm font-black text-slate-500 hover:bg-slate-50 transition-all uppercase tracking-wider">
                Cancelar
              </button>
              <button
                onClick={handleStep1Save}
                disabled={!isStep1Valid}
                className="px-8 py-3 rounded-2xl bg-secondary text-primary text-sm font-black hover:opacity-90 active:scale-95 transition-all uppercase tracking-wider flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Avançar <ChevronRight className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setStep(1)} className="px-6 py-3 rounded-2xl border-2 border-slate-200 dark:border-slate-700 text-sm font-black text-slate-500 hover:bg-slate-50 transition-all uppercase tracking-wider flex items-center gap-2">
                <ChevronLeft className="w-4 h-4" /> Voltar
              </button>
              <button
                onClick={handleFinalize}
                disabled={!hasLoteSelected}
                className="px-8 py-3 rounded-2xl bg-secondary text-primary text-sm font-black hover:opacity-90 active:scale-95 transition-all uppercase tracking-wider flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Link2 className="w-4 h-4" /> Vincular e Salvar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ===== COMPONENTE PRINCIPAL =====
export default function DamageControl() {
  const [records, setRecords] = useState(MOCK_RECORDS);
  const [selectedId, setSelectedId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showLotesModal, setShowLotesModal] = useState(false);
  const [pendingFinalize, setPendingFinalize] = useState(null);

  const selectedRecord = records.find(r => r.id === selectedId);

  const filtered = records.filter(r =>
    statusFilter === 'Todos' ? true : r.status === statusFilter
  );

  const handleSaveRecord = (record) => {
    setRecords(prev => [record, ...prev]);
    setSelectedId(record.id);
  };

  const handleDelete = () => {
    if (!selectedId) return;
    setRecords(prev => prev.filter(r => r.id !== selectedId));
    setSelectedId(null);
  };

  const handleFinalizar = () => {
    if (!selectedId) return;
    const rec = records.find(r => r.id === selectedId);
    if (!rec || rec.status === 'Finalizado') return;
    setPendingFinalize(selectedId);
    setShowAuthModal(true);
  };

  const handleAuthConfirm = () => {
    setRecords(prev => prev.map(r => r.id === pendingFinalize ? { ...r, status: 'Finalizado' } : r));
    setShowAuthModal(false);
    setPendingFinalize(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 space-y-6 animate-in fade-in duration-700">

      {/* HEADER */}
      <div className="bg-white dark:bg-slate-900 rounded-[32px] border-2 border-slate-100 dark:border-slate-800 p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-3xl bg-secondary flex items-center justify-center shadow-lg shadow-black/20 relative">
            <AlertTriangle className="w-7 h-7 text-primary" />
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
              <Scissors className="w-3 h-3 text-secondary" />
            </div>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Gerenciamento de Qualidade</p>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              Controle de Avarias
            </h1>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Avarias e Desmembramento de Peças → Estoque Segregado</p>
          </div>
        </div>

        {/* Filtros de status */}
        <div className="flex items-center gap-2">
          {['Todos', 'Pendente', 'Finalizado'].map(f => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={cn(
                "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                statusFilter === f
                  ? "bg-secondary text-primary shadow-lg"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-100 dark:border-slate-800 px-5 py-3 flex flex-wrap items-center gap-2 shadow-sm">
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary text-primary text-xs font-black uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all shadow-md"
        >
          <Plus className="w-4 h-4" /> Cadastrar
        </button>
        <button
          disabled={!selectedId}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-black uppercase tracking-wider hover:bg-slate-200 disabled:opacity-30 transition-all"
        >
          <Pencil className="w-4 h-4" /> Alterar
        </button>
        <button
          disabled={!selectedId}
          onClick={handleDelete}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-danger text-xs font-black uppercase tracking-wider hover:bg-red-50 disabled:opacity-30 transition-all"
        >
          <Trash2 className="w-4 h-4" /> Excluir
        </button>

        <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />

        <button
          disabled={!selectedId}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-black uppercase tracking-wider hover:bg-slate-200 disabled:opacity-30 transition-all"
        >
          <Link2 className="w-4 h-4" /> Vincular Lotes
        </button>
        <button
          disabled={!selectedId}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-black uppercase tracking-wider hover:bg-slate-200 disabled:opacity-30 transition-all"
        >
          <PackageSearch className="w-4 h-4" /> Lotes Gerados
        </button>

        <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />

        <button
          disabled={!selectedId || selectedRecord?.status === 'Finalizado'}
          onClick={handleFinalizar}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-danger text-white text-xs font-black uppercase tracking-wider hover:opacity-90 active:scale-95 disabled:opacity-30 transition-all shadow-md shadow-danger/20"
        >
          <ShieldAlert className="w-4 h-4" /> Finalizar
        </button>

        <div className="flex-1" />
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{filtered.length} registros</span>
      </div>

      {/* GRID PRINCIPAL */}
      <div className="bg-white dark:bg-slate-900 rounded-[28px] border-2 border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800 border-b-2 border-slate-100 dark:border-slate-700">
              <th className="p-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest w-8"></th>
              <th className="p-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Data</th>
              <th className="p-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</th>
              <th className="p-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Motivo</th>
              <th className="p-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Usuário</th>
              <th className="p-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Origem</th>
              <th className="p-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Destino</th>
              <th className="p-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Lotes</th>
              <th className="p-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="p-12 text-center text-slate-400 text-sm font-medium">
                  Nenhuma ocorrência encontrada.
                </td>
              </tr>
            )}
            {filtered.map((rec) => {
              const isSelected = rec.id === selectedId;
              return (
                <tr
                  key={rec.id}
                  onClick={() => setSelectedId(rec.id === selectedId ? null : rec.id)}
                  className={cn(
                    "border-t border-slate-100 dark:border-slate-800 cursor-pointer transition-all duration-150",
                    isSelected
                      ? "bg-secondary/5 dark:bg-primary/5 border-l-4 border-l-secondary"
                      : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  )}
                >
                  <td className="p-4 text-center">
                    <div className={cn("w-2 h-2 rounded-full mx-auto transition-all", isSelected ? "bg-secondary scale-150" : "bg-transparent")} />
                  </td>
                  <td className="p-4 text-xs font-bold text-slate-600 dark:text-slate-400 whitespace-nowrap">{rec.data}</td>
                  <td className="p-4">
                    <span className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider whitespace-nowrap", ESTADO_BADGE[rec.estado])}>
                      {rec.estado === 'Danificado' ? '⚠️' : '✂️'} {rec.estado}
                    </span>
                  </td>
                  <td className="p-4 text-xs font-medium text-slate-600 dark:text-slate-400 max-w-[200px]">
                    <span className="line-clamp-2">{rec.motivo}</span>
                  </td>
                  <td className="p-4 text-xs font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">{rec.usuario}</td>
                  <td className="p-4">
                    <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-600 dark:text-slate-400">
                      <MapPin className="w-3 h-3 shrink-0" />{rec.localOrigem}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="flex items-center gap-1.5 text-[10px] font-black text-danger">
                      <MapPin className="w-3 h-3 shrink-0" />{rec.localDestino}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="text-xs font-black text-slate-500">{rec.lotes.length}</span>
                  </td>
                  <td className="p-4 text-center">
                    <span className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider", STATUS_BADGE[rec.status])}>
                      {rec.status === 'Finalizado' ? '✅' : '⏳'} {rec.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* PAINEL DE DETALHE DO REGISTRO SELECIONADO */}
      {selectedRecord && (
        <div className="bg-white dark:bg-slate-900 rounded-[28px] border-2 border-slate-100 dark:border-slate-800 p-6 shadow-sm animate-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center gap-3 mb-5">
            <ClipboardList className="w-5 h-5 text-secondary" />
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
              Lotes Vinculados — Ocorrência #{selectedRecord.id}
            </h3>
            <span className={cn("ml-auto px-3 py-1 rounded-full text-[10px] font-black", STATUS_BADGE[selectedRecord.status])}>
              {selectedRecord.status}
            </span>
          </div>

          {selectedRecord.lotes.length === 0 ? (
            <p className="text-sm text-slate-400 font-medium">Nenhum lote vinculado ainda. Use "Vincular Lotes" para adicionar.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {selectedRecord.lotes.map((l, i) => (
                <div key={i} className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                  <div className="w-8 h-8 rounded-xl bg-danger/10 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-4 h-4 text-danger" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900 dark:text-white">{l.sku}</p>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">{l.desc}</p>
                    <p className="text-[10px] font-black text-danger mt-1">Afetados: {l.qtdAfetada} un.</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAIS */}
      {showCreateModal && (
        <CreateModal
          onClose={() => setShowCreateModal(false)}
          onSave={handleSaveRecord}
        />
      )}

      {showAuthModal && (
        <SupervisorAuthModal
          onClose={() => { setShowAuthModal(false); setPendingFinalize(null); }}
          onConfirm={handleAuthConfirm}
        />
      )}
    </div>
  );
}
