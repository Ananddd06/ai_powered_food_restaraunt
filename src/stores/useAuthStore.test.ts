import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuthStore } from './useAuthStore';
import { AuthService } from '@/services/auth.service';

vi.mock('@/services/auth.service', () => ({
  AuthService: {
    getCurrentUser: vi.fn(),
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    updatePreferences: vi.fn(),
  },
}));

describe('useAuthStore', () => {
  const mockUser = {
    id: 'user-1',
    name: 'Anand Kumar',
    email: 'anand@example.com',
    avatarUrl: 'https://example.com/avatar.jpg',
    preferences: {
      preferredCuisines: ['South Indian', 'Chettinad'],
      budgetRange: ['$$'] as ('$' | '$$' | '$$$' | '$$$$')[],
      dietaryRestrictions: [],
      defaultRadiusKm: 5.0,
      autoDetectLocation: true,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({ user: null, isAuthenticated: false, isLoading: false });
  });

  it('starts in unauthenticated state', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('sets user on successful login', async () => {
    vi.mocked(AuthService.login).mockResolvedValue(mockUser);

    await useAuthStore.getState().login('anand@example.com', 'password123');

    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);
    expect(state.isLoading).toBe(false);
  });

  it('clears user on logout', async () => {
    useAuthStore.setState({ user: mockUser, isAuthenticated: true, isLoading: false });
    vi.mocked(AuthService.logout).mockResolvedValue(undefined);

    await useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('updates preferences in user state', async () => {
    useAuthStore.setState({ user: mockUser, isAuthenticated: true, isLoading: false });
    const newPrefs = {
      ...mockUser.preferences,
      preferredCuisines: ['Italian', 'Continental'],
    };
    vi.mocked(AuthService.updatePreferences).mockResolvedValue(newPrefs);

    await useAuthStore.getState().updatePreferences({ preferredCuisines: ['Italian', 'Continental'] });

    const state = useAuthStore.getState();
    expect(state.user?.preferences.preferredCuisines).toEqual(['Italian', 'Continental']);
  });
});

