import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL || '',
    process.env.VITE_SUPABASE_ANON_KEY || ''
);

async function seedAdmin() {
    console.log('A tentar registar utilizador Administrador usando o Cliente Pub...');
    try {
        const { data, error } = await supabase.auth.signUp({
            email: 'admin@safeguard.com',
            password: 'admin123',
            options: {
                data: {
                    name: 'Administrador Central',
                }
            }
        });

        if (error) {
            console.error('❌ Erro de Registo:', error.message);
            // Tentar fazer signIn para ver se ja existe
            if (error.message.includes('already registered')) {
                console.log('ℹ️ Já existe. Tentando login normal...');
                const { data: signData, error: signErr } = await supabase.auth.signInWithPassword({
                    email: 'admin@safeguard.com',
                    password: 'admin123',
                });
                if (signErr) console.error('Erro de login:', signErr);
                else console.log('Login efetuado com sucesso:', signData.user?.email);
            }
        } else {
            console.log('✅ Sucesso! Utilizador registado:', data.user?.email);
        }
    } catch (err: any) {
        console.error('❌ Erro inesperado:', err);
    }
}

seedAdmin();
