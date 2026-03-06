import { get, set } from 'idb-keyval';
import { supabase } from './supabase';

type QueuedMutation = {
    id: string;
    table: string;
    action: 'insert' | 'update' | 'delete';
    payload: any;
    timestamp: number;
    attempts: number;      // Número de tentativas realizadas
    nextAttempt: number;   // Timestamp para a próxima tentativa (Backoff)
    status?: 'pending' | 'failed' | 'permanent_error';
    priority?: 'normal' | 'high';
};

const QUEUE_KEY = 'safeguard_offline_queue';

export const offlineQueue = {
    async enqueue(mutation: Omit<QueuedMutation, 'id' | 'timestamp' | 'attempts' | 'nextAttempt' | 'status'>) {
        const queue: QueuedMutation[] = (await get(QUEUE_KEY)) || [];
        const isHighPriority = mutation.priority === 'high';

        const newMutation: QueuedMutation = {
            ...mutation,
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            attempts: 0,
            nextAttempt: Date.now(),
            status: 'pending'
        };

        const newQueue = isHighPriority ? [newMutation, ...queue] : [...queue, newMutation];
        await set(QUEUE_KEY, newQueue);

        console.log(`[Offline Sync] Enfileirado para ${mutation.table} (Prioridade: ${mutation.priority})`);

        // Force immediate sync for high priority
        if (isHighPriority) {
            this.sync();
        } else {
            this.sync(); // Regular sync attempt
        }
    },

    async getQueue(): Promise<QueuedMutation[]> {
        return (await get(QUEUE_KEY)) || [];
    },

    async clearQueue() {
        await set(QUEUE_KEY, []);
    },

    async sync() {
        if (!navigator.onLine) return;

        const allQueue = await this.getQueue();
        const now = Date.now();

        // Filtra apenas itens prontos para tentativa (respeitando o Backoff)
        const readyItems = allQueue.filter(item =>
            (item.status !== 'permanent_error') && (now >= item.nextAttempt)
        ).sort((a, b) => {
            if (a.priority === 'high' && b.priority !== 'high') return -1;
            if (a.priority !== 'high' && b.priority === 'high') return 1;
            return 0;
        });

        if (readyItems.length === 0) return;

        console.log(`[Offline Sync] Processando ${readyItems.length} itens (Total em fila: ${allQueue.length})`);

        const results = await Promise.all(readyItems.map(async (item) => {
            try {
                let result;
                if (item.action === 'insert') {
                    result = await supabase.from(item.table).insert(item.payload);
                } else if (item.action === 'update') {
                    const { id, ...data } = item.payload;
                    result = await supabase.from(item.table).update(data).eq('id', id);
                } else if (item.action === 'delete') {
                    result = await supabase.from(item.table).delete().eq('id', item.payload.id);
                }

                if (result?.error) throw result.error;

                return { id: item.id, status: 'success' };
            } catch (err) {
                const newAttempts = item.attempts + 1;
                if (newAttempts >= 5) {
                    console.error(`[Offline Sync] ERRO_PERMANENTE no item ${item.id} após 5 tentativas.`);
                    return { id: item.id, status: 'permanent_error' };
                }

                // Cálculo de Backoff Exponencial: 2^attempts * 1000ms
                const delay = Math.pow(2, newAttempts) * 1000;
                return {
                    id: item.id,
                    status: 'failed',
                    attempts: newAttempts,
                    nextAttempt: Date.now() + delay
                };
            }
        }));

        // Atualizar a fila global
        const updatedQueue = allQueue.map(originalItem => {
            const result = results.find(r => r.id === originalItem.id);
            if (!result) return originalItem; // Permanece como está (não estava pronto)

            if (result.status === 'success') return null; // Será removido

            return {
                ...originalItem,
                attempts: result.attempts ?? originalItem.attempts,
                nextAttempt: result.nextAttempt ?? originalItem.nextAttempt,
                status: result.status as any
            };
        }).filter(Boolean) as QueuedMutation[];

        await set(QUEUE_KEY, updatedQueue);
    }
};

// Listen for network becoming available to process queue automatically
if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
        console.log('[Offline Sync] Conexão restabelecida. Ativando sincronização automática.');
        offlineQueue.sync();
    });
}

export type { QueuedMutation };

