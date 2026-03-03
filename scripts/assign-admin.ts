import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function assign() {
    console.log('🚨 ATENÇÃO: ');
    console.log('A chave SUPABASE_SERVICE_ROLE_KEY no teu ficheiro .env é na verdade uma chave "anon" normal.');
    console.log('Devido a isto, este script TypeScript é VEDADO pelas políticas RLS (Row Level Security) do Supabase.\n');
    console.log('👉 PARA RESOLVER:');
    console.log('1. Abre o ficheiro scripts/assign-admin.sql');
    console.log('2. Copia o código SQL');
    console.log('3. Cola no SQL Editor do Supabase (https://supabase.com/dashboard/project/_/sql) e clica em Run.');
    console.log('Isso irá criar a empresa e associar-te como Admin de forma direta e contornar a segurança.');
}

assign();
