import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, ScanBarcode, Package, Lock, X, CheckCircle2, AlertTriangle, Eye, ListChecks, BoxSelect } from 'lucide-react';

// ========== CORES DAS COLMEIAS ==========
const CORES_COLMEIA = [
    { nome: 'BEGE',     hex: '#D2B48C', text: '#5C4033' },
    { nome: 'ROXA',     hex: '#9B59B6', text: '#FFFFFF' },
    { nome: 'VERDE',    hex: '#27AE60', text: '#FFFFFF' },
    { nome: 'VERMELHA', hex: '#E74C3C', text: '#FFFFFF' },
    { nome: 'AZUL',     hex: '#2980B9', text: '#FFFFFF' },
    { nome: 'AMARELA',  hex: '#F1C40F', text: '#1a1a1a' },
    { nome: 'LARANJA',  hex: '#E67E22', text: '#FFFFFF' },
    { nome: 'BRANCA',   hex: '#ECF0F1', text: '#2C3E50' },
    { nome: 'PRETA',    hex: '#2C3E50', text: '#FFFFFF' },
    { nome: 'ROSA',     hex: '#E91E8C', text: '#FFFFFF' },
];

// ========== SIMULAÇÃO DE PEDIDOS POR COR ==========
const PEDIDOS_SIM = {
    BEGE:     { produto: 'BOLSA CARMEN STEFFENS', total: 20, separados: 4 },
    ROXA:     { produto: 'CINTO COURO LEGÍTIMO', total: 15, separados: 2 },
    VERDE:    { produto: 'CARTEIRA FEMININA PREMIUM', total: 25, separados: 9 },
    VERMELHA: { produto: 'MOCHILA EXECUTIVA VP', total: 18, separados: 6 },
    AZUL:     { produto: 'NECESSAIRE VIAGEM', total: 12, separados: 0 },
    AMARELA:  { produto: 'PORTA-DOCUMENTOS COURO', total: 10, separados: 3 },
    LARANJA:  { produto: 'BOLSA TIRACOLO CASUAL', total: 22, separados: 8 },
    BRANCA:   { produto: 'CLUTCH FESTA', total: 8, separados: 1 },
    PRETA:    { produto: 'PASTA NOTEBOOK 15"', total: 16, separados: 5 },
    ROSA:     { produto: 'MOCHILA INFANTIL', total: 14, separados: 3 },
};

// ========== STATUS DOS ESCANINHOS ==========
const STATUS = {
    NAO_UTILIZADO: 'nao_utilizado',     // cinza
    VAZIO:         'vazio',             // azul
    COM_PRODUTO:   'com_produto',       // amarelo
    COLOCANDO:     'colocando',         // laranja piscando
    FINALIZADO:    'finalizado',        // verde
};

const STATUS_CONFIG = {
    [STATUS.NAO_UTILIZADO]: { bg: '#94A3B8', border: '#64748B', label: 'Não utilizado' },
    [STATUS.VAZIO]:         { bg: '#3B82F6', border: '#2563EB', label: 'Vazio' },
    [STATUS.COM_PRODUTO]:   { bg: '#EAB308', border: '#CA8A04', label: 'Com produto' },
    [STATUS.COLOCANDO]:     { bg: '#F97316', border: '#EA580C', label: 'Colocando...' },
    [STATUS.FINALIZADO]:    { bg: '#22C55E', border: '#16A34A', label: 'Finalizado' },
};

