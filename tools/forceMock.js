import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  console.log('Inserindo Setor...');
  await supabase.from('setores').insert({ id: 'Recebimento', nome: 'Recebimento' });

  console.log('Inserindo Endereco...');
  await supabase.from('enderecos').insert({
    id: 'R1_PP1_A01', rua: 'R1', porta_palete: 'PP1', nivel: 'A', posicao: '01', 
    setor_id: 'Recebimento', status: 'Disponível'
  });

  const { data: p } = await supabase.from('produtos').select('id, sku, descricao').limit(1).single();
  let prodId = p?.id;
  if (!prodId) {
    const { data: newP } = await supabase.from('produtos').insert({ sku: 'TESTE-01', descricao: 'PRD TESTE' }).select().single();
    prodId = newP.id;
  }

  const { data: t } = await supabase.from('tarefas').insert({ tipo: 'separacao', prioridade: 'Alta', status: 'pendente' }).select().single();

  const { error } = await supabase.from('itens_tarefa').insert({
    tarefa_id: t.id, produto_id: prodId, sku: 'TESTE-01', descricao: 'PRD TESTE',
    sequencia: 1, quantidade_esperada: 5, endereco_id: 'R1_PP1_A01'
  });

  if (error) console.error(error);
  else console.log('SUCESSO TAR.', t.id);
}
run();
