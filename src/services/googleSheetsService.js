// Google Sheets Service para integração com a API
class GoogleSheetsService {
  constructor() {
    this.isInitialized = false;
    this.gapi = null;
  }

  // Inicializar a API do Google
  async initialize() {
    if (this.isInitialized) return;

    return new Promise((resolve, reject) => {
      if (window.gapi) {
        window.gapi.load('client', async () => {
          try {
            await window.gapi.client.init({
              apiKey: process.env.REACT_APP_GOOGLE_API_KEY,
              discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4']
            });
            this.isInitialized = true;
            resolve();
          } catch (error) {
            reject(error);
          }
        });
      } else {
        reject(new Error('Google API não carregada'));
      }
    });
  }

  // Criar nova planilha para o usuário
  async createUserSpreadsheet(userEmail) {
    try {
      const response = await window.gapi.client.sheets.spreadsheets.create({
        properties: {
          title: `Lista de Compras - ${userEmail}`,
          locale: 'pt_BR',
          timeZone: 'America/Sao_Paulo'
        },
        sheets: [
          {
            properties: {
              title: 'Itens',
              gridProperties: {
                rowCount: 1000,
                columnCount: 8
              }
            }
          },
          {
            properties: {
              title: 'Historico',
              gridProperties: {
                rowCount: 1000,
                columnCount: 7
              }
            }
          }
        ]
      });

      const spreadsheetId = response.result.spreadsheetId;
      
      // Configurar cabeçalhos das abas
      await this.setupHeaders(spreadsheetId);
      
      // Salvar ID da planilha no localStorage
      localStorage.setItem(`spreadsheet_${userEmail}`, spreadsheetId);
      
      return spreadsheetId;
    } catch (error) {
      console.error('Erro ao criar planilha:', error);
      throw error;
    }
  }

