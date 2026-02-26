import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Dashboard from './pages/Dashboard';
import AddressManagement from './pages/AddressManagement';
import LoadCheck from './pages/LoadCheck';
import Companies from './pages/Companies';
import Warehouses from './pages/Warehouses';
import PickingManagement from './pages/PickingManagement';
import PackingStation from './pages/PackingStation';
import InventoryAudit from './pages/InventoryAudit';
import OmieIntegration from './pages/OmieIntegration';
import ReceivingCheckIn from './pages/ReceivingCheckIn';
import WarehouseAreas from './pages/WarehouseAreas';
import Sectors from './pages/Sectors';
import UserGroups from './pages/UserGroups';
import UsersPage from './pages/UsersPage';
import SerialDevices from './pages/SerialDevices';
import LabelManager from './pages/LabelManager';
import HoneycombCheck from './pages/HoneycombCheck';
import TransportSchedule from './pages/TransportSchedule';
import OutboundMonitoring from './pages/OutboundMonitoring';
import AuditLogs from './pages/AuditLogs';
import FileIntegration from './pages/FileIntegration';
import RestConfig from './pages/RestConfig';
import IntegrationResults from './pages/IntegrationResults';
import ContractManager from './pages/ContractManager';
import BillingReports from './pages/BillingReports';
import InventoryManagement from './pages/InventoryManagement';
import WavePickingWizard from './pages/WavePickingWizard';
import WaveSLADashboard from './pages/WaveSLADashboard';
import ReceivingManager from './pages/ReceivingManager';
import WeighingStation from './pages/WeighingStation'; // Novo
import CrossDockingMonitoring from './pages/CrossDockingMonitoring'; // Novo
import GeneralSettings from './pages/GeneralSettings'; // Novo
import DamageControl from './pages/DamageControl'; // Novo
import KitStation from './pages/KitStation'; // Novo
import GateManager from './pages/GateManager'; // Novo
import RoadWeighingStation from './pages/RoadWeighingStation'; // Novo
import ManifestManager from './pages/ManifestManager'; // Novo
import NFeControl from './pages/NFeControl'; // Novo
import GeneralWarehouseFiscal from './pages/GeneralWarehouseFiscal'; // Novo
import CTeControl from './pages/CTeControl'; // Novo
import StockReplenishment from './pages/StockReplenishment'; // Novo
import LotManager from './pages/LotManager'; // Novo
import ActivityManager from './pages/ActivityManager'; // Novo
import KardexReport from './pages/KardexReport'; // Novo
import OperatorPerformance from './pages/OperatorPerformance'; // Novo
import StockAnalysis from './pages/StockAnalysis'; // Novo
import DataPurge from './pages/DataPurge'; // Novo
import SefazCertificates from './pages/SefazCertificates'; // Novo
import ServiceDesk from './pages/ServiceDesk'; // Novo
import ProductCatalog from './pages/ProductCatalog'; // Novo
import RoutesVehicles from './pages/RoutesVehicles'; // Novo
import AllocationMap from './pages/AllocationMap'; // Novo
import BlindCheck from './pages/BlindCheck'; // Novo
import ReturnDelivery from './pages/ReturnDelivery'; // Novo
import IntegrationWaves from './pages/IntegrationWaves'; // Novo
import FiscalCoverage from './pages/FiscalCoverage'; // Novo
import DockActivities from './pages/DockActivities'; // Novo
import ServiceOrder from './pages/ServiceOrder'; // Novo
import InsuranceManagement from './pages/InsuranceManagement'; // Novo
import IntegrationAlerts from './pages/IntegrationAlerts'; // Novo
import ERPOrderIntegration from './pages/ERPOrderIntegration'; // Novo
import ConferirRecebimento from './pages/ConferirRecebimento';
import StockAllocation from './pages/StockAllocation';
import AllocationKanban from './pages/AllocationKanban';
import { AppProvider } from './context/AppContext';

