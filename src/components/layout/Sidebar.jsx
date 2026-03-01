import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { 
  ChevronRight, 
  ChevronDown,
  Menu,
  X,
  LayoutDashboard,
  ArrowRightLeft,
  RotateCcw,
  Scale,
  PackageSearch,
  ArrowDownLeft,
  Map,
  ClipboardCheck,
  MapPin,
  ShoppingCart,
  Grid3X3,
  Activity,
  PackagePlus,
  Wrench,
  ShieldCheck,
  Waves,
  Clock,
  Calendar,
  Truck,
  Building2,
  DoorOpen,
  FileText,
  AlertTriangle,
  FileCheck,
  Home,
  DollarSign,
  Warehouse,
  Layers,
  Printer,
  PieChart,
  Shield,
  Plug,
  AlertCircle,
  RefreshCcw,
  Files,
  CloudCog,
  Settings2,
  Headphones,
  Trash2,
  Lock,
  User,
  ListTodo,
  BarChart3,
  HelpCircle
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import Tooltip from "../ui/Tooltip";

const NAVIGATION = [
  {
    title: "OPERAR",
    icon: Activity,
    items: [
      { label: "1.1 Cruzar Docas", icon: ArrowRightLeft, path: "/operacao/cruzar-docas" },
      { label: "1.2 Processar Devoluções", icon: RotateCcw, path: "/operacao/processar-devolucoes" },
      { label: "1.3 Pesar Cargas", icon: Scale, path: "/operacao/pesar-cargas" },
      { label: "1.4 Gerenciar Recebimento", icon: PackageSearch, path: "/operacao/gerenciar-recebimento" },
      { label: "1.5 Conferir Recebimento", icon: ArrowDownLeft, path: "/operacao/conferir-recebimento" },
      { label: "1.6 Gerar Mapa de Alocação", icon: Map, path: "/operacao/gerar-mapa" },
      { label: "1.7 Realizar Conferência Cega", icon: ClipboardCheck, path: "/operacao/conferencia-cega" },
      { label: "1.8 Alocar Estoque", icon: MapPin, path: "/operacao/alocar-estoque" },
      { label: "1.9 Kanban de Alocação", icon: LayoutDashboard, path: "/operacao/kanban-alocacao" },
      { label: "1.10 Separar Pedidos", icon: ShoppingCart, path: "/operacao/separar-pedidos" },
      { label: "1.11 Embalar Pedidos", icon: Grid3X3, path: "/operacao/embalar-pedidos" },
      { label: "1.12 Monitorar Saída", icon: Activity, path: "/operacao/monitorar-saida" },
      { label: "1.13 Recebimento (Check-in)", icon: ArrowDownLeft, path: "/operacao/recebimento" },
      { label: "1.14 Estação de Kits", icon: PackagePlus, path: "/operacao/estacao-kits" },
      { label: "1.15 Conferência Colmeia", icon: Grid3X3, path: "/operacao/conferencia-colmeia" },
      { label: "1.16 Ordem de Serviço", icon: Wrench, path: "/operacao/ordem-servico" },
      { label: "1.17 Gestão de Seguros", icon: ShieldCheck, path: "/operacao/gestao-seguros" },
      { label: "1.18 Pesagem Rodoviária", icon: Scale, path: "/operacao/pesagem-rodoviaria" },
    ]
  },
  {
    title: "PLANEJAR",
    icon: Calendar,
    items: [
      { label: "2.1 Gerar Ondas de Separação", icon: Waves, path: "/planejamento/gerar-ondas" },
      { label: "2.2 Monitorar Prazos (SLA)", icon: Clock, path: "/planejamento/monitorar-prazos" },
      { label: "2.3 Agendar Transportes", icon: Calendar, path: "/planejamento/agendar-transportes" },
      { label: "2.4 Monitorar Atividades", icon: Activity, path: "/planejamento/monitorar-atividades" },
      { label: "2.5 Gerenciar Manifestos", icon: Truck, path: "/planejamento/gerenciar-manifestos" },
      { label: "2.6 Expedir Cargas", icon: PackageSearch, path: "/planejamento/expedir-cargas" },
      { label: "2.7 Gerenciar Portaria", icon: Building2, path: "/planejamento/gerenciar-portaria" },
      { label: "2.8 Atividades de Docas", icon: DoorOpen, path: "/planejamento/atividades-docas" },
    ]
  },
  {
    title: "CONTROLAR",
    icon: PackageSearch,
    items: [
      { label: "3.1 Auditar Inventário", icon: ShieldCheck, path: "/estoque/auditar-inventario" },
      { label: "3.2 Consultar Kardex", icon: FileText, path: "/estoque/consultar-kardex" },
      { label: "3.3 Analisar Estoque", icon: BarChart3, path: "/estoque/analisar-estoque" },
      { label: "3.4 Remanejar Produtos", icon: RotateCcw, path: "/estoque/remanejar" },
      { label: "3.5 Controlar Lotes e Validade", icon: Calendar, path: "/estoque/controlar-lotes" },
      { label: "3.6 Monitorar Avarias", icon: AlertTriangle, path: "/estoque/monitorar-avarias" },
      { label: "3.7 Gestão de Inventário", icon: PackageSearch, path: "/estoque/gestao-inventario" },
    ]
  },
  {
    title: "FISCAL",
    icon: FileText,
    items: [
      { label: "4.1 Gerenciar NF-e", icon: FileCheck, path: "/fiscal/gerenciar-nfe" },
      { label: "4.2 Gerenciar CT-e", icon: Truck, path: "/fiscal/gerenciar-cte" },
      { label: "4.3 Emitir Cobertura Fiscal", icon: FileText, path: "/fiscal/emitir-cobertura" },
      { label: "4.4 Controlar Armazém Geral", icon: Home, path: "/fiscal/armazem-geral" },
    ]
  },
  {
    title: "FINANCEIRO",
    icon: DollarSign,
    items: [
      { label: "5.1 Calcular Diárias", icon: DollarSign, path: "/financeiro/calcular-diarias" },
      { label: "5.2 Gerenciar Contratos", icon: FileText, path: "/financeiro/contratos" },
    ]
  },
  {
    title: "CADASTRAR",
    icon: Home,
    items: [
      { label: "6.1 Gerenciar Empresas", icon: Home, path: "/cadastros/empresas" },
      { label: "6.2 Configurar Armazéns", icon: Warehouse, path: "/cadastros/armazens" },
      { label: "6.3 Cadastrar Endereços", icon: MapPin, path: "/cadastros/enderecos" },
      { label: "6.4 Catálogo de Produtos", icon: PackageSearch, path: "/cadastros/produtos" },
      { label: "6.5 Cadastrar Rotas e Veículos", icon: Truck, path: "/cadastros/rotas-veiculos" },
      { label: "6.6 Configurar Áreas", icon: Grid3X3, path: "/cadastros/areas" },
      { label: "6.7 Configurar Setores", icon: Layers, path: "/cadastros/setores" },
      { label: "6.8 Gerenciar Etiquetas", icon: Printer, path: "/config/etiquetas" },
    ]
  },
  {
    title: "INDICADORES",
    icon: BarChart3,
    items: [
      { label: "7.1 Dashboard Financeiro", icon: BarChart3, path: "/indicadores/financeiro" },
      { label: "7.2 Analisar Ocupação", icon: PieChart, path: "/indicadores/ocupacao" },
      { label: "7.3 Medir Produtividade", icon: Activity, path: "/indicadores/produtividade" },
      { label: "7.4 Auditar Logs do Sistema", icon: Shield, path: "/indicadores/auditoria" },
      { label: "7.5 Resultados de Integração", icon: Plug, path: "/indicadores/integracao" },
    ]
  },
  {
    title: "INTEGRAR",
    icon: Plug,
    items: [
      { label: "8.1 Alertas de Integração", icon: AlertCircle, path: "/integrar/alertas" },
      { label: "8.2 Sincronizar Ordens ERP", icon: RefreshCcw, path: "/integrar/ordens-erp" },
      { label: "8.3 Conectar Omie ERP", icon: Plug, path: "/integrar/omie" },
      { label: "8.4 Mapear Arquivos (Layouts)", icon: Files, path: "/integrar/arquivos" },
      { label: "8.5 Configurar APIs REST", icon: CloudCog, path: "/integrar/apis" },
      { label: "8.6 Integrar Ondas (Arquivo)", icon: Waves, path: "/integrar/ondas" },
    ]
  },
  {
    title: "CONFIGURAR",
    icon: Settings2,
    items: [
      { label: "9.1 Ajustar Configurações", icon: Settings2, path: "/config/geral" },
      { label: "9.2 Integrar Balanças (Serial)", icon: Scale, path: "/config/balancas" },
      { label: "9.3 Gerenciar Service Desk", icon: Headphones, path: "/config/service-desk" },
      { label: "9.4 Expurgar Dados Antigos", icon: Trash2, path: "/config/expurgo" },
      { label: "9.5 Gerenciar Certificados", icon: Lock, path: "/config/certificados" },
    ]
  },
  {
    title: "SEGURANÇA",
    icon: Shield,
    items: [
      { label: "10.1 Gerenciar Usuários", icon: User, path: "/seguranca/usuarios" },
      { label: "10.2 Definir Grupos de Acesso", icon: Shield, path: "/seguranca/grupos" },
    ]
  }
];

export default function Sidebar({ isOpen: parentIsOpen, toggleSidebar: parentToggleSidebar }) {
  const [collapsed, setCollapsed] = useState(true);
  const [activeSection, setActiveSection] = useState(null);
  const { currentUser } = useApp();

  const handleToggleSidebar = () => {
    const nextState = !collapsed;
    setCollapsed(nextState);
    if (parentToggleSidebar) parentToggleSidebar();
  };

  const handleNavigate = () => {
    setCollapsed(true);
  };

  const toggleSection = (sectionTitle) => {
    if (collapsed) {
      setCollapsed(false);
      if (parentToggleSidebar) parentToggleSidebar();
      setActiveSection(sectionTitle);
    } else {
      setActiveSection(activeSection === sectionTitle ? null : sectionTitle);
    }
  };

  const initials = currentUser?.nome 
    ? currentUser.nome.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() 
    : "VP";

  return (
    <>
      {/* Mobile Overlay */}
      {!collapsed && (
        <div 
          className="fixed inset-0 bg-black/40 z-[49] lg:hidden backdrop-blur-sm"
          onClick={handleNavigate}
        />
      )}

      {/* Sidebar Main */}
      <aside className={`
        fixed left-0 top-0 h-screen bg-[#0d0d0d] text-white
        transition-all duration-300 ease-in-out z-40 flex flex-col
        ${collapsed ? 'w-16' : 'w-72'}
        lg:translate-x-0
        ${!collapsed ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        
        {/* Branding Area */}
        <div className="h-24 bg-[#ffcd00] relative flex items-center px-4 shrink-0">
          <div className="w-14 h-14 bg-black rounded-xl p-1 shrink-0 flex items-center justify-center shadow-lg">
            <img 
              src="/img/logo amarelosvg.svg" 
              alt="VerticalParts" 
              className="w-full h-full object-contain"
              onError={(e) => { e.target.src = '/Favicon.svg'; }}
            />
          </div>
          {!collapsed && (
            <div className="ml-3 flex flex-col animate-in fade-in slide-in-from-left-2 duration-300">
              <span className="text-black font-black text-lg tracking-tighter leading-none uppercase">
                VerticalParts
              </span>
              <span className="text-black/70 text-[9px] font-bold uppercase tracking-widest mt-1">
                WMS Enterprise
              </span>
            </div>
          )}

          {/* Expand/Collapse Trigger */}
          <button 
            onClick={handleToggleSidebar}
            className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#ffcd00] rounded-full flex items-center justify-center text-black border-2 border-[#ffcd00]/30 hover:scale-110 transition-transform shadow-lg z-50"
          >
            {collapsed ? <ChevronRight size={14} strokeWidth={3} /> : <ChevronLeft size={14} strokeWidth={3} />}
          </button>
        </div>

        {/* Dashboard Item (Outside accordions) */}
        <div className="pt-4 border-b border-white/5">
          <NavLink
            to="/"
            onClick={handleNavigate}
            className={({ isActive }) => `
              flex items-center gap-3 px-5 py-3 text-[11px] font-bold transition-all duration-200
              ${isActive ? 'text-[#ffcd00] bg-[#ffcd00]/10 border-l-2 border-[#ffcd00]' : 'text-[#a0a0a0] hover:bg-white/5'}
            `}
          >
            {collapsed ? (
              <Tooltip text="Dashboard Geral">
                <LayoutDashboard className={`w-4 h-4 mx-auto ${collapsed ? '' : 'shrink-0'}`} />
              </Tooltip>
            ) : (
              <>
                <LayoutDashboard className="w-4 h-4 shrink-0" />
                <span className="truncate">Dashboard Geral</span>
              </>
            )}
          </NavLink>
        </div>

        {/* Navigation Content */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar py-2">
          {NAVIGATION.map((group) => {
            const Icon = group.icon;
            const isOpen = activeSection === group.title;

            return (
              <div key={group.title} className="mb-px border-b border-white/5 last:border-0">
                {/* Section Header */}
                <button
                  onClick={() => toggleSection(group.title)}
                  className={`
                    w-full flex items-center gap-3 px-5 py-3 transition-colors
                    hover:bg-white/5 group
                    ${isOpen ? 'bg-white/5' : ''}
                  `}
                >
                  {collapsed ? (
                    <Tooltip text={group.title}>
                      <Icon className={`w-4 h-4 mx-auto transition-colors ${isOpen ? 'text-[#ffcd00]' : 'text-[#4a4a4a]'}`} />
                    </Tooltip>
                  ) : (
                    <>
                      <Icon className={`w-4 h-4 shrink-0 transition-colors ${isOpen ? 'text-[#ffcd00]' : 'text-[#4a4a4a]'}`} />
                      <span className="flex-1 text-left text-[9px] font-black text-[#ffcd00] tracking-[0.2em] uppercase">
                        {group.title}
                      </span>
                      <ChevronDown 
                        className={`w-3 h-3 text-[#4a4a4a] transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#ffcd00]' : ''}`} 
                      />
                    </>
                  )}
                </button>

                {/* Submenu Items */}
                {!collapsed && isOpen && (
                  <div className="bg-black/40 animate-in slide-in-from-top-1 duration-200">
                    {group.items.map((item) => {
                      const SubIcon = item.icon;
                      return (
                        <NavLink
                          key={item.label}
                          to={item.path}
                          onClick={handleNavigate}
                          className={({ isActive }) => `
                            flex items-center gap-3 pl-10 pr-5 py-2 text-[11px] font-bold transition-all duration-200
                            ${isActive 
                              ? 'text-[#ffcd00] bg-[#ffcd00]/10 border-l-2 border-[#ffcd00] font-black' 
                              : 'text-[#a0a0a0] hover:bg-white/5'
                            }
                          `}
                        >
                          <SubIcon className="w-4 h-4 shrink-0 opacity-70" />
                          <span className="truncate">{item.label}</span>
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* User Footer */}
        <div className="bg-[#1a1a1a] p-4 border-t border-white/5 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-[#ffcd00] flex items-center justify-center shrink-0 shadow-md">
              <span className="text-xs font-black text-black">{initials}</span>
            </div>
            {!collapsed && (
              <div className="flex flex-col min-w-0 animate-in fade-in slide-in-from-left-2 duration-300">
                <span className="text-white font-black text-[11px] truncate uppercase leading-none">
                  {currentUser?.nome || "VerticalParts User"}
                </span>
                <span className="text-[#ffcd00]/60 text-[8px] font-bold uppercase tracking-widest mt-1">
                  {currentUser?.role || "Administrador"}
                </span>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

// ChevronLeft helper
function ChevronLeft({ size, strokeWidth }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth={strokeWidth} 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="m15 18-6-6 6-6"/>
    </svg>
  );
}
