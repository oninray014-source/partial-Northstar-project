import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

let globalLenis: Lenis | null = null;
let lenisTicker: ((time: number) => void) | null = null;

/**
 * Access the single active global Lenis instance.
 */
export function getLenis(): Lenis | null {
  return globalLenis;
}

/**
 * Initialize single global Lenis instance across all public pages.
 * Reuses the approved Lenis configuration with noticeable inertial momentum
 * and exponential deceleration physics.
 */
export function initGlobalLenis(): Lenis | null {
  if (typeof window === 'undefined') return null;
  if (globalLenis) return globalLenis;

  // Accessibility: Respect user's preference for reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    return null;
  }

  try {
    globalLenis = new Lenis({
      duration: 1.05, // Noticeable inertial momentum and smooth deceleration
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Exponential deceleration curve
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0, // Natural 1:1 wheel response
      touchMultiplier: 1.0, // Native touch fidelity on mobile
      syncTouch: false, // Natural native mobile touch behavior
      autoRaf: false, // Driven synchronously by GSAP ticker
      anchors: true, // Seamless anchor / hash jump scrolling
    });

    // Synchronize Lenis scroll with GSAP ScrollTrigger
    globalLenis.on('scroll', ScrollTrigger.update);

    // Single ticker loop driving Lenis via GSAP ticker
    lenisTicker = (time: number) => {
      globalLenis?.raf(time * 1000);
    };

    gsap.ticker.add(lenisTicker);
    gsap.ticker.lagSmoothing(0);

    // Expose instance for global access
    (window as any).__lenis = globalLenis;

    return globalLenis;
  } catch (err) {
    console.warn('Global Lenis initialization skipped:', err);
    return null;
  }
}

/**
 * Destroy the global Lenis instance and clean up GSAP ticker.
 */
export function destroyGlobalLenis() {
  if (lenisTicker) {
    gsap.ticker.remove(lenisTicker);
    lenisTicker = null;
  }
  if (globalLenis) {
    globalLenis.destroy();
    globalLenis = null;
    delete (window as any).__lenis;
    document.documentElement.classList.remove('lenis', 'lenis-smooth', 'lenis-scrolling');
  }
}
