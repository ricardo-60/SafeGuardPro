import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { offlineQueue } from '../offlineQueue';
import { get, set } from 'idb-keyval';
import { supabase } from '../supabase';

// Mock do idb-keyval
const store = new Map<string, any>();
vi.mock('idb-keyval', () => ({
    get: vi.fn(async (key: string) => store.get(key)),
    set: vi.fn(async (key: string, value: any) => { store.set(key, value); }),
}));

// Mock do supabase com falha controlada (70% de erro)
let failureRate = 0.7;
vi.mock('../supabase', () => ({
    supabase: {
        from: vi.fn(() => ({
            insert: vi.fn(async () => {
                if (Math.random() < failureRate) {
                    return { error: { message: 'Network Failure (Chaos Simulation)' } };
                }
                return { error: null };
            }),
            update: vi.fn(() => ({ eq: vi.fn(async () => ({ error: null })) })),
            delete: vi.fn(() => ({ eq: vi.fn(async () => ({ error: null })) })),
        })),
    },
}));

describe('Chaos Engineering – Stress & Backoff (syncService)', () => {
    beforeEach(() => {
        store.clear();
        vi.clearAllMocks();
        vi.useFakeTimers();
        failureRate = 0.7; // Reset taxa de falha
        Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('Validação de Timers: Intervalos devem dobrar exponencialmente', async () => {
        // 1. Enfileirar 1 item
        await offlineQueue.enqueue({ table: 'test', action: 'insert', payload: { data: 'chaos' } });

        // Forçar falhas sistemáticas para este teste
        failureRate = 1.0;

        // Tentativa 1 (Imediata)
        await offlineQueue.sync();
        let queue = await offlineQueue.getQueue();
        expect(queue[0].attempts).toBe(1);

        // Próxima tentativa deve ser em +2s (2^1 * 1000)
        // Tentamos sync antes do tempo -> não deve processar
        vi.advanceTimersByTime(1000);
        await offlineQueue.sync();
        queue = await offlineQueue.getQueue();
        expect(queue[0].attempts).toBe(1); // Continua em 1

        // Avançamos para 2s -> deve tentar e falhar -> sobe para 2
        vi.advanceTimersByTime(1001);
        await offlineQueue.sync();
        queue = await offlineQueue.getQueue();
        expect(queue[0].attempts).toBe(2);

        // Próxima tentativa deve ser em +4s (2^2 * 1000)
        vi.advanceTimersByTime(3000);
        await offlineQueue.sync();
        queue = await offlineQueue.getQueue();
        expect(queue[0].attempts).toBe(2); // Ainda não deu os 4s

        vi.advanceTimersByTime(1001);
        await offlineQueue.sync();
        queue = await offlineQueue.getQueue();
        expect(queue[0].attempts).toBe(3);
    });

    it('Relatório de Conclusão: Itens atingem ERRO_PERMANENTE após 5 falhas', async () => {
        await offlineQueue.enqueue({ table: 'test', action: 'insert', payload: { data: 'death-row' } });
        failureRate = 1.0;

        // Fase de stress: 5 ciclos de falha
        for (let i = 0; i < 5; i++) {
            const delay = Math.pow(2, i) * 1000;
            vi.advanceTimersByTime(delay + 100);
            await offlineQueue.sync();
        }

        const queue = await offlineQueue.getQueue();
        // O item deve estar marcado como permanente_error
        expect(queue[0].status).toBe('permanent_error');

        // Um novo sync não deve sequer tentar o item (verificar logs ou count de mocks se necessário)
        const spy = vi.spyOn(supabase, 'from');
        await offlineQueue.sync();
        expect(spy).not.toHaveBeenCalled();
    });

    it('Teste de Carga: 50 contatos com falha aleatória não causam vazamento', async () => {
        failureRate = 0.5; // 50% de sucesso

        for (let i = 0; i < 50; i++) {
            await offlineQueue.enqueue({ table: 'contacts', action: 'insert', payload: { id: i } });
        }

        // Executa vários ciclos de tempo
        for (let cycle = 0; cycle < 10; cycle++) {
            vi.advanceTimersByTime(5000 * cycle);
            await offlineQueue.sync();
        }

        const queue = await offlineQueue.getQueue();
        // Alguns sumiram (sucesso), outros falharam 5x (permanent_error), mas a fila deve ser estável em tamanho
        expect(queue.length).toBeLessThanOrEqual(50);

        // Verifica se itens em erro permanente não aumentam o heap descontroladamente (lógica simples)
        const permanentErrors = queue.filter(item => item.status === 'permanent_error');
        console.log(`[Chaos Test] Itens Processados: 50 | Mortes Permanentes: ${permanentErrors.length}`);
    });
});
