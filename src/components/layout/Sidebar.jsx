import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  // Cadastros & Segurança
  ShieldCheck,
  Building2,
  Warehouse,
  Layers,
  ClipboardList,
  MapPin,
  Shield,
  Users,
  // Operação de Entrada
  PackageSearch,
  CalendarDays,
  ArrowDownLeft,
  ArrowRightLeft,
  Building,
  Scale,
  // Operação de Saída
  PackageCheck,
  Waves,
  ShoppingCart,
  Grid3X3,
  Box,
  Truck,
  Monitor,
  Activity,
  FileText,
  Layers2,
  ShieldX,
  // Estoque
  Package,
  History,
  // Faturamento
  DollarSign,
  FileSignature,
  // Integrações
  Plug,
  Globe,
  FileCode,
  // Configurações
  Settings2,
  Cpu,
  Tag,
  // Accordion
  ChevronDown,
  // Sidebar toggle
  Menu,
  X,
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// ============================================================
// ESTRUTURA DE NAVEGAÇÃO — Hierarquia Oficial WMS VerticalParts
// ============================================================
const NAVIGATION = [
  // ── TELA INICIAL ───────────────────────────────────────────
  {
    type: "home",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/",
  },

  // ── CATEGORIAS ─────────────────────────────────────────────
  {
    type: "category",
    label: "Cadastros e Segurança",
    icon: ShieldCheck,
    id: "cadastros",
    items: [
      { label: "Empresas",       icon: Building2,     path: "/companies" },
      { label: "Armazéns",       icon: Warehouse,     path: "/warehouses" },
      { label: "Áreas do Armazém",icon: Layers,       path: "/areas" },
      { label: "Setores",        icon: ClipboardList, path: "/sectors" },
      { label: "Endereços",      icon: MapPin,        path: "/addresses" },
      { label: "Grupo de Usuário",icon: Shield,       path: "/user-groups" },
      { label: "Usuários",       icon: Users,         path: "/users" },
    ],
  },

  {
    type: "category",
    label: "Operação de Entrada",
    icon: PackageSearch,
    id: "entrada",
    badge: "Recebimento",
    items: [
      { label: "Portaria & Agendamento",   icon: Building,      path: "/gate-manager" },
      { label: "Pesagem Rodoviária",       icon: Scale,         path: "/road-weighing" },
      { label: "Agenda de Transporte",     icon: CalendarDays,  path: "/transport-schedule" },
      { label: "Gerenciador de Recebimento",icon: PackageSearch,path: "/receiving-manager" },
      { label: "Check-in Recebimento",     icon: ArrowDownLeft, path: "/receiving" },
      { label: "Acomp. Cross-Docking",     icon: ArrowRightLeft,path: "/cross-docking" },
    ],
  },

  {
    type: "category",
    label: "Operação de Saída",
    icon: PackageCheck,
    id: "saida",
    badge: "Expedição",
    items: [
      { label: "Formação de Onda",         icon: Waves,         path: "/wave-picking" },
      { label: "Separação (Picking)",      icon: ShoppingCart,  path: "/picking" },
      { label: "Conferência de Colmeia",   icon: Grid3X3,       path: "/honeycomb-check" },
      { label: "Embalagem (Packing)",      icon: Box,           path: "/packing" },
      { label: "Embarque (Shipping)",      icon: Truck,         path: "/shipping" },
      { label: "Monitoramento de Saída",   icon: Monitor,       path: "/outbound-monitoring" },
      { label: "Acomp. de Ondas (SLA)",    icon: Activity,      path: "/wave-monitoring" },
      { label: "Coleta & Manifesto",       icon: FileText,      path: "/manifest-manager" },
    ],
  },

  {
    type: "category",
    label: "Estoque e Inventário",
    icon: Package,
    id: "estoque",
    items: [
      { label: "Gestão de Inventário",   icon: ClipboardList, path: "/inventory-management" },
      { label: "Auditoria de Inventário",icon: History,       path: "/inventory" },
      { label: "Ctrl. Avarias e Desm.",  icon: ShieldX,       path: "/damage-control" },
    ],
  },

  {
    type: "category",
    label: "Gestão de Contratos",
    icon: FileSignature,
    id: "faturamento",
    badge: "Faturamento",
    items: [
      { label: "Contratos",          icon: FileSignature, path: "/contracts" },
      { label: "Billing por Embalagem",icon: Box,         path: "/billing/packaging" },
      { label: "Billing por Palete", icon: Layers,        path: "/billing/pallet" },
      { label: "Billing por Peso",   icon: Package,       path: "/billing/weight" },
      { label: "Billing por Endereço",icon: Monitor,      path: "/billing/address" },
      { label: "Consulta de Cobrança",icon: DollarSign,   path: "/billing/query" },
    ],
  },

  {
    type: "category",
    label: "Integrações",
    icon: Plug,
    id: "integracoes",
    badge: "APIs & ETL",
    items: [
      { label: "Integração Omie",    icon: ArrowRightLeft,path: "/omie" },
      { label: "Arquivos ETL",       icon: FileCode,      path: "/file-integration" },
      { label: "Configuração REST",  icon: Globe,         path: "/rest-config" },
      { label: "Resultados de API",  icon: Activity,      path: "/integration-results" },
    ],
  },

  {
    type: "category",
    label: "Configurações do Sistema",
    icon: Settings2,
    id: "configuracoes",
    items: [
      { label: "Configuração Geral", icon: Settings2,     path: "/settings" },
      { label: "Dispositivos Serial",icon: Cpu,           path: "/serial-devices" },
      { label: "Etiquetas",          icon: Tag,           path: "/labels" },
      { label: "Estação de Kits",    icon: Layers2,       path: "/kit-station" },
      { label: "Pesagem Operacional",icon: Scale,         path: "/weighing-station" },
    ],
  },
];

