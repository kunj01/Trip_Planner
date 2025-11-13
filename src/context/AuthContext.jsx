import { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../api/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (token && storedUser) {
        try {
          // Verify token with backend
          const response = await authService.getCurrentUser();
          if (response && response.success) {
            setUser(response.data.user);
            setIsAuthenticated(true);
            localStorage.setItem('user', JSON.stringify(response.data.user));
          } else {
            // Token invalid, clear storage
            authService.logout();
            setUser(null);
            setIsAuthenticated(false);
          }
        } catch (error) {
          // Token invalid or expired, or backend not available
          // Only clear storage if it's an auth error, not a network error
          if (error.response?.status === 401 || error.response?.status === 403) {
            authService.logout();
            setUser(null);
            setIsAuthenticated(false);
          } else {
            // Network error - try to use cached user data
            try {
              const cachedUser = JSON.parse(storedUser);
              setUser(cachedUser);
              setIsAuthenticated(true);
            } catch (e) {
              // Invalid cached data
              authService.logout();
              setUser(null);
              setIsAuthenticated(false);
            }
          }
        }
      } else {
        // No token or user stored
        setUser(null);
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      if (response.success) {
        const { user, token } = response.data;
        setUser(user);
        setIsAuthenticated(true);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        return { success: true, message: response.message };
      }
      return { success: false, message: response.message || 'Login failed' };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'An error occurred during login',
        errors: error.errors || [],
      };
    }
  };

  // Signup function
  const signup = async (userData) => {
    try {
      const response = await authService.signup(userData);
      if (response.success) {
        const { user, token } = response.data;
        setUser(user);
        setIsAuthenticated(true);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        return { success: true, message: response.message };
      }
      return { success: false, message: response.message || 'Signup failed' };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'An error occurred during signup',
        errors: error.errors || [],
      };
    }
  };

  // Logout function
  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    isLoading,
    isAuthenticated,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;

