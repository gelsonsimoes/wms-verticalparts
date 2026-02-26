import React, { useState, useRef, useCallback } from 'react';
import {
  Scroll,
  Upload,
  Link2,
  Search,
  X,
  ChevronDown,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Filter,
  FileText,
  Truck,
  DollarSign,
  ClipboardList,
  ArrowRight,
  PanelRightOpen,
  RefreshCw,
  Info,
  Package,
  CheckSquare,
  Hash,
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) { return twMerge(clsx(inputs)); }

// ─── STATUS CONFIG ─────────────────────────────────────────────────
const STATUS_CFG = {
  'Integrado':     { color: 'text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-400', dot: 'bg-green-500' },
  'Aguardando':    { color: 'text-amber-700 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400', dot: 'bg-amber-400 animate-pulse' },
  'Erro XML':      { color: 'text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-400',         dot: 'bg-red-500' },
  'Sem Vínculo':   { color: 'text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-400',    dot: 'bg-slate-400' },
  'Vinculado':     { color: 'text-blue-700 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400',     dot: 'bg-blue-500' },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] || {};
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider whitespace-nowrap', cfg.color)}>
      <div className={cn('w-1.5 h-1.5 rounded-full', cfg.dot)} />
      {status}
    </span>
  );
}

// ─── MOCK DATA ─────────────────────────────────────────────────────
const INITIAL_CTES = [
  { id: 1, numero: 'CT-002241', chave: '35260206547890000100570010000022411000022410', emitente: 'Transportadora JL',    tomador: 'VerticalParts Matriz', frete: 1850.00, status: 'Integrado',   nfesVinculadas: ['NF 000.242', 'NF 000.243'] },
  { id: 2, numero: 'CT-002242', chave: '35260206547890000100570010000022421000022420', emitente: 'Rápido Sul Cargas',    tomador: 'Filial BH',            frete: 740.00,  status: 'Vinculado',   nfesVinculadas: ['NF 000.244'] },
  { id: 3, numero: 'CT-002243', chave: '35260206547890000100570010000022431000022430', emitente: 'Expresso Norte LTDA', tomador: 'Atacado Norte',         frete: 3200.00, status: 'Aguardando',  nfesVinculadas: [] },
  { id: 4, numero: 'CT-002244', chave: '35260206547890000100570010000022441000022440', emitente: 'Transportadora JL',   tomador: 'Rede Peças SP',         frete: 980.00,  status: 'Sem Vínculo', nfesVinculadas: [] },
  { id: 5, numero: 'CT-002240', chave: '35260206547890000100570010000022401000022400', emitente: 'Logística Centro',    tomador: 'Grupo Freios Sul',      frete: 5100.00, status: 'Erro XML',    nfesVinculadas: [] },
];

const NFE_DISPONIVEIS = [
  { id: 'nf1', numero: 'NF 000.245', valor: 12500, destinatario: 'Atacado Norte',    data: '22/02/2026', volume: 4 },
  { id: 'nf2', numero: 'NF 000.246', valor:  8700, destinatario: 'Moto Peças RS',    data: '22/02/2026', volume: 2 },
  { id: 'nf3', numero: 'NF 000.247', valor: 33000, destinatario: 'Grupo Freios Sul', data: '22/02/2026', volume: 8 },
  { id: 'nf4', numero: 'NF 000.248', valor:  3200, destinatario: 'Auto Center BH',   data: '21/02/2026', volume: 1 },
];

