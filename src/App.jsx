import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import { AppProvider } from './context/AppContext';
import ChatAssistant from './components/chat/ChatAssistant';

// Refactored Enterprise Pages
import Dashboard from './pages/Dashboard';
import AllocationKanban from './pages/AllocationKanban';
import LoadDetails from './pages/LoadDetails';
import InventoryManagement from './pages/InventoryManagement';
import OrderManagement from './pages/OrderManagement';
import Companies from './pages/Companies';
import Warehouses from './pages/Warehouses';
import UsersPage from './pages/UsersPage';
import BillingReports from './pages/BillingReports';
import FinancialDashboard from './pages/FinancialDashboard';
import IntegrationAlerts from './pages/IntegrationAlerts';
import ERPOrderIntegration from './pages/ERPOrderIntegration';
import NFeControl from './pages/NFeControl';
import ServiceOrder from './pages/ServiceOrder';
import GateManager from './pages/GateManager';
import ServiceDesk from './pages/ServiceDesk';

// New Pages Mapped
import CrossDockingMonitoring from './pages/CrossDockingMonitoring';
import ReturnDelivery from './pages/ReturnDelivery';
import WeighingStation from './pages/WeighingStation';
import ReceivingManager from './pages/ReceivingManager';
import ConferirRecebimento from './pages/ConferirRecebimento';
import AllocationMap from './pages/AllocationMap';
import BlindCheck from './pages/BlindCheck';
import PickingManagement from './pages/PickingManagement';
import PackingStation from './pages/PackingStation';
import OutboundMonitoring from './pages/OutboundMonitoring';
import ReceivingCheckIn from './pages/ReceivingCheckIn';
import KitStation from './pages/KitStation';
import HoneycombCheck from './pages/HoneycombCheck';
import InsuranceManagement from './pages/InsuranceManagement';
import RoadWeighingStation from './pages/RoadWeighingStation';

import WavePickingWizard from './pages/WavePickingWizard';
import WaveSLADashboard from './pages/WaveSLADashboard';
import TransportSchedule from './pages/TransportSchedule';
import ActivityManager from './pages/ActivityManager';
import ManifestManager from './pages/ManifestManager';
import DockActivities from './pages/DockActivities';

import InventoryAudit from './pages/InventoryAudit';
import KardexReport from './pages/KardexReport';
import StockReplenishment from './pages/StockReplenishment';
import LotManager from './pages/LotManager';
import DamageControl from './pages/DamageControl';

import CTeControl from './pages/CTeControl';
import FiscalCoverage from './pages/FiscalCoverage';
import GeneralWarehouseFiscal from './pages/GeneralWarehouseFiscal';

import ContractManager from './pages/ContractManager';

import AddressManagement from './pages/AddressManagement';
import ProductCatalog from './pages/ProductCatalog';
import RoutesVehicles from './pages/RoutesVehicles';
import WarehouseAreas from './pages/WarehouseAreas';
import Sectors from './pages/Sectors';
import LabelManager from './pages/LabelManager';

import OperatorPerformance from './pages/OperatorPerformance';
import AuditLogs from './pages/AuditLogs';
import IntegrationResults from './pages/IntegrationResults';

import OmieIntegration from './pages/OmieIntegration';
import FileIntegration from './pages/FileIntegration';
import RestConfig from './pages/RestConfig';
import IntegrationWaves from './pages/IntegrationWaves';

import GeneralSettings from './pages/GeneralSettings';
import SerialDevices from './pages/SerialDevices';
import DataPurge from './pages/DataPurge';
import SefazCertificates from './pages/SefazCertificates';

import UserGroups from './pages/UserGroups';

