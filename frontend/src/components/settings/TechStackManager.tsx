"use client";

import { useState, useEffect } from "react";
import { Plus, X, Search, Terminal } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";
import ErrorAlert from "@/components/common/ErrorAlert";

interface CodeLanguage {
  id: string; // the property name from DTO is id
  name: string;
  documentationUrl?: string;
}

interface Framework {
  id: string;
  name: string;
}

interface UserLanguage {
  codeLanguageId: string;
  name: string;
  documentationUrl?: string;
}

interface UserFramework {
  frameworkId: string;
  name: string;
}

export default function TechStackManager() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [userLanguages, setUserLanguages] = useState<UserLanguage[]>([]);
  const [userFrameworks, setUserFrameworks] = useState<UserFramework[]>([]);

  const [allLanguages, setAllLanguages] = useState<CodeLanguage[]>([]);
  const [allFrameworks, setAllFrameworks] = useState<Framework[]>([]);

  const [searchLang, setSearchLang] = useState("");
  const [searchFw, setSearchFw] = useState("");

  useEffect(() => {
    if (user?.id) {
      fetchData();
    }
  }, [user?.id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [profileRes, langsRes, fwsRes] = await Promise.all([
        api.get(`/profiles/public/${user!.id}`),
        api.get('/profiles/code-languages'),
        api.get('/profiles/frameworks')
      ]);

      setUserLanguages(profileRes.data.data.languages || []);
      setUserFrameworks(profileRes.data.data.frameworks || []);
      setAllLanguages(langsRes.data.data || []);
      setAllFrameworks(fwsRes.data.data || []);
      setError("");
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to load tech stack data.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLanguage = async (languageId: string) => {
    try {
      const res = await api.post(`/profiles/${user!.id}/languages/${languageId}`);
      if (res.data.success) {
        setUserLanguages(prev => [...prev, res.data.data]);
        setSearchLang("");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || err.message || "Failed to add language.");
    }
  };

  const handleRemoveLanguage = async (languageId: string) => {
    try {
      const res = await api.delete(`/profiles/languages/${languageId}`);
      if (res.data.success) {
        setUserLanguages(prev => prev.filter(l => l.codeLanguageId !== languageId));
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || err.message || "Failed to remove language.");
    }
  };

  const handleAddFramework = async (frameworkId: string) => {
    try {
      const res = await api.post(`/profiles/${user!.id}/frameworks/${frameworkId}`);
      if (res.data.success) {
        setUserFrameworks(prev => [...prev, res.data.data]);
        setSearchFw("");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || err.message || "Failed to add framework.");
    }
  };

  const handleRemoveFramework = async (frameworkId: string) => {
    try {
      const res = await api.delete(`/profiles/frameworks/${frameworkId}`);
      if (res.data.success) {
        setUserFrameworks(prev => prev.filter(f => f.frameworkId !== frameworkId));
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || err.message || "Failed to remove framework.");
    }
  };

  const filteredLanguages = allLanguages.filter(l => 
    l.name.toLowerCase().includes(searchLang.toLowerCase()) &&
    !userLanguages.some(ul => ul.codeLanguageId === l.id)
  );

  const filteredFrameworks = allFrameworks.filter(f => 
    f.name.toLowerCase().includes(searchFw.toLowerCase()) &&
    !userFrameworks.some(uf => uf.frameworkId === f.id)
  );

  if (loading) {
    return <div className="text-center py-10 text-neutral-500 font-bold animate-pulse">Loading Tech Stack...</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex items-center gap-4 border-b border-zinc-100 pb-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/5 -mr-16 -mt-16 rounded-full blur-3xl group-hover:bg-amber-400/10 transition-colors" />
        <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 shadow-sm relative z-10">
          <Terminal size={24} />
        </div>
        <div className="relative z-10">
          <h2 className="text-2xl font-black italic uppercase tracking-tighter text-zinc-900 leading-none">Tech <span className="text-amber-500">Stack</span></h2>
          <p className="text-xs text-zinc-500 font-medium mt-1">Highlight your technical experience and expertise.</p>
        </div>
      </div>

      {error && (
        <ErrorAlert error={error} title="Tech Stack Error" onClear={() => setError("")} />
      )}

      {/* Programming Languages */}
      <div className="bg-white rounded-3xl border border-zinc-200 p-8 space-y-6 shadow-sm">
        <div>
          <h3 className="text-lg font-black italic uppercase tracking-tighter text-zinc-900 leading-none">Programming <span className="text-amber-500">Languages</span></h3>
          <p className="text-xs text-zinc-500 font-medium mt-1">Languages you write code in</p>
        </div>

        {/* Selected Languages */}
        {userLanguages.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {userLanguages.map(lang => (
              <span key={lang.codeLanguageId} className="inline-flex items-center gap-2 px-3 py-1.5 bg-neutral-900 text-white rounded-lg text-sm font-medium">
                {lang.name}
                <button onClick={() => handleRemoveLanguage(lang.codeLanguageId)} className="p-0.5 hover:bg-neutral-700 rounded-md transition-colors">
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Search and Add */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
            <Search size={16} />
          </div>
          <input 
            type="text" 
            placeholder="Search languages to add..." 
            value={searchLang}
            onChange={(e) => setSearchLang(e.target.value)}
            className="w-full pl-10 pr-4 py-3.5 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all font-medium text-zinc-900 placeholder:text-zinc-400"
          />
          {searchLang && filteredLanguages.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-neutral-200 rounded-xl shadow-xl z-10 max-h-60 overflow-y-auto">
              {filteredLanguages.map(lang => (
                <button 
                  key={lang.id}
                  onClick={() => handleAddLanguage(lang.id)}
                  className="w-full text-left px-4 py-3 hover:bg-neutral-50 border-b border-neutral-100 last:border-0 flex items-center justify-between group transition-colors"
                >
                  <span className="font-medium text-black">{lang.name}</span>
                  <Plus size={16} className="text-neutral-400 group-hover:text-amber-500" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Frameworks */}
      <div className="bg-white rounded-3xl border border-zinc-200 p-8 space-y-6 shadow-sm">
        <div>
          <h3 className="text-lg font-black italic uppercase tracking-tighter text-zinc-900 leading-none">Frameworks & <span className="text-amber-500">Libraries</span></h3>
          <p className="text-xs text-zinc-500 font-medium mt-1">Technologies you use to build projects</p>
        </div>

        {/* Selected Frameworks */}
        {userFrameworks.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {userFrameworks.map(fw => (
              <span key={fw.frameworkId} className="inline-flex items-center gap-2 px-3 py-1.5 bg-neutral-900 text-white rounded-lg text-sm font-medium">
                {fw.name}
                <button onClick={() => handleRemoveFramework(fw.frameworkId)} className="p-0.5 hover:bg-neutral-700 rounded-md transition-colors">
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Search and Add */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
            <Search size={16} />
          </div>
          <input 
            type="text" 
            placeholder="Search frameworks to add..." 
            value={searchFw}
            onChange={(e) => setSearchFw(e.target.value)}
            className="w-full pl-10 pr-4 py-3.5 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all font-medium text-zinc-900 placeholder:text-zinc-400"
          />
          {searchFw && filteredFrameworks.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-neutral-200 rounded-xl shadow-xl z-10 max-h-60 overflow-y-auto">
              {filteredFrameworks.map(fw => (
                <button 
                  key={fw.id}
                  onClick={() => handleAddFramework(fw.id)}
                  className="w-full text-left px-4 py-3 hover:bg-neutral-50 border-b border-neutral-100 last:border-0 flex items-center justify-between group transition-colors"
                >
                  <span className="font-medium text-black">{fw.name}</span>
                  <Plus size={16} className="text-neutral-400 group-hover:text-black" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
