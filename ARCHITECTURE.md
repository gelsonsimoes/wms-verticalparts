# ARCHITECTURE.md — WMS VerticalParts
> **Última atualização:** 2026-03-21 | **Agente:** Antigravity (Gemini Deep Mind)
> Este arquivo é mantido automaticamente para sincronizar contexto entre agentes de IA e desenvolvedores.

---

## 🗂️ VISÃO GERAL DO PROJETO

| Campo | Valor |
|-------|-------|
| **Produto** | WMS (Warehouse Management System) para VerticalParts |
| **Stack** | React 18 + Vite 7, React Router v6, Tailwind CSS v4, Recharts |
| **Backend** | Supabase (PostgreSQL + Auth + Realtime + Storage) |
| **Deploy** | Hostinger (domínio: wmsverticalparts.com.br) |
| **Repositório** | https://github.com/gelsonsimoes/wms-verticalparts |
| **Supabase** | https://supabase.com/dashboard/project/clakkpyzinuheubkhdep |
| **Supabase URL** | `https://clakkpyzinuheubkhdep.supabase.co` |
| **Branch** | `main` — CI/CD via GitHub Actions → Hostinger |

---

## 📁 ESTRUTURA DE DIRETÓRIOS

```
wms-verticalparts/
├── src/
│   ├── pages/          ← 78 páginas JSX (todas lazy-loaded via routes.jsx)
│   ├── components/
│   │   ├── layout/     ← Sidebar.jsx, Header.jsx, EnterprisePageBase.jsx
│   │   ├── ui/         ← StatsCard.jsx, Tooltip.jsx
│   │   ├── chat/       ← ChatAssistant.jsx
│   │   └── integration/
│   ├── context/
│   │   └── AppContext.jsx   ← ESTADO GLOBAL — fonte única de verdade para CRUD
│   ├── hooks/
│   │   ├── useApp.js        ← Expõe AppContext (USAR ESTE, não importar do AppContext direto)
│   │   └── useRealtimeSync.js
│   ├── lib/
│   │   └── supabaseClient.js ← Inicialização do cliente Supabase + helpers
│   ├── services/
│   │   ├── supabaseClient.js ← Re-exporta de ../lib/supabaseClient (singleton)
│   │   ├── activityLogger.js
│   │   ├── omieApi.js
│   │   └── mappingService.js
│   ├── mock/
│   │   └── productCatalogData.js ← ⚠️ LEGADO — NÃO usar em páginas novas
│   ├── routes.jsx       ← Mapa de todas as 77 rotas com lazy imports
│   └── App.jsx          ← Root: auth flow, Sidebar, Header, lazy Suspense
├── .env                 ← Variáveis locais (não commitado)
├── .env.local           ← Variáveis locais override (não commitado)
├── .env.production      ← Variáveis de produção
├── .claude_agents/      ← Skills dos agentes (Supervisor, Architect, FE, BE, QA, DataCleaner)
├── .agent/              ← Skills do Antigravity
├── supabase/migrations/ ← Histórico de migrações SQL
├── Arquivos_Supabase/   ← CSVs de importação de dados reais
└── css-referencia/      ← verticalparts_inline_styles.css (design reference)
```

---

## 🔐 AUTENTICAÇÃO

| Componente | Status | Detalhes |
|-----------|--------|---------|
| Login (`/login`) | ✅ Funcional | Supabase Auth signInWithPassword |
| Logout | ✅ Funcional | App.jsx — signOut() |
| Convites por email | ✅ Funcional | src/lib/supabaseClient.js `inviteUser()` |
| Reset de senha | ✅ Funcional | `resetPassword()` + redirect para `/auth/update-password` |
| Auth Callback | ✅ Funcional | `/auth/callback` → `AuthCallback.jsx` |
| Permissões por página | ✅ Funcional | `operadores.paginas_permitidas` (array) filtra Sidebar |
| `currentUser` | ✅ Funcional | AppContext — join auth.users + operadores |

