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

  // Login function - Client-side authentication for demo purposes
  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      console.log('Attempting login with:', { username, password: '***' });
      
      // For demo purposes, we'll use a client-side authentication
      // In a real app, this would be an API call to a secure backend
      
      // Hardcoded admin credentials
      if (username === 'admin' && password === 'admin123') {
        const adminUser = {
          id: 1,
          username: 'admin',
          password: 'admin123', // In a real app, we wouldn't store passwords in client code
          name: 'Alex Morgan',
          role: 'Administrator',
          avatar: '',
        };
        setCurrentUser(adminUser);
        localStorage.setItem('currentUser', JSON.stringify(adminUser));
        return true;
      }
      
      // Hardcoded sales manager credentials
      if (username === 'john.doe' && password === 'password123') {
        const managerUser = {
          id: 2,
          username: 'john.doe',
          password: 'password123', // In a real app, we wouldn't store passwords in client code
          name: 'John Doe',
          role: 'Sales Manager',
          avatar: '',
        };
        setCurrentUser(managerUser);
        localStorage.setItem('currentUser', JSON.stringify(managerUser));
        return true;
      }
      
      // Hardcoded sales rep credentials
      if (username === 'sarah.smith' && password === 'password123') {
        const repUser = {
          id: 3,
          username: 'sarah.smith',
          password: 'password123', // In a real app, we wouldn't store passwords in client code
          name: 'Sarah Smith',
          role: 'Sales Representative',
          avatar: '',
        };
        setCurrentUser(repUser);
        localStorage.setItem('currentUser', JSON.stringify(repUser));
        return true;
      }
      
      // If no match, login failed
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
      
      // In a real app, this would be an API call to update the user profile
      // For demo purposes, we'll just update the local state
      
      const updatedUser = {
        ...currentUser,
        ...data,
      };
      
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
