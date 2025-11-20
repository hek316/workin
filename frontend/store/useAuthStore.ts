import { create } from 'zustand';
import type { User } from '@/types';
import { onAuthChange, signOut as firebaseSignOut } from '@/lib/firebase/auth';
import { getUserByUid } from '@/lib/firestore/users';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  isSigningUp: boolean; // Flag to prevent race condition during signup
  setUser: (user: User | null) => void;
  setSigningUp: (value: boolean) => void;
  logout: () => Promise<void>;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true, // Start with loading state
  isInitialized: false,
  isSigningUp: false,

  setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false, isSigningUp: false }),

  setSigningUp: (value) => set({ isSigningUp: value }),

  logout: async () => {
    try {
      await firebaseSignOut();
      set({ user: null, isAuthenticated: false });
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  initialize: () => {
    // If already initialized, don't create another listener
    if (get().isInitialized) {
      console.log('Auth already initialized, skipping...');
      return;
    }

    console.log('Initializing auth listener...');
    set({ isInitialized: true });

    // Listen to Firebase Auth state changes
    onAuthChange(async (firebaseUser) => {
      console.log('onAuthStateChanged fired:', firebaseUser?.uid || 'no user');

      // If signup is in progress, skip fetching from Firestore
      // The signup page will handle setting the user directly
      if (get().isSigningUp) {
        console.log('Signup in progress, skipping Firestore fetch');
        return;
      }

      if (firebaseUser) {
        // User is signed in, get full user data from Firestore
        try {
          console.log('Fetching user from Firestore...');
          const user = await getUserByUid(firebaseUser.uid);
          console.log('Firestore user fetched:', user?.email || 'not found');

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
        console.log('No user, setting isLoading to false');
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    });
  },
}));
