import { create } from 'zustand';
import { User, UserPreferences } from '@/types';
import { AuthService } from '@/services/auth.service';


interface AuthStoreState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  checkAuth: () => Promise<void>;
  login: (email: string, password?: string) => Promise<void>;
  register: (name: string, email: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<void>;
}

export const useAuthStore = create<AuthStoreState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,


  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const user = await AuthService.getCurrentUser();
      set({ user, isAuthenticated: !!user, isLoading: false });
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (email: string, password?: string) => {
    set({ isLoading: true });
    try {
      const user = await AuthService.login(email, password);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  register: async (name: string, email: string, password?: string) => {
    set({ isLoading: true });
    try {
      const user = await AuthService.register(name, email, password);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    await AuthService.logout();
    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  updatePreferences: async (preferences) => {
    const updatedPreferences = await AuthService.updatePreferences(preferences);
    set((state) => ({
      user: state.user
        ? { ...state.user, preferences: updatedPreferences }
        : null,
    }));
  },
}));

