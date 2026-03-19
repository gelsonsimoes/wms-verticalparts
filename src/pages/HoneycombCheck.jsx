import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
    ArrowLeft, ScanBarcode, Package, Lock, X, AlertTriangle,
    Eye, ListChecks, BoxSelect, Info, TrendingUp, CheckCircle2,
    Hash, Layers,
} from 'lucide-react';
import Tooltip from '../components/ui/Tooltip';

// ========== CORES DAS COLMEIAS ==========
const CORES_COLMEIA = [
    { nome: 'BEGE',     hex: '#D2B48C', text: '#5C4033', glow: 'rgba(210,180,140,0.55)' },
    { nome: 'ROXA',     hex: '#9B59B6', text: '#FFFFFF', glow: 'rgba(155,89,182,0.50)' },
    { nome: 'VERDE',    hex: '#27AE60', text: '#FFFFFF', glow: 'rgba(39,174,96,0.50)'  },
    { nome: 'VERMELHA', hex: '#E74C3C', text: '#FFFFFF', glow: 'rgba(231,76,60,0.50)'  },
    { nome: 'AZUL',     hex: '#2980B9', text: '#FFFFFF', glow: 'rgba(41,128,185,0.50)' },
    { nome: 'AMARELA',  hex: '#F1C40F', text: '#1a1a1a', glow: 'rgba(241,196,15,0.55)' },
    { nome: 'LARANJA',  hex: '#E67E22', text: '#FFFFFF', glow: 'rgba(230,126,34,0.50)' },
    { nome: 'BRANCA',   hex: '#ECF0F1', text: '#2C3E50', glow: 'rgba(189,195,199,0.60)'},
    { nome: 'PRETA',    hex: '#2C3E50', text: '#FFFFFF', glow: 'rgba(44,62,80,0.60)'   },
    { nome: 'ROSA',     hex: '#E91E8C', text: '#FFFFFF', glow: 'rgba(233,30,140,0.50)' },
];

// ========== SIMULAÇÃO DE PEDIDOS POR COR ==========
const PEDIDOS_SIM = {
    BEGE:     { produto: 'PASTILHA DE FREIO CERÂMICA VP-FR4429',     total: 20, separados: 4,  descricao: 'Peças de freio para linha de elevadores BST' },
    ROXA:     { produto: 'CABO DE FREIO INOX 2.5MM',                 total: 15, separados: 2,  descricao: 'Cabos de alta resistência para passagem em roldanas' },
    VERDE:    { produto: 'GUIA DE ELEVADOR BST 18KG/M',              total: 25, separados: 9,  descricao: 'Guias de deslizamento para cabinas de elevadores' },
    VERMELHA: { produto: 'LIMITADOR DE VELOCIDADE MONARCH',          total: 18, separados: 6,  descricao: 'Dispositivo de segurança anti-queda para elevadores' },
    AZUL:     { produto: 'PAINEL DE COMANDO THYSSENKRUPP',           total: 12, separados: 0,  descricao: 'Painel eletrônico de controle de andar e chamadas' },
    AMARELA:  { produto: 'SENSOR DE PORTA DE PAVIMENTO BST',         total: 10, separados: 3,  descricao: 'Sensor magnético de posição de porta por pavimento' },
    LARANJA:  { produto: 'CORREIA DENTADA OTIS ESCADA ROLANTE',      total: 22, separados: 8,  descricao: 'Correia de tração para escadas rolantes OTIS GEN2' },
    BRANCA:   { produto: 'BATENTE DE CABINA PVC 90MM',               total: 8,  separados: 1,  descricao: 'Perfil de vedação e amortecimento para portas de cabina' },
    PRETA:    { produto: 'SISTEMA DE RESGATE AUTOMÁTICO SR-200',     total: 16, separados: 5,  descricao: 'Módulo eletrônico de resgate em caso de queda de energia' },
    ROSA:     { produto: 'QUADRO ELÉTRICO DE MANOBRA VP-QM-01',      total: 14, separados: 3,  descricao: 'Quadro de força e manobra para elevadores hidráulicos' },
};

