'use client';

import { useEffect, useCallback, useRef } from 'react';
import { createClient } from './client';
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import type { Database } from './database.types';

type TableName = keyof Database['public']['Tables'];

interface RealtimeSubscriptionOptions<T> {
  table: TableName;
  userId: string;
  onInsert?: (payload: T) => void;
  onUpdate?: (payload: T) => void;
  onDelete?: (payload: { id: string }) => void;
  filter?: string;
}

/**
 * Hook for subscribing to real-time changes on a Supabase table
 * Filters by user_id to only get relevant updates
 */
export function useRealtimeSubscription<T extends { id: string; user_id: string }>({
  table,
  userId,
  onInsert,
  onUpdate,
  onDelete,
}: RealtimeSubscriptionOptions<T>): void {
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!userId) return;

    const supabase = createClient();
    
    const channel = supabase
      .channel(`${table}_changes_${userId}`)
      .on<T>(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: table,
          filter: `user_id=eq.${userId}`,
        },
        (payload: RealtimePostgresChangesPayload<T>) => {
          if (payload.new && onInsert) {
            onInsert(payload.new as T);
          }
        }
      )
      .on<T>(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: table,
          filter: `user_id=eq.${userId}`,
        },
        (payload: RealtimePostgresChangesPayload<T>) => {
          if (payload.new && onUpdate) {
            onUpdate(payload.new as T);
          }
        }
      )
      .on<T>(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: table,
          filter: `user_id=eq.${userId}`,
        },
        (payload: RealtimePostgresChangesPayload<T>) => {
          if (payload.old && onDelete) {
            onDelete({ id: (payload.old as T).id });
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [table, userId, onInsert, onUpdate, onDelete]);
}

/**
 * Hook for subscribing to appointments changes with automatic state updates
 */
export function useAppointmentsRealtime(
  userId: string,
  setAppointments: React.Dispatch<React.SetStateAction<Database['public']['Tables']['appointments']['Row'][]>>
): void {
  const handleInsert = useCallback(
    (newAppointment: Database['public']['Tables']['appointments']['Row']) => {
      setAppointments((prev) => [newAppointment, ...prev]);
    },
    [setAppointments]
  );

  const handleUpdate = useCallback(
    (updatedAppointment: Database['public']['Tables']['appointments']['Row']) => {
      setAppointments((prev) =>
        prev.map((apt) => (apt.id === updatedAppointment.id ? updatedAppointment : apt))
      );
    },
    [setAppointments]
  );

  const handleDelete = useCallback(
    ({ id }: { id: string }) => {
      setAppointments((prev) => prev.filter((apt) => apt.id !== id));
    },
    [setAppointments]
  );

  useRealtimeSubscription({
    table: 'appointments',
    userId,
    onInsert: handleInsert,
    onUpdate: handleUpdate,
    onDelete: handleDelete,
  });
}

/**
 * Hook for subscribing to staff changes with automatic state updates
 */
export function useStaffRealtime(
  userId: string,
  setStaff: React.Dispatch<React.SetStateAction<Database['public']['Tables']['staff']['Row'][]>>
): void {
  const handleInsert = useCallback(
    (newStaff: Database['public']['Tables']['staff']['Row']) => {
      setStaff((prev) => [newStaff, ...prev]);
    },
    [setStaff]
  );

  const handleUpdate = useCallback(
    (updatedStaff: Database['public']['Tables']['staff']['Row']) => {
      setStaff((prev) =>
        prev.map((s) => (s.id === updatedStaff.id ? updatedStaff : s))
      );
    },
    [setStaff]
  );

  const handleDelete = useCallback(
    ({ id }: { id: string }) => {
      setStaff((prev) => prev.filter((s) => s.id !== id));
    },
    [setStaff]
  );

  useRealtimeSubscription({
    table: 'staff',
    userId,
    onInsert: handleInsert,
    onUpdate: handleUpdate,
    onDelete: handleDelete,
  });
}

/**
 * Hook for subscribing to services changes with automatic state updates
 */
export function useServicesRealtime(
  userId: string,
  setServices: React.Dispatch<React.SetStateAction<Database['public']['Tables']['services']['Row'][]>>
): void {
  const handleInsert = useCallback(
    (newService: Database['public']['Tables']['services']['Row']) => {
      setServices((prev) => [newService, ...prev]);
    },
    [setServices]
  );

  const handleUpdate = useCallback(
    (updatedService: Database['public']['Tables']['services']['Row']) => {
      setServices((prev) =>
        prev.map((s) => (s.id === updatedService.id ? updatedService : s))
      );
    },
    [setServices]
  );

  const handleDelete = useCallback(
    ({ id }: { id: string }) => {
      setServices((prev) => prev.filter((s) => s.id !== id));
    },
    [setServices]
  );

  useRealtimeSubscription({
    table: 'services',
    userId,
    onInsert: handleInsert,
    onUpdate: handleUpdate,
    onDelete: handleDelete,
  });
}

/**
 * Hook for subscribing to activity logs (insert only for logs)
 */
export function useActivityLogsRealtime(
  userId: string,
  setLogs: React.Dispatch<React.SetStateAction<Database['public']['Tables']['activity_logs']['Row'][]>>,
  maxLogs: number = 10
): void {
  const handleInsert = useCallback(
    (newLog: Database['public']['Tables']['activity_logs']['Row']) => {
      setLogs((prev) => [newLog, ...prev].slice(0, maxLogs));
    },
    [setLogs, maxLogs]
  );

  useRealtimeSubscription({
    table: 'activity_logs',
    userId,
    onInsert: handleInsert,
  });
}
