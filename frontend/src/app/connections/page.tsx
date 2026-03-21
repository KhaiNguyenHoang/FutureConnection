'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getConnections, getPendingConnections, respondToConnection, removeConnection } from '@/api/socialService';
import { createChannel } from '@/api/chatService';
import { getDisplayName, getInitials } from '@/lib/utils';
import { Users, UserPlus, UserX, Loader2, Check, X, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function ConnectionsPage() {
  const qc = useQueryClient();
  const router = useRouter();

  const { data: connectionsData, isLoading } = useQuery({ queryKey: ['connections'], queryFn: getConnections });
  const { data: pendingData } = useQuery({ queryKey: ['pending-connections'], queryFn: getPendingConnections });

  const { mutate: respond } = useMutation({
    mutationFn: ({ id, accepted }: { id: string; accepted: boolean }) => respondToConnection(id, accepted),
    onSuccess: (_, vars) => {
      toast.success(vars.accepted ? 'Connection accepted!' : 'Request declined');
      qc.invalidateQueries({ queryKey: ['connections'] });
      qc.invalidateQueries({ queryKey: ['pending-connections'] });
    },
    onError: () => toast.error('Failed to respond'),
  });

  const { mutate: remove } = useMutation({
    mutationFn: (id: string) => removeConnection(id),
    onSuccess: () => { toast.success('Connection removed'); qc.invalidateQueries({ queryKey: ['connections'] }); },
  });

  const { mutate: message, isPending: messaging } = useMutation({
    mutationFn: (userId: string) => createChannel(userId),
    onSuccess: () => router.push('/messages'),
    onError: () => toast.error('Failed to open conversation'),
  });

  const connections = connectionsData?.data ?? [];
  const pending = pendingData?.data ?? [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Connections</h1>
        <p className="text-slate-500 text-sm mt-1">{connections.length} connection{connections.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Pending requests */}
      {pending.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-600" />
            Pending Requests ({pending.length})
          </h2>
          {pending.map((conn) => {
            const person = conn.requester;
            const name = person ? getDisplayName(person) : 'Unknown';
            return (
              <div key={conn.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 font-bold text-sm shrink-0">
                  {person?.avatarUrl ? <img src={person.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" /> : getInitials(person?.firstName, person?.lastName, person?.email)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 dark:text-white">{name}</p>
                  {person && <p className="text-xs text-slate-400">{person.role}</p>}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => respond({ id: conn.id, accepted: true })}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors">
                    <Check className="w-4 h-4" />
                    Accept
                  </button>
                  <button onClick={() => respond({ id: conn.id, accepted: false })}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <X className="w-4 h-4" />
                    Decline
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Connections list */}
      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>
      ) : connections.length > 0 ? (
        <div className="space-y-3">
          <h2 className="font-semibold text-slate-900 dark:text-white">Your Network</h2>
          {connections.map((conn) => {
            const person = conn.receiver || conn.requester;
            const name = person ? getDisplayName(person) : 'Unknown';
            return (
              <div key={conn.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex items-center gap-4">
                <Link href={`/profile/${person?.id}`} className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 font-bold text-sm shrink-0 hover:opacity-80 transition-opacity">
                  {person?.avatarUrl ? <img src={person.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" /> : getInitials(person?.firstName, person?.lastName, person?.email)}
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/profile/${person?.id}`} className="font-medium text-slate-900 dark:text-white hover:text-blue-600 transition-colors">{name}</Link>
                  {person && <p className="text-xs text-slate-400">{person.role} · {person.email}</p>}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => person?.id && message(person.id)}
                    disabled={messaging || !person?.id}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-blue-700 transition-colors disabled:opacity-50"
                    title="Send message"
                  >
                    {messaging ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4" />}
                    Message
                  </button>
                  <button onClick={() => { if (confirm(`Remove ${name} from connections?`)) remove(conn.id); }}
                    className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                    <UserX className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No connections yet</p>
          <p className="text-slate-400 text-sm mt-1">Explore the feed and connect with people</p>
        </div>
      )}
    </div>
  );
}
