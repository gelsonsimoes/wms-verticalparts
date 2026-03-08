import React, { useState, useCallback, memo, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  LayoutDashboard,
  Box,
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
  HelpCircle,
  Inbox,
  Zap,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import Tooltip from "../ui/Tooltip";

const NAVIGATION = [
  {
    title: "2. OPERAR",
    icon: Activity,
    items: [
      { label: "2.1 Cruzar Docas",              icon: ArrowRightLeft, path: "/operacao/cruzar-docas" },
      { label: "2.2 Processar Devoluções",       icon: RotateCcw,     path: "/operacao/processar-devolucoes" },
      { label: "2.3 Pesar Cargas",               icon: Scale,         path: "/operacao/pesar-cargas" },
      { label: "2.4 Gerenciar Recebimento",      icon: PackageSearch, path: "/operacao/gerenciar-recebimento" },
      { label: "2.5 Conferir Recebimento",       icon: ClipboardCheck,path: "/operacao/conferir-recebimento" },
      { label: "2.6 Gerar Mapa de Alocação",     icon: Map,           path: "/operacao/gerar-mapa" },
      { label: "2.7 Realizar Conferência Cega",  icon: ShieldCheck,   path: "/operacao/conferencia-cega" },
      { label: "2.8 Alocar Estoque",             icon: MapPin,        path: "/operacao/alocar-estoque" },
      { label: "2.9 Kanban de Alocação",         icon: LayoutDashboard,path: "/operacao/kanban-alocacao" },
      { label: "2.10 Separar Pedidos",           icon: ShoppingCart,  path: "/operacao/separar-pedidos" },
      { label: "2.11 Embalar Pedidos",           icon: Grid3X3,       path: "/operacao/embalar-pedidos" },
      { label: "2.12 Monitorar Saída",           icon: Activity,      path: "/operacao/monitorar-saida" },
      { label: "2.13 Recebimento (Check-in)",    icon: Inbox,         path: "/operacao/recebimento" },
      { label: "2.14 Estação de Kits",           icon: PackagePlus,   path: "/operacao/estacao-kits" },
      { label: "2.15 Conferência Colmeia",       icon: Grid3X3,       path: "/operacao/conferencia-colmeia" },
      { label: "2.16 Mapa Visual de Estoque",    icon: Box,           path: "/operacao/mapa-visual" },
      { label: "2.17 Buffer 1 - Área de Caixas Grandes", icon: Layers, path: "/operacao/buffer-1" },
      { label: "2.18 Buffer 2 - Área de Caixas Grandes", icon: Layers, path: "/operacao/buffer-2" },
      { label: "2.19 Ordem de Serviço",          icon: Wrench,        path: "/operacao/ordem-servico" },
      { label: "2.20 Gestão de Seguros",         icon: ShieldCheck,   path: "/operacao/gestao-seguros" },
      { label: "2.21 Pesagem Rodoviária",        icon: Scale,         path: "/operacao/pesagem-rodoviaria" },
    ],
  },
  {
    title: "3. PLANEJAR",
    icon: Calendar,
    items: [
      { label: "3.1 Gerar Ondas de Separação",  icon: Waves,        path: "/planejamento/gerar-ondas" },
      { label: "3.2 Monitorar Prazos (SLA)",     icon: Clock,        path: "/planejamento/monitorar-prazos" },
      { label: "3.3 Agendar Transportes",        icon: Calendar,     path: "/planejamento/agendar-transportes" },
      { label: "3.4 Monitorar Atividades",       icon: Activity,     path: "/planejamento/monitorar-atividades" },
      { label: "3.5 Gerenciar Manifestos",       icon: Truck,        path: "/planejamento/gerenciar-manifestos" },
      { label: "3.6 Expedir Cargas",             icon: PackageSearch,path: "/planejamento/expedir-cargas" },
      { label: "3.7 Gerenciar Portaria",         icon: Building2,    path: "/planejamento/gerenciar-portaria" },
      { label: "3.8 Atividades de Docas",        icon: DoorOpen,     path: "/planejamento/atividades-docas" },
    ],
  },
  {
    title: "4. CONTROLAR",
    icon: PackageSearch,
    items: [
      { label: "4.1 Auditar Inventário",         icon: ShieldCheck,  path: "/estoque/auditar-inventario" },
      { label: "4.2 Consultar Kardex",           icon: FileText,     path: "/estoque/consultar-kardex" },
      { label: "4.3 Analisar Estoque",           icon: BarChart3,    path: "/estoque/analisar-estoque" },
      { label: "4.4 Remanejar Produtos",         icon: RotateCcw,    path: "/estoque/remanejar" },
      { label: "4.5 Controlar Lotes e Validade", icon: Calendar,     path: "/estoque/controlar-lotes" },
      { label: "4.6 Monitorar Avarias",          icon: AlertTriangle,path: "/estoque/monitorar-avarias" },
      { label: "4.7 Gestão de Inventário",       icon: PackageSearch,path: "/estoque/gestao-inventario" },
    ],
  },
  {
    title: "5. FISCAL",
    icon: FileText,
    items: [
      { label: "5.1 Gerenciar NF-e",             icon: FileCheck,    path: "/fiscal/gerenciar-nfe" },
      { label: "5.2 Gerenciar CT-e",             icon: Truck,        path: "/fiscal/gerenciar-cte" },
      { label: "5.3 Emitir Cobertura Fiscal",    icon: FileText,     path: "/fiscal/emitir-cobertura" },
      { label: "5.4 Controlar Armazém Geral",    icon: Home,         path: "/fiscal/armazem-geral" },
    ],
  },
  {
    title: "6. FINANCEIRO",
    icon: DollarSign,
    items: [
      { label: "6.1 Calcular Diárias",           icon: DollarSign,   path: "/financeiro/calcular-diarias" },
      { label: "6.2 Gerenciar Contratos",        icon: FileText,     path: "/financeiro/contratos" },
    ],
  },
  {
    title: "7. CADASTRAR",
    icon: Home,
    items: [
      { label: "7.1 Gerenciar Empresas",         icon: Home,         path: "/cadastros/empresas" },
      { label: "7.2 Configurar Armazéns",        icon: Warehouse,    path: "/cadastros/armazens" },
      { label: "7.3 Catálogo de Clientes",       icon: User,         path: "/cadastros/clientes" },
      { label: "7.4 Cadastrar Endereços",        icon: MapPin,       path: "/cadastros/enderecos" },
      { label: "7.5 Catálogo de Produtos",       icon: PackageSearch,path: "/cadastros/produtos" },
      { label: "7.6 Cadastrar Rotas e Veículos", icon: Truck,        path: "/cadastros/rotas-veiculos" },
      { label: "7.7 Configurar Áreas",           icon: Grid3X3,      path: "/cadastros/areas" },
      { label: "7.8 Configurar Setores",         icon: Layers,       path: "/cadastros/setores" },
      { label: "7.9 Gerar SKU",                  icon: Zap,          path: "/config/gerar-sku" },
      { label: "7.10 Gerenciar Etiquetas",       icon: Printer,      path: "/config/etiquetas" },
    ],
  },
  {
    title: "8. INDICADORES",
    icon: BarChart3,
    items: [
      { label: "8.1 Dashboard Financeiro",       icon: BarChart3,    path: "/indicadores/financeiro" },
      { label: "8.2 Analisar Ocupação",          icon: PieChart,     path: "/indicadores/ocupacao" },
      { label: "8.3 Medir Produtividade",        icon: Activity,     path: "/indicadores/produtividade" },
      { label: "8.4 Auditar Logs do Sistema",    icon: Shield,       path: "/indicadores/auditoria" },
      { label: "8.5 Resultados de Integração",   icon: Plug,         path: "/indicadores/integracao" },
    ],
  },
  {
    title: "9. INTEGRAR",
    icon: Plug,
    items: [
      { label: "9.1 Alertas de Integração",      icon: AlertCircle,  path: "/integrar/alertas" },
      { label: "9.2 Sincronizar Ordens ERP",     icon: RefreshCcw,   path: "/integrar/ordens-erp" },
      { label: "9.3 Conectar Omie ERP",          icon: Plug,         path: "/integrar/omie" },
      { label: "9.4 Mapear Arquivos (Layouts)",  icon: Files,        path: "/integrar/arquivos" },
      { label: "9.5 Configurar APIs REST",       icon: CloudCog,     path: "/integrar/apis" },
      { label: "9.6 Integrar Ondas (Arquivo)",   icon: Waves,        path: "/integrar/ondas" },
    ],
  },
  {
    title: "10. CONFIGURAR",
    icon: Settings2,
    items: [
      { label: "10.1 Ajustar Configurações",      icon: Settings2,    path: "/config/geral" },
      { label: "10.2 Integrar Balanças (Serial)", icon: Scale,        path: "/config/balancas" },
      { label: "10.3 Gerenciar Service Desk",     icon: Headphones,   path: "/config/service-desk" },
      { label: "10.4 Expurgar Dados Antigos",     icon: Trash2,       path: "/config/expurgo" },
      { label: "10.5 Gerenciar Certificados",     icon: Lock,         path: "/config/certificados" },
    ],
  },
  {
    title: "11. SEGURANÇA",
    icon: Shield,
    items: [
      { label: "11.1 Gerenciar Usuários",        icon: User,         path: "/seguranca/usuarios" },
      { label: "11.2 Definir Grupos de Acesso",  icon: Shield,       path: "/seguranca/grupos" },
    ],
  },
];

// ─── NavItem memoizado — evita re-render dos itens quando outro grupo abre ───
const NavItem = memo(({ item, onNavigate }) => {
  const SubIcon = item.icon;
  return (
    <NavLink
      to={item.path}
      onClick={onNavigate}
      className={({ isActive }) => `
        flex items-center gap-3 pl-10 pr-5 py-2 text-[11px] font-bold transition-all duration-200
        ${isActive
          ? "text-[#ffcd00] bg-[#ffcd00]/10 border-l-2 border-[#ffcd00] font-black"
          : "text-[#a0a0a0] hover:bg-white/5"
        }
      `}
    >
      <SubIcon className="w-4 h-4 shrink-0 opacity-70" aria-hidden="true" />
      <span className="truncate">{item.label}</span>
    </NavLink>
  );
});
NavItem.displayName = "NavItem";

// ─── NavGroup memoizado — só re-renderiza quando isOpen/collapsed mudam ──────
const NavGroup = memo(({ group, isOpen, collapsed, onToggle, onNavigate }) => {
  const Icon = group.icon;
  const sectionId = `section-${group.title.replace(/\s+/g, "-")}`;

  return (
    <div className="mb-px border-b border-white/5 last:border-0">
      <button
        onClick={() => onToggle(group.title)}
        aria-expanded={isOpen}
        aria-controls={collapsed ? undefined : sectionId}
        className={`
          w-full flex items-center gap-3 px-5 py-3 transition-colors
          hover:bg-white/5 group
          ${isOpen ? "bg-white/5" : ""}
        `}
      >
        {collapsed ? (
          <Tooltip text={group.title}>
            <Icon
              className={`w-4 h-4 mx-auto transition-colors ${isOpen ? "text-[#ffcd00]" : "text-[#4a4a4a]"}`}
              aria-hidden="true"
            />
          </Tooltip>
        ) : (
          <>
            <Icon
              className={`w-4 h-4 shrink-0 transition-colors ${isOpen ? "text-[#ffcd00]" : "text-[#4a4a4a]"}`}
              aria-hidden="true"
            />
            <span className="flex-1 text-left text-[9px] font-black text-[#ffcd00] tracking-[0.2em] uppercase">
              {group.title}
            </span>
            <ChevronDown
              className={`w-3 h-3 text-[#4a4a4a] transition-transform duration-200 ${isOpen ? "rotate-180 text-[#ffcd00]" : ""}`}
              aria-hidden="true"
            />
          </>
        )}
      </button>

      {!collapsed && isOpen && (
        <div id={sectionId} className="bg-black/40">
          {group.items.map((item) => (
            <NavItem key={item.path} item={item} onNavigate={onNavigate} />
          ))}
        </div>
      )}
    </div>
  );
});
NavGroup.displayName = "NavGroup";

// ─── Sidebar principal ────────────────────────────────────────────────────────
// Prop `isOpen` (parentIsOpen) removida — era dead code: nunca referenciada.
export default function Sidebar({ toggleSidebar: parentToggleSidebar }) {
  const [collapsed,     setCollapsed]     = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  const { currentUser } = useApp();

  useEffect(() => {
    const checkMobile = () => {
      if (window.innerWidth < 1024) {
        setCollapsed(true);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleToggleSidebar = useCallback(() => {
    const nextState = !collapsed;
    setCollapsed(nextState);
    if (parentToggleSidebar) parentToggleSidebar();
  }, [collapsed, parentToggleSidebar]);

  const handleNavigate = useCallback(() => {
    if (window.innerWidth < 1024) {
      setCollapsed(true);
    }
  }, []);

  // toggleSection: lógica sequencial — sem side-effects dentro de updaters
  const toggleSection = useCallback((sectionTitle) => {
    if (collapsed) {
      setCollapsed(false);
      if (parentToggleSidebar) parentToggleSidebar();
      setActiveSection(sectionTitle);
    } else {
      setActiveSection((prev) => (prev === sectionTitle ? null : sectionTitle));
    }
  }, [collapsed, parentToggleSidebar]);

  // Iniciais robustas: filter(Boolean) remove tokens vazios de espaços duplos
  const initials = React.useMemo(() => {
    if (!currentUser?.nome?.trim()) return "VP";
    return currentUser.nome
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [currentUser?.nome]);

  return (
    <>
      {/* Mobile overlay */}
      {!collapsed && (
        <div
          className="fixed inset-0 bg-black/40 z-[49] lg:hidden backdrop-blur-sm"
          onClick={handleNavigate}
          aria-hidden="true"
        />
      )}

      {/* Sidebar principal */}
      <aside
        className={`
          fixed left-0 top-0 h-screen bg-[#0d0d0d] text-white
          transition-all duration-300 ease-in-out z-40 flex flex-col
          ${collapsed ? "w-16" : "w-72"}
          lg:translate-x-0
          ${!collapsed ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
        aria-label="Navegação principal"
      >
        {/* Branding */}
        <div className="h-24 bg-[#ffcd00] relative flex items-center px-4 shrink-0">
          <div className="w-14 h-14 bg-black rounded-xl p-1 shrink-0 flex items-center justify-center shadow-lg">
            <img
              src="/img/logo_amarelo.svg"
              alt="VerticalParts"
              className="w-full h-full object-contain"
              onError={(e) => {
                e.target.onerror = null; // previne loop infinito se o fallback também falhar
                e.target.src = "/Favicon.svg";
              }}
              loading="eager"
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

          {/* Botão expand/collapse */}
          <button
            onClick={handleToggleSidebar}
            aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
            aria-expanded={!collapsed}
            className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#ffcd00] rounded-full flex items-center justify-center text-black border-2 border-[#ffcd00]/30 hover:scale-110 transition-transform shadow-lg z-50"
          >
            {collapsed
              ? <ChevronRight size={14} strokeWidth={3} aria-hidden="true" />
              : <ChevronLeft  size={14} strokeWidth={3} aria-hidden="true" />
            }
          </button>
        </div>

        {/* Dashboard (fora dos accordions) */}
        <div className="pt-4 border-b border-white/5">
          <NavLink
            to="/"
            onClick={handleNavigate}
            className={({ isActive }) => `
              flex items-center gap-3 px-5 py-3 text-[11px] font-bold transition-all duration-200
              ${isActive ? "text-[#ffcd00] bg-[#ffcd00]/10 border-l-2 border-[#ffcd00]" : "text-[#a0a0a0] hover:bg-white/5"}
            `}
          >
            {collapsed ? (
              <Tooltip text="1.1 Dashboard Geral">
                <LayoutDashboard className="w-4 h-4 mx-auto" aria-hidden="true" />
              </Tooltip>
            ) : (
              <>
                <LayoutDashboard className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span className="truncate">1.1 Dashboard Geral</span>
              </>
            )}
          </NavLink>
        </div>

        {/* Navegação */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar py-2">
          {NAVIGATION.map((group) => (
            <NavGroup
              key={group.title}
              group={group}
              isOpen={activeSection === group.title}
              collapsed={collapsed}
              onToggle={toggleSection}
              onNavigate={handleNavigate}
            />
          ))}
        </nav>

        {/* Rodapé do usuário */}
        <div className="bg-[#1a1a1a] p-4 border-t border-white/5 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div
              className="w-8 h-8 rounded-full bg-[#ffcd00] flex items-center justify-center shrink-0 shadow-md"
              aria-hidden="true"
            >
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
