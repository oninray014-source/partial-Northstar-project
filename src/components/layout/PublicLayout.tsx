import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { initGlobalLenis, getLenis, destroyGlobalLenis } from '../../lib/smoothScroll';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export const PublicLayout: React.FC = () => {
  const location = useLocation();

  // Initialize single global Lenis instance across all public routes
  useEffect(() => {
    initGlobalLenis();

    return () => {
      destroyGlobalLenis();
    };
  }, []);

  // Handle route change scroll position & dimension sync
  useEffect(() => {
    const lenis = getLenis();
    if (!location.hash) {
      if (lenis) {
        lenis.scrollTo(0, { immediate: true });
      } else {
        window.scrollTo(0, 0);
      }
    }

    // Refresh Lenis dimensions and ScrollTrigger after page transition settles
    const timer = setTimeout(() => {
      lenis?.resize();
      ScrollTrigger.refresh();
    }, 150);

    return () => clearTimeout(timer);
  }, [location.pathname, location.hash]);

  return (
    <div className="flex flex-col min-h-screen bg-[#F3F7F5] text-[#102A2A]">
      <Navbar />
      <div className="flex-1 flex flex-col relative w-full">
        <AnimatePresence mode="wait" initial={false}>
          <motion.main
            key={location.pathname}
            initial={{ opacity: 0, y: 48 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -48 }}
            transition={{
              duration: 0.6,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="flex-1 w-full"
          >
            <Outlet />
          </motion.main>
        </AnimatePresence>
      </div>
      <Footer />
    </div>
  );
};
