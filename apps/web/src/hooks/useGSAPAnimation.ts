import { useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { AnimationPreset, ElementAnimation } from '@ai-slide-studio/shared';

export function useGSAPAnimation(
  activeSlideId: string,
  animationConfig?: ElementAnimation,
  replayTrigger?: number,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  const runAnimation = useCallback(() => {
    if (!containerRef.current) return;

    // Clean up previous timeline to prevent memory leaks or stuck states
    if (timelineRef.current) {
      timelineRef.current.kill();
      timelineRef.current = null;
    }

    const preset: AnimationPreset = animationConfig?.preset || 'fade-in';
    const duration = animationConfig?.duration || 0.65;
    const delay = animationConfig?.delay || 0;
    const easing = animationConfig?.easing || 'power4.out';

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

      // 1. Eyebrow Badge (Subtle float-down, critically damped)
      if (badge) {
        tl.fromTo(
          badge,
          { opacity: 0, y: -8, scale: 0.96 },
          { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: 'power3.out' },
        );
      }

      // 2. Title & Subtitle (Apple Keynote micro-motions: 16-20px, blur clearance, no large leaps)
      if (title) {
        switch (preset) {
          case 'slide-in-left':
            tl.fromTo(title, { opacity: 0, x: -28, filter: 'blur(4px)' }, { opacity: 1, x: 0, filter: 'blur(0px)', duration, ease: easing }, '-=0.2');
            break;
          case 'slide-in-right':
            tl.fromTo(title, { opacity: 0, x: 28, filter: 'blur(4px)' }, { opacity: 1, x: 0, filter: 'blur(0px)', duration, ease: easing }, '-=0.2');
            break;
          case 'slide-in-up':
            tl.fromTo(title, { opacity: 0, y: 22, filter: 'blur(4px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration, ease: easing }, '-=0.2');
            break;
          case 'slide-in-down':
            tl.fromTo(title, { opacity: 0, y: -22, filter: 'blur(4px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration, ease: easing }, '-=0.2');
            break;
          case 'zoom-in':
            tl.fromTo(title, { opacity: 0, scale: 0.95, filter: 'blur(6px)' }, { opacity: 1, scale: 1, filter: 'blur(0px)', duration, ease: 'power4.out' }, '-=0.2');
            break;
          case 'zoom-out':
            tl.fromTo(title, { opacity: 0, scale: 1.05, filter: 'blur(6px)' }, { opacity: 1, scale: 1, filter: 'blur(0px)', duration, ease: easing }, '-=0.2');
            break;
          case 'blur-in':
            tl.fromTo(title, { opacity: 0, filter: 'blur(12px)', scale: 0.98 }, { opacity: 1, filter: 'blur(0px)', scale: 1, duration: duration * 1.05, ease: easing }, '-=0.2');
            break;
          case 'rotate':
            tl.fromTo(title, { opacity: 0, rotation: -2, y: 16, filter: 'blur(4px)' }, { opacity: 1, rotation: 0, y: 0, filter: 'blur(0px)', duration, ease: easing }, '-=0.2');
            break;
          case 'typewriter':
            tl.fromTo(title, { opacity: 0, clipPath: 'inset(0 100% 0 0)' }, { opacity: 1, clipPath: 'inset(0 0% 0 0)', duration: 0.9, ease: 'steps(24)' }, '-=0.2');
            break;
          case 'stagger-text':
            tl.fromTo(title, { opacity: 0, y: 18, letterSpacing: '0.02em', filter: 'blur(4px)' }, { opacity: 1, y: 0, letterSpacing: '-0.03em', filter: 'blur(0px)', duration: 0.75, ease: 'power4.out' }, '-=0.2');
            break;
          case 'reveal':
            tl.fromTo(title, { opacity: 0, clipPath: 'inset(0 100% 0 0)' }, { opacity: 1, clipPath: 'inset(0 0% 0 0)', duration: 0.7, ease: 'power4.inOut' }, '-=0.2');
            break;
          case 'parallax':
            tl.fromTo(title, { opacity: 0, y: 32, filter: 'blur(4px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.8, ease: 'power3.out' }, '-=0.2');
            break;
          case 'fade-out':
            tl.fromTo(title, { opacity: 1, y: 0 }, { opacity: 0.3, y: -10, duration, ease: easing });
            break;
          case 'fade-in':
          default:
            tl.fromTo(title, { opacity: 0, y: 18, filter: 'blur(4px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration, ease: easing }, '-=0.2');
            break;
        }
      }

      if (subtitle) {
        tl.fromTo(subtitle, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out' }, '-=0.25');
      }

      // 3. Luxury Glass Cards Stagger (Tight 65ms cadence, micro-rise with soft scale)
      if (cards && cards.length > 0) {
        tl.fromTo(
          cards,
          { opacity: 0, y: 20, scale: 0.97, filter: 'blur(3px)' },
          { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 0.55, stagger: 0.065, ease: 'power4.out' },
          '-=0.2',
        );
      }

      // 4. Bullet Points Stagger (Subtle left-slide & pop)
      if (bullets && bullets.length > 0) {
        tl.fromTo(
          bullets,
          { opacity: 0, x: -14 },
          { opacity: 1, x: 0, duration: 0.4, stagger: 0.05, ease: 'power3.out' },
          '-=0.25',
        );
      }

      // 5. Generic items / Buttons / CTA
      if (generic && generic.length > 0) {
        tl.fromTo(
          generic,
          { opacity: 0, y: 16, scale: 0.97 },
          { opacity: 1, y: 0, scale: 1, duration: 0.45, stagger: 0.06, ease: 'power3.out' },
          '-=0.2',
        );
      }

      // 6. Number Counter Live Count-Up with cubic deceleration
      if (counters && counters.length > 0) {
        counters.forEach((counterEl) => {
          const rawTarget = counterEl.getAttribute('data-value') || counterEl.textContent || '0';
          const numericTarget = parseFloat(rawTarget.replace(/[^0-9.]/g, '')) || 0;
          const suffix = counterEl.getAttribute('data-suffix') || '';
          const prefix = counterEl.getAttribute('data-prefix') || '';

          if (numericTarget > 0) {
            const obj = { val: 0 };
            tl.to(
              obj,
              {
                val: numericTarget,
                duration: 1.1,
                ease: 'power3.out',
                onUpdate: () => {
                  const current = numericTarget % 1 === 0 ? Math.round(obj.val) : obj.val.toFixed(1);
                  counterEl.textContent = `${prefix}${current}${suffix}`;
                },
              },
              '-=0.4',
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
  }, [runAnimation, activeSlideId, replayTrigger]);

  return { containerRef, replay: runAnimation };
}
