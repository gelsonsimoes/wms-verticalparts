import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  try {
    // 1. Inserir endereço
    const { data: endData, error: eErr } = await supabase.from('enderecos').insert({
        id: 'R1_PP1_A01',
        rua: 'R1',
        porta_palete: 'PP1',
        nivel: 'A',
        posicao: '01',
        tipo_local: 'Porta Palete',
        status: 'Disponível',
        capacidade_kg: 1000,
        setor_id: 'Recebimento'
    }).select().single();
    
    // Suprime erro se endereço já existir
    const enderecoId = endData ? endData.id : 'R1_PP1_A01';

    // 2. Achar um produto para a separação
    const { data: prod } = await supabase.from('produtos').select('id, sku, descricao').limit(1).single();

    if (!prod) {
        console.error('Sem produto na base.');
        return;
    }

    // 3. Criar a Tarefa de Separação
    const { data: tarefa, error: tErr } = await supabase
      .from('tarefas')
      .insert({
        tipo: 'separacao',
        prioridade: 'Alta',
        status: 'pendente'
      })
      .select()
      .single();

    if (tErr) throw tErr;

    // 4. Criar o Item da Tarefa associando ao endereço recém criado
    const { error: iErr } = await supabase
      .from('itens_tarefa')
      .insert([
        {
          tarefa_id: tarefa.id,
          produto_id: prod.id,
          sku: prod.sku,
          descricao: prod.descricao,
          sequencia: 1,
          quantidade_esperada: 5,
          endereco_id: enderecoId
        }
      ]);

    if (iErr) throw iErr;
    console.log('Sucesso! Uma tarefa de SEPARAÇÃO (PICKING) gerada! ID:', tarefa.id);
  } catch(e) {
    console.error('Erro na geração:', e);
  }
}
run();
