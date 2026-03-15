import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  Scroll, Upload, Link2, Search, X, ChevronDown, CheckCircle2, Clock,
  AlertTriangle, XCircle, Filter, FileText, Truck, DollarSign,
  ClipboardList, ArrowRight, PanelRightOpen, RefreshCw, Info,
  Package, CheckSquare, Hash,
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) { return twMerge(clsx(inputs)); }

// ─── Aviso de desenvolvimento fiscal ─────────────────────────────────────────
// ⚠️  ATENÇÃO: Este módulo é um PROTÓTIPO de demonstração.
//    CT-e é Documento Fiscal Eletrônico regulado pela Receita Federal.
//    Em produção:
//    • Chaves de acesso devem ser geradas por biblioteca certificada (ex.: nfd, sped-extractor)
//      com cálculo correto do DV Módulo 11.
//    • XML deve ser validado contra o XSD oficial da SEFAZ.
//    • Transmissão e consulta de status via Webservice SEFAZ (NWS/SV).
//    • Auditoria imutável de todas as operações fiscais.
//    • Status "Autorizado" só deve ser exibido após retorno positivo da SEFAZ.

// ─── Config de status ─────────────────────────────────────────────────────────
const STATUS_CFG = {
  'Autorizado (Mock)': { color: 'text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-400', dot: 'bg-green-500' },
  'Aguardando':        { color: 'text-amber-700 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400', dot: 'bg-amber-400' },
  'Erro XML':          { color: 'text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-400',         dot: 'bg-red-500'   },
  'Sem Vínculo':       { color: 'text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-400',    dot: 'bg-slate-400' },
  'Vinculado':         { color: 'text-blue-700 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400',     dot: 'bg-blue-500'  },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] ?? {};
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider whitespace-nowrap', cfg.color)}>
      <div className={cn('w-1.5 h-1.5 rounded-full shrink-0', cfg.dot)} />{status}
    </span>
  );
}

// ─── Dados mock ───────────────────────────────────────────────────────────────
const INITIAL_CTES = [
  { id: 1, numero: 'CT-002241', chave: '35260206547890000100570010000022411000022410', emitente: 'Transportadora JL',    tomador: 'VerticalParts Matriz', frete: 1850.00, status: 'Autorizado (Mock)', nfesVinculadas: ['NF 000.242','NF 000.243'], erroDetalhe: null },
  { id: 2, numero: 'CT-002242', chave: '35260206547890000100570010000022421000022420', emitente: 'Rápido Sul Cargas',    tomador: 'Filial BH',            frete: 740.00,  status: 'Vinculado',         nfesVinculadas: ['NF 000.244'],              erroDetalhe: null },
  { id: 3, numero: 'CT-002243', chave: '35260206547890000100570010000022431000022430', emitente: 'Expresso Norte LTDA', tomador: 'Atacado Norte',         frete: 3200.00, status: 'Aguardando',        nfesVinculadas: [],                         erroDetalhe: null },
  { id: 4, numero: 'CT-002244', chave: '35260206547890000100570010000022441000022440', emitente: 'Transportadora JL',   tomador: 'Rede Peças SP',         frete: 980.00,  status: 'Sem Vínculo',       nfesVinculadas: [],                         erroDetalhe: null },
  { id: 5, numero: 'CT-002240', chave: '35260206547890000100570010000022401000022400', emitente: 'Logística Centro',    tomador: 'Grupo Freios Sul',      frete: 5100.00, status: 'Erro XML',          nfesVinculadas: [],                         erroDetalhe: 'Chave de acesso não reconhecida pela SEFAZ (código 539 — emitente inválido). Reenvie o arquivo XML corrigido.' },
];

const NFE_DISPONIVEIS = [
  { id: 'nf1', numero: 'NF 000.245', valor: 12500, destinatario: 'Atacado Norte',    data: '22/02/2026', volume: 4 },
  { id: 'nf2', numero: 'NF 000.246', valor:  8700, destinatario: 'Moto Peças RS',    data: '22/02/2026', volume: 2 },
  { id: 'nf3', numero: 'NF 000.247', valor: 33000, destinatario: 'Grupo Freios Sul', data: '22/02/2026', volume: 8 },
  { id: 'nf4', numero: 'NF 000.248', valor:  3200, destinatario: 'Auto Center BH',   data: '21/02/2026', volume: 1 },
];

