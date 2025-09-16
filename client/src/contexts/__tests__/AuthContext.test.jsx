import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { AuthProvider, useAuth } from '../AuthContext';
import axios from 'axios';

// Mock axios
vi.mock('axios');

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
  success: vi.fn(),
  error: vi.fn(),
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;

// Test component to access context
const TestComponent = () => {
  const { user, loading, token, isAuthenticated } = useAuth();
  return (
    <div>
      <div data-testid="user">{user ? JSON.stringify(user) : 'no-user'}</div>
      <div data-testid="loading">{loading.toString()}</div>
      <div data-testid="token">{token || 'no-token'}</div>
      <div data-testid="authenticated">{isAuthenticated.toString()}</div>
    </div>
  );
};

// Test component for testing auth functions
const AuthTestComponent = ({ onAuthReady }) => {
  const auth = useAuth();
  
  React.useEffect(() => {
    if (onAuthReady) {
      onAuthReady(auth);
    }
  }, [auth, onAuthReady]);
  
  return <div data-testid="auth-component">Auth Component</div>;
};

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockImplementation(() => {});
    localStorageMock.removeItem.mockImplementation(() => {});
  });

  test('provides initial state correctly', () => {
    renderWithProviders(<TestComponent />);
    
    expect(screen.getByTestId('user')).toHaveTextContent('no-user');
    expect(screen.getByTestId('loading')).toHaveTextContent('false');
    expect(screen.getByTestId('token')).toHaveTextContent('no-token');
    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
  });

  test('loads user profile when token exists', async () => {
    const mockToken = 'mock-token';
    const mockUser = { id: '1', email: 'test@example.com' };
    
    localStorageMock.getItem.mockReturnValue(mockToken);
    axios.get.mockResolvedValue({ data: { user: mockUser } });
    
    renderWithProviders(<TestComponent />);
    
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/api/auth/profile'));
    });
    
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent(JSON.stringify(mockUser));
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
      expect(screen.getByTestId('token')).toHaveTextContent(mockToken);
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    });
  });

  test('handles profile fetch error by logging out', async () => {
    const mockToken = 'mock-token';
    
    localStorageMock.getItem.mockReturnValue(mockToken);
    axios.get.mockRejectedValue(new Error('Profile fetch failed'));
    
    renderWithProviders(<TestComponent />);
    
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/api/auth/profile'));
    });
    
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('no-user');
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
      expect(screen.getByTestId('token')).toHaveTextContent('no-token');
    });
  });

  test('login function works correctly', async () => {
    const mockUser = { id: '1', email: 'test@example.com' };
    const mockToken = 'new-token';
    
    axios.post.mockResolvedValue({ 
      data: { token: mockToken, user: mockUser } 
    });
    
    let authFunctions = null;
    const onAuthReady = (auth) => {
      authFunctions = auth;
    };
    
    renderWithProviders(<AuthTestComponent onAuthReady={onAuthReady} />);
    
    await waitFor(() => {
      expect(authFunctions).toBeTruthy();
    });
    
    await act(async () => {
      const result = await authFunctions.login('test@example.com', 'password');
      expect(result.success).toBe(true);
    });
    
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining('/api/auth/login'),
      { email: 'test@example.com', password: 'password' }
    );
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith('token', mockToken);
  });

  test('login function handles errors correctly', async () => {
    const errorMessage = 'Invalid credentials';
    axios.post.mockRejectedValue({ 
      response: { data: { message: errorMessage } } 
    });
    
    let authFunctions = null;
    const onAuthReady = (auth) => {
      authFunctions = auth;
    };
    
    renderWithProviders(<AuthTestComponent onAuthReady={onAuthReady} />);
    
    await waitFor(() => {
      expect(authFunctions).toBeTruthy();
    });
    
    await act(async () => {
      const result = await authFunctions.login('test@example.com', 'wrong-password');
      expect(result.success).toBe(false);
      expect(result.message).toBe(errorMessage);
    });
    
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining('/api/auth/login'),
      { email: 'test@example.com', password: 'wrong-password' }
    );
  });

  test('register function works correctly', async () => {
    const mockUser = { id: '1', email: 'new@example.com' };
    const mockToken = 'new-token';
    const userData = { email: 'new@example.com', password: 'password123' };
    
    axios.post.mockResolvedValue({ 
      data: { token: mockToken, user: mockUser } 
    });
    
    let authFunctions = null;
    const onAuthReady = (auth) => {
      authFunctions = auth;
    };
    
    renderWithProviders(<AuthTestComponent onAuthReady={onAuthReady} />);
    
    await waitFor(() => {
      expect(authFunctions).toBeTruthy();
    });
    
    await act(async () => {
      const result = await authFunctions.register(userData);
      expect(result.success).toBe(true);
    });
    
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining('/api/auth/register'),
      userData
    );
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith('token', mockToken);
  });

  test('logout function works correctly', async () => {
    const mockToken = 'mock-token';
    localStorageMock.getItem.mockReturnValue(mockToken);
    
    let authFunctions = null;
    const onAuthReady = (auth) => {
      authFunctions = auth;
    };
    
    renderWithProviders(
      <div>
        <AuthTestComponent onAuthReady={onAuthReady} />
        <TestComponent />
      </div>
    );
    
    await waitFor(() => {
      expect(authFunctions).toBeTruthy();
    });
    
    await act(async () => {
      authFunctions.logout();
    });
    
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
    expect(screen.getByTestId('user')).toHaveTextContent('no-user');
    expect(screen.getByTestId('token')).toHaveTextContent('no-token');
  });

  test('updateProfile function works correctly', async () => {
    const mockUser = { id: '1', email: 'test@example.com' };
    const updatedUser = { ...mockUser, name: 'John Doe' };
    
    axios.put.mockResolvedValue({ data: { user: updatedUser } });
    
    let authFunctions = null;
    const onAuthReady = (auth) => {
      authFunctions = auth;
    };
    
    renderWithProviders(<AuthTestComponent onAuthReady={onAuthReady} />);
    
    await waitFor(() => {
      expect(authFunctions).toBeTruthy();
    });
    
    await act(async () => {
      const result = await authFunctions.updateProfile({ name: 'John Doe' });
      expect(result.success).toBe(true);
    });
    
    expect(axios.put).toHaveBeenCalledWith(
      expect.stringContaining('/api/auth/profile'),
      { name: 'John Doe' }
    );
  });

  test('changePassword function works correctly', async () => {
    axios.put.mockResolvedValue({ data: { message: 'Password changed' } });
    
    let authFunctions = null;
    const onAuthReady = (auth) => {
      authFunctions = auth;
    };
    
    renderWithProviders(<AuthTestComponent onAuthReady={onAuthReady} />);
    
    await waitFor(() => {
      expect(authFunctions).toBeTruthy();
    });
    
    await act(async () => {
      const result = await authFunctions.changePassword('oldpass', 'newpass');
      expect(result.success).toBe(true);
    });
    
    expect(axios.put).toHaveBeenCalledWith(
      expect.stringContaining('/api/auth/change-password'),
      { currentPassword: 'oldpass', newPassword: 'newpass' }
    );
  });

  test('refreshToken function works correctly', async () => {
    const mockToken = 'mock-token';
    const newToken = 'new-token';
    
    localStorageMock.getItem.mockReturnValue(mockToken);
    axios.post.mockResolvedValue({ data: { token: newToken } });
    
    let authFunctions = null;
    const onAuthReady = (auth) => {
      authFunctions = auth;
    };
    
    renderWithProviders(<AuthTestComponent onAuthReady={onAuthReady} />);
    
    await waitFor(() => {
      expect(authFunctions).toBeTruthy();
    });
    
    await act(async () => {
      const result = await authFunctions.refreshToken();
      expect(result.success).toBe(true);
    });
    
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining('/api/auth/refresh-token')
    );
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith('token', newToken);
  });
});
