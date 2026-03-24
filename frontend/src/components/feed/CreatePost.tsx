"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { containsProfanity } from "@/lib/profanity";
import { Image as ImageIcon, Video, X, Type } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import dynamic from "next/dynamic";

// Dynamic import for ReactQuill to support SSR
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

import 'react-quill-new/dist/quill.snow.css';

interface CreatePostProps {
  onPostCreated: (content: string, files: File[], tags: string[]) => void;
}

export default function CreatePost({ onPostCreated }: CreatePostProps) {
  const [content, setContent] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  const { user } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setSelectedFiles(prev => [...prev, ...files]);
    
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(previews[index]);
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const val = tagInput.trim().replace(/#/g, "");
      if (val && !tags.includes(val)) {
        setTags(prev => [...prev, val]);
        setTagInput("");
      }
    } else if (e.key === "Backspace" && !tagInput && tags.length > 0) {
      setTags(prev => prev.slice(0, -1));
    }
  };

  const removeTag = (index: number) => {
    setTags(prev => prev.filter((_, i) => i !== index));
  };

  const modules = useMemo(() => ({
    toolbar: [
      [{ 'font': [] }],
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['clean']
    ],
  }), []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Strip HTML for profanity check and "empty" check
    const plainText = content.replace(/<[^>]*>/g, "").trim();
    if (!plainText && selectedFiles.length === 0) return;

    if (containsProfanity(plainText)) {
      setError("Your post contains inappropriate language. Please modify it.");
      return;
    }

    onPostCreated(content, selectedFiles, tags);
    setContent("");
    setTags([]);
    setSelectedFiles([]);
    setPreviews([]);
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-zinc-200 shadow-xl shadow-black/5 p-8 mb-8 group relative overflow-hidden transition-all hover:shadow-2xl hover:shadow-black/10">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/5 -mr-16 -mt-16 rounded-full blur-3xl group-hover:bg-amber-400/10 transition-colors" />

      <div className="flex gap-6 relative z-10">
        <div className="w-12 h-12 rounded-2xl bg-zinc-50 border border-zinc-100 flex-shrink-0 flex items-center justify-center text-black font-black uppercase text-lg shadow-sm overflow-hidden transition-transform group-hover:scale-105">
          {mounted && user?.avatarUrl ? (
             <img src={user.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
          ) : (
             mounted && user?.firstName ? user.firstName[0] : 'FC'
          )}
        </div>
        <form onSubmit={handleSubmit} className="flex-1">
          <div className="quill-wrapper">
            {mounted && (
              <ReactQuill
                theme="snow"
                value={content}
                onChange={setContent}
                modules={modules}
                placeholder="Share your technical insights..."
                className="w-full bg-zinc-50 border border-zinc-100 rounded-[2rem] overflow-hidden outline-none min-h-[140px] text-zinc-900 transition-all font-bold"
              />
            )}

          </div>

          {/* Media Previews */}
          {previews.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
              {previews.map((preview, index) => (
                <div key={index} className="relative group aspect-video rounded-2xl overflow-hidden border border-zinc-100 shadow-sm">
                  <img src={preview} alt="preview" className="w-full h-full object-cover text-center leading-[150px] text-xs font-bold uppercase tracking-widest text-zinc-400 after:content-['File_Preview'] after:block after:absolute after:inset-0 after:bg-zinc-100" />
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="absolute top-3 right-3 p-2 bg-black/60 hover:bg-black text-white rounded-full backdrop-blur-md transition-all opacity-0 group-hover:opacity-100"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {error && <p className="text-red-500 text-xs font-medium ml-2 mt-2">{error}</p>}
          
          {/* Tags Input */}
          <div className="mt-6 flex flex-wrap gap-2 items-center bg-zinc-50 border border-zinc-100 rounded-2xl p-3 focus-within:bg-white transition-all">
            {tags.map((tag, i) => (
              <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-800 rounded-xl text-[10px] font-black uppercase tracking-wider">
                #{tag}
                <button type="button" onClick={() => removeTag(i)} className="hover:text-amber-600">
                  <X size={10} strokeWidth={3} />
                </button>
              </span>
            ))}
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder="Tag (press Space/Enter)"
              className="flex-1 bg-transparent border-none outline-none text-[10px] font-bold uppercase tracking-widest placeholder-zinc-400 min-w-[120px]"
            />
          </div>

          <div className="flex items-center justify-between mt-8">
            <div className="flex items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*,video/*"
                multiple
                className="hidden"
              />
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                className="p-4 text-zinc-500 hover:text-black hover:bg-zinc-50 border border-transparent rounded-2xl transition-all flex items-center gap-3 group/btn shadow-sm"
              >
                <ImageIcon size={20} className="group-hover/btn:scale-110 transition-transform text-amber-500" />
                <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">ATTACH // MEDIA</span>
              </button>
            </div>
            <button
              type="submit"
              disabled={!!(!content.trim() && selectedFiles.length === 0)}
              className="bg-zinc-900 hover:bg-black text-white px-10 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-xl shadow-black/10 active:scale-95"
            >
              BROADCAST_PROTO
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