// ========== COMPONENTE ESCANINHO ==========
function Escaninho({ numero, status, qtd, onClick, onContextMenu }) {
    const config = STATUS_CONFIG[status];
    const isPiscando = status === STATUS.COLOCANDO;

    return (
        <button
            onClick={onClick}
            onContextMenu={onContextMenu}
            className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 font-black shadow-lg transition-all duration-300 cursor-pointer hover:scale-105 select-none border-2 ${isPiscando ? 'animate-pulse' : ''}`}
            style={{
                backgroundColor: config.bg,
                borderColor: config.border,
                color: (status === STATUS.COM_PRODUTO || status === STATUS.COLOCANDO) ? '#1a1a1a' : '#FFFFFF',
                boxShadow: isPiscando ? `0 0 20px ${config.bg}88, 0 0 40px ${config.bg}44` : `0 4px 12px ${config.bg}33`,
            }}
        >
            <span className="text-2xl md:text-3xl font-black leading-none">{String(numero).padStart(2, '0')}</span>
            {status !== STATUS.NAO_UTILIZADO && (
                <span className="text-[8px] md:text-[9px] uppercase tracking-widest font-bold opacity-80">
                    {status === STATUS.COM_PRODUTO && `${qtd} un`}
                    {status === STATUS.COLOCANDO && '← AQUI'}
                    {status === STATUS.VAZIO && 'vazio'}
                    {status === STATUS.FINALIZADO && '✓ ok'}
                </span>
            )}
            {isPiscando && (
                <div className="absolute inset-0 rounded-2xl border-2 border-white/50 animate-ping pointer-events-none" />
            )}
        </button>
    );
}

// ========== MODAL SUPERVISOR ==========
function SupervisorModal({ onConfirm, onClose }) {
    const [senha, setSenha] = useState('');
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-sm p-6 space-y-5" onClick={e => e.stopPropagation()}>
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-danger/10 rounded-xl flex items-center justify-center"><Lock className="w-6 h-6 text-danger" /></div>
                    <div>
                        <h3 className="text-base font-black">Autorização Supervisor</h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Escaninho Cheio</p>
                    </div>
                </div>
                <div className="p-4 bg-warning/5 border border-warning/20 rounded-xl flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
                    <p className="text-[10px] font-bold text-warning">Marcar escaninho como cheio interrompe a alocação neste slot. Um supervisor deve autorizar.</p>
                </div>
                <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Senha do Supervisor</label>
                    <input type="password" value={senha} onChange={e => setSenha(e.target.value)} autoFocus placeholder="••••••" className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-center text-lg font-black tracking-[0.5em] focus:border-primary outline-none transition-all" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <button onClick={onClose} className="py-3 bg-slate-100 text-slate-500 font-black rounded-xl text-[10px] tracking-widest uppercase hover:bg-slate-200 transition-all">Cancelar</button>
                    <button onClick={() => { if (senha.length >= 3) onConfirm(); }} disabled={senha.length < 3} className="py-3 bg-danger text-white font-black rounded-xl text-[10px] tracking-widest uppercase hover:bg-danger/90 transition-all disabled:opacity-40 flex items-center justify-center gap-1.5"><Lock className="w-3.5 h-3.5" /> Autorizar</button>
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

    // Ajustar posição para não sair da tela
    const adjustedStyle = {
        position: 'fixed',
        top: y,
        left: x,
        zIndex: 95,
    };

    return (
        <div ref={menuRef} style={adjustedStyle} className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden min-w-[200px] animate-in fade-in zoom-in-95 duration-200">
            <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Escaninho #{String(escaninho.numero).padStart(2, '0')}</p>
            </div>
            <div className="p-1.5 space-y-0.5">
                <button onClick={onConteudo} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-black hover:bg-blue-50 hover:text-blue-600 transition-all text-left">
                    <Eye className="w-4 h-4" /> Conteúdo
                </button>
                <button onClick={onRestante} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-black hover:bg-warning/10 hover:text-warning transition-all text-left">
                    <ListChecks className="w-4 h-4" /> Restante
                </button>
                <div className="mx-3 my-1 border-t border-slate-100 dark:border-slate-800" />
                <button onClick={onEscaninhoCheio} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-black text-danger hover:bg-danger/10 transition-all text-left">
                    <BoxSelect className="w-4 h-4" /> Escaninho Cheio
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
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-danger transition-colors"><X className="w-5 h-5" /></button>
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
    const [escaninhos, setEscaninhos] = useState([]);
    const [inputCode, setInputCode] = useState('');
    const [restam, setRestam] = useState(0);
    const [pedido, setPedido] = useState(null);
    const [contextMenu, setContextMenu] = useState(null);
    const [showSupervisor, setShowSupervisor] = useState(false);
    const [supervisorTarget, setSupervisorTarget] = useState(null);
    const [infoModal, setInfoModal] = useState(null);
    const inputRef = useRef(null);

    // Inicializar escaninhos ao selecionar cor
    const selecionarCor = useCallback((cor) => {
        setCorSelecionada(cor);
        const ped = PEDIDOS_SIM[cor.nome] || { produto: 'PRODUTO GENÉRICO', total: 25, separados: 0 };
        setPedido(ped);
        setRestam(ped.total - ped.separados);

        // Gerar grid 5x5
        const grid = [];
        for (let i = 1; i <= 25; i++) {
            let status = STATUS.NAO_UTILIZADO;
            let qtd = 0;

            // Simular: os primeiros 'total' escaninhos são usáveis
            if (i <= ped.total) {
                if (i <= ped.separados) {
                    // Já com produto
                    status = STATUS.COM_PRODUTO;
                    qtd = Math.ceil(Math.random() * 3) + 1;
                } else {
                    status = STATUS.VAZIO;
                }
            }

            grid.push({ numero: i, status, qtd, items: qtd > 0 ? [{ nome: ped.produto, qtd }] : [] });
        }
        setEscaninhos(grid);
    }, []);

    // Focar input quando na tela principal
    useEffect(() => {
        if (corSelecionada && inputRef.current) {
            inputRef.current.focus();
        }
    }, [corSelecionada]);

    // Simular bipagem de código de barras
    const handleBip = (e) => {
        if (e.key !== 'Enter' || !inputCode.trim()) return;

        // Encontrar o primeiro escaninho vazio
        const idx = escaninhos.findIndex(e => e.status === STATUS.VAZIO);
        if (idx === -1) return; // Todos ocupados

        // Marcar como "colocando" (pisca laranja)
        setEscaninhos(prev => prev.map((esc, i) => i === idx ? { ...esc, status: STATUS.COLOCANDO } : esc));

        // Após 2.5s, mudar para "com_produto"
        setTimeout(() => {
            setEscaninhos(prev => prev.map((esc, i) => i === idx ? { ...esc, status: STATUS.COM_PRODUTO, qtd: (esc.qtd || 0) + 1, items: [...esc.items, { nome: pedido?.produto || 'PRODUTO', qtd: 1 }] } : esc));
            setRestam(r => Math.max(0, r - 1));
        }, 2500);

        setInputCode('');
    };

    // Menu de contexto
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
        setInfoModal({ title: `Restante — Separação`, items: [{ nome: pedido?.produto || 'PRODUTO', qtd: restam }] });
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

    // Finalizar escaninhos onde todos os itens foram colocados (simulação)
    const handleFinalizarEscaninho = (numero) => {
        setEscaninhos(prev => prev.map(esc => esc.numero === numero ? { ...esc, status: STATUS.FINALIZADO } : esc));
    };

    // Voltar à seleção de cor
    const voltar = () => {
        setCorSelecionada(null);
        setEscaninhos([]);
        setPedido(null);
        setRestam(0);
        setContextMenu(null);
    };

    // ====== TELA 1: SELEÇÃO DE COR ======
    if (!corSelecionada) {
        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-black tracking-tight">Conferência Colmeia</h1>
                    <p className="text-sm text-slate-500 font-medium">Selecione a cor da colmeia para iniciar a conferência</p>
                </div>

                <div className="max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {CORES_COLMEIA.map(cor => (
                        <button
                            key={cor.nome}
                            onClick={() => selecionarCor(cor)}
                            className="group relative aspect-square rounded-3xl flex flex-col items-center justify-center gap-2 font-black shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 border-4 border-white/30"
                            style={{ backgroundColor: cor.hex, color: cor.text }}
                        >
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                <Package className="w-5 h-5" />
                            </div>
                            <span className="text-xs uppercase tracking-widest font-black">{cor.nome}</span>
                            <span className="text-[8px] uppercase tracking-widest opacity-60">{PEDIDOS_SIM[cor.nome]?.total || 0} itens</span>
                            <div className="absolute inset-0 rounded-3xl border-2 border-white/0 group-hover:border-white/40 transition-all" />
                        </button>
                    ))}
                </div>

                {/* Legenda */}
                <div className="max-w-3xl mx-auto bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Legenda dos Escaninhos</h3>
                    <div className="flex flex-wrap items-center gap-4">
                        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                            <div key={key} className="flex items-center gap-2">
                                <div className={`w-6 h-6 rounded-lg ${key === STATUS.COLOCANDO ? 'animate-pulse' : ''}`} style={{ backgroundColor: cfg.bg }} />
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{cfg.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // ====== TELA 2: INTERFACE PRINCIPAL ======
    const finalizados = escaninhos.filter(e => e.status === STATUS.FINALIZADO).length;
    const comProduto = escaninhos.filter(e => e.status === STATUS.COM_PRODUTO || e.status === STATUS.COLOCANDO).length;

    return (
        <div className="space-y-4 animate-in fade-in duration-500">
            {/* Modais */}
            {showSupervisor && <SupervisorModal onConfirm={confirmarEscaninhoCheio} onClose={() => setShowSupervisor(false)} />}
            {contextMenu && <ContextMenu x={contextMenu.x} y={contextMenu.y} escaninho={contextMenu.escaninho} onConteudo={handleConteudo} onRestante={handleRestante} onEscaninhoCheio={handleEscaninhoCheio} onClose={() => setContextMenu(null)} />}
            {infoModal && <InfoModal title={infoModal.title} items={infoModal.items} onClose={() => setInfoModal(null)} />}

            {/* Cabeçalho com cor da colmeia */}
            <div className="flex items-center gap-4">
                <button onClick={voltar} className="p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-all"><ArrowLeft className="w-5 h-5" /></button>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl border-2 border-white/50 shadow-lg" style={{ backgroundColor: corSelecionada.hex }} />
                        <div>
                            <h1 className="text-xl font-black tracking-tight">Colmeia {corSelecionada.nome}</h1>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Conferência de Separação</p>
                        </div>
                    </div>
                </div>
                <div className="flex gap-3">
                    <div className="px-4 py-2 bg-success/10 border border-success/20 rounded-xl"><span className="text-[9px] font-black text-success uppercase tracking-widest">Finalizados: {finalizados}</span></div>
                    <div className="px-4 py-2 bg-warning/10 border border-warning/20 rounded-xl"><span className="text-[9px] font-black text-warning uppercase tracking-widest">Com produto: {comProduto}</span></div>
                </div>
            </div>

            {/* Banner Restam */}
            <div className="rounded-2xl p-4 flex items-center justify-center gap-3 shadow-lg" style={{ backgroundColor: corSelecionada.hex, color: corSelecionada.text }}>
                <span className="text-lg md:text-xl font-black tracking-tight">
                    RESTAM: [{restam}] — {pedido?.produto}
                </span>
            </div>

            {/* Input de leitura */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm flex items-center gap-3">
                <ScanBarcode className="w-5 h-5 text-secondary shrink-0" />
                <input
                    ref={inputRef}
                    type="text"
                    value={inputCode}
                    onChange={e => setInputCode(e.target.value)}
                    onKeyDown={handleBip}
                    placeholder="Passe o produto ou caixa colorida na leitora"
                    className="flex-1 bg-transparent text-sm font-bold outline-none placeholder:text-slate-300"
                    autoFocus
                />
                <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest shrink-0">ENTER p/ confirmar</span>
            </div>

            {/* Grid de Escaninhos 5×5 */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
                <div className="grid grid-cols-5 gap-3 md:gap-4 max-w-2xl mx-auto">
                    {escaninhos.map(esc => (
                        <Escaninho
                            key={esc.numero}
                            numero={esc.numero}
                            status={esc.status}
                            qtd={esc.qtd}
                            onClick={() => {
                                if (esc.status === STATUS.COM_PRODUTO) handleFinalizarEscaninho(esc.numero);
                            }}
                            onContextMenu={(e) => handleContextMenu(e, esc)}
                        />
                    ))}
                </div>
            </div>

            {/* Legenda */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-center gap-4">
                    {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                        <div key={key} className="flex items-center gap-2">
                            <div className={`w-5 h-5 rounded-lg ${key === STATUS.COLOCANDO ? 'animate-pulse' : ''}`} style={{ backgroundColor: cfg.bg }} />
                            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{cfg.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
