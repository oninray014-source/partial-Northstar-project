import React, { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getLenis } from '../../lib/smoothScroll';

gsap.registerPlugin(ScrollTrigger);

export interface HomeScrollSectionProps {
  children: React.ReactNode;
  isFirst?: boolean;
  isLast?: boolean;
  className?: string;
  id?: string;
  zIndex?: number;
}

/**
 * Reusable wrapper for each major Home page section.
 * Provides isolated enter and exit transform layers so that GSAP ScrollTrigger
 * can coordinate continuous, visually obvious, architectural handoffs between
 * consecutive major sections while maintaining natural document flow.
 */
export const HomeScrollSection: React.FC<HomeScrollSectionProps> = ({
  children,
  isFirst = false,
  isLast = false,
  className = '',
  id,
  zIndex,
}) => {
  return (
    <section
      id={id}
      className={`home-scroll-section relative ${className}`}
      data-is-first={isFirst ? 'true' : undefined}
      data-is-last={isLast ? 'true' : undefined}
      style={{
        zIndex,
      }}
    >
      <div 
        className="home-scroll-exit w-full h-full relative"
        style={{
          transformOrigin: 'center 20%',
          willChange: 'transform',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
        }}
      >
        <div 
          className="home-scroll-enter w-full h-full relative"
          style={{
            transformOrigin: 'center top',
            willChange: 'transform',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
        >
          {/* Architectural elevation drop shadow along the top edge of incoming panels */}
          {!isFirst && (
            <div 
              className="pointer-events-none absolute -top-px left-0 right-0 h-6 shadow-[0_-20px_40px_-10px_rgba(6,59,53,0.12),0_-6px_16px_-4px_rgba(0,0,0,0.06)] z-20"
              aria-hidden="true"
            />
          )}
          {children}
        </div>
      </div>
    </section>
  );
};

/**
 * GSAP + ScrollTrigger coordinator for the Home page.
 * Creates scrubbed, continuous, visually prominent handoffs between
 * consecutive major sections.
 *
 * During scroll:
 * - Outgoing section visibly lifts/recedes upward (translateY: 0 -> -150px) and scales down (1.0 -> 0.94)
 * - Incoming section physically advances into the outgoing space with higher z-index and top shadow
 * - Halfway through, both sections are clearly visible in the viewport actively handing off to each other
 * - Scrolling upward reverses the exact transition
 */
export const useHomeScrollTransitions = (containerRef: React.RefObject<HTMLElement | null>) => {
  useEffect(() => {
    if (!containerRef.current || typeof window === 'undefined') return;

    // Accessibility: Respect user's preference for reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      return;
    }

    // 1. Connect to the shared global Lenis instance managed by PublicLayout
    const lenis = getLenis();
    lenis?.resize();

    let ctx: gsap.Context | null = null;
    let currentBreakpoint =
      window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop';

    const buildTransitions = () => {
      if (ctx) {
        ctx.revert();
      }

      ctx = gsap.context(() => {
        const sections = gsap.utils.toArray<HTMLElement>('.home-scroll-section', containerRef.current);
        if (sections.length < 2) return;

        const isMobile = window.innerWidth < 768;
        const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;

        // Transition parameters:
        // Desktop: 150px offset, outgoing scale 0.94, incoming scale 0.955
        // Tablet: 100px offset, outgoing scale 0.95, incoming scale 0.965
        // Mobile: 60px offset, outgoing scale 0.96, incoming scale 0.975
        const yOffset = isMobile ? 60 : isTablet ? 100 : 150;
        const minScaleOut = isMobile ? 0.96 : isTablet ? 0.95 : 0.94;
        const minScaleIn = isMobile ? 0.975 : isTablet ? 0.965 : 0.955;

        // Restrained internal reveal parameters (10% supporting effect):
        // As a section enters, only key elements progressively unfold into position
        const revealHeaderY = isMobile ? 8 : isTablet ? 12 : 18;
        const revealLeadY = isMobile ? 10 : isTablet ? 14 : 20;
        const revealCardY = isMobile ? 12 : isTablet ? 18 : 24;
        const revealScale = isMobile ? 0.995 : isTablet ? 0.99 : 0.985;
        const revealBaseOpacity = isMobile ? 0.85 : isTablet ? 0.75 : 0.65;

        // Process section specific card reveal parameters (subtle staggered upward rise)
        // Desktop: 55px vertical offset (within 40-70px range), 0.09s stagger, 0.45 base opacity
        // Tablet: 38px vertical offset, 0.07s stagger, 0.55 base opacity
        // Mobile: 22px vertical offset, 0.04s stagger, 0.70 base opacity
        const processCardY = isMobile ? 22 : isTablet ? 38 : 55;
        const processCardStagger = isMobile ? 0.04 : isTablet ? 0.07 : 0.09;
        const processCardDuration = isMobile ? 0.55 : isTablet ? 0.65 : 0.75;
        const processCardBaseOpacity = isMobile ? 0.7 : isTablet ? 0.55 : 0.45;

        // Configure layering & base negative margin on incoming sections for real physical overlap
        sections.forEach((sec, idx) => {
          sec.style.zIndex = `${(idx + 1) * 10}`;
          if (idx > 0) {
            gsap.set(sec, { marginTop: -yOffset });
          }
        });

        // Create scroll-linked handoff for each consecutive section boundary
        for (let i = 0; i < sections.length - 1; i++) {
          const prevSection = sections[i];
          const nextSection = sections[i + 1];

          const prevExit = prevSection.querySelector<HTMLElement>('.home-scroll-exit');
          const nextEnter = nextSection.querySelector<HTMLElement>('.home-scroll-enter');

          if (!prevExit || !nextEnter) continue;

          gsap.set(prevExit, {
            transformOrigin: 'center 20%',
            force3D: true,
          });

          gsap.set(nextEnter, {
            transformOrigin: 'center top',
            force3D: true,
          });

          // Single timeline for the boundary handoff tied continuously to scroll position
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: nextSection,
              start: 'top 88%',
              end: 'top 22%',
              scrub: 0.4,
              invalidateOnRefresh: true,
            },
          });

          // 1. Outgoing section visibly lifts & recedes upward, scaling down noticeably
          tl.to(
            prevExit,
            {
              y: -yOffset,
              scale: minScaleOut,
              ease: 'sine.inOut',
              force3D: true,
            },
            0
          );

          // 2. Incoming section physically advances into the outgoing space, scaling up to 1.0
          tl.fromTo(
            nextEnter,
            {
              y: yOffset,
              scale: minScaleIn,
              force3D: true,
            },
            {
              y: 0,
              scale: 1.0,
              ease: 'power2.out',
              force3D: true,
            },
            0
          );

          // 3. Restrained scroll-linked element reveals ("accordion-like" unfolding)
          // Elements unfold directly tied to scroll position (reversing naturally on scroll up)
          const headers = gsap.utils.toArray<HTMLElement>('[data-reveal="header"]', nextEnter);
          const leads = gsap.utils.toArray<HTMLElement>('[data-reveal="lead"]', nextEnter);
          const cards = gsap.utils.toArray<HTMLElement>('[data-reveal="card"]', nextEnter);
          const processCards = gsap.utils.toArray<HTMLElement>('[data-process-card]', nextEnter);

          if (headers.length > 0) {
            tl.fromTo(
              headers,
              {
                y: revealHeaderY,
                opacity: revealBaseOpacity,
                force3D: true,
              },
              {
                y: 0,
                opacity: 1,
                ease: 'power1.out',
                duration: 0.6,
                force3D: true,
              },
              0.08
            );
          }

          if (leads.length > 0) {
            tl.fromTo(
              leads,
              {
                y: revealLeadY,
                opacity: revealBaseOpacity,
                force3D: true,
              },
              {
                y: 0,
                opacity: 1,
                ease: 'power1.out',
                duration: 0.65,
                force3D: true,
              },
              0.16
            );
          }

          if (cards.length > 0) {
            tl.fromTo(
              cards,
              {
                y: revealCardY,
                scale: revealScale,
                opacity: revealBaseOpacity,
                force3D: true,
              },
              {
                y: 0,
                scale: 1.0,
                opacity: 1,
                ease: 'power2.out',
                duration: 0.75,
                stagger: isMobile ? 0.025 : 0.05,
                force3D: true,
              },
              0.22
            );
          }

          // Process section: 5 cards rise upward one-by-one with scroll-linked stagger
          if (processCards.length > 0) {
            tl.fromTo(
              processCards,
              {
                y: processCardY,
                opacity: processCardBaseOpacity,
                force3D: true,
              },
              {
                y: 0,
                opacity: 1,
                ease: 'power2.out',
                duration: processCardDuration,
                stagger: processCardStagger,
                force3D: true,
              },
              0.22
            );
          }
        }

        ScrollTrigger.refresh();
      }, containerRef);
    };

    buildTransitions();

    // Settle layout after initial render and route entrance
    const timer1 = setTimeout(() => ScrollTrigger.refresh(), 100);
    const timer2 = setTimeout(() => ScrollTrigger.refresh(), 650);

    // Handle responsive breakpoint changes & layout updates
    let resizeTimer: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const newBreakpoint =
          window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop';
        if (newBreakpoint !== currentBreakpoint) {
          currentBreakpoint = newBreakpoint;
          buildTransitions();
        } else {
          ScrollTrigger.refresh();
        }
      }, 150);
    };

    const handleLoad = () => ScrollTrigger.refresh();
    window.addEventListener('resize', handleResize);
    window.addEventListener('load', handleLoad);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('load', handleLoad);
      if (ctx) {
        ctx.revert();
      }
    };
  }, [containerRef]);
};
