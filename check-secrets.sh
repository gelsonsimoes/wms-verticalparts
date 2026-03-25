#!/bin/bash
# Script para verificar secrets no repositório
# Uso: ./check-secrets.sh

echo "🔐 Verificando histórico por secrets..."

SECRETS_FOUND=0

# Padrões de secrets
declare -a PATTERNS=(
    "sk-ant-api03"
    "sk-ant-"
    "ghp_"
    "supabase.*[a-zA-Z0-9_-]{40,}"
)

for pattern in "${PATTERNS[@]}"; do
    echo "  Procurando: $pattern"
    if git log -p --all | grep -i "$pattern" | grep -vE "(\.example|placeholder|SEU_TOKEN|COLOQUE_SUA)"; then
        echo "  ❌ Encontrado: $pattern"
        SECRETS_FOUND=1
    fi
done

if [ $SECRETS_FOUND -eq 1 ]; then
    echo ""
    echo "❌ Secrets encontrados no histórico!"
    echo ""
    echo "Para remover, use:"
    echo "  npm install -g bfg"
    echo "  bfg --replace-text secrets.txt --no-blob-protection"
    exit 1
else
    echo ""
    echo "✅ Nenhum secret detectado no histórico"
    exit 0
fi
