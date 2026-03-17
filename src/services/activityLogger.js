/**
 * activityLogger.js
 * Grava rastros de todas as operações CRUD no Supabase (activity_logs).
 * Fire-and-forget: nunca bloqueie a UI esperando este retorno.
 */
import { supabase } from './supabaseClient';

/**
 * @param {object} opts
 * @param {string} opts.userName     - Nome do operador (ex: "Gelson")
 * @param {string} opts.action       - CRIOU | ATUALIZOU | EXCLUIU | LOGIN | BLOQUEOU | DESBLOQUEOU | DIVIDIU | IMPORTOU
 * @param {string} opts.entity       - produto | cliente | empresa | armazém | veículo | rota | área | setor | lote
 * @param {string} [opts.entityId]   - ID do registro afetado
 * @param {string} [opts.entityName] - Nome legível do registro (ex: "VPER-PNT-AL-22D")
 * @param {string} opts.description  - Texto completo do evento
 * @param {object} [opts.details]    - Dados adicionais em JSON
 * @param {'INFO'|'WARNING'|'CRITICAL'} [opts.level]
 * @param {string} [opts.opId]       - Código da operação (ex: "PRODUTO_CRIADO")
 */
export function logActivity({
  userName,
  action,
  entity,
  entityId   = null,
  entityName = null,
  description,
  details    = null,
  level      = 'INFO',
  opId       = null,
}) {
  const record = {
    user_name:   userName  || 'SISTEMA',
    action,
    entity,
    entity_id:   entityId,
    entity_name: entityName,
    description,
    details,
    level,
    op_id: opId || `${String(entity).toUpperCase().replace(/\s/g,'_')}_${action.toUpperCase()}`,
  };

  // Fire-and-forget — não bloqueia a UI
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session?.user?.id) record.user_id = session.user.id;
    supabase.from('activity_logs').insert(record).then(({ error }) => {
      if (error) console.warn('[activityLogger] Falha ao gravar log:', error.message);
    });
  });
}
