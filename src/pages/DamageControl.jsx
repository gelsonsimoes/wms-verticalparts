import React, { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  AlertTriangle, Scissors, Search, Plus, Pencil, Trash2,
  Link2, PackageSearch, CheckCircle2, ShieldAlert, X,
  ChevronRight, ChevronLeft, MapPin, ClipboardList,
  Lock, User, KeyRound, RefreshCw, AlertCircle,
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) { return twMerge(clsx(inputs)); }

// ─── Dados mock ───────────────────────────────────────────────────────────────
const MOCK_RECORDS = [
  {
    id: crypto.randomUUID(),
    data: '22/02/2026',
    estado: 'Truncado/Desmembrado',
    motivo: 'Placa principal retirada para venda',
    usuario: 'danilo.supervisor',
    localOrigem: 'RUA-12-A1',
    localDestino: 'SEGREGADO-01',
    status: 'Finalizado',
    lotes: [{ id: crypto.randomUUID(), sku: 'VEPEL-BPI-174FX', desc: 'Barreira de Proteção IR', qtdAfetada: 2 }],
  },
  {
    id: crypto.randomUUID(),
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
    id: crypto.randomUUID(),
    data: '21/02/2026',
    estado: 'Truncado/Desmembrado',
    motivo: 'Motor removido para venda separada',
    usuario: 'thiago.logistica',
    localOrigem: 'RUA-08-C1',
    localDestino: 'SEGREGADO-01',
    status: 'Pendente',
    lotes: [{ id: crypto.randomUUID(), sku: 'VPER-PAL-INO-1000', desc: 'Pallet de Aço Inox', qtdAfetada: 1 }],
  },
];

const MOCK_ESTOQUE = [
  { id: 'sku-1', sku: 'VEPEL-BPI-174FX',   desc: 'Barreira de Proteção Infravermelha (174 Feixes)', lote: 'LT-2026001', qtdDisp: 18 },
  { id: 'sku-2', sku: 'VPER-ESS-NY-27MM',   desc: 'Escova de Segurança (Nylon - Base 27mm)',          lote: 'LT-2026002', qtdDisp: 42 },
  { id: 'sku-3', sku: 'VPER-PAL-INO-1000',  desc: 'Pallet de Aço Inox (1000mm)',                      lote: 'LT-2026003', qtdDisp: 7  },
  { id: 'sku-4', sku: 'VP-FL1',             desc: 'Filtro de Óleo VP-FL1',                            lote: 'LT-2026004', qtdDisp: 120 },
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
  'Finalizado': 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  'Pendente':   'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
};
const ESTADO_BADGE = {
  'Danificado':           'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  'Truncado/Desmembrado': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
};

// ─── Max tentativas supervisor ────────────────────────────────────────────────
const MAX_ATTEMPTS = 3;

