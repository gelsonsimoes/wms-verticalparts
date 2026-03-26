import React, { useState, useEffect, useRef, useId, useCallback } from 'react';
import {
  PackageSearch,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Search,
  ClipboardList,
  Info,
  AlertCircle,
  X,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { supabase } from '../lib/supabaseClient'; // Realtime subscription (mantém supabase direto — necessário para channel/subscribe)
import { alocacaoService } from '../services/alocacaoService';
import { useApp } from '../hooks/useApp';
import EnterprisePageBase from '../components/layout/EnterprisePageBase';

function cn(...inputs) { return twMerge(clsx(inputs)); }

export default function StockAllocation() {
  const { warehouseId } = useApp();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Pendentes');

  // Painel de Operação State
  const [scannedItem, setScannedItem] = useState('');
  const [scannedAddress, setScannedAddress] = useState('');
  const [allocatedQty, setAllocatedQty] = useState('');
  const [suggestedAddress, setSuggestedAddress] = useState('---');
  const [activeTask, setActiveTask] = useState(null);

  // Alerta de Divergência
  const [showDivergenceAlert, setShowDivergenceAlert] = useState(false);
  const allocId = useId();

  const itemInputRef = useRef(null);
  const addressInputRef = useRef(null);

  // Toast System
  const [toast, setToast] = useState(null);
  const toastTimeoutRef = useRef(null);

  const showToast = (message, type = 'success') => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ message, type });
    toastTimeoutRef.current = setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => () => { if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current); }, []);

  /* ── Mapeia linha do DB para estado local ── */
  const mapAlocacao = (a) => ({
    id: a.id,
    or: a.ordem_id,
    depositante: a.depositante || '',
    produto: a.produto || '',
    lote: a.lote || '',
    qtdTotal: Math.max(0, (a.quantidade || 1) - (a.quantidade_alocada || 0)),
    qtdOriginal: a.quantidade || 1,
    qtdAlocada: a.quantidade_alocada || 0,
    enderecoSugerido: a.endereco_sugerido || '---',
    status: a.status === 'Posicionado' ? 'Finalizado' : a.status,
  });

  const fetchTasks = useCallback(async () => {
    if (!warehouseId) return;
    setLoading(true);
    const { data, error } = await alocacaoService.getPendentes(warehouseId);

    if (error) { setLoading(false); showToast('Erro ao carregar tarefas de alocação.', 'error'); return; }

    let list = (data || []).map(mapAlocacao);

    // Seed from ordens_recebimento_itens when empty
    if (list.length === 0) {
      const { data: ors } = await alocacaoService.getReceivingForSeed(warehouseId);

      if (ors && ors.length > 0) {
        const toInsert = [];
        for (const or of ors) {
          for (const item of (or.ordens_recebimento_itens || [])) {
            toInsert.push({
              warehouse_id: warehouseId,
              ordem_id: or.codigo,
              depositante: or.depositante || '',
              produto: item.sku + (item.descricao ? ` — ${item.descricao}` : ''),
              lote: item.lote || '',
              quantidade: item.quantidade || 1,
              status: 'Pendente',
            });
          }
        }
        if (toInsert.length > 0) {
          await alocacaoService.insertMany(toInsert);
          const { data: refreshed } = await alocacaoService.getPendentes(warehouseId);
          list = (refreshed || []).map(mapAlocacao);
        }
      }
    }

    setTasks(list);
    setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [warehouseId]);

  useEffect(() => {
    fetchTasks();
    if (itemInputRef.current) itemInputRef.current.focus();
    if (!warehouseId) return;
    const ch = supabase
      .channel('alocacoes_stock_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'alocacoes', filter: `warehouse_id=eq.${warehouseId}` }, fetchTasks)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [warehouseId, fetchTasks]);

  const handleScanItem = (e) => {
    if (e.key === 'Enter') {
      const query = scannedItem.trim();
      const task = tasks.find(t =>
        t.status !== 'Finalizado' && (
          t.lote.toLowerCase() === query.toLowerCase() ||
          t.produto.toLowerCase().includes(query.toLowerCase())
        )
      );
      if (task) {
        setActiveTask(task);
        setSuggestedAddress(task.enderecoSugerido);
        setAllocatedQty(task.qtdTotal.toString());
        if (addressInputRef.current) addressInputRef.current.focus();
      } else {
        showToast('Lote ou Produto não encontrado na fila de alocação.', 'error');
      }
    }
  };

  // Confirmação normal (com verificação de divergência)
  const handleConfirmAllocation = () => {
    if (!activeTask || !scannedAddress.trim()) {
      showToast('Identifique o produto e o endereço de destino.', 'error');
      return;
    }
    const qty = Number(allocatedQty);
    if (!allocatedQty || isNaN(qty) || qty <= 0 || qty > activeTask.qtdTotal) {
      showToast(`Quantidade inválida. Deve ser entre 1 e ${activeTask.qtdTotal}.`, 'error');
      return;
    }
    if (scannedAddress.trim().toUpperCase() !== suggestedAddress.toUpperCase() && !showDivergenceAlert) {
      setShowDivergenceAlert(true);
      return;
    }
    confirmAllocation();
  };

  // Confirmação forçada (após aceitar divergência)
  const confirmForced = () => { confirmAllocation(); };

  // Núcleo da confirmação — persiste no Supabase
  const confirmAllocation = async () => {
    const qty = Number(allocatedQty);
    const newQtdAlocada = activeTask.qtdAlocada + qty;
    const newStatus = newQtdAlocada >= activeTask.qtdOriginal ? 'Posicionado' : 'Pendente';
    const novoEndereco = scannedAddress.trim().toUpperCase();

    await alocacaoService.update(activeTask.id, {
      quantidade_alocada: newQtdAlocada,
      status: newStatus,
      endereco_sugerido: novoEndereco,
    });

    setTasks(prev => prev.map(t =>
      t.id === activeTask.id
        ? { ...t, qtdTotal: activeTask.qtdOriginal - newQtdAlocada, qtdAlocada: newQtdAlocada, status: newStatus === 'Posicionado' ? 'Finalizado' : 'Pendente', enderecoSugerido: novoEndereco }
        : t
    ));
    showToast('Alocação confirmada com sucesso!', 'success');
    resetPanel();
  };

  const resetPanel = () => {
    setScannedItem('');
    setScannedAddress('');
    setAllocatedQty('');
    setSuggestedAddress('---');
    setActiveTask(null);
    setShowDivergenceAlert(false);
    if (itemInputRef.current) itemInputRef.current.focus();
  };

  const filteredTasks = tasks.filter(t => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = t.or.toLowerCase().includes(q) ||
                          t.produto.toLowerCase().includes(q) ||
                          t.lote.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'Pendentes' ? t.status === 'Pendente' : t.status === 'Finalizado';
    return matchesSearch && matchesStatus;
  });

  const actionGroups = [[
    { label: 'Atualizar', icon: RefreshCw, onClick: fetchTasks, disabled: loading },
  ]];

  return (
    <EnterprisePageBase
      title="Alocar Estoque"
      breadcrumbItems={[{ label: 'Operação', href: '/operacao' }, { label: 'Alocar Estoque' }]}
      actionGroups={actionGroups}
    >
      <div className="space-y-6 font-['Poppins']">

        {/* Filtros */}
        <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
          <div className="relative">
            <label htmlFor={`${allocId}-search`} className="sr-only">Buscar OR, Produto ou Lote</label>
            <input
              id={`${allocId}-search`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar OR, Produto ou Lote..."
              className="pr-10 pl-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary/20 outline-none w-64"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden="true" />
          </div>
          <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
            <button
              onClick={() => setStatusFilter('Pendentes')}
              className={cn(
                "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                statusFilter === 'Pendentes' ? "bg-white dark:bg-slate-800 text-primary shadow-sm" : "text-slate-500"
              )}
            >
              Pendentes
            </button>
            <button
              onClick={() => setStatusFilter('Finalizados')}
              className={cn(
                "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                statusFilter === 'Finalizados' ? "bg-white dark:bg-slate-800 text-primary shadow-sm" : "text-slate-500"
              )}
            >
              Finalizados
            </button>
          </div>
          {loading && <div className="flex items-center gap-2 text-xs text-slate-400 ml-auto"><Loader2 className="w-4 h-4 animate-spin" />Carregando...</div>}
        </div>

        {/* Painel de Operação / Bipagem */}
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-slate-900 text-white rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity" aria-hidden="true">
              <PackageSearch className="w-40 h-40" />
            </div>

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
              {/* Display Endereço Sugerido */}
              <div className="lg:col-span-12 flex flex-col md:flex-row items-center justify-between gap-6 border-b border-slate-800 pb-8">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center">
                    <Info className="text-primary w-8 h-8" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Endereço Sugerido pela Inteligência</p>
                    <h2 className="text-4xl font-black text-primary tracking-tighter">{suggestedAddress}</h2>
                  </div>
                </div>
                {activeTask && (
                  <div className="bg-slate-800/50 px-6 py-3 rounded-2xl border border-slate-700">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Produto Selecionado</p>
                    <p className="text-sm font-bold text-slate-200">{activeTask.produto}</p>
                  </div>
                )}
              </div>

              {/* Inputs de Operação */}
              <div className="lg:col-span-4 space-y-2">
                <label htmlFor={`${allocId}-item`} className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">1. Bipar Lote / Produto</label>
                <input
                  id={`${allocId}-item`}
                  ref={itemInputRef}
                  value={scannedItem}
                  onChange={(e) => setScannedItem(e.target.value)}
                  onKeyDown={handleScanItem}
                  placeholder="Escaneie o item..."
                  className="w-full bg-slate-950 border-2 border-slate-800 focus:border-primary rounded-2xl px-6 py-5 text-xl font-black outline-none transition-all placeholder:text-slate-800"
                />
              </div>

              <div className="lg:col-span-4 space-y-2">
                <label htmlFor={`${allocId}-address`} className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">2. Bipar Endereço Destino</label>
                <input
                  id={`${allocId}-address`}
                  ref={addressInputRef}
                  value={scannedAddress}
                  onChange={(e) => setScannedAddress(e.target.value)}
                  placeholder="Confirme o local..."
                  className="w-full bg-slate-950 border-2 border-slate-800 focus:border-primary rounded-2xl px-6 py-5 text-xl font-black outline-none transition-all placeholder:text-slate-800"
                />
              </div>

              <div className="lg:col-span-2 space-y-2">
                <label htmlFor={`${allocId}-qty`} className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Qtd</label>
                <input
                  id={`${allocId}-qty`}
                  type="number"
                  value={allocatedQty}
                  onChange={(e) => setAllocatedQty(e.target.value)}
                  className="w-full bg-slate-950 border-2 border-slate-800 focus:border-primary rounded-2xl px-6 py-5 text-xl font-black outline-none"
                />
              </div>

              <div className="lg:col-span-2">
                <button
                  onClick={handleConfirmAllocation}
                  className="w-full bg-primary text-slate-950 py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/10 hover:bg-yellow-400 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" aria-hidden="true" /> Confirmar
                </button>
              </div>
            </div>
          </div>

          {/* Alerta de Divergência */}
          {showDivergenceAlert && (
            <div role="alertdialog" aria-labelledby="div-title" className="bg-yellow-500/10 border-2 border-yellow-500/30 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 animate-in slide-in-from-top-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/20 shrink-0">
                  <AlertTriangle className="text-slate-950 w-6 h-6" aria-hidden="true" />
                </div>
                <div className="text-left">
                  <h4 id="div-title" className="text-sm font-black text-yellow-600 uppercase tracking-widest">Divergência de Endereçamento</h4>
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-400">Atenção: Guardando em endereço diferente do planejado. Deseja prosseguir?</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDivergenceAlert(false)}
                  className="px-6 py-2 bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-300 rounded-xl text-[10px] font-black uppercase tracking-widest"
                >
                  Não, Corrigir
                </button>
                <button
                  onClick={confirmForced}
                  className="px-6 py-2 bg-yellow-500 text-slate-950 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-yellow-500/20"
                >
                  Sim, Confirmar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Grid de Tarefas */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ClipboardList className="text-slate-400 w-4 h-4" aria-hidden="true" />
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 italic">Fila de Alocação</h3>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-slate-50/50 dark:bg-slate-900/20">
                  <th scope="col" className="px-6 py-4">OR</th>
                  <th scope="col" className="px-6 py-4">Depositante</th>
                  <th scope="col" className="px-6 py-4">Produto</th>
                  <th scope="col" className="px-6 py-4">Lote</th>
                  <th scope="col" className="px-6 py-4 text-center">Qtd</th>
                  <th scope="col" className="px-6 py-4">Ender. Sugerido</th>
                  <th scope="col" className="px-6 py-4 text-right pr-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {filteredTasks.map((t) => (
                  <tr key={t.id} className="group hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                    <td className="px-6 py-4 text-xs font-black text-slate-500">{t.or}</td>
                    <td className="px-6 py-4 text-[10px] font-bold text-slate-400">{t.depositante}</td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200 group-hover:text-primary transition-colors">{t.produto}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-[10px] font-bold font-mono text-slate-500 dark:text-slate-300">{t.lote}</span>
                    </td>
                    <td className="px-6 py-4 text-center text-xs font-black text-slate-700 dark:text-slate-300">{t.qtdTotal}</td>
                    <td className="px-6 py-4 text-xs font-black text-primary">{t.enderecoSugerido}</td>
                    <td className="px-6 py-4 text-right pr-6">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                        t.status === 'Finalizado' ? "bg-success/10 border-success/20 text-success" : "bg-slate-100 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 text-slate-400"
                      )}>
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredTasks.length === 0 && (
              <div className="p-12 text-center">
                <PackageSearch className="w-12 h-12 text-slate-200 dark:text-slate-700 mx-auto mb-4" aria-hidden="true" />
                <p className="text-sm font-bold text-slate-400">Nenhuma tarefa encontrada para os filtros aplicados.</p>
              </div>
            )}
          </div>
        </div>

        {/* Toast Notification */}
        {toast && (
          <div className="fixed bottom-6 right-6 z-[100] animate-in slide-in-from-right-4 duration-300" role="status">
            <div className={cn(
              "flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border-l-4 text-white",
              toast.type === 'success' ? 'bg-green-500 border-green-700' :
              toast.type === 'error'   ? 'bg-red-500 border-red-700' :
              'bg-blue-600 border-blue-800'
            )}>
              {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" aria-hidden="true" /> : <AlertCircle className="w-5 h-5" aria-hidden="true" />}
              <div>
                <p className="text-xs font-black uppercase tracking-widest opacity-70 leading-none mb-1">Notificação</p>
                <p className="text-sm font-bold">{toast.message}</p>
              </div>
              <button onClick={() => setToast(null)} className="ml-4 p-1 hover:bg-black/10 rounded-full transition-colors" aria-label="Fechar notificação">
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>
    </EnterprisePageBase>
  );
}
