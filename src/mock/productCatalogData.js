export const TIPOS = ['Peça', 'Conjunto', 'Serviço', 'Embalagem', 'Consumível'];

export const FAMILIAS = [
  'Motor', 'Freio', 'Cabine', 'Contrapeso', 'Guia de Corrediça', 
  'Painel Elétrico', 'Porta', 'Cabos e Cintas', 'Escada Rolante', 
  'Segurança', 'Sinalização', 'Outros'
];

export const MARCAS = [
  'Atlas Schindler', 'Otis', 'ThyssenKrupp', 'Kone', 
  'Mitsubishi', 'Hidra', 'Genérico', 'Importado'
];

export const UNIDADES = [
  'PC', 'UN', 'KG', 'MT', 'M2', 'M3', 'LT', 'CX', 
  'PAR', 'JG', 'KIT', 'RL', 'SC', 'BD', 'FD', 'GL', 'TB', 'PT'
];

export const REGRAS_EXP = [
  { value: 'FIFO', label: 'FIFO — First In, First Out', desc: 'Expede o lote mais antigo primeiro.' },
  { value: 'LIFO', label: 'LIFO — Last In, First Out',  desc: 'Expede o lote mais recente primeiro.' },
  { value: 'LOC',  label: 'Sequência de Locais',        desc: 'Expede conforme a posição física do endereço (rua → coluna → nível).' },
];

export const APRESEN = ['1x1 (Unitário)', '6x1', '12x1', '24x1', 'Caixa Master'];

export const PRODUTOS_INIT = [
  {
    id: 'P001', codigo: 'VEPEL-BPI-174FX', descricao: 'Barreira de Proteção Infravermelha (174 Feixes)',
    tipo: 'Peça', familia: 'Segurança', marca: 'Genérico', movimentaEstoque: true,
    observacao: 'Barreira de segurança infravermelha com 174 feixes para portas de elevadores.',
    regraExpedicao: 'FIFO', locaisPreferidos: 'R1_PP1_CL001_N001',
    embalagens: [
      { id:'e1', barcode:'7891234560001', apresentacao:'1x1 (Unitário)', fator:1,  lastro:10, camada:5, pesoBruto:2.500 },
    ],
  },
  {
    id: 'P002', codigo: 'VPER-ESS-NY-27MM', descricao: 'Escova de Segurança (Nylon - Base 27mm)',
    tipo: 'Peça', familia: 'Escada Rolante', marca: 'Genérico', movimentaEstoque: true,
    observacao: 'Escova de segurança em nylon com base de 27mm para degraus de escada rolante.',
    regraExpedicao: 'FIFO', locaisPreferidos: 'R1_PP2_CL010_N001',
    embalagens: [
      { id:'e3', barcode:'7891234560010', apresentacao:'1x1 (Unitário)', fator:1, lastro:5, camada:3, pesoBruto:1.200 },
    ],
  },
  {
    id: 'P003', codigo: 'VPER-PAL-INO-1000', descricao: 'Pallet de Aço Inox (1000mm)',
    tipo: 'Conjunto', familia: 'Escada Rolante', marca: 'Genérico', movimentaEstoque: true,
    observacao: 'Degrau (Pallet) completo em aço inox para escadas rolantes de 1000mm.',
    regraExpedicao: 'LOC', locaisPreferidos: 'R2_PP1_CL001_N001',
    embalagens: [
      { id:'e4', barcode:'7891234560020', apresentacao:'1x1 (Unitário)', fator:1, lastro:1, camada:1, pesoBruto:15.200 },
    ],
  },
  {
    id: 'P004', codigo: 'VPER-INC-ESQ', descricao: 'InnerCap (Esquerdo) - Ref.: VERTICALPARTS',
    tipo: 'Peça', familia: 'Escada Rolante', marca: 'Genérico', movimentaEstoque: true,
    observacao: 'Capa interna esquerda para acabamento de escadas rolantes.',
    regraExpedicao: 'FIFO', locaisPreferidos: 'R1_PP3_CL005_N002',
    embalagens: [
      { id:'e5', barcode:'7891234560030', apresentacao:'1x1 (Unitário)', fator:1, lastro:10, camada:10, pesoBruto:0.450 },
    ],
  },
  {
    id: 'P005', codigo: 'VPER-LUM-LED-VRD-24V', descricao: 'Luminária em LED Verde 24V',
    tipo: 'Peça', familia: 'Sinalização', marca: 'Genérico', movimentaEstoque: true,
    observacao: 'Luminária indicativa de LED verde 24V para sinalização de poço ou cabine.',
    regraExpedicao: 'FIFO', locaisPreferidos: 'R1_PP1_CL002_N005',
    embalagens: [
      { id:'e6', barcode:'7891234560040', apresentacao:'1x1 (Unitário)', fator:1, lastro:20, camada:5, pesoBruto:0.150 },
    ],
  },
];
