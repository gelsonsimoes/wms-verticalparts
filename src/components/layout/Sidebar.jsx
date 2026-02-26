import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { 
  ChevronRight, 
  ChevronDown, 
  LayoutDashboard, 
  Settings2, 
  Users, 
  Package, 
  Warehouse, 
  MapPin, 
  Truck, 
  BarChart3, 
  FileText, 
  History, 
  ShieldCheck, 
  Bell, 
  Search,
  ArrowRightLeft,
  RotateCcw,
  Scale,
  PackageSearch,
  ArrowDownLeft,
  Map,
  ClipboardCheck,
  ShoppingCart,
  Grid3X3,
  Activity,
  Waves,
  CalendarDays,
  ListTodo,
  Truck as TruckOut,
  ShieldX,
  RefreshCw,
  PackagePlus,
  BarChart3 as LineChart,
  PieChart,
  DollarSign,
  Briefcase,
  Building,
  Receipt,
  FileCheck,
  Building2,
  Sliders,
  FileCode,
  Globe,
  Cpu,
  Terminal,
  Gauge,
  FlaskConical,
  Wrench,
  Server,
  Shield,
  AlertCircle,
  ShoppingBag,
  BookOpen,
  Plug
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { useApp } from "../../context/AppContext";
import Tooltip from "../ui/Tooltip";

function cn(...inputs) { return twMerge(clsx(inputs)); }

const OrganogramIcon = () => (
  <span className="text-[10px] font-black bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
    Em Breve
  </span>
);

// ─── ORGANOGRAMA MASTER — VerticalParts WMS ────────────────────────
const NAVIGATION = [
  // ── 1. OPERAR (AÇÃO NO CAMPO) ─────────────────────────────────────
  {
    id: "operacao", label: "Operar (Ação no Campo)", num: "1",
    icon: PackageSearch,
    roles: ["operador", "gestor"],
    items: [
      { label: "1.1 Cruzar Docas",                  icon: ArrowRightLeft, path: "/operacao/cruzar-docas", tooltip: "Mercadoria que chega e vai direto para o cliente/técnico sem ser guardada na prateleira (CrossDocking)." },
      { label: "1.2 Processar Devoluções",          icon: RotateCcw,      path: "/operacao/processar-devolucoes" },
      { label: "1.3 Pesar Cargas",                  icon: Scale,          path: "/operacao/pesar-cargas" },
      { label: "1.4 Gerenciar Recebimento",         icon: PackageSearch,  path: "/operacao/gerenciar-recebimento" },
      { label: "1.5 Conferir Recebimento",          icon: ArrowDownLeft,  path: "/operacao/conferir-recebimento" },
      { label: "1.6 Gerar Mapa de Alocação",        icon: Map,            path: "/operacao/gerar-mapa" },
      { label: "1.7 Realizar Conferência Cega",     icon: ClipboardCheck, path: "/operacao/conferencia-cega" },
      { label: "1.8 Alocar Estoque",                icon: MapPin,         path: "/operacao/alocar-estoque" },
      { label: "1.9 Kanban de Alocação",            icon: LayoutDashboard, path: "/operacao/kanban-alocacao" },
      { label: "1.10 Separar Pedidos",              icon: ShoppingCart,   path: "/operacao/separar-pedidos", tooltip: "Área de separação de mercadorias no nível do chão (Picking)." },
      { label: "1.11 Embalar Pedidos",              icon: Grid3X3,        path: "/operacao/embalar-pedidos", tooltip: "Processo de verificação e empacotamento final (Packing)." },
      { label: "1.12 Monitorar Saída",              icon: Activity,       path: "/operacao/monitorar-saida" },
    ],
  },
  // ── 2. PLANEJAR (ONDAS & SLA) ──────────────────────────────────────
  {
    id: "planejamento", label: "Planejar (Ondas & SLA)", num: "2",
    icon: Waves,
    roles: ["planejador", "gestor"],
    items: [
      { label: "Gerar Ondas de Separação",          icon: Waves,          path: "/planejamento/gerar-ondas" },
      { label: "Monitorar Prazos (SLA)",            icon: Activity,       path: "/planejamento/monitorar-prazos", tooltip: "Tempo limite/Prazo exigido para finalizar a tarefa (SLA)." },
      { label: "Agendar Transportes",               icon: CalendarDays,   path: "/planejamento/agendar-transportes" },
      { label: "Monitorar Atividades",              icon: ListTodo,       path: "/planejamento/monitorar-atividades" },
      { label: "Gerenciar Manifestos",              icon: FileText,       path: "/planejamento/gerenciar-manifestos" },
      { label: "Expedir Cargas",                    icon: TruckOut,       path: "/planejamento/expedir-cargas" },
    ],
  },
  // ── 3. CONTROLAR (ESTOQUE) ────────────────────────────────────────
  {
    id: "estoque", label: "Controlar (Estoque)", num: "3",
    icon: ListTodo,
    roles: ["planejador", "gestor"],
    items: [
      { label: "Auditar Inventário",                icon: ShieldCheck,    path: "/estoque/auditar-inventario" },
      { label: "Consultar Kardex",                  icon: PieChart,       path: "/estoque/consultar-kardex" },
      { label: "Analisar Estoque",                  icon: BarChart3,      path: "/estoque/analisar-estoque" },
      { label: "Remanejar Produtos",                icon: RefreshCw,      path: "/estoque/remanejar" },
      { label: "Controlar Lotes e Validade",        icon: PackagePlus,    path: "/estoque/controlar-lotes" },
      { label: "Monitorar Avarias",                 icon: ShieldX,        path: "/estoque/monitorar-avarias" },
    ],
  },
  // ── 4. FISCAL (DOCUMENTOS) ────────────────────────────────────────
  {
    id: "fiscal", label: "Fiscal (Documentos)", num: "4",
    icon: FileCheck,
    roles: ["planejador", "gestor"],
    items: [
      { label: "Gerenciar NF-e",                    icon: FileCheck,      path: "/fiscal/gerenciar-nfe" },
      { label: "Gerenciar CT-e",                    icon: Receipt,        path: "/fiscal/gerenciar-cte" },
      { label: "Emitir Cobertura Fiscal",           icon: ShieldCheck,    path: "/fiscal/emitir-cobertura" },
      { label: "Controlar Armazém Geral",           icon: Building,       path: "/fiscal/armazem-geral" },
    ],
  },
  // ── 5. FINANCEIRO (PÓS-VENDA) ────────────────────────────────_____
  {
    id: "financeiro", label: "Financeiro (Pós-Venda)", num: "5",
    icon: DollarSign,
    roles: ["gestor"],
    items: [
      { label: "Calcular Diárias de Armazenagem",   icon: DollarSign,     path: "/financeiro/calcular-diarias" },
    ],
  },
  // ── 6. CADASTRAR (BASE) ──────────────────────────────────────────
  {
    id: "cadastros", label: "Cadastrar (Base)", num: "6",
    icon: ShieldCheck,
    roles: ["gestor"],
    items: [
      { label: "Gerenciar Empresas",                icon: Users,          path: "/cadastros/empresas" },
      { label: "Configurar Armazéns e Áreas",       icon: Warehouse,      path: "/cadastros/armazens" },
      { label: "Cadastrar Endereços",               icon: MapPin,         path: "/cadastros/enderecos" },
      { label: "Catálogo de Produtos",              icon: Package,        path: "/cadastros/produtos" },
      { label: "Cadastrar Rotas e Veículos",        icon: Truck,          path: "/cadastros/rotas-veiculos" },
    ],
  },
  // ── 7. INDICADORES (BI) ───────────────────────────────────────────
  {
    id: "bi", label: "Indicadores (BI)", num: "7",
    icon: BarChart3,
    roles: ["gestor"],
    items: [
      { label: "Ver Dashboard Financeiro",          icon: DollarSign,     path: "/indicadores/financeiro" },
      { label: "Analisar Ocupação",                 icon: PieChart,       path: "/indicadores/ocupacao" },
      { label: "Medir Produtividade",               icon: LineChart,      path: "/indicadores/produtividade" },
      { label: "Auditar Logs do Sistema",           icon: BookOpen,       path: "/indicadores/auditoria" },
    ],
  },
  // ── 8. INTEGRAR (SISTEMAS) ───────────────────────────────────────
  {
    id: "integracoes", label: "Integrar (Sistemas)", num: "8",
    icon: Plug,
    roles: ["gestor"],
    items: [
      { label: "Alertas de Integração",              icon: AlertCircle,    path: "/integrar/alertas" },
      { label: "Sincronizar Ordens ERP",            icon: ArrowRightLeft, path: "/integrar/ordens-erp" },
      { label: "Conectar Omie ERP",                 icon: ShoppingBag,    path: "/integrar/omie" },
      { label: "Mapear Arquivos (Layouts)",         icon: FileCode,       path: "/integrar/arquivos" },
      { label: "Configurar APIs REST",              icon: Globe,          path: "/integrar/apis" },
    ],
  },
  // ── 9. CONFIGURAR (TI) ────────────────────────────────────────────
  {
    id: "configuracoes", label: "Configurar (TI)", num: "9",
    icon: Settings2,
    roles: ["gestor"],
    items: [
      { label: "Ajustar Configurações",             icon: Settings2,      path: "/config/geral" },
      { label: "Integrar Balanças (Serial)",        icon: Cpu,           path: "/config/balancas" },
      { label: "Gerenciar Service Desk",            icon: Gauge,          path: "/config/service-desk" },
      { label: "Expurgar Dados Antigos",            icon: Terminal,       path: "/config/expurgo" },
      { label: "Gerenciar Certificados",            icon: Server,         path: "/config/certificados" },
    ],
  },
  // ── 10. SEGURANÇA ────────────────────────────────────────────────
  {
    id: "seguranca", label: "Segurança", num: "10",
    icon: Shield,
    roles: ["gestor"],
    items: [
      { label: "Gerenciar Usuários",                icon: Users,          path: "/seguranca/usuarios" },
      { label: "Definir Grupos de Acesso",          icon: Shield,         path: "/seguranca/grupos" },
    ],
  },
];

// ─── Item folha (leaf) ────────────────────────────────────────────
function NavItem({ item, collapsed }) {
  return (
    <NavLink
      to={item.path}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-2.5 px-3 py-2 rounded-xl text-[11px] font-bold transition-all duration-300",
          "hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:translate-x-1",
          isActive
            ? "bg-secondary text-primary shadow-lg shadow-secondary/20"
            : "text-slate-500 dark:text-slate-400"
        )
      }
    >
      <item.icon className="w-3.5 h-3.5 shrink-0" />
      <span className="truncate leading-tight">
        {item.tooltip ? (
          <Tooltip text={item.tooltip}>{item.label}</Tooltip>
        ) : (
          item.label
        )}
      </span>
    </NavLink>
  );
}

