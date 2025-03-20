import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Les variables d\'environnement Supabase ne sont pas définies. Veuillez cliquer sur le bouton "Connect to Supabase" en haut à droite.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase
      .from('cities')
      .select('*')
      .limit(1);

    if (error) throw error;

    return {
      success: true,
      message: 'Connexion à Supabase réussie !',
      data
    };
  } catch (error: any) {
    console.error('Erreur de connexion Supabase:', error);
    throw new Error(`Erreur de connexion: ${error.message}`);
  }
}