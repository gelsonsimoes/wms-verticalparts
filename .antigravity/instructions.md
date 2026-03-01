\# Regras Gerais do Projeto - VerticalParts

\## Identidade Visual

\- O site oficial de referência é: https://www.verticalparts.com.br

\- Cores principais: Azul, Laranja e Branco.

\- Estilo: Profissional, industrial, limpo e moderno.

\## Padrões de Código

\- Sempre use Português para comentários e textos na interface.

\- Utilize CSS moderno (Flexbox/Grid) para garantir que o site funcione em celulares (Responsivo).

\- Após criar qualquer interface, utilize a ferramenta de Browser para verificar se o layout está correto e se as cores batem com o site oficial.

\## Fluxo de Trabalho

\- Sempre que criar um novo arquivo, certifique-se de que ele está formatado corretamente.

\- Se encontrar erros no console do navegador, tente corrigi-los automaticamente antes de me avisar.

\# Diretrizes de Design - VerticalParts

\## Referência Visual Obrigatória

\- O estilo visual DEVE ser extraído dos arquivos CSS localizados em: `./css-referencia/`

\- Analise as variáveis CSS (ex: --primary, --blue, --orange) nestes arquivos para definir a paleta de cores.

\- Mantenha o padrão de botões, arredondamentos (border-radius) e sombras (box-shadow) encontrados nos arquivos.

\## Regras de Interface

\- Idioma: Português (Brasil).

\- Layout: Responsivo (Mobile First).

\- Bibliotecas Permitidas: Se precisar de ícones, use FontAwesome ou Lucide (via CDN).

\## Comportamento do Agente

\- Antes de codificar, leia os arquivos na pasta C:\\Users\\gelso\\Projetos_Antigravity\\css-referencia

&nbsp;`css-referencia` para garantir fidelidade total à marca.

\- Sempre formate o código usando Prettier após a criação.

O ambiente de execução é Windows PowerShell. Não use comandos exclusivos de Linux como 'grep' ou 'sudo'.

## Massa de Dados Reais (VerticalParts)

### Usuários Autorizados (Colaboradores)

- Danilo
- Matheus
- Thiago

# Regras de Negócio e Domínio (MUITO IMPORTANTE)

## 1. Ramo de Atuação (Contexto)

- A VerticalParts atua EXCLUSIVAMENTE com o fornecimento de soluções e peças de reposição para transporte de passageiros (Elevadores, Escadas Rolantes e Esteiras Rolantes).
- PROIBIDO: NUNCA gere dados fictícios (mock data) relacionados a peças automotivas (ex: pastilha de freio, óleo), supermercado ou qualquer outro segmento.
- Não há filiais da VerticalParts apenas aqui: Guarulhos, SP, na Rua Armandina Braga de Almeida, 383, CEP 07141-003

## 2. Padrão de Endereçamento de Estoque

Ao gerar dados fictícios de locais de armazenagem, utilize ESTRITAMENTE a seguinte máscara:

- Formato: R[Rua]\_PP[PortaPalete]\_CL[Coluna]\_N[Nivel]
- Exemplo prático: R1_PP1_CL001_N001
- Limites da planta física:
  - Ruas (R): 1 a 3
  - Porta Paletes (PP): 1 a 4
  - Colunas (CL): 001 a 040
  - Níveis (N): 001 a 200

### Catálogo de Produtos e SKUs (Exemplos Reais)

Sempre que o sistema precisar mostrar dados, utilize estes SKUs e Descrições:

- SKU: VPER-ESS-NY-27MM | Descrição: Escova de Segurança (Nylon - Base 27mm)
- SKU: VPER-PAL-INO-1000 | Descrição: Pallet de Aço Inox (1000mm)
- SKU: VPER-INC-ESQ | Descrição: InnerCap (Esquerdo) - Ref.: VERTICALPARTS
- SKU: VPER-INC-DIR | Descrição: InnerCap (Direito) - Ref.: VERTICALPARTS
- SKU: VPER-PNT-AL-22D-202X145-CT | Descrição: Pente de Alumínio - 22 Dentes (202x145mm)
- SKU: VPER-LUM-LED-VRD-24V | Descrição: Luminária em LED Verde 24V