import ChatAssistant from './components/chat/ChatAssistant';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <AppProvider>
      <Router>
        <div className="flex min-h-screen bg-slate-50 dark:bg-background-dark text-slate-900 dark:text-white font-sans selection:bg-primary/30">
          <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

          <main className="flex-1 flex flex-col lg:ml-72 min-w-0">
            <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

            <div className="flex-1 p-4 md:p-8 overflow-x-hidden">
              <Routes>
                <Route path="/operacao/kanban-alocacao" element={<AllocationKanban />} />
                <Route path="/" element={<Dashboard />} />
                <Route path="/cadastros/empresas" element={<Companies />} />
                <Route path="/cadastros/armazens" element={<Warehouses />} />
                <Route path="/cadastros/enderecos" element={<AddressManagement />} />
                <Route path="/operacao/separar-pedidos" element={<PickingManagement />} />
                <Route path="/operacao/embalar-pedidos" element={<PackingStation />} />
                <Route path="/planejamento/expedir-cargas" element={<LoadCheck />} />
                <Route path="/operacao/recebimento" element={<ReceivingCheckIn />} />
                <Route path="/estoque/auditar-inventario" element={<InventoryAudit />} />
                <Route path="/cadastros/areas" element={<WarehouseAreas />} />
                <Route path="/cadastros/setores" element={<Sectors />} />
                <Route path="/seguranca/grupos" element={<UserGroups />} />
                <Route path="/seguranca/usuarios" element={<UsersPage />} />
                <Route path="/config/balancas" element={<SerialDevices />} />
                <Route path="/config/etiquetas" element={<LabelManager />} />
                <Route path="/operacao/conferencia-colmeia" element={<HoneycombCheck />} />
                <Route path="/planejamento/agendar-transportes" element={<TransportSchedule />} />
                <Route path="/operacao/monitorar-saida" element={<OutboundMonitoring />} />
                <Route path="/indicadores/auditoria" element={<AuditLogs />} />
                <Route path="/integrar/arquivos" element={<FileIntegration />} />
                <Route path="/integrar/apis" element={<RestConfig />} />
                <Route path="/indicadores/integracao" element={<IntegrationResults />} />
                <Route path="/financeiro/contratos" element={<ContractManager />} />
                <Route path="/faturamento/embalagem" element={<BillingReports />} />
                <Route path="/faturamento/palete" element={<BillingReports />} />
                <Route path="/faturamento/peso" element={<BillingReports />} />
                <Route path="/faturamento/endereco" element={<BillingReports />} />
                <Route path="/financeiro/calcular-diarias" element={<BillingReports />} />
                <Route path="/estoque/gestao-inventario" element={<InventoryManagement />} />
                <Route path="/planejamento/gerar-ondas" element={<WavePickingWizard />} />
                <Route path="/planejamento/monitorar-prazos" element={<WaveSLADashboard />} />
                <Route path="/operacao/gerenciar-recebimento" element={<ReceivingManager />} />
                <Route path="/operacao/conferir-recebimento" element={<ConferirRecebimento />} />
                <Route path="/operacao/pesar-cargas" element={<WeighingStation />} />
                <Route path="/operacao/cruzar-docas" element={<CrossDockingMonitoring />} />
                <Route path="/config/geral" element={<GeneralSettings />} />
                <Route path="/estoque/monitorar-avarias" element={<DamageControl />} />
                <Route path="/operacao/estacao-kits" element={<KitStation />} />
                <Route path="/planejamento/gerenciar-portaria" element={<GateManager />} />
                <Route path="/operacao/pesagem-rodoviaria" element={<RoadWeighingStation />} />
                <Route path="/planejamento/gerenciar-manifestos" element={<ManifestManager />} />
                <Route path="/fiscal/gerenciar-nfe" element={<NFeControl />} />
                <Route path="/fiscal/armazem-geral" element={<GeneralWarehouseFiscal />} />
                <Route path="/fiscal/gerenciar-cte" element={<CTeControl />} />
                <Route path="/estoque/remanejar" element={<StockReplenishment />} />
                <Route path="/estoque/controlar-lotes" element={<LotManager />} />
                <Route path="/planejamento/monitorar-atividades" element={<ActivityManager />} />
                <Route path="/estoque/consultar-kardex" element={<KardexReport />} />
                <Route path="/indicadores/produtividade" element={<OperatorPerformance />} />
                <Route path="/indicadores/ocupacao" element={<StockAnalysis initialTab={0} />} />
                <Route path="/estoque/analisar-estoque" element={<StockAnalysis initialTab={1} />} />
                <Route path="/config/expurgo" element={<DataPurge />} />
                <Route path="/config/certificados" element={<SefazCertificates />} />
                <Route path="/config/service-desk" element={<ServiceDesk />} />
                <Route path="/operacao/alocar-estoque" element={<StockAllocation />} />
                <Route path="/cadastros/produtos" element={<ProductCatalog />} />
                <Route path="/cadastros/rotas-veiculos" element={<RoutesVehicles />} />
                <Route path="/operacao/gerar-mapa" element={<AllocationMap />} />
                <Route path="/operacao/conferencia-cega" element={<BlindCheck />} />
                <Route path="/operacao/processar-devolucoes" element={<ReturnDelivery />} />
                <Route path="/integrar/ondas" element={<IntegrationWaves />} />
                <Route path="/fiscal/emitir-cobertura" element={<FiscalCoverage />} />
                <Route path="/planejamento/atividades-docas" element={<DockActivities />} />
                <Route path="/operacao/ordem-servico" element={<ServiceOrder />} />
                <Route path="/operacao/gestao-seguros" element={<InsuranceManagement />} />
                <Route path="/integrar/alertas" element={<IntegrationAlerts />} />
                <Route path="/integrar/ordens-erp" element={<ERPOrderIntegration />} />
                <Route path="/integrar/omie" element={<OmieIntegration />} />
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
