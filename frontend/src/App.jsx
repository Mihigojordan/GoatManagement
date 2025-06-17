import React, { Suspense } from "react";
import { RouterProvider } from "react-router-dom";
import router from "./Router/index";

import ErrorBoundary from "./Error/ErrorBoundary";
import Loader from "./components/Loading";
// import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <ErrorBoundary>
      {/* Suspense and ErrorBoundary setup */}
      {/* Auth context for users */}
      <Suspense fallback={<Loader />}>
        <RouterProvider router={router} />
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
