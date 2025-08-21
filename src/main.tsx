import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

// --- NEW: Import TanStack Query ---
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Components & Pages (your existing imports)
import ProtectedRoute from "./components/ProtectedRoute";
import TeacherProtectedRoute from "./components/TeacherProtectedRoute";
import PageTransition from "./components/PageTransition";
import Home from "./pages/home";
import Login from "./pages/login";
import Signup from "./pages/signup";
import Splash from "./pages/splash";
import OnboardingPage from "./pages/onboarding";
import TeacherLogin from "./pages/teacher/login";
import TeacherHome from "./pages/teacher/Home";
import ClassDetails from "./pages/teacher/class/Class";
import AdminHome from "./pages/admin";
import EditExperiment from "./pages/admin/experiment";
import Layout from "./components/Layout";
import AdminProtectedRoute from "./components/AdminProtectedRoute";

// Styles & Utils
import './index.css'
import { Toaster } from 'react-hot-toast';

// --- NEW: 1. Create a QueryClient instance ---
// This should be created outside the component to prevent it from being recreated on every render.
const queryClient = new QueryClient();

const AppRoutes = () => {
  const location = useLocation();

  // Your AppRoutes component remains exactly the same...
  return (
    <Layout>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* ... all your routes ... */}
          <Route path="/" element={<PageTransition><Splash /></PageTransition>} />
          <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
          <Route path="/signup" element={<PageTransition><Signup /></PageTransition>} />
          <Route path="/teacher/login" element={<PageTransition><TeacherLogin /></PageTransition>} />

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
          <Route
            path="/teacher/admin/home"
            element={
              <AdminProtectedRoute>
                <PageTransition><AdminHome /></PageTransition>
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/experiment/:id"
            element={
              <AdminProtectedRoute>
                <PageTransition><EditExperiment /></PageTransition>
              </AdminProtectedRoute>
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
      {/* --- NEW: 2. Wrap your app with the QueryClientProvider --- */}
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Toaster
            position="bottom-left"
            toastOptions={{ /* ... your toast options ... */ }}
          />
          
          <AppRoutes />

          {/* --- NEW (Optional but Recommended): Add the Devtools --- */}
          <ReactQueryDevtools initialIsOpen={false} />
        </BrowserRouter>
      </QueryClientProvider>
    </React.StrictMode>
  );
} else {
  throw new Error('Root element not found');
}