// Boilerplate Component for Non-Refactored Pages
import EnterprisePageBase from './components/layout/EnterprisePageBase';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <AppProvider>
      <Router>
        <div className="flex min-h-screen bg-white text-[var(--vp-text-data)] font-sans">
          <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

          <main className={`flex-1 flex flex-col ${isSidebarOpen ? 'lg:ml-72' : 'lg:ml-20'} min-w-0 transition-all duration-300 ease-in-out`}>
            <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

            <div className="flex-1 overflow-x-hidden bg-white">
              <Routes>
                {/* 1. PRINCIPAL */}
                <Route path="/" element={<Dashboard />} />

                {/* 2. OPERAR */}
                <Route path="/operacao/cruzar-docas" element={<CrossDockingMonitoring />} />
                <Route path="/operacao/processar-devolucoes" element={<ReturnDelivery />} />
                <Route path="/operacao/pesar-cargas" element={<WeighingStation />} />
                <Route path="/operacao/gerenciar-recebimento" element={<ReceivingManager />} />
                <Route path="/operacao/conferir-recebimento" element={<ConferirRecebimento />} />
                <Route path="/operacao/gerar-mapa" element={<AllocationMap />} />
                <Route path="/operacao/conferencia-cega" element={<BlindCheck />} />
                <Route path="/operacao/alocar-estoque" element={<AllocationKanban />} />
                <Route path="/operacao/kanban-alocacao" element={<AllocationKanban />} />
                <Route path="/operacao/separar-pedidos" element={<PickingManagement />} />
                <Route path="/operacao/embalar-pedidos" element={<PackingStation />} />
                <Route path="/operacao/monitorar-saida" element={<OutboundMonitoring />} />
                <Route path="/operacao/recebimento" element={<ReceivingCheckIn />} />
                <Route path="/operacao/estacao-kits" element={<KitStation />} />
                <Route path="/operacao/conferencia-colmeia" element={<HoneycombCheck />} />
                <Route path="/operacao/ordem-servico" element={<ServiceOrder />} />
                <Route path="/operacao/gestao-seguros" element={<InsuranceManagement />} />
                <Route path="/operacao/pesagem-rodoviaria" element={<RoadWeighingStation />} />
                <Route path="/operacao/gerenciamento-pedidos" element={<OrderManagement />} />

                {/* 3. PLANEJAR */}
                <Route path="/planejamento/gerar-ondas" element={<WavePickingWizard />} />
                <Route path="/planejamento/monitorar-prazos" element={<WaveSLADashboard />} />
                <Route path="/planejamento/agendar-transportes" element={<TransportSchedule />} />
                <Route path="/planejamento/monitorar-atividades" element={<ActivityManager />} />
                <Route path="/planejamento/gerenciar-manifestos" element={<ManifestManager />} />
                <Route path="/planejamento/expedir-cargas" element={<LoadDetails />} />
                <Route path="/planejamento/gerenciar-portaria" element={<GateManager />} />
                <Route path="/planejamento/atividades-docas" element={<DockActivities />} />

                {/* 4. CONTROLAR */}
                <Route path="/estoque/auditar-inventario" element={<InventoryAudit />} />
                <Route path="/estoque/consultar-kardex" element={<KardexReport />} />
                <Route path="/estoque/analisar-estoque" element={<InventoryManagement />} />
                <Route path="/estoque/remanejar" element={<StockReplenishment />} />
                <Route path="/estoque/controlar-lotes" element={<LotManager />} />
                <Route path="/estoque/monitorar-avarias" element={<DamageControl />} />
                <Route path="/estoque/gestao-inventario" element={<InventoryManagement />} />

                {/* 5. FISCAL */}
                <Route path="/fiscal/gerenciar-nfe" element={<NFeControl />} />
                <Route path="/fiscal/gerenciar-cte" element={<CTeControl />} />
                <Route path="/fiscal/emitir-cobertura" element={<FiscalCoverage />} />
                <Route path="/fiscal/armazem-geral" element={<GeneralWarehouseFiscal />} />

                {/* 6. FINANCEIRO */}
                <Route path="/financeiro/calcular-diarias" element={<BillingReports />} />
                <Route path="/financeiro/contratos" element={<ContractManager />} />

                {/* 7. CADASTRAR */}
                <Route path="/cadastros/empresas" element={<Companies />} />
                <Route path="/cadastros/armazens" element={<Warehouses />} />
                <Route path="/cadastros/enderecos" element={<AddressManagement />} />
                <Route path="/cadastros/produtos" element={<ProductCatalog />} />
                <Route path="/cadastros/rotas-veiculos" element={<RoutesVehicles />} />
                <Route path="/cadastros/areas" element={<WarehouseAreas />} />
                <Route path="/cadastros/setores" element={<Sectors />} />
                <Route path="/config/etiquetas" element={<LabelManager />} />

                {/* 8. INDICADORES */}
                <Route path="/indicadores/financeiro" element={<FinancialDashboard />} />
                <Route path="/indicadores/ocupacao" element={<EnterprisePageBase title="7.2 Analisar Ocupação" breadcrumbItems={[{label: 'Indicadores'}]} />} />
                <Route path="/indicadores/produtividade" element={<OperatorPerformance />} />
                <Route path="/indicadores/auditoria" element={<AuditLogs />} />
                <Route path="/indicadores/integracao" element={<IntegrationResults />} />

                {/* 9. INTEGRAR */}
                <Route path="/integrar/alertas" element={<IntegrationAlerts />} />
                <Route path="/integrar/ordens-erp" element={<ERPOrderIntegration />} />
                <Route path="/integrar/omie" element={<OmieIntegration />} />
                <Route path="/integrar/arquivos" element={<FileIntegration />} />
                <Route path="/integrar/apis" element={<RestConfig />} />
                <Route path="/integrar/ondas" element={<IntegrationWaves />} />

                {/* 10. CONFIGURAR */}
                <Route path="/config/geral" element={<GeneralSettings />} />
                <Route path="/config/balancas" element={<SerialDevices />} />
                <Route path="/config/service-desk" element={<ServiceDesk />} />
                <Route path="/config/expurgo" element={<DataPurge />} />
                <Route path="/config/certificados" element={<SefazCertificates />} />

                {/* 11. SEGURANÇA */}
                <Route path="/seguranca/usuarios" element={<UsersPage />} />
                <Route path="/seguranca/grupos" element={<UserGroups />} />

                {/* Redirecionamento Padrão */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </main>
          <ChatAssistant />
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;
