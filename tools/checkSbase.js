import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: p } = await supabase.from('produtos').select('*').limit(1);
  const { data: e } = await supabase.from('enderecos').select('*').limit(1);
  console.log('Produtos:', p);
  console.log('Endereços:', e);
}
run();