// ─── Modal Supervisor ─────────────────────────────────────────────────────────
// Em produção: POST /api/auth/supervisor com { usuario, senha } → JWT
function SupervisorAuthModal({ onClose, onConfirm }) {
  const [user,       setUser]       = useState('');
  const [pass,       setPass]       = useState('');
  const [error,      setError]      = useState('');
  const [loading,    setLoading]    = useState(false);
  const [tentativas, setTentativas] = useState(0);
  const bloqueado = tentativas >= MAX_ATTEMPTS;

  const handleConfirm = async () => {
    if (bloqueado) return;
    if (!user.trim() || !pass.trim()) { setError('Preencha usuário e senha.'); return; }
    setLoading(true); setError('');
    try {
      // ⚠️ INTEGRAÇÃO NECESSÁRIA: substituir pela chamada real
      // const res = await fetch('/api/auth/supervisor', {
      //   method: 'POST', body: JSON.stringify({ usuario: user, senha: pass }),
      //   headers: { 'Content-Type': 'application/json' },
      // });
      // if (!res.ok) throw new Error();
      await new Promise(r => setTimeout(r, 700)); // simulação de rede
      // Placeholder: aceita qualquer login/senha preenchida (demo)
      if (!user.trim() || pass.length < 1) throw new Error('Inválido');
      onConfirm(user.trim()); // retorna login do supervisor para log
    } catch {
      const t = tentativas + 1;
      setTentativas(t);
      setError(t >= MAX_ATTEMPTS
        ? `Limite de ${MAX_ATTEMPTS} tentativas atingido. Contate o administrador.`
        : `Credenciais inválidas. Tentativa ${t}/${MAX_ATTEMPTS}.`
      );
    } finally { setLoading(false); }
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-[32px] border-2 border-red-200 dark:border-red-900/50 shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-red-600 px-8 py-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
            <ShieldAlert className="w-7 h-7 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">Autorização Necessária</p>
            <h2 className="text-xl font-black text-white uppercase">Autenticação de Supervisor</h2>
          </div>
        </div>
        <div className="p-8 space-y-5">
          <p className="text-sm text-slate-500 font-medium leading-relaxed">
            A operação de <strong className="text-red-600">Finalizar Avaria</strong> requer autorização de supervisor.
          </p>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Usuário Supervisor</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input type="text" value={user} onChange={e => setUser(e.target.value)}
                  disabled={bloqueado || loading} placeholder="login.supervisor"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none focus:border-red-400 transition-all disabled:opacity-50" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Senha</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input type="password" value={pass} onChange={e => setPass(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !bloqueado && handleConfirm()}
                  disabled={bloqueado || loading} placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none focus:border-red-400 transition-all disabled:opacity-50" />
              </div>
            </div>
          </div>
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-2xl">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span className="text-xs font-bold text-red-600">{error}</span>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 py-3.5 rounded-2xl border-2 border-slate-200 text-sm font-black text-slate-500 hover:bg-slate-50 transition-all uppercase tracking-wider">Cancelar</button>
            <button onClick={handleConfirm} disabled={loading || bloqueado}
              className="flex-1 py-3.5 rounded-2xl bg-red-600 text-white text-sm font-black hover:opacity-90 active:scale-95 transition-all uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              {loading ? 'Validando…' : 'Autorizar'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ─── Modal de confirmação de exclusão ─────────────────────────────────────────
function DeleteModal({ record, onClose, onConfirm }) {
  return createPortal(
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 w-full max-w-sm shadow-2xl border-2 border-red-200">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 bg-red-100 rounded-2xl flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <p className="font-black text-slate-800 dark:text-white text-sm">Excluir Ocorrência?</p>
            <p className="text-[10px] text-red-600 font-bold uppercase">Esta ação não pode ser desfeita</p>
          </div>
        </div>
        <p className="text-xs text-slate-500 mb-5">
          A ocorrência de <strong>{record.estado}</strong> em <strong>{record.localOrigem}</strong> ({record.data}) será permanentemente removida.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 border-2 border-slate-200 rounded-2xl text-sm font-black text-slate-500 hover:bg-slate-50 transition-all">Cancelar</button>
          <button onClick={onConfirm} className="flex-1 py-3 bg-red-600 text-white rounded-2xl text-sm font-black hover:bg-red-700 active:scale-95 transition-all">Excluir</button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ─── Modal de Editar ──────────────────────────────────────────────────────────
function EditModal({ record, onClose, onSave }) {
  const [motivo,  setMotivo]  = useState(record.motivo);
  const [estado,  setEstado]  = useState(record.estado);
  const [origem,  setOrigem]  = useState(record.localOrigem);
  const [destino, setDestino] = useState(record.localDestino);

  const handleSave = () => {
    if (!motivo || !estado || !origem || !destino) return;
    onSave({ ...record, motivo, estado, localOrigem: origem, localDestino: destino });
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 w-full max-w-lg shadow-2xl border-2 border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-black text-slate-800 dark:text-white uppercase flex items-center gap-2"><Pencil className="w-5 h-5 text-amber-400" />Alterar Ocorrência</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-6 h-6" /></button>
        </div>
        <div className="space-y-4 mb-6">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado *</label>
            <select value={estado} onChange={e => setEstado(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-amber-400">
              <option value="Danificado">⚠️ Danificado</option>
              <option value="Truncado/Desmembrado">✂️ Truncado / Desmembrado</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Motivo *</label>
            <select value={motivo} onChange={e => setMotivo(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-amber-400">
              {MOTIVOS.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[['Local Origem *', origem, setOrigem], ['Local Destino *', destino, setDestino]].map(([l, v, s]) => (
              <div key={l} className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{l}</label>
                <input value={v} onChange={e => s(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-amber-400 transition-all" />
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 border-2 border-slate-200 rounded-2xl text-sm font-black text-slate-500 hover:bg-slate-50 transition-all">Cancelar</button>
          <button onClick={handleSave} disabled={!motivo || !estado || !origem || !destino}
            className="flex-1 py-3 bg-slate-800 text-white rounded-2xl text-sm font-black hover:bg-slate-700 active:scale-95 disabled:opacity-40 transition-all flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-400" /> Salvar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ─── Modal de Criação (2 passos) ──────────────────────────────────────────────
function CreateModal({ onClose, onSave }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ estado: '', localOrigem: '', localDestino: 'SEGREGADO-01', motivo: '', observacoes: '' });
  const [selectedLotes, setSelectedLotes] = useState({});
  const [savedRecord, setSavedRecord] = useState(null);

  const handleStep1Save = () => {
    if (!form.estado || !form.localOrigem || !form.motivo) return;
    const record = {
      id:           crypto.randomUUID(),
      data:         new Date().toLocaleDateString('pt-BR'),
      ...form,
      usuario:      'usuario.atual', // em produção: lido do contexto de autenticação
      status:       'Pendente',
      lotes:        [],
    };
    setSavedRecord(record);
    setStep(2);
  };

  const toggleLote = (sku_id) => {
    setSelectedLotes(prev => {
      const updated = { ...prev };
      if (updated[sku_id]) delete updated[sku_id];
      else updated[sku_id] = { ...MOCK_ESTOQUE.find(l => l.id === sku_id), qtdAvaria: 1 };
      return updated;
    });
  };

  const setQtd = (sku_id, val) => {
    const n = parseInt(val, 10);
    const max = MOCK_ESTOQUE.find(l => l.id === sku_id)?.qtdDisp ?? 999;
    setSelectedLotes(prev => ({ ...prev, [sku_id]: { ...prev[sku_id], qtdAvaria: Math.max(1, Math.min(max, Number.isFinite(n) ? n : 1)) } }));
  };

  const handleFinalize = () => {
    const lotesVinculados = Object.values(selectedLotes).map(l => ({ id: crypto.randomUUID(), sku: l.sku, desc: l.desc, qtdAfetada: l.qtdAvaria }));
    onSave({ ...savedRecord, lotes: lotesVinculados });
    onClose();
  };

  const isStep1Valid = form.estado && form.localOrigem && form.motivo;
  const hasLoteSelected = Object.keys(selectedLotes).length > 0;

  return createPortal(
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-[32px] border-2 border-slate-100 shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="bg-amber-400 px-8 py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-slate-900/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-slate-900" />
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-900/60 uppercase tracking-widest">Nova Ocorrência</p>
              <h2 className="text-lg font-black text-slate-900 uppercase">{step === 1 ? 'Passo 1 — Dados Básicos' : 'Passo 2 — Vincular Lotes'}</h2>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-900/50 hover:text-slate-900"><X className="w-6 h-6" /></button>
        </div>
        <div className="px-8 pt-5 shrink-0">
          <div className="flex items-center gap-3">
            {[['1','Dados Básicos'],['2','Vincular Lotes']].map(([n, label], i) => (
              <React.Fragment key={n}>
                {i > 0 && <ChevronRight className="w-4 h-4 text-slate-300" />}
                <div className={cn('flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all',
                  parseInt(step) >= parseInt(n) ? 'bg-amber-400 text-slate-900' : 'bg-slate-100 text-slate-400')}>
                  <span>{n}</span>{label}
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-8">
          {step === 1 && (
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado da Ocorrência *</label>
                <select value={form.estado} onChange={e => setForm(p => ({...p, estado: e.target.value}))}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-amber-400 transition-all appearance-none">
                  <option value="">Selecione o estado…</option>
                  <option value="Danificado">⚠️ Danificado</option>
                  <option value="Truncado/Desmembrado">✂️ Truncado / Desmembrado</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[['localOrigem','Local de Origem *','Ex: RUA-12-A1'],['localDestino','Local de Destino *','Ex: SEGREGADO-01']].map(([k,l,p]) => (
                  <div key={k} className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{l}</label>
                    <input value={form[k]} onChange={e => setForm(p2 => ({...p2,[k]:e.target.value}))} placeholder={p}
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-amber-400 transition-all" />
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Motivo da Ocorrência *</label>
                <select value={form.motivo} onChange={e => setForm(p => ({...p, motivo: e.target.value}))}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-amber-400 transition-all appearance-none">
                  <option value="">Selecione o motivo…</option>
                  {MOTIVOS.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Observações</label>
                <textarea value={form.observacoes} onChange={e => setForm(p => ({...p, observacoes: e.target.value}))} rows={3}
                  placeholder="Descreva detalhes adicionais da ocorrência…"
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl text-sm font-medium outline-none focus:border-amber-400 transition-all resize-none" />
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
                <p className="text-xs font-bold text-slate-600">
                  Estoque disponível em <strong>{savedRecord?.localOrigem}</strong>. Selecione os lotes afetados e informe a quantidade danificada.
                </p>
              </div>
              <div className="border-2 border-slate-100 rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="w-10 p-3" />
                      {['SKU / Lote','Descrição','Disp.','Qtd Avaria'].map(h => (
                        <th key={h} className="p-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_ESTOQUE.map(lote => {
                      const sel = !!selectedLotes[lote.id];
                      const qtd = selectedLotes[lote.id]?.qtdAvaria ?? 1;
                      return (
                        <tr key={lote.id} className={cn('border-t border-slate-100 transition-colors', sel && 'bg-amber-50/40')}>
                          <td className="p-3 text-center">
                            <input type="checkbox" checked={sel} aria-label={`Selecionar ${lote.sku}`}
                              onChange={() => toggleLote(lote.id)} className="w-4 h-4 accent-amber-500 rounded cursor-pointer" />
                          </td>
                          <td className="p-3">
                            <p className="font-black text-xs text-slate-900 dark:text-white">{lote.sku}</p>
                            <p className="text-[10px] text-slate-400">{lote.lote}</p>
                          </td>
                          <td className="p-3 text-xs text-slate-600 font-medium max-w-[180px]"><span className="line-clamp-2">{lote.desc}</span></td>
                          <td className="p-3 text-center"><span className="font-black text-sm text-amber-500">{lote.qtdDisp}</span></td>
                          <td className="p-3 text-center">
                            {sel ? (
                              <input type="number" min="1" max={lote.qtdDisp} value={qtd}
                                onChange={e => setQtd(lote.id, e.target.value)}
                                className="w-16 text-center px-2 py-1.5 bg-white border-2 border-amber-400 rounded-xl text-sm font-black outline-none focus:border-amber-500 transition-all" />
                            ) : <span className="text-slate-300">—</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {hasLoteSelected && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-2">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Resumo dos Lotes Selecionados</p>
                  {Object.values(selectedLotes).map(l => (
                    <div key={l.id} className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-700">{l.sku}</span>
                      <span className="font-black text-red-600">−{l.qtdAvaria} un.</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="px-8 py-5 border-t border-slate-100 flex justify-between items-center shrink-0">
          {step === 1 ? (
            <>
              <button onClick={onClose} className="px-6 py-3 rounded-2xl border-2 border-slate-200 text-sm font-black text-slate-500 hover:bg-slate-50 transition-all uppercase tracking-wider">Cancelar</button>
              <button onClick={handleStep1Save} disabled={!isStep1Valid}
                className="px-8 py-3 rounded-2xl bg-amber-400 text-slate-900 text-sm font-black hover:bg-amber-500 active:scale-95 transition-all uppercase tracking-wider flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed">
                Avançar <ChevronRight className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setStep(1)} className="px-6 py-3 rounded-2xl border-2 border-slate-200 text-sm font-black text-slate-500 hover:bg-slate-50 transition-all uppercase tracking-wider flex items-center gap-2">
                <ChevronLeft className="w-4 h-4" />Voltar
              </button>
              <button onClick={handleFinalize} disabled={!hasLoteSelected}
                className="px-8 py-3 rounded-2xl bg-amber-400 text-slate-900 text-sm font-black hover:bg-amber-500 active:scale-95 transition-all uppercase tracking-wider flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed">
                <Link2 className="w-4 h-4" />Vincular e Salvar
              </button>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function DamageControl() {
  const [records,       setRecords]       = useState(MOCK_RECORDS);
  const [selectedId,    setSelectedId]    = useState(null);
  const [statusFilter,  setStatusFilter]  = useState('Todos');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal,   setShowEditModal]   = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAuthModal,   setShowAuthModal]   = useState(false);
  const [pendingFinalize, setPendingFinalize] = useState(null);

  const selectedRecord = records.find(r => r.id === selectedId);

  const filtered = records.filter(r => statusFilter === 'Todos' || r.status === statusFilter);

  const handleSaveRecord = useCallback((record) => {
    setRecords(prev => [record, ...prev]);
    setSelectedId(record.id);
  }, []);

  const handleSaveEdit = useCallback((updated) => {
    setRecords(prev => prev.map(r => r.id === updated.id ? updated : r));
    setShowEditModal(false);
  }, []);

  const handleDelete = () => {
    setRecords(prev => prev.filter(r => r.id !== selectedId));
    setSelectedId(null);
    setShowDeleteModal(false);
  };

  const handleFinalizar = () => {
    if (!selectedId) return;
    const rec = records.find(r => r.id === selectedId);
    if (!rec || rec.status === 'Finalizado') return;
    setPendingFinalize(selectedId);
    setShowAuthModal(true);
  };

  const handleAuthConfirm = useCallback((supervisorLogin) => {
    setRecords(prev => prev.map(r =>
      r.id === pendingFinalize
        ? { ...r, status: 'Finalizado', finalizadoPor: supervisorLogin, finalizadoEm: new Date().toLocaleString('pt-BR') }
        : r
    ));
    setShowAuthModal(false);
    setPendingFinalize(null);
  }, [pendingFinalize]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 space-y-6 pb-20">

      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-[32px] border-2 border-slate-100 dark:border-slate-800 p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-3xl bg-amber-400 flex items-center justify-center shadow-lg relative">
            <AlertTriangle className="w-7 h-7 text-slate-900" />
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-slate-900 rounded-full flex items-center justify-center">
              <Scissors className="w-3 h-3 text-amber-400" />
            </div>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Gerenciamento de Qualidade</p>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase">4.6 Monitorar Avarias</h1>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Avarias e Desmembramento de Peças → Estoque Segregado</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {['Todos','Pendente','Finalizado'].map(f => (
            <button key={f} onClick={() => setStatusFilter(f)}
              className={cn('px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all',
                statusFilter === f ? 'bg-amber-400 text-slate-900 shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700')}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-100 dark:border-slate-800 px-5 py-3 flex flex-wrap items-center gap-2 shadow-sm">
        <button onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 text-slate-900 text-xs font-black uppercase tracking-wider hover:bg-amber-500 active:scale-95 transition-all shadow-md">
          <Plus className="w-4 h-4" />Cadastrar
        </button>
        <button disabled={!selectedId || selectedRecord?.status === 'Finalizado'} onClick={() => setShowEditModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-black uppercase tracking-wider hover:bg-slate-200 disabled:opacity-30 transition-all">
          <Pencil className="w-4 h-4" />Alterar
        </button>
        <button disabled={!selectedId} onClick={() => setShowDeleteModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-red-500 text-xs font-black uppercase tracking-wider hover:bg-red-50 disabled:opacity-30 transition-all">
          <Trash2 className="w-4 h-4" />Excluir
        </button>
        <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />
        <button disabled={!selectedId || selectedRecord?.status === 'Finalizado'} onClick={handleFinalizar}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 text-white text-xs font-black uppercase tracking-wider hover:opacity-90 active:scale-95 disabled:opacity-30 transition-all shadow-md shadow-red-600/20">
          <ShieldAlert className="w-4 h-4" />Finalizar
        </button>
        <div className="flex-1" />
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{filtered.length} registro(s)</span>
      </div>

      {/* Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-[28px] border-2 border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800 border-b-2 border-slate-100 dark:border-slate-700">
              {['','Data','Estado','Motivo','Usuário','Origem','Destino','Lotes','Status'].map((h, i) => (
                <th key={i} className="p-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={9} className="p-12 text-center text-slate-400 text-sm font-medium">Nenhuma ocorrência encontrada.</td></tr>
            )}
            {filtered.map(rec => {
              const isSel = rec.id === selectedId;
              return (
                <tr key={rec.id} onClick={() => setSelectedId(rec.id === selectedId ? null : rec.id)}
                  className={cn('border-t border-slate-100 dark:border-slate-800 cursor-pointer transition-all group',
                    isSel ? 'bg-amber-50/40 border-l-4 border-l-amber-400' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border-l-4 border-l-transparent')}>
                  <td className="p-4 text-center">
                    <div className={cn('w-2 h-2 rounded-full mx-auto transition-all', isSel ? 'bg-amber-400 scale-150' : 'bg-transparent')} />
                  </td>
                  <td className="p-4 text-xs font-bold text-slate-600 dark:text-slate-400 whitespace-nowrap">{rec.data}</td>
                  <td className="p-4">
                    <span className={cn('px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider whitespace-nowrap', ESTADO_BADGE[rec.estado])}>
                      {rec.estado === 'Danificado' ? '⚠️' : '✂️'} {rec.estado}
                    </span>
                  </td>
                  <td className="p-4 text-xs font-medium text-slate-600 dark:text-slate-400 max-w-[200px]">
                    <span className="line-clamp-2">{rec.motivo}</span>
                  </td>
                  <td className="p-4 text-xs font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">{rec.usuario}</td>
                  <td className="p-4">
                    <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-600">
                      <MapPin className="w-3 h-3 shrink-0" />{rec.localOrigem}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="flex items-center gap-1.5 text-[10px] font-black text-red-500">
                      <MapPin className="w-3 h-3 shrink-0" />{rec.localDestino}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="text-xs font-black text-slate-500">{rec.lotes.length}</span>
                  </td>
                  <td className="p-4 text-center">
                    <span className={cn('px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider', STATUS_BADGE[rec.status])}>
                      {rec.status === 'Finalizado' ? '✅' : '⏳'} {rec.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Painel de detalhe */}
      {selectedRecord && (
        <div className="bg-white dark:bg-slate-900 rounded-[28px] border-2 border-slate-100 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <ClipboardList className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase">
              Lotes Vinculados — Ocorrência {selectedRecord.data}
            </h3>
            <span className={cn('ml-auto px-3 py-1 rounded-full text-[10px] font-black', STATUS_BADGE[selectedRecord.status])}>
              {selectedRecord.status}
            </span>
          </div>
          {selectedRecord.finalizadoPor && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
              <p className="text-[10px] font-bold text-green-700">
                Finalizado por <strong>{selectedRecord.finalizadoPor}</strong> em {selectedRecord.finalizadoEm}
              </p>
            </div>
          )}
          {selectedRecord.lotes.length === 0 ? (
            <p className="text-sm text-slate-400 font-medium">Nenhum lote vinculado. Clique em "Cadastrar" para associar um novo lote.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {selectedRecord.lotes.map(l => (
                <div key={l.id} className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                  <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900 dark:text-white">{l.sku}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{l.desc}</p>
                    <p className="text-[10px] font-black text-red-600 mt-1">Afetados: {l.qtdAfetada} un.</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showCreateModal && <CreateModal onClose={() => setShowCreateModal(false)} onSave={handleSaveRecord} />}
      {showEditModal   && selectedRecord && <EditModal record={selectedRecord} onClose={() => setShowEditModal(false)} onSave={handleSaveEdit} />}
      {showDeleteModal && selectedRecord && <DeleteModal record={selectedRecord} onClose={() => setShowDeleteModal(false)} onConfirm={handleDelete} />}
      {showAuthModal   && <SupervisorAuthModal onClose={() => { setShowAuthModal(false); setPendingFinalize(null); }} onConfirm={handleAuthConfirm} />}
    </div>
  );
}
