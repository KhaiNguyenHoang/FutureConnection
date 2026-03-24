"use client";

import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreHorizontal, 
  Send, 
  Reply, 
  X, 
  ChevronDown, 
  ChevronUp,
  Edit2,
  Trash2,
  Save,
  Undo
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useRef, useMemo } from "react";
import { PostDto, CommentDto } from "@/types/community";
import { useAuthStore } from "@/store/authStore";
import dynamic from "next/dynamic";
import { formatCompactNumber } from "@/lib/formatters";
import { containsProfanity } from "@/lib/profanity";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });
import 'react-quill-new/dist/quill.snow.css';

interface PostCardProps {
  post: PostDto & { commentsList?: CommentDto[] };
  onReact: (postId: string) => void;
  onShare: (postId: string) => void;
  onAddComment: (postId: string, content: string, parentCommentId?: string) => void;
  onFetchComments: (postId: string) => void;
  onCommentReact: (commentId: string) => void;
  onUpdatePost?: (postId: string, title?: string, content?: string, tags?: string[]) => Promise<void>;
  onDeletePost?: (postId: string) => Promise<void>;
  onUpdateComment?: (commentId: string, content: string) => Promise<void>;
  onDeleteComment?: (commentId: string) => Promise<void>;
}

export default function PostCard({ 
  post, 
  onReact, 
  onShare, 
  onAddComment, 
  onFetchComments, 
  onCommentReact,
  onUpdatePost,
  onDeletePost,
  onUpdateComment,
  onDeleteComment
}: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentError, setCommentError] = useState("");
  const [replyTo, setReplyTo] = useState<CommentDto | null>(null);
  const [toast, setToast] = useState("");
  
  // Post Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(post.title);
  const [editContent, setEditContent] = useState(post.content);
  const [editTags, setEditTags] = useState<string[]>(post.tags || []);
  const [editTagInput, setEditTagInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Comment Edit State
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentContent, setEditCommentContent] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { user: currentUser } = useAuthStore();
  const isOwner = currentUser?.id === post.userId;

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showComments && (!post.commentsList || post.commentsList.length === 0) && post.commentCount > 0) {
      onFetchComments(post.id);
    }
  }, [showComments, post.id, post.commentCount, post.commentsList, onFetchComments]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  const quillModules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['clean']
    ],
  }), []);

  const handleUpdate = async () => {
    if (!onUpdatePost) return;
    setIsSubmitting(true);
    try {
      await onUpdatePost(post.id, editTitle, editContent, editTags);
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update post:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!onDeletePost) return;
    if (window.confirm("Are you sure you want to delete this post? Protocol BROADCAST will cease.")) {
      try {
        await onDeletePost(post.id);
      } catch (err) {
        console.error("Failed to delete post:", err);
      }
    }
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const val = editTagInput.trim().replace(/#/g, "");
      if (val && !editTags.includes(val)) {
        setEditTags(prev => [...prev, val]);
        setEditTagInput("");
      }
    } else if (e.key === "Backspace" && !editTagInput && editTags.length > 0) {
      setEditTags(prev => prev.slice(0, -1));
    }
  };

  const removeTag = (index: number) => {
    setEditTags(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateComment = async (commentId: string) => {
    if (!onUpdateComment) return;
    setIsSubmittingComment(true);
    try {
      await onUpdateComment(commentId, editCommentContent);
      setEditingCommentId(null);
    } catch (err) {
      console.error("Failed to update comment:", err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!onDeleteComment) return;
    if (window.confirm("Delete this comment protocol?")) {
      try {
        await onDeleteComment(commentId);
      } catch (err) {
        console.error("Failed to delete comment:", err);
      }
    }
  };

  const handleShare = () => {
    // Generate post link
    const postLink = `${window.location.origin}/feed/post/${post.id}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(postLink);
    
    // Increment share count
    onShare(post.id); 
    
    // Show toast
    setToast(`Link copied: ${postLink}`);
    setTimeout(() => setToast(""), 3000);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCommentError("");

    if (!commentText.trim()) return;

    if (containsProfanity(commentText)) {
      setCommentError("Your comment contains inappropriate language.");
      return;
    }

    onAddComment(post.id, commentText, replyTo?.id);
    setCommentText("");
    setReplyTo(null);
  };

  const displayCommentCount = Math.max(post.commentCount, post.commentsList?.length || 0);

  return (
    <div className="bg-white rounded-[2.5rem] border border-zinc-200 shadow-xl shadow-black/5 mb-8 relative group overflow-hidden transition-all hover:shadow-2xl hover:shadow-black/10">
      {/* Toast Notification for Share */}
      {toast && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 bg-zinc-900 text-amber-400 text-[10px] font-black uppercase tracking-[0.2em] px-6 py-3 rounded-2xl shadow-2xl z-20 transition-all animate-in fade-in zoom-in duration-300 border border-amber-400/20">
          {toast}
        </div>
      )}

      <div className="p-6">
        {/* Author Section */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href={`/user/${post.userId}`} className="w-12 h-12 rounded-2xl bg-zinc-50 border border-zinc-100 shadow-sm overflow-hidden flex-shrink-0 flex items-center justify-center hover:scale-105 transition-all">
              {post.authorAvatarUrl ? (
                <img src={post.authorAvatarUrl} alt={post.authorFirstName || "User"} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-400 font-black uppercase text-lg">
                  {(post.authorFirstName?.[0] || "U").toUpperCase()}
                </div>
              )}
            </Link>
            <div>
              <Link href={`/user/${post.userId}`}>
                <h3 className="font-black text-zinc-900 hover:text-amber-500 cursor-pointer transition-colors text-base tracking-tight uppercase">
                  {post.authorFirstName && post.authorLastName 
                    ? `${post.authorFirstName} ${post.authorLastName}`
                    : "Anonymous User"}
                </h3>
              </Link>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="px-2 py-0.5 bg-zinc-50 text-[8px] font-black uppercase tracking-widest text-zinc-400 rounded border border-zinc-100">
                  PROTOCOL // {mounted ? new Date(post.createdAt).toLocaleDateString(undefined, { month: '2-digit', day: '2-digit' }) : "--/--"}
                </span>
                <p className="text-[10px] font-bold tracking-widest uppercase text-zinc-300 mr-2">
                  {mounted ? new Date(post.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : "--:--"}
                </p>
                {post.tags && post.tags.length > 0 && post.tags.map((tag, i) => (
                  <span key={i} className="px-2 py-0.5 bg-black text-white text-[8px] font-black uppercase tracking-widest rounded-full shadow-sm animate-in zoom-in duration-300">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
          {isOwner && (
            <div className="relative" ref={menuRef}>
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`p-2 rounded-xl transition-all active:scale-95 ${isMenuOpen ? 'bg-amber-100 text-amber-600' : 'text-zinc-400 hover:text-black hover:bg-zinc-50'}`}
              >
                <MoreHorizontal size={24} />
              </button>
              
              {isMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-zinc-200 shadow-2xl rounded-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <button 
                    onClick={() => { setIsEditing(true); setIsMenuOpen(false); }}
                    className="w-full text-left px-3 py-2.5 text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:bg-zinc-50 hover:text-amber-500 rounded-xl transition-all flex items-center gap-3"
                  >
                    <Edit2 size={16} /> Mod_Config
                  </button>
                  <button 
                    onClick={() => { handleDelete(); setIsMenuOpen(false); }}
                    className="w-full text-left px-3 py-2.5 text-[10px] font-black uppercase tracking-widest text-red-600 hover:bg-red-50 rounded-xl transition-all flex items-center gap-3"
                  >
                    <Trash2 size={16} /> Terminate_Proto
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="mb-6">
          {isEditing ? (
            <div className="space-y-4 animate-in fade-in duration-300">
              <input 
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Protocol Title..."
                className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3 text-sm font-black uppercase tracking-tighter outline-none focus:bg-white focus:ring-2 focus:ring-amber-500/20 transition-all"
              />
              <div className="quill-wrapper-edit">
                <ReactQuill 
                  theme="snow"
                  value={editContent}
                  onChange={setEditContent}
                  modules={quillModules}
                  className="bg-zinc-50 border border-zinc-100 rounded-2xl overflow-hidden font-bold"
                />
              </div>
              <div className="flex flex-wrap gap-2 items-center bg-zinc-50 border border-zinc-100 rounded-xl p-2">
                {editTags.map((tag, i) => (
                  <span key={i} className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 text-amber-800 rounded-lg text-[9px] font-black uppercase tracking-wider">
                    #{tag}
                    <button type="button" onClick={() => removeTag(i)} className="hover:text-amber-600">
                      <X size={10} strokeWidth={3} />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={editTagInput}
                  onChange={(e) => setEditTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder="Tag..."
                  className="flex-1 bg-transparent border-none outline-none text-[10px] font-bold uppercase tracking-widest placeholder-zinc-400 min-w-[80px] px-2"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  onClick={handleUpdate}
                  disabled={!!isSubmitting}
                  className="flex-1 bg-zinc-900 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-all active:scale-95 disabled:opacity-50"
                >
                  <Save size={14} /> Commit_Changes
                </button>
                <button 
                  onClick={() => setIsEditing(false)}
                  className="px-6 bg-zinc-100 text-zinc-600 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all active:scale-95"
                >
                  <Undo size={14} /> Abort
                </button>
              </div>
              <style jsx global>{`
                .quill-wrapper-edit .ql-toolbar.ql-snow { border: none; background: #f8fafc; border-bottom: 1px solid #f1f5f9; }
                .quill-wrapper-edit .ql-container.ql-snow { border: none; font-size: 0.875rem; min-height: 100px; }
              `}</style>
            </div>
          ) : (
            <>
              {post.title && post.title !== post.content && (
                <h2 className="text-xl font-black text-zinc-900 mb-3 tracking-tight uppercase italic">{post.title}</h2>
              )}
              <div 
                className="text-zinc-800 text-base leading-relaxed font-normal tracking-normal quill-content"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </>
          )}
        </div>



        {/* Media Section */}
        {post.media && post.media.length > 0 && (
          <div className={`mb-6 grid gap-4 ${post.media.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {post.media.map((item, index) => (
              <div key={item.id} className="relative rounded-2xl overflow-hidden border border-zinc-100 bg-zinc-50 aspect-video group shadow-sm hover:shadow-md transition-all">
                {item.resourceType === 'video' ? (
                  <video 
                    src={item.mediaUrl} 
                    controls 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img 
                    src={item.mediaUrl} 
                    alt={`Post media ${index + 1}`} 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700 cursor-pointer" 
                    onClick={() => window.open(item.mediaUrl, '_blank')}
                  />
                )}
                <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-md text-[8px] font-black text-white uppercase tracking-widest rounded border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                  MEDIA // 0{index + 1}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats Section */}
        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 border-b border-zinc-50 pb-4 mb-4">
          <div className="flex items-center gap-2 group/stat cursor-pointer">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${post.reactionCount > 0 ? "bg-red-50 text-red-500" : "bg-zinc-50 text-zinc-400 group-hover/stat:bg-red-50 group-hover/stat:text-red-500"}`}>
               <Heart size={16} className={post.reactionCount > 0 ? "fill-red-500" : ""} />
            </div>
            <span className={post.reactionCount > 0 ? "text-red-500" : ""}>{formatCompactNumber(post.reactionCount)} ENGAGEMENTS</span>
          </div>
          <div className="flex gap-6">
            <span className="hover:text-black transition-colors cursor-pointer" onClick={() => setShowComments(!showComments)}>
              {formatCompactNumber(displayCommentCount)} REPLIES
            </span>
            <span className="hover:text-black transition-colors cursor-pointer">
              {formatCompactNumber(post.shareCount)} SHARES
            </span>
          </div>
        </div>

        {/* Actions Section */}
        <div className="flex items-center justify-between gap-4">
          <button 
            onClick={() => onReact(post.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl transition-all font-black uppercase tracking-[0.2em] text-[10px] shadow-lg shadow-black/[0.02] active:scale-95 ${
              post.userHasReacted 
                ? "text-red-600 bg-red-50 border border-red-100" 
                : "text-zinc-900 bg-white border border-zinc-200 hover:bg-zinc-50"
            }`}
          >
            <Heart size={18} className={post.userHasReacted ? "fill-red-600" : ""} />
            <span>{post.userHasReacted ? "DISCONNECT" : "CONNECT"}</span>
          </button>
          <button 
            onClick={() => setShowComments(!showComments)}
            className="flex-1 flex items-center justify-center gap-2 py-4 bg-zinc-900 text-white rounded-2xl transition-all font-black uppercase tracking-[0.2em] text-[10px] shadow-lg shadow-black/10 hover:bg-black active:scale-95"
          >
            <MessageCircle size={18} />
            <span>ANALYZE</span>
          </button>
          <button 
            onClick={handleShare}
            className="flex-1 hidden sm:flex items-center justify-center gap-2 py-4 bg-amber-400 text-black rounded-2xl transition-all font-black uppercase tracking-[0.2em] text-[10px] shadow-lg shadow-amber-500/10 hover:bg-amber-500 active:scale-95"
          >
            <Share2 size={18} />
            <span>TRANSMIT</span>
          </button>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="px-5 pb-5 border-t border-zinc-100 pt-5 bg-zinc-50 rounded-b-2xl">
          {/* Comment Form */}
          <form onSubmit={handleCommentSubmit} className="mb-6">
            {replyTo && (
              <div className="flex items-center justify-between bg-amber-50 border border-amber-100 rounded-xl px-3 py-1.5 mb-2 animate-in fade-in slide-in-from-top-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-700">
                  Replying to <span className="text-amber-900">{replyTo.authorFirstName} {replyTo.authorLastName}</span>
                </p>
                <button 
                  type="button" 
                  onClick={() => setReplyTo(null)}
                  className="text-amber-400 hover:text-amber-600 font-black text-[10px] uppercase"
                >
                  Cancel
                </button>
              </div>
            )}
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-xl bg-neutral-100 border border-neutral-200 flex-shrink-0 flex items-center justify-center overflow-hidden">
                {currentUser?.avatarUrl ? (
                  <img src={currentUser.avatarUrl} alt="Me" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-black text-[10px] font-black uppercase">
                    {(currentUser?.firstName?.[0] || 'ME')}
                  </div>
                )}
              </div>
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => {
                    setCommentText(e.target.value);
                    if (commentError) setCommentError("");
                  }}
                  autoFocus={!!replyTo}
                  placeholder={replyTo ? `Reply to ${replyTo.authorFirstName}...` : "Write a comment..."}
                  className="w-full bg-white border border-zinc-200 rounded-2xl px-4 py-2.5 pr-16 text-sm font-medium outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all text-zinc-900 placeholder-zinc-400"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="absolute right-1 top-1 bottom-1 px-4 bg-amber-500 text-white rounded-xl text-xs font-black uppercase tracking-tighter hover:bg-amber-400 disabled:opacity-50 transition-colors shadow-sm"
                >
                  Post
                </button>
                {commentError && <p className="text-red-500 text-xs font-medium mt-1.5 ml-2">{commentError}</p>}
              </div>
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-5">
            {post.commentsList && post.commentsList.length > 0 ? (
              post.commentsList
                .filter(c => !c.parentCommentId) // Only top-level first
                .map((comment) => (
                <div key={comment.id} className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-xl bg-neutral-100 border border-neutral-200 flex-shrink-0 flex items-center justify-center overflow-hidden">
                      {comment.authorAvatarUrl ? (
                        <img src={comment.authorAvatarUrl} alt={comment.authorFirstName || "User"} className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-[10px] font-black uppercase text-black">
                          {(comment.authorFirstName?.[0] || 'U')}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="bg-white border border-zinc-200 rounded-2xl p-3.5 w-full shadow-sm">
                        <Link href={`/user/${comment.userId}`}>
                          <p className="font-bold text-sm text-zinc-900 hover:text-amber-500 cursor-pointer transition-colors inline-block">
                            {comment.authorFirstName && comment.authorLastName
                              ? `${comment.authorFirstName} ${comment.authorLastName}`
                              : "Anonymous User"}
                          </p>
                        </Link>
                        {editingCommentId === comment.id ? (
                          <div className="mt-2 space-y-2">
                            <textarea 
                              value={editCommentContent}
                              onChange={(e) => setEditCommentContent(e.target.value)}
                              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
                            />
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleUpdateComment(comment.id)}
                                disabled={!!isSubmittingComment}
                                className="flex-1 bg-zinc-900 text-white py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-black transition-all disabled:opacity-50"
                              >
                                Commit
                              </button>
                              <button 
                                onClick={() => setEditingCommentId(null)}
                                className="px-4 bg-zinc-100 text-zinc-600 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-all"
                              >
                                Abort
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-zinc-700 font-medium mt-1">{comment.content}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1.5 ml-3 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                        <div 
                          className={`flex items-center gap-1 cursor-pointer hover:text-amber-500 transition-colors ${comment.userHasReacted ? 'text-red-500 hover:text-red-600' : ''}`}
                          onClick={() => onCommentReact(comment.id)}
                        >
                          {comment.userHasReacted ? (
                            <Heart size={10} className="fill-red-500 text-red-500" />
                          ) : (
                            <Heart size={10} />
                          )}
                          <span>{comment.userHasReacted ? 'Liked' : 'Like'}</span>
                          {comment.reactionCount && comment.reactionCount > 0 ? (
                            <span className="ml-0.5 text-[9px] font-black">({comment.reactionCount})</span>
                          ) : null}
                        </div>
                        <span className="cursor-pointer hover:text-amber-500 transition-colors" onClick={() => {
                          setReplyTo(comment);
                        }}>Reply</span>
                        
                        {currentUser?.id === comment.userId && (
                          <>
                            <span 
                              className="cursor-pointer hover:text-amber-500 transition-colors" 
                              onClick={() => { setEditingCommentId(comment.id); setEditCommentContent(comment.content); }}
                            >
                              Edit
                            </span>
                            <span 
                              className="cursor-pointer hover:text-red-500 transition-colors" 
                              onClick={() => handleDeleteComment(comment.id)}
                            >
                              Delete
                            </span>
                          </>
                        )}
                        <span className="text-zinc-300">
                          {new Date(comment.createdAt).toLocaleDateString(undefined, {
                              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Replies Indented */}
                  {post.commentsList?.filter(r => r.parentCommentId === comment.id).map(reply => (
                    <div key={reply.id} className="flex gap-3 ml-11">
                      <div className="w-7 h-7 rounded-lg bg-neutral-100 border border-neutral-200 flex-shrink-0 flex items-center justify-center overflow-hidden">
                        {reply.authorAvatarUrl ? (
                          <img src={reply.authorAvatarUrl} alt={reply.authorFirstName || "User"} className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-[9px] font-black uppercase text-black">
                            {(reply.authorFirstName?.[0] || 'U')}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="bg-zinc-100/50 border border-zinc-200 rounded-2xl p-3 w-full">
                          <Link href={`/user/${reply.userId}`}>
                            <p className="font-bold text-xs text-zinc-900 hover:text-amber-500 cursor-pointer transition-colors inline-block">
                              {reply.authorFirstName && reply.authorLastName
                                ? `${reply.authorFirstName} ${reply.authorLastName}`
                                : "Anonymous User"}
                            </p>
                          </Link>
                          {editingCommentId === reply.id ? (
                            <div className="mt-1.5 space-y-1.5">
                              <textarea 
                                value={editCommentContent}
                                onChange={(e) => setEditCommentContent(e.target.value)}
                                className="w-full bg-white border border-zinc-200 rounded-xl px-2.5 py-1.5 text-xs font-medium outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
                              />
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => handleUpdateComment(reply.id)}
                                  disabled={!!isSubmittingComment}
                                  className="flex-1 bg-zinc-900 text-white py-1 rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-black transition-all disabled:opacity-50"
                                >
                                  Commit
                                </button>
                                <button 
                                  onClick={() => setEditingCommentId(null)}
                                  className="px-3 bg-zinc-100 text-zinc-600 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-all"
                                >
                                  Abort
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-zinc-700 font-medium mt-0.5">{reply.content}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-1 ml-2 text-[9px] font-bold uppercase tracking-widest text-zinc-400">
                          <div 
                            className={`flex items-center gap-1 cursor-pointer hover:text-amber-500 transition-colors ${reply.userHasReacted ? 'text-red-500 hover:text-red-600' : ''}`}
                            onClick={() => onCommentReact(reply.id)}
                          >
                            {reply.userHasReacted ? (
                              <Heart size={10} className="fill-red-500 text-red-500" />
                            ) : (
                              <Heart size={10} />
                            )}
                            <span>{reply.userHasReacted ? 'Liked' : 'Like'}</span>
                            {reply.reactionCount && reply.reactionCount > 0 ? (
                              <span className="ml-0.5 text-[8px] font-black">({reply.reactionCount})</span>
                            ) : null}
                          </div>
                          
                          {currentUser?.id === reply.userId && (
                            <>
                              <span 
                                className="cursor-pointer hover:text-amber-500 transition-colors" 
                                onClick={() => { setEditingCommentId(reply.id); setEditCommentContent(reply.content); }}
                              >
                                Edit
                              </span>
                              <span 
                                className="cursor-pointer hover:text-red-500 transition-colors" 
                                onClick={() => handleDeleteComment(reply.id)}
                              >
                                Delete
                              </span>
                            </>
                          )}
                          <span className="text-zinc-300">
                            {new Date(reply.createdAt).toLocaleDateString(undefined, {
                                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))
            ) : (
              <p className="text-center text-xs font-bold uppercase tracking-widest text-zinc-400 py-2">No comments yet. Be the first to start!</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
