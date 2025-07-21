import React, { useState, useEffect } from 'react';
import GoogleLoginButton from '../components/GoogleLoginButton';
import Navigation from '../components/Navigation';
import ListaCompras from './ListaCompras';
import AdicionarItem from './AdicionarItem';
import Carrinho from './Carrinho';
import Historico from './Historico';
import { useUserData } from '../contexts/UserDataContext';

const Home = () => {
  const [currentPage, setCurrentPage] = useState('lista');
  const { user, userData, handleLogin, handleLogout, initializeSheetAndLoadData } = useUserData();

  useEffect(() => {
    if (user && !userData.spreadsheetId) {
      initializeSheetAndLoadData(user.email);
    }
  }, [user, userData.spreadsheetId, initializeSheetAndLoadData]);

  const handleLoginSuccess = (tokenResponse) => {
    handleLogin(tokenResponse);
  };

  const handleLoginError = (error) => {
    console.error("Falha no login com Google:", error);
  };

  const onLogout = () => {
    handleLogout();
    setCurrentPage('lista');
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'lista':
        return <ListaCompras />;
      case 'adicionar':
        return <AdicionarItem />;
      case 'carrinho':
        return <Carrinho />;
      case 'historico':
        return <Historico />;
      default:
        return <ListaCompras />;
    }
  };

  if (userData.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                🛒 Lista de Compras
              </h1>
              <p className="text-gray-600">
                Organize suas compras de forma inteligente
              </p>
            </div>
            <div className="mb-6">
              <GoogleLoginButton 
                onLoginSuccess={handleLoginSuccess} 
                onLoginError={handleLoginError} 
              />
            </div>
            <div className="text-sm text-gray-500">
              <p>Faça login com sua conta Google para:</p>
              <ul className="mt-2 space-y-1">
                <li>• Salvar suas listas na nuvem</li>
                <li>• Acessar de qualquer dispositivo</li>
                <li>• Acompanhar seu histórico de compras</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-800">
                Lista de Compras
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {user.picture && (
                <img
                  src={user.picture}
                  alt={user.name}
                  className="h-8 w-8 rounded-full"
                />
              )}
              <span className="text-sm text-gray-600 hidden sm:block">
                Olá, {user.name?.split(' ')[0]}
              </span>
              <button
                onClick={onLogout}
                className="text-sm text-red-600 hover:text-red-800 font-medium"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {renderCurrentPage()}
      </main>
    </div>
  );
};

export default Home;