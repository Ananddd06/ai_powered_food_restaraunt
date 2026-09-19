import { User, UserPreferences } from '@/types';
import { api } from './api';

export class AuthService {
  static async getCurrentUser(): Promise<User | null> {
    const token = localStorage.getItem('gourmet_access_token');
    if (!token) {
      return null;
    }
    try {
      const response = await api.get<User>('/auth/me');
      return response.data;
    } catch {
      localStorage.removeItem('gourmet_access_token');
      localStorage.removeItem('gourmet_refresh_token');
      return null;
    }
  }

  static async login(email: string, password?: string): Promise<User> {
    const response = await api.post('/auth/login', {
      email,
      password: password || 'password123',
    });
    const { access_token, refresh_token, user } = response.data;
    localStorage.setItem('gourmet_access_token', access_token);
    localStorage.setItem('gourmet_refresh_token', refresh_token);
    return user;
  }

  static async register(name: string, email: string, password?: string): Promise<User> {
    const response = await api.post('/auth/register', {
      name,
      email,
      password: password || 'password123',
    });
    const { access_token, refresh_token, user } = response.data;
    localStorage.setItem('gourmet_access_token', access_token);
    localStorage.setItem('gourmet_refresh_token', refresh_token);
    return user;
  }

  static async updatePreferences(preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    const response = await api.patch<UserPreferences>('/auth/preferences', preferences);
    return response.data;
  }

  static async forgotPassword(email: string): Promise<{ message: string; reset_token: string | null }> {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  }

  static async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {

    const response = await api.post('/auth/reset-password', {
      token,
      new_password: newPassword,
    });
    return response.data;
  }

  static async logout(): Promise<void> {
    localStorage.removeItem('gourmet_access_token');
    localStorage.removeItem('gourmet_refresh_token');
  }
}



