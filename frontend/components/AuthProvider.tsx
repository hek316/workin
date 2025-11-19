'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';

/**
 * AuthProvider component to initialize Firebase Auth state listener
 * Must be used in a Client Component
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    // Initialize auth listener on mount only once
    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run once on mount

  return <>{children}</>;
}
