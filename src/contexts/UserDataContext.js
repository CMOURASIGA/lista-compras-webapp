import React, { createContext, useContext, useState, useEffect } from 'react';
import googleSheetsService from '../services/googleSheetsService';

const UserDataContext = createContext();

export const useUserData = () => {
  const context = useContext(UserDataContext);
  if (!context) {
    throw new Error('useUserData deve ser usado dentro de UserDataProvider');
  }
  return context;
};

export const UserDataProvider = ({ children }) => {
  const [userData, setUserData] = useState({
    email: null,
    name: null,
    picture: null,
    spreadsheetId: null,
    isLoading: false,
    isInitialized: false
  });

  const [items, setItems] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // Inicializar dados do usuário após login
  const initializeUserData = async (userInfo) => {
    setLoading(true);
    try {
      const { email, name, picture } = userInfo;
      
      setUserData(prev => ({
        ...prev,
        email,
        name,
        picture,
        isLoading: true
      }));

      // Inicializar Google Sheets API
      await googleSheetsService.initialize();

      // Verificar se usuário já tem planilha
      let spreadsheetId = googleSheetsService.getUserSpreadsheetId(email);
      
      if (!spreadsheetId) {
        // Criar nova planilha para usuário novo
        console.log('Criando nova planilha para usuário:', email);
        spreadsheetId = await googleSheetsService.createUserSpreadsheet(email);
      }

      setUserData(prev => ({
        ...prev,
        spreadsheetId,
        isLoading: false,
        isInitialized: true
      }));

      // Carregar dados existentes
      await loadUserData(spreadsheetId);

    } catch (error) {
      console.error('Erro ao inicializar dados do usuário:', error);
      setUserData(prev => ({
        ...prev,
        isLoading: false,
        isInitialized: false
      }));
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados da planilha
  const loadUserData = async (spreadsheetId) => {
    if (!spreadsheetId) return;

    try {
      setLoading(true);
      
      // Carregar itens e histórico em paralelo
      const [itemsData, historyData] = await Promise.all([
        googleSheetsService.getItems(spreadsheetId),
        googleSheetsService.getHistory(spreadsheetId)
      ]);

      setItems(itemsData);
      setHistory(historyData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  // Adicionar novo item
  const addItem = async (itemData) => {
    if (!userData.spreadsheetId) return false;

    try {
      setLoading(true);
      
      const newItem = {
        id: Date.now().toString(),
        nome: itemData.nome,
        quantidade: parseInt(itemData.quantidade),
        categoria: itemData.categoria,
        preco: itemData.preco.replace(',', '.'), // Converter vírgula para ponto
        status: 'pendente'
      };

      // Adicionar à planilha
      await googleSheetsService.addItem(userData.spreadsheetId, newItem);
      
      // Atualizar estado local
      setItems(prev => [...prev, {
        ...newItem,
        preco: parseFloat(newItem.preco),
        dataCriacao: new Date().toLocaleDateString('pt-BR'),
        dataCompra: ''
      }]);

      return true;
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Marcar item como comprado
  const markItemAsBought = async (itemId) => {
    if (!userData.spreadsheetId) return false;

    try {
      setLoading(true);
      
      const success = await googleSheetsService.markItemAsBought(userData.spreadsheetId, itemId);
      
      if (success) {
        // Atualizar estado local
        setItems(prev => prev.map(item => 
          item.id === itemId 
            ? { ...item, status: 'comprado', dataCompra: new Date().toLocaleDateString('pt-BR') }
            : item
        ));

        // Recarregar histórico
        const historyData = await googleSheetsService.getHistory(userData.spreadsheetId);
        setHistory(historyData);
      }

      return success;
    } catch (error) {
      console.error('Erro ao marcar item como comprado:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Remover item
  const removeItem = async (itemId) => {
    if (!userData.spreadsheetId) return false;

    try {
      setLoading(true);
      
      const success = await googleSheetsService.removeItem(userData.spreadsheetId, itemId);
      
      if (success) {
        // Atualizar estado local
        setItems(prev => prev.filter(item => item.id !== itemId));
      }

      return success;
    } catch (error) {
      console.error('Erro ao remover item:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Finalizar compra
  const finalizePurchase = async () => {
    if (!userData.spreadsheetId) return false;

    try {
      setLoading(true);
      
      const success = await googleSheetsService.finalizePurchase(userData.spreadsheetId);
      
      if (success) {
        // Recarregar dados
        await loadUserData(userData.spreadsheetId);
      }

      return success;
    } catch (error) {
      console.error('Erro ao finalizar compra:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Calcular estatísticas
  const getStatistics = () => {
    const itemsPendentes = items.filter(item => item.status === 'pendente');
    const itemsComprados = items.filter(item => item.status === 'comprado');
    
    const totalPendente = itemsPendentes.reduce((sum, item) => sum + (item.preco * item.quantidade), 0);
    const totalComprado = itemsComprados.reduce((sum, item) => sum + (item.preco * item.quantidade), 0);
    const totalHistorico = history.reduce((sum, item) => sum + item.total, 0);
    
    const categoriaFavorita = history.reduce((acc, item) => {
      acc[item.categoria] = (acc[item.categoria] || 0) + 1;
      return acc;
    }, {});
    
    const categoriaTop = Object.keys(categoriaFavorita).reduce((a, b) => 
      categoriaFavorita[a] > categoriaFavorita[b] ? a : b, 'Nenhuma'
    );

    return {
      totalItens: items.length,
      itensPendentes: itemsPendentes.length,
      itensComprados: itemsComprados.length,
      totalPendente,
      totalComprado,
      totalHistorico,
      comprasRealizadas: history.length,
      gastoMedio: history.length > 0 ? totalHistorico / history.length : 0,
      categoriaFavorita: categoriaTop
    };
  };

  // Formatar valor em reais
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Limpar dados (logout)
  const clearUserData = () => {
    setUserData({
      email: null,
      name: null,
      picture: null,
      spreadsheetId: null,
      isLoading: false,
      isInitialized: false
    });
    setItems([]);
    setHistory([]);
  };

  const value = {
    // Dados do usuário
    userData,
    items,
    history,
    loading,
    
    // Ações
    initializeUserData,
    loadUserData,
    addItem,
    markItemAsBought,
    removeItem,
    finalizePurchase,
    clearUserData,
    
    // Utilitários
    getStatistics,
    formatCurrency
  };

  return (
    <UserDataContext.Provider value={value}>
      {children}
    </UserDataContext.Provider>
  );
};

export default UserDataContext;

