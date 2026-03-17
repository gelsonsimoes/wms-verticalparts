// Fonte única de verdade — re-exporta o cliente já inicializado em lib/supabaseClient.js
// NÃO crie um segundo createClient aqui. Dois clientes com o mesmo localStorage storage
// brigam pelo mesmo Web Lock de sessão causando:
// "AbortError: Lock broken by another request with the 'steal' option"
export { supabase } from '../lib/supabaseClient';
export { supabase as default } from '../lib/supabaseClient';