**Tabela de usuários:** `operadores` (3 registros ativos — dados de desenvolvimento)
**Grupos:** tabela `grupos_acesso` (5 grupos, join com operadores)

---

## 🗃️ BANCO DE DADOS SUPABASE

### Tabelas existentes (38 total)

| Tabela | Linhas | Integrada no App | Notas |
|--------|--------|-----------------|-------|
| `operadores` | 3 | ✅ Auth flow | Tabela de usuários |
| `warehouses` | 1 | ✅ AppContext | Centro de distribuição VerticalParts |
| `grupos_acesso` | 5 | ✅ App.jsx join | Grupos de permissão |
| `lotes` | 0 | ✅ AppContext | Controle de lotes |
| `setores` | 0 | ✅ AppContext | Setores do armazém |
| `activity_logs` | 0 | ✅ activityLogger.js | Auditoria de ações |
| `clientes` | 0 | ✅ AppContext (corrigido) | Clientes/depositantes |
| `areas_armazem` | 0 | ✅ AppContext (corrigido) | Áreas físicas do CD |
| `companies` | 0 | ✅ AppContext | Empresas |
| `produtos` | 0 | 🟡 Helper em lib/ | Catálogo de peças |
| `enderecos` | 0 | 🟡 Helper em lib/ | Endereçamento físico |
| `alocacao_estoque` | 0 | 🟡 Helper em lib/ | Ocupação de endereços |
| `tarefas` | 0 | 🟡 Helper em lib/ | Tarefas operacionais |
| `movimento_estoque` | 0 | 🟡 Helper em lib/ (corrigido) | Kardex/movimentações |
| `notas_saida` | 0 | 🟡 Dashboard query | Ordens de saída |
| `ordens_recebimento` | 0 | ❌ Sem integração | Ordens de entrada |
| `ordens_recebimento_itens` | 0 | ❌ Sem integração | Itens das ORs |
| `cross_docking` | 0 | ❌ Sem integração | Cross-docking |
| `cross_docking_itens` | 0 | ❌ Sem integração | |
| `devolucoes` | 0 | ❌ Sem integração | Devoluções |
| `devolucao_itens` | 0 | ❌ Sem integração | |
| `pesagens` | 0 | ❌ Sem integração | Pesagens de carga |
| `conferencia_cega` | 0 | ❌ Sem integração | Conferência às cegas |
| `conferencia_cega_itens` | 0 | ❌ Sem integração | |
| `alocacoes` | 0 | ❌ Sem integração | Histórico de alocações |
| `ordens_saida` | 0 | ❌ Sem integração | |
| `ordens_saida_itens` | 0 | ❌ Sem integração | |
| `kits_receitas` | 0 | ❌ Sem integração | Kits/montagens |
| `kits_receitas_itens` | 0 | ❌ Sem integração | |
| `ordens_kit` | 0 | ❌ Sem integração | |
| `ordens_kit_componentes` | 0 | ❌ Sem integração | |
| `avarias` | 0 | ❌ Sem integração | Controle de avarias |
| `ordens_servico` | 0 | ❌ Sem integração | OS internas |
| `portaria` | 0 | ❌ Sem integração | Check-in de veículos |
| `docas_atividades` | 0 | ❌ Sem integração | Atividades de doca |
| `cargas` | 0 | ❌ Sem integração | Cargas/expedições |
| `manifestos` | 0 | ❌ Sem integração | Manifestos de transporte |
| `itens_tarefa` | 0 | ❌ Sem integração | Itens por tarefa |

### ⚠️ Tabelas que NÃO existem ainda (precisam ser criadas)

| Tabela Necessária | Usado por | Prioridade |
|------------------|-----------|-----------|
| `veiculos` | RoutesVehicles (AppContext já tem a query pronta) | Alta |
| `rotas` | RoutesVehicles (AppContext já tem a query pronta) | Alta |

---

## 🔌 ESTADO DE INTEGRAÇÃO — CAMADA DE DADOS

### Padrão Arquitetural