// ─── Geração de número sequencial seguro (sem colisão por length) ─────────────
function nextNumero(ctes) {
  const max = ctes.reduce((m, c) => {
    const n = parseInt(c.numero.replace('CT-', ''), 10);
    return Number.isFinite(n) && n > m ? n : m;
  }, 0);
  return `CT-${String(max + 1).padStart(6, '0')}`;
}

// ─── Log de ações reais ───────────────────────────────────────────────────────
function makeLogEntry(cteNumero, transportadora, status, msg) {
  return {
    id:             crypto.randomUUID(),
    cte:            cteNumero,
    transportadora,
    dtImport:       new Date().toLocaleString('pt-BR'),
    status,
    log:            msg,
  };
}

// ─── Parsing básico de XML CT-e via FileReader ────────────────────────────────
function parseCTeXML(xmlText) {
  try {
    const parser = new DOMParser();
    const doc    = parser.parseFromString(xmlText, 'text/xml');
    const err    = doc.querySelector('parsererror');
    if (err) return { ok: false, erro: 'XML malformado: ' + err.textContent.slice(0, 120) };

    // Tentativa de extrair campos reais do XML CT-e
    const chave     = doc.querySelector('chCTe')?.textContent?.trim()   ?? '';
    const emitente  = doc.querySelector('emit xNome')?.textContent?.trim() ?? 'Desconhecido';
    const tomador   = doc.querySelector('dest xNome, rem xNome')?.textContent?.trim() ?? 'Desconhecido';
    const freteStr  = doc.querySelector('vTPrest, vTP')?.textContent?.trim() ?? '0';
    const frete     = parseFloat(freteStr.replace(',', '.'));

    // Validação mínima da chave: 44 dígitos numéricos
    if (chave && !/^\d{44}$/.test(chave)) {
      return { ok: false, erro: `Chave de acesso inválida: ${chave.length} caracteres (esperado 44 dígitos numéricos). A DV não foi verificada — integração SEFAZ necessária.` };
    }

    return { ok: true, chave: chave || '(chave não encontrada no XML)', emitente, tomador, frete: Number.isFinite(frete) ? frete : 0 };
  } catch (e) {
    return { ok: false, erro: 'Erro ao processar XML: ' + e.message };
  }
}