// ─── Acordeão de categoria ────────────────────────────────────────
function CategoryAccordion({ category, collapsed }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-0.5 last:mb-0">
      <button
        onClick={() => !collapsed && setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between p-2.5 rounded-xl transition-all duration-300",
          "hover:bg-slate-100 dark:hover:bg-slate-800/50",
          isOpen ? "bg-slate-50 dark:bg-slate-800/30" : ""
        )}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className={cn(
            "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors",
            isOpen ? "bg-secondary text-primary shadow-inner" : "bg-slate-50 dark:bg-slate-800 text-slate-400"
          )}>
            <category.icon className="w-4 h-4" />
          </div>
          {!collapsed && (
            <div className="text-left min-w-0">
              <p className={cn(
                "text-[9px] font-black uppercase tracking-[0.2em] mb-0.5 truncate",
                isOpen ? "text-secondary" : "text-slate-400"
              )}>
                Setor {category.num}
              </p>
              <p className="text-[11px] font-black text-slate-700 dark:text-slate-200 truncate">
                {category.label}
              </p>
            </div>
          )}
        </div>
        {!collapsed && (
          <ChevronRight className={cn(
            "w-3 h-3 text-slate-300 transition-transform duration-300",
            isOpen && "rotate-90 text-secondary"
          )} />
        )}
      </button>

      {isOpen && !collapsed && (
        <div className="mt-1 ml-4 pl-4 border-l-2 border-slate-100 dark:border-slate-800 flex flex-col gap-1 py-1 animate-in slide-in-from-top-1 duration-300">
          {category.items.map((item, idx) => (
            <NavItem key={idx} item={item} collapsed={collapsed} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────
export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { currentUser } = useApp();

  // Filtra o menu com base no Role do usuário, com verificação de segurança
  const filteredNavigation = NAVIGATION.filter(cat => 
    cat.roles && currentUser?.role && cat.roles.includes(currentUser.role)
  );

  return (
    <aside className={cn(
      "fixed left-0 top-0 h-screen bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 transition-all duration-500 z-[50] flex flex-col",
      collapsed ? "w-20" : "w-72"
    )}>
      {/* BRANDING */}
      <div className="p-6 h-28 flex items-center gap-4 relative">
        <div className="w-12 h-12 flex items-center justify-center shrink-0 overflow-hidden">
          <img src="/logo.svg" alt="VerticalParts Logo" className="w-full h-full object-contain" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <h1 className="text-lg font-black text-slate-900 dark:text-white tracking-tighter leading-tight truncate">
              VerticalParts
            </h1>
            <p className="text-[9px] font-black text-secondary tracking-[0.4em] uppercase opacity-70">WMS Master</p>
          </div>
        )}
        
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-lg flex items-center justify-center text-slate-400 hover:text-secondary hover:border-secondary transition-all z-50 shadow-sm"
        >
          <ChevronRight className={cn("w-3 h-3 transition-transform duration-500", !collapsed && "rotate-180")} />
        </button>
      </div>

      {/* NAVIGATION SCROLL */}
      <nav className="flex-1 overflow-y-auto px-4 py-2 scrollbar-none">
        {collapsed 
          ? <div className="h-px bg-slate-800 mx-2 my-2" />
          : <p className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.3em] mb-4 ml-2">Módulos Administrativos</p>
        }

        {/* CATEGORIAS FILTRADAS */}
        {filteredNavigation.map((cat) => (
          <CategoryAccordion key={cat.id} category={cat} collapsed={collapsed} />
        ))}
      </nav>

      {/* USER FOOTER */}
      <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex items-center gap-4">
        <div className="w-10 h-10 rounded-2xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center border border-slate-300 dark:border-slate-700 overflow-hidden shrink-0">
          <Users className="w-5 h-5 text-slate-400" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-[10px] font-black text-slate-300 truncate">{currentUser.usuario}</p>
            <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">{currentUser.role}</p>
          </div>
        )}
      </div>
    </aside>
  );
}
