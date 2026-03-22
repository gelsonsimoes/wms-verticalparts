import React, { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import EnterprisePageBase from './components/layout/EnterprisePageBase';

// 1. PRINCIPAL
const Dashboard = lazy(() => import('./pages/Dashboard'));

// 2. OPERAR
const CrossDockingMonitoring = lazy(() => import('./pages/CrossDockingMonitoring'));
const ReturnDelivery = lazy(() => import('./pages/ReturnDelivery'));
const WeighingStation = lazy(() => import('./pages/WeighingStation'));
const ReceivingManager = lazy(() => import('./pages/ReceivingManager'));
const ConferirRecebimento = lazy(() => import('./pages/ConferirRecebimento'));
const AllocationMap = lazy(() => import('./pages/AllocationMap'));
const BlindCheck = lazy(() => import('./pages/BlindCheck'));
const StockAllocation = lazy(() => import('./pages/StockAllocation'));
const AllocationKanban = lazy(() => import('./pages/AllocationKanban'));
const PickingManagement = lazy(() => import('./pages/PickingManagement'));
const PackingStation = lazy(() => import('./pages/PackingStation'));
const OutboundMonitoring = lazy(() => import('./pages/OutboundMonitoring'));
const ReceivingCheckIn = lazy(() => import('./pages/ReceivingCheckIn'));
const KitStation = lazy(() => import('./pages/KitStation'));
const HoneycombCheck = lazy(() => import('./pages/HoneycombCheck'));
const ServiceOrder = lazy(() => import('./pages/ServiceOrder'));
const InsuranceManagement = lazy(() => import('./pages/InsuranceManagement'));
const RoadWeighingStation = lazy(() => import('./pages/RoadWeighingStation'));
const WarehouseVisualMap = lazy(() => import('./pages/WarehouseVisualMap'));
const Buffer1 = lazy(() => import('./pages/Buffer1'));
const Buffer2 = lazy(() => import('./pages/Buffer2'));
const OrderManagement = lazy(() => import('./pages/OrderManagement'));

// 3. PLANEJAR
const WavePickingWizard = lazy(() => import('./pages/WavePickingWizard'));
const WaveSLADashboard = lazy(() => import('./pages/WaveSLADashboard'));
const TransportSchedule = lazy(() => import('./pages/TransportSchedule'));
const ActivityManager = lazy(() => import('./pages/ActivityManager'));
const ManifestManager = lazy(() => import('./pages/ManifestManager'));
const LoadDetails = lazy(() => import('./pages/LoadDetails'));
const GateManager = lazy(() => import('./pages/GateManager'));
const DockActivities = lazy(() => import('./pages/DockActivities'));

// 4. CONTROLAR
const InventoryAudit = lazy(() => import('./pages/InventoryAudit'));
const KardexReport = lazy(() => import('./pages/KardexReport'));
const InventoryManagement = lazy(() => import('./pages/InventoryManagement'));
const StockReplenishment = lazy(() => import('./pages/StockReplenishment'));
const LotManager = lazy(() => import('./pages/LotManager'));
const DamageControl = lazy(() => import('./pages/DamageControl'));

// 5. FISCAL
const NFeControl = lazy(() => import('./pages/NFeControl'));
const CTeControl = lazy(() => import('./pages/CTeControl'));
const FiscalCoverage = lazy(() => import('./pages/FiscalCoverage'));
const GeneralWarehouseFiscal = lazy(() => import('./pages/GeneralWarehouseFiscal'));

// 6. FINANCEIRO
const BillingReports = lazy(() => import('./pages/BillingReports'));
const ContractManager = lazy(() => import('./pages/ContractManager'));

// 7. CADASTRAR
const Companies = lazy(() => import('./pages/Companies'));
const Warehouses = lazy(() => import('./pages/Warehouses'));
const AddressManagement = lazy(() => import('./pages/AddressManagement'));
const ProductCatalog = lazy(() => import('./pages/ProductCatalog'));
const RoutesVehicles = lazy(() => import('./pages/RoutesVehicles'));
const WarehouseAreas = lazy(() => import('./pages/WarehouseAreas'));
const Sectors = lazy(() => import('./pages/Sectors'));
const LabelManager = lazy(() => import('./pages/LabelManager'));
const CustomerCatalog = lazy(() => import('./pages/CustomerCatalog'));
const SupplierCatalog = lazy(() => import('./pages/SupplierCatalog'));
const CarrierCatalog  = lazy(() => import('./pages/CarrierCatalog'));

// 8. INDICADORES
const FinancialDashboard = lazy(() => import('./pages/FinancialDashboard'));
const OperatorPerformance = lazy(() => import('./pages/OperatorPerformance'));
const AuditLogs = lazy(() => import('./pages/AuditLogs'));
const IntegrationResults = lazy(() => import('./pages/IntegrationResults'));

// 9. INTEGRAR
const IntegrationAlerts = lazy(() => import('./pages/IntegrationAlerts'));
const ERPOrderIntegration = lazy(() => import('./pages/ERPOrderIntegration'));
const OmieIntegration = lazy(() => import('./pages/OmieIntegration'));
const FileIntegration = lazy(() => import('./pages/FileIntegration'));
const RestConfig = lazy(() => import('./pages/RestConfig'));
const IntegrationWaves = lazy(() => import('./pages/IntegrationWaves'));

// 10. CONFIGURAR
const GeneralSettings = lazy(() => import('./pages/GeneralSettings'));
const SerialDevices = lazy(() => import('./pages/SerialDevices'));
const ServiceDesk = lazy(() => import('./pages/ServiceDesk'));
const DataPurge = lazy(() => import('./pages/DataPurge'));
const SefazCertificates = lazy(() => import('./pages/SefazCertificates'));

// 11. SEGURANÇA
const UsersPage = lazy(() => import('./pages/UsersPage'));
const UserGroups = lazy(() => import('./pages/UserGroups'));
const CollaboratorReport = lazy(() => import('./pages/CollaboratorReport'));

// 12. AUTH (FLUXOS DE ACESSO)
const AuthCallback = lazy(() => import('./pages/AuthCallback'));
const UpdatePassword = lazy(() => import('./pages/UpdatePassword'));

// Exportação do array de rotas
export const appRoutes = [
  { path: '/', element: <Dashboard />, meta: { codigo: '1.1', titulo: 'Dashboard Geral' } },
  
  // OPERAR
  { path: '/operacao/cruzar-docas', element: <CrossDockingMonitoring />, meta: { codigo: '2.1', titulo: 'Cruzar Docas' } },
  { path: '/operacao/processar-devolucoes', element: <ReturnDelivery />, meta: { codigo: '2.2', titulo: 'Processar Devoluções' } },
  { path: '/operacao/pesar-cargas', element: <WeighingStation />, meta: { codigo: '2.3', titulo: 'Pesar Cargas' } },
  { path: '/operacao/gerenciar-recebimento', element: <ReceivingManager />, meta: { codigo: '2.4', titulo: 'Gerenciar Recebimento' } },
  { path: '/operacao/conferir-recebimento', element: <ConferirRecebimento />, meta: { codigo: '2.5', titulo: 'Conferir Recebimento' } },
  { path: '/operacao/gerar-mapa', element: <AllocationMap />, meta: { codigo: '2.6', titulo: 'Gerar Mapa de Alocação' } },
  { path: '/operacao/conferencia-cega', element: <BlindCheck />, meta: { codigo: '2.7', titulo: 'Realizar Conferência Cega' } },
  { path: '/operacao/alocar-estoque', element: <StockAllocation />, meta: { codigo: '2.8', titulo: 'Alocar Estoque' } },
  { path: '/operacao/kanban-alocacao', element: <AllocationKanban />, meta: { codigo: '2.9', titulo: 'Kanban de Alocação' } },
  { path: '/operacao/separar-pedidos', element: <PickingManagement />, meta: { codigo: '2.10', titulo: 'Separar Pedidos' } },
  { path: '/operacao/embalar-pedidos', element: <PackingStation />, meta: { codigo: '2.11', titulo: 'Embalar Pedidos' } },
  { path: '/operacao/monitorar-saida', element: <OutboundMonitoring />, meta: { codigo: '2.12', titulo: 'Monitorar Saída' } },
  { path: '/operacao/recebimento', element: <ReceivingCheckIn />, meta: { codigo: '2.13', titulo: 'Recebimento (Check-in)' } },
  { path: '/operacao/estacao-kits', element: <KitStation />, meta: { codigo: '2.14', titulo: 'Estação de Kits' } },
  { path: '/operacao/conferencia-colmeia', element: <HoneycombCheck />, meta: { codigo: '2.15', titulo: 'Conferência Colmeia' } },
  { path: '/operacao/ordem-servico', element: <ServiceOrder />, meta: { codigo: '2.19', titulo: 'Ordem de Serviço' } },
  { path: '/operacao/gestao-seguros', element: <InsuranceManagement />, meta: { codigo: '2.20', titulo: 'Gestão de Seguros' } },
  { path: '/operacao/pesagem-rodoviaria', element: <RoadWeighingStation />, meta: { codigo: '2.21', titulo: 'Pesagem Rodoviária' } },
  { path: '/operacao/mapa-visual', element: <WarehouseVisualMap />, meta: { codigo: '2.16', titulo: 'Mapa Visual de Estoque' } },
  { path: '/operacao/buffer-1', element: <Buffer1 />, meta: { codigo: '2.17', titulo: 'Buffer 1' } },
  { path: '/operacao/buffer-2', element: <Buffer2 />, meta: { codigo: '2.18', titulo: 'Buffer 2' } },
  { path: '/operacao/gerenciamento-pedidos', element: <OrderManagement />, meta: { codigo: '2.22', titulo: 'Gerenciamento de Pedidos' } },

  // PLANEJAR
  { path: '/planejamento/gerar-ondas', element: <WavePickingWizard />, meta: { codigo: '3.1', titulo: 'Gerar Ondas de Separação' } },
  { path: '/planejamento/monitorar-prazos', element: <WaveSLADashboard />, meta: { codigo: '3.2', titulo: 'Monitorar Prazos (SLA)' } },
  { path: '/planejamento/agendar-transportes', element: <TransportSchedule />, meta: { codigo: '3.3', titulo: 'Agendar Transportes' } },
  { path: '/planejamento/monitorar-atividades', element: <ActivityManager />, meta: { codigo: '3.4', titulo: 'Monitorar Atividades' } },
  { path: '/planejamento/gerenciar-manifestos', element: <ManifestManager />, meta: { codigo: '3.5', titulo: 'Gerenciar Manifestos' } },
  { path: '/planejamento/expedir-cargas', element: <LoadDetails />, meta: { codigo: '3.6', titulo: 'Expedir Cargas' } },
  { path: '/planejamento/gerenciar-portaria', element: <GateManager />, meta: { codigo: '3.7', titulo: 'Gerenciar Portaria' } },
  { path: '/planejamento/atividades-docas', element: <DockActivities />, meta: { codigo: '3.8', titulo: 'Atividades de Docas' } },

  // CONTROLAR
  { path: '/estoque/auditar-inventario', element: <InventoryAudit />, meta: { codigo: '4.1', titulo: 'Auditar Inventário' } },
  { path: '/estoque/consultar-kardex', element: <KardexReport />, meta: { codigo: '4.2', titulo: 'Consultar Kardex' } },
  { path: '/estoque/analisar-estoque', element: <InventoryManagement />, meta: { codigo: '4.3', titulo: 'Analisar Estoque' } },
  { path: '/estoque/remanejar', element: <StockReplenishment />, meta: { codigo: '4.4', titulo: 'Remanejar Produtos' } },
  { path: '/estoque/controlar-lotes', element: <LotManager />, meta: { codigo: '4.5', titulo: 'Controlar Lotes e Validade' } },
  { path: '/estoque/monitorar-avarias', element: <DamageControl />, meta: { codigo: '4.6', titulo: 'Monitorar Avarias' } },
  { path: '/estoque/gestao-inventario', element: <InventoryManagement />, meta: { codigo: '4.7', titulo: 'Gestão de Inventário' } },

  // FISCAL
  { path: '/fiscal/gerenciar-nfe', element: <NFeControl />, meta: { codigo: '5.1', titulo: 'Gerenciar NF-e' } },
  { path: '/fiscal/gerenciar-cte', element: <CTeControl />, meta: { codigo: '5.2', titulo: 'Gerenciar CT-e' } },
  { path: '/fiscal/emitir-cobertura', element: <FiscalCoverage />, meta: { codigo: '5.3', titulo: 'Emitir Cobertura Fiscal' } },
  { path: '/fiscal/armazem-geral', element: <GeneralWarehouseFiscal />, meta: { codigo: '5.4', titulo: 'Controlar Armazém Geral' } },

  // FINANCEIRO
  { path: '/financeiro/calcular-diarias', element: <BillingReports />, meta: { codigo: '6.1', titulo: 'Calcular Diárias' } },
  { path: '/financeiro/contratos', element: <ContractManager />, meta: { codigo: '6.2', titulo: 'Gerenciar Contratos' } },

  // CADASTRAR
  { path: '/cadastros/empresas', element: <Companies />, meta: { codigo: '7.1', titulo: 'Gerenciar Empresas' } },
  { path: '/cadastros/armazens', element: <Warehouses />, meta: { codigo: '7.2', titulo: 'Configurar Armazéns' } },
  { path: '/cadastros/enderecos', element: <AddressManagement />, meta: { codigo: '7.3', titulo: 'Cadastrar Endereços' } },
  { path: '/cadastros/clientes', element: <CustomerCatalog />, meta: { codigo: '7.3.1', titulo: 'Catálogo de Clientes' } },
  { path: '/cadastros/fornecedores',    element: <SupplierCatalog />, meta: { codigo: '7.3.2', titulo: 'Catálogo de Fornecedores' } },
  { path: '/cadastros/transportadoras', element: <CarrierCatalog />,  meta: { codigo: '7.3.3', titulo: 'Catálogo de Transportadoras' } },
  { path: '/cadastros/produtos', element: <ProductCatalog />, meta: { codigo: '7.4', titulo: 'Cadastro de Produtos' } },
  { path: '/cadastros/rotas-veiculos', element: <RoutesVehicles />, meta: { codigo: '7.5', titulo: 'Cadastrar Rotas e Veículos' } },
  { path: '/cadastros/areas', element: <WarehouseAreas />, meta: { codigo: '7.6', titulo: 'Configurar Áreas' } },
  { path: '/cadastros/setores', element: <Sectors />, meta: { codigo: '7.7', titulo: 'Configurar Setores' } },
  { path: '/config/etiquetas', element: <LabelManager />, meta: { codigo: '7.10', titulo: 'Gerenciar Etiquetas' } },

  // INDICADORES
  { path: '/indicadores/financeiro', element: <FinancialDashboard />, meta: { codigo: '8.1', titulo: 'Dashboard Financeiro' } },
  { path: '/indicadores/ocupacao', element: <EnterprisePageBase title="8.2 Analisar Ocupação" breadcrumbItems={[{label: 'Indicadores'}]} />, meta: { codigo: '8.2', titulo: 'Analisar Ocupação' } },
  { path: '/indicadores/produtividade', element: <OperatorPerformance />, meta: { codigo: '8.3', titulo: 'Medir Produtividade' } },
  { path: '/indicadores/auditoria', element: <AuditLogs />, meta: { codigo: '8.4', titulo: 'Auditar Logs do Sistema' } },
  { path: '/indicadores/integracao', element: <IntegrationResults />, meta: { codigo: '8.5', titulo: 'Resultados de Integração' } },

  // INTEGRAR
  { path: '/integrar/alertas', element: <IntegrationAlerts />, meta: { codigo: '9.1', titulo: 'Alertas de Integração' } },
  { path: '/integrar/ordens-erp', element: <ERPOrderIntegration />, meta: { codigo: '9.2', titulo: 'Sincronizar Ordens ERP' } },
  { path: '/integrar/omie', element: <OmieIntegration />, meta: { codigo: '9.3', titulo: 'Conectar Omie ERP' } },
  { path: '/integrar/arquivos', element: <FileIntegration />, meta: { codigo: '9.4', titulo: 'Mapear Arquivos (Layouts)' } },
  { path: '/integrar/apis', element: <RestConfig />, meta: { codigo: '9.5', titulo: 'Configurar APIs REST' } },
  { path: '/integrar/ondas', element: <IntegrationWaves />, meta: { codigo: '9.6', titulo: 'Integrar Ondas (Arquivo)' } },

  // CONFIGURAR
  { path: '/config/geral', element: <GeneralSettings />, meta: { codigo: '10.1', titulo: 'Ajustar Configurações' } },
  { path: '/config/balancas', element: <SerialDevices />, meta: { codigo: '10.2', titulo: 'Integrar Balanças (Serial)' } },
  { path: '/config/service-desk', element: <ServiceDesk />, meta: { codigo: '10.3', titulo: 'Gerenciar Service Desk' } },
  { path: '/config/expurgo', element: <DataPurge />, meta: { codigo: '10.4', titulo: 'Expurgar Dados Antigos' } },
  { path: '/config/certificados', element: <SefazCertificates />, meta: { codigo: '10.5', titulo: 'Gerenciar Certificados' } },

  // SEGURANÇA
  { path: '/seguranca/usuarios', element: <UsersPage />, meta: { codigo: '11.1', titulo: 'Gerenciar Usuários' } },
  { path: '/seguranca/grupos', element: <UserGroups />, meta: { codigo: '11.2', titulo: 'Definir Grupos de Acesso' } },
  { path: '/seguranca/relatorio-colaboradores', element: <CollaboratorReport />, meta: { codigo: '11.3', titulo: 'Relatório de Colaboradores' } },

  // AUTH
  { path: '/auth/callback', element: <AuthCallback /> },
  { path: '/auth/update-password', element: <UpdatePassword /> },
];
