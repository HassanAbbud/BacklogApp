import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect, ReactNode } from "react";
import Catalog from "./pages/Catalog";
import Charts from "./pages/Charts";
import { PrimeReactProvider } from "primereact/api";
import { LayoutProvider } from "./layout/context/layoutcontext";
import Layout from "./layout/layout";
import Test from "./pages/Test";
import LoginPage from "./pages/Login";

// Define the props type for ProtectedRoute component
interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated by looking for token in localStorage
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    setLoading(false);
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  // If not authenticated, redirect to login page
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <PrimeReactProvider>
      <LayoutProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<Navigate to="/charts" replace />} />
            <Route path="/*" element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route path="/catalog" element={<Catalog />} />
                    <Route path="/charts" element={<Charts />} />
                    <Route path="*" element={<Navigate to="/charts" replace />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            } />
          </Routes>
        </BrowserRouter>
      </LayoutProvider>
    </PrimeReactProvider>
  );
}

export default App;