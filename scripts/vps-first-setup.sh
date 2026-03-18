#!/bin/bash
# =============================================================
# WMS VerticalParts — Primeiro Setup do VPS
# Servidor: srv1473569 (72.61.37.129) — Ubuntu 24.04 LTS
# Executar como root: bash vps-first-setup.sh
# =============================================================
set -e

echo ""
echo "=================================================="
echo "  WMS VerticalParts — VPS First Setup"
echo "=================================================="
echo ""

# 1. Atualizar sistema
echo "🔄 Atualizando sistema..."
apt update && apt upgrade -y

# 2. Instalar Nginx e Certbot
echo "🌐 Instalando Nginx + Certbot..."
apt install -y nginx certbot python3-certbot-nginx ufw

# 3. Instalar PM2 globalmente (NVM já está instalado)
echo "⚙️  Instalando PM2..."
npm install -g pm2

# 4. Criar diretório de logs
echo "📁 Criando diretórios..."
mkdir -p /var/log/wms-api
mkdir -p /var/www

# 5. Clonar repositório
echo "📦 Clonando repositório..."
cd /var/www
if [ -d "wms-verticalparts" ]; then
  echo "Repositório já existe, atualizando..."
  cd wms-verticalparts && git pull origin main
else
  git clone https://github.com/gelsonsimoes/wms-verticalparts.git
  cd wms-verticalparts
fi

# 6. Instalar dependências
echo "📚 Instalando dependências de produção..."
npm ci --omit=dev

# 7. Criar .env (interativo)
echo ""
echo "=================================================="
echo "  Configure o arquivo .env"
echo "=================================================="
if [ ! -f ".env" ]; then
  cp .env.server.example .env
  echo ""
  echo "⚠️  Arquivo .env criado a partir do exemplo."
  echo "    Edite agora com suas chaves reais:"
  echo ""
  echo "    nano /var/www/wms-verticalparts/.env"
  echo ""
  read -p "Pressione ENTER após editar o .env para continuar..."
else
  echo "✅ .env já existe, mantendo."
fi

# 8. Configurar Nginx
echo "🌐 Configurando Nginx..."
cp nginx/wms-api.conf /etc/nginx/sites-available/wms-api
if [ ! -f /etc/nginx/sites-enabled/wms-api ]; then
  ln -s /etc/nginx/sites-available/wms-api /etc/nginx/sites-enabled/wms-api
fi
# Remover site default se existir
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# 9. Firewall
echo "🔒 Configurando firewall..."
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# 10. Iniciar servidor com PM2
echo "🚀 Iniciando servidor Express..."
pm2 start ecosystem.config.cjs --env production
pm2 save
pm2 startup | tail -1 | bash  # Executa o comando de startup automático

echo ""
echo "=================================================="
echo "  ✅ Setup concluído!"
echo "=================================================="
echo ""
echo "Próximos passos:"
echo "  1. Configurar DNS: api.wmsverticalparts.com.br → 72.61.37.129"
echo "  2. Aguardar propagação DNS (pode levar até 1h)"
echo "  3. Rodar SSL: certbot --nginx -d api.wmsverticalparts.com.br"
echo "  4. Adicionar VPS_SSH_PRIVATE_KEY nos GitHub Secrets"
echo ""
echo "Checar status: pm2 status"
echo "Ver logs:      pm2 logs wms-api"
echo ""