```
Páginas JSX
    ↓ useApp()
AppContext.jsx ← ESTADO CENTRAL
    ↓ supabase.from(...)
Supabase PostgreSQL
```

**REGRA:** Nenhuma página deve chamar `supabase.from()` diretamente para entidades gerenciadas pelo AppContext.
Exceção válida: queries ad-hoc de KPI/relatório em páginas específicas (ex: Dashboard, KardexReport).

### O que está em Supabase (real)

```
✅ companies, warehouses, clientes, areas_armazem, setores, lotes, activity_logs, grupos_acesso, operadores
```

### O que ainda está em localStorage (mock)

```
⚠️ warehouseDocks, warehouseLocations, warehouseColmeias, warehouseBancadas,
   warehouseBuffers, warehouseServicos, warehousePacking, userGroups (usar grupos_acesso!),
   users (usar operadores!), serialDevices, labels, transportSchedules, orders, inventory
```

---

## 🗺️ MAPA DE ROTAS (77 rotas ativas)

| Código | Rota | Componente | Supabase? |
|--------|------|-----------|-----------|
| 1.1 | `/` | Dashboard | 🟡 KPIs reais, banco vazio |
| 2.1 | `/operacao/cruzar-docas` | CrossDockingMonitoring | ❌ |
| 2.2 | `/operacao/processar-devolucoes` | ReturnDelivery | ❌ |
| 2.3 | `/operacao/pesar-cargas` | WeighingStation | ❌ |
| 2.4 | `/operacao/gerenciar-recebimento` | ReceivingManager | ❌ |
| 2.5 | `/operacao/conferir-recebimento` | ConferirRecebimento | ❌ |
| 2.6 | `/operacao/gerar-mapa` | AllocationMap | 🟡 Query pronta, banco vazio |
| 2.7 | `/operacao/conferencia-cega` | BlindCheck | ❌ |
| 2.8 | `/operacao/alocar-estoque` | StockAllocation | ❌ |
| 2.9 | `/operacao/kanban-alocacao` | AllocationKanban | ❌ |
| 2.10 | `/operacao/separar-pedidos` | PickingManagement | ❌ |
| 2.11 | `/operacao/embalar-pedidos` | PackingStation | ❌ |
| 2.12 | `/operacao/monitorar-saida` | OutboundMonitoring | ❌ |
| 2.13 | `/operacao/recebimento` | ReceivingCheckIn | ❌ |
| 2.14 | `/operacao/estacao-kits` | KitStation | ❌ |
| 2.15 | `/operacao/conferencia-colmeia` | HoneycombCheck | ❌ |
| 2.16 | `/operacao/mapa-visual` | WarehouseVisualMap | ❌ |
| 2.17 | `/operacao/buffer-1` | Buffer1 | ❌ |
| 2.18 | `/operacao/buffer-2` | Buffer2 | ❌ |
| 2.19 | `/operacao/ordem-servico` | ServiceOrder | ❌ |
| 2.20 | `/operacao/gestao-seguros` | InsuranceManagement | ❌ |
| 2.21 | `/operacao/pesagem-rodoviaria` | RoadWeighingStation | ❌ |
| 2.22 | `/operacao/gerenciamento-pedidos` | OrderManagement | ❌ |
| 3.1 | `/planejamento/gerar-ondas` | WavePickingWizard | ❌ |
| 3.2 | `/planejamento/monitorar-prazos` | WaveSLADashboard | ❌ |
| 3.3 | `/planejamento/agendar-transportes` | TransportSchedule | ❌ |
| 3.4 | `/planejamento/monitorar-atividades` | ActivityManager | ❌ |
| 3.5 | `/planejamento/gerenciar-manifestos` | ManifestManager | ❌ |
| 3.6 | `/planejamento/expedir-cargas` | LoadDetails | ❌ |
| 3.7 | `/planejamento/gerenciar-portaria` | GateManager | ❌ |
| 3.8 | `/planejamento/atividades-docas` | DockActivities | ❌ |
| 4.1 | `/estoque/auditar-inventario` | InventoryAudit | ❌ |
| 4.2 | `/estoque/consultar-kardex` | KardexReport | 🟡 Query pronta, banco vazio |
| 4.3 | `/estoque/analisar-estoque` | InventoryManagement | ❌ |
| 4.4 | `/estoque/remanejar` | StockReplenishment | ❌ |
| 4.5 | `/estoque/controlar-lotes` | LotManager | ✅ CRUD completo |
| 4.6 | `/estoque/monitorar-avarias` | DamageControl | ❌ |
| 5.1 | `/fiscal/gerenciar-nfe` | NFeControl | ❌ |
| 5.2 | `/fiscal/gerenciar-cte` | CTeControl | ❌ |
| 5.3 | `/fiscal/emitir-cobertura` | FiscalCoverage | ❌ |
| 5.4 | `/fiscal/armazem-geral` | GeneralWarehouseFiscal | ❌ |
| 6.1 | `/financeiro/calcular-diarias` | BillingReports | ❌ |
| 6.2 | `/financeiro/contratos` | ContractManager | ❌ |
| 7.1 | `/cadastros/empresas` | Companies | ✅ CRUD completo |
| 7.2 | `/cadastros/armazens` | Warehouses | ✅ CRUD completo |
| 7.3 | `/cadastros/enderecos` | AddressManagement | 🟡 UI pronta, sem CRUD Supabase |
| 7.3.1 | `/cadastros/clientes` | CustomerCatalog | ✅ CRUD (tabela corrigida) |
| 7.4 | `/cadastros/produtos` | ProductCatalog | 🟡 UI pronta, banco vazio |
| 7.5 | `/cadastros/rotas-veiculos` | RoutesVehicles | ❌ Tabelas não existem |
| 7.6 | `/cadastros/areas` | WarehouseAreas | ✅ CRUD (tabela corrigida) |
| 7.7 | `/cadastros/setores` | Sectors | ✅ CRUD completo |
| 8.1 | `/indicadores/financeiro` | FinancialDashboard | ❌ |
| 8.2 | `/indicadores/ocupacao` | (EnterprisePageBase inline) | ❌ |
| 8.3 | `/indicadores/produtividade` | OperatorPerformance | ❌ |
| 8.4 | `/indicadores/auditoria` | AuditLogs | 🟡 activity_logs query existe |
| 8.5 | `/indicadores/integracao` | IntegrationResults | ❌ |
| 9.1 | `/integrar/alertas` | IntegrationAlerts | ❌ |
| 9.2 | `/integrar/ordens-erp` | ERPOrderIntegration | ❌ |
| 9.3 | `/integrar/omie` | OmieIntegration | 🟡 omieApi.js existe |
| 9.4 | `/integrar/arquivos` | FileIntegration | ❌ |
| 9.5 | `/integrar/apis` | RestConfig | ❌ |
| 9.6 | `/integrar/ondas` | IntegrationWaves | ❌ |
| 10.1 | `/config/geral` | GeneralSettings | ❌ |
| 10.2 | `/config/balancas` | SerialDevices | ❌ |
| 10.3 | `/config/service-desk` | ServiceDesk | ❌ |
| 10.4 | `/config/expurgo` | DataPurge | ❌ |
| 10.5 | `/config/certificados` | SefazCertificates | ❌ |
| 10.x | `/config/etiquetas` | LabelManager | ❌ |
| 11.1 | `/seguranca/usuarios` | UsersPage | ✅ Auth (convites, resetar senha) |
| 11.2 | `/seguranca/grupos` | UserGroups | ❌ Usa localStorage (deve usar grupos_acesso) |
| 11.3 | `/seguranca/relatorio-colaboradores` | CollaboratorReport | 🟡 activity_logs |

