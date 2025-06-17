import React, { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import adminServiceInstance from '../Services/Auth';

function DashboardAuthLayout() {
 const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authStatus = await adminServiceInstance.isAuthenticated();
        setIsAuthenticated(!authStatus);
      } catch (error) {
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  // While checking authentication status, show a loading state
  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-teal-600"></div>
      </div>
    );
  }

  // If authenticated, render the child routes (Outlet); otherwise, redirect to login
  return isAuthenticated ? <Outlet /> : <Navigate to="/dispatch/dashboard/reservation" replace />;
}
export default DashboardAuthLayout