// ========== STATUS DOS ESCANINHOS ==========
const STATUS = {
    NAO_UTILIZADO: 'nao_utilizado',
    VAZIO:         'vazio',
    COM_PRODUTO:   'com_produto',
    COLOCANDO:     'colocando',
    FINALIZADO:    'finalizado',
    AGUARDANDO:    'aguardando',
};

const STATUS_CONFIG = {
    [STATUS.NAO_UTILIZADO]: { bg: '#94A3B8', border: '#64748B', label: 'Não utilizado',       dica: 'Este escaninho não está sendo usado nesta onda de separação.' },
    [STATUS.VAZIO]:         { bg: '#3B82F6', border: '#2563EB', label: 'Vazio',               dica: 'Escaninho disponível — o próximo produto bipado será colocado aqui.' },
    [STATUS.COM_PRODUTO]:   { bg: '#EAB308', border: '#CA8A04', label: 'Com produto',         dica: 'Escaninho ocupado com produto. Clique com botão direito para ver conteúdo.' },
    [STATUS.COLOCANDO]:     { bg: '#F97316', border: '#EA580C', label: 'Colocando...',        dica: 'Produto recém bipado — aguardando confirmação de colocação física no escaninho.' },
    [STATUS.FINALIZADO]:    { bg: '#22C55E', border: '#16A34A', label: 'Finalizado',          dica: 'Escaninho confirmado pelo supervisor como totalmente preenchido.' },
    [STATUS.AGUARDANDO]:    { bg: '#8B5CF6', border: '#7C3AED', label: 'Aguard. conferência', dica: 'Pedido completo — aguardando conferência final pelo supervisor.' },
};

// ========== PAINEL DE PREVIEW (hover na seleção de cor) ==========
function ColorPreviewPanel({ cor, pedido }) {
    if (!cor || !pedido) return null;
    const pct = Math.round((pedido.separados / pedido.total) * 100);
    const restam = pedido.total - pedido.separados;

    return (
        <div
            className="fixed right-6 top-1/2 -translate-y-1/2 z-[60] w-72 pointer-events-none
                        animate-in slide-in-from-right-6 fade-in duration-300"
            aria-live="polite"
            aria-label={`Preview da colmeia ${cor.nome}`}
        >
            <div
                className="rounded-3xl overflow-hidden shadow-2xl border-4"
                style={{
                    borderColor: cor.hex,
                    boxShadow: `0 24px 60px ${cor.glow}, 0 8px 20px rgba(0,0,0,0.18)`,
                }}
            >
                {/* Cabeçalho colorido */}
                <div
                    className="px-5 py-4 flex items-center gap-3"
                    style={{ backgroundColor: cor.hex, color: cor.text }}
                >
                    <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                        <Package className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-70">Colmeia</p>
                        <p className="text-lg font-black uppercase tracking-tight leading-none">{cor.nome}</p>
                    </div>
                    <div className="ml-auto text-right">
                        <p className="text-2xl font-black leading-none">{pct}%</p>
                        <p className="text-[8px] font-bold uppercase opacity-70">separado</p>
                    </div>
                </div>

                {/* Corpo */}
                <div className="bg-white dark:bg-slate-900 px-5 py-4 space-y-4">
                    {/* Produto */}
                    <div>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Produto</p>
                        <p className="text-[11px] font-black text-slate-800 dark:text-white leading-snug">{pedido.produto}</p>
                        <p className="text-[9px] text-slate-400 font-medium mt-1 leading-relaxed">{pedido.descricao}</p>
                    </div>

                    {/* Barra de progresso */}
                    <div className="space-y-1.5">
                        <div className="flex justify-between">
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Progresso</span>
                            <span className="text-[9px] font-black" style={{ color: cor.hex }}>{pedido.separados} / {pedido.total}</span>
                        </div>
                        <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200">
                            <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{ width: `${pct}%`, backgroundColor: cor.hex }}
                            />
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2">
                        <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-3 text-center">
                            <p className="text-base font-black" style={{ color: cor.hex }}>{pedido.total}</p>
                            <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Total</p>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-3 text-center">
                            <p className="text-base font-black text-green-600">{pedido.separados}</p>
                            <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Separados</p>
                        </div>
                        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-3 text-center">
                            <p className="text-base font-black text-amber-600">{restam}</p>
                            <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Restam</p>
                        </div>
                    </div>

                    {/* Dica */}
                    <div className="flex items-start gap-2 p-3 rounded-2xl border" style={{ borderColor: `${cor.hex}33`, backgroundColor: `${cor.hex}0d` }}>
                        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: cor.hex }} aria-hidden="true" />
                        <p className="text-[9px] font-bold text-slate-600 dark:text-slate-300">
                            Clique para abrir a interface de conferência desta colmeia.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ========== COMPONENTE ESCANINHO ==========
