import React, { useState } from 'react';
import Navigation from '../components/Navigation';
import ListaCompras from './ListaCompras';
import AdicionarItem from './AdicionarItem';
import Carrinho from './Carrinho';
import Historico from './Historico';
import CreatePreListDialog from '../components/CreatePreListDialog';
import { useTestUserData } from '../contexts/TestUserDataContext';

const TestApp = () => {
  const [currentPage, setCurrentPage] = useState('lista');
  const { 
    user, 
    userData, 
    handleTestLogin, 
    handleLogout,
    showCreatePreListDialog,
    suggestedPreListItems,
    handleCreatePreList,
    handleSkipPreList
  } = useTestUserData();

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
                🛒 Lista de Compras - TESTE
              </h1>
              <p className="text-gray-600">
                Teste da funcionalidade de pré-lista
              </p>
            </div>
            <div className="mb-6">
              <button
                onClick={handleTestLogin}
                className="flex items-center justify-center w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
              >
                <span className="font-medium">🧪 Fazer Login de Teste</span>
              </button>
            </div>
            <div className="text-sm text-gray-500">
              <p>Este é um ambiente de teste para validar:</p>
              <ul className="mt-2 space-y-1">
                <li>• Detecção de histórico de compras</li>
                <li>• Sugestão de pré-lista baseada no histórico</li>
                <li>• Funcionalidade quando não há planilha</li>
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
                Lista de Compras - TESTE
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
                onClick={handleLogout}
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

      {/* Dialog para criar pré-lista baseada no histórico */}
      <CreatePreListDialog
        isOpen={showCreatePreListDialog}
        onConfirm={handleCreatePreList}
        onCancel={handleSkipPreList}
        suggestedItems={suggestedPreListItems}
      />
    </div>
  );
};

export default TestApp;

