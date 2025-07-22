import React, { createContext, useContext, useState, useEffect } from 'react';

const TestUserDataContext = createContext();

export const useTestUserData = () => {
  const context = useContext(TestUserDataContext);
  if (!context) {
    throw new Error('useTestUserData deve ser usado dentro de TestUserDataProvider');
  }
  return context;
};

export const TestUserDataProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState({
    items: [],
    historico: [],
    isLoading: false,
    spreadsheetId: null,
    hasGoogleSheets: false
  });
  const [showCreatePreListDialog, setShowCreatePreListDialog] = useState(false);
  const [suggestedPreListItems, setSuggestedPreListItems] = useState([]);

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
    setUserData(prev => ({ ...prev, items: suggestedPreListItems }));
    if (user) {
      localStorage.setItem(`items_${user.email}`, JSON.stringify(suggestedPreListItems));
    }
    setShowCreatePreListDialog(false);
    setSuggestedPreListItems([]);
  };

  const handleSkipPreList = () => {
    setShowCreatePreListDialog(false);
    setSuggestedPreListItems([]);
  };

  const handleLogout = () => {
    setUser(null);
    setUserData({
      items: [],
      historico: [],
      isLoading: false,
      spreadsheetId: null,
      hasGoogleSheets: false
    });
    setShowCreatePreListDialog(false);
    setSuggestedPreListItems([]);
  };

  const getStatistics = () => {
    const items = userData.items || [];
    const stats = {
      totalItens: items.length,
      itensComprados: 0,
      itensPendentes: 0,
      valorTotal: 0,
      valorComprado: 0,
      valorPendente: 0,
    };

    items.forEach(item => {
      const itemTotal = (item.preco || 0) * (item.quantidade || 1);
      stats.valorTotal += itemTotal;

      if (item.status === 'comprado') {
        stats.itensComprados++;
        stats.valorComprado += itemTotal;
      } else {
        stats.itensPendentes++;
        stats.valorPendente += itemTotal;
      }
    });

    return stats;
  };

  const toggleItemStatus = (itemId) => {
    const itemIndex = userData.items.findIndex(i => i.id === itemId);
    if (itemIndex === -1) return;

    const updatedItems = [...userData.items];
    const item = updatedItems[itemIndex];
    
    const isBought = item.status === 'comprado';
    item.status = isBought ? 'pendente' : 'comprado';
    item.dataCompra = isBought ? '' : new Date().toLocaleDateString('pt-BR');

    setUserData(prev => ({ ...prev, items: updatedItems }));
    if (user) {
      localStorage.setItem(`items_${user.email}`, JSON.stringify(updatedItems));
    }
  };

  const removeItem = (itemId) => {
    const updatedItems = userData.items.filter(i => i.id !== itemId);
    setUserData(prev => ({ ...prev, items: updatedItems }));
    if (user) {
      localStorage.setItem(`items_${user.email}`, JSON.stringify(updatedItems));
    }
  };

  const addItem = (itemData) => {
    const newItem = {
      id: `item_${new Date().getTime()}`,
      ...itemData,
      preco: parseFloat(itemData.preco?.toString().replace(',', '.')) || 0,
      status: 'pendente',
      dataCriacao: new Date().toLocaleDateString('pt-BR'),
      dataCompra: ''
    };

    const updatedItems = [...userData.items, newItem];
    setUserData(prev => ({ ...prev, items: updatedItems }));
    if (user) {
      localStorage.setItem(`items_${user.email}`, JSON.stringify(updatedItems));
    }
    return true;
  };

  const editItem = (itemId, itemData) => {
    const itemIndex = userData.items.findIndex(i => i.id === itemId);
    if (itemIndex === -1) return false;

    const updatedItems = [...userData.items];
    const updatedItem = {
      ...updatedItems[itemIndex],
      ...itemData,
      preco: parseFloat(itemData.preco?.toString().replace(',', '.')) || 0,
    };
    updatedItems[itemIndex] = updatedItem;

    setUserData(prev => ({ ...prev, items: updatedItems }));
    if (user) {
      localStorage.setItem(`items_${user.email}`, JSON.stringify(updatedItems));
    }
    return true;
  };

  const finalizePurchase = () => {
    const itemsToProcess = userData.items.filter(item => item.status === 'comprado');
    if (itemsToProcess.length === 0) return true;

    const remainingItems = userData.items.filter(item => item.status !== 'comprado');
    const newHistory = [...userData.historico, ...itemsToProcess];

    setUserData(prev => ({
      ...prev,
      items: remainingItems,
      historico: newHistory,
    }));

    if (user) {
      localStorage.setItem(`items_${user.email}`, JSON.stringify(remainingItems));
      localStorage.setItem(`historico_${user.email}`, JSON.stringify(newHistory));
    }

    return true;
  };

  const value = {
    user,
    userData,
    handleTestLogin,
    handleLogout,
    getStatistics,
    toggleItemStatus,
    removeItem,
    addItem,
    editItem,
    finalizePurchase,
    showCreatePreListDialog,
    suggestedPreListItems,
    handleCreatePreList,
    handleSkipPreList,
  };

  return (
    <TestUserDataContext.Provider value={value}>
      {children}
    </TestUserDataContext.Provider>
  );
};

