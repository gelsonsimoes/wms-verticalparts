export const VP_TYPES = [
  { value: 'VPEL', label: 'VPEL - Peças para Elevadores', description: 'Componentes mecânicos e eletrônicos para elevadores de passageiros e carga.' },
  { value: 'VPER', label: 'VPER - Peças para Escadas Rolantes', description: 'Componentes para escadas e esteiras rolantes.' },
  { value: 'VPMP', label: 'VPMP - Matéria-Prima', description: 'Materiais brutos para fabricação (aço, alumínio, nylon, etc).' },
  { value: 'VPKIT', label: 'VPKIT - Kit de Emenda', description: 'Conjuntos pré-montados para emenda de corrimão ou cabos.' },
  { value: 'VPIN', label: 'VPIN - Insumo de Produção', description: 'Materiais auxiliares usados no processo produtivo.' },
  { value: 'VPCON', label: 'VPCON - Uso e Consumo', description: 'Materiais para manutenção interna ou escritório.' },
  { value: 'VPAT', label: 'VPAT - Ativo Imobilizado', description: 'Máquinas e equipamentos da própria empresa.' },
  { value: 'OAK', label: 'OAK - Escada Rolante (Equipamento)', description: 'Equipamento completo modelo OAK.' },
  { value: 'BULOKE', label: 'BULOKE - Escada Rolante (Equipamento)', description: 'Equipamento completo modelo BULOKE.' },
  { value: 'SEQUOIA', label: 'SEQUOIA - Esteira Rolante', description: 'Equipamento completo de esteira rolante.' },
  { value: 'VP-P', label: 'VP-P - Elevador de Passageiros', description: 'Equipamento completo para transporte de pessoas.' },
  { value: 'VP-E', label: 'VP-E - Elevador de Carga', description: 'Equipamento completo para transporte de cargas.' },
  { value: 'VP-Y', label: 'VP-Y - Elevador de Maca', description: 'Equipamento hospitalar completo.' },
  { value: 'VP-G', label: 'VP-G - Elevador Monta Carga', description: 'Pequeno elevador de carga para restaurantes/comércio.' },
  { value: 'VP-V', label: 'VP-V - Homelift', description: 'Elevador residencial de baixa velocidade.' },
  { value: 'VP-A', label: 'VP-A - Elevador para Automóveis', description: 'Plataforma ou elevador reforçado para veículos.' },
  { value: 'VP-X', label: 'VP-X - Plataforma de Acessibilidade', description: 'Equipamento para usuários com mobilidade reduzida.' },
  { value: 'VPEST', label: 'VPEST - Esteira Remanufaturada', description: 'Equipamento de esteira que passou por retrofit.' },
  { value: 'VPESC', label: 'VPESC - Escada Remanufaturada', description: 'Equipamento de escada que passou por retrofit.' }
];

export const CATEGORIES = [
  { value: 'PTC', label: 'Polia de Tração', attributes: ['diameter', 'width'] },
  { value: 'ROC', label: 'Rolete de Suporte', attributes: ['diameter', 'width'] },
  { value: 'CPV', label: 'Correia Poly-V', attributes: ['length', 'ribs'] },
  { value: 'PEC', label: 'Protetor de Entrada do Corrimão', attributes: ['type', 'side'] },
  { value: 'OTC', label: 'OuterCap', attributes: ['side'] },
  { value: 'LUM', label: 'Luminária', attributes: ['tech', 'color', 'voltage'] },
  { value: 'BTN', label: 'Botão', attributes: ['color', 'dimensions', 'pins', 'model'] },
  { value: 'BTI', label: 'Botoeira de Inspeção', attributes: ['model'] },
  { value: 'PLC', label: 'Placa Eletrônica', attributes: ['model'] },
  { value: 'CEF', label: 'Contato Elétrico Fêmea', attributes: ['type', 'reference'] },
  { value: 'CEL', label: 'Contato Elétrico (Geral)', attributes: ['type', 'reference'] },
  { value: 'MFC', label: 'Chave Fim de Curso', attributes: ['type', 'reference'] },
  { value: 'DRV', label: 'Inversor / Drive', attributes: ['power', 'model'] },
  { value: 'CAB', label: 'Cabo / Fiação', attributes: ['gauge', 'cores', 'length'] },
  { value: 'SAP', label: 'Sapata', attributes: ['model', 'material'] },
  { value: 'COR', label: 'Corrimão', attributes: ['type', 'length'] },
  { value: 'ROL', label: 'Rolamento', attributes: ['model'] },
  { value: 'FIL', label: 'Filtro', attributes: ['type'] },
];

export const ATTRIBUTE_FIELDS = {
  diameter: { label: 'Diâmetro (mm)', placeholder: 'Ex: 587' },
  width: { label: 'Largura (mm)', placeholder: 'Ex: 30' },
  length: { label: 'Comprimento (mm)', placeholder: 'Ex: 1900' },
  ribs: { label: 'Nº de Frisos', placeholder: 'Ex: 4' },
  side: { 
    label: 'Lado', 
    type: 'select', 
    options: [
      { value: 'ESQ', label: 'Esquerdo' },
      { value: 'DIR', label: 'Direito' },
      { value: 'AMB', label: 'Ambos' },
      { value: 'UNI', label: 'Universal' }
    ] 
  },
  type: { label: 'Tipo / Modelo Técnico', placeholder: 'Ex: STP (Stop)' },
  tech: { label: 'Tecnologia', placeholder: 'Ex: LED' },
  color: { label: 'Cor', placeholder: 'Ex: VRD (Verde)' },
  voltage: { label: 'Voltagem', placeholder: 'Ex: 24V' },
  dimensions: { label: 'Dimensões (LxAxP)', placeholder: 'Ex: 40X40X20' },
  pins: { label: 'Nº de Pinos', placeholder: 'Ex: 4' },
  model: { label: 'Modelo / Part Number', placeholder: 'Ex: RS11' },
  reference: { label: 'Referência Marca', placeholder: 'Ex: KONE' },
  power: { label: 'Potência / KW', placeholder: 'Ex: 5.5KW' },
  gauge: { label: 'Bitola (mm²)', placeholder: 'Ex: 2.5' },
  cores: { label: 'Nº de Vias', placeholder: 'Ex: 12' },
  material: { label: 'Material', placeholder: 'Ex: Nylon' },
};

export const COMPATIBILITY = [
  { value: 'CCO', label: 'CCO (Otis / XIZI)' },
  { value: 'CCS', label: 'CCS (Atlas Schindler)' },
  { value: 'CCT', label: 'CCT (Thyssen / TKE)' },
  { value: 'CCV', label: 'CCV (Villarta)' },
  { value: 'CCK', label: 'CCK (Kone)' },
  { value: 'CCM', label: 'CCM (Monarch)' },
  { value: 'CCB', label: 'CCB (BST)' },
  { value: 'CCZ', label: 'CCZ (XIZI)' },
  { value: 'GERAL', label: 'Geral / Universal' },
];
