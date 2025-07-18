// Google Sheets Service para integração com a API
class GoogleSheetsService {
  constructor() {
    this.isInitialized = false;
    this.gapi = null;
  }

  // Inicializar a API do Google
  async initialize() {
    if (this.isInitialized) return true;

    return new Promise((resolve, reject) => {
      if (window.gapi) {
        window.gapi.load('client:auth2', async () => {
          try {
            await window.gapi.client.init({
              apiKey: process.env.REACT_APP_GOOGLE_API_KEY,
              clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID,
              discoveryDocs: [
                'https://sheets.googleapis.com/$discovery/rest?version=v4',
                'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'
              ],
              scope: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file'
            });
            
            this.isInitialized = true;
            console.log('Google Sheets API inicializada com sucesso');
            resolve(true);
          } catch (error) {
            console.error('Erro ao inicializar Google API:', error);
            reject(error);
          }
        });
      } else {
        const error = new Error('Google API não carregada');
        console.error(error);
        reject(error);
      }
    });
  }

  // Verificar se o usuário está autenticado
  isSignedIn() {
    if (!this.isInitialized || !window.gapi.auth2) return false;
    const authInstance = window.gapi.auth2.getAuthInstance();
    return authInstance && authInstance.isSignedIn.get();
  }

  // Fazer login se necessário
  async ensureSignedIn() {
    if (!this.isSignedIn()) {
      const authInstance = window.gapi.auth2.getAuthInstance();
      if (authInstance) {
        await authInstance.signIn();
      }
    }
  }

  // Criar nova planilha para o usuário
  async createUserSpreadsheet(userEmail) {
    try {
      await this.initialize();
      await this.ensureSignedIn();

      console.log('Criando planilha para:', userEmail);

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
      console.log('Planilha criada com ID:', spreadsheetId);
      
      // Configurar cabeçalhos das abas
      await this.setupHeaders(spreadsheetId);
      
      // Salvar ID da planilha no localStorage
      localStorage.setItem(`spreadsheet_${userEmail}`, spreadsheetId);
      
      return spreadsheetId;
    } catch (error) {
      console.error('Erro ao criar planilha:', error);
      throw new Error(`Falha ao criar planilha: ${error.message}`);
    }
  }

  // Configurar cabeçalhos das planilhas
  async setupHeaders(spreadsheetId) {
    try {
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

      console.log('Cabeçalhos configurados com sucesso');
    } catch (error) {
      console.error('Erro ao configurar cabeçalhos:', error);
      throw error;
    }
  }

  // Obter ID da planilha do usuário
  getUserSpreadsheetId(userEmail) {
    return localStorage.getItem(`spreadsheet_${userEmail}`);
  }

  // Adicionar item à lista
  async addItem(spreadsheetId, item) {
    try {
      await this.ensureSignedIn();

      const values = [[
        item.id,
        item.nome,
        item.quantidade.toString(),
        item.categoria,
        item.preco.toString(), // Manter como string para preservar formatação
        'pendente',
        new Date().toLocaleDateString('pt-BR'),
        ''
      ]];

      console.log('Adicionando item:', values);

      const response = await window.gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'Itens!A:H',
        valueInputOption: 'USER_ENTERED',
        resource: { values }
      });

      console.log('Item adicionado com sucesso:', response);
      return response;
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
      throw new Error(`Falha ao adicionar item: ${error.message}`);
    }
  }

  // Ler itens da lista
  async getItems(spreadsheetId) {
    try {
      await this.ensureSignedIn();

      const response = await window.gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Itens!A2:H' // Pular cabeçalho
      });

      const rows = response.result.values || [];
      const items = rows.map(row => ({
        id: row[0] || '',
        nome: row[1] || '',
        quantidade: parseInt(row[2]) || 1,
        categoria: row[3] || '',
        preco: parseFloat(row[4]?.replace(',', '.')) || 0,
        status: row[5] || 'pendente',
        dataCriacao: row[6] || '',
        dataCompra: row[7] || ''
      }));

      console.log('Itens carregados:', items);
      return items;
    } catch (error) {
      console.error('Erro ao ler itens:', error);
      return [];
    }
  }

  // Marcar item como comprado
  async markItemAsBought(spreadsheetId, itemId) {
    try {
      await this.ensureSignedIn();

      // Primeiro, encontrar a linha do item
      const items = await this.getItems(spreadsheetId);
      const itemIndex = items.findIndex(item => item.id === itemId);
      
      if (itemIndex === -1) {
        console.error('Item não encontrado:', itemId);
        return false;
      }

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

      console.log('Item marcado como comprado:', itemId);
      return true;
    } catch (error) {
      console.error('Erro ao marcar item como comprado:', error);
      return false;
    }
  }

  // Adicionar item ao histórico
  async addToHistory(spreadsheetId, item) {
    try {
      await this.ensureSignedIn();
      
      const values = [[
        item.dataCompra,
        item.nome,
        item.quantidade.toString(),
        item.preco.toString(),
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
    } catch (error) {
      console.error('Erro ao adicionar ao histórico:', error);
      throw error;
    }
  }

  // Ler histórico de compras
  async getHistory(spreadsheetId) {
    try {
      await this.ensureSignedIn();

      const response = await window.gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Historico!A2:G' // Pular cabeçalho
      });

      const rows = response.result.values || [];
      return rows.map(row => ({
        data: row[0] || '',
        item: row[1] || '',
        quantidade: parseInt(row[2]) || 1,
        preco: parseFloat(row[3]?.replace(',', '.')) || 0,
        categoria: row[4] || '',
        loja: row[5] || 'Não informado',
        total: parseFloat(row[6]?.replace(',', '.')) || 0
      }));
    } catch (error) {
      console.error('Erro ao ler histórico:', error);
      return [];
    }
  }

  // Remover item da lista
  async removeItem(spreadsheetId, itemId) {
    try {
      await this.ensureSignedIn();

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
      await this.ensureSignedIn();

      const items = await this.getItems(spreadsheetId);
      const itemsComprados = items.filter(item => item.status === 'comprado');

      if (itemsComprados.length === 0) {
        console.log('Nenhum item comprado para finalizar');
        return true;
      }

      // Adicionar todos os itens comprados ao histórico
      for (const item of itemsComprados) {
        await this.addToHistory(spreadsheetId, {
          ...item,
          dataCompra: item.dataCompra || new Date().toLocaleDateString('pt-BR')
        });
      }

      // Remover itens comprados da lista principal
      for (const item of itemsComprados) {
        await this.removeItem(spreadsheetId, item.id);
      }

      console.log('Compra finalizada com sucesso');
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

