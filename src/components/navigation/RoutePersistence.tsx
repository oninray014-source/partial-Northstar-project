import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export const ROUTE_STORAGE_KEY = 'northstar_active_route';

/**
 * Whitelist of known static application routes.
 */
const STATIC_VALID_ROUTES = new Set([
  '/',
  '/services',
  '/industries',
  '/about',
  '/contact',
  '/login',
  '/workspace',
  '/workspace/dashboard',
  '/workspace/leads',
  '/workspace/pipeline',
  '/workspace/properties',
  '/workspace/tasks',
  '/workspace/calendar',
  '/workspace/team',
  '/workspace/activity',
  '/workspace/settings',
]);

/**
 * Regex patterns for known parameterized routes.
 */
const DYNAMIC_ROUTE_PATTERNS = [
  /^\/workspace\/leads\/[a-zA-Z0-9_-]+$/,
  /^\/workspace\/properties\/[a-zA-Z0-9_-]+$/,
];

/**
 * Validates that a route target is a safe, internal, authorized Northstar route.
 * Rejects external URLs, protocol-relative URLs, control characters, and unknown paths.
 */
export function isValidInternalRoute(path: unknown): boolean {
  if (typeof path !== 'string' || !path.trim()) {
    return false;
  }

  const trimmed = path.trim();
  if (trimmed.length > 500) {
    return false;
  }

  // Must begin with a single forward slash; reject protocol-relative (//) or backslash (\)
  if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.includes('\\')) {
    return false;
  }

  // Reject dangerous pseudo-protocols
  const lower = trimmed.toLowerCase();
  if (
    lower.includes('javascript:') ||
    lower.includes('data:') ||
    lower.includes('vbscript:')
  ) {
    return false;
  }

  try {
    const url = new URL(trimmed, 'https://northstar.internal');
    if (url.origin !== 'https://northstar.internal') {
      return false;
    }

    const pathname = url.pathname;
    if (STATIC_VALID_ROUTES.has(pathname)) {
      return true;
    }

    for (const pattern of DYNAMIC_ROUTE_PATTERNS) {
      if (pattern.test(pathname)) {
        return true;
      }
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Clears the saved route from sessionStorage.
 * Invoked during explicit sign-out or session invalidation.
 */
export function clearSavedRoute(): void {
  try {
    sessionStorage.removeItem(ROUTE_STORAGE_KEY);
  } catch {
    // Graceful fallback for restricted storage environments
  }
}

/**
 * Retrieves the saved route from sessionStorage.
 */
export function getSavedRoute(): string | null {
  try {
    return sessionStorage.getItem(ROUTE_STORAGE_KEY);
  } catch {
    return null;
  }
}

/**
 * Persists the current internal route to sessionStorage.
 */
export function saveCurrentRoute(fullPath: string): void {
  try {
    sessionStorage.setItem(ROUTE_STORAGE_KEY, fullPath);
  } catch {
    // Graceful fallback for restricted storage environments
  }
}

/**
 * Headless route persistence component.
 * - Restores saved route on cold initial mount if preview container reset to root '/'.
 * - Continuously tracks in-app route transitions to keep sessionStorage in sync.
 * - Guarantees intentional Home navigation remains at '/' and is not overridden.
 */
export const RoutePersistence: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const hasRestoredRef = useRef<boolean>(false);

  // 1. One-time restoration check on cold mount
  useEffect(() => {
    if (hasRestoredRef.current) {
      return;
    }
    hasRestoredRef.current = true;

    // In preview container environments, iframe refreshes load initial src="/"
    if (window.location.pathname === '/') {
      const saved = getSavedRoute();
      if (saved && saved !== '/' && isValidInternalRoute(saved)) {
        navigate(saved, { replace: true });
        return;
      }
    }

    // If initial location was already valid, record it
    const currentFullPath = location.pathname + location.search + location.hash;
    if (isValidInternalRoute(currentFullPath)) {
      saveCurrentRoute(currentFullPath);
    }
  }, [navigate]); // Stable dependency, runs once on component mount

  // 2. Continuous tracking on runtime route changes
  useEffect(() => {
    if (!hasRestoredRef.current) {
      return;
    }

    const currentFullPath = location.pathname + location.search + location.hash;
    if (isValidInternalRoute(currentFullPath)) {
      saveCurrentRoute(currentFullPath);
    }
  }, [location.pathname, location.search, location.hash]);

  return null;
};