// ─── Modal: Importar XML ──────────────────────────────────────────────────────
function ImportModal({ onClose, onImport }) {
  const [dragging,   setDragging]   = useState(false);
  const [file,       setFile]       = useState(null);
  const [processing, setProcessing] = useState(false);
  const [parseResult, setParseResult] = useState(null); // { ok, ...dados } | null
  const inputRef = useRef(null);

  const readFile = (f) => {
    if (!f || !f.name.endsWith('.xml')) return;
    setFile(f);
    setParseResult(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = parseCTeXML(e.target.result);
      setParseResult(result);
    };
    reader.readAsText(f, 'UTF-8');
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault(); setDragging(false);
    readFile(e.dataTransfer.files[0]);
  }, []);

  const handleProcess = () => {
    if (!parseResult) return;
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      onImport(file.name, parseResult);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
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
          {/* Aviso fiscal */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-[11px] text-amber-700 font-medium">
              <strong>Protótipo:</strong> O XML é lido e validado estruturalmente, mas a chave de acesso não é verificada contra a SEFAZ. Em produção, integre com webservice da Receita.
            </p>
          </div>

          <div onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={cn('flex flex-col items-center justify-center gap-4 p-8 rounded-2xl border-2 border-dashed cursor-pointer transition-all',
              dragging  ? 'border-orange-500 bg-orange-50' :
              file      ? (parseResult?.ok ? 'border-green-400 bg-green-50' : 'border-red-400 bg-red-50') :
              'border-slate-200 hover:border-orange-400 hover:bg-orange-50/30')}>
            <input ref={inputRef} type="file" accept=".xml" className="hidden" onChange={e => readFile(e.target.files[0])} />
            <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center',
              file ? (parseResult?.ok ? 'bg-green-100' : 'bg-red-100') : 'bg-orange-100')}>
              {file ? (parseResult?.ok ? <CheckCircle2 className="w-7 h-7 text-green-600" /> : <XCircle className="w-7 h-7 text-red-600" />) : <Upload className="w-7 h-7 text-orange-600" />}
            </div>
            {file ? (
              <div className="text-center">
                <p className="text-sm font-black text-slate-700">{file.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-sm font-black text-slate-700">Solte o arquivo XML aqui</p>
                <p className="text-xs text-slate-400 mt-1">ou <span className="text-orange-600 font-bold">clique para selecionar</span></p>
                <p className="text-[9px] text-slate-400 mt-2 uppercase tracking-widest">Apenas arquivos .XML do CT-e</p>
              </div>
            )}
          </div>

          {/* Resultado do parsing */}
          {parseResult && (
            parseResult.ok ? (
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl space-y-1">
                <p className="text-[10px] font-black text-green-700 uppercase tracking-widest">XML lido com sucesso</p>
                {parseResult.chave && <p className="text-[10px] font-mono text-slate-600 break-all">Chave: {parseResult.chave}</p>}
                {parseResult.emitente !== 'Desconhecido' && <p className="text-xs text-slate-600"><strong>Emitente:</strong> {parseResult.emitente}</p>}
                {parseResult.frete > 0 && <p className="text-xs text-slate-600"><strong>Frete:</strong> {parseResult.frete.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>}
                <p className="text-[10px] text-amber-600 font-bold mt-1">⚠️ Chave não verificada na SEFAZ (modo demo).</p>
              </div>
            ) : (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-[10px] font-black text-red-700 uppercase tracking-widest mb-1">Erro no XML</p>
                <p className="text-xs text-red-600">{parseResult.erro}</p>
              </div>
            )
          )}

          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-3 rounded-2xl border-2 border-slate-200 text-sm font-black text-slate-500 hover:bg-slate-50 transition-all uppercase tracking-wider">Cancelar</button>
            <button onClick={handleProcess} disabled={!file || !parseResult || processing}
              className="flex-1 py-3 rounded-2xl bg-orange-600 text-white text-sm font-black hover:opacity-90 active:scale-95 disabled:opacity-40 transition-all flex items-center justify-center gap-2">
              {processing ? <><RefreshCw className="w-4 h-4 animate-spin" />Importando…</> : <><Upload className="w-4 h-4" />Processar XML</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Modal: Vincular NF-e (D&D) com proteção anti-duplicidade ───────────────
function VincularNFeModal({ ctes, onClose, onVincular }) {
  const [droppedMap,   setDroppedMap]   = useState({});
  const [draggingNf,   setDraggingNf]   = useState(null);
  const [draggingOver, setDraggingOver] = useState(null);
  const [vinculando,   setVinculando]   = useState(false);
  const [dirty,        setDirty]        = useState(false);

  // NFs já vinculadas em qualquer CT-e no droppedMap atual
  const allDropped = useMemo(() => new Set(Object.values(droppedMap).flat()), [droppedMap]);
  const available  = useMemo(() => NFE_DISPONIVEIS.filter(nf => !allDropped.has(nf.id)), [allDropped]);
  const totalVinculos = allDropped.size;

  const handleDrop = (cteId) => {
    if (!draggingNf) return;
    // Impede vincular NF já presente em outro CT-e
    if (allDropped.has(draggingNf.id)) { setDraggingNf(null); setDraggingOver(null); return; }
    setDroppedMap(prev => ({ ...prev, [cteId]: [...(prev[cteId] || []), draggingNf.id] }));
    setDirty(true);
    setDraggingNf(null); setDraggingOver(null);
  };

  const removeVinculo = (cteId, nfId) => {
    setDroppedMap(prev => ({ ...prev, [cteId]: (prev[cteId] || []).filter(id => id !== nfId) }));
    setDirty(true);
  };

  const handleClose = () => {
    if (dirty && totalVinculos > 0 && !window.confirm('Há vínculos não confirmados. Fechar e descartar?')) return;
    onClose();
  };

  const handleConfirmar = () => {
    setVinculando(true);
    setTimeout(() => { onVincular(droppedMap); onClose(); }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" role="dialog">
      <div className="bg-white dark:bg-slate-900 rounded-[28px] border-2 border-slate-100 shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-gradient-to-r from-blue-700 to-blue-600 px-7 py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <Link2 className="w-6 h-6 text-white" />
            <div>
              <p className="text-[9px] font-black text-white/60 uppercase tracking-widest">CT-e — Vinculação Fiscal</p>
              <h2 className="text-base font-black text-white uppercase">Vincular NF-e ao CT-e</h2>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black text-white/60">{totalVinculos} vínculo(s) pendente(s)</span>
            <button onClick={handleClose} className="text-white/50 hover:text-white"><X className="w-5 h-5" /></button>
          </div>
        </div>
        <div className="p-4 flex-1 overflow-hidden">
          <p className="text-[10px] text-slate-400 font-bold text-center mb-4 uppercase tracking-widest flex items-center justify-center gap-2">
            <ArrowRight className="w-3.5 h-3.5" />
            Arraste as NF-es para o CT-e correspondente (cada NF pode ser vinculada a apenas 1 CT-e)
          </p>
          <div className="flex gap-4 h-[420px]">
            <div className="w-56 flex flex-col gap-2 overflow-y-auto">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest pb-1 border-b border-slate-200">
                NF-es Disponíveis ({available.length})
              </p>
              {available.length === 0 && (
                <div className="flex flex-col items-center justify-center flex-1 gap-2 py-8">
                  <CheckSquare className="w-8 h-8 text-green-500" />
                  <p className="text-xs font-black text-green-600">Todas as NF-es vinculadas!</p>
                </div>
              )}
              {available.map(nf => (
                <div key={nf.id} draggable
                  onDragStart={() => setDraggingNf(nf)} onDragEnd={() => setDraggingNf(null)}
                  className={cn('p-3 rounded-xl border-2 cursor-grab active:cursor-grabbing transition-all select-none',
                    draggingNf?.id === nf.id ? 'border-blue-500 bg-blue-50 opacity-60 scale-95' : 'border-slate-200 bg-white hover:border-blue-400 hover:shadow-md')}>
                  <div className="flex items-center justify-between mb-1">
                    <code className="text-[11px] font-black text-blue-600">{nf.numero}</code>
                    <span className="text-[9px] font-bold text-slate-400">{nf.volume} vol.</span>
                  </div>
                  <p className="text-[10px] text-slate-500 truncate">{nf.destinatario}</p>
                  <p className="text-[10px] font-black text-slate-700 mt-0.5">{nf.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                </div>
              ))}
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest pb-1 border-b border-slate-200">CT-es de Embarque</p>
              {ctes.filter(c => c.status !== 'Erro XML').map(cte => {
                const vinculados = droppedMap[cte.id] || [];
                const isOver = draggingOver === cte.id;
                return (
                  <div key={cte.id}
                    onDragOver={e => { e.preventDefault(); setDraggingOver(cte.id); }}
                    onDragLeave={() => setDraggingOver(null)}
                    onDrop={() => handleDrop(cte.id)}
                    className={cn('rounded-2xl border-2 p-4 transition-all',
                      isOver ? 'border-blue-500 bg-blue-50 scale-[1.01] shadow-lg' :
                      vinculados.length > 0 ? 'border-blue-200 bg-blue-50/30' :
                      'border-slate-200 bg-white dark:bg-slate-800')}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <code className="text-sm font-black text-blue-600">{cte.numero}</code>
                        <p className="text-xs text-slate-500 mt-0.5">{cte.emitente}</p>
                        <p className="text-[9px] font-mono text-slate-400 truncate max-w-[240px]">{cte.chave}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-slate-800 dark:text-white">
                          {cte.frete.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          {cte.frete === 0 && <span className="ml-1 text-[9px] text-amber-500 font-bold">⚠️ Frete zero</span>}
                        </p>
                        <StatusBadge status={cte.status} />
                      </div>
                    </div>
                    <div className={cn('min-h-[48px] rounded-xl p-2 flex flex-wrap gap-2 transition-all',
                      isOver ? 'bg-blue-100' : 'bg-slate-50 dark:bg-slate-700/30')}>
                      {vinculados.length === 0 && (
                        <p className="text-[9px] text-slate-400 font-bold italic m-auto">{isOver ? '↓ Solte a NF-e aqui' : 'Nenhuma NF-e vinculada'}</p>
                      )}
                      {vinculados.map(nfId => {
                        const nf = NFE_DISPONIVEIS.find(n => n.id === nfId);
                        return nf ? (
                          <div key={nfId} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-black">
                            <FileText className="w-3 h-3" />{nf.numero}
                            <button onClick={() => removeVinculo(cte.id, nfId)} className="ml-0.5 hover:text-red-300" title="Remover vínculo">
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
        <div className="shrink-0 px-7 py-4 border-t border-slate-100 flex gap-3">
          <button onClick={handleClose} className="flex-1 py-3 rounded-2xl border-2 border-slate-200 text-sm font-black text-slate-500 hover:bg-slate-50 transition-all">Cancelar</button>
          <button onClick={handleConfirmar} disabled={totalVinculos === 0 || vinculando}
            className="flex-1 py-3 rounded-2xl bg-blue-600 text-white text-sm font-black hover:opacity-90 active:scale-95 disabled:opacity-40 transition-all flex items-center justify-center gap-2">
            {vinculando ? <><RefreshCw className="w-4 h-4 animate-spin" />Vinculando…</> : <><Link2 className="w-4 h-4" />Confirmar {totalVinculos} Vínculo(s)</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Gaveta lateral: Histórico (log dinâmico) ─────────────────────────────────
function HistoricoDrawer({ log, onClose }) {
  const [selected, setSelected] = useState(log[0] ?? null);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (log.length > 0 && !selected) setSelected(log[0]); }, [log]);

  const timelineSteps = (item) => [
    { event: 'Arquivo XML recebido e lido', done: item.status !== null },
    { event: 'Validação estrutural do XML',  done: item.status !== 'Erro XML' },
    { event: 'Registro no sistema',          done: item.status !== 'Erro XML' },
    { event: 'Vinculação com NF-e',          done: ['Autorizado (Mock)','Vinculado'].includes(item.status) },
    { event: 'Transmissão SEFAZ ⚠️ (simulada)', done: item.status === 'Autorizado (Mock)' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/50" onClick={onClose} />
      <div className="w-[460px] bg-white dark:bg-slate-900 border-l-2 border-slate-200 dark:border-slate-800 flex flex-col h-full shadow-2xl">
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <ClipboardList className="w-5 h-5 text-orange-400" />
            <h2 className="text-sm font-black text-white uppercase">Histórico de Importações</h2>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        {log.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-8 text-slate-400 text-sm font-medium">Nenhuma importação registrada nesta sessão.</div>
        ) : (
          <div className="flex flex-1 overflow-hidden">
            <div className="w-44 border-r border-slate-100 dark:border-slate-800 overflow-y-auto">
              {log.map(item => (
                <button key={item.id} onClick={() => setSelected(item)}
                  className={cn('w-full text-left p-3 border-b border-slate-50 dark:border-slate-800 transition-all',
                    selected?.id === item.id ? 'bg-slate-100 dark:bg-slate-800' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50')}>
                  <code className="text-[10px] font-black text-slate-700 dark:text-slate-300 block">{item.cte}</code>
                  <p className="text-[9px] text-slate-500 truncate">{item.transportadora}</p>
                  <div className="mt-1"><StatusBadge status={item.status} /></div>
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {selected && (
                <>
                  <div className="space-y-3">
                    <div>
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">CT-e</p>
                      <code className="text-xl font-black text-slate-800 dark:text-white">{selected.cte}</code>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {[{ l:'Transportadora', v:selected.transportadora },{ l:'Data Importação', v:selected.dtImport }].map(f => (
                        <div key={f.l} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{f.l}</p>
                          <p className="text-[11px] font-black text-slate-700 dark:text-slate-300 mt-0.5">{f.v}</p>
                        </div>
                      ))}
                    </div>
                    <div><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p><StatusBadge status={selected.status} /></div>
                  </div>
                  <div className="border-t border-slate-100 pt-4">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><Info className="w-3.5 h-3.5" />Log</p>
                    <div className={cn('p-4 rounded-2xl border text-xs font-medium leading-relaxed',
                      selected.status === 'Erro XML'
                        ? 'bg-red-50 border-red-200 text-red-700'
                        : 'bg-green-50 border-green-200 text-green-700')}>
                      {selected.log}
                    </div>
                  </div>
                  <div className="border-t border-slate-100 pt-4 space-y-3">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Timeline</p>
                    {timelineSteps(selected).map((step, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className={cn('w-5 h-5 rounded-full flex items-center justify-center shrink-0',
                          step.done ? 'bg-green-500' : 'bg-slate-200 dark:bg-slate-700')}>
                          {step.done ? <CheckCircle2 className="w-3 h-3 text-white" /> : <Clock className="w-3 h-3 text-slate-400" />}
                        </div>
                        <span className={cn('text-xs font-bold', step.done ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400')}>{step.event}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function CTeControl() {
  const [ctes,          setCtes]          = useState(INITIAL_CTES);
  const [auditLog,      setAuditLog]      = useState([]); // log dinâmico real
  const [selectedId,    setSelectedId]    = useState(null);
  const [showImport,    setShowImport]    = useState(false);
  const [showVincular,  setShowVincular]  = useState(false);
  const [showHistorico, setShowHistorico] = useState(false);
  const [filterTransp,  setFilterTransp]  = useState('');
  const [filterStatus,  setFilterStatus]  = useState('Todos');
  const [filterChave,   setFilterChave]   = useState('');
  const [showStatusDrop, setShowStatusDrop] = useState(false);
  const [erroDetalheId, setErroDetalheId] = useState(null); // ID do CT-e com popup de erro aberto

  // Fecha dropdown ao clicar fora
  const dropRef = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setShowStatusDrop(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = useMemo(() => ctes.filter(c => {
    if (filterStatus !== 'Todos' && c.status !== filterStatus) return false;
    if (filterTransp && !c.emitente.toLowerCase().includes(filterTransp.toLowerCase())) return false;
    if (filterChave  && !c.chave.includes(filterChave) && !c.numero.toLowerCase().includes(filterChave.toLowerCase())) return false;
    return true;
  }), [ctes, filterStatus, filterTransp, filterChave]);

  const kpiTotals = useMemo(() =>
    Object.keys(STATUS_CFG).reduce((acc, s) => { acc[s] = ctes.filter(c => c.status === s).length; return acc; }, {}),
  [ctes]);

  const handleImport = (filename, parseResult) => {
    const numero = nextNumero(ctes);
    const status = parseResult.ok ? 'Aguardando' : 'Erro XML';
    const novo = {
      id:          ctes.length + Date.now(), // evita colisão
      numero,
      chave:       parseResult.chave || `(chave não lida — ${filename})`,
      emitente:    parseResult.emitente ?? 'Desconhecido',
      tomador:     parseResult.tomador  ?? 'VerticalParts Matriz',
      frete:       parseResult.frete    ?? 0,
      status,
      nfesVinculadas: [],
      erroDetalhe: parseResult.ok ? null : parseResult.erro,
    };
    setCtes(prev => [novo, ...prev]);
    const logEntry = makeLogEntry(
      numero, novo.emitente, status,
      parseResult.ok
        ? `Arquivo "${filename}" importado. XML lido com sucesso. Aguardando vinculação com NF-e e transmissão SEFAZ.`
        : `Arquivo "${filename}" processado com ERRO: ${parseResult.erro}`
    );
    setAuditLog(prev => [logEntry, ...prev]);
  };

  const handleVincular = (mapVinculos) => {
    setCtes(prev => prev.map(c => {
      const novosIds = (mapVinculos[c.id] || []);
      if (!novosIds.length) return c;
      const novosNums = novosIds.map(id => NFE_DISPONIVEIS.find(n => n.id === id)?.numero).filter(Boolean);
      return { ...c, nfesVinculadas: [...c.nfesVinculadas, ...novosNums], status: 'Vinculado' };
    }));
    const totalVinc = Object.values(mapVinculos).flat().length;
    const logEntry  = makeLogEntry('(múltiplos)', '—', 'Vinculado', `${totalVinc} NF-e(s) vinculada(s) manualmente.`);
    setAuditLog(prev => [logEntry, ...prev]);
  };

  const limparFiltros = () => { setFilterChave(''); setFilterTransp(''); setFilterStatus('Todos'); setShowStatusDrop(false); };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 space-y-5 pb-20">

      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-[32px] border-2 border-slate-100 dark:border-slate-800 p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500" />
        <div className="flex flex-col md:flex-row items-start md:items-center gap-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-3xl bg-orange-600 flex items-center justify-center shadow-lg">
              <Scroll className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Módulo Fiscal — Cat. 6</p>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase">5.2 Gerenciar CT-e</h1>
              <p className="text-xs text-slate-400 font-medium">Conhecimento de Transporte Eletrônico — Controle e Vinculação com NF-e</p>
            </div>
          </div>
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2 md:ml-4">
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-[10px] text-amber-700 font-medium">
              <strong>Protótipo:</strong> Status "Autorizado (Mock)" não representa integração real com SEFAZ. Dados para demonstração.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 md:ml-auto">
            {Object.entries(STATUS_CFG).map(([key, def]) => kpiTotals[key] > 0 && (
              <button key={key} onClick={() => setFilterStatus(filterStatus === key ? 'Todos' : key)}
                className={cn('flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border-2 transition-all',
                  filterStatus === key ? def.color + ' border-current/30 scale-105 shadow-md' : 'bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:scale-105')}>
                <div className={cn('w-2 h-2 rounded-full', def.dot)} />{kpiTotals[key]} {key}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-100 dark:border-slate-800 px-5 py-3 flex flex-wrap gap-2 shadow-sm">
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
          <PanelRightOpen className="w-3.5 h-3.5" />Histórico ({auditLog.length})
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-100 dark:border-slate-800 px-5 py-4 flex flex-wrap items-center gap-3 shadow-sm">
        <Filter className="w-4 h-4 text-slate-400 shrink-0" />
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3" />
          <input value={filterChave} onChange={e => setFilterChave(e.target.value)} placeholder="Chave ou Nº CT-e…"
            className="pl-9 pr-4 py-1.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:border-orange-400 transition-all w-48" />
        </div>
        <div className="relative flex items-center">
          <Truck className="w-3.5 h-3.5 text-slate-400 absolute left-3" />
          <input value={filterTransp} onChange={e => setFilterTransp(e.target.value)} placeholder="Transportadora…"
            className="pl-9 pr-4 py-1.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:border-orange-400 transition-all w-44" />
        </div>
        <div className="relative" ref={dropRef}>
          <button onClick={() => setShowStatusDrop(p => !p)}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold hover:border-orange-400 transition-all">
            {filterStatus} <ChevronDown className={cn('w-3 h-3 text-slate-400 transition-transform', showStatusDrop && 'rotate-180')} />
          </button>
          {showStatusDrop && (
            <div className="absolute top-full mt-1 left-0 w-40 bg-white dark:bg-slate-900 rounded-xl border-2 border-slate-100 shadow-xl z-20 overflow-hidden">
              {['Todos', ...Object.keys(STATUS_CFG)].map(s => (
                <button key={s} onClick={() => { setFilterStatus(s); setShowStatusDrop(false); }}
                  className={cn('w-full text-left px-4 py-2.5 text-xs font-bold border-b border-slate-50 last:border-0 transition-colors',
                    filterStatus === s ? 'bg-orange-100 text-orange-700' : 'text-slate-600 hover:bg-slate-50')}>
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
        <button onClick={limparFiltros} className="flex items-center gap-1.5 text-xs font-black text-slate-400 hover:text-red-500 transition-all">
          <X className="w-3.5 h-3.5" />Limpar
        </button>
        <span className="ml-auto text-[10px] font-black text-slate-400">{filtered.length} registros</span>
      </div>

      {/* Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-[28px] border-2 border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800 border-b-2 border-slate-100 dark:border-slate-700">
              {['', 'Nº CT-e','Chave de Acesso','Emitente (Transportadora)','Tomador','Valor do Frete','NF-es Vinculadas','Status'].map((h, i) => (
                <th key={i} className="p-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="p-12 text-center text-slate-400 text-sm font-medium">Nenhum CT-e encontrado.</td></tr>
            )}
            {filtered.map(cte => {
              const isSel = cte.id === selectedId;
              return (
                <tr key={cte.id} onClick={() => setSelectedId(cte.id === selectedId ? null : cte.id)}
                  className={cn('border-t border-slate-100 dark:border-slate-800 cursor-pointer transition-all group',
                    cte.status === 'Erro XML' && 'bg-red-50/40 dark:bg-red-950/10',
                    isSel ? 'bg-orange-50/40 border-l-4 border-l-orange-400' : 'hover:bg-slate-50 border-l-4 border-l-transparent')}>
                  <td className="p-4"><div className={cn('w-2 h-2 rounded-full mx-auto', isSel ? 'bg-orange-400 scale-150' : 'bg-transparent')} /></td>
                  <td className="p-4"><code className="text-sm font-black text-orange-600">{cte.numero}</code></td>
                  <td className="p-4 max-w-[160px]"><code className="text-[9px] font-mono text-slate-500 truncate block">{cte.chave}</code></td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Truck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{cte.emitente}</span>
                    </div>
                  </td>
                  <td className="p-4 text-xs font-medium text-slate-600 dark:text-slate-400">{cte.tomador}</td>
                  <td className="p-4 text-xs font-black text-slate-800 dark:text-white tabular-nums whitespace-nowrap">
                    {cte.frete.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    {cte.frete === 0 && <span className="ml-1 text-[9px] text-amber-500 font-bold">⚠️</span>}
                  </td>
                  <td className="p-4">
                    {cte.nfesVinculadas.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {cte.nfesVinculadas.map(nf => (
                          <code key={nf} className="text-[9px] font-black text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-1.5 py-0.5 rounded-md">{nf}</code>
                        ))}
                      </div>
                    ) : <span className="text-[10px] text-slate-400 italic">Sem NF-e</span>}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={cte.status} />
                      {cte.status === 'Erro XML' && (
                        <button onClick={e => { e.stopPropagation(); setErroDetalheId(cte.id === erroDetalheId ? null : cte.id); }}
                          aria-label="Ver detalhes do erro"
                          className="p-1 rounded-lg text-red-500 hover:bg-red-50 transition-all">
                          <AlertTriangle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    {erroDetalheId === cte.id && cte.erroDetalhe && (
                      <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-xl max-w-xs">
                        <p className="text-[10px] font-bold text-red-700">{cte.erroDetalhe}</p>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showImport    && <ImportModal    onClose={() => setShowImport(false)} onImport={handleImport} />}
      {showVincular  && <VincularNFeModal ctes={ctes} onClose={() => setShowVincular(false)} onVincular={handleVincular} />}
      {showHistorico && <HistoricoDrawer log={auditLog} onClose={() => setShowHistorico(false)} />}
    </div>
  );
}