const LOG_HISTORICO = [
  { id: 1, cte: 'CT-002241', transportadora: 'Transportadora JL',   dtImport: '22/02/2026 07:10', status: 'Integrado',  log: 'Arquivo XML importado e validado com sucesso. Chave autorizada na SEFAZ. Vinculação com 2 NF-es realizada automaticamente.' },
  { id: 2, cte: 'CT-002242', transportadora: 'Rápido Sul Cargas',   dtImport: '22/02/2026 09:30', status: 'Vinculado',  log: 'XML válido. 1 NF-e vinculada manualmente pelo usuário danilo.supervisor.' },
  { id: 3, cte: 'CT-002243', transportadora: 'Expresso Norte LTDA', dtImport: '22/02/2026 10:15', status: 'Aguardando', log: 'XML importado. Aguardando vinculação com NF-e de expedição pendente.' },
  { id: 4, cte: 'CT-002244', transportadora: 'Transportadora JL',   dtImport: '21/02/2026 16:44', status: 'Sem Vínculo',log: 'XML importado. Nenhuma NF-e vinculada ainda.' },
  { id: 5, cte: 'CT-002240', transportadora: 'Logística Centro',    dtImport: '20/02/2026 14:22', status: 'Erro XML',   log: 'ERRO: Chave de acesso do CT-e não reconhecida pela SEFAZ (código 539 — emitente inválido). Reenviar arquivo corrigido.' },
];

