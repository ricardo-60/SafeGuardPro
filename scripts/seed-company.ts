import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''
);

async function seedCompany() {
    console.log("A criar a Empresa Zero...");
    const { data: company, error: companyErr } = await supabase
        .from('companies')
        .insert({
            name: 'Empresa Matriz - SafeGuard Pro',
            nif: '000000000',
            address: 'Sede Virtual'
        })
        .select()
        .single();

    if (companyErr) {
        console.error("Erro ao criar empresa:", companyErr);
        return;
    }
    console.log("Empresa criada com ID:", company.id);

    // Get Admin user id
    const { data: usersData } = await supabase.auth.admin.listUsers();
    const adminUser = usersData.users.find(u => u.email === 'admin@safeguard.com');
    if (!adminUser) {
        console.error("Admin user not found. Unable to create user_role.");
        return;
    }

    console.log("A criar user_role para", adminUser.email);
    const { data: role, error: roleErr } = await supabase
        .from('user_roles')
        .insert({
            user_id: adminUser.id,
            company_id: company.id,
            role: 'owner'
        })
        .select()
        .single();

    if (roleErr) {
        console.error("Erro ao inserir role:", roleErr);
    } else {
        console.log("Sucesso! Role criado:", role);
    }
}

seedCompany();
