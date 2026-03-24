"use client";

import { useState, useEffect } from "react";



import Sidebar from "@/components/layout/Sidebar";
import { useModalStore } from "@/store/modalStore";
import { ArrowRight, ChevronDown, Rocket, Users, Target, Zap, Building, MessageCircle, Trophy, MessageSquare, Cpu, Fingerprint, Shield, Globe } from "lucide-react";

export default function IntroPage() {
  const [mounted, setMounted] = useState(false);
  const { openRegister } = useModalStore();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return <div className="min-h-screen bg-black" />;

  return (
    <div className="flex bg-black">
      <Sidebar />
      <main className="flex-1 ml-20 h-screen overflow-y-auto snap-y snap-mandatory scroll-smooth hide-scrollbar hover-scrollbar">
        {/* Hero Section */}
        <section className="relative h-screen snap-start flex items-center justify-center overflow-hidden">
          <div 
            className="absolute inset-0 z-0 bg-cover bg-center bg-fixed"
            style={{ backgroundImage: "url('/images/intro/hero_bg.png')" }}
          />
          <div className="absolute inset-0 z-10 bg-black/40 backdrop-blur-[2px]" />
          
          <div className="relative z-20 text-center space-y-8 px-4 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold uppercase tracking-widest animate-in fade-in slide-in-from-top-4 duration-1000">
              <Zap size={14} /> The Future of Connection
            </div>
            <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter uppercase text-white leading-[0.9] animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
              Connect <br />
              <span className="text-amber-500">Beyond</span> Limits
            </h1>
            <p className="text-zinc-300 text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed animate-in fade-in duration-1000 delay-500">
              A high-end ecosystem bridging the gap between world-class talent and visionary employers.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-in fade-in zoom-in duration-1000 delay-700">
              <button 
                onClick={openRegister}
                className="group px-8 py-4 bg-amber-500 text-black font-black uppercase tracking-tighter italic rounded-full flex items-center gap-3 hover:bg-white transition-all duration-300 hover:scale-105"
              >
                Join With Us <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 animate-bounce text-white/30">
            <ChevronDown size={32} />
          </div>
        </section>

        {/* For Freelancers */}
        <section className="h-screen snap-start relative flex flex-col md:flex-row bg-white overflow-hidden">
          <div className="w-full md:w-1/2 p-12 md:p-24 flex flex-col justify-center space-y-8 z-10">
            <div className="w-16 h-1 bg-amber-500" />
            <h2 className="text-5xl font-black italic tracking-tighter uppercase text-zinc-900 leading-none">
              Empowering <br />
              <span className="text-amber-500 underline decoration-zinc-900/5">Freelancers</span>
            </h2>
            <div className="space-y-6 text-zinc-600 text-lg">
              <p className="font-medium">
                Focus on your craft. We handle the rest. FutureConnection provides you with high-quality job opportunities that match your specific skillset.
              </p>
              <ul className="space-y-4">
                {[
                  { icon: Target, text: "Curated Job Matching" },
                  { icon: Zap, text: "Instant Global Connections" },
                  { icon: Users, text: "Top-Tier Networking" }
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-4 font-bold uppercase tracking-widest text-xs text-zinc-400">
                    <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-amber-500">
                      <item.icon size={16} />
                    </div>
                    {item.text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="hidden md:block w-1/2 relative overflow-hidden group">
            <div 
              className="absolute inset-0 bg-cover bg-center grayscale hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100"
              style={{ backgroundImage: "url('/images/intro/freelancer_bg.png')" }}
            />
            <div className="absolute inset-0 bg-amber-500/10 mix-blend-multiply" />
          </div>
        </section>

        {/* For Employers */}
        <section className="h-screen snap-start relative flex flex-col md:flex-row-reverse bg-zinc-900 border-y border-white/5 overflow-hidden">
          <div className="w-full md:w-1/2 p-12 md:p-24 flex flex-col justify-center space-y-8 z-10">
            <div className="w-16 h-1 bg-amber-500" />
            <h2 className="text-5xl font-black italic tracking-tighter uppercase text-white leading-none">
              Architecting <br />
              <span className="text-amber-500">Talent</span> Solutions
            </h2>
            <div className="space-y-6 text-zinc-400 text-lg">
              <p className="font-medium text-zinc-300">
                Finding the right talent shouldn&apos;t be a gamble. Access our elite pool of verified professionals and scale your vision with precision.
              </p>
              <ul className="space-y-4">
                {[
                  { icon: Rocket, text: "Accelerated Hiring Flow" },
                  { icon: Target, text: "Verified Elite Talent" },
                  { icon: Building, text: "Enterprise Integration" }
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-4 font-bold uppercase tracking-widest text-xs text-zinc-500">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-amber-500 border border-white/10">
                      <item.icon size={16} />
                    </div>
                    {item.text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="hidden md:block w-1/2 relative overflow-hidden group">
            <div 
              className="absolute inset-0 bg-cover bg-center grayscale brightness-75 hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100"
              style={{ backgroundImage: "url('/images/intro/employer_bg.png')" }}
            />
            <div className="absolute inset-0 bg-black/40" />
          </div>
        </section>

        {/* Smart Matching Section */}
        <section className="h-screen snap-start relative flex items-center overflow-hidden bg-black">
          <div className="absolute inset-0 z-0">
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-40 scale-110"
              style={{ backgroundImage: "url('/images/intro/matching_bg.png')" }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
          </div>
          
          <div className="relative z-10 w-full max-w-7xl mx-auto px-12 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold uppercase tracking-widest">
                <Cpu size={14} /> AI Powered Precision
              </div>
              <h2 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase text-white leading-none">
                Smart <br/> <span className="text-amber-500">Discovery</span>
              </h2>
              <p className="text-zinc-400 text-lg font-medium leading-relaxed max-w-md">
                Our JobService uses advanced matching logic to connect the right talent with the perfect opportunity. No more endless searching.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-3xl font-black text-white italic tracking-tighter">98.7%</div>
                  <div className="text-zinc-500 text-xs uppercase font-bold">Accuracy Rate</div>
                </div>
                <div>
                  <div className="text-3xl font-black text-white italic tracking-tighter">Real-time</div>
                  <div className="text-zinc-500 text-xs uppercase font-bold">Matching Pulse</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Professional Identity Section */}
        <section className="h-screen snap-start relative flex items-center overflow-hidden bg-zinc-50">
          <div className="relative z-10 w-full max-w-7xl mx-auto px-12 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1 relative">
              <div className="absolute -inset-20 bg-amber-500/10 rounded-full blur-[120px] animate-pulse" />
              <div 
                className="relative rounded-[2.5rem] overflow-hidden aspect-[4/3] shadow-2xl shadow-black/20 border-4 border-white"
                style={{ backgroundImage: "url('/images/intro/identity_bg.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}
              />
            </div>
            
            <div className="order-1 md:order-2 space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/5 border border-black/10 text-black text-xs font-bold uppercase tracking-widest">
                <Fingerprint size={14} /> Profile DNA
              </div>
              <h2 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase text-zinc-900 leading-none">
                Digital <br/> <span className="text-amber-500">Identity</span>
              </h2>
              <p className="text-zinc-500 text-lg font-medium leading-relaxed">
                Curate your professional presence with our ProfileService. Beyond simple CVs—build a dynamic, verified portfolio that speaks for itself.
              </p>
              <ul className="space-y-4">
                {[
                  "Verified Skill Badges",
                  "Project Portfolio Hosting",
                  "CV Generation Tools",
                  "Performance Analytics"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-zinc-900 font-bold italic uppercase tracking-tighter">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Agency & Enterprise Section */}
        <section className="h-screen snap-start relative flex items-center overflow-hidden bg-black">
          <div className="absolute inset-0 z-0 opacity-40">
            <div 
              className="absolute inset-0 bg-cover bg-center grayscale hover:grayscale-0 transition-all duration-1000"
              style={{ backgroundImage: "url('/images/intro/agency_bg.png')" }}
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60" />

          <div className="relative z-10 max-w-4xl mx-auto px-12 text-center space-y-12">
            <div className="space-y-4">
              <h2 className="text-6xl md:text-8xl font-black italic tracking-tighter uppercase text-white leading-none">
                Enterprise <br/><span className="text-amber-500">Ecosystem</span>
              </h2>
              <p className="text-zinc-400 text-xl font-medium max-w-2xl mx-auto">
                Scale your business with our Agency and Contract management services. Built for large teams and complex long-term projects.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-8">
              {[
                { icon: Shield, label: "Secure Contracts" },
                { icon: Globe, label: "Agency Management" },
                { icon: Zap, label: "Instant Workflow" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                  <item.icon className="text-amber-500" size={20} />
                  <span className="text-white font-black italic uppercase tracking-tighter">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Social Ecosystem Section */}
        <section className="h-screen snap-start relative flex items-center justify-center overflow-hidden bg-zinc-50">
          <div 
            className="absolute inset-0 z-0 opacity-10 bg-cover bg-center"
            style={{ backgroundImage: "url('/images/intro/social_bg.png')" }}
          />
          <div className="relative z-10 max-w-6xl mx-auto px-12 text-center space-y-16">
            <div className="space-y-4">
              <h2 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase text-black leading-none">
                More Than Just <span className="text-amber-500">Work</span>
              </h2>
              <p className="text-zinc-500 text-xl font-medium max-w-2xl mx-auto">
                A thriving ecosystem where developers connect, contribute, and grow together.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { 
                  icon: MessageCircle, 
                  title: "Interactive Q&A", 
                  desc: "Share knowledge and solve complex challenges in our community-driven Q&A hub." 
                },
                { 
                  icon: Trophy, 
                  title: "Elite Badges", 
                  desc: "Earn recognition for your contributions. From 'Bug Hunter' to 'Top Contributor'." 
                },
                { 
                  icon: MessageSquare, 
                  title: "Social Growth", 
                  desc: "Real-time chat and study groups to support colleagues and master new skills." 
                }
              ].map((feature, i) => (
                <div key={i} className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-xl shadow-zinc-200/50 space-y-6 hover:-translate-y-2 transition-transform duration-500 text-left">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500 text-black flex items-center justify-center shadow-lg shadow-amber-500/20">
                    <feature.icon size={28} />
                  </div>
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter text-zinc-900">{feature.title}</h3>
                  <p className="text-zinc-500 font-medium leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="h-screen snap-start relative flex items-center justify-center overflow-hidden bg-black">
          <div 
            className="absolute inset-0 z-0 opacity-40 bg-cover bg-center mix-blend-screen"
            style={{ backgroundImage: "url('/images/intro/cta_bg.png')" }}
          />
          <div className="absolute inset-0 z-10 bg-radial-gradient from-transparent to-black" />

          <div className="relative z-20 text-center space-y-12 px-4 max-w-4xl mx-auto">
            <h2 className="text-6xl md:text-8xl font-black italic tracking-tighter uppercase text-white leading-none">
              Ready to <span className="text-amber-500">Connect?</span>
            </h2>
            <p className="text-zinc-400 text-xl font-medium max-w-xl mx-auto">
              Join thousands of professionals already building the future on our platform.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
              <button 
                onClick={openRegister}
                className="w-full sm:w-auto px-12 py-5 bg-white text-black font-black uppercase tracking-tighter italic rounded-full text-lg hover:bg-amber-500 transition-all duration-300 hover:scale-105 shadow-[0_0_50px_rgba(255,255,255,0.1)]"
              >
                Get Started Now
              </button>
            </div>
          </div>
          
          <footer className="absolute bottom-12 left-0 w-full text-center z-20">
            <p className="text-zinc-600 text-[10px] uppercase font-bold tracking-[0.4em]">
              © 2026 FutureConnection • All Rights Reserved
            </p>
          </footer>
        </section>
      </main>

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hover-scrollbar:hover::-webkit-scrollbar {
          display: block;
          width: 5px;
        }
        .hover-scrollbar:hover::-webkit-scrollbar-thumb {
          background: #333;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
