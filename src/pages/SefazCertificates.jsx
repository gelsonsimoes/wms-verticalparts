import React, { useState, useRef, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Upload,
  Eye,
  EyeOff,
  RefreshCw,
  Wifi,
  WifiOff,
  Clock,
  Building2,
  Key,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Radio,
  Server,
  Activity,
  Lock,
  FileKey,
  Loader2,
  TriangleAlert,
  Zap,
  Globe,
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...i) { return twMerge(clsx(i)); }

// ─── DATA DE HOJE ────────────────────────────────────────────────────
const TODAY = new Date('2026-02-22T18:46:21');

// ─── CERTIFICADO ATUAL (mock — vence em 25 dias → banner amarelo) ────
const CERT_ATUAL = {
  cnpj:     '14.982.704/0001-05',
  titular:  'VERTICAL PARTS LOGÍSTICA LTDA',
  emitente: 'AC SEFAZ-SP v5',
  serie:    '4A:9F:2B:88:CD:11:EE:04:AB:CD:EF',
  emissao:  new Date('2025-03-19'),
  validade: new Date('2026-03-19'), // 25 dias a partir de hoje
};

const diasParaVencer = Math.ceil((CERT_ATUAL.validade - TODAY) / (1000 * 60 * 60 * 24));

// ─── ENDPOINTS SEFAZ ──────────────────────────────────────────────────
const ENDPOINTS_INIT = [
  // Produção
  { id:'p_rec',    amb:'Produção',     servico:'NFeRecepcao',              url:'https://nfe.fazenda.sp.gov.br/ws/NfeRecepcao2.asmx',           status:'online',  ms: 112 },
  { id:'p_ret',    amb:'Produção',     servico:'NFeRetAutorizacao',        url:'https://nfe.fazenda.sp.gov.br/ws/NFeRetAutorizacao.asmx',       status:'online',  ms: 89  },
  { id:'p_can',    amb:'Produção',     servico:'NFeCancelamento',          url:'https://nfe.fazenda.sp.gov.br/ws/NfeCancelamento2.asmx',        status:'online',  ms: 98  },
  { id:'p_inu',    amb:'Produção',     servico:'NFeInutilizacao',          url:'https://nfe.fazenda.sp.gov.br/ws/NfeInutilizacao2.asmx',        status:'online',  ms: 103 },
  { id:'p_stat',   amb:'Produção',     servico:'NFeStatusServico',         url:'https://nfe.fazenda.sp.gov.br/ws/NfeStatusServico2.asmx',       status:'online',  ms: 75  },
  // Homologação
  { id:'h_rec',    amb:'Homologação',  servico:'NFeRecepcao',              url:'https://homologacao.nfe.fazenda.sp.gov.br/ws/NfeRecepcao2.asmx',status:'online',  ms: 210 },
  { id:'h_ret',    amb:'Homologação',  servico:'NFeRetAutorizacao',        url:'https://homologacao.nfe.fazenda.sp.gov.br/ws/NFeRetAutorizacao.asmx', status:'offline', ms: null },
  { id:'h_can',    amb:'Homologação',  servico:'NFeCancelamento',          url:'https://homologacao.nfe.fazenda.sp.gov.br/ws/NfeCancelamento2.asmx', status:'online',  ms: 195 },
  { id:'h_inu',    amb:'Homologação',  servico:'NFeInutilizacao',          url:'https://homologacao.nfe.fazenda.sp.gov.br/ws/NfeInutilizacao2.asmx', status:'online',  ms: 188 },
];

// ─── HISTÓRICO DE TESTES ──────────────────────────────────────────────
const HISTORICO_INIT = [
  { id:1, quando:'22/02/2026 12:00', resultado:'7/8 online', duracao:'4.2s', tipo:'Manual' },
  { id:2, quando:'20/02/2026 08:00', resultado:'8/8 online', duracao:'3.8s', tipo:'Auto'   },
];

