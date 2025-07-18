import React, { createContext, useContext, useState, useEffect } from 'react';
import * as googleSheetsService from '../services/googleSheetsService';
import { formatCurrency, parseInputValue } from '../utils/formatters';

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
    items: [],
    historico: [],
    isLoading: false,
    hasGoogleSheets: false,
    spreadsheetId: null
  });

  const [user, setUser] = useState(null);

  // Carregar dados do localStorage na inicialização
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const userInfo = JSON.parse(savedUser);
        setUser(userInfo);
        loadUserData(userInfo.email);
      } catch (error) {
        console.error('Erro ao carregar usuário:', error);
      }
    }
  }, []);

  // Carregar dados do usuário (localStorage + Google Sheets)
  const loadUserData = async (userEmail) => {
    setUserData(prev => ({ ...prev, isLoading: true }));

    try {
      // Carregar dados do localStorage primeiro (fallback)
      const localItems = JSON.parse(localStorage.getItem(`items_${userEmail}`) || '[]');
      const localHistorico = JSON.parse(localStorage.getItem(`historico_${userEmail}`) || '[]');

      setUserData(prev => ({
        ...prev,
        items: localItems,
        historico: localHistorico,
        isLoading: false
      }));

      // Tentar carregar do Google Sheets (se disponível)
      await loadFromGoogleSheets(userEmail);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setUserData(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Carregar dados do Google Sheets
  const loadFromGoogleSheets = async (userEmail) => {
    try {
      // Sem API Key, funciona apenas com OAuth do usuário
      console.log('Tentando carregar dados do Google Sheets do usuário...');

      
      let spreadsheetId = googleSheetsService.getUserSpreadsheetId(userEmail);
      
      if (!spreadsheetId) {
        console.log('Criando nova planilha na conta do usuário...');
        spreadsheetId = await googleSheetsService.createUserSpreadsheet(userEmail);
      } else {
        // Se a planilha já existe, garantir que o usuário está autenticado para acessá-la
      }

      if (spreadsheetId) {
        const result = await googleSheetsService.readSheet(spreadsheetId, "Itens!A2:G1000");
        const items = (resultHistorico.values || []).map(row => ({
          id: row[0] || '',
          nome: row[1] || '',
          quantidade: parseInt(row[2]) || 1,
          categoria: row[3] || '',
          preco: parseFloat(row[4]) || 0,
          status: row[5] || 'pendente',
          dataCriacao: row[6] || '',
          dataCompra: row[7] || ''
        }));
        const resultHistorico = await googleSheetsService.readSheet(spreadsheetId, "Historico!A2:H1000");
        const historico = (resultHistorico.values || []).map(row => ({
          data: row[0] || '',
          item: row[1] || '',
          quantidade: parseInt(row[2]) || 1,
          preco: parseFloat(row[3]) || 0,
          categoria: row[4] || '',
          loja: row[5] || 'Não informado',
          total: parseFloat(row[6]) || 0,
          id: row[7] || ''
        }));

        setUserData(prev => ({
          ...prev,
          items,
          historico,
          hasGoogleSheets: true,
          spreadsheetId
        }));

        // Sincronizar com localStorage
        localStorage.setItem(`items_${userEmail}`, JSON.stringify(items));
        localStorage.setItem(`historico_${userEmail}`, JSON.stringify(historico));
        
        console.log('Dados carregados do Google Sheets com sucesso');
      } else {
        console.log('Continuando apenas com localStorage (Google Sheets não disponível)');
      }

    } catch (error) {
      console.error('Erro ao carregar do Google Sheets:', error);
      console.log('Continuando apenas com localStorage como fallback');
      // Continuar usando localStorage como fallback
    }
  };

  // Salvar dados (localStorage + Google Sheets)
  const saveData = async (type, data) => {
    if (!user) return;

    try {
      // Salvar no localStorage primeiro (sempre funciona)
      localStorage.setItem(`${type}_${user.email}`, JSON.stringify(data));

      // Atualizar estado local
      setUserData(prev => ({ ...prev, [type]: data }));

      // Tentar salvar no Google Sheets (se disponível)
      if (userData.hasGoogleSheets && userData.spreadsheetId) {
        // Implementar sincronização com Google Sheets aqui
        console.log('Sincronizando com Google Sheets...');
      }

    } catch (error) {
      console.error('Erro ao salvar dados:', error);
    }
  };

  // Adicionar item
  const addItem = async (itemData) => {
    if (!user) return false;

    try {
      const newItem = {
        id: Date.now().toString(),
        nome: itemData.nome,
        quantidade: parseInt(itemData.quantidade) || 1,
        categoria: itemData.categoria,
        preco: parseFloat(itemData.preco?.toString().replace(',', '.')) || 0,
        status: 'pendente',
        dataCriacao: new Date().toLocaleDateString('pt-BR'),
        dataCompra: ''
      };

      const updatedItems = [...userData.items, newItem];
      await saveData('items', updatedItems);

      // Tentar adicionar no Google Sheets
      if (userData.hasGoogleSheets && userData.spreadsheetId) {
        try {
          await googleSheetsService.writeSheet(userData.spreadsheetId, "Itens!A:H", [[
        newItem.id,
        newItem.nome,
        newItem.quantidade,
        newItem.categoria,
        newItem.preco,
        newItem.status,
        newItem.dataCriacao,
        newItem.dataCompra || ''
    ]]);
        } catch (error) {
          console.error('Erro ao adicionar no Google Sheets:', error);
        }
      }

      return true;
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
      return false;
    }
  };

  // Marcar item como comprado
  const markItemAsBought = async (itemId) => {
    if (!user) return false;

    try {
      const updatedItems = userData.items.map(item => 
        item.id === itemId 
          ? { ...item, status: 'comprado', dataCompra: new Date().toLocaleDateString('pt-BR') }
          : item
      );

      await saveData('items', updatedItems);

      // Tentar atualizar no Google Sheets
      if (userData.hasGoogleSheets && userData.spreadsheetId) {
        try {
          await googleSheetsService.markItemAsBought(userData.spreadsheetId, itemId);
        } catch (error) {
          console.error('Erro ao atualizar no Google Sheets:', error);
        }
      }

      return true;
    } catch (error) {
      console.error('Erro ao marcar item como comprado:', error);
      return false;
    }
  };

  // Remover item
  const removeItem = async (itemId) => {
    if (!user) return false;

    try {
      const updatedItems = userData.items.filter(item => item.id !== itemId);
      await saveData('items', updatedItems);

      // Tentar remover do Google Sheets
      if (userData.hasGoogleSheets && userData.spreadsheetId) {
        try {
          await googleSheetsService.removeItem(userData.spreadsheetId, itemId);
        } catch (error) {
          console.error('Erro ao remover do Google Sheets:', error);
        }
      }

      return true;
    } catch (error) {
      console.error('Erro ao remover item:', error);
      return false;
    }
  };

  // Finalizar compra
  const finalizePurchase = async () => {
    if (!user) return false;

    try {
      const itemsComprados = userData.items.filter(item => item.status === 'comprado');
      
      if (itemsComprados.length === 0) {
        return true; // Nada para finalizar
      }

      // Adicionar ao histórico
      const novoHistoricoLocal = [
        ...userData.historico,
        ...itemsComprados.map(item => ({
          data: item.dataCompra,
          item: item.nome,
          quantidade: item.quantidade,
          preco: item.preco,
          categoria: item.categoria,
          loja: 'Não informado',
          total: item.quantidade * item.preco
        }))
      ];

      // Remover itens comprados da lista
      const itensRestantesLocal = userData.items.filter(item => item.status !== 'comprado');

      // Salvar no localStorage primeiro
      await saveData('historico', novoHistoricoLocal);
      await saveData('items', itensRestantesLocal);

      // Tentar sincronizar com Google Sheets
      if (userData.hasGoogleSheets && userData.spreadsheetId) {
        try {
          // Adicionar ao histórico no Google Sheets
          for (const item of itemsComprados) {
            await googleSheetsService.addToHistory(userData.spreadsheetId, {
              ...item,
              dataCompra: item.dataCompra || new Date().toLocaleDateString("pt-BR")
            });
          }
          // Remover itens comprados da lista no Google Sheets
          for (const item of itemsComprados) {
            await googleSheetsService.removeItem(userData.spreadsheetId, item.id);
          }
          // Após operações no Google Sheets, recarregar para garantir consistência
          await loadUserData(user.email);
        } catch (error) {
          console.error('Erro ao sincronizar com Google Sheets durante finalização:', error);
          // Não precisa lançar erro, apenas logar e continuar com localStorage
        }
      }

      return true;
    } catch (error) {
      console.error('Erro ao finalizar compra:', error);
      return false;
    }
  };

  // Limpar dados do usuário
  const clearUserData = () => {
    if (user) {
      localStorage.removeItem(`items_${user.email}`);
      localStorage.removeItem(`historico_${user.email}`);
    }
    setUserData({
      items: [],
      historico: [],
      isLoading: false,
      hasGoogleSheets: false,
      spreadsheetId: null
    });
    setUser(null);
  };

  // Calcular estatísticas
  const getStatistics = () => {
    const totalItens = userData.items.length;
    const itensComprados = userData.items.filter(item => item.status === 'comprado').length;
    const itensPendentes = totalItens - itensComprados;
    
    const valorTotal = userData.items.reduce((total, item) => 
      total + (item.preco * item.quantidade), 0
    );
    
    const valorComprado = userData.items
      .filter(item => item.status === 'comprado')
      .reduce((total, item) => total + (item.preco * item.quantidade), 0);

    const valorPendente = valorTotal - valorComprado;

    return {
      totalItens,
      itensComprados,
      itensPendentes,
      valorTotal,
      valorComprado,
      valorPendente
    };
  };

  const value = {
    userData,
    user,
    setUser,
    loadUserData,
    addItem,
    markItemAsBought,
    removeItem,
    finalizePurchase,
    clearUserData,
    getStatistics
  };

  return (
    <UserDataContext.Provider value={value}>
      {children}
    </UserDataContext.Provider>
  );
};

