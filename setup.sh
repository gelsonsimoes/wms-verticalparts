#!/usr/bin/env bash
# 
# WMS VerticalParts - Setup Supabase Integration
# Execute este script para configurar tudo automaticamente (Linux/Mac)
#

set -e

echo "🚀 Iniciando setup Supabase WMS VerticalParts..."
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 1. Verificar Docker
echo -e "${BLUE}📦 Verificando dependências...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}⚠️  Docker não encontrado. Você precisará para rodar Supabase localmente.${NC}"
    echo "   Instale em: https://docker.com"
else
    echo -e "${GREEN}✅ Docker instalado${NC}"
fi

# 2. Verificar Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js não encontrado${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js $(node -v)${NC}"

# 3. Instalar dependências npm
echo ""
echo -e "${BLUE}📚 Instalando dependências npm...${NC}"
npm install
echo -e "${GREEN}✅ Dependências instaladas${NC}"

# 4. Criar .env.local
echo ""
echo -e "${BLUE}🔐 Configurando variáveis de ambiente...${NC}"
if [ ! -f .env.local ]; then
    cp .env.example .env.local
    echo -e "${YELLOW}⚠️  Arquivo .env.local criado. Edite com suas credenciais Supabase!${NC}"
    echo ""
    echo -e "${BLUE}   Instruções:${NC}"
    echo "   1. Acesse: https://supabase.com/dashboard/project/clakkpyzinuheubkhdep"
    echo "   2. Settings > API"
    echo "   3. Copie Project URL → VITE_SUPABASE_URL"
    echo "   4. Copie Anon Public → VITE_SUPABASE_ANON_KEY"
    echo ""
else
    echo -e "${GREEN}✅ .env.local já existe${NC}"
fi

# 5. Inicializar Supabase (se Docker rodando)
echo ""
echo -e "${BLUE}🗄️  Configurando Supabase local...${NC}"
if command -v supabase &> /dev/null; then
    if [ ! -d supabase ]; then
        echo "Criando diretório supabase..."
        supabase init
    fi
    echo -e "${GREEN}✅ Supabase configurado${NC}"
else
    echo -e "${YELLOW}⚠️  Supabase CLI não instalado (opcional)${NC}"
    echo "   Para instalá-lo: npm install -g supabase"
fi

# 6. Criar estrutura de pastas
echo ""
echo -e "${BLUE}📁 Criando estrutura de projeto...${NC}"
mkdir -p src/lib
mkdir -p src/hooks
mkdir -p .github/workflows
echo -e "${GREEN}✅ Diretórios criados${NC}"

# 7. Resumo final
echo ""
echo -e "${GREEN}════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✨ Setup Completo!${NC}"
echo -e "${GREEN}════════════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}🎯 Próximos passos:${NC}"
echo ""
echo "1. Editar .env.local com credenciais Supabase"
echo ""
echo "2. Iniciar servidor local:"
echo -e "   ${YELLOW}npm run dev${NC}"
echo ""
echo "3. Configurar GitHub Secrets:"
echo -e "   ${YELLOW}https://github.com/gelsonsimoes/wms-verticalparts/settings/secrets/actions${NC}"
echo ""
echo "4. Adicionar 3 secrets:"
echo "   • SUPABASE_ACCESS_TOKEN"
echo "   • SUPABASE_PROJECT_ID = clakkpyzinuheubkhdep"
echo "   • SUPABASE_DB_PASSWORD"
echo ""
echo "5. Ler documentação:"
echo -e "   ${YELLOW}SETUP.md${NC} - Configuração passo a passo"
echo -e "   ${YELLOW}SYNC_GUIDE.md${NC} - Web + Mobile sincronização"
echo -e "   ${YELLOW}IMPLEMENTATION_ROADMAP.md${NC} - Plano de desenvolvimento"
echo ""
echo -e "${BLUE}📞 URLs Importantes:${NC}"
echo "   Supabase Dashboard: https://supabase.com/dashboard/project/clakkpyzinuheubkhdep"
echo "   GitHub Repo: https://github.com/gelsonsimoes/wms-verticalparts"
echo ""
echo -e "${GREEN}✅ Tudo pronto para começar! 🚀${NC}"
