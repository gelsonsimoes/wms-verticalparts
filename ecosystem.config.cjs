// PM2 — Configuração de produção do servidor WMS VerticalParts
// Uso: pm2 start ecosystem.config.cjs
// Ref: https://pm2.keymetrics.io/docs/usage/application-declaration/

module.exports = {
  apps: [
    {
      name: 'wms-api',
      script: 'server/index.js',

      // Node.js ESM (o projeto usa "type": "module")
      interpreter: 'node',
      interpreter_args: '--experimental-vm-modules',

      // Instâncias e modo
      instances: 1,          // KVM 1 tem 1 vCPU — não usar cluster
      exec_mode: 'fork',

      // Reinício automático em caso de falha
      autorestart: true,
      watch: false,           // nunca watch em produção
      max_memory_restart: '512M',

      // Variáveis de ambiente (o .env é carregado pelo dotenv no código)
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },

      // Logs
      out_file: '/var/log/wms-api/out.log',
      error_file: '/var/log/wms-api/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,

      // Graceful shutdown
      kill_timeout: 5000,
      listen_timeout: 10000,
    },
  ],
};
