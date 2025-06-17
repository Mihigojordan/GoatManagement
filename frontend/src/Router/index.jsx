/* eslint-disable react/prop-types */
/* eslint-disable react-refresh/only-export-components */
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { Children, lazy, Suspense } from "react";



// Reusable Loader Component
import Loader from "../components/Loading.jsx";
import BarcodeCheckout from "../views/checkout.jsx";


const ErrorLayout = lazy(() => import('../Error/ErrorLayout.jsx'));


const DashboardMainLayout = lazy(() => import('../layouts/DashboardMainLayout.jsx'));
const DashboardLayout = lazy(() => import('../layouts/DashboardLayout.jsx'));
const DashboardAuthLayout = lazy(() => import('../layouts/DashboardAuthLayout.jsx'));
const DashboardProtectedLayout = lazy(() => import('../layouts/DashboardProtectedLayout.jsx'));
const DashboardLogin = lazy(() => import('../views/Login.jsx'));
const GoatManagement = lazy(()=>import('../views/GoatManagement.jsx'));

const SuspenseWrapper = ({ children }) => (
  <Suspense fallback={<Loader />}>{children}</Suspense>
);

// Define routes
const routes = [
  {
    path: "",
    element: (
      <SuspenseWrapper>
        <DashboardLayout />
      </SuspenseWrapper>
    ),
    children: [
      {
        path: "",
        element: <DashboardAuthLayout />,
        children: [
          {
            index: true,
            element: <DashboardLogin />,

          },
        
        ]
      },
  
      {
        path: "dashboard",
        element: <DashboardProtectedLayout />,
        children: [

          {
            path: "",
            element: (
              <SuspenseWrapper>
                <DashboardMainLayout />
              </SuspenseWrapper>
            ),
            children: [
          
                   {
                path: "manage-goat",
                element: (
                  <SuspenseWrapper>
                    <GoatManagement/>
                  </SuspenseWrapper>
                ),
             
              },    
              {
              path: "checkout",
              element: (
                  <SuspenseWrapper>
                    <BarcodeCheckout />
                  </SuspenseWrapper>
                ),
                  },
            
              
           
            ]
          }
        ]
      },

    ],
  },
  {
    path: "*",
    element: (
      <SuspenseWrapper>
        <ErrorLayout />
      </SuspenseWrapper>
    ),
  },
];

// Create router instance
const router = createBrowserRouter(routes);

export default router;
