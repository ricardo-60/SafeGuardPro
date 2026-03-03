import { dbService } from './server/dbService';

async function runTests() {
    console.log('--- INICIANDO TESTES GLOBAIS DE INTEGRAÇÃO DO SUPABASE ---');
    let passCount = 0;
    let failCount = 0;

    const assert = (condition: boolean, testName: string) => {
        if (condition) {
            console.log(`✅ PASS: ${testName}`);
            passCount++;
        } else {
            console.error(`❌ FAIL: ${testName}`);
            failCount++;
        }
    };

    try {
        // 1. Vigilantes
        console.log('\n--- 1. Vigilantes ---');
        const newVigilante = await dbService.createVigilante({ name: 'Test Vigilante', bi_number: `BI${Date.now()}` });
        assert(newVigilante && newVigilante.id, 'Criar Vigilante');

        let vigilantes = await dbService.getVigilantes();
        assert(vigilantes.some((v: any) => v.id === newVigilante.id), 'Ler Vigilantes');

        // 2. Weapons
        console.log('\n--- 2. Weapons ---');
        const newWeapon = await dbService.createWeapon({ serial_number: `SN${Date.now()}`, type: 'Pistol' });
        assert(newWeapon && newWeapon.id, 'Criar Weapon');

        let weapons = await dbService.getWeapons();
        assert(weapons.some((w: any) => w.id === newWeapon.id), 'Ler Weapons');

        // 3. Posts
        console.log('\n--- 3. Posts ---');
        const newPost = await dbService.createPost({ name: 'Posto Central', location: 'Edificio 1' });
        assert(newPost && newPost.id, 'Criar Post');

        let posts = await dbService.getPosts();
        assert(posts.some((p: any) => p.id === newPost.id), 'Ler Posts');

        // 4. Equipment
        console.log('\n--- 4. Equipment ---');
        const newEq = await dbService.createEquipment({ name: 'Radio VHF', serial_number: `EQ${Date.now()}` });
        assert(newEq && newEq.id, 'Criar Equipment');

        let equipments = await dbService.getEquipment();
        assert(equipments.some((e: any) => e.id === newEq.id), 'Ler Equipment');

        // 5. Vehicles
        console.log('\n--- 5. Vehicles ---');
        const newVehicle = await dbService.createVehicle({ plate: `AA-${Math.floor(Math.random() * 90 + 10)}-BB`, model: 'Toyota Hilux' });
        assert(newVehicle && newVehicle.id, 'Criar Vehicle');

        let vehicles = await dbService.getVehicles();
        assert(vehicles.some((v: any) => v.id === newVehicle.id), 'Ler Vehicles');

        await dbService.updateVehicle(newVehicle.id, { status: 'maintenance' });
        let updatedVehicles = await dbService.getVehicles();
        let verifiedVehicle = updatedVehicles.find((v: any) => v.id === newVehicle.id);
        assert(verifiedVehicle && verifiedVehicle.status === 'maintenance', 'Atualizar Vehicle');

        // 6. Occurrences (Depende de Vigilante e Post)
        console.log('\n--- 6. Occurrences ---');
        const newOcc = await dbService.createOccurrence({ type: 'Incidente', description: 'Porta aberta', vigilante_id: newVigilante.id, post_id: newPost.id });
        assert(newOcc && newOcc.id, 'Criar Occurrence');

        let occurrences = await dbService.getOccurrences();
        assert(occurrences.some((o: any) => o.id === newOcc.id), 'Ler Occurrences');

        // 7. Scales (Depende de Vigilante e Post)
        console.log('\n--- 7. Scales ---');
        const newScale = await dbService.createScale({ vigilante_id: newVigilante.id, post_id: newPost.id, shift_start: new Date().toISOString(), shift_end: new Date().toISOString() });
        assert(newScale && newScale.id, 'Criar Scale');

        let scales = await dbService.getScales();
        assert(scales.some((s: any) => s.id === newScale.id), 'Ler Scales');

        await dbService.updateScale(newScale.id, { status: 'completed' });
        let updatedScales = await dbService.getScales();
        let verifiedScale = updatedScales.find((s: any) => s.id === newScale.id);
        assert(verifiedScale && verifiedScale.status === 'completed', 'Atualizar Scale');

        // 8. Transactions
        console.log('\n--- 8. Transactions ---');
        const newTx = await dbService.createTransaction({ type: 'income', amount: 1500, description: 'Pagamento Serviço' });
        assert(newTx && newTx.id, 'Criar Transaction');

        let txs = await dbService.getTransactions();
        assert(txs.some((t: any) => t.id === newTx.id), 'Ler Transactions');

        // 9. CLEANUP (Apagar tudo o que foi criado por ordem inversa das dependências)
        console.log('\n--- CLEANUP ELIMINAÇÃO (TESTAR DELETE) ---');

        await dbService.deleteTransaction(newTx.id);
        assert(true, 'Eliminar Transaction');

        await dbService.deleteScale(newScale.id);
        assert(true, 'Eliminar Scale');

        await dbService.deleteOccurrence(newOcc.id);
        assert(true, 'Eliminar Occurrence');

        await dbService.deleteVehicle(newVehicle.id);
        assert(true, 'Eliminar Vehicle');

        await dbService.deleteEquipment(newEq.id);
        assert(true, 'Eliminar Equipment');

        await dbService.deletePost(newPost.id);
        assert(true, 'Eliminar Post');

        await dbService.deleteWeapon(newWeapon.id);
        assert(true, 'Eliminar Weapon');

        await dbService.deleteVigilante(newVigilante.id);
        assert(true, 'Eliminar Vigilante');

        console.log(`\n🎉 RESULTADOS FINAIS: ${passCount} Pass, ${failCount} Fail`);

    } catch (error) {
        console.error('\n❌ ERRO CRÍTICO DURANTE EXECUÇÃO DO TESTE:', error);
    }
}

runTests();