// ─── MODAL: IMPORTAR XML (DRAG & DROP) ────────────────────────────
function ImportModal({ onClose, onImport }) {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const inputRef = useRef(null);

  const handleDrop = useCallback((e) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f && f.name.endsWith('.xml')) setFile(f);
  }, []);

  const handleProcess = () => {
    setProcessing(true);
    setTimeout(() => { setProcessing(false); setDone(true); }, 1800);
    setTimeout(() => { onImport(file?.name || 'CT-e_importado.xml'); onClose(); }, 2600);
  };

  return (
    <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-[28px] border-2 border-slate-100 dark:border-slate-800 shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-orange-600 to-orange-500 px-7 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Upload className="w-6 h-6 text-white" />
            <div>
              <p className="text-[9px] font-black text-white/60 uppercase tracking-widest">CT-e — Fiscal</p>
              <h2 className="text-base font-black text-white uppercase">Importar CT-e (XML)</h2>
            </div>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-7 space-y-5">
          {/* Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={cn(
              'relative flex flex-col items-center justify-center gap-4 p-10 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200',
              dragging  ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 scale-[1.02]' :
              file      ? 'border-green-400 bg-green-50 dark:bg-green-900/20' :
                          'border-slate-200 dark:border-slate-700 hover:border-orange-400 hover:bg-orange-50/40 dark:hover:bg-orange-900/10'
            )}>
            <input ref={inputRef} type="file" accept=".xml" className="hidden" onChange={e => setFile(e.target.files[0])} />
            <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center transition-all',
              file ? 'bg-green-100 dark:bg-green-900/30' : 'bg-orange-100 dark:bg-orange-900/30'
            )}>
              {file ? <CheckCircle2 className="w-7 h-7 text-green-600" /> : <Upload className="w-7 h-7 text-orange-600" />}
            </div>
            {file ? (
              <div className="text-center">
                <p className="text-sm font-black text-green-700 dark:text-green-400">{file.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">{(file.size / 1024).toFixed(1)} KB — pronto para processar</p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-sm font-black text-slate-700 dark:text-slate-300">Solte o arquivo XML aqui</p>
                <p className="text-xs text-slate-400 mt-1">ou <span className="text-orange-600 font-bold">clique para selecionar</span></p>
                <p className="text-[9px] text-slate-400 mt-2 uppercase tracking-widest">Apenas arquivos .XML do CT-e</p>
              </div>
            )}
          </div>

          {done && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-3 animate-in slide-in-from-bottom-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <p className="text-xs font-black text-green-700">XML processado com sucesso! Importando...</p>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-3 rounded-2xl border-2 border-slate-200 dark:border-slate-700 text-sm font-black text-slate-500 hover:bg-slate-50 transition-all uppercase tracking-wider">Cancelar</button>
            <button onClick={handleProcess} disabled={!file || processing}
              className="flex-1 py-3 rounded-2xl bg-orange-600 text-white text-sm font-black hover:opacity-90 active:scale-95 disabled:opacity-40 transition-all flex items-center justify-center gap-2">
              {processing ? <><RefreshCw className="w-4 h-4 animate-spin" />Processando...</> : <><Upload className="w-4 h-4" />Processar XML</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MODAL: VINCULAR NF-e (DUAL PANEL + D&D) ──────────────────────
function VincularNFeModal({ ctes, onClose, onVincular }) {
  const [nfes, setNfes] = useState(NFE_DISPONIVEIS);
  const [droppedMap, setDroppedMap] = useState({}); // cteId → [nfIds]
  const [draggingNf, setDraggingNf] = useState(null);
  const [draggingOver, setDraggingOver] = useState(null);
  const [vinculando, setVinculando] = useState(false);

  const available = nfes.filter(nf => !Object.values(droppedMap).flat().includes(nf.id));

  const handleDragStart = (nf) => setDraggingNf(nf);
  const handleDrop = (cteId) => {
    if (!draggingNf) return;
    setDroppedMap(prev => ({ ...prev, [cteId]: [...(prev[cteId] || []), draggingNf.id] }));
    setDraggingNf(null); setDraggingOver(null);
  };
  const removeVinculo = (cteId, nfId) => {
    setDroppedMap(prev => ({ ...prev, [cteId]: (prev[cteId] || []).filter(id => id !== nfId) }));
  };

  const totalVinculos = Object.values(droppedMap).flat().length;

  const handleConfirmar = () => {
    setVinculando(true);
    setTimeout(() => { onVincular(droppedMap); onClose(); }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-[28px] border-2 border-slate-100 dark:border-slate-800 shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-gradient-to-r from-blue-700 to-blue-600 px-7 py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <Link2 className="w-6 h-6 text-white" />
            <div>
              <p className="text-[9px] font-black text-white/60 uppercase tracking-widest">CT-e — Vinculação Fiscal</p>
              <h2 className="text-base font-black text-white uppercase">Vincular NF-e ao CT-e</h2>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black text-white/60">{totalVinculos} vínculo{totalVinculos !== 1 ? 's' : ''} criado{totalVinculos !== 1 ? 's' : ''}</span>
            <button onClick={onClose} className="text-white/50 hover:text-white"><X className="w-5 h-5" /></button>
          </div>
        </div>

        <div className="p-4 flex-1 overflow-hidden">
          <p className="text-[10px] text-slate-400 font-bold text-center mb-4 uppercase tracking-widest flex items-center justify-center gap-2">
            <ArrowRight className="w-3.5 h-3.5" /> Arraste as NF-es para dentro do CT-e correspondente
          </p>
          <div className="flex gap-4 h-[420px]">

            {/* LEFT — NF-es disponíveis */}
            <div className="w-56 flex flex-col gap-2 overflow-y-auto">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest pb-1 border-b border-slate-200 dark:border-slate-700">
                NF-es Expedidas Disponíveis ({available.length})
              </p>
              {available.length === 0 && (
                <div className="flex flex-col items-center justify-center flex-1 text-center gap-2 py-8">
                  <CheckSquare className="w-8 h-8 text-green-500" />
                  <p className="text-xs font-black text-green-600">Todas as NF-es vinculadas!</p>
                </div>
              )}
              {available.map(nf => (
                <div key={nf.id}
                  draggable
                  onDragStart={() => handleDragStart(nf)}
                  onDragEnd={() => setDraggingNf(null)}
                  className={cn(
                    'p-3 rounded-xl border-2 cursor-grab active:cursor-grabbing transition-all select-none',
                    draggingNf?.id === nf.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 opacity-60 scale-95'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-400 hover:shadow-md'
                  )}>
                  <div className="flex items-center justify-between mb-1">
                    <code className="text-[11px] font-black text-secondary">{nf.numero}</code>
                    <span className="text-[9px] font-bold text-slate-400">{nf.volume} vol.</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium truncate">{nf.destinatario}</p>
                  <p className="text-[10px] font-black text-slate-700 dark:text-slate-300 mt-0.5">
                    {nf.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                </div>
              ))}
            </div>

            {/* RIGHT — CT-es como drop zones */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest pb-1 border-b border-slate-200 dark:border-slate-700">
                CT-es de Embarque
              </p>
              {ctes.filter(c => c.status !== 'Erro XML').map(cte => {
                const vinculados = droppedMap[cte.id] || [];
                const isOver = draggingOver === cte.id;
                return (
                  <div key={cte.id}
                    onDragOver={e => { e.preventDefault(); setDraggingOver(cte.id); }}
                    onDragLeave={() => setDraggingOver(null)}
                    onDrop={() => handleDrop(cte.id)}
                    className={cn(
                      'rounded-2xl border-2 p-4 transition-all duration-150',
                      isOver
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-[1.01] shadow-lg'
                        : vinculados.length > 0
                          ? 'border-blue-200 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-900/10'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                    )}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <code className="text-sm font-black text-blue-600">{cte.numero}</code>
                        <p className="text-xs font-bold text-slate-500 mt-0.5">{cte.emitente}</p>
                        <p className="text-[9px] font-mono text-slate-400 truncate max-w-[240px]">{cte.chave}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-slate-800 dark:text-white">
                          {cte.frete.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                        <StatusBadge status={cte.status} />
                      </div>
                    </div>
                    {/* NFs dropadas */}
                    <div className={cn('min-h-[48px] rounded-xl p-2 flex flex-wrap gap-2 transition-all',
                      isOver ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-slate-50 dark:bg-slate-700/30'
                    )}>
                      {vinculados.length === 0 && (
                        <p className="text-[9px] text-slate-400 font-bold italic m-auto">{isOver ? '↓ Solte a NF-e aqui' : 'Nenhuma NF-e vinculada'}</p>
                      )}
                      {vinculados.map(nfId => {
                        const nf = NFE_DISPONIVEIS.find(n => n.id === nfId);
                        return nf ? (
                          <div key={nfId} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-black">
                            <FileText className="w-3 h-3" />
                            {nf.numero}
                            <button onClick={() => removeVinculo(cte.id, nfId)} className="ml-0.5 hover:text-red-300 transition-colors">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 px-7 py-4 border-t border-slate-100 dark:border-slate-800 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-2xl border-2 border-slate-200 dark:border-slate-700 text-sm font-black text-slate-500 hover:bg-slate-50 transition-all uppercase tracking-wider">Cancelar</button>
          <button onClick={handleConfirmar} disabled={totalVinculos === 0 || vinculando}
            className="flex-1 py-3 rounded-2xl bg-blue-600 text-white text-sm font-black hover:opacity-90 active:scale-95 disabled:opacity-40 transition-all flex items-center justify-center gap-2">
            {vinculando ? <><RefreshCw className="w-4 h-4 animate-spin" />Vinculando...</> : <><Link2 className="w-4 h-4" />Confirmar {totalVinculos} Vínculo{totalVinculos !== 1 ? 's' : ''}</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── GAVETA LATERAL: HISTÓRICO E LOG ─────────────────────────────
function HistoricoDrawer({ onClose }) {
  const [selected, setSelected] = useState(LOG_HISTORICO[0]);
  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay */}
      <div className="flex-1 bg-black/50" onClick={onClose} />
      {/* Drawer */}
      <div className="w-[460px] bg-white dark:bg-slate-900 border-l-2 border-slate-200 dark:border-slate-800 flex flex-col h-full shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <ClipboardList className="w-5 h-5 text-secondary" />
            <div>
              <p className="text-[9px] font-black text-white/50 uppercase tracking-widest">CT-e</p>
              <h2 className="text-sm font-black text-white uppercase">Histórico de Importações</h2>
            </div>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Lista */}
          <div className="w-44 border-r border-slate-100 dark:border-slate-800 overflow-y-auto">
            {LOG_HISTORICO.map(item => (
              <button key={item.id} onClick={() => setSelected(item)}
                className={cn('w-full text-left p-3 border-b border-slate-50 dark:border-slate-800 transition-all',
                  selected?.id === item.id ? 'bg-slate-100 dark:bg-slate-800' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                )}>
                <code className="text-[10px] font-black text-slate-700 dark:text-slate-300 block">{item.cte}</code>
                <p className="text-[9px] text-slate-500 truncate">{item.transportadora}</p>
                <div className="mt-1"><StatusBadge status={item.status} /></div>
              </button>
            ))}
          </div>

          {/* Detalhe do log */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {selected && (
              <>
                <div className="space-y-3">
                  <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">CT-e</p>
                    <code className="text-xl font-black text-slate-800 dark:text-white">{selected.cte}</code>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { l: 'Transportadora', v: selected.transportadora },
                      { l: 'Data Importação', v: selected.dtImport },
                    ].map(f => (
                      <div key={f.l} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{f.l}</p>
                        <p className="text-[11px] font-black text-slate-700 dark:text-slate-300 mt-0.5">{f.v}</p>
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                    <StatusBadge status={selected.status} />
                  </div>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5" /> Log de Processamento
                  </p>
                  <div className={cn('p-4 rounded-2xl border text-xs font-medium leading-relaxed',
                    selected.status === 'Erro XML'
                      ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
                      : selected.status === 'Aguardando'
                        ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400'
                        : 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
                  )}>
                    {selected.log}
                  </div>
                </div>

                {/* Timeline */}
                <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Timeline</p>
                  {[
                    { event: 'Arquivo XML recebido', done: true },
                    { event: 'Validação da chave de acesso', done: selected.status !== 'Erro XML' },
                    { event: 'Registro no sistema', done: selected.status !== 'Erro XML' },
                    { event: 'Vinculação com NF-e', done: selected.status === 'Integrado' || selected.status === 'Vinculado' },
                    { event: 'Integração completa', done: selected.status === 'Integrado' },
                  ].map((step, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={cn('w-5 h-5 rounded-full flex items-center justify-center shrink-0',
                        step.done ? 'bg-green-500' : 'bg-slate-200 dark:bg-slate-700'
                      )}>
                        {step.done
                          ? <CheckCircle2 className="w-3 h-3 text-white" />
                          : <Clock className="w-3 h-3 text-slate-400" />
                        }
                      </div>
                      <span className={cn('text-xs font-bold', step.done ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400')}>{step.event}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────
export default function CTeControl() {
  const [ctes, setCtes] = useState(INITIAL_CTES);
  const [selectedId, setSelectedId] = useState(null);
  const [showImport, setShowImport] = useState(false);
  const [showVincular, setShowVincular] = useState(false);
  const [showHistorico, setShowHistorico] = useState(false);
  const [filterTransp, setFilterTransp] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [filterChave, setFilterChave] = useState('');
  const [showStatusDrop, setShowStatusDrop] = useState(false);

  const transportadoras = [...new Set(ctes.map(c => c.emitente))];

  const filtered = ctes.filter(c => {
    if (filterStatus !== 'Todos' && c.status !== filterStatus) return false;
    if (filterTransp && !c.emitente.toLowerCase().includes(filterTransp.toLowerCase())) return false;
    if (filterChave && !c.chave.includes(filterChave) && !c.numero.toLowerCase().includes(filterChave.toLowerCase())) return false;
    return true;
  });

  const handleImport = (filename) => {
    const novo = {
      id: ctes.length + 1,
      numero: `CT-00${2245 + ctes.length}`,
      chave: `35260206547890000100570010000${2245 + ctes.length}1000${2245 + ctes.length}0`,
      emitente: 'Nova Transportadora',
      tomador: 'VerticalParts Matriz',
      frete: 0,
      status: 'Aguardando',
      nfesVinculadas: [],
    };
    setCtes(prev => [novo, ...prev]);
  };

  const handleVincular = (mapVinculos) => {
    setCtes(prev => prev.map(c => {
      const novos = (mapVinculos[c.id] || []).map(id => NFE_DISPONIVEIS.find(n => n.id === id)?.numero).filter(Boolean);
      if (!novos.length) return c;
      return { ...c, nfesVinculadas: [...c.nfesVinculadas, ...novos], status: 'Vinculado' };
    }));
  };

  const kpiTotals = Object.keys(STATUS_CFG).reduce((acc, s) => { acc[s] = ctes.filter(c => c.status === s).length; return acc; }, {});

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 space-y-5 animate-in fade-in duration-700">

      {/* ═══════════ HEADER ═══════════ */}
      <div className="bg-white dark:bg-slate-900 rounded-[32px] border-2 border-slate-100 dark:border-slate-800 p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-secondary to-orange-500" />
        <div className="flex flex-col md:flex-row items-start md:items-center gap-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-3xl bg-orange-600 flex items-center justify-center shadow-lg">
              <Scroll className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Módulo Fiscal — Cat. 6</p>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">CT-e</h1>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Conhecimento de Transporte Eletrônico — Controle e Vinculação com NF-e</p>
            </div>
          </div>
          {/* KPIs */}
          <div className="flex flex-wrap gap-2 md:ml-auto">
            {Object.entries(STATUS_CFG).map(([key, def]) => (
              kpiTotals[key] > 0 && (
                <button key={key}
                  onClick={() => setFilterStatus(filterStatus === key ? 'Todos' : key)}
                  className={cn('flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border-2 transition-all',
                    filterStatus === key ? def.color + ' border-current/30 scale-105 shadow-md' : 'bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:scale-105'
                  )}>
                  <div className={cn('w-2 h-2 rounded-full', def.dot)} />
                  {kpiTotals[key]} {key}
                </button>
              )
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════ TOOLBAR ═══════════ */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-100 dark:border-slate-800 px-5 py-3 flex flex-wrap items-center gap-2 shadow-sm">
        <button onClick={() => setShowImport(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 text-white text-xs font-black uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all shadow-md">
          <Upload className="w-3.5 h-3.5" />Importar CT-e (XML)
        </button>
        <button onClick={() => setShowVincular(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-black uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all shadow-md">
          <Link2 className="w-3.5 h-3.5" />Vincular NF-e
        </button>
        <button onClick={() => setShowHistorico(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-700 text-white text-xs font-black uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all shadow-md">
          <PanelRightOpen className="w-3.5 h-3.5" />Consulta de CT-es Importados
        </button>
      </div>

      {/* ═══════════ FILTROS ═══════════ */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-100 dark:border-slate-800 px-5 py-4 flex flex-wrap items-center gap-3 shadow-sm">
        <Filter className="w-4 h-4 text-slate-400 shrink-0" />

        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3" />
          <input value={filterChave} onChange={e => setFilterChave(e.target.value)}
            placeholder="Chave ou Nº CT-e..."
            className="pl-9 pr-4 py-1.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:border-secondary transition-all w-48" />
        </div>

        <div className="relative flex items-center">
          <Truck className="w-3.5 h-3.5 text-slate-400 absolute left-3" />
          <input value={filterTransp} onChange={e => setFilterTransp(e.target.value)}
            placeholder="Transportadora..."
            className="pl-9 pr-4 py-1.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:border-secondary transition-all w-44" />
        </div>

        <div className="relative">
          <button onClick={() => setShowStatusDrop(p => !p)}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold hover:border-secondary transition-all">
            {filterStatus} <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>
          {showStatusDrop && (
            <div className="absolute top-full mt-1 left-0 w-36 bg-white dark:bg-slate-900 rounded-xl border-2 border-slate-100 dark:border-slate-800 shadow-xl z-20 overflow-hidden">
              {['Todos', ...Object.keys(STATUS_CFG)].map(s => (
                <button key={s} onClick={() => { setFilterStatus(s); setShowStatusDrop(false); }}
                  className={cn('w-full text-left px-4 py-2.5 text-xs font-bold border-b border-slate-50 dark:border-slate-800 last:border-0 transition-colors',
                    filterStatus === s ? 'bg-secondary text-primary' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  )}>{s}
                </button>
              ))}
            </div>
          )}
        </div>

        <button onClick={() => { setFilterChave(''); setFilterTransp(''); setFilterStatus('Todos'); }}
          className="flex items-center gap-1.5 text-xs font-black text-slate-400 hover:text-danger transition-all">
          <X className="w-3.5 h-3.5" /> Limpar
        </button>
        <span className="ml-auto text-[10px] font-black text-slate-400">{filtered.length} registros</span>
      </div>

      {/* ═══════════ GRID PRINCIPAL ═══════════ */}
      <div className="bg-white dark:bg-slate-900 rounded-[28px] border-2 border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800 border-b-2 border-slate-100 dark:border-slate-700">
              {['', 'Nº CT-e', 'Chave de Acesso', 'Emitente (Transportadora)', 'Tomador do Frete', 'Valor do Frete', 'NF-es Vinculadas', 'Status'].map((h, i) => (
                <th key={i} className="p-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="p-12 text-center text-slate-400 text-sm font-medium">Nenhum CT-e encontrado com os filtros aplicados.</td></tr>
            )}
            {filtered.map(cte => {
              const isSel = cte.id === selectedId;
              return (
                <tr key={cte.id}
                  onClick={() => setSelectedId(cte.id === selectedId ? null : cte.id)}
                  className={cn(
                    'border-t border-slate-100 dark:border-slate-800 cursor-pointer transition-all group',
                    cte.status === 'Erro XML' && 'bg-red-50/40 dark:bg-red-950/10',
                    isSel ? 'bg-secondary/5 border-l-4 border-l-secondary' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border-l-4 border-l-transparent'
                  )}>
                  <td className="p-4">
                    <div className={cn('w-2 h-2 rounded-full mx-auto', isSel ? 'bg-secondary scale-150' : 'bg-transparent')} />
                  </td>
                  <td className="p-4">
                    <code className="text-sm font-black text-orange-600">{cte.numero}</code>
                  </td>
                  <td className="p-4 max-w-[160px]">
                    <code className="text-[9px] font-mono text-slate-500 truncate block">{cte.chave}</code>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Truck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{cte.emitente}</span>
                    </div>
                  </td>
                  <td className="p-4 text-xs font-medium text-slate-600 dark:text-slate-400">{cte.tomador}</td>
                  <td className="p-4 text-xs font-black text-slate-800 dark:text-white tabular-nums whitespace-nowrap">
                    {cte.frete.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                  <td className="p-4">
                    {cte.nfesVinculadas.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {cte.nfesVinculadas.map((nf, i) => (
                          <code key={i} className="text-[9px] font-black text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-1.5 py-0.5 rounded-md">{nf}</code>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">Sem NF-e</span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={cte.status} />
                      {cte.status === 'Erro XML' && (
                        <AlertTriangle className="w-4 h-4 text-danger" title="Erro na importação" />
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* MODAIS E GAVETA */}
      {showImport    && <ImportModal onClose={() => setShowImport(false)} onImport={handleImport} />}
      {showVincular  && <VincularNFeModal ctes={ctes} onClose={() => setShowVincular(false)} onVincular={handleVincular} />}
      {showHistorico && <HistoricoDrawer onClose={() => setShowHistorico(false)} />}
    </div>
  );
}
