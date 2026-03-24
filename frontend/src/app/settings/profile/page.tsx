"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import { useAuthStore } from "@/store/authStore";
import BasicInfoForm from "@/components/settings/BasicInfoForm";
import PortfolioManager from "@/components/settings/PortfolioManager";
import CVManager from "@/components/settings/CVManager";
import TechStackManager from "@/components/settings/TechStackManager";

export default function ProfileSettingsPage() {
  const { user, isAuthenticated } = useAuthStore();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "general");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  if (!isAuthenticated || !user) {
    return (
      <div className="flex bg-zinc-50 min-h-screen">
        <Sidebar />
        <main className="flex-1 ml-20 h-screen flex items-center justify-center">
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-sm">Please log in to view settings.</p>
        </main>
      </div>
    );
  }

  const tabs = [
    { id: "general", label: "General Info" },
    { id: "portfolio", label: "Portfolio & Projects" },
    { id: "cv", label: "CV Management" },
    { id: "skills", label: "Skills & Languages" }
  ];

  return (
    <div className="flex bg-zinc-50 min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-20 h-screen overflow-y-auto">
        <div className="py-12 max-w-6xl mx-auto px-6 sm:px-10">
          
          <div className="mb-12 relative group">
            <h1 className="text-4xl font-black italic tracking-tighter uppercase text-zinc-900 leading-none">
              Profile <span className="text-amber-500">Settings</span>
            </h1>
            <p className="text-zinc-500 text-xs font-medium mt-2">Manage your public presence and professional portfolio.</p>
            
            {/* Background Accent */}
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-amber-400/5 rounded-full blur-3xl group-hover:bg-amber-400/10 transition-colors -z-10" />
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar Tabs */}
            <div className="w-full md:w-72 shrink-0 space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-tighter transition-all relative overflow-hidden ${
                    activeTab === tab.id
                      ? "bg-amber-50 text-amber-600 border border-amber-200"
                      : "bg-white text-zinc-500 border border-transparent hover:bg-zinc-50 hover:text-zinc-900"
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500" />
                  )}
                </button>
              ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {activeTab === "general" && <BasicInfoForm user={user} />}
              {activeTab === "portfolio" && <PortfolioManager user={user} />}
              {activeTab === "cv" && <CVManager user={user} />}
              {activeTab === "skills" && <TechStackManager />}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
