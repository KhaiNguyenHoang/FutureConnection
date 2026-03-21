'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createQuestion, addQuestionTag } from '@/api/communityService';
import { getTags } from '@/api/jobService';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { Loader2, ArrowLeft, X } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function AskQuestionPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const { data: tagsData } = useQuery({ queryKey: ['tags'], queryFn: getTags });
  const tags = tagsData?.data ?? [];

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const res = await createQuestion({ title, body, tagIds: selectedTags });
      if (!res.success || !res.data) throw new Error(res.message);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success('Question posted!');
      router.push(`/community/questions/${data.id}`);
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to post question'),
  });

  if (!user) { router.push('/login'); return null; }

  const toggleTag = (id: string) => {
    setSelectedTags((prev) => prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <Link href="/community" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Community
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Ask a Question</h1>
        <p className="text-slate-500 text-sm mt-1">Get help from the community.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Title</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. How do I implement JWT refresh tokens in .NET 8?"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Details</label>
          <textarea
            required
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Describe your problem in detail. Include what you've tried so far…"
            rows={8}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
          />
        </div>

        {tags.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Tags</label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-all ${
                    selectedTags.includes(tag.id)
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {tag.name}
                  {selectedTags.includes(tag.id) && <X className="w-3 h-3" />}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Link href="/community" className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            Cancel
          </Link>
          <button
            onClick={() => mutate()}
            disabled={isPending || !title.trim() || !body.trim()}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors disabled:opacity-60"
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Post Question
          </button>
        </div>
      </div>
    </div>
  );
}
