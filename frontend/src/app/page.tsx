'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Globe, Users, Briefcase, MessageSquare, BookOpen, ArrowRight, CheckCircle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function LandingPage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) router.replace('/feed');
  }, [isAuthenticated, router]);

  if (isAuthenticated) return null;

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white py-24 px-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent" />
        <div className="relative max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 bg-blue-600/20 border border-blue-500/30 rounded-full px-4 py-1.5 text-sm text-blue-300">
            <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            The professional network for builders
          </div>

          <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-tight">
            Connect. Build.
            <br />
            <span className="text-blue-400">Grow Together.</span>
          </h1>

          <p className="text-xl text-slate-300 max-w-4xl mx-auto">
            FutureConnection combines a professional network, freelance marketplace, community Q&A, and real-time chat — everything you need to thrive.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3.5 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/25"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 border border-slate-600 text-slate-300 px-8 py-3.5 rounded-xl font-semibold text-sm hover:border-slate-400 hover:text-white transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-white dark:bg-slate-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Everything in one place</h2>
            <p className="text-slate-500 mt-2">Built for freelancers, employers, and teams.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Users,
                title: 'Professional Network',
                description: 'Connect with professionals, follow companies, and grow your network with meaningful connections.',
                color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/30',
              },
              {
                icon: Briefcase,
                title: 'Freelance Marketplace',
                description: 'Find jobs, manage contracts with milestones, handle disputes, and get paid securely.',
                color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/30',
              },
              {
                icon: BookOpen,
                title: 'Community Q&A',
                description: 'Ask questions, earn reputation, award bounties, and build credibility in your field.',
                color: 'text-green-600 bg-green-50 dark:bg-green-900/30',
              },
              {
                icon: MessageSquare,
                title: 'Real-Time Chat',
                description: 'DM professionals and collaborate in group chats with live SignalR-powered messaging.',
                color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/30',
              },
              {
                icon: Globe,
                title: 'Company Pages',
                description: 'Follow companies, view open positions, and stay updated on industry news.',
                color: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-900/30',
              },
              {
                icon: CheckCircle,
                title: 'Verified Profiles',
                description: 'Build trust with verified credentials, endorsements, and a public portfolio.',
                color: 'text-pink-600 bg-pink-50 dark:bg-pink-900/30',
              },
            ].map((feature) => (
              <div key={feature.title} className="p-6 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 transition-all">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${feature.color}`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-blue-600 text-white text-center">
        <div className="max-w-xl mx-auto space-y-6">
          <h2 className="text-3xl font-bold">Ready to get started?</h2>
          <p className="text-blue-100">Join thousands of professionals already building their future.</p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-3.5 rounded-xl font-semibold text-sm hover:bg-blue-50 transition-colors"
          >
            Create your account
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
