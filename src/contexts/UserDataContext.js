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
      } catch (error) {
        console.error('Erro ao carregar usuário do localStorage:', error);
        localStorage.removeItem('user');
      }
    }
    setUserData(prev => ({ ...prev, isLoading: false }));
  }, []);

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

      // 2. Buscar informações do usuário do Google
      const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
      });
      if (!userInfoRes.ok) throw new Error('Falha ao buscar dados do usuário.');
      
      const userInfo = await userInfoRes.json();
      localStorage.setItem('user', JSON.stringify(userInfo));
      setUser(userInfo);

      // 3. Inicializar a planilha e carregar os dados
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
      const sheetName = `Lista de Compras - ${userEmail}`;
      let sheetId = googleSheetsService.getUserSpreadsheetId(userEmail);

      if (!sheetId) {
        sheetId = await googleSheetsService.findSpreadsheetByName(sheetName);
        if (sheetId) {
          localStorage.setItem(`spreadsheetId_${userEmail}`, sheetId);
        }
      }

      if (!sheetId) {
        sheetId = await googleSheetsService.createUserSpreadsheet(userEmail);
      }
      
      if (!sheetId) {
        throw new Error("Não foi possível obter ou criar uma planilha.");
      }

      setUserData(prev => ({ ...prev, spreadsheetId: sheetId }));
      await loadDataFromSheet(sheetId);

    } catch (error) {
      console.error("Erro ao inicializar a planilha:", error);
      loadDataFromLocalStorage(userEmail);
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
    setUserData(prev => ({ ...prev, items: localItems, historico: localHistorico }));
  };

  const handleLogout = () => {
    if (user) {
      localStorage.removeItem(`user`);
      localStorage.removeItem(`spreadsheetId_${user.email}`);
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

  const value = {
    user,
    userData,
    handleLogin,
    handleLogout,
    initializeSheetAndLoadData,
  };

  return (
    <UserDataContext.Provider value={value}>
      {children}
    </UserDataContext.Provider>
  );
};