### Regras de Exibição

- Nunca use nomes como "Produto 1" ou "Usuário Teste".
- Use os nomes dos colaboradores acima para logs de sistema, autores de conferência e responsáveis por picking.

# Novas Diretrizes de UI/UX - Padrão Enterprise (D365 Inspired)

Estas diretrizes complementam e, em caso de conflito, **substituem** as regras anteriores para a interface visual do WMS da Vertical Parts. O objetivo é reconstruir a interface para uma arquitetura inspirada no Microsoft Dynamics 365 Finance & Operations, focada em produtividade, alta densidade de informação e clareza técnica.

## 1. Paleta de Cores & Aplicação Estrutural

- **Base (Backgrounds):**
  - `#FFFFFF` (Branco): Para áreas de conteúdo principal e fundos de tabelas, garantindo legibilidade.
  - `#F8F9FA` (Cinza Claríssimo): Para diferenciar seções e fundos de inputs `read-only`.
- **Estrutura (Nav & Sidebar):**
  - `#1A1A1A` (Preto Sólido): Aplicado no menu lateral (Sidebar) e na barra de ferramentas superior (Top Bar). O texto nestas áreas deve ser branco.
- **Destaque e Ação (CTAs):**
  - `#FFD700` (Amarelo Vibrante) ou `#F2C94C`: Para botões de ação primária (com gradiente sutil), indicadores de status 'Ativo', ícones de alerta e elementos selecionados. O texto nestes elementos deve ser preto.
- **Texto e Rótulos:**
  - `#4F4F4F` (Cinza Escuro): Para rótulos (labels) e textos secundários.
  - `#000000` (Preto): Para dados dinâmicos e textos principais.

## 2. Arquitetura de Layout (Hierarquia)

- **Sidebar de Navegação:**
  - Vertical, colapsável, estilo minimalista com ícones em Outline.
  - Fundo em Preto Sólido (`#1A1A1A`), texto em branco ou cinza claro.
- **Action Pane (Barra de Comandos):**
  - Posicionada logo abaixo do header, com botões agrupados por divisores verticais finos.
  - O botão principal de "Novo", "Salvar" ou de fluxo primário deve ter fundo Amarelo com gradiente sutil e texto Preto.
- **FastTabs (Acordeões):**
  - Seções expansíveis com cabeçalhos em negrito e um ícone de seta discreto à direita para agrupar blocos de formulários.
  - Fundo do cabeçalho em Cinza Claríssimo (`#F8F9FA`).
- **Data Grid (Tabela):**
  - Linhas estritas com **40px de altura**.
  - Efeito de hover em Amarelo muito claro (5% de opacidade).
  - Bordas inferiores de 1px em cinza claro.
- **Form Elements:**
  - Inputs com bordas quadradas leves (`border-radius: 2px`).
  - Switches de toggle inspirados no Fluent Design, mas usando Amarelo quando 'On'.

## 3. Estilo Visual e Comportamento

- **Tipografia:**
  - Estritamente `Inter` ou `Segoe UI` para um aspecto técnico, corporativo e limpo.
- **Componentes:**
  - Botões não devem ter sombras pesadas, apenas uma mudança sutil de tom no hover (Flat Design puro).
- **Densidade (Compact UI):**
  - Priorizar a visualização de muitos dados sem scroll excessivo, especialmente em FastTabs com grids de 4 colunas para campos de formulário.

## 4. Ativos Visuais

- **Logotipo:** O logotipo oficial (`logo amarelosvg.svg`) deve ser integrado ao Header e/ou Sidebar, mantendo a identidade visual da Vertical Parts.

---

**Esta seção deve ser utilizada pelo Google Antigravity para garantir que todas as futuras gerações de código e refatorações sigam este novo padrão visual Enterprise.**