// ============================================================
// SUB-COMPONENTE: Item de Menu Leaf (folha)
// ============================================================
function NavItem({ item, collapsed }) {
  return (
    <NavLink
      to={item.path}
      title={item.label}
      className={({ isActive }) =>
        cn(
          "group flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-150 relative",
          "hover:bg-primary/10 hover:text-primary",
          isActive
            ? "bg-primary text-secondary shadow-md shadow-primary/30 font-black"
            : "text-slate-400"
        )
      }
    >
      <item.icon
        className={cn(
          "shrink-0 transition-colors duration-150",
          collapsed ? "w-5 h-5" : "w-3.5 h-3.5"
        )}
      />
      {!collapsed && (
        <span className="truncate leading-tight">{item.label}</span>
      )}
    </NavLink>
  );
}

// ============================================================
// SUB-COMPONENTE: Categoria Accordion
// ============================================================
function CategoryAccordion({ category, collapsed, defaultOpen }) {
  const location = useLocation();
  const isAnyChildActive = category.items.some(
    (item) => location.pathname === item.path
  );
  const [open, setOpen] = useState(defaultOpen || isAnyChildActive);

  // Reabre automaticamente se uma rota filha for ativada externamente
  React.useEffect(() => {
    if (isAnyChildActive) setOpen(true);
  }, [isAnyChildActive]);

  return (
    <div>
      {/* Botão da categoria */}
      <button
        onClick={() => !collapsed && setOpen((p) => !p)}
        title={category.label}
        className={cn(
          "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
          isAnyChildActive
            ? "bg-primary/10 text-primary"
            : "text-slate-400 hover:bg-slate-800 hover:text-slate-200",
          collapsed && "justify-center"
        )}
      >
        {/* Ícone da categoria */}
        <div
          className={cn(
            "shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-colors duration-200",
            isAnyChildActive
              ? "bg-primary text-secondary"
              : "bg-slate-800 text-slate-500 group-hover:bg-slate-700 group-hover:text-slate-300"
          )}
        >
          <category.icon className="w-4 h-4" />
        </div>

        {!collapsed && (
          <>
            <div className="flex-1 text-left min-w-0">
              <span className="text-[11px] font-black uppercase tracking-wider leading-tight truncate block">
                {category.label}
              </span>
              {category.badge && (
                <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest leading-none">
                  {category.badge}
                </span>
              )}
            </div>
            <ChevronDown
              className={cn(
                "w-3.5 h-3.5 shrink-0 transition-transform duration-300 text-slate-600",
                open && "rotate-180"
              )}
            />
          </>
        )}
      </button>

      {/* Items filhos — Accordion */}
      {!collapsed && (
        <div
          className={cn(
            "overflow-hidden transition-all duration-300 ease-in-out",
            open ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <div className="mt-1 ml-3.5 pl-3 border-l-2 border-slate-800 space-y-0.5 pb-2">
            {category.items.map((item) => (
              <NavItem key={item.path} item={item} collapsed={false} />
            ))}
          </div>
        </div>
      )}

      {/* Collapsed: tooltip-style popover (simplificado) */}
      {collapsed && open && (
        <div className="mt-1 space-y-0.5">
          {category.items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              title={item.label}
              className={({ isActive }) =>
                cn(
                  "flex items-center justify-center w-10 h-8 mx-auto rounded-lg transition-all",
                  "hover:bg-primary/10 hover:text-primary",
                  isActive
                    ? "bg-primary text-secondary"
                    : "text-slate-500"
                )
              }
            >
              <item.icon className="w-3.5 h-3.5" />
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// COMPONENTE PRINCIPAL: Sidebar
// ============================================================
export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "flex flex-col h-full bg-slate-950 border-r-2 border-slate-800 transition-all duration-300 ease-in-out overflow-hidden",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* ── LOGOTIPO ───────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-slate-800 shrink-0">
        {!collapsed && (
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shrink-0">
              <span className="text-secondary font-black text-xs">VP</span>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black text-primary uppercase tracking-widest leading-none">
                VerticalParts
              </p>
              <p className="text-[8px] font-bold text-slate-600 uppercase tracking-[0.15em] leading-none mt-0.5">
                WMS System
              </p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center mx-auto">
            <span className="text-secondary font-black text-xs">VP</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed((p) => !p)}
          className={cn(
            "w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 hover:text-primary hover:bg-slate-800 transition-all shrink-0",
            collapsed && "mx-auto mt-2"
          )}
          title={collapsed ? "Expandir menu" : "Recolher menu"}
        >
          {collapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
        </button>
      </div>

      {/* ── NAVEGAÇÃO ──────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 space-y-0.5 scrollbar-thin scrollbar-track-slate-950 scrollbar-thumb-slate-800">

        {/* DASHBOARD — fixo no topo */}
        <NavLink
          to="/"
          end
          title="Dashboard"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group mb-2",
              isActive
                ? "bg-primary text-secondary font-black shadow-md shadow-primary/30"
                : "text-slate-400 hover:bg-slate-800 hover:text-white",
              collapsed && "justify-center"
            )
          }
        >
          <LayoutDashboard
            className={cn("shrink-0", collapsed ? "w-5 h-5" : "w-5 h-5")}
          />
          {!collapsed && (
            <span className="text-[11px] font-black uppercase tracking-wider">
              Dashboard
            </span>
          )}
        </NavLink>

        {/* Separador */}
        {!collapsed && (
          <p className="text-[9px] font-black text-slate-700 uppercase tracking-[0.25em] px-3 pt-2 pb-1">
            Módulos
          </p>
        )}
        {collapsed && <div className="h-px bg-slate-800 mx-2 my-2" />}

        {/* CATEGORIAS */}
        {NAVIGATION.filter((n) => n.type === "category").map((category) => (
          <CategoryAccordion
            key={category.id}
            category={category}
            collapsed={collapsed}
          />
        ))}
      </nav>

      {/* ── RODAPÉ ─────────────────────────────────────── */}
      <div
        className={cn(
          "shrink-0 border-t border-slate-800 px-3 py-3 flex items-center gap-2.5",
          collapsed && "justify-center"
        )}
      >
        <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
          <span className="text-[10px] font-black text-primary">DS</span>
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-[10px] font-black text-slate-300 truncate">
              danilo.supervisor
            </p>
            <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">
              Supervisor
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
