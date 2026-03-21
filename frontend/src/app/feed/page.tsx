'use client';

import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getFeed,
  createPost,
  reactToPost,
  updatePost,
  deletePost,
  getComments,
  addComment,
  updateComment,
  deleteComment,
} from '@/api/socialService';
import { useAuthStore } from '@/store/authStore';
import { formatRelativeTime, getDisplayName, getInitials } from '@/lib/utils';
import {
  Image,
  Send,
  MessageCircle,
  Share2,
  Loader2,
  Smile,
  MoreHorizontal,
  Pencil,
  Trash2,
  MessageSquare,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import type { Post, Comment, ReactionType } from '@/types';

// ── Reaction config ────────────────────────────────────────────────────────────

const REACTIONS: { type: ReactionType; emoji: string; label: string }[] = [
  { type: 'Like', emoji: '👍', label: 'Like' },
  { type: 'Love', emoji: '❤️', label: 'Love' },
  { type: 'Haha', emoji: '😄', label: 'Haha' },
  { type: 'Wow', emoji: '😮', label: 'Wow' },
  { type: 'Sad', emoji: '😢', label: 'Sad' },
  { type: 'Angry', emoji: '😡', label: 'Angry' },
];

function reactionEmoji(type: ReactionType | null | undefined): string {
  return REACTIONS.find((r) => r.type === type)?.emoji ?? '👍';
}

// ── ReactionPicker ─────────────────────────────────────────────────────────────

function ReactionPicker({
  postId,
  userReaction,
  reactionCount,
}: {
  postId: string;
  userReaction?: ReactionType | null;
  reactionCount?: number;
}) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { mutate: react, isPending } = useMutation({
    mutationFn: (type: ReactionType) => reactToPost(postId, type),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['feed'] }),
    onError: () => toast.error('Failed to react to post'),
  });

  const handleMouseEnter = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setOpen(true), 300);
  };

  const handleMouseLeave = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setOpen(false), 200);
  };

  const handleClick = () => {
    if (open) {
      setOpen(false);
    } else {
      // Quick-react with Like (or toggle off current)
      react(userReaction === 'Like' ? 'Like' : 'Like');
    }
  };

  const pickReaction = (type: ReactionType) => {
    setOpen(false);
    react(type);
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const hasReaction = Boolean(userReaction);

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Reaction popup */}
      {open && (
        <div className="absolute bottom-full left-0 mb-2 flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-lg px-2 py-1.5 z-20">
          {REACTIONS.map((r) => (
            <button
              key={r.type}
              onClick={() => pickReaction(r.type)}
              title={r.label}
              className={`text-xl leading-none p-1.5 rounded-xl transition-all hover:scale-125 focus:outline-none ${
                userReaction === r.type
                  ? 'bg-blue-50 dark:bg-blue-900/40 scale-110'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {r.emoji}
            </button>
          ))}
        </div>
      )}

      <button
        onClick={handleClick}
        disabled={isPending}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors select-none ${
          hasReaction
            ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 font-medium'
            : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
        }`}
      >
        <span className="text-base leading-none">
          {hasReaction ? reactionEmoji(userReaction) : '👍'}
        </span>
        <span>{hasReaction ? userReaction : 'React'}</span>
        {reactionCount ? (
          <span className="ml-0.5 text-xs text-slate-400 dark:text-slate-500">{reactionCount}</span>
        ) : null}
      </button>
    </div>
  );
}

// ── PostMenu (three-dots) ──────────────────────────────────────────────────────

function PostMenu({
  onEdit,
  onDelete,
}: {
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        aria-label="Post options"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-20 overflow-hidden">
          <button
            onClick={() => { setOpen(false); onEdit(); }}
            className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </button>
          <button
            onClick={() => { setOpen(false); onDelete(); }}
            className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

// ── CommentItem ────────────────────────────────────────────────────────────────

function CommentItem({
  comment,
  postId,
  currentUserId,
}: {
  comment: Comment;
  postId: string;
  currentUserId?: string;
}) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content);

  const { mutate: saveEdit, isPending: saving } = useMutation({
    mutationFn: () => updateComment(comment.id, editText),
    onSuccess: () => {
      setEditing(false);
      qc.invalidateQueries({ queryKey: ['comments', postId] });
    },
    onError: () => toast.error('Failed to update comment'),
  });

  const { mutate: remove } = useMutation({
    mutationFn: () => deleteComment(comment.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['comments', postId] });
      qc.invalidateQueries({ queryKey: ['feed'] });
    },
    onError: () => toast.error('Failed to delete comment'),
  });

  const handleDelete = () => {
    if (!confirm('Delete this comment?')) return;
    remove();
  };

  const isOwn = currentUserId === comment.userId;
  const name = comment.author ? getDisplayName(comment.author) : 'Unknown';
  const initials = comment.author
    ? getInitials(comment.author.firstName, comment.author.lastName, comment.author.email)
    : 'FC';

  return (
    <div className="flex gap-2.5">
      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 font-bold text-xs shrink-0">
        {comment.author?.avatarUrl ? (
          <img src={comment.author.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
        ) : (
          initials
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-2">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <span className="text-xs font-semibold text-slate-900 dark:text-white">{name}</span>
            <span className="text-xs text-slate-400 shrink-0">{formatRelativeTime(comment.createdAt)}</span>
          </div>

          {editing ? (
            <div className="space-y-2 mt-1">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                rows={2}
                className="w-full resize-none bg-white dark:bg-slate-700 rounded-lg px-3 py-1.5 text-xs border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
              <div className="flex gap-1.5">
                <button
                  onClick={() => saveEdit()}
                  disabled={saving || !editText.trim()}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 transition-colors"
                >
                  {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                  Save
                </button>
                <button
                  onClick={() => { setEditing(false); setEditText(comment.content); }}
                  className="px-2.5 py-1 rounded-lg text-xs text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
              {comment.content}
            </p>
          )}
        </div>

        {isOwn && !editing && (
          <div className="flex gap-2 mt-0.5 pl-1">
            <button
              onClick={() => setEditing(true)}
              className="text-xs text-slate-400 hover:text-blue-500 transition-colors"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="text-xs text-slate-400 hover:text-red-500 transition-colors"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── CommentsSection ────────────────────────────────────────────────────────────

function CommentsSection({ post }: { post: Post }) {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const [expanded, setExpanded] = useState(false);
  const [commentText, setCommentText] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['comments', post.id],
    queryFn: () => getComments(post.id),
    enabled: expanded,
  });

  const { mutate: submit, isPending: submitting } = useMutation({
    mutationFn: () => addComment(post.id, commentText),
    onSuccess: () => {
      setCommentText('');
      qc.invalidateQueries({ queryKey: ['comments', post.id] });
      qc.invalidateQueries({ queryKey: ['feed'] });
    },
    onError: () => toast.error('Failed to post comment'),
  });

  const comments = data?.data ?? [];
  const commentCount = post.commentCount ?? 0;

  return (
    <div className="space-y-3 pt-1">
      {/* Toggle */}
      {!expanded && commentCount > 0 && (
        <button
          onClick={() => setExpanded(true)}
          className="text-xs text-blue-500 hover:text-blue-600 font-medium transition-colors"
        >
          View {commentCount} comment{commentCount !== 1 ? 's' : ''}
        </button>
      )}

      {expanded && (
        <>
          {isLoading ? (
            <div className="flex justify-center py-2">
              <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
            </div>
          ) : comments.length > 0 ? (
            <div className="space-y-2">
              {comments.map((c) => (
                <CommentItem
                  key={c.id}
                  comment={c}
                  postId={post.id}
                  currentUserId={user?.id}
                />
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 pl-1">No comments yet.</p>
          )}
        </>
      )}

      {/* Add comment input — always visible if user is logged in */}
      {user && (
        <div className="flex gap-2 items-start">
          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 font-bold text-xs shrink-0">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              getInitials(user.firstName, user.lastName, user.email)
            )}
          </div>
          <div className="flex-1 flex gap-1.5">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && commentText.trim()) {
                  e.preventDefault();
                  submit();
                }
              }}
              onFocus={() => !expanded && setExpanded(true)}
              placeholder="Write a comment…"
              className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-1.5 text-xs border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
            <button
              onClick={() => submit()}
              disabled={submitting || !commentText.trim()}
              className="p-1.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 transition-colors shrink-0"
              aria-label="Send comment"
            >
              {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── CreatePostBox ──────────────────────────────────────────────────────────────

function CreatePostBox() {
  const { user } = useAuthStore();
  const [content, setContent] = useState('');
  const [focused, setFocused] = useState(false);
  const qc = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: () => createPost({ content }),
    onSuccess: () => {
      setContent('');
      setFocused(false);
      qc.invalidateQueries({ queryKey: ['feed'] });
      toast.success('Post published!');
    },
    onError: () => toast.error('Failed to publish post'),
  });

  if (!user) return null;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 font-bold text-sm shrink-0">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
          ) : (
            getInitials(user.firstName, user.lastName, user.email)
          )}
        </div>
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setFocused(true)}
            placeholder="What's on your mind?"
            rows={focused ? 4 : 2}
            className="w-full resize-none bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-2.5 text-sm border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
          {focused && (
            <div className="flex items-center justify-between mt-3">
              <button className="text-slate-400 hover:text-blue-500 transition-colors">
                <Image className="w-5 h-5" />
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setFocused(false); setContent(''); }}
                  className="px-4 py-2 rounded-xl text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => mutate()}
                  disabled={!content.trim() || isPending}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-60"
                >
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Post
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── PostCard ───────────────────────────────────────────────────────────────────

function PostCard({ post }: { post: Post }) {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [showComments, setShowComments] = useState(false);

  const { mutate: saveEdit, isPending: saving } = useMutation({
    mutationFn: () => updatePost(post.id, { content: editContent }),
    onSuccess: () => {
      setEditing(false);
      qc.invalidateQueries({ queryKey: ['feed'] });
      toast.success('Post updated');
    },
    onError: () => toast.error('Failed to update post'),
  });

  const { mutate: remove } = useMutation({
    mutationFn: () => deletePost(post.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['feed'] });
      toast.success('Post deleted');
    },
    onError: () => toast.error('Failed to delete post'),
  });

  const handleDelete = () => {
    if (!confirm('Delete this post?')) return;
    remove();
  };

  const author = post.author;
  const name = author ? getDisplayName(author) : 'Unknown';
  const initials = author ? getInitials(author.firstName, author.lastName, author.email) : 'FC';
  const isOwn = user?.id === post.userId;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Link href={`/profile/${author?.id ?? ''}`} className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 font-bold text-sm shrink-0 hover:opacity-80 transition-opacity">
          {author?.avatarUrl ? (
            <img src={author.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
          ) : (
            initials
          )}
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link href={`/profile/${author?.id ?? ''}`} className="font-semibold text-slate-900 dark:text-white text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              {name}
            </Link>
            <Link
              href="/messages"
              className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-blue-500 transition-colors"
              title="Send message"
            >
              <MessageSquare className="w-3 h-3" />
              Message
            </Link>
          </div>
          <p className="text-xs text-slate-400">{formatRelativeTime(post.createdAt)}</p>
        </div>
        {isOwn && (
          <PostMenu
            onEdit={() => { setEditing(true); setEditContent(post.content); }}
            onDelete={handleDelete}
          />
        )}
      </div>

      {/* Content */}
      {editing ? (
        <div className="space-y-2">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={4}
            className="w-full resize-none bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-2.5 text-sm border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
          <div className="flex gap-2">
            <button
              onClick={() => saveEdit()}
              disabled={saving || !editContent.trim()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-60"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Save
            </button>
            <button
              onClick={() => { setEditing(false); setEditContent(post.content); }}
              className="px-4 py-2 rounded-xl text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
          {post.content}
        </p>
      )}

      {/* Media */}
      {post.mediaUrls && post.mediaUrls.length > 0 && (
        <div className="rounded-xl overflow-hidden">
          <img src={post.mediaUrls[0]} alt="Post media" className="w-full max-h-96 object-cover" />
        </div>
      )}

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {post.tags.map((tag) => (
            <span key={tag} className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-full font-medium">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1 pt-1 border-t border-slate-100 dark:border-slate-800">
        <ReactionPicker
          postId={post.id}
          userReaction={post.userReaction}
          reactionCount={post.reactionCount}
        />
        <button
          onClick={() => setShowComments((v) => !v)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors ${
            showComments
              ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
              : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          {post.commentCount ? <span>{post.commentCount}</span> : null}
        </button>
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {/* Comments */}
      {showComments && <CommentsSection post={post} />}
    </div>
  );
}

// ── FeedPage ───────────────────────────────────────────────────────────────────

export default function FeedPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['feed'],
    queryFn: () => getFeed(),
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
      <CreatePostBox />

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : data?.data && data.data.length > 0 ? (
        data.data.map((post) => <PostCard key={post.id} post={post} />)
      ) : (
        <div className="text-center py-16 text-slate-500">
          <Smile className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p className="font-medium">No posts yet. Be the first to share!</p>
        </div>
      )}
    </div>
  );
}
