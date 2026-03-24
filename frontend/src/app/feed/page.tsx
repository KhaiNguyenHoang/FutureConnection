"use client";

import { useState } from "react";
import CreatePost from "@/components/feed/CreatePost";
import PostCard from "@/components/feed/PostCard";
import TopBadges from "@/components/feed/TopBadges";
import { PostDto } from "@/types/community";
import api from "@/lib/api";
import ErrorAlert from "@/components/common/ErrorAlert";
import SuccessAlert from "@/components/common/SuccessAlert";

import Sidebar from "@/components/layout/Sidebar";
import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

export default function FeedPage() {
  const [posts, setPosts] = useState<(PostDto & { commentsList?: any[] })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { user } = useAuthStore();

  // Fetch real posts from backend (via Gateway if configured)
  useEffect(() => {
    setError(null);
    api.get('/posts')
      .then(res => {
        if (res.data && res.data.success && res.data.data) {
          setPosts(res.data.data);
        } else {
          setPosts([]);
        }
      })
      .catch(err => {
        console.error("Failed to load posts:", err);
        setError(err.response?.data?.message || err.message || "Failed to load posts");
        setPosts([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const handlePostCreated = async (content: string, files: File[], tags: string[]) => {
    try {
      const formData = new FormData();
      // Use first 30 chars of content as title since backend requires it
      const title = content.length > 30 ? content.substring(0, 27) + "..." : content || "New Post";
      formData.append('title', title);
      formData.append('content', content);
      formData.append('userId', user?.id || "");
      
      // Append files
      files.forEach(file => {
        formData.append('mediaFiles', file);
      });

      // Append tags
      tags.forEach(tag => {
        formData.append('tags', tag);
      });

      const res = await api.post('/posts', formData);
      if (res.data.success) {
        const savedPost = res.data.data;
        // Patch user info so it doesn't show as Anonymous until reload
        savedPost.authorFirstName = user?.firstName;
        savedPost.authorLastName = user?.lastName;
        savedPost.authorAvatarUrl = user?.avatarUrl;
        
        setPosts([savedPost, ...posts]);
        setSuccess("Post created successfully!");
      } else {
        setError(res.data.message || "Failed to create post");
      }
    } catch (err: any) {
      console.error("Failed to create post:", err);
      setError(err.response?.data?.message || "Failed to create post");
    }
  };

  const handleReact = async (postId: string) => {
    try {
      // Use reaction type 0 (Like) as default
      const res = await api.post(`/posts/${postId}/reactions`, { type: 0, postId, userId: user?.id });
      if (res.data.success) {
        const isRemoved = res.data.message?.includes('removed');
        setPosts(posts.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                userHasReacted: !isRemoved,
                reactionCount: isRemoved ? post.reactionCount - 1 : post.reactionCount + 1 
              }
            : post
        ));
        setSuccess(isRemoved ? "Reaction removed." : "Reaction added!");
      }
    } catch (err: any) {
      console.error("Failed to react:", err);
      setError(err.response?.data?.message || "Failed to react to post");
    }
  };

  const handleShare = (postId: string) => {
    // Sharing is currently client-side only or requires a specific endpoint
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, shareCount: post.shareCount + 1 }
        : post
    ));
  };

  const handleFetchComments = async (postId: string) => {
    try {
      const res = await api.get(`/posts/${postId}/comments`);
      if (res.data.success) {
        setPosts(posts.map(post => 
          post.id === postId 
            ? { ...post, commentsList: res.data.data }
            : post
        ));
      }
    } catch (err) {
      console.error("Failed to fetch comments:", err);
    }
  };

  const handleAddComment = async (postId: string, content: string, parentCommentId?: string) => {
    try {
      const formData = new FormData();
      formData.append('content', content);
      formData.append('postId', postId);
      formData.append('userId', user?.id || "");
      if (parentCommentId) {
        formData.append('parentCommentId', parentCommentId);
      }

      const res = await api.post(`/posts/${postId}/comments`, formData);
      if (res.data.success) {
        const savedComment = res.data.data;
        // Patch user info so it doesn't show as Anonymous until reload
        if (!savedComment.authorFirstName) {
            savedComment.authorFirstName = user?.firstName;
            savedComment.authorLastName = user?.lastName;
            savedComment.authorAvatarUrl = user?.avatarUrl;
        }

        setPosts(posts.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                commentCount: post.commentCount + 1,
                commentsList: [...(post.commentsList || []), savedComment]
              }
            : post
        ));
        setSuccess("Comment added!");
      }
    } catch (err: any) {
      console.error("Failed to add comment:", err);
    }
  };

  const handleCommentReact = async (commentId: string) => {
    try {
      const res = await api.post(`/comments/${commentId}/reactions`, {
        type: 0 // Heart/Like
      });
      if (res.data.success) {
        setPosts(prev => prev.map(post => ({
          ...post,
          commentsList: post.commentsList?.map(c => 
            c.id === commentId ? { ...c, userHasReacted: !c.userHasReacted } : c
          )
        })));
        const isRemoved = res.data.message?.toLowerCase().includes('removed');
        setSuccess(isRemoved ? "Comment reaction removed." : "Comment liked!");
      } else {
        setError(res.data.message || "Failed to react to comment");
      }
    } catch (err: any) {
      console.error("Failed to react to comment:", err);
      setError(err.response?.data?.message || "Failed to react to comment");
    }
  };

  const handleUpdatePost = async (postId: string, title?: string, content?: string, tags?: string[]) => {
    try {
      const res = await api.put(`/posts/${postId}`, { id: postId, title, content, tags });
      if (res.data.success) {
        const updatedPost = res.data.data;
        // Patch author info so it doesn't show as Anonymous until reload
        updatedPost.authorFirstName = user?.firstName;
        updatedPost.authorLastName = user?.lastName;
        updatedPost.authorAvatarUrl = user?.avatarUrl;
        
        setPosts(posts.map(post => post.id === postId ? { ...post, ...updatedPost } : post));
        setSuccess("Post protocol updated.");
      } else {
        setError(res.data.message || "Failed to update post");
      }
    } catch (err: any) {
      console.error("Failed to update post:", err);
      setError(err.response?.data?.message || "Failed to update post");
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      const res = await api.delete(`/posts/${postId}`);
      if (res.data.success) {
        setPosts(posts.filter(post => post.id !== postId));
        setSuccess("Post protocol terminated.");
      } else {
        setError(res.data.message || "Failed to delete post");
      }
    } catch (err: any) {
      console.error("Failed to delete post:", err);
      setError(err.response?.data?.message || "Failed to delete post");
    }
  };

  const handleUpdateComment = async (commentId: string, content: string) => {
    try {
      const res = await api.put(`/comments/${commentId}`, { id: commentId, content });
      if (res.data.success) {
        setPosts(prev => prev.map(post => ({
          ...post,
          commentsList: post.commentsList?.map(c => 
            c.id === commentId ? { ...c, content: res.data.data.content } : c
          )
        })));
        setSuccess("Comment updated.");
      } else {
        setError(res.data.message || "Failed to update comment");
      }
    } catch (err: any) {
      console.error("Failed to update comment:", err);
      setError(err.response?.data?.message || "Failed to update comment");
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const res = await api.delete(`/comments/${commentId}`);
      if (res.data.success) {
        setPosts(prev => prev.map(post => ({
          ...post,
          commentCount: post.commentsList?.some(c => c.id === commentId) ? post.commentCount - 1 : post.commentCount,
          commentsList: post.commentsList?.filter(c => c.id !== commentId)
        })));
        setSuccess("Comment deleted.");
      } else {
        setError(res.data.message || "Failed to delete comment");
      }
    } catch (err: any) {
      console.error("Failed to delete comment:", err);
      setError(err.response?.data?.message || "Failed to delete comment");
    }
  };

  return (
    <div className="flex bg-zinc-50 min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-20 h-screen overflow-y-auto">
        <div className="py-8 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Feed Column */}
          <div className="lg:col-span-2">
            {/* Feed Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-black italic tracking-tighter uppercase text-zinc-900 leading-none">
                Your <span className="text-amber-500">Feed</span>
              </h1>
              <p className="text-zinc-500 text-xs font-medium mt-1">See what your network is talking about</p>
            </div>

            <ErrorAlert error={error} onClear={() => setError(null)} title="Feed Error" />
            <SuccessAlert message={success} onClear={() => setSuccess(null)} title="Success" />

            {/* Create Post */}
            <CreatePost onPostCreated={handlePostCreated} />

            {/* Posts List */}
            <div className="space-y-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : posts.length > 0 ? (
                posts.map(post => (
                  <PostCard 
                    key={post.id} 
                    post={post} 
                    onReact={handleReact}
                    onShare={handleShare}
                    onAddComment={handleAddComment}
                    onFetchComments={handleFetchComments}
                    onCommentReact={handleCommentReact}
                    onUpdatePost={handleUpdatePost}
                    onDeletePost={handleDeletePost}
                    onUpdateComment={handleUpdateComment}
                    onDeleteComment={handleDeleteComment}
                  />
                ))
              ) : (
                <div className="bg-white rounded-2xl border border-dashed border-zinc-300 shadow-sm p-12 text-center">
                  <h3 className="text-xl font-bold text-zinc-900">No Posts Yet</h3>
                  <p className="text-zinc-500 text-sm mt-2">Start a conversation by creating a post above!</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar Column */}
          <div className="hidden lg:block relative">
            <TopBadges />
          </div>

        </div>
      </main>
    </div>
  );
}
