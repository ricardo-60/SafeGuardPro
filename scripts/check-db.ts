import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''
);

async function checkDB() {
    console.log("Verificando a existência da tabela user_roles...");
    const { data: rolesData, error: rolesError } = await supabase.from('user_roles').select('*').limit(5);
    if (rolesError) {
        console.error("ERRO ao aceder user_roles:", rolesError.message);
    } else {
        console.log("Tabela user_roles acedida com sucesso. Exemplos:", rolesData);
    }

    console.log("Verificando o utilizador admin...");
    const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers();

    if (usersError) {
        console.error("Erro ao listar users:", usersError.message);
    } else {
        const admin = usersData.users.find(u => u.email === 'admin@safeguard.com');
        if (admin) {
            console.log("Admin encontrado:", admin.id, admin.email);
            const { data: adminRoleData } = await supabase.from('user_roles').select('*').eq('user_id', admin.id);
            console.log("Roles do admin:", adminRoleData);
        } else {
            console.log("Atenção: admin@safeguard.com não existe em Auth.");
        }
    }
}

checkDB();
