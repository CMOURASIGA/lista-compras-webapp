// Google Sheets Service para integração multiusuário (sem API Key)
class GoogleSheetsService {
  constructor() {
    this.isInitialized = false;
    this.gapi = null;
  }

  // Inicializar a API do Google (apenas com OAuth, sem API Key)
  async initialize() {
    if (this.isInitialized) return true;

    return new Promise((resolve, reject) => {
      if (window.gapi) {
        window.gapi.load('client:auth2', async () => {
          try {
            await window.gapi.client.init({
              clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID,
              discoveryDocs: [
                'https://sheets.googleapis.com/$discovery/rest?version=v4',
                'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'
              ],
              scope: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file'
            });

            this.isInitialized = true;
            console.log('🧩 API Google inicializada com sucesso com OAuth. Escopos ativos: spreadsheets, drive.file');
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

  isSignedIn() {
    if (!this.isInitialized || !window.gapi.auth2) return false;
    const authInstance = window.gapi.auth2.getAuthInstance();
    return authInstance && authInstance.isSignedIn.get();
  }

  async ensureSignedIn() {
    if (!this.isSignedIn()) {
      const authInstance = window.gapi.auth2.getAuthInstance();
      if (authInstance) {
        await authInstance.signIn();
      }
    }
  }

  async createUserSpreadsheet(userEmail) {
    try {
      await this.initialize();
      await this.ensureSignedIn();
      console.log('✅ Usuário autenticado para criação da planilha.');

      const existingId = this.getUserSpreadsheetId(userEmail);
      if (existingId) {
        console.log(`🔁 Planilha já existente para ${userEmail}: ${existingId}`);
        return existingId;
      }

      console.log('🟢 Criando planilha na conta do usuário:', userEmail);

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
      console.log('✅ Planilha criada na conta do usuário com ID:', spreadsheetId);

      await this.setupHeaders(spreadsheetId);

      localStorage.setItem(`spreadsheet_${userEmail}`, spreadsheetId);

      return spreadsheetId;
    } catch (error) {
      console.error('❌ Erro ao criar planilha:', error);
      console.log('⚠️ Continuando apenas com localStorage...');
      return null;
    }
  }

  async setupHeaders(spreadsheetId) {
    try {
      const requests = [
        {
          updateCells: {
            range: {
              sheetId: 0,
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
              sheetId: 1,
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

      console.log('✅ Cabeçalhos configurados com sucesso');
    } catch (error) {
      console.error('Erro ao configurar cabeçalhos:', error);
      throw error;
    }
  }

  getUserSpreadsheetId(userEmail) {
    return localStorage.getItem(`spreadsheet_${userEmail}`);
  }

  async addItem(spreadsheetId, item) {
    try {
      await this.ensureSignedIn();

      const values = [[
        item.id,
        item.nome,
        item.quantidade.toString(),
        item.categoria,
        item.preco.toString(),
        'pendente',
        new Date().toLocaleDateString('pt-BR'),
        ''
      ]];

      console.log('Adicionando item na planilha do usuário:', values);

      const response = await window.gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'Itens!A:H',
        valueInputOption: 'USER_ENTERED',
        resource: { values }
      });

      console.log('✅ Item adicionado com sucesso');
      return response;
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
      return null;
    }
  }

  async getItems(spreadsheetId) {
    try {
      await this.ensureSignedIn();

      const response = await window.gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Itens!A2:H'
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

      console.log('Itens carregados:', items.length);
      return items;
    } catch (error) {
      console.error('Erro ao ler itens:', error);
      return [];
    }
  }

  async markItemAsBought(spreadsheetId, itemId) {
    try {
      await this.ensureSignedIn();

      const items = await this.getItems(spreadsheetId);
      const itemIndex = items.findIndex(item => item.id === itemId);

      if (itemIndex === -1) {
        console.error('Item não encontrado:', itemId);
        return false;
      }

      const rowIndex = itemIndex + 2;

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

  async addToHistory(spreadsheetId, item) {
    try {
      await this.ensureSignedIn();

      const values = [[
        item.dataCompra,
        item.nome,
        item.quantidade.toString(),
        item.preco.toString(),
        item.categoria,
        'Não informado',
        (item.quantidade * item.preco).toFixed(2)
      ]];

      const response = await window.gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'Historico!A:G',
        valueInputOption: 'USER_ENTERED',
        resource: { values }
      });

      console.log('Item adicionado ao histórico');
      return response;
    } catch (error) {
      console.error('Erro ao adicionar ao histórico:', error);
      return null;
    }
  }

  async getHistory(spreadsheetId) {
    try {
      await this.ensureSignedIn();

      const response = await window.gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Historico!A2:G'
      });

      const rows = response.result.values || [];
      const history = rows.map(row => ({
        data: row[0] || '',
        item: row[1] || '',
        quantidade: parseInt(row[2]) || 1,
        preco: parseFloat(row[3]?.replace(',', '.')) || 0,
        categoria: row[4] || '',
        loja: row[5] || 'Não informado',
        total: parseFloat(row[6]?.replace(',', '.')) || 0
      }));

      console.log('Histórico carregado:', history.length);
      return history;
    } catch (error) {
      console.error('Erro ao ler histórico:', error);
      return [];
    }
  }

  async removeItem(spreadsheetId, itemId) {
    try {
      await this.ensureSignedIn();

      const items = await this.getItems(spreadsheetId);
      const itemIndex = items.findIndex(item => item.id === itemId);

      if (itemIndex === -1) return false;

      const rowIndex = itemIndex + 2;

      await window.gapi.client.sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        resource: {
          requests: [{
            deleteDimension: {
              range: {
                sheetId: 0,
                dimension: 'ROWS',
                startIndex: rowIndex - 1,
                endIndex: rowIndex
              }
            }
          }]
        }
      });

      console.log('Item removido:', itemId);
      return true;
    } catch (error) {
      console.error('Erro ao remover item:', error);
      return false;
    }
  }

  async finalizePurchase(spreadsheetId) {
    try {
      await this.ensureSignedIn();

      const items = await this.getItems(spreadsheetId);
      const itemsComprados = items.filter(item => item.status === 'comprado');

      if (itemsComprados.length === 0) {
        console.log('Nenhum item comprado para finalizar');
        return true;
      }

      for (const item of itemsComprados) {
        await this.addToHistory(spreadsheetId, {
          ...item,
          dataCompra: item.dataCompra || new Date().toLocaleDateString('pt-BR')
        });
      }

      for (const item of itemsComprados) {
        await this.removeItem(spreadsheetId, item.id);
      }

      console.log('✅ Compra finalizada');
      return true;
    } catch (error) {
      console.error('Erro ao finalizar compra:', error);
      return false;
    }
  }
}

// Exportar instância única
const googleSheetsService = new GoogleSheetsService();
export default googleSheetsService;
