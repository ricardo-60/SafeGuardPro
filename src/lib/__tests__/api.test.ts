/**
 * Testes Unitários – api.ts (funções utilitárias)
 * Testa cachedGet e offlineMutation de forma isolada,
 * sem ligação real ao Supabase nem ao IndexedDB.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const idbStore = new Map<string, any>();

vi.mock('idb-keyval', () => ({
    get: vi.fn(async (key: string) => idbStore.get(key)),
    set: vi.fn(async (key: string, value: any) => { idbStore.set(key, value); }),
}));

// Mock do supabase – retorna dados por tabela
const mockSelect = vi.fn();
const mockFrom = vi.fn(() => ({ select: mockSelect }));

vi.mock('../supabase', () => ({
    supabase: { from: mockFrom },
}));

// Mock do offlineQueue
const mockEnqueue = vi.fn();
vi.mock('../offlineQueue', () => ({
    offlineQueue: { enqueue: mockEnqueue, sync: vi.fn() },
}));

// ─── Testes ───────────────────────────────────────────────────────────────────

describe('api – mapeamento contact ↔ phone (Vigilantes)', () => {
    beforeEach(() => {
        idbStore.clear();
        vi.clearAllMocks();
    });

    it('getVigilantes mapeia phone → contact corretamente', async () => {
        // Simular online
        Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });

        mockSelect.mockResolvedValueOnce({
            data: [
                { id: 1, name: 'Maria', bi_number: 'BI001', phone: '923456789', base_salary: 60000, status: 'active' },
            ],
            error: null,
        });

        // Importação dinâmica para respeitar os mocks
        const { api } = await import('../api');
        const result = await api.getVigilantes();

        expect(result).toHaveLength(1);
        expect(result[0].contact).toBe('923456789');
        // phone não deve aparecer em tipos públicos
        expect((result[0] as any).phone).toBeUndefined();
    });

    it('getVigilantes retorna cache quando offline', async () => {
        // Simular offline
        Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });

        // Pré-popular cache com dados
        const cached = [{ id: 2, name: 'Luís', bi_number: 'BI002', contact: '912345678', base_salary: 55000, status: 'active' }];
        idbStore.set('vigilantes_cache', cached);

        const { api } = await import('../api');
        const result = await api.getVigilantes();

        // Deve retornar o que está em cache
        expect(result).toEqual(cached);
        // Não deve ter chamado o Supabase
        expect(mockFrom).not.toHaveBeenCalled();
    });
});

describe('api – offlineMutation enfileira quando offline', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('createVigilante enfileira quando offline e retorna payload optimista', async () => {
        Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });

        const { api } = await import('../api');
        const payload = { name: 'Ana', bi_number: 'BI003', contact: '911111111', base_salary: 50000, status: 'active' as const };
        const result = await api.createVigilante(payload);

        // Deve ter enfileirado
        expect(mockEnqueue).toHaveBeenCalledOnce();
        // Deve retornar dados optimistas (não null)
        expect(result).not.toBeNull();
    });

    it('createTransaction enfileira quando offline', async () => {
        Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });

        const { api } = await import('../api');
        await api.createTransaction({
            type: 'income',
            category: 'Vendas',
            amount: 1000,
            date: '2025-01-01',
            description: 'Venda de serviços',
        });

        expect(mockEnqueue).toHaveBeenCalledOnce();
        expect(mockEnqueue).toHaveBeenCalledWith(
            expect.objectContaining({ table: 'transactions', action: 'insert' })
        );
    });
});

describe('api – getStats retorna contagens correctas', () => {
    it('retorna zeros quando supabase retorna null count', async () => {
        Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });

        mockFrom.mockReturnValue({
            select: vi.fn().mockResolvedValue({ count: null, error: null }),
        });

        const { api } = await import('../api');
        const stats = await api.getStats();

        expect(stats.totalPosts).toBe(0);
        expect(stats.totalVigilantes).toBe(0);
        expect(Array.isArray(stats.posts)).toBe(true);
        expect(Array.isArray(stats.occurrences)).toBe(true);
    });
});
