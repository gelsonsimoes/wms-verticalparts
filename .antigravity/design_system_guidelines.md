# Diretrizes de Design System - Vertical Parts Enterprise

Este documento detalha as diretrizes de UI/UX e a paleta de cores para o padrão Enterprise do WMS da Vertical Parts, inspirado no Microsoft Dynamics 365 Finance & Operations.

## 1. Paleta de Cores & Aplicação Estrutural

-   **Base (Backgrounds):**
    -   `#FFFFFF` (Branco): Para áreas de conteúdo principal e fundos de tabelas, garantindo legibilidade.
    -   `#F8F9FA` (Cinza Claríssimo): Para diferenciar seções e fundos de inputs `read-only`.
-   **Estrutura (Nav & Sidebar):**
    -   `#1A1A1A` (Preto Sólido): Aplicado no menu lateral (Sidebar) e na barra de ferramentas superior (Top Bar). O texto nestas áreas deve ser branco.
-   **Destaque e Ação (CTAs):**
    -   `#FFD700` (Amarelo Vibrante) ou `#F2C94C`: Para botões de ação primária (com gradiente sutil), indicadores de status 'Ativo', ícones de alerta e elementos selecionados. O texto nestes elementos deve ser preto.
-   **Texto e Rótulos:**
    -   `#4F4F4F` (Cinza Escuro): Para rótulos (labels) e textos secundários.
    -   `#000000` (Preto): Para dados dinâmicos e textos principais.

## 2. Arquitetura de Layout (Hierarquia)

-   **Sidebar de Navegação:**
    -   Vertical, colapsável, estilo minimalista com ícones em Outline.
    -   Fundo em Preto Sólido (`#1A1A1A`), texto em branco ou cinza claro.
-   **Action Pane (Barra de Comandos):**
    -   Posicionada logo abaixo do header, com botões agrupados por divisores verticais finos.
    -   O botão principal de "Novo", "Salvar" ou de fluxo primário deve ter fundo Amarelo com gradiente sutil e texto Preto.
-   **FastTabs (Acordeões):**
    -   Seções expansíveis com cabeçalhos em negrito e um ícone de seta discreto à direita para agrupar blocos de formulários.
    -   Fundo do cabeçalho em Cinza Claríssimo (`#F8F9FA`).
-   **Data Grid (Tabela):
**    -   Linhas estritas com **40px de altura**.
    -   Efeito de hover em Amarelo muito claro (5% de opacidade).
    -   Bordas inferiores de 1px em cinza claro.
-   **Form Elements:**
    -   Inputs com bordas quadradas leves (`border-radius: 2px`).
    -   Switches de toggle inspirados no Fluent Design, mas usando Amarelo quando 'On'.

## 3. Estilo Visual e Comportamento

-   **Tipografia:**
    -   Estritamente `Inter` ou `Segoe UI` para um aspecto técnico, corporativo e limpo.
-   **Componentes:**
    -   Botões não devem ter sombras pesadas, apenas uma mudança sutil de tom no hover (Flat Design puro).
-   **Densidade (Compact UI):**
    -   Priorizar a visualização de muitos dados sem scroll excessivo, especialmente em FastTabs com grids de 4 colunas para campos de formulário.

## 4. Ativos Visuais

-   **Logotipo:** O logotipo oficial (`logo amarelosvg.svg`) deve ser integrado ao Header e/ou Sidebar, mantendo a identidade visual da Vertical Parts.
