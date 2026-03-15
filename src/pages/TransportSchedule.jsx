import React, { useState, useMemo, useCallback, useEffect, useId, useRef } from 'react';
import { useApp } from '../hooks/useApp';
import {
    CalendarDays, ChevronLeft, ChevronRight, RefreshCw, Clock,
    Plus, X, Save, Truck, ArrowDownLeft, ArrowUpRight,
    MapPin, User, FileText, Package, Building2, CheckCircle2
} from 'lucide-react';

// ========== STATUS CONFIG ==========
const STATUS_CFG = {
    agendado:              { label: 'Agendado',             color: '#3B82F6', bg: '#EFF6FF', border: '#BFDBFE' },
    veiculo_recepcionado:  { label: 'Veículo Recepcionado', color: '#8B5CF6', bg: '#F5F3FF', border: '#DDD6FE' },
    veiculo_patio:         { label: 'Veículo no Pátio',     color: '#F59E0B', bg: '#FFFBEB', border: '#FDE68A' },
    veiculo_doca:          { label: 'Veículo na Doca',      color: '#EF4444', bg: '#FEF2F2', border: '#FECACA' },
    finalizado:            { label: 'Agenda Finalizada',    color: '#22C55E', bg: '#F0FDF4', border: '#BBF7D0' },
};

const TRANSITION_MAP = {
    agendado:             { next: 'veiculo_recepcionado', label: 'Veículo Chegou',   icon: Truck },
    veiculo_recepcionado: { next: 'veiculo_patio',        label: 'Veículo no Pátio', icon: MapPin },
    veiculo_patio:        { next: 'veiculo_doca',         label: 'Veículo na Doca',  icon: ArrowDownLeft },
    veiculo_doca:         { next: 'finalizado',           label: 'Finalizar Agenda', icon: CheckCircle2 },
};

const DOCAS = ['DOCA 01', 'DOCA 02', 'DOCA 03', 'DOCA 04', 'DOCA 05'];
const TURNOS = ['Manhã', 'Tarde', 'Noite'];
const HORAS = Array.from({ length: 15 }, (_, i) => i + 6); // 06:00 ~ 20:00