**Legenda:** ✅ Integrado e funcional | 🟡 Query existe, banco sem dados | ❌ Sem integração Supabase

---

## 🔧 BUGS CORRIGIDOS (2026-03-21 — commit 43739f6)

| Bug | Arquivo | Fix |
|-----|---------|-----|
| `useApp` não exportado por AppContext | 23 páginas | Import corrigido para `../hooks/useApp` |
| `warehouseId` undefined → loading infinito | AppContext.jsx | Adicionado `warehouseId: warehouses[0]?.id ?? null` no provider |
| Tabela `customers` não existe | AppContext.jsx + lib/ | Renomeado para `clientes` |
| Tabela `areas` não existe | AppContext.jsx | Renomeado para `areas_armazem` |
| Tabela `inventory_movements` não existe | lib/supabaseClient.js | Renomeado para `movimento_estoque` |
| Enum `situacao` wrongos em notas_saida | Dashboard.jsx | Corrigido para 'Pendentes', 'Processadas' |
| Query tarefas usando JSONB em vez de coluna | Dashboard.jsx | Corrigido `.eq('warehouse_id', id)` direto |

---

## ⚡ PRÓXIMOS PASSOS (prioridade de execução)

### 🔴 P0 — Crítico para operação mínima

- [ ] **Popular tabelas com dados reais** — `produtos`, `enderecos`, `clientes`, `ordens_recebimento` estão todos em 0 linhas
- [ ] **Criar tabelas** `veiculos` e `rotas` no Supabase
- [ ] **Migrar UserGroups** de localStorage para `grupos_acesso` (tabela já existe com 5 grupos)

