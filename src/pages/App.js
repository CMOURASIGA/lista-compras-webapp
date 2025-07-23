import React, { useState, useEffect } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from "./home";
import ListaCompras from './ListaCompras';
import Carrinho from './Carrinho';
import Historico from './Historico';
import BottomNavigation from '../components/BottomNavigation';
import { UserDataProvider, useUserData } from "../contexts/UserDataContext";
import { Sun, Moon } from 'lucide-react';

const AppContent = () => {
  const { user, userData } = useUserData();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  if (userData.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className={`App ${isDarkMode ? 'dark' : ''}`}>
        {user ? (
          <>
            <button
              onClick={toggleDarkMode}
              className="fixed top-4 right-4 bg-gray-200 dark:bg-gray-700 p-2 rounded-full"
            >
              {isDarkMode ? <Sun className="text-yellow-500" /> : <Moon className="text-gray-800" />}
            </button>
            <Routes>
              <Route path="/lista" element={<ListaCompras />} />
              <Route path="/carrinho" element={<Carrinho />} />
              <Route path="/historico" element={<Historico />} />
              <Route path="*" element={<Navigate to="/lista" />} />
            </Routes>
            <BottomNavigation />
          </>
        ) : (
          <Home />
        )}
      </div>
    </Router>
  );
};

function App() {
  return (
    <UserDataProvider>
      <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
        <AppContent />
      </GoogleOAuthProvider>
    </UserDataProvider>
  );
}

export default App;
