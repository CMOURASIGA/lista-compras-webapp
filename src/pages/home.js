import React, { useState, useEffect } from 'react';
import GoogleLoginButton from '../components/GoogleLoginButton';
import Navigation from '../components/Navigation';
import ListaCompras from './ListaCompras';
import AdicionarItem from './AdicionarItem';
import Carrinho from './Carrinho';
import Historico from './Historico';
import { useUserData } from '../contexts/UserDataContext';

const Home = () => {
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('lista');
  const [isLoading, setIsLoading] = useState(true);
  const { userData, clearUserData, loadUserData } = useUserData();

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const userInfo = JSON.parse(savedUser);
        setUser(userInfo);
        loadUserData(userInfo.email);
      } catch (error) {
        console.error('Erro ao carregar usuário salvo:', error);
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const handleLoginSuccess = async (userInfo) => {
    setUser(userInfo);
    setCurrentPage('lista');
    
    // Tentar criar planilha automaticamente após login
    try {
      const googleSheetsService = await import("../services/googleSheetsService");
      
      // Verificar se já existe uma planilha para este usuário
      let spreadsheetId = googleSheetsService.getUserSpreadsheetId(userInfo.email);
      
      if (!spreadsheetId) {
        console.log('Criando planilha automaticamente para o usuário...');
        spreadsheetId = await googleSheetsService.createUserSpreadsheet(userInfo.email);
        
        if (spreadsheetId) {
          console.log('Planilha criada automaticamente:', spreadsheetId);
        }
      }
      
      // Carregar dados do usuário
      await loadUserData(userInfo.email);
    } catch (error) {
      console.error('Erro ao configurar planilha:', error);
      // Continuar mesmo se houver erro na criação da planilha
      await loadUserData(userInfo.email);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    clearUserData();
    setUser(null);
    setCurrentPage('lista');
  };

  const renderCurrentPage = () => {
    if (!user) return null;

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

  if (isLoading) {
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
              <GoogleLoginButton onLoginSuccess={handleLoginSuccess} />
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
      {/* Header */}
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
                onClick={handleLogout}
                className="text-sm text-red-600 hover:text-red-800 font-medium"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />

      {/* Botão de teste para criar planilha no Drive */}
      {user && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <button
            onClick={async () => {
              try {
                const userEmail = user.email;
                const googleSheetsService = await import("../services/googleSheetsService");

                const planilhaId = await googleSheetsService.createUserSpreadsheet(userEmail);
                if (planilhaId) {
                  alert("✅ Planilha criada com sucesso!\nID: " + planilhaId);
                } else {
                  alert("❌ Erro ao criar planilha. Verifique o console.");
                }
              } catch (error) {
                console.error("Erro ao tentar criar a planilha:", error);
                alert("⚠️ Erro inesperado. Verifique o console.");
              }
            }}
            className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 transition"
          >
            Criar Planilha Manualmente
          </button>
        </div>
      )}

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {userData.isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando dados...</p>
            </div>
          </div>
        ) : (
          renderCurrentPage()
        )}
      </main>
    </div>
  );
};

export default Home;
