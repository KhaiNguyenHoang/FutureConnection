"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { containsProfanity } from "@/lib/profanity";
import { X, Type, Send, BadgeHelp, Image as ImageIcon } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import dynamic from "next/dynamic";
import { CreateQuestionDto } from "@/types/community";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });
import 'react-quill-new/dist/quill.snow.css';

interface AskQuestionProps {
  onQuestionCreated: (title: string, content: string, tags: string[], files: File[]) => void;
}

export default function AskQuestion({ onQuestionCreated }: AskQuestionProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...filesArray]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
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
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['code-block', 'clean']
    ],
  }), []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Please provide a concise title for your question.");
      return;
    }

    const plainText = content.replace(/<[^>]*>/g, "").trim();
    if (!plainText) {
      setError("Please describe your problem in more detail.");
      return;
    }

    if (containsProfanity(title) || containsProfanity(plainText)) {
      setError("Your content contains inappropriate language. Please modify it.");
      return;
    }

    onQuestionCreated(title, content, tags, selectedFiles);
    setTitle("");
    setContent("");
    setTags([]);
    setSelectedFiles([]);
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-zinc-200 shadow-xl p-8 mb-8 group relative overflow-hidden transition-all hover:shadow-2xl">
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/5 -mr-16 -mt-16 rounded-full blur-3xl" />

      <div className="flex gap-6 relative z-10">
        <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex-shrink-0 flex items-center justify-center text-white font-black shadow-lg">
          <BadgeHelp size={24} />
        </div>
        
        <form onSubmit={handleSubmit} className="flex-1">
          <input 
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What is your technical challenge?"
            className="w-full text-2xl font-black text-zinc-900 border-none outline-none mb-6 placeholder-zinc-300 uppercase tracking-tight"
          />

          <div className="quill-wrapper mb-6">
            {mounted && (
              <ReactQuill
                theme="snow"
                value={content}
                onChange={setContent}
                modules={modules}
                placeholder="Explain the technical details, what you've tried, and any relevant code snippets..."
                className="w-full bg-zinc-50 border border-zinc-100 rounded-[2rem] overflow-hidden outline-none min-h-[200px] text-zinc-900 font-bold"
              />
            )}
          </div>

          {/* Tags Input */}
          <div className="flex flex-wrap gap-2 items-center bg-zinc-50 border border-zinc-100 rounded-2xl p-4 focus-within:bg-white transition-all">
            {tags.map((tag, i) => (
              <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-wider shadow-sm">
                {tag}
                <button type="button" onClick={() => removeTag(i)} className="hover:text-amber-500">
                  <X size={10} strokeWidth={3} />
                </button>
              </span>
            ))}
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder="Framework (e.g. React) / Language (e.g. TypeScript)"
              className="flex-1 bg-transparent border-none outline-none text-[10px] font-bold uppercase tracking-widest placeholder-zinc-400 min-w-[250px]"
            />
          </div>

          {/* Media Upload */}
          <div className="mt-6">
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
            >
              <ImageIcon size={14} /> Attach_Visual_Evidence
            </button>

            {selectedFiles.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-4">
                {selectedFiles.map((file, i) => (
                  <div key={i} className="relative group/img w-20 h-20 rounded-xl overflow-hidden border border-zinc-200">
                    <img 
                      src={URL.createObjectURL(file)} 
                      alt="preview" 
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-lg opacity-0 group-hover/img:opacity-100 transition-opacity"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && <p className="text-red-500 text-xs font-black uppercase tracking-widest mt-4 ml-2">{error}</p>}


          <div className="flex items-center justify-end mt-8">
            <button
              type="submit"
              disabled={!title.trim() || !content.trim()}
              className="bg-zinc-900 hover:bg-black text-white px-10 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-xl shadow-black/10 active:scale-95 flex items-center gap-3"
            >
              <Send size={16} /> BROADCAST_COMM_QA
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
