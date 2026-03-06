/**
 * Testes Unitários – offlineQueue.ts
 * Testam o comportamento do enqueue, getQueue, clearQueue e sync.
 * Os testes mockam o `idb-keyval` e o `supabase` para correr sem ligação real.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Mocks ────────────────────────────────────────────────────────────────────

// Mock do idb-keyval: usa um Map em memória
const store = new Map<string, any>();

vi.mock('idb-keyval', () => ({
    get: vi.fn(async (key: string) => store.get(key)),
    set: vi.fn(async (key: string, value: any) => { store.set(key, value); }),
}));

// Mock do supabase
vi.mock('../supabase', () => ({
    supabase: {
        from: vi.fn(() => ({
            insert: vi.fn(() => Promise.resolve({ error: null })),
            update: vi.fn(() => ({ eq: vi.fn(() => Promise.resolve({ error: null })) })),
            delete: vi.fn(() => ({ eq: vi.fn(() => Promise.resolve({ error: null })) })),
        })),
    },
}));

// ─── Helper ───────────────────────────────────────────────────────────────────

// Importação dinâmica após configurar os mocks
async function getQueue() {
    const { offlineQueue } = await import('../offlineQueue');
    return offlineQueue;
}

// ─── Testes ───────────────────────────────────────────────────────────────────

describe('offlineQueue', () => {
    beforeEach(() => {
        store.clear();
        vi.clearAllMocks();
        // Forçar offline para que o enqueue não dispare o sync() imediato e limpe a fila durante os testes
        Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });
    });

    it('enqueue adiciona um item à fila com id e timestamp', async () => {
        const queue = await getQueue();
        await queue.enqueue({ table: 'vigilantes', action: 'insert', payload: { name: 'João' } });

        const items = await queue.getQueue();
        expect(items).toHaveLength(1);
        expect(items[0]).toMatchObject({
            table: 'vigilantes',
            action: 'insert',
            payload: { name: 'João' },
        });
        expect(items[0].id).toBeDefined();
        expect(items[0].timestamp).toBeTypeOf('number');
    });

    it('enqueue acumula múltiplos itens na fila', async () => {
        const queue = await getQueue();
        await queue.enqueue({ table: 'weapons', action: 'insert', payload: { type: 'Pistola' } });
        await queue.enqueue({ table: 'posts', action: 'delete', payload: { id: 5 } });

        const items = await queue.getQueue();
        expect(items).toHaveLength(2);
    });

    it('getQueue retorna array vazio quando não há itens', async () => {
        const queue = await getQueue();
        const items = await queue.getQueue();
        expect(items).toEqual([]);
    });

    it('clearQueue limpa todos os itens da fila', async () => {
        const queue = await getQueue();
        await queue.enqueue({ table: 'vehicles', action: 'insert', payload: { plate: 'AA-00-BB' } });
        await queue.clearQueue();

        const items = await queue.getQueue();
        expect(items).toHaveLength(0);
    });

    it('sync não executa nada quando a fila está vazia', async () => {
        const { supabase } = await import('../supabase');
        const queue = await getQueue();

        // Garantir fila vazia
        await queue.clearQueue();
        await queue.sync();

        expect(supabase.from).not.toHaveBeenCalled();
    });
});
