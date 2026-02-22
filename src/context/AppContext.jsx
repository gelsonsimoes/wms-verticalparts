import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
    // Global States
    const [companies, setCompanies] = useState(() => {
        const saved = localStorage.getItem('vparts_companies');
        return saved ? JSON.parse(saved) : [
            { id: 1, name: 'VerticalParts Matriz', cnpj: '12.345.678/0001-90', omieKey: 'XXXX-XXXX', status: 'Ativo' }
        ];
    });

    const [warehouses, setWarehouses] = useState(() => {
        const saved = localStorage.getItem('vparts_warehouses');
        return saved ? JSON.parse(saved) : [
            { id: 1, codigoInterno: 'CD01', nome: 'CD Principal MG', entidade: 'VerticalParts Matriz', ativo: true, addresses: 1240, occupation: 78 }
        ];
    });

    const [warehouseAreas, setWarehouseAreas] = useState(() => {
        const saved = localStorage.getItem('vparts_warehouse_areas');
        return saved ? JSON.parse(saved) : [
            { id: 1, name: 'RECEBIMENTO', endereco: 'R1_PP1_N001' },
            { id: 2, name: 'ESTRUTURA PORTA PALETES', endereco: 'R2_PP3_N002' },
            { id: 3, name: 'EXPEDIÇÃO', endereco: 'R3_PP1_N001' }
        ];
    });

    // === Warehouse Sub-entities ===
    const [warehouseDocks, setWarehouseDocks] = useState(() => {
        const saved = localStorage.getItem('vparts_wh_docks');
        return saved ? JSON.parse(saved) : [
            { id: 1, warehouseId: 1, codigo: 'DOCA-01', descricao: 'DOCA RECEBIMENTO PRINCIPAL', tipo: 'Recebimento', ativo: true },
            { id: 2, warehouseId: 1, codigo: 'DOCA-02', descricao: 'RUA EXPEDIÇÃO A', tipo: 'Expedição', ativo: true },
        ];
    });

    const [warehouseLocations, setWarehouseLocations] = useState(() => {
        const saved = localStorage.getItem('vparts_wh_locations');
        return saved ? JSON.parse(saved) : [
            { id: 1, warehouseId: 1, rua: 'R1', predio: 'P1', andar: 'A1', apto: '001', peso: 500, cubagem: 1.2, ativo: true },
            { id: 2, warehouseId: 1, rua: 'R1', predio: 'P1', andar: 'A2', apto: '001', peso: 500, cubagem: 1.2, ativo: true },
            { id: 3, warehouseId: 1, rua: 'R2', predio: 'P1', andar: 'A1', apto: '001', peso: 800, cubagem: 2.0, ativo: true },
        ];
    });

    const [warehouseColmeias, setWarehouseColmeias] = useState(() => {
        const saved = localStorage.getItem('vparts_wh_colmeias');
        return saved ? JSON.parse(saved) : [
            { id: 1, warehouseId: 1, codigo: 'COL-001', descricao: 'COLMEIA PEÇAS PEQUENAS', capacidade: 50, ativo: true },
        ];
    });

    const [warehouseBancadas, setWarehouseBancadas] = useState(() => {
        const saved = localStorage.getItem('vparts_wh_bancadas');
        return saved ? JSON.parse(saved) : [
            { id: 1, warehouseId: 1, codigo: 'BNC-01', descricao: 'BANCADA CONFERÊNCIA 1', ativo: true },
        ];
    });

    const [warehouseBuffers, setWarehouseBuffers] = useState(() => {
        const saved = localStorage.getItem('vparts_wh_buffers');
        return saved ? JSON.parse(saved) : [
            { id: 1, warehouseId: 1, codigo: 'BUF-01', descricao: 'BUFFER RECEBIMENTO', capacidade: 20, ativo: true },
        ];
    });

    const [warehouseServicos, setWarehouseServicos] = useState(() => {
        const saved = localStorage.getItem('vparts_wh_servicos');
        return saved ? JSON.parse(saved) : [
            { id: 1, warehouseId: 1, codigo: 'SRV-LIMP', descricao: 'LIMPEZA', ativo: true },
            { id: 2, warehouseId: 1, codigo: 'SRV-INSP', descricao: 'INSPEÇÃO', ativo: true },
            { id: 3, warehouseId: 1, codigo: 'SRV-MANUT', descricao: 'MANUTENÇÃO', ativo: false },
        ];
    });

    const [warehousePacking, setWarehousePacking] = useState(() => {
        const saved = localStorage.getItem('vparts_wh_packing');
        return saved ? JSON.parse(saved) : [
            { id: 1, warehouseId: 1, codigo: 'PCK-01', descricao: 'ESTAÇÃO PACKING 1', ativo: true },
        ];
    });

    const [sectors, setSectors] = useState(() => {
        const saved = localStorage.getItem('vparts_sectors');
        return saved ? JSON.parse(saved) : [
            { id: 1, setor: 'PEÇAS AUTOMOTIVAS', tipoSetor: 'Armazenagem', tipoLocal: 'Porta Palete', codigoIntegracao: 'INT-001', ativo: true, usoExclusivoCaixa: false, depositantes: [{ cnpj: '12.345.678/0001-90', razaoSocial: 'VerticalParts Matriz' }], enderecos: ['R1_PP1_N001'], produtos: ['VP-FR4429-X'], usuarios: ['joao.silva'] },
            { id: 2, setor: 'EXPEDIÇÃO RÁPIDA', tipoSetor: 'Expedição', tipoLocal: 'Colmeia', codigoIntegracao: 'INT-002', ativo: true, usoExclusivoCaixa: true, depositantes: [], enderecos: [], produtos: [], usuarios: [] },
            { id: 3, setor: 'MANUTENÇÃO', tipoSetor: 'Serviço', tipoLocal: 'Bancada', codigoIntegracao: 'INT-003', ativo: false, usoExclusivoCaixa: false, depositantes: [], enderecos: [], produtos: [], usuarios: [] },
        ];
    });

    const [userGroups, setUserGroups] = useState(() => {
        const saved = localStorage.getItem('vparts_user_groups');
        return saved ? JSON.parse(saved) : [
            { id: 1, grupo: 'ADMINISTRADORES', ativaExportacoes: true, permitirDownload: true, coletor: ['Recebimento', 'Separação', 'Inventário'], enterprise: ['Dashboard', 'Cadastros', 'Relatórios'], web: ['WMS Web Completo'], operacaoDeposito: ['Entrada', 'Saída', 'Transferência'], atividades: ['Separação da Onda', 'Conferência', 'Expedição'], usuarios: ['joao.silva', 'maria.santos'] },
            { id: 2, grupo: 'OPERADORES', ativaExportacoes: false, permitirDownload: false, coletor: ['Recebimento', 'Separação'], enterprise: ['Dashboard'], web: ['WMS Web Básico'], operacaoDeposito: ['Entrada'], atividades: ['Separação da Onda'], usuarios: ['carlos.lima'] },
            { id: 3, grupo: 'SUPERVISORES', ativaExportacoes: true, permitirDownload: true, coletor: ['Recebimento', 'Separação', 'Inventário', 'Expedição'], enterprise: ['Dashboard', 'Cadastros', 'Relatórios', 'Segurança'], web: ['WMS Web Completo'], operacaoDeposito: ['Entrada', 'Saída', 'Transferência', 'Ajuste'], atividades: ['Separação da Onda', 'Conferência', 'Expedição', 'Auditoria'], usuarios: [] },
        ];
    });

    const [users, setUsers] = useState(() => {
        const saved = localStorage.getItem('vparts_users');
        return saved ? JSON.parse(saved) : [
            { id: 1, usuario: 'danilo.supervisor', nomeUsuario: 'Danilo', nivel: 'Administrador', departamento: 'Logística', entidade: 'VerticalParts Matriz', grupos: ['ADMINISTRADORES'], depositantes: [{ cnpj: '12.345.678/0001-90', razaoSocial: 'VerticalParts Matriz' }] },
            { id: 2, usuario: 'matheus.expedicao', nomeUsuario: 'Matheus', nivel: 'Supervisor', departamento: 'Operações', entidade: 'VerticalParts Matriz', grupos: ['ADMINISTRADORES'], depositantes: [] },
            { id: 3, usuario: 'thiago.logistica', nomeUsuario: 'Thiago', nivel: 'Operador', departamento: 'Recebimento', entidade: 'VerticalParts Matriz', grupos: ['OPERADORES'], depositantes: [{ cnpj: '12.345.678/0001-90', razaoSocial: 'VerticalParts Matriz' }] },
        ];
    });

    const [serialDevices, setSerialDevices] = useState(() => {
        const saved = localStorage.getItem('vparts_serial_devices');
        return saved ? JSON.parse(saved) : [
            { id: 1, nome: 'BALANÇA RECEBIMENTO', tipo: 'balanca', marca: 'Toledo', tipoDisplay: 'Display 10', protocolo: 'Toledo P01', porta: 'COM1', bitsPorSegundo: 9600, bitsDados: 8, bitsParada: 1, paridade: 'NONE', rts: true, dtr: false },
            { id: 2, nome: 'SCANNER EXPEDIÇÃO', tipo: 'scanner', marca: 'Honeywell', tipoDisplay: '-', protocolo: 'RS232', porta: 'COM3', bitsPorSegundo: 115200, bitsDados: 8, bitsParada: 1, paridade: 'NONE', rts: false, dtr: false },
        ];
    });

    const [labels, setLabels] = useState(() => {
        const saved = localStorage.getItem('vparts_labels');
        return saved ? JSON.parse(saved) : [
            { id: 1, descricao: 'ETIQUETA EMBALAGEM PADRÃO', tipoEtiqueta: 'Embalagem', personalizada: false, ativo: true, sistema: true, arquivo: 'embalagem_padrao.jrxml' },
            { id: 2, descricao: 'ETIQUETA VOLUME EXPEDIÇÃO', tipoEtiqueta: 'Volume de Expedição', personalizada: false, ativo: true, sistema: true, arquivo: 'volume_expedicao.jrxml' },
            { id: 3, descricao: 'ETIQUETA MENSAGEM PRODUTO', tipoEtiqueta: 'Mensagem de Produto', personalizada: false, ativo: true, sistema: true, arquivo: 'mensagem_produto.jrxml' },
            { id: 4, descricao: 'ETIQUETA ENDEREÇO', tipoEtiqueta: 'Endereço', personalizada: false, ativo: true, sistema: true, arquivo: 'endereco.jrxml' },
            { id: 5, descricao: 'ETIQUETA RECEBIMENTO', tipoEtiqueta: 'Recebimento', personalizada: false, ativo: true, sistema: true, arquivo: 'recebimento.jrxml' },
            { id: 6, descricao: 'EMBALAGEM VERTICALPARTS CUSTOM', tipoEtiqueta: 'Embalagem', personalizada: true, ativo: true, sistema: false, arquivo: 'embalagem_vparts_custom.jrxml' },
        ];
    });

    const [transportSchedules, setTransportSchedules] = useState(() => {
        const saved = localStorage.getItem('vparts_transport_schedules');
        return saved ? JSON.parse(saved) : [
            { id: 1, tipo: 'Recebimento', depositante: 'VerticalParts Matriz', doca: 'DOCA 01', transportadora: 'Transvip Logística', motorista: 'Danilo (Supervisor)', veiculo: 'ABC-1234', dataInicio: '2026-02-22T08:00', dataFim: '2026-02-22T10:00', turno: 'Manhã', qtdVolume: 45, notasFiscais: 'NF-001234, NF-001235', status: 'agendado', historico: [{ status: 'agendado', data: '2026-02-21T15:30', usuario: 'danilo.supervisor' }] },
            { id: 2, tipo: 'Expedição', depositante: 'VerticalParts AutoPeças', doca: 'DOCA 03', transportadora: 'RodoExpress', motorista: 'Matheus (Expedição)', veiculo: 'DEF-5678', dataInicio: '2026-02-22T10:00', dataFim: '2026-02-22T12:00', turno: 'Manhã', qtdVolume: 120, notasFiscais: 'NF-005500', status: 'veiculo_recepcionado', historico: [{ status: 'agendado', data: '2026-02-20T10:00', usuario: 'danilo.supervisor' }, { status: 'veiculo_recepcionado', data: '2026-02-22T09:45', usuario: 'matheus.expedicao' }] },
            { id: 3, tipo: 'Recebimento', depositante: 'VerticalParts Distribuição', doca: 'DOCA 02', transportadora: 'Patrus Transportes', motorista: 'Thiago (Logística)', veiculo: 'GHI-9012', dataInicio: '2026-02-22T14:00', dataFim: '2026-02-22T16:00', turno: 'Tarde', qtdVolume: 80, notasFiscais: 'NF-007788, NF-007789, NF-007790', status: 'veiculo_patio', historico: [{ status: 'agendado', data: '2026-02-19T11:00', usuario: 'danilo.supervisor' }, { status: 'veiculo_recepcionado', data: '2026-02-22T13:30', usuario: 'matheus.expedicao' }, { status: 'veiculo_patio', data: '2026-02-22T13:45', usuario: 'thiago.logistica' }] },
            { id: 4, tipo: 'Expedição', depositante: 'VerticalParts Oficina', doca: 'DOCA 01', transportadora: 'Jadlog', motorista: 'Danilo (Supervisor)', veiculo: 'JKL-3456', dataInicio: '2026-02-23T08:00', dataFim: '2026-02-23T10:00', turno: 'Manhã', qtdVolume: 30, notasFiscais: 'NF-009900', status: 'agendado', historico: [{ status: 'agendado', data: '2026-02-21T16:00', usuario: 'danilo.supervisor' }] },
        ];
    });

    const [orders, setOrders] = useState([
        { 
            id: 'SO-8842', 
            client: 'VerticalParts Distribuição', 
            status: 'Pendente', 
            items: 3, 
            totalQty: 12,
            value: 'R$ 4.500,00', 
            date: '21/02/2026',
            orderItems: [
                { id: 1, sku: 'VEPEL-BPI-174FX', desc: 'Barreira de Proteção Infravermelha (174 Feixes)', ean: '789123456001', expected: 5, collected: 0, location: 'RUA-12-A1' },
                { id: 2, sku: 'VPER-ESS-NY-27MM', desc: 'Escova de Segurança (Nylon - Base 27mm)', ean: '7891149108718', expected: 2, collected: 0, location: 'RUA-12-A2' },
                { id: 3, sku: 'VPER-PAL-INO-1000', desc: 'Pallet de Aço Inox (1000mm)', ean: '789123456003', expected: 5, collected: 0, location: 'RUA-05-B1' },
            ]
        },
        { 
            id: 'SO-8845', 
            client: 'VerticalParts AutoPeças', 
            status: 'Em Separação', 
            items: 2, 
            totalQty: 4,
            value: 'R$ 1.200,00', 
            date: '21/02/2026',
            orderItems: [
                { id: 1, sku: 'VP-FL1', desc: 'Filtro de Óleo VP-FL1', ean: '7890000000001', expected: 2, collected: 1, location: 'RUA-01-C3' },
                { id: 2, sku: 'VP-AIR-02', desc: 'Filtro de Ar Esportivo', ean: '7890000000002', expected: 2, collected: 0, location: 'RUA-01-C4' },
            ]
        },
        { 
            id: 'SO-8849', 
            client: 'VerticalParts Oficina', 
            status: 'Concluído', 
            items: 1, 
            totalQty: 22,
            value: 'R$ 15.800,00', 
            date: '20/02/2026',
            orderItems: [
                { id: 1, sku: 'VP-WPR-99', desc: 'Palheta Limpador Silicone 24"', ean: '7890000000003', expected: 22, collected: 22, location: 'RUA-02-D1' },
            ]
        },
    ]);

    const [inventory, setInventory] = useState(() => {
        const saved = localStorage.getItem('vparts_inventory');
        return saved ? JSON.parse(saved) : [
            { id: 1, part: 'Pastilha de Freio Cerâmica', sku: 'VP-FR4429-X', systemStock: 1540, countedStock: 1538, divergence: -2, status: 'Pendente', localizacao: 'RUA-12-04' },
            { id: 2, part: 'Disco de Freio Ventilado', sku: 'VP-DF882-M', systemStock: 450, countedStock: 450, divergence: 0, status: 'Validado', localizacao: 'RUA-12-04' },
        ];
    });

    const [receiptHistory, setReceiptHistory] = useState(() => {
        const saved = localStorage.getItem('vparts_receipt_history');
        return saved ? JSON.parse(saved) : [];
    });

    // Persist important data
    useEffect(() => { localStorage.setItem('vparts_companies', JSON.stringify(companies)); }, [companies]);
    useEffect(() => { localStorage.setItem('vparts_warehouses', JSON.stringify(warehouses)); }, [warehouses]);
    useEffect(() => { localStorage.setItem('vparts_warehouse_areas', JSON.stringify(warehouseAreas)); }, [warehouseAreas]);
    useEffect(() => { localStorage.setItem('vparts_inventory', JSON.stringify(inventory)); }, [inventory]);
    useEffect(() => { localStorage.setItem('vparts_receipt_history', JSON.stringify(receiptHistory)); }, [receiptHistory]);
    useEffect(() => { localStorage.setItem('vparts_wh_docks', JSON.stringify(warehouseDocks)); }, [warehouseDocks]);
    useEffect(() => { localStorage.setItem('vparts_wh_locations', JSON.stringify(warehouseLocations)); }, [warehouseLocations]);
    useEffect(() => { localStorage.setItem('vparts_wh_colmeias', JSON.stringify(warehouseColmeias)); }, [warehouseColmeias]);
    useEffect(() => { localStorage.setItem('vparts_wh_bancadas', JSON.stringify(warehouseBancadas)); }, [warehouseBancadas]);
    useEffect(() => { localStorage.setItem('vparts_wh_buffers', JSON.stringify(warehouseBuffers)); }, [warehouseBuffers]);
    useEffect(() => { localStorage.setItem('vparts_wh_servicos', JSON.stringify(warehouseServicos)); }, [warehouseServicos]);
    useEffect(() => { localStorage.setItem('vparts_wh_packing', JSON.stringify(warehousePacking)); }, [warehousePacking]);
    useEffect(() => { localStorage.setItem('vparts_sectors', JSON.stringify(sectors)); }, [sectors]);
    useEffect(() => { localStorage.setItem('vparts_user_groups', JSON.stringify(userGroups)); }, [userGroups]);
    useEffect(() => { localStorage.setItem('vparts_users', JSON.stringify(users)); }, [users]);
    useEffect(() => { localStorage.setItem('vparts_serial_devices', JSON.stringify(serialDevices)); }, [serialDevices]);
    useEffect(() => { localStorage.setItem('vparts_labels', JSON.stringify(labels)); }, [labels]);
    useEffect(() => { localStorage.setItem('vparts_transport_schedules', JSON.stringify(transportSchedules)); }, [transportSchedules]);

    // === CRUD Helpers ===
    const nextId = (arr) => arr.length > 0 ? Math.max(...arr.map(a => a.id)) + 1 : 1;

    const addCompany = (company) => setCompanies([...companies, { ...company, id: Date.now() }]);
    const addWarehouse = (wh) => setWarehouses(prev => [...prev, { ...wh, id: nextId(prev) }]);
    const updateWarehouse = (id, data) => setWarehouses(prev => prev.map(w => w.id === id ? { ...w, ...data } : w));
    const deleteWarehouse = (id) => setWarehouses(prev => prev.filter(w => w.id !== id));

    const addWarehouseArea = (area) => setWarehouseAreas([...warehouseAreas, { ...area, id: warehouseAreas.length > 0 ? Math.max(...warehouseAreas.map(a => a.id)) + 1 : 1 }]);
    const updateWarehouseArea = (id, updatedArea) => setWarehouseAreas(warehouseAreas.map(a => a.id === id ? { ...a, ...updatedArea } : a));
    const deleteWarehouseArea = (id) => setWarehouseAreas(warehouseAreas.filter(a => a.id !== id));

    // Generic sub-entity CRUD factory
    const makeSubCrud = (setter) => ({
        add: (item) => setter(prev => [...prev, { ...item, id: nextId(prev) }]),
        update: (id, data) => setter(prev => prev.map(i => i.id === id ? { ...i, ...data } : i)),
        remove: (id) => setter(prev => prev.filter(i => i.id !== id)),
        bulkUpdate: (ids, data) => setter(prev => prev.map(i => ids.includes(i.id) ? { ...i, ...data } : i)),
    });

    const docksCrud = makeSubCrud(setWarehouseDocks);
    const locationsCrud = makeSubCrud(setWarehouseLocations);
    const colmeiasCrud = makeSubCrud(setWarehouseColmeias);
    const bancadasCrud = makeSubCrud(setWarehouseBancadas);
    const buffersCrud = makeSubCrud(setWarehouseBuffers);
    const servicosCrud = makeSubCrud(setWarehouseServicos);
    const packingCrud = makeSubCrud(setWarehousePacking);
    const sectorsCrud = makeSubCrud(setSectors);
    const userGroupsCrud = makeSubCrud(setUserGroups);
    const usersCrud = makeSubCrud(setUsers);
    const serialDevicesCrud = makeSubCrud(setSerialDevices);
    const labelsCrud = makeSubCrud(setLabels);
    const transportSchedulesCrud = makeSubCrud(setTransportSchedules);

    // Location generator for "Gerar Locais"
    const generateLocations = (warehouseId, config) => {
        const { ruaInicio, ruaFim, predioInicio, predioFim, andarInicio, andarFim, aptoInicio, aptoFim, peso, cubagem } = config;
        const newLocations = [];
        for (let r = ruaInicio; r <= ruaFim; r++) {
            for (let p = predioInicio; p <= predioFim; p++) {
                for (let a = andarInicio; a <= andarFim; a++) {
                    for (let ap = aptoInicio; ap <= aptoFim; ap++) {
                        newLocations.push({
                            warehouseId,
                            rua: `R${r}`,
                            predio: `P${p}`,
                            andar: `A${a}`,
                            apto: String(ap).padStart(3, '0'),
                            peso: peso || 500,
                            cubagem: cubagem || 1.0,
                            ativo: true,
                        });
                    }
                }
            }
        }
        setWarehouseLocations(prev => {
            let id = nextId(prev);
            return [...prev, ...newLocations.map(loc => ({ ...loc, id: id++ }))];
        });
        return newLocations.length;
    };

    const addToInventory = (items) => {
        setInventory(prev => [...prev, ...items.map(item => ({
            ...item,
            id: Date.now() + Math.random(),
            systemStock: item.quantidade_recebida,
            countedStock: item.quantidade_recebida,
            divergence: 0,
            status: 'Validado',
            part: item.descricao
        }))]);
    };

    const addReceiptLog = (log) => {
        setReceiptHistory(prev => [log, ...prev]);
    };

    const updateOrderStatus = (orderId, status) => {
        setOrders(orders.map(o => o.id === orderId ? { ...o, status } : o));
    };

    return (
        <AppContext.Provider value={{
            companies, addCompany,
            warehouses, addWarehouse, updateWarehouse, deleteWarehouse,
            warehouseAreas, addWarehouseArea, updateWarehouseArea, deleteWarehouseArea,
            orders, updateOrderStatus,
            inventory, setInventory, addToInventory,
            receiptHistory, addReceiptLog,
            // Sub-entities
            warehouseDocks, docksCrud,
            warehouseLocations, locationsCrud, generateLocations,
            warehouseColmeias, colmeiasCrud,
            warehouseBancadas, bancadasCrud,
            warehouseBuffers, buffersCrud,
            warehouseServicos, servicosCrud,
            warehousePacking, packingCrud,
            sectors, sectorsCrud,
            userGroups, userGroupsCrud,
            users, usersCrud,
            serialDevices, serialDevicesCrud,
            labels, labelsCrud,
            transportSchedules, transportSchedulesCrud,
        }}>
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    return useContext(AppContext);
}