// ========== HELPERS DE DATA ==========
const fmt = (d) => d.toISOString().split('T')[0];
const fmtBR = (d) => d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' });
const fmtHora = (iso) => { const d = new Date(iso); return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`; };
const isSameDay = (d1, d2) => fmt(d1) === fmt(d2);
const addDays = (d, n) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };
const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
const getStartOfWeek = (d) => { const r = new Date(d); const day = r.getDay(); r.setDate(r.getDate() - day); return r; };

// ========== MINI CALENDÁRIO ==========
function MiniCalendar({ selectedDate, onSelect }) {
    const [viewMonth, setViewMonth] = useState(new Date(selectedDate));
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = new Date(year, month, 1).getDay();
    const DIAS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-3">
            <div className="flex items-center justify-between mb-2">
                <button onClick={() => setViewMonth(new Date(year, month - 1))} aria-label="Mês anterior" className="p-1 rounded-lg hover:bg-slate-100 transition-all">
                    <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{viewMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</span>
                <button onClick={() => setViewMonth(new Date(year, month + 1))} aria-label="Próximo mês" className="p-1 rounded-lg hover:bg-slate-100 transition-all">
                    <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
            </div>
            <div className="grid grid-cols-7 gap-0.5 text-center">
                {DIAS.map((d, i) => <div key={i} className="text-[7px] font-black text-slate-400 uppercase py-1">{d}</div>)}
                {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
                {Array.from({ length: daysInMonth }, (_, i) => {
                    const day = new Date(year, month, i + 1);
                    const isSelected = isSameDay(day, selectedDate);
                    const isToday = isSameDay(day, new Date());
                    return (
                        <button key={i} onClick={() => onSelect(day)} className={`w-7 h-7 rounded-lg text-[9px] font-bold transition-all ${isSelected ? 'bg-secondary text-primary font-black shadow' : isToday ? 'bg-primary/10 text-primary font-black' : 'hover:bg-slate-50 text-slate-600'}`}>{i + 1}</button>
                    );
                })}
            </div>
        </div>
    );
}

// ========== MODAL DE AGENDAMENTO ==========
function AgendamentoModal({ tipo, initial, onSave, onClose }) {
    const [form, setForm] = useState({
        tipo: initial?.tipo || tipo,
        depositante: initial?.depositante || '',
        doca: initial?.doca || 'DOCA 01',
        transportadora: initial?.transportadora || '',
        motorista: initial?.motorista || '',
        veiculo: initial?.veiculo || '',
        dataInicio: initial?.dataInicio || '',
        dataFim: initial?.dataFim || '',
        turno: initial?.turno || 'Manhã',
        qtdVolume: initial?.qtdVolume || 0,
        notasFiscais: initial?.notasFiscais || '',
    });

    const firstInputRef = useRef(null);
    const modalId = useId();

    useEffect(() => {
        const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handleEsc);
        firstInputRef.current?.focus();
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.depositante || !form.transportadora || !form.dataInicio || !form.dataFim) return;
        
        // Validação de data fim
        const ini = new Date(form.dataInicio);
        const fim = new Date(form.dataFim);
        if (fim <= ini) {
            alert('A data de término deve ser posterior à data de início.');
            return;
        }

        onSave({
            ...form,
            qtdVolume: parseInt(form.qtdVolume) || 0,
            status: 'agendado',
            historico: [{ status: 'agendado', data: new Date().toISOString(), usuario: 'danilo.supervisor' }],
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[90] flex items-center justify-center p-4" onClick={onClose}>
            <div 
                role="dialog" 
                aria-modal="true" 
                aria-labelledby={`${modalId}-title`}
                className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" 
                onClick={e => e.stopPropagation()}
            >
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-800 z-10 rounded-t-3xl">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tipo === 'Recebimento' ? 'bg-blue-100' : 'bg-green-100'}`}>
                            {tipo === 'Recebimento' ? <ArrowDownLeft className="w-5 h-5 text-blue-600" aria-hidden="true" /> : <ArrowUpRight className="w-5 h-5 text-green-600" aria-hidden="true" />}
                        </div>
                        <div>
                            <h3 id={`${modalId}-title`} className="text-base font-black">Realizar Agendamento</h3>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{tipo}</p>
                        </div>
                    </div>
                    <button onClick={onClose} aria-label="Fechar modal" className="p-2 text-slate-400 hover:text-danger transition-colors"><X className="w-5 h-5" aria-hidden="true" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <Field id={`${modalId}-dep`} label="Depositante" required><input id={`${modalId}-dep`} ref={firstInputRef} required value={form.depositante} onChange={e => setForm({...form, depositante: e.target.value})} className="field" placeholder="VerticalParts Matriz" /></Field>
                        <Field id={`${modalId}-doca`} label="Doca"><select id={`${modalId}-doca`} value={form.doca} onChange={e => setForm({...form, doca: e.target.value})} className="field">{DOCAS.map(d => <option key={d}>{d}</option>)}</select></Field>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <Field id={`${modalId}-transp`} label="Transportadora" required><input id={`${modalId}-transp`} required value={form.transportadora} onChange={e => setForm({...form, transportadora: e.target.value})} className="field" placeholder="Transvip Logística" /></Field>
                        <Field id={`${modalId}-motorista`} label="Motorista"><input id={`${modalId}-motorista`} value={form.motorista} onChange={e => setForm({...form, motorista: e.target.value})} className="field" placeholder="Ex: Danilo" /></Field>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <Field id={`${modalId}-veiculo`} label="Veículo (Placa)"><input id={`${modalId}-veiculo`} value={form.veiculo} onChange={e => setForm({...form, veiculo: e.target.value.toUpperCase()})} className="field font-mono" placeholder="ABC-1234" /></Field>
                        <Field id={`${modalId}-turno`} label="Turno de Trabalho"><select id={`${modalId}-turno`} value={form.turno} onChange={e => setForm({...form, turno: e.target.value})} className="field">{TURNOS.map(t => <option key={t}>{t}</option>)}</select></Field>
                        <Field id={`${modalId}-qtd`} label="Qtde Volume"><input id={`${modalId}-qtd`} type="number" min="0" value={form.qtdVolume} onChange={e => setForm({...form, qtdVolume: e.target.value})} className="field font-mono" /></Field>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <Field id={`${modalId}-ini`} label="Data/Hora Início" required><input id={`${modalId}-ini`} required type="datetime-local" value={form.dataInicio} onChange={e => setForm({...form, dataInicio: e.target.value})} className="field font-mono text-xs" /></Field>
                        <Field id={`${modalId}-fim`} label="Data/Hora Fim" required><input id={`${modalId}-fim`} required type="datetime-local" value={form.dataFim} onChange={e => setForm({...form, dataFim: e.target.value})} className="field font-mono text-xs" /></Field>
                    </div>
                    <Field id={`${modalId}-nfs`} label="Notas Fiscais"><input id={`${modalId}-nfs`} value={form.notasFiscais} onChange={e => setForm({...form, notasFiscais: e.target.value})} className="field" placeholder="NF-001234, NF-001235" /></Field>
                    <div className="grid grid-cols-2 gap-3 pt-2">
                        <button type="button" onClick={onClose} className="py-3 bg-slate-100 text-slate-500 font-black rounded-xl text-[10px] tracking-widest uppercase hover:bg-slate-200 transition-all">Cancelar</button>
                        <button type="submit" className="py-3 bg-secondary text-primary font-black rounded-xl text-[10px] tracking-widest uppercase hover:bg-secondary/90 transition-all shadow-lg shadow-black/10 flex items-center justify-center gap-1.5 focus:ring-4 focus:ring-secondary/20 outline-none"><Save className="w-3.5 h-3.5" aria-hidden="true" /> Salvar</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function Field({ id, label, required, children }) {
    return (
        <div className="space-y-1.5">
            <label htmlFor={id} className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}{required && ' *'}</label>
            {React.cloneElement(children, { 
                id,
                className: 'w-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-4 text-sm font-bold focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all' 
            })}
        </div>
    );
}

