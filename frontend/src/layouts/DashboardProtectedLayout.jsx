import React, { useEffect, useState } from 'react'
import adminServiceInstance from '../Services/Auth';
import { Navigate, Outlet } from 'react-router-dom';


function DashboardProtectedLayout() {
 const [isAuthenticated, setIsAuthenticated] = useState(false);
 const [isLoading, setIsLoading] = useState(true);
 const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        // Fetch user profile to check if the user is locked
        const userData = await adminServiceInstance.getProfile();
        setUser(userData);
        const authStatus = await adminServiceInstance.isAuthenticated();
        setIsAuthenticated(authStatus);
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
      } finally {
        setIsLoading(false);
      }

    
    };

    checkAuth();
  }, []);

  // While checking authentication status, show a loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-teal-600"></div>
      </div>
    );
  }

  if(!isAuthenticated) {
    // If not authenticated, redirect to the login page
    return <Navigate to="/" replace />;
  }

  // If authenticated, render the child routes (Outlet); otherwise, redirect to login
  return <Outlet /> 
}

export default DashboardProtectedLayout