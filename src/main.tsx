import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

// Components & Pages
import ProtectedRoute from "./components/ProtectedRoute";
import TeacherProtectedRoute from "./components/TeacherProtectedRoute";
import PageTransition from "./components/PageTransition"; // Import the new wrapper
import Home from "./pages/home";
import Login from "./pages/login";
import Signup from "./pages/signup";
import Splash from "./pages/splash";
import OnboardingPage from "./pages/onboarding";
import TeacherLogin from "./pages/teacher/login";
import TeacherHome from "./pages/teacher/Home";
import ClassDetails from "./pages/teacher/class/Class";

// Styles & Utils
import './index.css'
import { Toaster } from 'react-hot-toast';
import Layout from "./components/Layout";
// This new component will contain the routes and the animation logic
const AppRoutes = () => {
  const location = useLocation();

  return (
    <Layout>
      {/* Layout always stays mounted */}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Public Pages without header */}
          <Route path="/" element={<PageTransition><Splash /></PageTransition>} />
          <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
          <Route path="/signup" element={<PageTransition><Signup /></PageTransition>} />
          <Route path="/teacher/login" element={<PageTransition><TeacherLogin /></PageTransition>} />

          {/* Protected Pages */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <PageTransition><Home /></PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <PageTransition><OnboardingPage /></PageTransition>
              </ProtectedRoute>
            }
          />

          {/* Teacher Protected Pages */}
          <Route
            path="/teacher/home"
            element={
              <TeacherProtectedRoute>
                <PageTransition><TeacherHome /></PageTransition>
              </TeacherProtectedRoute>
            }
          />
          <Route
            path="/teacher/class/:classId"
            element={
              <TeacherProtectedRoute>
                <PageTransition><ClassDetails /></PageTransition>
              </TeacherProtectedRoute>
            }
          />
        </Routes>
      </AnimatePresence>
    </Layout>
  );
};


const rootElement = document.getElementById("root");
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <BrowserRouter>
        <Toaster
          position="bottom-left"
          toastOptions={{
            style: {
              background: '#fff',
              color: '#111',
              border: '1px solid #eaeaea',
              boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
              borderRadius: '8px',
              padding: '12px 20px',
              fontSize: '14px',
              fontWeight: 500,
              fontFamily: 'Inter, sans-serif',
            },
            success: { icon: '✔️' },
            error: { icon: '⚠️' },
            duration: 4000,
          }}
        />
        {/* Render the new AppRoutes component here */}
        <AppRoutes />
      </BrowserRouter>
    </React.StrictMode>
  );
} else {
  throw new Error('Root element not found');
}