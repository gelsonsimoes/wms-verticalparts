import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data: p } = await supabase.from('produtos').select('id, sku, descricao').limit(1).single();

  const { data: t } = await supabase.from('tarefas').insert({ tipo: 'separacao', prioridade: 'Urgente', status: 'pendente' }).select().single();

  const { error } = await supabase.from('itens_tarefa').insert({
    tarefa_id: t.id, produto_id: p.id, sku: p.sku, descricao: p.descricao,
    sequencia: 1, quantidade_esperada: 10, endereco_id: 'PP1_A01'
  });

  if (error) console.error("Erro interno:", error);
  else console.log('Sucesso! Tarefa de SEPARAÇÃO (PICKING) gerada! ID:', t.id);
}
run();