// ─── PAINEL DO CERTIFICADO ───────────────────────────────────────────
function PainelCertificado() {
  const [arquivoPfx,   setArquivoPfx]   = useState(null);
  const [senha,        setSenha]         = useState('');
  const [showPass,     setShowPass]      = useState(false);
  const [uploading,    setUploading]     = useState(false);
  const [uploadMsg,    setUploadMsg]     = useState(null);
  const [dragOver,     setDragOver]      = useState(false);
  const fileRef = useRef();
  const [blink, setBlink] = useState(true);
  useEffect(() => { const t = setInterval(() => setBlink(b => !b), 800); return () => clearInterval(t); }, []);

  const handleFile = (f) => {
    if (!f) return;
    if (!f.name.endsWith('.pfx')) { setUploadMsg({ ok: false, msg: 'Arquivo inválido. Selecione um .pfx.' }); return; }
    setArquivoPfx(f);
    setUploadMsg(null);
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  };

  const handleUpload = () => {
    if (!arquivoPfx) { setUploadMsg({ ok: false, msg: 'Selecione um arquivo .pfx.' }); return; }
    if (!senha)      { setUploadMsg({ ok: false, msg: 'Informe a senha do certificado.' }); return; }
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      setUploadMsg({ ok: true, msg: 'Certificado carregado e validado com sucesso!' });
      setArquivoPfx(null);
      setSenha('');
    }, 2200);
  };

  const isVencido  = diasParaVencer <= 0;
  const isAlerta   = diasParaVencer > 0 && diasParaVencer <= 30;

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* ── BANNER DE ALERTA ── */}
      {isVencido && (
        <div className={cn('rounded-2xl border-2 px-4 py-3 flex items-center gap-3 shadow-lg',
          'bg-red-50 border-red-400 dark:bg-red-950/30 dark:border-red-700')}>
          <ShieldX className="w-5 h-5 text-red-600 shrink-0" aria-hidden="true" />
          <div>
            <p className="text-xs font-black text-red-700 dark:text-red-400">⛔ CERTIFICADO VENCIDO!</p>
            <p className="text-[10px] text-red-600/80 dark:text-red-500/80">As emissões de NF-e estão bloqueadas. Carregue um novo certificado imediatamente.</p>
          </div>
        </div>
      )}
      {isAlerta && !isVencido && (
        <div className={cn('rounded-2xl border-2 px-4 py-3 flex items-center gap-3 shadow-lg transition-all',
          blink ? 'bg-amber-50 border-amber-400 dark:bg-amber-950/30 dark:border-amber-700' : 'bg-amber-100 border-amber-500 dark:bg-amber-900/40 dark:border-amber-600')}>
          <TriangleAlert className="w-5 h-5 text-amber-600 shrink-0" aria-hidden="true" />
          <div>
            <p className="text-xs font-black text-amber-700 dark:text-amber-400">⚠ Certificado vence em {diasParaVencer} dia{diasParaVencer !== 1 ? 's' : ''}!</p>
            <p className="text-[10px] text-amber-600/80 dark:text-amber-500/80">Renove antes de {CERT_ATUAL.validade.toLocaleDateString('pt-BR')} para evitar interrupção das emissões.</p>
          </div>
        </div>
      )}

      {/* ── INFORMAÇÕES DO CERTIFICADO ATUAL ── */}
      <div className="bg-white dark:bg-slate-900 rounded-[24px] border-2 border-slate-100 dark:border-slate-800 p-6 shadow-sm space-y-4 flex-shrink-0">
        <div className="flex items-center gap-2 mb-1">
          <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center',
            isVencido ? 'bg-red-100 dark:bg-red-900/30' : isAlerta ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-green-100 dark:bg-green-900/30')}>
            {isVencido ? <ShieldX className="w-4 h-4 text-red-600" /> : isAlerta ? <ShieldAlert className="w-4 h-4 text-amber-600" /> : <ShieldCheck className="w-4 h-4 text-green-600" />}
          </div>
          <p className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">Certificado Digital Atual</p>
          <span className={cn('ml-auto text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider',
            isVencido ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            : isAlerta ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
            : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
          )}>{isVencido ? '🔴 Vencido' : isAlerta ? '🟡 Expirando' : '🟢 Válido'}</span>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {/* CNPJ */}
          <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 space-y-1">
            <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">
              <Building2 className="w-3 h-3" aria-hidden="true" />CNPJ Vinculado
            </div>
            <p className="text-base font-black text-slate-800 dark:text-white tracking-widest">{CERT_ATUAL.cnpj}</p>
          </div>
          {/* Titular */}
          <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 space-y-1">
            <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">
              <FileKey className="w-3 h-3" aria-hidden="true" />Titular do Certificado
            </div>
            <p className="text-sm font-black text-slate-800 dark:text-white">{CERT_ATUAL.titular}</p>
            <p className="text-[10px] text-slate-500 font-medium">Emitente: {CERT_ATUAL.emitente}</p>
          </div>
          {/* Validade */}
          <div className={cn('rounded-2xl p-4 space-y-1 border-2',
            isVencido ? 'bg-red-50  dark:bg-red-950/20  border-red-200  dark:border-red-800/40'
            : isAlerta ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-700/40'
            : 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800/40'
          )}>
            <div className={cn('flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest',
              isVencido ? 'text-red-500' : isAlerta ? 'text-amber-600 dark:text-amber-400' : 'text-green-600')}>
              <Calendar className="w-3 h-3" aria-hidden="true" />Data de Validade
            </div>
            <p className={cn('text-lg font-black', isVencido ? 'text-red-700 dark:text-red-400' : isAlerta ? 'text-amber-700 dark:text-amber-400' : 'text-green-700 dark:text-green-400')}>
              {CERT_ATUAL.validade.toLocaleDateString('pt-BR')}
            </p>
            <p className={cn('text-[10px] font-bold', isVencido ? 'text-red-500' : isAlerta ? 'text-amber-600 dark:text-amber-500' : 'text-green-600')}>
              {isVencido ? `Vencido há ${Math.abs(diasParaVencer)} dia(s)` : `Expira em ${diasParaVencer} dia(s)`}
            </p>
            {/* Barra de vida */}
            <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mt-2">
              <div className={cn('h-full rounded-full transition-all',
                isVencido ? 'bg-red-500' : isAlerta ? 'bg-amber-500' : 'bg-green-500'
              )} style={{ width: isVencido ? '100%' : `${Math.max(5, (diasParaVencer / 365) * 100)}%` }} />
            </div>
            <p className="text-[8px] text-slate-400">Emissão: {CERT_ATUAL.emissao.toLocaleDateString('pt-BR')} · Série: {CERT_ATUAL.serie.slice(0,17)}...</p>
          </div>
        </div>
      </div>

      {/* ── UPLOAD DE NOVO CERTIFICADO ── */}
      <div className="bg-white dark:bg-slate-900 rounded-[24px] border-2 border-slate-100 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Upload className="w-4 h-4 text-secondary" />
          <p className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">Carregar Novo Certificado</p>
        </div>

        {/* Drop Zone */}
        <div
          onClick={() => fileRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={cn('border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all',
            dragOver ? 'border-secondary bg-secondary/5 scale-[1.01]' : arquivoPfx ? 'border-green-500 bg-green-50 dark:bg-green-950/20' : 'border-slate-300 dark:border-slate-700 hover:border-secondary hover:bg-slate-50 dark:hover:bg-slate-800'
          )}>
          <input ref={fileRef} type="file" accept=".pfx" className="hidden" onChange={e => handleFile(e.target.files?.[0])} />
          {arquivoPfx ? (
            <>
              <FileKey className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-xs font-black text-green-700 dark:text-green-400">{arquivoPfx.name}</p>
              <p className="text-[9px] text-green-600 font-medium">{(arquivoPfx.size / 1024).toFixed(1)} KB · .pfx detectado</p>
            </>
          ) : (
            <>
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-500">Clique ou arraste o arquivo</p>
              <p className="text-[9px] text-slate-400 mt-1">Apenas arquivos <strong>.pfx</strong> (Certificado A1)</p>
            </>
          )}
        </div>

        {/* Senha */}
        <div className="space-y-1.5">
          <label htmlFor="cert-senha" className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
            <Lock className="w-3 h-3" aria-hidden="true" />Senha do Certificado
          </label>
          <div className="relative">
            <input
              id="cert-senha"
              type={showPass ? 'text' : 'password'} value={senha} onChange={e => setSenha(e.target.value)}
              placeholder="Senha do arquivo .pfx..."
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-secondary rounded-xl text-sm font-bold outline-none transition-all pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPass(v => !v)}
              aria-label={showPass ? 'Ocultar senha' : 'Mostrar senha'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showPass ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
            </button>
          </div>
        </div>

        {/* Mensagem feedback */}
        {uploadMsg && (
          <div className={cn('flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-black',
            uploadMsg.ok ? 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400'
          )} role="alert">
            {uploadMsg.ok
              ? <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
              : <XCircle className="w-4 h-4 shrink-0" aria-hidden="true" />}
            {uploadMsg.msg}
          </div>
        )}

        {/* Botão */}
        <button onClick={handleUpload} disabled={uploading}
          className={cn('w-full py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 uppercase tracking-widest transition-all shadow-md',
            uploading ? 'bg-slate-200 dark:bg-slate-800 text-slate-500 cursor-wait'
            : 'bg-gradient-to-r from-secondary to-amber-600 text-primary hover:scale-[1.01] hover:shadow-lg active:scale-[0.98]'
          )}>
          {uploading ? <><Loader2 className="w-4 h-4 animate-spin" />Validando...</> : <><Upload className="w-4 h-4" />Carregar Certificado</>}
        </button>
      </div>
    </div>
  );
}

