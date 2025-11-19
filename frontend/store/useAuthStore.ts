import { create } from 'zustand';
import type { User } from '@/types';
import { onAuthChange, signOut as firebaseSignOut } from '@/lib/firebase/auth';
import { getUserByUid } from '@/lib/firestore/users';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true, // Start with loading state

  setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),

  logout: async () => {
    try {
      await firebaseSignOut();
      set({ user: null, isAuthenticated: false });
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  initialize: () => {
    // Listen to Firebase Auth state changes
    onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in, get full user data from Firestore
        try {
          const user = await getUserByUid(firebaseUser.uid);
          if (user) {
            set({ user, isAuthenticated: true, isLoading: false });
          } else {
            // Firebase user exists but no Firestore document
            set({ user: null, isAuthenticated: false, isLoading: false });
          }
        } catch (error) {
          console.error('Error loading user:', error);
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      } else {
        // User is signed out
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    });
  },
}));
