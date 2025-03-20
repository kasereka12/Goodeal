import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load environment variables from .env file
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = Object.fromEntries(
  envContent
    .split('\n')
    .filter(line => line.trim() && !line.startsWith('#'))
    .map(line => line.split('=').map(part => part.trim()))
);

// Initialize Supabase client
const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false
  }
});

async function signInAsAdmin() {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'contact@myfirst-property.com',
      password: '123456*'
    });

    if (error) throw error;
    return data.session;
  } catch (error) {
    console.error('Error signing in as admin:', error);
    throw error;
  }
}

async function runMigrations() {
  try {
    // Sign in as admin first
    const session = await signInAsAdmin();
    
    // Update client with admin session
    supabase.auth.setSession(session);

    // Get all SQL files from migrations directory
    const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    // Run each migration
    for (const file of files) {
      console.log(`Running migration: ${file}`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      
      try {
        // Execute the migration SQL directly
        const { error: sqlError } = await supabase.rpc('exec_sql', { sql });
        if (sqlError) throw sqlError;
        
        console.log(`Successfully ran migration: ${file}`);
      } catch (error) {
        if (error.message?.includes('relation "_migrations" does not exist')) {
          // First migration, continue
          continue;
        }
        console.error(`Error running migration ${file}:`, error);
        process.exit(1);
      }
    }

    console.log('All migrations completed successfully');
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

runMigrations();