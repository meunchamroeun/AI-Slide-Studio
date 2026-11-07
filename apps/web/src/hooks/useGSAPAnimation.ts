import { useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { AnimationPreset, ElementAnimation } from '@ai-slide-studio/shared';

export function useGSAPAnimation(activeSlideId: string, animationConfig?: ElementAnimation) {
  const containerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  const runAnimation = useCallback(() => {
    if (!containerRef.current) return;

    // Clean up previous timeline to prevent memory leaks
    if (timelineRef.current) {
      timelineRef.current.kill();
      timelineRef.current = null;
    }

    const preset: AnimationPreset = animationConfig?.preset || 'fade-in';
    const duration = animationConfig?.duration || 0.8;
    const delay = animationConfig?.delay || 0;
    const easing = animationConfig?.easing || 'power2.out';

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay });
      timelineRef.current = tl;

      const title = containerRef.current?.querySelector('[data-animate="title"]');
      const subtitle = containerRef.current?.querySelector('[data-animate="subtitle"]');
      const badge = containerRef.current?.querySelector('[data-animate="badge"]');
      const cards = containerRef.current?.querySelectorAll('[data-animate="card"]');
      const bullets = containerRef.current?.querySelectorAll('[data-animate="bullet"]');
      const counters = containerRef.current?.querySelectorAll('[data-animate="counter"]');
      const generic = containerRef.current?.querySelectorAll('[data-animate="generic"]');

      // 1. Badge
      if (badge) {
        tl.fromTo(badge, { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' });
      }

      // 2. Title & Subtitle
      if (title) {
        switch (preset) {
          case 'slide-in-left':
            tl.fromTo(title, { opacity: 0, x: -60 }, { opacity: 1, x: 0, duration, ease: easing }, '-=0.2');
            break;
          case 'slide-in-right':
            tl.fromTo(title, { opacity: 0, x: 60 }, { opacity: 1, x: 0, duration, ease: easing }, '-=0.2');
            break;
          case 'slide-in-up':
            tl.fromTo(title, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration, ease: easing }, '-=0.2');
            break;
          case 'slide-in-down':
            tl.fromTo(title, { opacity: 0, y: -50 }, { opacity: 1, y: 0, duration, ease: easing }, '-=0.2');
            break;
          case 'zoom-in':
            tl.fromTo(title, { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration, ease: 'back.out(1.4)' }, '-=0.2');
            break;
          case 'zoom-out':
            tl.fromTo(title, { opacity: 0, scale: 1.15 }, { opacity: 1, scale: 1, duration, ease: easing }, '-=0.2');
            break;
          case 'blur-in':
            tl.fromTo(title, { opacity: 0, filter: 'blur(12px)' }, { opacity: 1, filter: 'blur(0px)', duration: duration * 1.2, ease: easing }, '-=0.2');
            break;
          case 'rotate':
            tl.fromTo(title, { opacity: 0, rotation: -4, y: 20 }, { opacity: 1, rotation: 0, y: 0, duration, ease: easing }, '-=0.2');
            break;
          case 'fade-in':
          default:
            tl.fromTo(title, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration, ease: easing }, '-=0.2');
            break;
        }
      }

      if (subtitle) {
        tl.fromTo(subtitle, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '-=0.4');
      }

      // 3. Cards Stagger
      if (cards && cards.length > 0) {
        tl.fromTo(
          cards,
          { opacity: 0, y: 35, scale: 0.96 },
          { opacity: 1, y: 0, scale: 1, duration: 0.65, stagger: 0.12, ease: 'power2.out' },
          '-=0.2',
        );
      }

      // 4. Bullets Stagger
      if (bullets && bullets.length > 0) {
        tl.fromTo(
          bullets,
          { opacity: 0, x: -20 },
          { opacity: 1, x: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out' },
          '-=0.3',
        );
      }

      // 5. Generic items
      if (generic && generic.length > 0) {
        tl.fromTo(generic, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out' }, '-=0.3');
      }

      // 6. Number Counter Animations
      if (counters && counters.length > 0) {
        counters.forEach((counterEl) => {
          const rawTarget = counterEl.getAttribute('data-value') || counterEl.textContent || '0';
          const numericTarget = parseFloat(rawTarget.replace(/[^0-9.]/g, '')) || 0;
          const suffix = counterEl.getAttribute('data-suffix') || '';

          if (numericTarget > 0) {
            const obj = { val: 0 };
            tl.to(
              obj,
              {
                val: numericTarget,
                duration: 1.2,
                ease: 'power3.out',
                onUpdate: () => {
                  const current = numericTarget % 1 === 0 ? Math.round(obj.val) : obj.val.toFixed(1);
                  counterEl.textContent = `${current}${suffix}`;
                },
              },
              '-=0.5',
            );
          }
        });
      }
    }, containerRef);

    return () => {
      ctx.revert();
    };
  }, [animationConfig, activeSlideId]);

  useEffect(() => {
    const cleanup = runAnimation();
    return () => {
      if (cleanup) cleanup();
      if (timelineRef.current) {
        timelineRef.current.kill();
        timelineRef.current = null;
      }
    };
  }, [runAnimation, activeSlideId]);

  return { containerRef, replay: runAnimation };
}
