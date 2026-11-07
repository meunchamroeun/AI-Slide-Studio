import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './auth-provider';
import { AuthCard } from './auth-card';

// Mock next/navigation
const mockPush = vi.fn();
const mockReplace = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
  useSearchParams: () => ({
    get: (key: string) => (key === 'next' ? '/' : null),
  }),
  usePathname: () => '/login',
}));

function Consumer() {
  const { user, login, logout, loginDemo } = useAuth();
  return (
    <div>
      <div data-testid="user-name">{user ? user.name : 'no-user'}</div>
      <button onClick={() => login('test@domain.com', 'secret')}>Login</button>
      <button onClick={() => loginDemo()}>Login Demo</button>
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
}

// Mock localStorage
let store: Record<string, string> = {};
const mockLocalStorage = {
  getItem: vi.fn((key: string) => store[key] ?? null),
  setItem: vi.fn((key: string, val: string) => {
    store[key] = String(val);
  }),
  removeItem: vi.fn((key: string) => {
    delete store[key];
  }),
  clear: vi.fn(() => {
    store = {};
  }),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

describe('Auth System', () => {
  beforeEach(() => {
    store = {};
    vi.clearAllMocks();
  });

  it('provides null user session initially and logs in with demo button', async () => {
    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>
    );

    expect(screen.getByTestId('user-name')).toHaveTextContent('no-user');

    const demoBtn = screen.getByText('Login Demo');
    fireEvent.click(demoBtn);

    await waitFor(() => {
      expect(screen.getByTestId('user-name')).toHaveTextContent('Alex Morgan');
    });
  });

  it('allows logging out and switching users', async () => {
    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>
    );

    const loginBtn = screen.getByText('Login');
    fireEvent.click(loginBtn);

    await waitFor(() => {
      expect(screen.getByTestId('user-name')).toHaveTextContent('Test');
    });

    const logoutBtn = screen.getByText('Logout');
    fireEvent.click(logoutBtn);

    await waitFor(() => {
      expect(screen.getByTestId('user-name')).toHaveTextContent('no-user');
    });
  });

  it('renders AuthCard signin mode with email, password and demo login button', () => {
    // Clear storage so AuthCard doesn't auto-redirect
    localStorage.setItem('slidestudio:auth-user', 'null');

    render(
      <AuthProvider>
        <AuthCard mode="signin" />
      </AuthProvider>
    );

    expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/you@domain.com/i)).toBeInTheDocument();
    expect(screen.getByText(/One-Click Demo Studio Login/i)).toBeInTheDocument();
  });

  it('renders AuthCard register mode with full name field', () => {
    localStorage.setItem('slidestudio:auth-user', 'null');

    render(
      <AuthProvider>
        <AuthCard mode="register" />
      </AuthProvider>
    );

    expect(screen.getByText(/Create your account/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/e.g. Alex Morgan/i)).toBeInTheDocument();
  });
});
