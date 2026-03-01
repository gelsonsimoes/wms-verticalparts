# Vertical Parts - WMS Enterprise Design System

Este documento descreve a nova arquitetura visual do sistema WMS, inspirada no **Microsoft Dynamics 365 Finance & Operations**, focada em alta densidade de informação e produtividade técnica.

## 🎨 Design Tokens (Variáveis CSS)

As variáveis estão definidas no arquivo `src/index.css` e devem ser usadas em todo o projeto para garantir consistência.

| Variável | Valor | Aplicação |
| :--- | :--- | :--- |
| `--vp-primary` | `#FFD700` | Botões primários, ícones de status ativo, elementos selecionados. |
| `--vp-secondary` | `#1A1A1A` | Menu lateral (Sidebar), barra superior, cabeçalhos de página. |
| `--vp-bg-main` | `#FFFFFF` | Fundos de áreas de trabalho, tabelas e modais. |
| `--vp-bg-alt` | `#F8F9FA` | Diferenciação de seções, fundos de inputs read-only. |
| `--vp-text-label` | `#4F4F4F` | Rótulos de formulários (labels), textos secundários. |
| `--vp-text-data` | `#000000` | Dados dinâmicos, títulos e textos principais. |
| `--vp-border` | `#E0E0E0` | Bordas de inputs, divisores e grids. |

## 🏗️ Componentes Estruturais

### 1. Action Pane (Barra de Comandos)
Posicionada logo abaixo do título da página. Agrupa ações por contexto.
- **Botão Primário:** Fundo Amarelo, Texto Preto.
- **Botão Secundário:** Fundo Branco/Cinza, Texto Cinza Escuro.

### 2. FastTabs (Acordeões)
Usados para agrupar blocos de informações sem sobrecarregar a tela.
- Devem ser expansíveis.
- Títulos em negrito com ícone de seta à direita.

### 3. Data Grid (Tabela)
- **Altura da Linha:** Estritamente 40px.
- **Hover:** Amarelo com 5% de opacidade (`--vp-hover`).
- **Bordas:** 1px sólido cinza claro entre linhas.

## 📝 Regras de Formulários
- **Inputs:** Bordas quadradas (`radius: 2px`).
- **Labels:** Sempre em caixa alta (uppercase) e fonte menor (11px-12px) para economizar espaço vertical.
- **Densidade:** Priorize grids de 4 colunas em telas desktop para evitar rolagem excessiva.

## ⌨️ Tipografia
- **Fonte Principal:** `Inter` ou `Segoe UI`.
- **Aspecto:** Técnico, corporativo e limpo.

---
**Desenvolvido por Manus AI para Vertical Parts - 2026**
