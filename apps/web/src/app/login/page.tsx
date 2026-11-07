import React, { Suspense } from 'react';
import { AuthCard } from '@/components/auth/auth-card';
import { AuthTopBar } from '@/components/auth/auth-aside';

export const metadata = {
  title: 'Sign in · AI Slide Studio',
  description: 'Sign in to access your animated presentations and AI generator studio.',
};

export default function LoginPage() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-20 bg-background">
      <AuthTopBar />
      <Suspense fallback={<div className="h-96 w-full max-w-[420px] rounded-3xl bg-card/50 animate-pulse" />}>
        <AuthCard mode="signin" />
      </Suspense>
    </section>
  );
}