// ========== MODAL DETALHES / GESTÃO DE PÁTIO ==========
function DetalhesModal({ agenda, onTransition, onClose }) {
    const cfg = STATUS_CFG[agenda.status];
    const trans = TRANSITION_MAP[agenda.status];

    const modalId = useId();

    useEffect(() => {
        const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[90] flex items-center justify-center p-4" onClick={onClose}>
            <div 
                role="dialog" 
                aria-modal="true" 
                aria-labelledby={`${modalId}-title`}
                className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" 
                onClick={e => e.stopPropagation()}
            >
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: cfg.bg, border: `2px solid ${cfg.border}` }}>
                            <Truck className="w-5 h-5" style={{ color: cfg.color }} aria-hidden="true" />
                        </div>
                        <div>
                            <h3 id={`${modalId}-title`} className="text-base font-black">{agenda.transportadora}</h3>
                            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: cfg.color }}>{cfg.label}</p>
                        </div>
                    </div>
                    <button onClick={onClose} aria-label="Fechar modal" className="p-2 text-slate-400 hover:text-danger transition-colors"><X className="w-5 h-5" aria-hidden="true" /></button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <InfoCard icon={Building2} label="Depositante" value={agenda.depositante} />
                        <InfoCard icon={MapPin} label="Doca" value={agenda.doca} />
                        <InfoCard icon={User} label="Motorista" value={agenda.motorista || '—'} />
                        <InfoCard icon={Truck} label="Veículo" value={agenda.veiculo || '—'} />
                        <InfoCard icon={Clock} label="Início" value={fmtHora(agenda.dataInicio)} />
                        <InfoCard icon={Clock} label="Fim" value={fmtHora(agenda.dataFim)} />
                        <InfoCard icon={Package} label="Volumes" value={`${agenda.qtdVolume} vol.`} />
                        <InfoCard icon={FileText} label="NFs" value={agenda.notasFiscais || '—'} />
                    </div>

                    {/* Histórico de transições */}
                    <div className="space-y-2">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Histórico de Transições</p>
                        <div className="space-y-1.5 max-h-40 overflow-y-auto">
                            {agenda.historico?.map((h, i) => (
                                <div key={i} className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_CFG[h.status]?.color || '#94A3B8' }} />
                                        <span className="text-[9px] font-black uppercase">{STATUS_CFG[h.status]?.label || h.status}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[8px] font-bold text-slate-400 font-mono">{new Date(h.data).toLocaleString('pt-BR')}</span>
                                        <span className="text-[8px] text-slate-300 ml-2">por {h.usuario}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Botão de transição */}
                    {trans && (
                        <button onClick={() => onTransition(agenda.id, trans.next)} className="w-full py-3.5 font-black rounded-xl text-[10px] tracking-widest uppercase transition-all shadow-lg flex items-center justify-center gap-2 text-white focus:ring-4 focus:ring-slate-900/10 outline-none" style={{ backgroundColor: STATUS_CFG[trans.next]?.color || '#3B82F6' }}>
                            <trans.icon className="w-4 h-4" aria-hidden="true" /> {trans.label}
                        </button>
                    )}
                    {!trans && (
                        <div role="status" className="w-full py-3.5 bg-success/10 text-success font-black rounded-xl text-[10px] tracking-widest uppercase text-center flex items-center justify-center gap-2">
                            <CheckCircle2 className="w-4 h-4" aria-hidden="true" /> Agenda Finalizada
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function InfoCard({ icon: Icon, label, value }) {
    return (
        <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Icon className="w-2.5 h-2.5" aria-hidden="true" /> {label}</p>
            <p className="text-xs font-black truncate">{value}</p>
        </div>
    );
}

// ========== POPUP TIPO ==========
function TipoPopup({ x, y, onSelect, onClose }) {
    const popupId = useId();
    const firstBtnRef = useRef(null);

    useEffect(() => {
        const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handleEsc);
        firstBtnRef.current?.focus();
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-[85]" onClick={onClose}>
            <div 
                role="dialog"
                aria-modal="true"
                aria-labelledby={`${popupId}-title`}
                className="absolute bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-3 space-y-2 animate-in fade-in zoom-in-95 duration-200 min-w-[220px]" 
                style={{ top: y, left: x }} 
                onClick={e => e.stopPropagation()}
            >
                <p id={`${popupId}-title`} className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Qual o tipo de agendamento?</p>
                <button 
                    ref={firstBtnRef}
                    onClick={() => onSelect('Recebimento')} 
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black hover:bg-blue-50 hover:text-blue-600 transition-all bg-blue-50/50 border border-blue-100 focus:ring-4 focus:ring-blue-500/10 outline-none"
                >
                    <ArrowDownLeft className="w-4 h-4 text-blue-500" aria-hidden="true" /> Recebimento
                </button>
                <button 
                    onClick={() => onSelect('Expedição')} 
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black hover:bg-green-50 hover:text-green-600 transition-all bg-green-50/50 border border-green-100 focus:ring-4 focus:ring-green-500/10 outline-none"
                >
                    <ArrowUpRight className="w-4 h-4 text-green-500" aria-hidden="true" /> Expedição
                </button>
            </div>
        </div>
    );
}

// ========== COMPONENTE PRINCIPAL ==========
export default function TransportSchedule() {
    const { transportSchedules, transportSchedulesCrud } = useApp();

    const [view, setView] = useState('semanal');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showAgendamento, setShowAgendamento] = useState(null); // { tipo }
    const [showDetalhes, setShowDetalhes] = useState(null);
    const [tipoPopup, setTipoPopup] = useState(null);
    const [newSlotTime, setNewSlotTime] = useState(null);

    // ========== Navegação de datas ==========
    const navigateDate = (dir) => {
        const days = view === 'dia' ? 1 : view === 'quatroDias' ? 4 : view === 'semanal' ? 7 : 30;
        setSelectedDate(prev => addDays(prev, dir * days));
    };

    // ========== Colunas de dias visíveis ==========
    const visibleDays = useMemo(() => {
        if (view === 'dia') return [new Date(selectedDate)];
        if (view === 'quatroDias') return Array.from({ length: 4 }, (_, i) => addDays(selectedDate, i));
        if (view === 'semanal') { const start = getStartOfWeek(selectedDate); return Array.from({ length: 7 }, (_, i) => addDays(start, i)); }
        return []; // mensal usa outro layout
    }, [view, selectedDate]);

    // ========== Agendamentos do período ==========
    const getAgendaForSlot = useCallback((day, hour) => {
        return transportSchedules.filter(a => {
            const inicio = new Date(a.dataInicio);
            return isSameDay(inicio, day) && inicio.getHours() === hour;
        });
    }, [transportSchedules]);

    // ========== Handlers ==========
    const handleSlotClick = (e, day, hour) => {
        const start = new Date(day);
        start.setHours(hour, 0, 0, 0);
        setNewSlotTime(start);
        setTipoPopup({ x: e.clientX, y: e.clientY });
    };

    const handleTipoSelect = (tipo) => {
        setTipoPopup(null);
        const ini = newSlotTime;
        const fim = new Date(ini); fim.setHours(fim.getHours() + 2);
        setShowAgendamento({
            tipo,
            initial: {
                tipo,
                dataInicio: ini.toISOString().slice(0, 16),
                dataFim: fim.toISOString().slice(0, 16),
            }
        });
    };

    const handleSaveAgendamento = (data) => {
        transportSchedulesCrud.add(data);
        setShowAgendamento(null);
    };

    const handleTransition = (id, nextStatus) => {
        const agenda = transportSchedules.find(a => a.id === id);
        if (!agenda) return;
        const updatedHistorico = [...(agenda.historico || []), { status: nextStatus, data: new Date().toISOString(), usuario: 'danilo.supervisor' }];
        transportSchedulesCrud.update(id, { status: nextStatus, historico: updatedHistorico });
        setShowDetalhes(null);
    };

    // ========== Vista Mensal ==========
    const renderMonthView = () => {
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = new Date(year, month, 1).getDay();
        const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

        return (
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-700">
                    {DIAS_SEMANA.map(d => <th key={d} scope="col" className="py-3 text-center text-[8px] font-black text-slate-400 uppercase tracking-widest">{d}</th>)}
                </div>
                <div className="grid grid-cols-7">
                    {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} className="min-h-[100px] border-r border-b border-slate-100 dark:border-slate-800" />)}
                    {Array.from({ length: daysInMonth }, (_, i) => {
                        const day = new Date(year, month, i + 1);
                        const dayAgendas = transportSchedules.filter(a => isSameDay(new Date(a.dataInicio), day));
                        const isToday = isSameDay(day, new Date());
                        return (
                            <div key={i} className={`min-h-[100px] p-2 border-r border-b border-slate-100 dark:border-slate-800 cursor-pointer hover:bg-slate-50/50 transition-all ${isToday ? 'bg-primary/5' : ''}`} onClick={(e) => handleSlotClick(e, day, 8)}>
                                <p className={`text-xs font-black mb-1 ${isToday ? 'text-primary' : 'text-slate-500'}`}>{i + 1}</p>
                                <div className="space-y-1">
                                    {dayAgendas.slice(0, 3).map(a => {
                                        const cfg = STATUS_CFG[a.status];
                                        return (
                                            <div key={a.id} onClick={(e) => { e.stopPropagation(); setShowDetalhes(a); }} className="px-1.5 py-1 rounded-lg text-[7px] font-black truncate cursor-pointer hover:opacity-80 transition-all" style={{ backgroundColor: cfg.bg, color: cfg.color, borderLeft: `3px solid ${cfg.color}` }}>
                                                {fmtHora(a.dataInicio)} {a.transportadora}
                                            </div>
                                        );
                                    })}
                                    {dayAgendas.length > 3 && <p className="text-[7px] font-bold text-slate-400">+{dayAgendas.length - 3} mais</p>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    // ========== Vista De Grade (Dia / 4 Dias / Semanal) ==========
    const renderGridView = () => (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full border-collapse min-w-[600px]">
                    <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-700">
                            <th scope="col" className="w-16 p-2 text-[7px] font-black text-slate-400 uppercase tracking-widest">Hora</th>
                            {visibleDays.map((d, i) => {
                                const isToday = isSameDay(d, new Date());
                                return (
                                    <th key={i} scope="col" className={`p-2 text-center ${isToday ? 'bg-primary/5' : ''}`}>
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{fmtBR(d)}</p>
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {HORAS.map(hour => (
                            <tr key={hour} className="border-b border-slate-50 dark:border-slate-800/50">
                                <td className="p-2 text-center text-[9px] font-bold font-mono text-slate-400 border-r border-slate-100 dark:border-slate-800">{String(hour).padStart(2, '0')}:00</td>
                                {visibleDays.map((day, di) => {
                                    const agendas = getAgendaForSlot(day, hour);
                                    const isToday = isSameDay(day, new Date());
                                    return (
                                        <td key={di} className={`p-1 border-r border-slate-50 dark:border-slate-800/50 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all align-top min-w-[120px] ${isToday ? 'bg-primary/[0.02]' : ''}`} onClick={(e) => agendas.length === 0 && handleSlotClick(e, day, hour)}>
                                            {agendas.map(a => {
                                                const cfg = STATUS_CFG[a.status];
                                                return (
                                                    <div key={a.id} onClick={(e) => { e.stopPropagation(); setShowDetalhes(a); }} className="p-2 rounded-xl mb-1 cursor-pointer hover:shadow-md transition-all border-l-4" style={{ backgroundColor: cfg.bg, borderColor: cfg.color }}>
                                                        <p className="text-[8px] font-black truncate" style={{ color: cfg.color }}>{a.tipo === 'Recebimento' ? '📥' : '📤'} {a.transportadora}</p>
                                                        <p className="text-[7px] font-bold text-slate-400 truncate">{a.depositante} • {a.doca}</p>
                                                        <p className="text-[7px] font-bold font-mono text-slate-400">{fmtHora(a.dataInicio)}–{fmtHora(a.dataFim)}</p>
                                                    </div>
                                                );
                                            })}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const VIEW_LABELS = { dia: 'Um Dia', quatroDias: 'Quatro Dias', semanal: 'Semanal', mensal: 'Mensal' };

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Modais */}
            {showAgendamento && <AgendamentoModal tipo={showAgendamento.tipo} initial={showAgendamento.initial} onSave={handleSaveAgendamento} onClose={() => setShowAgendamento(null)} />}
            {showDetalhes && <DetalhesModal agenda={showDetalhes} onTransition={handleTransition} onClose={() => setShowDetalhes(null)} />}
            {tipoPopup && <TipoPopup x={tipoPopup.x} y={tipoPopup.y} onSelect={handleTipoSelect} onClose={() => setTipoPopup(null)} />}

            {/* Cabeçalho */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black tracking-tight">3.3 Agendar Transportes</h1>
                    <p className="text-sm text-slate-500 font-medium">Controle de pátio e agendamento de veículos</p>
                </div>
            </div>

            {/* Barra de Visão */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-3 shadow-sm flex flex-wrap items-center gap-2">
                {Object.entries(VIEW_LABELS).map(([k, v]) => (
                    <button key={k} onClick={() => setView(k)} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${view === k ? 'bg-secondary text-primary shadow-lg' : 'bg-slate-50 dark:bg-slate-900 text-slate-500 hover:bg-slate-100 border border-slate-200 dark:border-slate-700'}`}>{v}</button>
                ))}
                <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
                <button onClick={() => setSelectedDate(new Date())} className="px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest bg-primary/10 text-primary hover:bg-primary/20 transition-all flex items-center gap-1.5 focus:ring-4 focus:ring-primary/5 outline-none"><RefreshCw className="w-3 h-3" aria-hidden="true" /> Hoje</button>
                <div className="flex-1" />
                <div className="flex items-center gap-2">
                    <button onClick={() => navigateDate(-1)} aria-label="Período anterior" className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-secondary hover:text-primary transition-all focus:ring-4 focus:ring-secondary/20 outline-none">
                        <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                    </button>
                    <span className="text-xs font-black min-w-[160px] text-center">{view === 'mensal' ? selectedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) : view === 'dia' ? selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' }) : `${fmtBR(visibleDays[0])} — ${fmtBR(visibleDays[visibleDays.length - 1])}`}</span>
                    <button onClick={() => navigateDate(1)} aria-label="Próximo período" className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-secondary hover:text-primary transition-all focus:ring-4 focus:ring-secondary/20 outline-none">
                        <ChevronRight className="w-4 h-4" aria-hidden="true" />
                    </button>
                </div>
            </div>

            {/* Layout: Sidebar + Calendário */}
            <div className="flex gap-4">
                {/* Painel Lateral */}
                <div className="hidden lg:flex flex-col gap-4 w-64 shrink-0">
                    <MiniCalendar selectedDate={selectedDate} onSelect={(d) => setSelectedDate(d)} />

                    {/* Legenda */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 space-y-3">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Legenda de Status</p>
                        {Object.entries(STATUS_CFG).map(([key, cfg]) => (
                            <div key={key} className="flex items-center gap-2.5">
                                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cfg.color }} />
                                <span className="text-[9px] font-bold text-slate-600">{cfg.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Resumo do dia */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 space-y-2">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Resumo de Hoje</p>
                        {Object.entries(STATUS_CFG).map(([key, cfg]) => {
                            const count = transportSchedules.filter(a => a.status === key && isSameDay(new Date(a.dataInicio), new Date())).length;
                            if (count === 0) return null;
                            return (
                                <div key={key} className="flex items-center justify-between">
                                    <span className="text-[9px] font-bold" style={{ color: cfg.color }}>{cfg.label}</span>
                                    <span className="text-xs font-black font-mono" style={{ color: cfg.color }}>{count}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Calendário */}
                <div className="flex-1 min-w-0">
                    {view === 'mensal' ? renderMonthView() : renderGridView()}
                </div>
            </div>
        </div>
    );
}
