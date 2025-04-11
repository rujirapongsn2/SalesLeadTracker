import React from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';

type ProtectedRouteProps = {
  component: React.ComponentType;
  requiredRoles: string[];
};

/**
 * Higher-Order Component for protecting routes based on user roles
 * @param component Component to render if authorized
 * @param requiredRoles Array of roles that can access this route
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  component: Component,
  requiredRoles,
}) => {
  const { currentUser, isLoading, hasPermission } = useAuth();
  const [, setLocation] = useLocation();

  // Show loading state while checking authentication
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  // Redirect to login if not authenticated
  if (!currentUser) {
    setLocation('/login');
    return null;
  }

  // Check if user has required role
  if (!hasPermission(requiredRoles)) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="text-gray-600 mb-6">
          You don't have permission to access this page.
        </p>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => setLocation('/')}
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  // Render the protected component
  return <Component />;
};
