import React, { Suspense } from 'react';
import { AuthCard } from '@/components/auth/auth-card';
import { AuthTopBar } from '@/components/auth/auth-aside';

export const metadata = {
  title: 'Create Account · AI Slide Studio',
  description: 'Create an account to start generating presentations with Gemini and GSAP.',
};

export default function RegisterPage() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-20 bg-background">
      <AuthTopBar />
      <Suspense fallback={<div className="h-96 w-full max-w-[420px] rounded-3xl bg-card/50 animate-pulse" />}>
        <AuthCard mode="register" />
      </Suspense>
    </section>
  );
}