// ─── PAINEL SEFAZ ───────────────────────────────────────────────────
function PainelSefaz() {
  const [endpoints, setEndpoints]   = useState(ENDPOINTS_INIT);
  const [testando,  setTestando]    = useState(false);
  const [testIdx,   setTestIdx]     = useState(-1);
  const [historico, setHistorico]   = useState(HISTORICO_INIT);
  const [ultimoTeste, setUltimoTeste] = useState(null);
  const [ambFiltro, setAmbFiltro]   = useState('Todos');

  const intervalRef = useRef(null);
  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  const testar = () => {
    setTestando(true);
    setTestIdx(0);
    let idx = 0;
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      idx++;
      setTestIdx(idx);
      if (idx >= endpoints.length) {
        clearInterval(intervalRef.current);
        const novoStatus = endpoints.map(ep => ({
          ...ep,
          status: Math.random() < 0.85 ? 'online' : 'offline',
          ms: ep.status === 'online' ? Math.floor(Math.random() * 200 + 60) : null,
        }));
        setEndpoints(novoStatus);
        const online = novoStatus.filter(e => e.status === 'online').length;
        const agora  = new Date().toLocaleString('pt-BR', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' });
        setUltimoTeste({ online, total: novoStatus.length, agora });
        setHistorico(h => [{
          id: h.length + 1,
          quando: agora,
          resultado: `${online}/${novoStatus.length} online`,
          duracao: `${(Math.random() * 3 + 2).toFixed(1)}s`,
          tipo: 'Manual',
        }, ...h]);
        setTestando(false);
        setTestIdx(-1);
      }
    }, 280);
  };

  const filtered = ambFiltro === 'Todos' ? endpoints : endpoints.filter(e => e.amb === ambFiltro);
  const onlineCount  = endpoints.filter(e => e.status === 'online').length;
  const offlineCount = endpoints.filter(e => e.status === 'offline').length;
  const allOnline    = offlineCount === 0;

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* ── STATUS GERAL ── */}
      <div className="bg-white dark:bg-slate-900 rounded-[24px] border-2 border-slate-100 dark:border-slate-800 p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn('w-10 h-10 rounded-2xl flex items-center justify-center', allOnline ? 'bg-green-100 dark:bg-green-900/30' : 'bg-amber-100 dark:bg-amber-900/30')}>
              {allOnline ? <Wifi className="w-5 h-5 text-green-600" /> : <WifiOff className="w-5 h-5 text-amber-600" />}
            </div>
            <div>
              <p className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">Comunicação SEFAZ</p>
              <p className={cn('text-[10px] font-bold', allOnline ? 'text-green-600' : 'text-amber-600')}>
                {allOnline ? 'Todos os serviços Online' : `${offlineCount} serviço(s) Offline`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-2xl font-black text-green-600">{onlineCount}<span className="text-slate-300 dark:text-slate-600 text-lg">/{endpoints.length}</span></p>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Online</p>
            </div>
          </div>
        </div>
        {ultimoTeste && (
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-[10px] text-slate-400">
            <Clock className="w-3 h-3" />
            <span>Último teste: <strong className="text-slate-600 dark:text-slate-300">{ultimoTeste.agora}</strong> — {ultimoTeste.online}/{ultimoTeste.total} online</span>
          </div>
        )}
      </div>

      {/* ── FILTRO + BOTÃO TESTAR ── */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-1.5">
          {['Todos','Produção','Homologação'].map(a => (
            <button key={a} onClick={() => setAmbFiltro(a)}
              className={cn('px-3 py-1.5 rounded-xl text-[10px] font-black transition-all uppercase tracking-wider',
                ambFiltro === a ? 'bg-secondary text-primary shadow-md' : 'bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-secondary'
              )}>{a}</button>
          ))}
        </div>
        <button onClick={testar} disabled={testando}
          className={cn('ml-auto flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-md',
            testando ? 'bg-slate-200 dark:bg-slate-800 text-slate-500 cursor-wait'
            : 'bg-gradient-to-r from-blue-700 to-blue-600 text-white hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] shadow-blue-900/30'
          )}>
          {testando ? <><Loader2 className="w-4 h-4 animate-spin" />Testando ({testIdx}/{endpoints.length})...</>
          : <><Radio className="w-4 h-4" />Testar Comunicação SEFAZ</>}
        </button>
      </div>

      {/* ── GRID DE ENDPOINTS ── */}
      <div className="bg-white dark:bg-slate-900 rounded-[24px] border-2 border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800 border-b-2 border-slate-100 dark:border-slate-700">
              {['Status','Ambiente','Serviço SEFAZ','URL do Endpoint','Latência'].map(h => (
                <th key={h} scope="col" className="p-3 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((ep, i) => {
              const isOnline  = ep.status === 'online';
              const isTesting = testando && testIdx === i;
              const isProd    = ep.amb === 'Produção';
              return (
                <tr key={ep.id} className={cn('border-t border-slate-100 dark:border-slate-800 transition-all border-l-4',
                  isTesting ? 'bg-blue-50 dark:bg-blue-950/10 border-l-blue-500 animate-pulse'
                  : isOnline ? 'border-l-green-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  : 'border-l-red-500 bg-red-50/30 dark:bg-red-950/10'
                )}>
                  {/* Bolinha de status */}
                  <td className="p-3">
                    {isTesting ? (
                      <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className={cn('w-3 h-3 rounded-full shadow-sm ring-2 ring-offset-1 ring-offset-white dark:ring-offset-slate-900',
                          isOnline ? 'bg-green-500 ring-green-300 animate-pulse' : 'bg-red-500 ring-red-300'
                        )} />
                        <span className={cn('text-[9px] font-black uppercase', isOnline ? 'text-green-600' : 'text-red-600')}>
                          {isOnline ? 'Online' : 'Offline'}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="p-3">
                    <span className={cn('text-[10px] font-black px-2.5 py-1 rounded-full',
                      isProd ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    )}>{ep.amb}</span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1.5">
                      <Globe className="w-3 h-3 text-slate-400 shrink-0" aria-hidden="true" />
                      <span className="text-xs font-black text-slate-700 dark:text-slate-300 whitespace-nowrap">{ep.servico}</span>
                    </div>
                  </td>
                  <td className="p-3 max-w-[220px]">
                    <code className="text-[9px] text-slate-500 dark:text-slate-500 font-mono truncate block">{ep.url}</code>
                  </td>
                  <td className="p-3">
                    {ep.ms != null ? (
                      <div className="flex items-center gap-1.5">
                        <div className={cn('w-1.5 h-4 rounded-sm', ep.ms < 100 ? 'bg-green-500' : ep.ms < 150 ? 'bg-amber-500' : 'bg-red-500')} />
                        <span className={cn('text-xs font-black tabular-nums', ep.ms < 100 ? 'text-green-600' : ep.ms < 150 ? 'text-amber-600' : 'text-red-600')}>{ep.ms}ms</span>
                      </div>
                    ) : <span className="text-[10px] text-slate-400">—</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── HISTÓRICO DE TESTES ── */}
      <div className="bg-white dark:bg-slate-900 rounded-[24px] border-2 border-slate-100 dark:border-slate-800 p-5 shadow-sm space-y-3">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5" />Histórico de Testes
        </p>
        <div className="space-y-2">
          {historico.map(h => (
            <div key={h.id} className="flex items-center gap-3 px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap">{h.quando}</span>
              <span className={cn('text-[10px] font-black ml-auto',
                h.resultado.startsWith(h.resultado.split('/')[1] || '9') ? 'text-green-600' : 'text-amber-600'
              )}>{h.resultado}</span>
              <span className="text-[9px] text-slate-400">{h.duracao}</span>
              <span className={cn('text-[8px] font-black px-2 py-0.5 rounded-full uppercase',
                h.tipo === 'Auto' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
              )}>{h.tipo}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────
export default function SefazCertificates() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 space-y-5 animate-in fade-in duration-700">

      {/* HEADER */}
      <div className="bg-white dark:bg-slate-900 rounded-[32px] border-2 border-slate-100 dark:border-slate-800 p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-700 via-secondary to-green-600" />
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-3xl bg-gradient-to-br from-blue-700 to-blue-900 flex items-center justify-center shadow-lg shrink-0">
            <Radio className="w-7 h-7 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Cat. 11 — Administração e Manutenção</p>
            <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">10.5 Gerenciar Certificados</h1>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Gestão do Certificado A1 · Upload .pfx · Monitoramento de endpoints · Teste de conectividade</p>
          </div>
          <div className="ml-auto hidden md:flex items-center gap-3">
            <div className="text-right">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Ambiente Ativo</p>
              <span className="text-xs font-black text-red-600 bg-red-100 dark:bg-red-900/30 px-3 py-1 rounded-full">🔴 Produção</span>
            </div>
          </div>
        </div>
      </div>

      {/* LAYOUT 2 COLUNAS */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5 items-start">
        {/* Esquerda — Certificado */}
        <div className="xl:col-span-2">
          <PainelCertificado />
        </div>
        {/* Direita — SEFAZ */}
        <div className="xl:col-span-3">
          <PainelSefaz />
        </div>
      </div>
    </div>
  );
}
