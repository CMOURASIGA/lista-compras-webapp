import React from 'react';
import GoogleLoginButton from '../components/GoogleLoginButton';
import LoadPreviousItemsDialog from '../components/LoadPreviousItemsDialog';
import LoadHistoryItemsDialog from '../components/LoadHistoryItemsDialog'; // NOVO COMPONENTE
import { useUserData } from '../contexts/UserDataContext';

const Home = () => {
  const { 
    user, 
    handleLogin, 
    handleLogout, 
    showLoadPreviousDialog,
    previousItems,
    handleLoadPreviousItems,
    handleSkipPreviousItems,
    // NOVA FUNCIONALIDADE: Estados e funções para produtos do histórico
    showLoadHistoryDialog,
    historyItems,
    handleLoadHistoryItems,
    handleSkipHistoryItems
  } = useUserData();

  const handleLoginSuccess = (tokenResponse) => {
    handleLogin(tokenResponse);
  };

  const handleLoginError = (error) => {
    console.error("Falha no login com Google:", error);
  };

  const onLogout = () => {
    handleLogout();
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                🛒 Lista de Compras
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Organize suas compras de forma inteligente
              </p>
            </div>
            <div className="mb-6">
              <GoogleLoginButton 
                onLoginSuccess={handleLoginSuccess} 
                onLoginError={handleLoginError} 
              />
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <p>Faça login com sua conta Google para:</p>
              <ul className="mt-2 space-y-1">
                <li>• Salvar suas listas na nuvem</li>
                <li>• Acessar de qualquer dispositivo</li>
                <li>• Acompanhar seu histórico de compras</li>
                <li>• Reutilizar produtos comprados anteriormente</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
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
              <span className="text-sm text-gray-600 dark:text-gray-300 hidden sm:block">
                Olá, {user.name?.split(' ')[0]}
              </span>
              <button
                onClick={onLogout}
                className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* O conteúdo da página será renderizado pelo App.js Router */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* O conteúdo da página será renderizado pelo router */}
      </main>

      {/* Dialog para carregar produtos anteriores */}
      <LoadPreviousItemsDialog
        isOpen={showLoadPreviousDialog}
        onConfirm={handleLoadPreviousItems}
        onCancel={handleSkipPreviousItems}
        itemCount={previousItems.length}
      />

      {/* NOVO DIALOG: Dialog para carregar produtos do histórico */}
      <LoadHistoryItemsDialog
        isOpen={showLoadHistoryDialog}
        onConfirm={handleLoadHistoryItems}
        onCancel={handleSkipHistoryItems}
        historyItems={historyItems}
      />
    </div>
  );
};

export default Home;

