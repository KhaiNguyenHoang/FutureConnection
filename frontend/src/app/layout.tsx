import type { Metadata } from 'next';
import './globals.css';
import Providers from '@/components/Providers';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import VerificationGate from '@/components/auth/VerificationGate';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'FutureConnection',
  description: 'The professional network for the next generation of builders.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <body className="h-full bg-slate-50 dark:bg-slate-950 antialiased">
        <Providers>
          <Navbar />
          <div className="flex min-h-[calc(100vh-4rem)] mt-16">
            <main className="flex-1 w-full md:mr-64">
              <VerificationGate>
                {children}
              </VerificationGate>
            </main>
            <Sidebar />
          </div>
          <Toaster position="top-right" richColors closeButton />
        </Providers>
      </body>
    </html>
  );
}