### 🟡 P1 — Fluxo de Recebimento (core do WMS)

```
ReceivingCheckIn → ReceivingManager → ConferirRecebimento → AllocationMap → StockAllocation
     portaria    ordens_recebimento  conferencia_cega     enderecos/alocacoes  alocacao_estoque
```

- [ ] Integrar `ReceivingCheckIn.jsx` com tabela `portaria`
- [ ] Integrar `ReceivingManager.jsx` com `ordens_recebimento`
- [ ] Integrar `ConferirRecebimento.jsx` com `conferencia_cega`
- [ ] Integrar `AllocationMap.jsx` — query já existe, precisa de dados em `enderecos`
- [ ] Integrar `StockAllocation.jsx` com `alocacao_estoque`

### 🟡 P2 — Fluxo de Expedição/Picking

```
WavePickingWizard → PickingManagement → HoneycombCheck → PackingStation → OutboundMonitoring
     tarefas         ordens_saida_itens  alocacao_estoque    -             notas_saida/cargas
```

### 🟡 P3 — Cadastros Base

- [ ] `ProductCatalog.jsx` → listar/CRUD de `produtos` (campo `descricao`, `sku`, `warehouse_id`)
- [ ] `AddressManagement.jsx` → CRUD de `enderecos`
- [ ] `RoutesVehicles.jsx` → criar tabelas + CRUD

### 🟢 P4 — Views SQL para performance

```sql
-- Sugerido pelo Gemini: view para Dashboard KPIs (evita múltiplas queries)
CREATE VIEW dashboard_kpis AS
SELECT
  w.id as warehouse_id,
  COUNT(DISTINCT ae.endereco_id) as enderecos_ocupados,
  COUNT(DISTINCT e.id) as total_enderecos,
  COUNT(DISTINCT ns.id) FILTER (WHERE ns.situacao IN ('Pendentes','Aguardando Formação Onda')) as pedidos_pendentes,
  COUNT(DISTINCT t.id) FILTER (WHERE t.status IN ('pendente','em_execucao')) as ondas_ativas
FROM warehouses w
LEFT JOIN enderecos e ON e.warehouse_id = w.id
LEFT JOIN alocacao_estoque ae ON ae.warehouse_id = w.id
LEFT JOIN notas_saida ns ON ns.warehouse_id = w.id
LEFT JOIN tarefas t ON t.warehouse_id = w.id
GROUP BY w.id;
```

### 🟢 P5 — CI/CD Hostinger

- [ ] Verificar `.github/workflows/` para pipeline automático
- [ ] Configurar `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` nos Secrets do GitHub
- [ ] Configurar deploy automático para Hostinger via FTP/webhook

---

## 🏗️ ARQUITETURA DE COMPONENTES

