import React, { useState, useEffect } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from "./home";
import ListaCompras from './ListaCompras';
import Carrinho from './Carrinho';
import Historico from './Historico';
import AdicionarItem from './AdicionarItem'; // Adicionado
import BottomNavigation from '../components/BottomNavigation';
import { UserDataProvider, useUserData } from "../contexts/UserDataContext";
import { Sun, Moon } from 'lucide-react';

const AppContent = () => {
  const { user, userData } = useUserData();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const body = document.body;
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      body.classList.add('bg-bg-dark');
      body.classList.remove('bg-bg-light');
    } else {
      document.documentElement.classList.remove('dark');
      body.classList.add('bg-bg-light');
      body.classList.remove('bg-bg-dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  if (userData.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-main dark:text-text-muted">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className={`App pb-20`}>
        {user ? (
          <>
            <button
              onClick={toggleDarkMode}
              className="fixed top-4 right-4 bg-white dark:bg-gray-700 p-2 rounded-full shadow-md z-50"
            >
              {isDarkMode ? <Sun className="text-accent" /> : <Moon className="text-text-main" />}
            </button>
            <Routes>
              <Route path="/lista" element={<ListaCompras />} />
              <Route path="/adicionar" element={<AdicionarItem />} />
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
