import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';

type ProfileUpdateData = {
  name?: string;
  username?: string;
  password?: string;
  avatar?: string;
};

type AuthContextType = {
  currentUser: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (requiredRole: string[]) => boolean;
  updateProfile: (data: ProfileUpdateData) => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Role hierarchy - higher roles include permissions of lower roles
const roleHierarchy: Record<string, number> = {
  'Administrator': 3,
  'Sales Manager': 2,
  'Sales Representative': 1,
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check if user is already logged in on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Try to get current user from localStorage
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          setCurrentUser(user);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function - API-based authentication
  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      console.log('Attempting login with:', { username, password: '***' });

      // Only allow login via backend API
      const response = await apiRequest('POST', '/api/login', { username, password });
      const data = await response.json();

      if (data.success && data.user) {
        setCurrentUser(data.user);
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  // Check if user has permission based on their role
  const hasPermission = (requiredRoles: string[]): boolean => {
    if (!currentUser) return false;
    
    const userRoleLevel = roleHierarchy[currentUser.role] || 0;
    
    // Check if user's role level is sufficient for any of the required roles
    return requiredRoles.some(role => {
      const requiredLevel = roleHierarchy[role] || 0;
      return userRoleLevel >= requiredLevel;
    });
  };

  // Update user profile
  const updateProfile = async (data: ProfileUpdateData): Promise<boolean> => {
    try {
      setIsLoading(true);
      if (!currentUser) return false;

      // Prepare data to send (do not send empty password)
      const updateData = { ...data };
      if (!updateData.password) {
        delete updateData.password;
      }

      // Call backend API to persist changes
      const response = await apiRequest(
        'PATCH',
        `/api/users/${currentUser.id}`,
        updateData
      );

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const updatedUser = await response.json();
      setCurrentUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      return true;
    } catch (error) {
      console.error('Profile update error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    currentUser,
    isLoading,
    login,
    logout,
    hasPermission,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};