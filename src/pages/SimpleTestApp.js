import React, { useState, useEffect } from 'react';
import CreatePreListDialog from '../components/CreatePreListDialog';

const SimpleTestApp = () => {
  const [user, setUser] = useState(null);
  const [showCreatePreListDialog, setShowCreatePreListDialog] = useState(false);
  const [suggestedPreListItems, setSuggestedPreListItems] = useState([]);
  const [items, setItems] = useState([]);

  const handleTestLogin = () => {
    const testUser = {
      email: 'teste@exemplo.com',
      name: 'Usuário Teste',
      picture: 'https://via.placeholder.com/40'
    };
    
    setUser(testUser);
    
    // Simular falha na criação da planilha para testar a funcionalidade de pré-lista
    setTimeout(() => {
      checkAndSuggestPreList(testUser.email);
    }, 1000);
  };

  const checkAndSuggestPreList = (userEmail) => {
    const localHistorico = JSON.parse(localStorage.getItem(`historico_${userEmail}`) || '[]');
    
    if (localHistorico.length > 0) {
      // Extrair itens únicos mais comprados do histórico
      const itemFrequency = {};
      localHistorico.forEach(historyItem => {
        const itemName = historyItem.item;
        if (itemFrequency[itemName]) {
          itemFrequency[itemName].count++;
          itemFrequency[itemName].lastPrice = historyItem.preco;
          itemFrequency[itemName].categoria = historyItem.categoria;
        } else {
          itemFrequency[itemName] = {
            count: 1,
            lastPrice: historyItem.preco,
            categoria: historyItem.categoria,
            nome: itemName
          };
        }
      });

      // Ordenar por frequência e pegar os top 10
      const sortedItems = Object.values(itemFrequency)
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
        .map(item => ({
          id: `prelist_${new Date().getTime()}_${Math.random()}`,
          nome: item.nome,
          quantidade: 1,
          categoria: item.categoria || '',
          preco: item.lastPrice || 0,
          status: 'pendente',
          dataCriacao: new Date().toLocaleDateString('pt-BR'),
          dataCompra: ''
        }));

      if (sortedItems.length > 0) {
        setSuggestedPreListItems(sortedItems);
        setShowCreatePreListDialog(true);
      }
    }
  };

  const handleCreatePreList = () => {
    setItems(suggestedPreListItems);
    localStorage.setItem(`items_${user.email}`, JSON.stringify(suggestedPreListItems));
    setShowCreatePreListDialog(false);
    setSuggestedPreListItems([]);
  };

  const handleSkipPreList = () => {
    setShowCreatePreListDialog(false);
    setSuggestedPreListItems([]);
  };

  const handleLogout = () => {
    setUser(null);
    setItems([]);
    setShowCreatePreListDialog(false);
    setSuggestedPreListItems([]);
  };

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
              <span className="text-sm text-gray-600">
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Resultado do Teste
          </h2>
          
          {items.length > 0 ? (
            <div>
              <p className="text-green-600 mb-4">
                ✅ Pré-lista criada com sucesso! {items.length} itens adicionados.
              </p>
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="font-medium">{item.nome}</span>
                    <span className="text-sm text-gray-600">
                      {item.categoria} • R$ {item.preco.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-600">
              Aguardando criação da pré-lista...
            </p>
          )}
        </div>
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

export default SimpleTestApp;

