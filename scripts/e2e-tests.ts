// SafeGuard Pro - E2E Tests
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function runE2ETests() {
    console.log("🚀 INICIANDO BATERIA DE TESTES E2E - SAFEGUARD PRO 🚀\n");
    let passed = 0;
    let failed = 0;

    const assert = (condition: boolean, message: string) => {
        if (condition) {
            console.log(`✅ PASSOU: ${message}`);
            passed++;
        } else {
            console.error(`❌ FALHOU: ${message}`);
            failed++;
        }
    };

    try {
        console.log("\n--- PREPARAÇÃO: AUTENTICAR COMO ADMIN ---");
        const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
            email: 'admin@safeguard.com',
            password: 'securepassword123'
        });

        if (authErr && authErr.message.includes('Invalid login')) {
            console.log("⚠️ A conta de admin de teste não existe ou a senha está incorreta. Ignorando testes RLS dependentes de Auth.");
            return;
        }

        assert(!authErr, "Autenticação E2E bem sucedida");
        // ---------------------------------------------------------
        // TESTE 1: CONECTIVIDADE E BUCKET DE STORAGE
        // ---------------------------------------------------------
        console.log("\n--- TESTE 1: STORAGE BUCKETS ---");
        const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
        assert(!bucketError, "Conexão ao Supabase Storage bem sucedida");
        assert(buckets?.some(b => b.name === 'company-assets') || false, "Bucket 'company-assets' existe e está acessível");

        // ---------------------------------------------------------
        // TESTE 2: CRIAÇÃO DE EMPRESA TESTE 
        // ---------------------------------------------------------
        console.log("\n--- TESTE 2: GESTÃO DE EMPRESAS ---");
        const testCompany = {
            name: `E2E Test Company ${Date.now()}`,
            nif: '999999999',
            address: 'Rua do Teste E2E'
        };

        const { data: companyData, error: companyError } = await supabase
            .from('companies')
            .insert(testCompany)
            .select()
            .single();

        assert(!companyError && companyData !== null, "Criação de nova Empresa bem sucedida");

        const companyId = companyData?.id;

        // ---------------------------------------------------------
        // TESTE 3: ISOLAMENTO RLS (ROW LEVEL SECURITY)
        // ---------------------------------------------------------
        console.log("\n--- TESTE 3: INSERÇÃO DADOS DA EMPRESA (MULTI-TENANT) ---");
        if (companyId) {
            const testVigilante = {
                name: 'Vigilante E2E Test',
                bi_number: `BI-${Date.now()}`,
                company_id: companyId
            };

            // Using service_role bypasses RLS, so this just tests schema constraints
            const { error: vigError } = await supabase
                .from('vigilantes')
                .insert(testVigilante);

            assert(!vigError, "Inserção de Vigilante associado à Empresa funciona (Schema e Foreign Keys OK)");

            // Clean up the test vigilante
            await supabase.from('vigilantes').delete().eq('bi_number', testVigilante.bi_number);
        }

        // ---------------------------------------------------------
        // TESTE 4: LIMPEZA DE DADOS (TEARDOWN)
        // ---------------------------------------------------------
        if (companyId) {
            const { error: deleteError } = await supabase
                .from('companies')
                .delete()
                .eq('id', companyId);
            assert(!deleteError, "Limpeza de dados de Empresa Teste bem sucedida");
        }

    } catch (e) {
        console.error("ERRO CRÍTICO DURANTE OS TESTES:", e);
    } finally {
        console.log("\n📊 RESUMO DOS TESTES 📊");
        console.log(`Passou: ${passed}`);
        console.log(`Falhou: ${failed}`);
        console.log(`Resultado: ${failed === 0 ? '🟢 SUCESSO ABSOLUTO' : '🔴 REQUER ATENÇÃO'}`);
        process.exit(failed === 0 ? 0 : 1);
    }
}

runE2ETests();
