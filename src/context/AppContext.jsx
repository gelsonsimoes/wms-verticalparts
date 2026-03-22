import React, { createContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { logActivity } from '../services/activityLogger';

// eslint-disable-next-line react-refresh/only-export-components
export const AppContext = createContext();

export function AppProvider({ children, session }) {
    // Global States
    const RUAS = ['R1', 'R2', 'R3'];
    const PP_POR_RUA = { R1: ['PP1','PP2'], R2: ['PP3','PP4'], R3: ['PP5'] };
    const NIVEIS = ['A','B','C','D'];
    const POSICOES = Array.from({length: 20}, (_, i) => i + 1);

    const LOCATIONS = [];
    RUAS.forEach(rua => {
    PP_POR_RUA[rua].forEach(pp => {
        NIVEIS.forEach(nivel => {
        POSICOES.forEach(pos => {
            LOCATIONS.push({
            id: `${rua}_${pp}_${nivel}${pos}`,
            rua,
            portaPalete: pp,
            nivel,
            posicao: pos,
            label: `${rua}_${pp}_${nivel}${pos}`,
            tipo: nivel === 'A' ? 'Piso' : nivel === 'D' ? 'Topo' : 'Intermediário',
            status: 'Disponível',
            capacidade: 1,
            });
        });
        });
    });
    });

    const [isTvMode, setIsTvMode] = useState(false);
    // currentUser derivado da session Supabase (App.jsx) — fallback para dev sem auth
    const [currentUser, setCurrentUser] = useState(() => session ? {
        id:                 session.id,
        usuario:            session.login,
        nome:               session.nome,
        role:               session.role,
        email:              session.email,
        paginas_permitidas: session.paginas_permitidas ?? null, // null = acesso total
    } : {
        usuario: 'danilo.supervisor',
        nome: 'Danilo',
        role: 'gestor',
        paginas_permitidas: null,
    });

    const [companies, setCompanies] = useState([]);
    useEffect(() => {
        supabase.from('companies').select('*').order('name')
            .then(({ data }) => { if (data) setCompanies(data); });
    }, []);

    // Normaliza colunas DB (snake_case) → formato do app (camelCase)
    const _normWH = (w) => ({
        ...w,
        codigoInterno: w.codigo_interno || w.codigoInterno || '',
        ativo: w.is_active !== false,
    });
    const _denormWH = (w) => ({
        codigo_interno: w.codigoInterno || '',
        nome:           w.nome || '',
        entidade:       w.entidade || null,
        tipo:           w.tipo || 'Distribuição',
        is_active:      w.ativo !== false,
    });

    const [warehouses, setWarehouses] = useState([]);
    useEffect(() => {
        supabase.from('warehouses').select('*').order('nome')
            .then(({ data }) => { if (data) setWarehouses(data.map(_normWH)); });
    }, []);

    // ── Customers/Clientes (Supabase) ─────────────────────────────────────
    const [customers, setCustomers] = useState([]);
    useEffect(() => {
        // Tabela correta é 'clientes' (não 'customers')
        supabase.from('clientes').select('*').order('razao_social')
            .then(({ data }) => { if (data) setCustomers(data); });
    }, []);

    // ── Veículos (Supabase) ───────────────────────────────────────────────
    const [veiculos, setVeiculos] = useState([]);
    useEffect(() => {
        supabase.from('veiculos').select('*').order('placa')
            .then(({ data }) => { if (data) setVeiculos(data); });
    }, []);

    // ── Rotas (Supabase) ──────────────────────────────────────────────────
    const [rotas, setRotas] = useState([]);
    useEffect(() => {
        supabase.from('rotas').select('*').order('codigo')
            .then(({ data }) => { if (data) setRotas(data.map(r => ({ ...r, clientes: r.clientes || [] }))); });
    }, []);

    // ── Lotes (Supabase) ──────────────────────────────────────────────────
    const _normLote = (l) => ({
        ...l,
        qtdUnit: l.qtd_unit ?? l.qtdUnit ?? 0,
    });
    const _denormLote = (l) => ({
        lote:       l.lote      || '',
        local:      l.local     || '',
        codigo:     l.codigo    || '',
        descricao:  l.descricao || '',
        qtd_unit:   l.qtdUnit   ?? l.qtd_unit ?? 0,
        status:     l.status    || 'Liberado',
        parent:     l.parent    || null,
        motivo:     l.motivo    || null,
        entrada:    l.entrada   || new Date().toISOString(),
    });
    const [lotes, setLotes] = useState([]);
    useEffect(() => {
        supabase.from('lotes').select('*').order('created_at', { ascending: false })
            .then(({ data }) => { if (data) setLotes(data.map(_normLote)); });
    }, []);

    const [warehouseAreas, setWarehouseAreas] = useState([]);
    useEffect(() => {
        // Tabela correta é 'areas_armazem' (não 'areas')
        supabase.from('areas_armazem').select('*').order('nome')
            .then(({ data }) => { if (data) setWarehouseAreas(data); });
    }, []);

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
        return saved ? JSON.parse(saved) : LOCATIONS;
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

    // Normaliza setores DB → app
    // DB colunas: id, warehouse_id, area_id, codigo, nome, tipo_produto, temperatura, ativo, capacidade
    const _normSetor = (s) => ({
        ...s,
        setor:              s.nome              || s.setor              || '',  // DB 'nome' → app 'setor'
        tipoSetor:          s.tipo_produto      || s.tipoSetor          || 'Armazenagem',
        tipoLocal:          s.tipoLocal                                 || '',
        codigoIntegracao:   s.codigo            || s.codigoIntegracao   || '',
        usoExclusivoCaixa:  s.usoExclusivoCaixa || false,
        depositantes:       s.depositantes  || [],
        enderecos:          s.enderecos     || [],
        produtos:           s.produtos      || [],
        usuarios:           s.usuarios      || [],
    });
    const _denormSetor = (s) => ({
        nome:               s.setor               || '',   // app 'setor' → DB 'nome'
        codigo:             s.codigoIntegracao    || '',   // app 'codigoIntegracao' → DB 'codigo'
        tipo_produto:       s.tipoSetor           || '',
        ativo:              s.ativo               !== false,
    });

    const [sectors, setSectors] = useState([]);
    useEffect(() => {
        supabase.from('setores').select('*').order('nome')
            .then(({ data }) => { if (data) setSectors(data.map(_normSetor)); });
    }, []);

    const [userGroups, setUserGroups] = useState(() => {
        const saved = localStorage.getItem('vparts_user_groups');
        return saved ? JSON.parse(saved) : [
            { id: 1, grupo: 'ADMINISTRADORES', ativaExportacoes: true, permitirDownload: true, coletor: ['Recebimento', 'Separação', 'Inventário'], enterprise: ['Dashboard', 'Cadastros', 'Relatórios'], web: ['WMS Web Completo'], operacaoDeposito: ['Entrada', 'Saída', 'Transferência'], atividades: ['Separação da Onda', 'Conferência', 'Expedição'], usuarios: ['danilo.supervisor', 'gelson.estrat'] },
            { id: 2, grupo: 'OPERADORES', ativaExportacoes: false, permitirDownload: false, coletor: ['Recebimento', 'Separação'], enterprise: ['Dashboard'], web: ['WMS Web Básico'], operacaoDeposito: ['Entrada'], atividades: ['Separação da Onda'], usuarios: ['matheus.oper', 'thiago.almox'] },
            { id: 3, grupo: 'SUPERVISORES', ativaExportacoes: true, permitirDownload: true, coletor: ['Recebimento', 'Separação', 'Inventário', 'Expedição'], enterprise: ['Dashboard', 'Cadastros', 'Relatórios', 'Segurança'], web: ['WMS Web Completo'], operacaoDeposito: ['Entrada', 'Saída', 'Transferência', 'Ajuste'], atividades: ['Separação da Onda', 'Conferência', 'Expedição', 'Auditoria'], usuarios: ['danilo.supervisor'] },
        ];
    });

    const [users, setUsers] = useState(() => {
        const saved = localStorage.getItem('vparts_users');
        return saved ? JSON.parse(saved) : [
            { id: 1, usuario: 'danilo.supervisor', nomeUsuario: 'Danilo', email: 'danilo@verticalparts.com.br', status: 'Ativo', nivel: 'Administrador', departamento: 'Logística', entidade: 'VerticalParts Matriz', grupos: ['ADMINISTRADORES', 'SUPERVISORES'], cargo: 'Supervisor', hasTransactions: true },
            { id: 2, usuario: 'matheus.oper', nomeUsuario: 'Matheus', email: 'matheus@verticalparts.com.br', status: 'Ativo', nivel: 'Operador', departamento: 'Expedição', entidade: 'VerticalParts Matriz', grupos: ['OPERADORES'], cargo: 'Operador', hasTransactions: true },
            { id: 3, usuario: 'thiago.almox', nomeUsuario: 'Thiago', email: 'thiago@verticalparts.com.br', status: 'Ativo', nivel: 'Operador', departamento: 'Almoxarifado', entidade: 'VerticalParts Matriz', grupos: ['OPERADORES'], cargo: 'Almox', hasTransactions: false },
            { id: 4, usuario: 'gelson.estrat', nomeUsuario: 'Gelson', email: 'gelson@verticalparts.com.br', status: 'Ativo', nivel: 'Administrador', departamento: 'Estratégia', entidade: 'VerticalParts Matriz', grupos: ['ADMINISTRADORES'], cargo: 'Estratégias e Processos', hasTransactions: false },
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
            { id: 2, tipo: 'Expedição', depositante: 'VerticalParts Matriz', doca: 'DOCA 03', transportadora: 'RodoExpress', motorista: 'Matheus (Expedição)', veiculo: 'DEF-5678', dataInicio: '2026-02-22T10:00', dataFim: '2026-02-22T12:00', turno: 'Manhã', qtdVolume: 120, notasFiscais: 'NF-005500', status: 'veiculo_recepcionado', historico: [{ status: 'agendado', data: '2026-02-20T10:00', usuario: 'danilo.supervisor' }, { status: 'veiculo_recepcionado', data: '2026-02-22T09:45', usuario: 'matheus.expedicao' }] },
            { id: 3, tipo: 'Recebimento', depositante: 'VerticalParts Matriz', doca: 'DOCA 02', transportadora: 'Patrus Transportes', motorista: 'Thiago (Logística)', veiculo: 'GHI-9012', dataInicio: '2026-02-22T14:00', dataFim: '2026-02-22T16:00', turno: 'Tarde', qtdVolume: 80, notasFiscais: 'NF-007788, NF-007789, NF-007790', status: 'veiculo_patio', historico: [{ status: 'agendado', data: '2026-02-19T11:00', usuario: 'danilo.supervisor' }, { status: 'veiculo_recepcionado', data: '2026-02-22T13:30', usuario: 'matheus.expedicao' }, { status: 'veiculo_patio', data: '2026-02-22T13:45', usuario: 'thiago.logistica' }] },
            { id: 4, tipo: 'Expedição', depositante: 'VerticalParts Matriz', doca: 'DOCA 01', transportadora: 'Jadlog', motorista: 'Danilo (Supervisor)', veiculo: 'JKL-3456', dataInicio: '2026-02-23T08:00', dataFim: '2026-02-23T10:00', turno: 'Manhã', qtdVolume: 30, notasFiscais: 'NF-009900', status: 'agendado', historico: [{ status: 'agendado', data: '2026-02-21T16:00', usuario: 'danilo.supervisor' }] },
        ];
    });

    const [orders, setOrders] = useState([
        { 
            id: 'SO-8842', 
            client: 'VerticalParts Matriz', 
            status: 'Pendente', 
            items: 3, 
            totalQty: 12,
            value: 'R$ 4.500,00', 
            date: '21/02/2026',
            orderItems: [
                { id: 1, sku: 'VEPEL-BPI-174FX', desc: 'Barreira de Proteção Infravermelha (174 Feixes)', ean: '789123456001', expected: 5, collected: 0, location: 'R1_PP2_CL012_N001' },
                { id: 2, sku: 'VPER-ESS-NY-27MM', desc: 'Escova de Segurança (Nylon - Base 27mm)', ean: '7891149108718', expected: 2, collected: 0, location: 'R1_PP2_CL012_N002' },
                { id: 3, sku: 'VPER-PAL-INO-1000', desc: 'Pallet de Aço Inox (1000mm)', ean: '789123456003', expected: 5, collected: 0, location: 'R2_PP1_CL005_N001' },
            ]
        },
        { 
            id: 'SO-8845', 
            client: 'VerticalParts Matriz', 
            status: 'Em Separação', 
            items: 2, 
            totalQty: 4,
            value: 'R$ 1.200,00', 
            date: '21/02/2026',
            orderItems: [
                { id: 1, sku: 'VEPEL-BTI-JX02-CCS', desc: 'Botoeira de Inspeção - Mod. JX02', ean: '7890000000001', expected: 2, collected: 1, location: 'R1_PP1_CL001_N003' },
                { id: 2, sku: 'VPER-LUM-LED-VRD-24V', desc: 'Luminária em LED Verde 24V', ean: '7890000000002', expected: 2, collected: 0, location: 'R1_PP1_CL001_N004' },
            ]
        },
        { 
            id: 'SO-8849', 
            client: 'VerticalParts Matriz', 
            status: 'Concluído', 
            items: 1, 
            totalQty: 22,
            value: 'R$ 15.800,00', 
            date: '20/02/2026',
            orderItems: [
                { id: 1, sku: 'VPER-PNT-AL-22D-202X145-CT', desc: 'Pente de Alumínio - 22 Dentes (202x145mm)', ean: '7890000000003', expected: 22, collected: 22, location: 'R2_PP2_CL001_N001' },
            ]
        },
    ]);

    const [inventory, setInventory] = useState(() => {
        const saved = localStorage.getItem('vparts_inventory');
        return saved ? JSON.parse(saved) : [
            { id: 1, part: 'Pente de Alumínio - 22 Dentes (202x145mm)', sku: 'VPER-PNT-AL-22D-202X145-CT', systemStock: 1540, countedStock: 1538, divergence: -2, status: 'Pendente', localizacao: 'R2_PP2_CL001_N001' },
            { id: 2, part: 'Botoeira de Inspeção - Mod. JX02', sku: 'VEPEL-BTI-JX02-CCS', systemStock: 450, countedStock: 450, divergence: 0, status: 'Validado', localizacao: 'R1_PP1_CL001_N003' },
        ];
    });

    const [receiptHistory, setReceiptHistory] = useState(() => {
        const saved = localStorage.getItem('vparts_receipt_history');
        return saved ? JSON.parse(saved) : [];
    });

    // Persist important data
    // companies, warehouses, customers, veiculos, rotas, areas, setores, lotes — persistidos no Supabase
    useEffect(() => { localStorage.setItem('vparts_inventory', JSON.stringify(inventory)); }, [inventory]);
    useEffect(() => { localStorage.setItem('vparts_receipt_history', JSON.stringify(receiptHistory)); }, [receiptHistory]);
    useEffect(() => { localStorage.setItem('vparts_wh_docks', JSON.stringify(warehouseDocks)); }, [warehouseDocks]);
    useEffect(() => { localStorage.setItem('vparts_wh_locations', JSON.stringify(warehouseLocations)); }, [warehouseLocations]);
    useEffect(() => { localStorage.setItem('vparts_wh_colmeias', JSON.stringify(warehouseColmeias)); }, [warehouseColmeias]);
    useEffect(() => { localStorage.setItem('vparts_wh_bancadas', JSON.stringify(warehouseBancadas)); }, [warehouseBancadas]);
    useEffect(() => { localStorage.setItem('vparts_wh_buffers', JSON.stringify(warehouseBuffers)); }, [warehouseBuffers]);
    useEffect(() => { localStorage.setItem('vparts_wh_servicos', JSON.stringify(warehouseServicos)); }, [warehouseServicos]);
    useEffect(() => { localStorage.setItem('vparts_wh_packing', JSON.stringify(warehousePacking)); }, [warehousePacking]);
    // sectors → Supabase
    useEffect(() => { localStorage.setItem('vparts_user_groups', JSON.stringify(userGroups)); }, [userGroups]);
    useEffect(() => { localStorage.setItem('vparts_users', JSON.stringify(users)); }, [users]);
    useEffect(() => { localStorage.setItem('vparts_serial_devices', JSON.stringify(serialDevices)); }, [serialDevices]);
    useEffect(() => { localStorage.setItem('vparts_labels', JSON.stringify(labels)); }, [labels]);
    useEffect(() => { localStorage.setItem('vparts_transport_schedules', JSON.stringify(transportSchedules)); }, [transportSchedules]);

    // === CRUD Helpers ===
    const nextId = (arr) => arr.length > 0 ? Math.max(...arr.map(a => a.id)) + 1 : 1;

    // ── Companies CRUD (Supabase) ──────────────────────────────────────────────
    const _logUser = () => currentUser?.nome || currentUser?.usuario || 'SISTEMA';

    const addCompany = (company) => {
        const newCompany = { ...company, id: crypto.randomUUID() };
        setCompanies(prev => [...prev, newCompany]);
        supabase.from('companies').insert(newCompany).then(({ error }) => {
            if (error) { console.error('[AppContext] addCompany:', error.message); setCompanies(prev => prev.filter(c => c.id !== newCompany.id)); return; }
            logActivity({ userName: _logUser(), action: 'CRIOU', entity: 'empresa', entityId: newCompany.id, entityName: newCompany.name, description: `Empresa "${newCompany.name}" cadastrada.` });
        });
    };
    const updateCompany = (id, data) => {
        const prev_name = companies.find(c => c.id === id)?.name;
        setCompanies(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
        supabase.from('companies').update(data).eq('id', id).then(({ error }) => {
            if (error) { console.error('[AppContext] updateCompany:', error.message); return; }
            logActivity({ userName: _logUser(), action: 'ATUALIZOU', entity: 'empresa', entityId: id, entityName: prev_name, description: `Empresa "${prev_name}" atualizada.` });
        });
    };
    const deleteCompany = (id) => {
        const name = companies.find(c => c.id === id)?.name;
        setCompanies(prev => prev.filter(c => c.id !== id));
        supabase.from('companies').delete().eq('id', id).then(({ error }) => {
            if (error) { console.error('[AppContext] deleteCompany:', error.message); return; }
            logActivity({ userName: _logUser(), action: 'EXCLUIU', entity: 'empresa', entityId: id, entityName: name, description: `Empresa "${name}" excluída.`, level: 'WARNING' });
        });
    };

    // ── Warehouses CRUD (Supabase) ────────────────────────────────────────────
    const addWarehouse = (wh) => {
        const id = crypto.randomUUID();
        const dbData = { id, ..._denormWH(wh) };
        const appData = _normWH(dbData);
        setWarehouses(prev => [...prev, appData]);
        supabase.from('warehouses').insert(dbData).then(({ error }) => {
            if (error) { console.error('[AppContext] addWarehouse:', error.message); setWarehouses(prev => prev.filter(w => w.id !== id)); return; }
            logActivity({ userName: _logUser(), action: 'CRIOU', entity: 'armazém', entityId: id, entityName: wh.nome, description: `Armazém "${wh.nome}" cadastrado.` });
        });
    };
    const updateWarehouse = (id, data) => {
        const nome = warehouses.find(w => w.id === id)?.nome;
        setWarehouses(prev => prev.map(w => w.id === id ? { ...w, ...data } : w));
        supabase.from('warehouses').update(_denormWH(data)).eq('id', id).then(({ error }) => {
            if (error) { console.error('[AppContext] updateWarehouse:', error.message); return; }
            logActivity({ userName: _logUser(), action: 'ATUALIZOU', entity: 'armazém', entityId: id, entityName: nome, description: `Armazém "${nome}" atualizado.` });
        });
    };
    const deleteWarehouse = (id) => {
        const nome = warehouses.find(w => w.id === id)?.nome;
        setWarehouses(prev => prev.filter(w => w.id !== id));
        supabase.from('warehouses').delete().eq('id', id).then(({ error }) => {
            if (error) { console.error('[AppContext] deleteWarehouse:', error.message); return; }
            logActivity({ userName: _logUser(), action: 'EXCLUIU', entity: 'armazém', entityId: id, entityName: nome, description: `Armazém "${nome}" excluído.`, level: 'WARNING' });
        });
    };

    // ── Customers CRUD (Supabase) ─────────────────────────────────────────
    const addCustomer = (customer) => {
        const newC = { ...customer, id: crypto.randomUUID() };
        setCustomers(prev => [...prev, newC]);
        // Tabela correta é 'clientes'
        supabase.from('clientes').insert(newC).then(({ error }) => {
            if (error) { console.error('[AppContext] addCustomer:', error.message); setCustomers(prev => prev.filter(c => c.id !== newC.id)); return; }
            logActivity({ userName: _logUser(), action: 'CRIOU', entity: 'cliente', entityId: newC.id, entityName: newC.razao_social, description: `Cliente "${newC.razao_social}" cadastrado.` });
        });
    };
    const updateCustomer = (id, data) => {
        const nome = customers.find(c => c.id === id)?.razao_social;
        setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
        supabase.from('clientes').update(data).eq('id', id).then(({ error }) => {
            if (error) { console.error('[AppContext] updateCustomer:', error.message); return; }
            logActivity({ userName: _logUser(), action: 'ATUALIZOU', entity: 'cliente', entityId: id, entityName: nome, description: `Cliente "${nome}" atualizado.` });
        });
    };
    const deleteCustomer = (id) => {
        const nome = customers.find(c => c.id === id)?.razao_social;
        setCustomers(prev => prev.filter(c => c.id !== id));
        supabase.from('clientes').delete().eq('id', id).then(({ error }) => {
            if (error) { console.error('[AppContext] deleteCustomer:', error.message); return; }
            logActivity({ userName: _logUser(), action: 'EXCLUIU', entity: 'cliente', entityId: id, entityName: nome, description: `Cliente "${nome}" excluído.`, level: 'WARNING' });
        });
    };

    // ── Veículos CRUD (Supabase) ──────────────────────────────────────────
    const addVeiculo = (veiculo) => {
        const newV = { ...veiculo, id: crypto.randomUUID() };
        setVeiculos(prev => [...prev, newV]);
        supabase.from('veiculos').insert(newV).then(({ error }) => {
            if (error) { console.error('[AppContext] addVeiculo:', error.message); setVeiculos(prev => prev.filter(v => v.id !== newV.id)); return; }
            logActivity({ userName: _logUser(), action: 'CRIOU', entity: 'veículo', entityId: newV.id, entityName: newV.placa, description: `Veículo "${newV.placa} — ${newV.modelo || ''}" cadastrado.` });
        });
    };
    const updateVeiculo = (id, data) => {
        const placa = veiculos.find(v => v.id === id)?.placa;
        setVeiculos(prev => prev.map(v => v.id === id ? { ...v, ...data } : v));
        supabase.from('veiculos').update(data).eq('id', id).then(({ error }) => {
            if (error) { console.error('[AppContext] updateVeiculo:', error.message); return; }
            logActivity({ userName: _logUser(), action: 'ATUALIZOU', entity: 'veículo', entityId: id, entityName: placa, description: `Veículo "${placa}" atualizado.` });
        });
    };
    const deleteVeiculo = (id) => {
        const placa = veiculos.find(v => v.id === id)?.placa;
        setVeiculos(prev => prev.filter(v => v.id !== id));
        supabase.from('veiculos').delete().eq('id', id).then(({ error }) => {
            if (error) { console.error('[AppContext] deleteVeiculo:', error.message); return; }
            logActivity({ userName: _logUser(), action: 'EXCLUIU', entity: 'veículo', entityId: id, entityName: placa, description: `Veículo "${placa}" excluído.`, level: 'WARNING' });
        });
    };

    // ── Rotas CRUD (Supabase) ─────────────────────────────────────────────
    const addRota = (rota) => {
        const newR = { ...rota, id: crypto.randomUUID(), clientes: rota.clientes || [] };
        setRotas(prev => [...prev, newR]);
        supabase.from('rotas').insert(newR).then(({ error }) => {
            if (error) { console.error('[AppContext] addRota:', error.message); setRotas(prev => prev.filter(r => r.id !== newR.id)); return; }
            logActivity({ userName: _logUser(), action: 'CRIOU', entity: 'rota', entityId: newR.id, entityName: newR.codigo, description: `Rota "${newR.codigo} — ${newR.descricao || ''}" cadastrada.` });
        });
    };
    const updateRota = (id, data) => {
        const codigo = rotas.find(r => r.id === id)?.codigo;
        setRotas(prev => prev.map(r => r.id === id ? { ...r, ...data } : r));
        supabase.from('rotas').update(data).eq('id', id).then(({ error }) => {
            if (error) { console.error('[AppContext] updateRota:', error.message); return; }
            logActivity({ userName: _logUser(), action: 'ATUALIZOU', entity: 'rota', entityId: id, entityName: codigo, description: `Rota "${codigo}" atualizada.` });
        });
    };
    const deleteRota = (id) => {
        const codigo = rotas.find(r => r.id === id)?.codigo;
        setRotas(prev => prev.filter(r => r.id !== id));
        supabase.from('rotas').delete().eq('id', id).then(({ error }) => {
            if (error) { console.error('[AppContext] deleteRota:', error.message); return; }
            logActivity({ userName: _logUser(), action: 'EXCLUIU', entity: 'rota', entityId: id, entityName: codigo, description: `Rota "${codigo}" excluída.`, level: 'WARNING' });
        });
    };

    // ── Lotes CRUD (Supabase) ─────────────────────────────────────────────
    const addLote = (lote) => {
        const id = crypto.randomUUID();
        const dbData = { id, ..._denormLote(lote) };
        const appData = _normLote(dbData);
        setLotes(prev => [appData, ...prev]);
        supabase.from('lotes').insert(dbData).then(({ error }) => {
            if (error) { console.error('[AppContext] addLote:', error.message); setLotes(prev => prev.filter(l => l.id !== id)); return; }
            logActivity({ userName: _logUser(), action: lote.parent ? 'DIVIDIU' : 'CRIOU', entity: 'lote', entityId: id, entityName: lote.lote, description: lote.parent ? `Lote "${lote.lote}" criado por fracionamento de "${lote.parent}".` : `Lote "${lote.lote}" cadastrado.` });
        });
    };
    const updateLote = (id, data) => {
        const loteAtual = lotes.find(l => l.id === id);
        setLotes(prev => prev.map(l => l.id === id ? { ...l, ...data } : l));
        const dbData = {};
        if (data.status    !== undefined) dbData.status   = data.status;
        if (data.motivo    !== undefined) dbData.motivo   = data.motivo;
        if (data.local     !== undefined) dbData.local    = data.local;
        if (data.qtdUnit   !== undefined) dbData.qtd_unit = data.qtdUnit;
        if (data.qtd_unit  !== undefined) dbData.qtd_unit = data.qtd_unit;
        if (Object.keys(dbData).length > 0) {
            supabase.from('lotes').update(dbData).eq('id', id).then(({ error }) => {
                if (error) { console.error('[AppContext] updateLote:', error.message); return; }
                if (data.status) {
                    const acao = data.status === 'Bloqueado' ? 'BLOQUEOU' : 'DESBLOQUEOU';
                    logActivity({ userName: _logUser(), action: acao, entity: 'lote', entityId: id, entityName: loteAtual?.lote, description: `Lote "${loteAtual?.lote}" ${data.status === 'Bloqueado' ? 'bloqueado' : 'desbloqueado'}. Motivo: ${data.motivo || '—'}`, level: data.status === 'Bloqueado' ? 'WARNING' : 'INFO' });
                } else {
                    logActivity({ userName: _logUser(), action: 'ATUALIZOU', entity: 'lote', entityId: id, entityName: loteAtual?.lote, description: `Lote "${loteAtual?.lote}" atualizado.` });
                }
            });
        }
    };
    const deleteLote = (id) => {
        const nome = lotes.find(l => l.id === id)?.lote;
        setLotes(prev => prev.filter(l => l.id !== id));
        supabase.from('lotes').delete().eq('id', id).then(({ error }) => {
            if (error) { console.error('[AppContext] deleteLote:', error.message); return; }
            logActivity({ userName: _logUser(), action: 'EXCLUIU', entity: 'lote', entityId: id, entityName: nome, description: `Lote "${nome}" excluído.`, level: 'WARNING' });
        });
    };

    // ── Warehouse Areas CRUD (Supabase) ───────────────────────────────────
    const addWarehouseArea = (area) => {
        const newA = { ...area, id: crypto.randomUUID() };
        setWarehouseAreas(prev => [...prev, newA]);
        supabase.from('areas_armazem').insert(newA).then(({ error }) => {
            if (error) { console.error('[AppContext] addWarehouseArea:', error.message); setWarehouseAreas(prev => prev.filter(a => a.id !== newA.id)); return; }
            logActivity({ userName: _logUser(), action: 'CRIOU', entity: 'área', entityId: newA.id, entityName: newA.nome, description: `Área "${newA.nome}" cadastrada.` });
        });
    };
    const updateWarehouseArea = (id, updatedArea) => {
        const nome = warehouseAreas.find(a => a.id === id)?.nome;
        setWarehouseAreas(prev => prev.map(a => a.id === id ? { ...a, ...updatedArea } : a));
        supabase.from('areas_armazem').update(updatedArea).eq('id', id).then(({ error }) => {
            if (error) { console.error('[AppContext] updateWarehouseArea:', error.message); return; }
            logActivity({ userName: _logUser(), action: 'ATUALIZOU', entity: 'área', entityId: id, entityName: nome, description: `Área "${nome}" atualizada.` });
        });
    };
    const deleteWarehouseArea = (id) => {
        const nome = warehouseAreas.find(a => a.id === id)?.nome;
        setWarehouseAreas(prev => prev.filter(a => a.id !== id));
        supabase.from('areas_armazem').delete().eq('id', id).then(({ error }) => {
            if (error) { console.error('[AppContext] deleteWarehouseArea:', error.message); return; }
            logActivity({ userName: _logUser(), action: 'EXCLUIU', entity: 'área', entityId: id, entityName: nome, description: `Área "${nome}" excluída.`, level: 'WARNING' });
        });
    };

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
    const sectorsCrud = {
        add: (item) => {
            const id = crypto.randomUUID();
            const dbData = { id, ..._denormSetor(item) };
            const appData = _normSetor(dbData);
            setSectors(prev => [...prev, appData]);
            supabase.from('setores').insert(dbData).then(({ error }) => {
                if (error) { console.error('[AppContext] sectorsCrud.add:', error.message); setSectors(prev => prev.filter(s => s.id !== id)); return; }
                logActivity({ userName: _logUser(), action: 'CRIOU', entity: 'setor', entityId: id, entityName: item.setor, description: `Setor "${item.setor}" cadastrado.` });
            });
        },
        update: (id, data) => {
            const nome = sectors.find(s => s.id === id)?.setor;
            setSectors(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
            supabase.from('setores').update(_denormSetor(data)).eq('id', id).then(({ error }) => {
                if (error) { console.error('[AppContext] sectorsCrud.update:', error.message); return; }
                logActivity({ userName: _logUser(), action: 'ATUALIZOU', entity: 'setor', entityId: id, entityName: nome, description: `Setor "${nome}" atualizado.` });
            });
        },
        remove: (id) => {
            const nome = sectors.find(s => s.id === id)?.setor;
            setSectors(prev => prev.filter(s => s.id !== id));
            supabase.from('setores').delete().eq('id', id).then(({ error }) => {
                if (error) { console.error('[AppContext] sectorsCrud.remove:', error.message); return; }
                logActivity({ userName: _logUser(), action: 'EXCLUIU', entity: 'setor', entityId: id, entityName: nome, description: `Setor "${nome}" excluído.`, level: 'WARNING' });
            });
        },
        bulkUpdate: (ids, data) => {
            setSectors(prev => prev.map(s => ids.includes(s.id) ? { ...s, ...data } : s));
        },
    };
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
            companies, addCompany, updateCompany, deleteCompany,
            warehouses, addWarehouse, updateWarehouse, deleteWarehouse,
            // warehouseId: ID do primeiro armazém ativo — consumido por Dashboard e páginas operacionais
            warehouseId: warehouses[0]?.id ?? null,
            customers, addCustomer, updateCustomer, deleteCustomer,
            veiculos, addVeiculo, updateVeiculo, deleteVeiculo,
            rotas, addRota, updateRota, deleteRota,
            lotes, addLote, updateLote, deleteLote,
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
            isTvMode, setIsTvMode,
            currentUser, setCurrentUser,
            LOCATIONS,
        }}>
            {children}
        </AppContext.Provider>
    );
}


