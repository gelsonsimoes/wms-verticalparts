import React, { useState, useEffect, useRef } from 'react';
import {
  Truck,
  Scale,
  RefreshCcw,
  Save,
  X,
  History,
  ChevronDown,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  User,
  KeyRound,
  FileText,
  Zap,
  ArrowRight,
  Radio,
  AlertCircle,
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { supabase } from '../lib/supabaseClient';
import { useApp } from '../hooks/useApp';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// ─── Toast Component ───────────────────────────────────────────
function Toast({ toast, onClose }) {
  if (!toast) return null;
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-4 duration-300" role="status">
      <div className={cn(
        "flex items-center gap-3 px-6 py-4 rounded-full shadow-2xl text-white",
        toast.type === 'success' ? 'bg-green-600' :
        toast.type === 'error'   ? 'bg-red-600' :
        'bg-blue-600'
      )}>
        {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" aria-hidden="true" /> : <AlertCircle className="w-5 h-5 shrink-0" aria-hidden="true" />}
        <p className="text-sm font-bold">{toast.message}</p>
        <button onClick={onClose} className="ml-2 p-1 hover:bg-black/10 rounded-full transition-colors" aria-label="Fechar notificação">
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

// ===== CONSTANTES =====
const DIVERGENCE_TOLERANCE = 500; // kg
const SCALES = ['Balança Rodoviária Primária — Toledo 60T', 'Balança Rodoviária Secundária — Toledo 30T', 'Plataforma de Eixo — Doca 01'];

const SEED_VEHICLES = [
  { placa: 'ABC-1D23', transportadora: 'TBM Logística',    tipo: 'Recebimento', pesoNota: 28500 },
  { placa: 'DEF-4E56', transportadora: 'Rápido São Paulo', tipo: 'Expedição',   pesoNota: 14200 },
  { placa: 'GHI-7F89', transportadora: 'VPC Express',      tipo: 'Recebimento', pesoNota: 33000 },
];

// ===== MODAL SUPERVISOR =====
function SupervisorModal({ pesoNota, pesoBruto, onClose, onConfirm }) {
  const [user, setUser]       = useState('');
  const [pass, setPass]       = useState('');
  const [motivo, setMotivo]   = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const supervisorTimeoutRef  = useRef(null);

  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', fn);
    return () => {
      document.removeEventListener('keydown', fn);
      if (supervisorTimeoutRef.current) clearTimeout(supervisorTimeoutRef.current);
    };
  }, [onClose]);

  const handleConfirm = () => {
    if (!user || !pass || !motivo.trim()) {
      setError('Preencha todos os campos obrigatórios.');
      return;
    }
    setLoading(true);
    setError('');
    supervisorTimeoutRef.current = setTimeout(() => {
      if (user === 'danilo.supervisor' && pass === '1234') {
        setLoading(false);
        onConfirm(motivo);
      } else {
        setLoading(false);
        setError('Credenciais de supervisor inválidas. Acesso negado.');
      }
    }, 900);
  };

  const diffKg  = Math.abs(pesoBruto - pesoNota).toFixed(0);
  const diffPct = pesoNota > 0 ? ((Math.abs(pesoBruto - pesoNota) / pesoNota) * 100).toFixed(1) : '—';

  return (
    <div className="fixed inset-0 bg-black/85 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="supervisor-modal-title"
        className="bg-slate-950 rounded-[32px] border-2 border-red-900/60 shadow-2xl w-full max-w-lg overflow-hidden"
      >
        <div className="bg-danger px-8 py-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center" aria-hidden="true">
            <ShieldAlert className="w-7 h-7 text-white" />
          </div>
          <div>
            <p className="text-[9px] font-black text-white/60 uppercase tracking-widest">Divergência Detectada</p>
            <h2 id="supervisor-modal-title" className="text-xl font-black text-white uppercase tracking-tight">Autorização de Supervisor</h2>
          </div>
        </div>

        <div className="p-8 space-y-5 bg-slate-950">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Peso da Nota (Kg)', value: pesoNota.toLocaleString('pt-BR'), color: 'text-slate-300' },
              { label: 'Peso Capturado (Kg)', value: pesoBruto.toLocaleString('pt-BR'), color: 'text-primary' },
              { label: 'Divergência', value: `${diffKg} Kg (${diffPct}%)`, color: 'text-danger' },
            ].map(f => (
              <div key={f.label} className="bg-slate-900 rounded-2xl p-3 text-center border border-slate-800">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{f.label}</p>
                <p className={cn("text-base font-black tabular-nums", f.color)}>{f.value}</p>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="sup-user" className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Usuário Supervisor *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-600 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                  <input
                    id="sup-user"
                    value={user} onChange={e => setUser(e.target.value)}
                    placeholder="danilo.supervisor"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border-2 border-slate-800 rounded-xl text-xs font-bold text-slate-200 outline-none focus:border-danger transition-all"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="sup-pass" className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Senha *</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-600 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                  <input
                    id="sup-pass"
                    type="password" value={pass} onChange={e => setPass(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleConfirm()}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border-2 border-slate-800 rounded-xl text-xs font-bold text-slate-200 outline-none focus:border-danger transition-all"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="sup-motivo" className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Motivo da Liberação *</label>
              <textarea
                id="sup-motivo"
                value={motivo} onChange={e => setMotivo(e.target.value)} rows={3}
                placeholder="Descreva o motivo da liberação da divergência de peso..."
                className="w-full px-4 py-3 bg-slate-900 border-2 border-slate-800 rounded-xl text-xs font-medium text-slate-200 outline-none focus:border-danger transition-all resize-none"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-950 border border-red-800 rounded-2xl" role="alert">
              <AlertTriangle className="w-4 h-4 text-danger shrink-0" aria-hidden="true" />
              <span className="text-xs font-bold text-danger">{error}</span>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-3.5 rounded-2xl border-2 border-slate-800 text-sm font-black text-slate-500 hover:bg-slate-900 transition-all uppercase tracking-wider">
              Cancelar
            </button>
            <button onClick={handleConfirm} disabled={loading}
              className="flex-1 py-3.5 rounded-2xl bg-danger text-white text-sm font-black hover:opacity-90 active:scale-95 transition-all uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <ShieldAlert className="w-4 h-4 animate-pulse" aria-hidden="true" /> : <ShieldAlert className="w-4 h-4" aria-hidden="true" />}
              {loading ? 'Validando...' : 'Liberar com Divergência'}
            </button>
          </div>
          <p className="text-center text-[10px] text-slate-600 font-medium">
            Demo: usuário <strong className="text-slate-500">danilo.supervisor</strong> senha <strong className="text-slate-500">1234</strong>
          </p>
        </div>
      </div>
    </div>
  );
}

// ===== MODAL HISTÓRICO =====
function HistoryModal({ onClose, warehouseId }) {
  const [history, setHistory]   = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, [onClose]);

  useEffect(() => {
    if (!warehouseId) { setLoading(false); return; }
    supabase
      .from('pesagens')
      .select('*')
      .eq('warehouse_id', warehouseId)
      .order('created_at', { ascending: false })
      .limit(30)
      .then(({ data }) => {
        setHistory(data || []);
        setLoading(false);
      });
  }, [warehouseId]);

  const formatDateTime = (ts) => {
    if (!ts) return '—';
    const d = new Date(ts);
    return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="history-modal-title"
        className="bg-slate-950 rounded-[28px] border-2 border-slate-800 shadow-2xl w-full max-w-2xl overflow-hidden"
      >
        <div className="bg-secondary px-7 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <History className="w-6 h-6 text-primary" aria-hidden="true" />
            <div>
              <p className="text-[9px] font-black text-primary/60 uppercase tracking-widest">Balança Rodoviária</p>
              <h2 id="history-modal-title" className="text-base font-black text-primary uppercase">Histórico de Pesagens</h2>
            </div>
          </div>
          <button onClick={onClose} aria-label="Fechar histórico de pesagens" className="text-primary/50 hover:text-primary">
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
        <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-slate-500 text-sm font-bold">Carregando...</div>
          ) : history.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm font-bold">Nenhuma pesagem registrada ainda.</div>
          ) : (
            <table className="w-full text-sm">
              <thead><tr className="bg-slate-900 border-b border-slate-800">
                {['Data/Hora', 'SKU / Placa', 'Op.', 'Balança', 'Peso (Kg)', 'Status'].map(h => (
                  <th key={h} scope="col" className="p-4 text-left text-[9px] font-black text-slate-500 uppercase tracking-widest">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {history.map(r => (
                  <tr key={r.id} className="border-t border-slate-800 hover:bg-slate-900/50 transition-colors">
                    <td className="p-4 text-[10px] font-bold text-slate-400 whitespace-nowrap">{formatDateTime(r.created_at)}</td>
                    <td className="p-4"><code className="text-xs font-black text-primary px-2 py-0.5 bg-primary/10 rounded-lg">{r.sku}</code></td>
                    <td className="p-4 text-[10px] font-bold text-slate-400">{r.modo}</td>
                    <td className="p-4 text-[10px] font-bold text-slate-400 truncate max-w-[120px]">{r.balanca || '—'}</td>
                    <td className="p-4 text-xs font-black text-primary tabular-nums">{Number(r.peso_capturado).toLocaleString('pt-BR')}</td>
                    <td className="p-4">
                      <span className={cn("px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider",
                        r.validado ? 'bg-green-900/40 text-green-400' : 'bg-amber-900/40 text-amber-400'
                      )}>{r.validado ? 'Aprovado' : 'Com Divergência'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="p-5 border-t border-slate-800">
          <button onClick={onClose} className="w-full py-3 rounded-2xl border-2 border-slate-800 text-sm font-black text-slate-500 hover:bg-slate-900 transition-all uppercase tracking-wider">Fechar</button>
        </div>
      </div>
    </div>
  );
}

// ===== COMPONENTE PRINCIPAL =====
export default function RoadWeighingStation() {
  const { warehouseId } = useApp();
  const [selectedVehicle, setSelectedVehicle]       = useState(SEED_VEHICLES[0]);
  const [activeScale, setActiveScale]               = useState(SCALES[0]);
  const [showScaleDropdown, setShowScaleDropdown]   = useState(false);
  const [showVehicleDropdown, setShowVehicleDropdown] = useState(false);
  const [tara, setTara]                             = useState(null);
  const [currentWeight, setCurrentWeight]           = useState(8420);
  const [isCapturing, setIsCapturing]               = useState(false);
  const [bruto, setBruto]                           = useState(null);
  const [showSupervisorModal, setShowSupervisorModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal]     = useState(false);
  const [liberado, setLiberado]                     = useState(false);
  const [saved, setSaved]                           = useState(false);
  const [saving, setSaving]                         = useState(false);

  // Toast
  const [toast, setToast]  = useState(null);
  const toastRef = useRef(null);
  const showToast = (message, type = 'success') => {
    if (toastRef.current) clearTimeout(toastRef.current);
    setToast({ message, type });
    toastRef.current = setTimeout(() => setToast(null), 4000);
  };

  const captureTimeoutRef = useRef(null);

  useEffect(() => () => {
    if (captureTimeoutRef.current) clearTimeout(captureTimeoutRef.current);
    if (toastRef.current)          clearTimeout(toastRef.current);
  }, []);

  // Simula oscilação da balança
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isCapturing) {
        setCurrentWeight(prev => {
          const noise = (Math.random() - 0.5) * 40;
          return Math.max(0, parseFloat((prev + noise).toFixed(0)));
        });
      }
    }, 600);
    return () => clearInterval(interval);
  }, [isCapturing]);

  const handleCapture = () => {
    setIsCapturing(true);
    if (captureTimeoutRef.current) clearTimeout(captureTimeoutRef.current);
    captureTimeoutRef.current = setTimeout(() => {
      const stable = tara === null
        ? Math.floor(8000 + Math.random() * 800)
        : Math.floor(29000 + Math.random() * 5000);
      setCurrentWeight(stable);
      if (tara === null) setTara(stable);
      else setBruto(stable);
      setIsCapturing(false);
    }, 1200);
  };

  const handleReset = () => {
    setTara(null);
    setBruto(null);
    setLiberado(false);
    setSaved(false);
    setCurrentWeight(8420);
  };

  const liquido      = bruto !== null && tara !== null ? bruto - tara : null;
  const hasDivergence = liquido !== null && Math.abs(liquido - selectedVehicle.pesoNota) > DIVERGENCE_TOLERANCE;
  const canSave      = bruto !== null && tara !== null && (liberado || !hasDivergence);

  // ─── Save to Supabase (pesagens table) ─────────────────────────
  const handleSave = async () => {
    if (!canSave || saving) return;
    setSaving(true);
    const payload = {
      warehouse_id:   warehouseId,
      sku:            selectedVehicle.placa,
      descricao:      `${selectedVehicle.transportadora} — ${selectedVehicle.tipo}`,
      peso_capturado: liquido,
      peso_master:    selectedVehicle.pesoNota,
      variacao:       liquido - selectedVehicle.pesoNota,
      modo:           selectedVehicle.tipo === 'Recebimento' ? 'INBOUND' : 'OUTBOUND',
      balanca:        activeScale,
      validado:       !hasDivergence || liberado,
    };
    const { error } = await supabase.from('pesagens').insert([payload]);
    setSaving(false);
    if (error) { showToast('Erro ao salvar pesagem: ' + error.message, 'error'); return; }
    setSaved(true);
    showToast('Pesagem salva com sucesso!');
    setTimeout(() => { handleReset(); setSaved(false); }, 2500);
  };

  const step = tara === null ? 0 : bruto === null ? 1 : 2;

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-6 space-y-5 animate-in fade-in duration-700">

      {/* HEADER */}
      <div className="bg-slate-900 rounded-[28px] border-2 border-slate-800 p-5 flex flex-col md:flex-row items-start md:items-center gap-5 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-primary" />

        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-secondary border-2 border-primary/30 flex items-center justify-center shadow-lg">
            <Scale className="w-7 h-7 text-primary" />
          </div>
          <div>
            <p className="text-[9px] font-black text-primary/50 uppercase tracking-widest">Pesagem Rodoviária</p>
            <h1 className="text-xl font-black text-white uppercase tracking-tight">2.21 Pesagem Rodoviária</h1>
            <p className="text-[10px] text-slate-500 font-medium">VerticalParts Connector — Serial Bridge</p>
          </div>
        </div>

        {/* Vehicle Data */}
        <div className="flex-1 grid grid-cols-3 gap-3">
          {/* Vehicle selector */}
          <div className="relative col-span-1">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Veículo / Placa</p>
            <button
              onClick={() => setShowVehicleDropdown(p => !p)}
              aria-expanded={showVehicleDropdown}
              aria-haspopup="listbox"
              aria-label="Selecionar veículo"
              className="w-full flex items-center justify-between gap-2 px-3 py-2.5 bg-slate-800 border-2 border-slate-700 rounded-xl text-xs font-black text-primary hover:border-primary/50 transition-all"
            >
              <span className="flex items-center gap-2">
                <Truck className="w-3.5 h-3.5" aria-hidden="true" />{selectedVehicle.placa}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
            </button>
            {showVehicleDropdown && (
              <div className="absolute top-full mt-1 left-0 w-64 bg-slate-900 border-2 border-slate-800 rounded-2xl shadow-2xl z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                {SEED_VEHICLES.map(v => (
                  <button key={v.placa}
                    onClick={() => { setSelectedVehicle(v); setShowVehicleDropdown(false); handleReset(); }}
                    className="w-full flex items-center justify-between px-4 py-3 text-left text-xs font-bold text-slate-300 hover:bg-slate-800 transition-colors border-b border-slate-800 last:border-0"
                  >
                    <code className="font-black text-primary">{v.placa}</code>
                    <span className="text-slate-500 text-[10px]">{v.transportadora}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Transportadora</p>
            <p className="text-sm font-black text-white">{selectedVehicle.transportadora}</p>
          </div>
          <div>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Tipo de Operação</p>
            <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider",
              selectedVehicle.tipo === 'Recebimento'
                ? 'bg-blue-900/50 text-blue-300 border border-blue-800'
                : 'bg-amber-900/50 text-amber-300 border border-amber-800'
            )}>
              <ArrowRight className={cn("w-3 h-3", selectedVehicle.tipo === 'Expedição' && "rotate-180")} />
              {selectedVehicle.tipo}
            </span>
          </div>
        </div>

        {/* Scale selector */}
        <div className="relative min-w-[240px]">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Balança Ativa</p>
          <button
            onClick={() => setShowScaleDropdown(p => !p)}
            aria-expanded={showScaleDropdown}
            aria-haspopup="listbox"
            aria-label="Selecionar balança ativa"
            className="w-full flex items-center justify-between gap-2 px-3 py-2.5 bg-slate-800 border-2 border-primary/30 rounded-xl text-[10px] font-black text-primary hover:border-primary/60 transition-all"
          >
            <span className="flex items-center gap-2 truncate">
              <Radio className="w-3.5 h-3.5 shrink-0 text-primary/70" aria-hidden="true" />
              <span className="truncate">{activeScale.split(' — ')[0]}</span>
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" aria-hidden="true" />
          </button>
          {showScaleDropdown && (
            <div className="absolute top-full mt-1 right-0 w-72 bg-slate-900 border-2 border-slate-800 rounded-2xl shadow-2xl z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
              {SCALES.map(s => (
                <button key={s}
                  onClick={() => { setActiveScale(s); setShowScaleDropdown(false); }}
                  className={cn("w-full flex items-center gap-3 px-4 py-3 text-left text-[10px] font-bold transition-colors border-b border-slate-800 last:border-0",
                    activeScale === s ? "bg-primary/10 text-primary" : "text-slate-400 hover:bg-slate-800"
                  )}
                >
                  <div className={cn("w-2 h-2 rounded-full shrink-0", activeScale === s ? "bg-primary animate-pulse" : "bg-slate-700")} />
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* LCD DISPLAY */}
      <div className="relative">
        <div className="absolute inset-x-8 inset-y-4 bg-primary/15 blur-3xl rounded-full pointer-events-none" />
        <div className="relative bg-slate-950 border-4 border-slate-800 rounded-[48px] overflow-hidden shadow-2xl shadow-black">
          <div className="h-2 bg-gradient-to-r from-primary/60 via-primary to-primary/60" />
          <div className="absolute inset-0 opacity-[0.025] pointer-events-none"
            style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, #000 3px, #000 6px)' }} />

          <div className="flex flex-col items-center justify-center py-10 px-8 md:py-14 relative">
            <p className="text-[11px] font-black text-primary/40 uppercase tracking-[0.6em] mb-6">
              PESO DA BALANÇA — {activeScale.split(' — ')[0]}
            </p>

            <div className={cn(
              "font-black tabular-nums leading-none transition-all duration-500 select-none",
              "text-[clamp(72px,18vw,160px)]",
              isCapturing
                ? "text-primary/20 animate-pulse"
                : "text-primary drop-shadow-[0_0_40px_rgba(255,205,0,0.5)]"
            )}>
              {currentWeight.toString().padStart(6, ' ').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
            </div>

            <div className="flex items-center gap-6 mt-4">
              <span className="text-2xl font-black text-primary/40 tracking-widest uppercase">Kg</span>
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 rounded-full border border-slate-800">
                <div className={cn("w-2 h-2 rounded-full", isCapturing ? "bg-amber-400 animate-ping" : "bg-green-400 shadow-lg shadow-green-400/50")} />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {isCapturing ? 'CAPTURANDO...' : 'SINAL ESTÁVEL'}
                </span>
              </div>
            </div>

            {/* Steps */}
            <div className="mt-8 flex items-center gap-3">
              {[
                { label: '1ª Pesagem (Tara)',  done: step > 0, active: step === 0 },
                { label: '→' },
                { label: '2ª Pesagem (Bruto)', done: step > 1, active: step === 1 },
                { label: '→' },
                { label: 'Peso Líquido',       done: step > 1, active: false },
              ].map((s, i) => s.label === '→' ? (
                <span key={i} className="text-slate-700 font-black text-sm">→</span>
              ) : (
                <span key={i} className={cn(
                  "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider border",
                  s.done   ? "bg-green-900/30 text-green-400 border-green-800" :
                  s.active ? "bg-primary/20 text-primary border-primary/40 shadow-md shadow-primary/20" :
                             "bg-slate-900 text-slate-600 border-slate-800"
                )}>
                  {s.label}
                </span>
              ))}
            </div>
          </div>

          <div className="h-1.5 bg-gradient-to-r from-primary/30 via-primary/60 to-primary/30" />
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={cn("bg-slate-900 rounded-[24px] border-2 p-5 transition-all duration-300",
          tara !== null ? "border-green-800/60 shadow-lg shadow-green-900/20" : "border-slate-800"
        )}>
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">1ª Pesagem — Tara</p>
          <div className="flex items-baseline gap-2">
            <span className={cn("text-3xl font-black tabular-nums transition-all",
              tara !== null ? "text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.4)]" : "text-slate-700"
            )}>
              {tara !== null ? tara.toLocaleString('pt-BR') : '——'}
            </span>
            <span className="text-sm font-black text-slate-600">Kg</span>
          </div>
          {tara !== null && <div className="mt-2 flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-green-500" /><span className="text-[10px] font-bold text-green-400">Capturado</span></div>}
        </div>

        <div className={cn("bg-slate-900 rounded-[24px] border-2 p-5 transition-all duration-300",
          bruto !== null ? "border-primary/50 shadow-lg shadow-primary/10" : "border-slate-800"
        )}>
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">2ª Pesagem — Bruto</p>
          <div className="flex items-baseline gap-2">
            <span className={cn("text-3xl font-black tabular-nums transition-all",
              bruto !== null ? "text-primary drop-shadow-[0_0_8px_rgba(255,205,0,0.4)]" : "text-slate-700"
            )}>
              {bruto !== null ? bruto.toLocaleString('pt-BR') : '——'}
            </span>
            <span className="text-sm font-black text-slate-600">Kg</span>
          </div>
          {bruto !== null && <div className="mt-2 flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-primary/70" /><span className="text-[10px] font-bold text-primary/70">Capturado</span></div>}
        </div>

        <div className={cn("bg-slate-900 rounded-[24px] border-2 p-5 transition-all duration-300",
          liquido !== null ? "border-slate-600" : "border-slate-800"
        )}>
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Peso Líquido (Bruto − Tara)</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black tabular-nums text-white">
              {liquido !== null ? liquido.toLocaleString('pt-BR') : '——'}
            </span>
            <span className="text-sm font-black text-slate-600">Kg</span>
          </div>
          {liquido !== null && (
            <p className="text-[10px] font-bold text-slate-500 mt-2">
              Nota: {selectedVehicle.pesoNota.toLocaleString('pt-BR')} Kg
            </p>
          )}
        </div>

        <div className={cn("rounded-[24px] border-2 p-5 transition-all duration-300",
          hasDivergence && !liberado
            ? "bg-red-950 border-red-800 shadow-lg shadow-red-900/40"
            : liberado
            ? "bg-amber-950/40 border-amber-800/60"
            : "bg-slate-900 border-slate-800"
        )}>
          <p className="text-[9px] font-black uppercase tracking-widest mb-2 text-slate-500">Situação</p>
          {liquido === null ? (
            <p className="text-sm font-black text-slate-700 uppercase">Aguardando...</p>
          ) : hasDivergence && !liberado ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-danger shrink-0" />
                <span className="text-sm font-black text-danger uppercase">Divergência!</span>
              </div>
              <p className="text-[10px] font-bold text-red-400">
                Δ {Math.abs(liquido - selectedVehicle.pesoNota).toLocaleString('pt-BR')} Kg acima do tolerado
              </p>
              <button
                onClick={() => setShowSupervisorModal(true)}
                className="w-full py-2.5 rounded-xl bg-danger text-white text-[10px] font-black uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-lg mt-2"
              >
                <ShieldAlert className="w-3.5 h-3.5" /> Liberar com Divergência
              </button>
            </div>
          ) : liberado ? (
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              <span className="text-sm font-black text-amber-400 uppercase">Liberado c/ Div.</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              <span className="text-sm font-black text-green-400 uppercase">Dentro do Limite</span>
            </div>
          )}
        </div>
      </div>

      {/* ACTIONS */}
      <div className="bg-slate-900 rounded-[24px] border-2 border-slate-800 px-5 py-4 flex flex-wrap items-center gap-3">
        <button
          onClick={handleCapture}
          disabled={isCapturing || step >= 2}
          className="flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-primary text-secondary text-xs font-black uppercase tracking-wider hover:opacity-95 active:scale-95 transition-all shadow-xl shadow-primary/30 disabled:opacity-30"
        >
          <Scale className="w-4 h-4" />
          {step === 0 ? 'Capturar Tara' : 'Capturar Bruto'}
        </button>

        {saved ? (
          <div className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-green-900/40 border border-green-800 text-green-400 text-xs font-black uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4" /> Pesagem Salva!
          </div>
        ) : (
          <button
            onClick={handleSave}
            disabled={!canSave || saving}
            className="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-slate-800 border-2 border-slate-700 text-slate-200 text-xs font-black uppercase tracking-wider hover:bg-slate-700 disabled:opacity-30 transition-all"
          >
            <Save className="w-4 h-4" /> {saving ? 'Salvando...' : 'Salvar'}
          </button>
        )}

        <button
          onClick={() => setShowHistoryModal(true)}
          className="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-slate-800 border-2 border-slate-700 text-slate-300 text-xs font-black uppercase tracking-wider hover:bg-slate-700 transition-all"
        >
          <History className="w-4 h-4" /> Histórico
        </button>

        <button
          onClick={handleReset}
          className="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-slate-800 border-2 border-danger/30 text-danger text-xs font-black uppercase tracking-wider hover:bg-red-950/30 transition-all"
        >
          <X className="w-4 h-4" /> Cancelar / Zerar
        </button>

        <div className="flex-1" />

        <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-xl border border-slate-700">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50" />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <Zap className="w-3 h-3 inline mr-1 text-primary" />Conector: ONLINE
          </span>
        </div>
      </div>

      {/* MODALS */}
      {showSupervisorModal && (
        <SupervisorModal
          pesoNota={selectedVehicle.pesoNota}
          pesoBruto={bruto || 0}
          onClose={() => setShowSupervisorModal(false)}
          onConfirm={(_motivo) => { setShowSupervisorModal(false); setLiberado(true); showToast('Divergência autorizada pelo supervisor.'); }}
        />
      )}
      {showHistoryModal && <HistoryModal onClose={() => setShowHistoryModal(false)} warehouseId={warehouseId} />}

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
