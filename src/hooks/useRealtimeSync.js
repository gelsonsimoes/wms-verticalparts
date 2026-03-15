/**
 * Hook customizado para sincronização Realtime com Supabase
 * Usa-se assim: const { data, loading, error } = useRealtimeSync('tasks', { warehouse_id: warehouseId })
 */

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

export const useRealtimeSync = (tableName, filterOptions = {}, options = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { retryAttempts = 3, retryDelay = 1000 } = options;

  const fetchData = useCallback(async (retryCount = 0) => {
    try {
      let query = supabase.from(tableName).select('*');

      // Aplicar filtros
      Object.entries(filterOptions).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          query = query.eq(key, value);
        }
      });

      const { data: initialData, error: fetchError } = await query;

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      setData(initialData || []);
      setError(null);
      setLoading(false);
    } catch (err) {
      console.error(`Error fetching ${tableName}:`, err);

      if (retryCount < retryAttempts) {
        setTimeout(() => {
          fetchData(retryCount + 1);
        }, retryDelay * Math.pow(2, retryCount)); // Exponential backoff
      } else {
        setError(err.message);
        setLoading(false);
      }
    }
  }, [tableName, filterOptions, retryAttempts, retryDelay]);

  useEffect(() => {
    fetchData();

    // Subscribe to realtime changes
    const subscription = supabase
      .from(tableName)
      .on('*', (payload) => {
        console.log(`[Realtime] ${tableName} update:`, payload.eventType, payload);

        // Verificar se passa nos filtros
        const passesFilter = Object.entries(filterOptions).every(
          ([key, value]) => value === null || value === undefined || payload.new?.[key] === value || payload.old?.[key] === value
        );

        if (!passesFilter) return;

        switch (payload.eventType) {
          case 'INSERT':
            setData((prev) => [payload.new, ...prev]);
            break;

          case 'UPDATE':
            setData((prev) =>
              prev.map((item) =>
                item.id === payload.new.id ? payload.new : item
              )
            );
            break;

          case 'DELETE':
            setData((prev) =>
              prev.filter((item) => item.id !== payload.old.id)
            );
            break;

          default:
            break;
        }
      })
      .subscribe((status) => {
        if (status === 'CLOSED') {
          console.warn(`Realtime subscription closed for ${tableName}`);
        }
      });

    return () => {
      supabase.removeSubscription(subscription);
    };
  }, [tableName, filterOptions, fetchData]);

  return { data, loading, error, refetch: fetchData };
};

/**
 * Hook para sync offline-first (mobile)
 * Enfileira ações localmente se offline, sincroniza quando online
 */
export const useOfflineSync = (tableName) => {
  const [pending, setPending] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const addToPending = useCallback(
    (action) => {
      const newAction = {
        id: crypto.getRandomUUID(),
        timestamp: Date.now(),
        ...action,
      };
      setPending((prev) => [...prev, newAction]);
      console.log(`[Sync Queue] Added to pending:`, newAction);
      return newAction.id;
    },
    []
  );

  const processPending = useCallback(async () => {
    if (!isOnline || pending.length === 0) return;

    console.log(`[Sync Queue] Processing ${pending.length} pending actions...`);

    for (const action of pending) {
      try {
        const { record, operation } = action;

        let query = supabase.from(tableName);

        if (operation === 'INSERT') {
          await query.insert([record]);
        } else if (operation === 'UPDATE') {
          await query.update(record).eq('id', record.id);
        } else if (operation === 'DELETE') {
          await query.delete().eq('id', record.id);
        }

        setPending((prev) =>
          prev.filter((item) => item.id !== action.id)
        );
        console.log(`[Sync Queue] ✅ Synced:`, action.id);
      } catch (err) {
        console.error(`[Sync Queue] ❌ Failed:`, action.id, err);
        break; // Para na primeira falha
      }
    }
  }, [isOnline, pending, tableName]);

  useEffect(() => {
    if (isOnline && pending.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      processPending();
    }
  }, [isOnline, processPending]);

  return {
    pending,
    isOnline,
    addToPending,
    processPending,
  };
};

/**
 * Hook para monitorar status de sincronização
 */
export const useSyncStatus = () => {
  const [syncStatus, setSyncStatus] = useState({
    web: 'idle',
    mobile: 'idle',
    lastSync: null,
    pendingItems: 0,
  });

  const updateSyncStatus = useCallback((status) => {
    setSyncStatus((prev) => ({
      ...prev,
      ...status,
      lastSync: new Date(),
    }));
  }, []);

  return { syncStatus, updateSyncStatus };
};