  // Configurar cabeçalhos das planilhas
  async setupHeaders(spreadsheetId) {
    const requests = [
      {
        updateCells: {
          range: {
            sheetId: 0, // Aba "Itens"
            startRowIndex: 0,
            endRowIndex: 1,
            startColumnIndex: 0,
            endColumnIndex: 8
          },
          rows: [{
            values: [
              { userEnteredValue: { stringValue: 'ID' } },
              { userEnteredValue: { stringValue: 'Nome' } },
              { userEnteredValue: { stringValue: 'Quantidade' } },
              { userEnteredValue: { stringValue: 'Categoria' } },
              { userEnteredValue: { stringValue: 'Preço' } },
              { userEnteredValue: { stringValue: 'Status' } },
              { userEnteredValue: { stringValue: 'Data Criação' } },
              { userEnteredValue: { stringValue: 'Data Compra' } }
            ]
          }],
          fields: 'userEnteredValue'
        }
      },
      {
        updateCells: {
          range: {
            sheetId: 1, // Aba "Historico"
            startRowIndex: 0,
            endRowIndex: 1,
            startColumnIndex: 0,
            endColumnIndex: 7
          },
          rows: [{
            values: [
              { userEnteredValue: { stringValue: 'Data' } },
              { userEnteredValue: { stringValue: 'Item' } },
              { userEnteredValue: { stringValue: 'Quantidade' } },
              { userEnteredValue: { stringValue: 'Preço' } },
              { userEnteredValue: { stringValue: 'Categoria' } },
              { userEnteredValue: { stringValue: 'Loja' } },
              { userEnteredValue: { stringValue: 'Total' } }
            ]
          }],
          fields: 'userEnteredValue'
        }
      }
    ];

    await window.gapi.client.sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      resource: { requests }
    });
  }

  // Obter ID da planilha do usuário
  getUserSpreadsheetId(userEmail) {
    return localStorage.getItem(`spreadsheet_${userEmail}`);
  }

  // Adicionar item à lista
  async addItem(spreadsheetId, item) {
    const values = [[
      item.id,
      item.nome,
      item.quantidade,
      item.categoria,
      item.preco.replace(',', '.'), // Converter vírgula para ponto
      'pendente',
      new Date().toLocaleDateString('pt-BR'),
      ''
    ]];

    return await window.gapi.client.sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Itens!A:H',
      valueInputOption: 'USER_ENTERED',
      resource: { values }
    });
  }

  // Ler itens da lista
  async getItems(spreadsheetId) {
    try {
      const response = await window.gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Itens!A2:H' // Pular cabeçalho
      });

      const rows = response.result.values || [];
      return rows.map(row => ({
        id: row[0] || '',
        nome: row[1] || '',
        quantidade: parseInt(row[2]) || 1,
        categoria: row[3] || '',
        preco: parseFloat(row[4]) || 0,
        status: row[5] || 'pendente',
        dataCriacao: row[6] || '',
        dataCompra: row[7] || ''
      }));
    } catch (error) {
      console.error('Erro ao ler itens:', error);
      return [];
    }
  }

  // Marcar item como comprado
  async markItemAsBought(spreadsheetId, itemId) {
    try {
      // Primeiro, encontrar a linha do item
      const items = await this.getItems(spreadsheetId);
      const itemIndex = items.findIndex(item => item.id === itemId);
      
      if (itemIndex === -1) return false;

      const rowIndex = itemIndex + 2; // +2 porque começamos na linha 2 (pular cabeçalho)
      
      // Atualizar status e data de compra
      await window.gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `Itens!F${rowIndex}:G${rowIndex}`,
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [['comprado', new Date().toLocaleDateString('pt-BR')]]
        }
      });

      // Adicionar ao histórico
      const item = items[itemIndex];
      await this.addToHistory(spreadsheetId, {
        ...item,
        dataCompra: new Date().toLocaleDateString('pt-BR')
      });

      return true;
    } catch (error) {
      console.error('Erro ao marcar item como comprado:', error);
      return false;
    }
  }

  // Adicionar item ao histórico
  async addToHistory(spreadsheetId, item) {
    const values = [[
      item.dataCompra,
      item.nome,
      item.quantidade,
      item.preco,
      item.categoria,
      'Não informado', // Loja - será implementado futuramente
      (item.quantidade * item.preco).toFixed(2)
    ]];

    return await window.gapi.client.sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Historico!A:G',
      valueInputOption: 'USER_ENTERED',
      resource: { values }
    });
  }

  // Ler histórico de compras
  async getHistory(spreadsheetId) {
    try {
      const response = await window.gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Historico!A2:G' // Pular cabeçalho
      });

      const rows = response.result.values || [];
      return rows.map(row => ({
        data: row[0] || '',
        item: row[1] || '',
        quantidade: parseInt(row[2]) || 1,
        preco: parseFloat(row[3]) || 0,
        categoria: row[4] || '',
        loja: row[5] || 'Não informado',
        total: parseFloat(row[6]) || 0
      }));
    } catch (error) {
      console.error('Erro ao ler histórico:', error);
      return [];
    }
  }

  // Remover item da lista
  async removeItem(spreadsheetId, itemId) {
    try {
      // Encontrar a linha do item
      const items = await this.getItems(spreadsheetId);
      const itemIndex = items.findIndex(item => item.id === itemId);
      
      if (itemIndex === -1) return false;

      const rowIndex = itemIndex + 2; // +2 porque começamos na linha 2

      // Deletar a linha
      await window.gapi.client.sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        resource: {
          requests: [{
            deleteDimension: {
              range: {
                sheetId: 0, // Aba "Itens"
                dimension: 'ROWS',
                startIndex: rowIndex - 1, // 0-indexed
                endIndex: rowIndex
              }
            }
          }]
        }
      });

      return true;
    } catch (error) {
      console.error('Erro ao remover item:', error);
      return false;
    }
  }

  // Finalizar compra (mover itens comprados para histórico)
  async finalizePurchase(spreadsheetId) {
    try {
      const items = await this.getItems(spreadsheetId);
      const itemsComprados = items.filter(item => item.status === 'comprado');

      // Adicionar todos os itens comprados ao histórico
      for (const item of itemsComprados) {
        await this.addToHistory(spreadsheetId, item);
      }

      // Remover itens comprados da lista principal
      for (const item of itemsComprados) {
        await this.removeItem(spreadsheetId, item.id);
      }

      return true;
    } catch (error) {
      console.error('Erro ao finalizar compra:', error);
      return false;
    }
  }
}

// Instância singleton
const googleSheetsService = new GoogleSheetsService();

export default googleSheetsService;

