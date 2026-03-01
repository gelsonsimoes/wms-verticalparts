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

// Boilerplate Component for Non-Refactored Pages
import EnterprisePageBase from './components/layout/EnterprisePageBase';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <AppProvider>
      <Router>
        <div className="flex min-h-screen bg-white text-[var(--vp-text-data)] font-sans">
          <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

          <main className={`flex-1 flex flex-col ${isSidebarOpen ? 'lg:ml-72' : 'lg:ml-20'} min-w-0 transition-all duration-300`}>
            <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

            <div className="flex-1 overflow-x-hidden bg-white">
              <Routes>
                {/* 1. PRINCIPAL */}
                <Route path="/" element={<Dashboard />} />

                {/* 2. OPERAR */}
                <Route path="/operacao/cruzar-docas" element={<EnterprisePageBase title="1.1 Cruzar Docas" breadcrumbItems={[{label: 'Operar'}]} />} />
                <Route path="/operacao/processar-devolucoes" element={<EnterprisePageBase title="1.2 Processar Devoluções" breadcrumbItems={[{label: 'Operar'}]} />} />
                <Route path="/operacao/pesar-cargas" element={<EnterprisePageBase title="1.3 Pesar Cargas" breadcrumbItems={[{label: 'Operar'}]} />} />
                <Route path="/operacao/gerenciar-recebimento" element={<EnterprisePageBase title="1.4 Gerenciar Recebimento" breadcrumbItems={[{label: 'Operar'}]} />} />
                <Route path="/operacao/conferir-recebimento" element={<EnterprisePageBase title="1.5 Conferir Recebimento" breadcrumbItems={[{label: 'Operar'}]} />} />
                <Route path="/operacao/gerar-mapa" element={<EnterprisePageBase title="1.6 Gerar Mapa de Alocação" breadcrumbItems={[{label: 'Operar'}]} />} />
                <Route path="/operacao/conferencia-cega" element={<EnterprisePageBase title="1.7 Realizar Conferência Cega" breadcrumbItems={[{label: 'Operar'}]} />} />
                <Route path="/operacao/alocar-estoque" element={<EnterprisePageBase title="1.8 Alocar Estoque" breadcrumbItems={[{label: 'Operar'}]} />} />
                <Route path="/operacao/kanban-alocacao" element={<AllocationKanban />} />
                <Route path="/operacao/separar-pedidos" element={<EnterprisePageBase title="1.10 Separar Pedidos" breadcrumbItems={[{label: 'Operar'}]} />} />
                <Route path="/operacao/embalar-pedidos" element={<EnterprisePageBase title="1.11 Embalar Pedidos" breadcrumbItems={[{label: 'Operar'}]} />} />
                <Route path="/operacao/monitorar-saida" element={<EnterprisePageBase title="1.12 Monitorar Saída" breadcrumbItems={[{label: 'Operar'}]} />} />
                <Route path="/operacao/recebimento" element={<EnterprisePageBase title="1.13 Recebimento (Check-in)" breadcrumbItems={[{label: 'Operar'}]} />} />
                <Route path="/operacao/estacao-kits" element={<EnterprisePageBase title="1.14 Estação de Kits" breadcrumbItems={[{label: 'Operar'}]} />} />
                <Route path="/operacao/conferencia-colmeia" element={<EnterprisePageBase title="1.15 Conferência Colmeia" breadcrumbItems={[{label: 'Operar'}]} />} />
                <Route path="/operacao/ordem-servico" element={<ServiceOrder />} />
                <Route path="/operacao/gestao-seguros" element={<EnterprisePageBase title="1.17 Gestão de Seguros" breadcrumbItems={[{label: 'Operar'}]} />} />
                <Route path="/operacao/pesagem-rodoviaria" element={<EnterprisePageBase title="1.18 Pesagem Rodoviária" breadcrumbItems={[{label: 'Operar'}]} />} />
                <Route path="/operacao/gerenciamento-pedidos" element={<OrderManagement />} />

                {/* 3. PLANEJAR */}
                <Route path="/planejamento/gerar-ondas" element={<EnterprisePageBase title="2.1 Gerar Ondas de Separação" breadcrumbItems={[{label: 'Planejar'}]} />} />
                <Route path="/planejamento/monitorar-prazos" element={<EnterprisePageBase title="2.2 Monitorar Prazos (SLA)" breadcrumbItems={[{label: 'Planejar'}]} />} />
                <Route path="/planejamento/agendar-transportes" element={<EnterprisePageBase title="2.3 Agendar Transportes" breadcrumbItems={[{label: 'Planejar'}]} />} />
                <Route path="/planejamento/monitorar-atividades" element={<EnterprisePageBase title="2.4 Monitorar Atividades" breadcrumbItems={[{label: 'Planejar'}]} />} />
                <Route path="/planejamento/gerenciar-manifestos" element={<EnterprisePageBase title="2.5 Gerenciar Manifestos" breadcrumbItems={[{label: 'Planejar'}]} />} />
                <Route path="/planejamento/expedir-cargas" element={<LoadDetails />} />
                <Route path="/planejamento/gerenciar-portaria" element={<GateManager />} />
                <Route path="/planejamento/atividades-docas" element={<EnterprisePageBase title="2.8 Atividades de Docas" breadcrumbItems={[{label: 'Planejar'}]} />} />

                {/* 4. CONTROLAR */}
                <Route path="/estoque/auditar-inventario" element={<EnterprisePageBase title="3.1 Auditar Inventário" breadcrumbItems={[{label: 'Controlar'}]} />} />
                <Route path="/estoque/consultar-kardex" element={<EnterprisePageBase title="3.2 Consultar Kardex" breadcrumbItems={[{label: 'Controlar'}]} />} />
                <Route path="/estoque/analisar-estoque" element={<InventoryManagement />} />
                <Route path="/estoque/remanejar" element={<EnterprisePageBase title="3.4 Remanejar Produtos" breadcrumbItems={[{label: 'Controlar'}]} />} />
                <Route path="/estoque/controlar-lotes" element={<EnterprisePageBase title="3.5 Controlar Lotes e Validade" breadcrumbItems={[{label: 'Controlar'}]} />} />
                <Route path="/estoque/monitorar-avarias" element={<EnterprisePageBase title="3.6 Monitorar Avarias" breadcrumbItems={[{label: 'Controlar'}]} />} />
                <Route path="/estoque/gestao-inventario" element={<EnterprisePageBase title="3.7 Gestão de Inventário" breadcrumbItems={[{label: 'Controlar'}]} />} />

                {/* 5. FISCAL */}
                <Route path="/fiscal/gerenciar-nfe" element={<NFeControl />} />
                <Route path="/fiscal/gerenciar-cte" element={<EnterprisePageBase title="4.2 Gerenciar CT-e" breadcrumbItems={[{label: 'Fiscal'}]} />} />
                <Route path="/fiscal/emitir-cobertura" element={<EnterprisePageBase title="4.3 Emitir Cobertura Fiscal" breadcrumbItems={[{label: 'Fiscal'}]} />} />
                <Route path="/fiscal/armazem-geral" element={<EnterprisePageBase title="4.4 Controlar Armazém Geral" breadcrumbItems={[{label: 'Fiscal'}]} />} />

                {/* 6. FINANCEIRO */}
                <Route path="/financeiro/calcular-diarias" element={<BillingReports />} />
                <Route path="/financeiro/contratos" element={<EnterprisePageBase title="5.2 Gerenciar Contratos" breadcrumbItems={[{label: 'Financeiro'}]} />} />

                {/* 7. CADASTRAR */}
                <Route path="/cadastros/empresas" element={<Companies />} />
                <Route path="/cadastros/armazens" element={<Warehouses />} />
                <Route path="/cadastros/enderecos" element={<EnterprisePageBase title="6.3 Cadastrar Endereços" breadcrumbItems={[{label: 'Cadastrar'}]} />} />
                <Route path="/cadastros/produtos" element={<EnterprisePageBase title="6.4 Catálogo de Produtos" breadcrumbItems={[{label: 'Cadastrar'}]} />} />
                <Route path="/cadastros/rotas-veiculos" element={<EnterprisePageBase title="6.5 Cadastrar Rotas e Veículos" breadcrumbItems={[{label: 'Cadastrar'}]} />} />
                <Route path="/cadastros/areas" element={<EnterprisePageBase title="6.6 Configurar Áreas" breadcrumbItems={[{label: 'Cadastrar'}]} />} />
                <Route path="/cadastros/setores" element={<EnterprisePageBase title="6.7 Configurar Setores" breadcrumbItems={[{label: 'Cadastrar'}]} />} />
                <Route path="/config/etiquetas" element={<EnterprisePageBase title="6.8 Gerenciar Etiquetas" breadcrumbItems={[{label: 'Cadastrar'}]} />} />

                {/* 8. INDICADORES */}
                <Route path="/indicadores/financeiro" element={<FinancialDashboard />} />
                <Route path="/indicadores/ocupacao" element={<EnterprisePageBase title="7.2 Analisar Ocupação" breadcrumbItems={[{label: 'Indicadores'}]} />} />
                <Route path="/indicadores/produtividade" element={<EnterprisePageBase title="7.3 Medir Produtividade" breadcrumbItems={[{label: 'Indicadores'}]} />} />
                <Route path="/indicadores/auditoria" element={<EnterprisePageBase title="7.4 Auditar Logs do Sistema" breadcrumbItems={[{label: 'Indicadores'}]} />} />
                <Route path="/indicadores/integracao" element={<EnterprisePageBase title="7.5 Resultados de Integração" breadcrumbItems={[{label: 'Indicadores'}]} />} />

                {/* 9. INTEGRAR */}
                <Route path="/integrar/alertas" element={<IntegrationAlerts />} />
                <Route path="/integrar/ordens-erp" element={<ERPOrderIntegration />} />
                <Route path="/integrar/omie" element={<EnterprisePageBase title="8.3 Conectar Omie ERP" breadcrumbItems={[{label: 'Integrar'}]} />} />
                <Route path="/integrar/arquivos" element={<EnterprisePageBase title="8.4 Mapear Arquivos (Layouts)" breadcrumbItems={[{label: 'Integrar'}]} />} />
                <Route path="/integrar/apis" element={<EnterprisePageBase title="8.5 Configurar APIs REST" breadcrumbItems={[{label: 'Integrar'}]} />} />
                <Route path="/integrar/ondas" element={<EnterprisePageBase title="8.6 Integrar Ondas (Arquivo)" breadcrumbItems={[{label: 'Integrar'}]} />} />

                {/* 10. CONFIGURAR */}
                <Route path="/config/geral" element={<EnterprisePageBase title="9.1 Ajustar Configurações" breadcrumbItems={[{label: 'Configurar'}]} />} />
                <Route path="/config/balancas" element={<EnterprisePageBase title="9.2 Integrar Balanças (Serial)" breadcrumbItems={[{label: 'Configurar'}]} />} />
                <Route path="/config/service-desk" element={<ServiceDesk />} />
                <Route path="/config/expurgo" element={<EnterprisePageBase title="9.4 Expurgar Dados Antigos" breadcrumbItems={[{label: 'Configurar'}]} />} />
                <Route path="/config/certificados" element={<EnterprisePageBase title="9.5 Gerenciar Certificados" breadcrumbItems={[{label: 'Configurar'}]} />} />

                {/* 11. SEGURANÇA */}
                <Route path="/seguranca/usuarios" element={<UsersPage />} />
                <Route path="/seguranca/grupos" element={<EnterprisePageBase title="10.2 Definir Grupos de Acesso" breadcrumbItems={[{label: 'Segurança'}]} />} />

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
