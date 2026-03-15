export const MOCK_CROSS_DOCKING = [
  {
    id: 'NF-10292', ordem: 'OR-55920', status: 'Pendente', conferido: true,
    alocada: 80, expedida: 0, coleta: '--',
    doca: 'Doca 08',
    itens: [
      { sku: 'VEPEL-BPI-174FX',  desc: 'Barreira de Proteção Infravermelha (174 Feixes)', ean: '789123456001', solicitado: 10, atendido: 8 },
      { sku: 'VPER-ESS-NY-27MM', desc: 'Escova de Segurança (Nylon, Base 27mm)',           ean: '7891149108718', solicitado: 5,  atendido: 5 },
    ],
    rotaExpressaDefinida: false,
    rotaExpressa: null,
  },
  {
    id: 'NF-10295', ordem: 'OR-55925', status: 'Pendente', conferido: true,
    alocada: 100, expedida: 45, coleta: 'COL-882',
    doca: 'Doca 12',
    itens: [
      { sku: 'VPER-PAL-INO-1000', desc: 'Pallet de Aço Inox (1000mm)', ean: '789123456003', solicitado: 50, atendido: 50 },
    ],
    rotaExpressaDefinida: true,
    rotaExpressa: true,
  },
  {
    id: 'NF-10300', ordem: 'OR-55930', status: 'Processada', conferido: true,
    alocada: 100, expedida: 100, coleta: 'COL-900',
    doca: 'Doca 05',
    itens: [
      { sku: 'VPER-INC-ESQ', desc: 'InnerCap (Esquerdo) — Ref. VERTICALPARTS', ean: '7890000000001', solicitado: 100, atendido: 100 },
    ],
    rotaExpressaDefinida: true,
    rotaExpressa: false,
  },
  {
    id: 'NF-9982', ordem: 'OR-55800', status: 'Cancelada', conferido: false,
    alocada: 0, expedida: 0, coleta: '--',
    doca: '--',
    itens: [
      { sku: 'VPER-AIR-FLOW', desc: 'Filtro de Ar VP-FLOW', ean: '7890000000002', solicitado: 200, atendido: 0 },
    ],
    rotaExpressaDefinida: false,
    rotaExpressa: null,
  },
];
