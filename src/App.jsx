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
import { AppProvider } from './context/AppContext';

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
                <Route path="/" element={<Dashboard />} />
                <Route path="/companies" element={<Companies />} />
                <Route path="/warehouses" element={<Warehouses />} />
                <Route path="/addresses" element={<AddressManagement />} />
                <Route path="/picking" element={<PickingManagement />} />
                <Route path="/packing" element={<PackingStation />} />
                <Route path="/shipping" element={<LoadCheck />} />
                <Route path="/receiving" element={<ReceivingCheckIn />} />
                <Route path="/inventory" element={<InventoryAudit />} />
                <Route path="/areas" element={<WarehouseAreas />} />
                <Route path="/sectors" element={<Sectors />} />
                <Route path="/user-groups" element={<UserGroups />} />
                <Route path="/users" element={<UsersPage />} />
                <Route path="/serial-devices" element={<SerialDevices />} />
                <Route path="/labels" element={<LabelManager />} />
                <Route path="/honeycomb-check" element={<HoneycombCheck />} />
                <Route path="/transport-schedule" element={<TransportSchedule />} />
                <Route path="/outbound-monitoring" element={<OutboundMonitoring />} />
                <Route path="/audit-logs" element={<AuditLogs />} />
                <Route path="/file-integration" element={<FileIntegration />} />
                <Route path="/rest-config" element={<RestConfig />} />
                <Route path="/integration-results" element={<IntegrationResults />} />
                <Route path="/contracts" element={<ContractManager />} />
                
                {/* Rotas de Billing */}
                <Route path="/billing/packaging" element={<BillingReports />} />
                <Route path="/billing/pallet" element={<BillingReports />} />
                <Route path="/billing/weight" element={<BillingReports />} />
                <Route path="/billing/address" element={<BillingReports />} />
                <Route path="/billing/query" element={<BillingReports />} />
                <Route path="/inventory-management" element={<InventoryManagement />} />
                <Route path="/wave-picking" element={<WavePickingWizard />} />
                <Route path="/wave-monitoring" element={<WaveSLADashboard />} />
                <Route path="/receiving-manager" element={<ReceivingManager />} />
                <Route path="/weighing-station" element={<WeighingStation />} />
                <Route path="/cross-docking" element={<CrossDockingMonitoring />} />
                <Route path="/settings" element={<GeneralSettings />} />
                <Route path="/damage-control" element={<DamageControl />} />
                <Route path="/kit-station" element={<KitStation />} />
                <Route path="/gate-manager" element={<GateManager />} />
                <Route path="/road-weighing" element={<RoadWeighingStation />} />
                <Route path="/manifest-manager" element={<ManifestManager />} />
                <Route path="/omie" element={<OmieIntegration />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </main>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;
