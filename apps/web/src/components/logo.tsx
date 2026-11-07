import React from 'react';
import Link from 'next/link';

export function LogoMark({ className = 'size-7' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="ss-brand-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>
        <linearGradient id="ss-glass-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(255, 255, 255, 0.12)" />
          <stop offset="100%" stopColor="rgba(255, 255, 255, 0.02)" />
        </linearGradient>
        <filter id="ss-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Back Layer Deck (Tilted presentation slide) */}
      <rect
        x="6"
        y="5"
        width="22"
        height="15"
        rx="3.5"
        transform="rotate(-8 17 12.5)"
        stroke="url(#ss-brand-grad)"
        strokeWidth="1.6"
        strokeOpacity="0.4"
        fill="currentColor"
        fillOpacity="0.08"
      />

      {/* Mid Layer Deck */}
      <rect
        x="8.5"
        y="9.5"
        width="22"
        height="15"
        rx="3.5"
        transform="rotate(-4 19.5 17)"
        stroke="url(#ss-brand-grad)"
        strokeWidth="1.6"
        strokeOpacity="0.7"
        fill="currentColor"
        fillOpacity="0.12"
      />

      {/* Front Primary Presentation Slide */}
      <rect
        x="7"
        y="12"
        width="24"
        height="16"
        rx="3.8"
        fill="url(#ss-glass-grad)"
        stroke="url(#ss-brand-grad)"
        strokeWidth="1.8"
        filter="url(#ss-glow)"
      />

      {/* Slide Content Header Bar */}
      <rect x="10.5" y="15.5" width="8" height="2" rx="1" fill="url(#ss-brand-grad)" />

      {/* Slide Content Lines */}
      <rect x="10.5" y="19.5" width="10" height="1.5" rx="0.75" fill="currentColor" fillOpacity="0.5" />
      <rect x="10.5" y="23" width="6.5" height="1.5" rx="0.75" fill="currentColor" fillOpacity="0.3" />

      {/* Kinetic Animation Arrow / Sparkle on Front Slide */}
      <path
        d="M23.5 17.5L28.5 20.5L23.5 23.5V17.5Z"
        fill="url(#ss-brand-grad)"
      />
    </svg>
  );
}

export function Logo({
  href = '/',
  showBadge = true,
  className = '',
}: {
  href?: string;
  showBadge?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      aria-label="SlideStudio.ai"
      className={`group inline-flex items-center gap-2.5 font-serif font-medium text-foreground tracking-tight transition-opacity hover:opacity-90 ${className}`}
    >
      <div className="relative flex items-center justify-center">
        <div className="absolute -inset-1 rounded-xl bg-brand/25 blur-md opacity-40 group-hover:opacity-75 transition-opacity duration-300" />
        <LogoMark className="relative size-7 shrink-0 text-foreground" />
      </div>
      <span className="flex items-center text-base sm:text-lg font-serif font-semibold tracking-tight text-foreground">
        SlideStudio
        <span className="text-brand">.ai</span>
      </span>
      {showBadge && (
        <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-brand/10 text-brand border border-brand/25">
          PRO
        </span>
      )}
    </Link>
  );
}