function Escaninho({ numero, status, qtd, onContextMenu }) {
    const config = STATUS_CONFIG[status];
    const isPiscando = status === STATUS.COLOCANDO;

    return (
        <Tooltip
            content={
                status === STATUS.NAO_UTILIZADO ? 'Escaninho não utilizado nesta onda' :
                status === STATUS.VAZIO         ? `Escaninho ${String(numero).padStart(2,'0')} — Disponível. O próximo produto bipado virá aqui.` :
                status === STATUS.COM_PRODUTO   ? `Escaninho ${String(numero).padStart(2,'0')} — ${qtd} un. Botão direito para ver conteúdo ou finalizar.` :
                status === STATUS.COLOCANDO     ? `Aguardando colocação física do produto no escaninho ${String(numero).padStart(2,'0')}...` :
                status === STATUS.FINALIZADO    ? `Escaninho ${String(numero).padStart(2,'0')} — Finalizado e confirmado pelo supervisor.` :
                                                  `Escaninho ${String(numero).padStart(2,'0')} — Aguardando conferência final.`
            }
            side="top"
            delay={200}
        >
            <button
                onContextMenu={onContextMenu}
                aria-label={`Escaninho ${String(numero).padStart(2,'0')} — ${config.label}${qtd ? ` — ${qtd} unidades` : ''}`}
                className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 font-black transition-all duration-300 cursor-context-menu hover:scale-110 select-none border-2 ${isPiscando ? 'animate-pulse' : ''}`}
                style={{
                    backgroundColor: config.bg,
                    borderColor: config.border,
                    color: (status === STATUS.COM_PRODUTO || status === STATUS.COLOCANDO) ? '#1a1a1a' : '#FFFFFF',
                    boxShadow: isPiscando
                        ? `0 0 24px ${config.bg}99, 0 0 48px ${config.bg}44, 0 4px 12px rgba(0,0,0,0.2)`
                        : `0 6px 20px ${config.bg}55, 0 2px 6px rgba(0,0,0,0.12)`,
                }}
            >
                <span className="text-2xl md:text-3xl font-black leading-none">{String(numero).padStart(2, '0')}</span>
                {status !== STATUS.NAO_UTILIZADO && (
                    <span className="text-[8px] md:text-[9px] uppercase tracking-widest font-bold opacity-80">
                        {status === STATUS.COM_PRODUTO && `${qtd} un`}
                        {status === STATUS.COLOCANDO && '← AQUI'}
                        {status === STATUS.VAZIO && 'vazio'}
                        {status === STATUS.FINALIZADO && '✓ ok'}
                        {status === STATUS.AGUARDANDO && 'aguardando'}
                    </span>
                )}
                {isPiscando && (
                    <div className="absolute inset-0 rounded-2xl border-2 border-white/50 animate-ping pointer-events-none" />
                )}
            </button>
        </Tooltip>
    );
}

// ========== MODAL SUPERVISOR ==========
function SupervisorModal({ onConfirm, onClose }) {
    const [senha, setSenha] = useState('');

    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [onClose]);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            role="dialog" aria-modal="true" aria-labelledby="supervisor-modal-title" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-sm p-6 space-y-5" onClick={e => e.stopPropagation()}>
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center">
                        <Lock className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                        <h3 id="supervisor-modal-title" className="text-base font-black">Autorização Supervisor</h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Escaninho Cheio</p>
                    </div>
                </div>
                <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-[10px] font-bold text-amber-700">
                        Marcar escaninho como cheio interrompe a alocação neste slot. Um supervisor deve autorizar.
                    </p>
                </div>
                <div className="space-y-1.5">
                    <Tooltip content="Digite a senha do supervisor para autorizar o fechamento deste escaninho." showIcon>
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Senha do Supervisor</label>
                    </Tooltip>
                    <input
                        type="password" value={senha} onChange={e => setSenha(e.target.value)}
                        autoFocus placeholder="••••••"
                        className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-center text-lg font-black tracking-[0.5em] focus:border-primary outline-none transition-all"
                    />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <button onClick={onClose} className="py-3 bg-slate-100 text-slate-500 font-black rounded-xl text-[10px] tracking-widest uppercase hover:bg-slate-200 transition-all">Cancelar</button>
                    <button onClick={() => { if (senha.length >= 3) onConfirm(); }} disabled={senha.length < 3}
                        className="py-3 bg-red-500 text-white font-black rounded-xl text-[10px] tracking-widest uppercase hover:bg-red-600 transition-all disabled:opacity-40 flex items-center justify-center gap-1.5">
                        <Lock className="w-3.5 h-3.5" /> Autorizar
                    </button>
                </div>
            </div>
        </div>
    );
}

// ========== MENU DE CONTEXTO ==========
function ContextMenu({ x, y, escaninho, onConteudo, onRestante, onEscaninhoCheio, onClose }) {
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClick = () => onClose();
        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, [onClose]);

    const adjustedStyle = useMemo(() => ({
        position: 'fixed',
        top:  Math.min(y, window.innerHeight - 160),
        left: Math.min(x, window.innerWidth  - 220),
        zIndex: 95,
    }), [x, y]);

    return (
        <div ref={menuRef} style={adjustedStyle}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden min-w-[200px] animate-in fade-in zoom-in-95 duration-200">
            <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    Escaninho #{String(escaninho.numero).padStart(2, '0')}
                </p>
            </div>
            <div className="p-1.5 space-y-0.5">
                <button onClick={onConteudo}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-black hover:bg-blue-50 hover:text-blue-600 transition-all text-left">
                    <Eye className="w-4 h-4" /> Conteúdo
                    <span className="ml-auto text-[8px] text-slate-300 font-normal">Ver produtos</span>
                </button>
                <button onClick={onRestante}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-black hover:bg-amber-50 hover:text-amber-600 transition-all text-left">
                    <ListChecks className="w-4 h-4" /> Restante
                    <span className="ml-auto text-[8px] text-slate-300 font-normal">Faltando bipar</span>
                </button>
                <div className="mx-3 my-1 border-t border-slate-100 dark:border-slate-800" aria-hidden="true" />
                <button onClick={onEscaninhoCheio}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-black text-red-500 hover:bg-red-50 transition-all text-left">
                    <BoxSelect className="w-4 h-4" /> Escaninho Cheio
                    <span className="ml-auto text-[8px] text-red-300 font-normal">Supervisor</span>
                </button>
            </div>
        </div>
    );
}

// ========== MODAL CONTEÚDO / RESTANTE ==========
function InfoModal({ title, items, onClose }) {
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[90] flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-4" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between">
                    <h3 className="text-base font-black">{title}</h3>
                    <button onClick={onClose} aria-label="Fechar" className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                    {items.length > 0 ? items.map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                                <Package className="w-3.5 h-3.5 text-secondary" />
                                <span className="text-xs font-black">{item.nome}</span>
                            </div>
                            <span className="text-xs font-bold text-secondary font-mono">{item.qtd} un</span>
                        </div>
                    )) : (
                        <p className="text-center text-xs text-slate-400 font-bold py-6">Nenhum item</p>
                    )}
                </div>
                <button onClick={onClose} className="w-full py-3 bg-secondary text-primary font-black rounded-xl text-[10px] tracking-widest uppercase hover:bg-secondary/90 transition-all">Fechar</button>
            </div>
        </div>
    );
}

// ========== COMPONENTE PRINCIPAL ==========
export default function HoneycombCheck() {
    const [corSelecionada, setCorSelecionada] = useState(null);
    const [hoveredCor,     setHoveredCor]     = useState(null);
    const [escaninhos,     setEscaninhos]     = useState([]);
    const [inputCode,      setInputCode]      = useState('');
    const [restam,         setRestam]         = useState(0);
    const [pedido,         setPedido]         = useState(null);
    const [contextMenu,    setContextMenu]    = useState(null);
    const [showSupervisor, setShowSupervisor] = useState(false);
    const [supervisorTarget, setSupervisorTarget] = useState(null);
    const [infoModal,      setInfoModal]      = useState(null);
    const [ultimos,        setUltimos]        = useState([]);
    const [ultimoBipado,   setUltimoBipado]   = useState(null);
    const inputRef    = useRef(null);
    const timeoutsRef = useRef([]);

    useEffect(() => () => { timeoutsRef.current.forEach(clearTimeout); timeoutsRef.current = []; }, []);

    const selecionarCor = useCallback((cor) => {
        timeoutsRef.current.forEach(clearTimeout);
        timeoutsRef.current = [];
        setCorSelecionada(cor);
        const ped = PEDIDOS_SIM[cor.nome] || { produto: 'PRODUTO GENÉRICO', descricao: '', total: 25, separados: 0 };
        setPedido(ped);
        setRestam(ped.total - ped.separados);
        const grid = [];
        let restantesParaDistribuir = ped.separados;
        for (let i = 1; i <= 25; i++) {
            let status = STATUS.NAO_UTILIZADO;
            let qtd = 0;
            if (i <= ped.total) {
                if (i <= ped.separados) {
                    const eUltimo = i === ped.separados;
                    qtd = eUltimo
                        ? restantesParaDistribuir
                        : Math.min(restantesParaDistribuir, Math.floor(Math.random() * 3) + 1);
                    restantesParaDistribuir -= qtd;
                    status = STATUS.COM_PRODUTO;
                } else {
                    status = STATUS.VAZIO;
                }
            }
            grid.push({ numero: i, status, qtd, items: qtd > 0 ? [{ nome: ped.produto, qtd }] : [] });
        }
        setEscaninhos(grid);
    }, []);

    useEffect(() => {
        if (corSelecionada && inputRef.current) inputRef.current.focus();
    }, [corSelecionada]);

    const handleBip = (e) => {
        if (e.key !== 'Enter' || !inputCode.trim()) return;
        const codigo = inputCode.trim();
        setInputCode('');
        const idxColocando = escaninhos.findIndex(e => e.status === STATUS.COLOCANDO);
        if (idxColocando !== -1) {
            setEscaninhos(prev => prev.map((esc, i) =>
                i === idxColocando ? { ...esc, status: STATUS.COM_PRODUTO, qtd: (esc.qtd || 0) + 1, items: [...esc.items, { nome: pedido?.produto || codigo, qtd: 1 }] } : esc
            ));
            setRestam(r => Math.max(0, r - 1));
            setUltimos(prev => [{ code: codigo, nome: pedido?.produto || codigo, ts: Date.now() }, ...prev].slice(0, 5));
            setUltimoBipado({ code: codigo, nome: pedido?.produto || codigo });
            return;
        }
        const idxVazio = escaninhos.findIndex(e => e.status === STATUS.VAZIO);
        if (idxVazio === -1) return;
        setEscaninhos(prev => prev.map((esc, i) =>
            i === idxVazio ? { ...esc, status: STATUS.COLOCANDO, qtd: (esc.qtd || 0) + 1, items: [...esc.items, { nome: pedido?.produto || codigo, qtd: 1 }] } : esc
        ));
        setRestam(r => Math.max(0, r - 1));
        const tid = setTimeout(() => {
            setEscaninhos(prev => prev.map((esc, i) =>
                i === idxVazio && esc.status === STATUS.COLOCANDO ? { ...esc, status: STATUS.COM_PRODUTO } : esc
            ));
            timeoutsRef.current = timeoutsRef.current.filter(id => id !== tid);
        }, 1200);
        timeoutsRef.current.push(tid);
        setUltimos(prev => [{ code: codigo, nome: pedido?.produto || codigo, ts: Date.now() }, ...prev].slice(0, 5));
        setUltimoBipado({ code: codigo, nome: pedido?.produto || codigo });
    };

    const handleContextMenu = (e, esc) => {
        e.preventDefault();
        if (esc.status !== STATUS.COM_PRODUTO) return;
        setContextMenu({ x: e.clientX, y: e.clientY, escaninho: esc });
    };

    const handleConteudo = () => {
        if (!contextMenu) return;
        const esc = escaninhos.find(e => e.numero === contextMenu.escaninho.numero);
        setInfoModal({ title: `Conteúdo — Escaninho #${String(contextMenu.escaninho.numero).padStart(2, '0')}`, items: esc?.items || [] });
        setContextMenu(null);
    };

    const handleRestante = () => {
        if (!contextMenu) return;
        setInfoModal({ title: 'Restante — Separação', items: [{ nome: pedido?.produto || 'PRODUTO', qtd: restam }] });
        setContextMenu(null);
    };

    const handleEscaninhoCheio = () => {
        if (!contextMenu) return;
        setSupervisorTarget(contextMenu.escaninho.numero);
        setShowSupervisor(true);
        setContextMenu(null);
    };

    const confirmarEscaninhoCheio = () => {
        if (supervisorTarget == null) return;
        setEscaninhos(prev => prev.map(esc => esc.numero === supervisorTarget ? { ...esc, status: STATUS.FINALIZADO } : esc));
        setShowSupervisor(false);
        setSupervisorTarget(null);
    };

    const voltar = () => {
        setCorSelecionada(null);
        setEscaninhos([]);
        setPedido(null);
        setRestam(0);
        setContextMenu(null);
        setUltimos([]);
        setUltimoBipado(null);
    };

    // ====== TELA 1: SELEÇÃO DE COR ======
    if (!corSelecionada) {
        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Painel de preview no hover */}
                <ColorPreviewPanel cor={hoveredCor} pedido={hoveredCor ? PEDIDOS_SIM[hoveredCor.nome] : null} />

                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-black tracking-tight">2.15 Conferência Colmeia</h1>
                    <p className="text-sm text-slate-500 font-medium">
                        Selecione a cor da colmeia para iniciar a conferência
                        <span className="ml-2 text-[10px] text-slate-400">— passe o mouse sobre as cores para ver detalhes</span>
                    </p>
                </div>

                <div className="max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {CORES_COLMEIA.map(cor => {
                        const ped = PEDIDOS_SIM[cor.nome];
                        const pct = ped ? Math.round((ped.separados / ped.total) * 100) : 0;
                        const isHovered = hoveredCor?.nome === cor.nome;
                        return (
                            <button
                                key={cor.nome}
                                onClick={() => selecionarCor(cor)}
                                onMouseEnter={() => setHoveredCor(cor)}
                                onMouseLeave={() => setHoveredCor(null)}
                                aria-label={`Colmeia ${cor.nome} — ${ped?.total ?? 0} itens, ${pct}% separado`}
                                className="group relative aspect-square rounded-3xl flex flex-col items-center justify-center gap-2 font-black transition-all duration-300 hover:scale-110 active:scale-95 border-4 border-white/30 overflow-hidden"
                                style={{
                                    backgroundColor: cor.hex,
                                    color: cor.text,
                                    boxShadow: isHovered
                                        ? `0 16px 48px ${cor.glow}, 0 8px 20px rgba(0,0,0,0.20), 0 0 0 4px white`
                                        : `0 8px 28px ${cor.glow}, 0 4px 10px rgba(0,0,0,0.12)`,
                                    transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                                }}
                            >
                                {/* Brilho interno no hover */}
                                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all duration-300 rounded-3xl" />

                                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center z-10">
                                    <Package className="w-5 h-5" aria-hidden="true" />
                                </div>
                                <span className="text-xs uppercase tracking-widest font-black z-10">{cor.nome}</span>
                                <span className="text-[8px] uppercase tracking-widest opacity-60 z-10">{ped?.total ?? 0} itens</span>

                                {/* Mini barra de progresso na base */}
                                {ped && ped.separados > 0 && (
                                    <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/10 rounded-b-3xl overflow-hidden">
                                        <div
                                            className="h-full bg-white/50 transition-all duration-700"
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                )}

                                {/* Badge de % no canto */}
                                {pct > 0 && (
                                    <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-lg bg-black/20 text-[7px] font-black">
                                        {pct}%
                                    </div>
                                )}

                                {/* Borda de hover */}
                                <div className="absolute inset-0 rounded-3xl border-2 border-white/0 group-hover:border-white/50 transition-all duration-200" />
                            </button>
                        );
                    })}
                </div>

                {/* Legenda */}
                <div className="max-w-3xl mx-auto bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Layers className="w-3.5 h-3.5" /> Legenda dos Escaninhos
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
                        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                            <Tooltip key={key} content={cfg.dica} side="top">
                                <div className="flex items-center gap-2 cursor-help">
                                    <div className={`w-6 h-6 rounded-lg border-2 ${key === STATUS.COLOCANDO ? 'animate-pulse' : ''}`}
                                        style={{ backgroundColor: cfg.bg, borderColor: cfg.border }} />
                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{cfg.label}</span>
                                </div>
                            </Tooltip>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // ====== TELA 2: INTERFACE PRINCIPAL ======
    const finalizados = escaninhos.filter(e => e.status === STATUS.FINALIZADO).length;
    const comProduto  = escaninhos.filter(e => e.status === STATUS.COM_PRODUTO || e.status === STATUS.COLOCANDO).length;

    return (
        <div className="space-y-4 animate-in fade-in duration-500">
            {showSupervisor  && <SupervisorModal onConfirm={confirmarEscaninhoCheio} onClose={() => setShowSupervisor(false)} />}
            {contextMenu     && <ContextMenu x={contextMenu.x} y={contextMenu.y} escaninho={contextMenu.escaninho} onConteudo={handleConteudo} onRestante={handleRestante} onEscaninhoCheio={handleEscaninhoCheio} onClose={() => setContextMenu(null)} />}
            {infoModal       && <InfoModal title={infoModal.title} items={infoModal.items} onClose={() => setInfoModal(null)} />}

            {/* Cabeçalho */}
            <div className="flex items-center gap-4">
                <Tooltip content="Voltar à seleção de colmeia" side="right">
                    <button onClick={voltar} aria-label="Voltar à seleção de cor"
                        className="p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-all">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                </Tooltip>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl border-2 border-white/50 shadow-lg"
                            style={{ backgroundColor: corSelecionada.hex, boxShadow: `0 4px 16px ${corSelecionada.glow}` }} />
                        <div>
                            <h1 className="text-xl font-black tracking-tight">Colmeia {corSelecionada.nome}</h1>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Conferência de Separação</p>
                        </div>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Tooltip content="Escaninhos confirmados pelo supervisor como totalmente preenchidos." side="bottom">
                        <div className="px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-xl cursor-help">
                            <span className="text-[9px] font-black text-green-600 uppercase tracking-widest flex items-center gap-1.5">
                                <CheckCircle2 className="w-3 h-3" /> Finalizados: {finalizados}
                            </span>
                        </div>
                    </Tooltip>
                    <Tooltip content="Escaninhos com produto alocado aguardando finalização." side="bottom">
                        <div className="px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl cursor-help">
                            <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-1.5">
                                <Package className="w-3 h-3" /> Com produto: {comProduto}
                            </span>
                        </div>
                    </Tooltip>
                    {ultimoBipado && (
                        <Tooltip content={`Último produto confirmado: ${ultimoBipado.nome}`} side="bottom">
                            <div className="px-4 py-2 bg-primary/10 border border-primary/20 rounded-xl max-w-xs cursor-help">
                                <span className="text-[9px] font-black text-primary uppercase tracking-widest truncate block">
                                    ↳ {ultimoBipado.nome}
                                </span>
                            </div>
                        </Tooltip>
                    )}
                </div>
            </div>

            {/* Banner Restam */}
            <div className="rounded-2xl p-4 flex items-center justify-center gap-3 shadow-lg"
                style={{ backgroundColor: corSelecionada.hex, color: corSelecionada.text, boxShadow: `0 8px 32px ${corSelecionada.glow}` }}>
                <TrendingUp className="w-5 h-5 opacity-70 shrink-0" aria-hidden="true" />
                <span className="text-lg md:text-xl font-black tracking-tight">
                    RESTAM: [{restam}] — {pedido?.produto}
                </span>
            </div>

            {/* Scanner */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm flex items-center gap-3">
                <Tooltip content="Aponte o leitor de código de barras para o produto ou caixinha colorida. O sistema alocará automaticamente no próximo escaninho disponível." side="right">
                    <ScanBarcode className="w-5 h-5 text-secondary shrink-0 cursor-help" />
                </Tooltip>
                <label htmlFor="barcode-input" className="sr-only">Código de barras do produto</label>
                <input
                    id="barcode-input"
                    ref={inputRef}
                    type="text"
                    value={inputCode}
                    onChange={e => setInputCode(e.target.value)}
                    onKeyDown={handleBip}
                    placeholder="Passe o produto ou caixa colorida na leitora..."
                    className="flex-1 bg-transparent text-sm font-bold outline-none placeholder:text-slate-300"
                    autoFocus
                />
                <Tooltip content="Pressione Enter após digitar o código manualmente." side="left">
                    <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest shrink-0 cursor-help">ENTER p/ confirmar</span>
                </Tooltip>
            </div>

            {/* Últimos 5 Produtos */}
            {ultimos.length > 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                        <Hash className="w-3 h-3" /> Últimos 5 Produtos Conferidos
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {ultimos.map((u, i) => (
                            <div key={`${u.ts}-${i}`}
                                className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                                <span className="text-[8px] font-black text-slate-300">#{i + 1}</span>
                                <span className="text-[10px] font-black text-slate-600 dark:text-slate-300 truncate max-w-[160px]">{u.nome}</span>
                                <code className="text-[8px] font-mono text-secondary">{u.code}</code>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Grid de Escaninhos 5×5 */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5" /> Grade de Escaninhos
                    <span className="text-slate-300 font-normal">— botão direito em escaninhos com produto para opções</span>
                </p>
                <div className="grid grid-cols-5 gap-3 md:gap-4 max-w-2xl mx-auto">
                    {escaninhos.map(esc => (
                        <Escaninho
                            key={esc.numero}
                            numero={esc.numero}
                            status={esc.status}
                            qtd={esc.qtd}
                            onContextMenu={(e) => handleContextMenu(e, esc)}
                        />
                    ))}
                </div>
            </div>

            {/* Legenda */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3">
                    {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                        <Tooltip key={key} content={cfg.dica} side="top">
                            <div className="flex items-center gap-2 cursor-help">
                                <div className={`w-5 h-5 rounded-lg border-2 ${key === STATUS.COLOCANDO ? 'animate-pulse' : ''}`}
                                    style={{ backgroundColor: cfg.bg, borderColor: cfg.border }} />
                                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{cfg.label}</span>
                            </div>
                        </Tooltip>
                    ))}
                </div>
            </div>
        </div>
    );
}
