import React, { createContext, useContext, useState, useEffect } from 'react';
import * as googleSheetsService from '../services/googleSheetsService';

const UserDataContext = createContext();

export const useUserData = () => {
  const context = useContext(UserDataContext);
  if (!context) {
    throw new Error('useUserData deve ser usado dentro de UserDataProvider');
  }
  return context;
};

export const UserDataProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState({
    items: [],
    historico: [],
    isLoading: true,
    spreadsheetId: null
  });

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const userInfo = JSON.parse(savedUser);
        setUser(userInfo);
        // Carregar dados locais imediatamente para usuários já logados
        loadDataFromLocalStorage(userInfo.email);
      } catch (error) {
        console.error('Erro ao carregar usuário do localStorage:', error);
        localStorage.removeItem('user');
      }
    }
    setUserData(prev => ({ ...prev, isLoading: false }));
  }, []);

  // Efeito separado para inicializar planilha quando usuário é carregado
  useEffect(() => {
    if (user && !userData.spreadsheetId && !userData.isLoading) {
      // Tentar obter token do localStorage ou solicitar novo login
      const savedToken = localStorage.getItem(`token_${user.email}`);
      if (savedToken) {
        googleSheetsService.setAccessToken(savedToken);
        initializeSheetAndLoadData(user.email);
      }
    }
  }, [user, userData.spreadsheetId, userData.isLoading]);

  const handleLogin = async (tokenResponse) => {
    if (!tokenResponse.access_token) {
      console.error("Login falhou: sem token de acesso.");
      setUserData(prev => ({ ...prev, isLoading: false }));
      return;
    }

    setUserData(prev => ({ ...prev, isLoading: true }));

    try {
      // 1. Definir o token de acesso para uso nas APIs
      googleSheetsService.setAccessToken(tokenResponse.access_token);
      
      // 2. Salvar token no localStorage para persistência
      localStorage.setItem(`token_${tokenResponse.access_token}`, tokenResponse.access_token);

      // 3. Buscar informações do usuário do Google
      const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
      });
      if (!userInfoRes.ok) throw new Error('Falha ao buscar dados do usuário.');
      
      const userInfo = await userInfoRes.json();
      localStorage.setItem('user', JSON.stringify(userInfo));
      
      // Salvar token com email do usuário como chave
      localStorage.setItem(`token_${userInfo.email}`, tokenResponse.access_token);
      
      setUser(userInfo);

      // 4. Inicializar a planilha e carregar os dados
      await initializeSheetAndLoadData(userInfo.email);

    } catch (error) {
      console.error("Erro no processo de login e inicialização:", error);
      handleLogout(); // Desloga em caso de erro
    } finally {
      setUserData(prev => ({ ...prev, isLoading: false }));
    }
  };

  const initializeSheetAndLoadData = async (userEmail) => {
    try {
      // Simplificado para usar a nova função atômica
      const sheetId = await googleSheetsService.findOrCreateSpreadsheet(userEmail);
      
      if (!sheetId) {
        throw new Error("Não foi possível obter ou criar uma planilha.");
      }

      setUserData(prev => ({ ...prev, spreadsheetId: sheetId, hasGoogleSheets: true }));
      await loadDataFromSheet(sheetId);

    } catch (error) {
      console.error("Erro ao inicializar a planilha:", error);
      setUserData(prev => ({ ...prev, hasGoogleSheets: false }));
      if (userEmail) {
        loadDataFromLocalStorage(userEmail);
      }
    }
  };

  const loadDataFromSheet = async (spreadsheetId) => {
    try {
      const itemsResult = await googleSheetsService.readSheet(spreadsheetId, "Itens!A2:H1000");
      const items = (itemsResult.values || []).map(row => ({
        id: row[0] || '', nome: row[1] || '',
        quantidade: parseInt(row[2]) || 1, categoria: row[3] || '',
        preco: parseFloat(row[4]) || 0, status: row[5] || 'pendente',
        dataCriacao: row[6] || '', dataCompra: row[7] || ''
      }));

      const historicoResult = await googleSheetsService.readSheet(spreadsheetId, "Historico!A2:H1000");
      const historico = (historicoResult.values || []).map(row => ({
        data: row[0] || '', item: row[1] || '',
        quantidade: parseInt(row[2]) || 1, preco: parseFloat(row[3]) || 0,
        categoria: row[4] || '', loja: row[5] || 'Não informado',
        total: parseFloat(row[6]) || 0, id: row[7] || ''
      }));

      setUserData(prev => ({ ...prev, items, historico }));
      
      if (user) {
        localStorage.setItem(`items_${user.email}`, JSON.stringify(items));
        localStorage.setItem(`historico_${user.email}`, JSON.stringify(historico));
      }

    } catch (error) {
      console.error("Erro ao carregar dados do Google Sheets:", error);
      if (user) loadDataFromLocalStorage(user.email);
    }
  };

  const loadDataFromLocalStorage = (userEmail) => {
    const localItems = JSON.parse(localStorage.getItem(`items_${userEmail}`) || '[]');
    const localHistorico = JSON.parse(localStorage.getItem(`historico_${userEmail}`) || '[]');
    setUserData(prev => ({ 
      ...prev, 
      items: localItems, 
      historico: localHistorico,
      hasGoogleSheets: false // Indica que está usando dados locais
    }));
  };

  const handleLogout = () => {
    if (user) {
      localStorage.removeItem(`user`);
      localStorage.removeItem(`spreadsheetId_${user.email}`);
      localStorage.removeItem(`token_${user.email}`);
    }
    googleSheetsService.setAccessToken(null); // Limpa o token de acesso
    setUser(null);
    setUserData({
      items: [],
      historico: [],
      isLoading: false,
      spreadsheetId: null
    });
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

  const toggleItemStatus = async (itemId) => {
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

    if (userData.spreadsheetId) {
      try {
        // Passando o rowIndex correto (itemIndex + 2)
        await googleSheetsService.updateItemStatusInSheet(
          userData.spreadsheetId,
          itemIndex + 2, // rowIndex é base 1 e temos um cabeçalho
          item.status,
          item.dataCompra
        );
      } catch (error) {
        console.error("Erro ao atualizar status do item no Google Sheets:", error);
        // Reverter a mudança em caso de erro
        updatedItems[itemIndex].status = isBought ? 'comprado' : 'pendente';
        updatedItems[itemIndex].dataCompra = isBought ? new Date().toLocaleDateString('pt-BR') : '';
        setUserData(prev => ({ ...prev, items: updatedItems }));
        if (user) {
          localStorage.setItem(`items_${user.email}`, JSON.stringify(updatedItems));
        }
      }
    }
  };

  const removeItem = async (itemId) => {
    const itemIndex = userData.items.findIndex(i => i.id === itemId);
    if (itemIndex === -1) return;

    const updatedItems = userData.items.filter(i => i.id !== itemId);
    setUserData(prev => ({ ...prev, items: updatedItems }));
    if (user) {
      localStorage.setItem(`items_${user.email}`, JSON.stringify(updatedItems));
    }

    if (userData.spreadsheetId) {
      const rowIndex = itemIndex + 2;
      const range = `Itens!A${rowIndex}:H${rowIndex}`;
      try {
        // This is a simplification. Deleting a row shifts all subsequent rows.
        // A more robust solution would be to clear the row and then maybe sort/filter.
        // For now, we clear it. A better approach for full CRUD is the Sheets API batchUpdate.
        await googleSheetsService.clearSheetRange(userData.spreadsheetId, range);
      } catch (error) {
        console.error("Erro ao remover item no Google Sheets:", error);
        // Optionally revert state change or notify user
      }
    }
  };

  const addItem = async (itemData) => {
    if (!userData.spreadsheetId || !user) {
      console.error("Ação não permitida: ID da planilha ou usuário não encontrado.");
      return false;
    }

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
    localStorage.setItem(`items_${user.email}`, JSON.stringify(updatedItems));

    try {
      // Corrigido: Usa a função de serviço `addItemToSheet` que faz o append de forma segura
      await googleSheetsService.addItemToSheet(userData.spreadsheetId, newItem);
      return true;
    } catch (error) {
      console.error("Erro ao adicionar item no Google Sheets:", error);
      
      // Reverte a adição local em caso de falha na API
      const revertedItems = userData.items.filter(item => item.id !== newItem.id);
      setUserData(prev => ({ ...prev, items: revertedItems }));
      localStorage.setItem(`items_${user.email}`, JSON.stringify(revertedItems));
      
      return false;
    }
  };

  const editItem = async (itemId, itemData) => {
    if (!userData.spreadsheetId || !user) {
      console.error("Ação não permitida: ID da planilha ou usuário não encontrado.");
      return false;
    }

    const itemIndex = userData.items.findIndex(i => i.id === itemId);
    if (itemIndex === -1) {
      console.error("Item não encontrado para edição.");
      return false;
    }

    const updatedItems = [...userData.items];
    const updatedItem = {
      ...updatedItems[itemIndex],
      ...itemData,
      preco: parseFloat(itemData.preco?.toString().replace(',', '.')) || 0,
    };
    updatedItems[itemIndex] = updatedItem;

    setUserData(prev => ({ ...prev, items: updatedItems }));
    localStorage.setItem(`items_${user.email}`, JSON.stringify(updatedItems));

    try {
      await googleSheetsService.editItemInSheet(
        userData.spreadsheetId,
        itemIndex + 2, // rowIndex é base 1 e temos um cabeçalho
        updatedItem
      );
      return true;
    } catch (error) {
      console.error("Erro ao editar item no Google Sheets:", error);
      
      // Reverte a edição local em caso de falha na API
      const revertedItems = [...userData.items];
      setUserData(prev => ({ ...prev, items: revertedItems }));
      localStorage.setItem(`items_${user.email}`, JSON.stringify(revertedItems));
      
      return false;
    }
  };

  const finalizePurchase = async () => {
    if (!userData.spreadsheetId || !user) {
      console.error("Ação não permitida: ID da planilha ou usuário não encontrado.");
      return false;
    }

    const itemsToProcess = userData.items.filter(item => item.status === 'comprado');
    if (itemsToProcess.length === 0) {
      return true; // Nada a fazer
    }

    try {
      // 1. Mover para o histórico (como antes)
      await googleSheetsService.moveItemsToHistory(userData.spreadsheetId, itemsToProcess);

      // 2. Atualizar o estado local
      const remainingItems = userData.items.filter(item => item.status !== 'comprado');
      const newHistory = [...userData.historico, ...itemsToProcess];

      setUserData(prev => ({
        ...prev,
        items: remainingItems,
        historico: newHistory,
      }));

      // 3. Atualizar o localStorage
      localStorage.setItem(`items_${user.email}`, JSON.stringify(remainingItems));
      localStorage.setItem(`historico_${user.email}`, JSON.stringify(newHistory));

      return true;
    } catch (error) {
      console.error("Erro ao finalizar a compra:", error);
      return false;
    }
  };

  const value = {
    user,
    userData,
    handleLogin,
    handleLogout,
    initializeSheetAndLoadData,
    getStatistics,
    toggleItemStatus,
    removeItem,
    addItem,
    editItem,
    finalizePurchase,
  };

  return (
    <UserDataContext.Provider value={value}>
      {children}
    </UserDataContext.Provider>
  );
};