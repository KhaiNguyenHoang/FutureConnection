'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

// Pages that are accessible even without email verification
const PUBLIC_PATHS = [
  '/login',
  '/register',
  '/check-your-email',
  '/verify-email',
  '/forgot-password',
  '/reset-password',
  '/oauth',
  '/onboarding',
];

export default function VerificationGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isEmailVerified } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p)) || pathname === '/';

  useEffect(() => {
    if (isAuthenticated && !isEmailVerified && !isPublic) {
      router.replace('/check-your-email');
    }
  }, [isAuthenticated, isEmailVerified, isPublic, router]);

  // Block render for protected pages until verified
  if (isAuthenticated && !isEmailVerified && !isPublic) {
    return null;
  }

  return <>{children}</>;
}
