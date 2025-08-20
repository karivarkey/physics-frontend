import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/home";
import Login from "./pages/login";
import Signup from "./pages/signup";
import Splash from "./pages/splash";
import OnboardingPage from "./pages/onboarding";
import './index.css'
import { Toaster } from 'react-hot-toast';
const rootElement = document.getElementById("root");
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <BrowserRouter>
         <Toaster
        position="top-right"
        toastOptions={{
          // Default options for all toasts
          style: {
            background: '#fff',        // Vercel-like white background
            color: '#111',             // Dark text
            border: '1px solid #eaeaea', // subtle border
            boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
            borderRadius: '8px',       // rounded like Vercel
            padding: '12px 20px',
            fontSize: '14px',
            fontWeight: 500,
            fontFamily: 'Inter, sans-serif',
          },
          success: {
            icon: '✔️',
          },
          error: {
            icon: '⚠️',
          },
          duration: 4000, // auto-close after 4s
        }}
      />
        <Routes>
          <Route path="/" element={<Splash />} />
          <Route path="/login" element={<Login />} />
            

          {/* Protected Routes */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />

          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <OnboardingPage />
              </ProtectedRoute>
            }
          />

          {/* add more protected routes here */}
        </Routes>
      </BrowserRouter>
    </React.StrictMode>
  );
} else {
  throw new Error('Root element not found');
}
