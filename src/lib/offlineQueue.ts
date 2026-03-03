import { get, set } from 'idb-keyval';
import { supabase } from './supabase';

type QueuedMutation = {
    id: string;
    table: string;
    action: 'insert' | 'update' | 'delete';
    payload: any;
    timestamp: number;
};

const QUEUE_KEY = 'safeguard_offline_queue';

export const offlineQueue = {
    async enqueue(mutation: Omit<QueuedMutation, 'id' | 'timestamp'>) {
        const queue: QueuedMutation[] = (await get(QUEUE_KEY)) || [];
        const newMutation: QueuedMutation = {
            ...mutation,
            id: crypto.randomUUID(),
            timestamp: Date.now(),
        };

        await set(QUEUE_KEY, [...queue, newMutation]);
        console.log(`[Offline Sync] Enfileirado para ${mutation.table} (${mutation.action})`);

        // Attempt sync immediately in case we just had a blip
        this.sync();
    },

    async getQueue(): Promise<QueuedMutation[]> {
        return (await get(QUEUE_KEY)) || [];
    },

    async clearQueue() {
        await set(QUEUE_KEY, []);
    },

    async sync() {
        if (!navigator.onLine) return; // Prevent loop if strictly offline

        const queue = await this.getQueue();
        if (queue.length === 0) return;

        console.log(`[Offline Sync] Iniciando sincronização de ${queue.length} items pendentes...`);

        const failedItems: QueuedMutation[] = [];

        for (const item of queue) {
            try {
                let result;
                if (item.action === 'insert') {
                    result = await supabase.from(item.table).insert(item.payload);
                } else if (item.action === 'update') {
                    // Expects payload to have { id, ...data }
                    const { id, ...data } = item.payload;
                    result = await supabase.from(item.table).update(data).eq('id', id);
                } else if (item.action === 'delete') {
                    result = await supabase.from(item.table).delete().eq('id', item.payload.id);
                }

                if (result?.error) {
                    console.error(`[Offline Sync] Falha ao sincronizar item ${item.id}:`, result.error);
                    failedItems.push(item);
                } else {
                    console.log(`[Offline Sync] Item ${item.id} sincronizado com sucesso.`);
                }
            } catch (err) {
                console.error(`[Offline Sync] Erro fatal no item ${item.id}:`, err);
                failedItems.push(item);
            }
        }

        // Rewrite the queue with only items that failed (so we can retry later)
        await set(QUEUE_KEY, failedItems);
    }
};

// Listen for network becoming available to process queue automatically
if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
        console.log('[Offline Sync] Conexão restabelecida. Ativando sincronização automática.');
        offlineQueue.sync();
    });
}