```
App.jsx (root)
├── BrowserRouter
│   ├── /login → Login.jsx (fora do layout)
│   ├── /auth/* → AuthCallback.jsx, AuthCallbackPage.jsx, UpdatePassword.jsx
│   └── /* → MainLayout (Sidebar + Header + main)
│       └── Suspense → routes.jsx (77 páginas lazy-loaded)
│
AppProvider (AppContext.jsx)
└── Wraps toda a árvore — fornece estado global + CRUD functions
```

### Fluxo de dados de uma página típica

```jsx
// ✅ PADRÃO CORRETO
import { useApp } from '../hooks/useApp';   // ← não do AppContext direto!

export default function MinhaPage() {
  const { warehouses, clientes, addCliente } = useApp();
  // ... renderização com dados reais
}

// ❌ PADRÃO ERRADO (causava bug de build)
import { useApp } from '../context/AppContext';  // useApp NÃO é exportado aqui
```

---

## 🔑 VARIÁVEIS DE AMBIENTE

```env
# .env (local)
VITE_SUPABASE_URL=https://clakkpyzinuheubkhdep.supabase.co
VITE_SUPABASE_ANON_KEY=[ver .env.local do projeto]
VITE_APP_URL=https://wmsverticalparts.com.br
```

O arquivo `.env` existe localmente e **não está no repositório** (gitignored).
Para o deploy na Hostinger, as variáveis devem ser configuradas nos:
- GitHub Secrets (para o workflow de build)
- Painel da Hostinger (se usar SSR ou Node)

---

## 📊 MÉTRICAS DO PROJETO

| Métrica | Valor |
|---------|-------|
| Páginas JSX | 78 (77 com rota + 1 .bak) |
| Tabelas Supabase | 38 |
| Tabelas integradas (leitura) | 11 |
| Tabelas integradas (CRUD completo) | 6 |
| Tabelas com 0 linhas | 35 |
| Build time | ~23 segundos |
| Bundle size (gzip) | ~170 kB (JS) |
| Último commit | `43739f6` — 2026-03-21 |

---

## 🤖 CONTEXTO PARA AGENTES DE IA

### Para o **Gemini** (entrando agora)

1. O frontend está **completo visualmente** — 78 páginas, design premium, totalmente responsivo
2. O backend (Supabase) tem **38 tabelas no schema correto**, mas todas com **0 linhas de dados reais**
3. Os bugs críticos de import e nomes de tabela foram **corrigidos** em 2026-03-21
4. A prioridade imediata é **popular o banco com dados reais** + criar as Views SQL para os KPIs
5. O maior impacto: criar a **View `dashboard_kpis`** no Supabase SQL Editor (ver P4 acima)
6. A CI/CD para Hostinger **ainda não foi configurada** — oportunidade perfeita para o Gemini

### Para qualquer agente que assumir

- **Nunca** criar dados mock novos — se não há dado real, mostrar `0` ou `'—'`
- **Nunca** importar `useApp` de `context/AppContext` — sempre de `hooks/useApp`
- **Nunca** chamar `supabase.from('customers')` — a tabela é `clientes`
- **Nunca** chamar `supabase.from('areas')` — a tabela é `areas_armazem`
- **Nunca** chamar `supabase.from('inventory_movements')` — é `movimento_estoque`

### Status do handoff

```
✅ Frontend: COMPLETO (78 páginas, design finalizado)
✅ Auth: FUNCIONAL (login, convites, permissões por página)
✅ Build: PASSING (npm run build sem erros)
✅ Core bugs: CORRIGIDOS (imports, nomes de tabela, warehouseId)
🟡 Banco: SCHEMA PRONTO, 0 dados reais
🔴 Fluxo Recebimento: NÃO INTEGRADO
🔴 Fluxo Expedição: NÃO INTEGRADO  
🔴 CI/CD Hostinger: NÃO CONFIGURADO
```

---

*Gerado automaticamente por Antigravity AI em 2026-03-21T17:18:17-03:00*
*Próxima atualização: após o próximo ciclo de integração*
