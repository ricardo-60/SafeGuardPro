import { dbService } from './server/dbService';

async function seedRealData() {
    console.log('--- INICIANDO INJEÇÃO DE DADOS DE DEMONSTRAÇÃO GLOBAIS ---');

    try {
        // 1. Vigilantes
        console.log('A criar Vigilantes...');
        const v1 = await dbService.createVigilante({ name: 'Carlos Santos', bi_number: '12345678' });
        const v2 = await dbService.createVigilante({ name: 'Miguel Oliveira', bi_number: '87654321' });
        const v3 = await dbService.createVigilante({ name: 'Joana Silva', bi_number: '11223344' });

        // 2. Weapons
        console.log('A criar Armas e Munições...');
        await dbService.createWeapon({ serial_number: 'GLOCK-19-XP1', type: 'Pistola 9mm', status: 'available' });
        await dbService.createWeapon({ serial_number: 'WALT-PPK-007', type: 'Pistola 7.65mm', status: 'maintenance' });
        await dbService.createWeapon({ serial_number: 'MOSS-500-S1', type: 'Caçadeira', status: 'in_use' });

        // 3. Posts
        console.log('A criar Postos de Trabalho...');
        const p1 = await dbService.createPost({ name: 'Sede Principal - Lisboa', client_name: 'TechCorp SA', address: 'Avenida da Liberdade', vigilantes_needed: 2 });
        const p2 = await dbService.createPost({ name: 'Armazém Logístico - Porto', client_name: 'Logistix', address: 'Zona Industrial da Maia', vigilantes_needed: 4 });

        // 4. Equipment
        console.log('A criar Equipamentos...');
        await dbService.createEquipment({ name: 'Rádio Motorola VHF', serial_number: 'RAD-001', status: 'available' });
        await dbService.createEquipment({ name: 'Colete Balístico Nível III', serial_number: 'COL-102', status: 'in_use' });
        await dbService.createEquipment({ name: 'Lanterna Tática LED', serial_number: 'LAN-300', status: 'available' });

        // 5. Vehicles
        console.log('A criar Viaturas...');
        await dbService.createVehicle({ plate: 'AB-12-CD', model: 'Dacia Duster', status: 'available' });
        await dbService.createVehicle({ plate: 'XX-99-YY', model: 'Toyota Hilux Extra Cab', status: 'maintenance' });

        // 6. Occurrences (Depende de Vigilante e Post)
        console.log('A criar Ocorrências...');
        if (v1?.id && p1?.id) {
            await dbService.createOccurrence({ type: 'Intrusão', description: 'Porta das traseiras forçada durante as rondas noturnas. Foi acionada a PSP.', vigilante_id: v1.id, post_id: p1.id });
        }
        if (v2?.id && p2?.id) {
            await dbService.createOccurrence({ type: 'Alarme Falso', description: 'Gato detetado no armazém disparou o sensor volumétrico da zona 3.', vigilante_id: v2.id, post_id: p2.id });
        }

        // 7. Scales (Depende de Vigilante e Post)
        console.log('A criar Escalas de Trabalho (Rondas)...');
        const today = new Date();
        // Horário de agora
        if (v1?.id && p1?.id) {
            await dbService.createScale({ vigilante_id: v1.id, post_id: p1.id, shift_start: new Date(today.setHours(8, 0, 0)).toISOString(), shift_end: new Date(today.setHours(16, 0, 0)).toISOString(), status: 'scheduled' });
        }
        // Turno Noturno
        if (v3?.id && p2?.id) {
            await dbService.createScale({ vigilante_id: v3.id, post_id: p2.id, shift_start: new Date(today.setHours(23, 0, 0)).toISOString(), shift_end: new Date(today.setHours(7, 0, 0)).toISOString(), status: 'scheduled' });
        }

        // 8. Transactions
        console.log('A criar Transações Financeiras...');
        await dbService.createTransaction({ type: 'income', amount: 5400.00, description: 'Fatura Mensal Sede TechCorp SA' });
        await dbService.createTransaction({ type: 'expense', amount: 350.50, description: 'Manutenção Viaturas (Pneus Toyota)' });
        await dbService.createTransaction({ type: 'expense', amount: 1540.00, description: 'Compra Fardamentos e Coletes' });

        console.log('\n✅ DADOS INJETADOS COM SUCESSO! AS INFORMAÇÕES ESTÃO GRAVADAS NAS TABELAS E DISPONÍVEIS NA VERCEL!');

    } catch (error) {
        console.error('\n❌ ERRO CRÍTICO DURANTE EXECUÇÃO DA INJEÇÃO:', error);
    }
}

seedRealData();
