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
              // Removido apiKey para permitir uso multiusuário
              clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID,
              discoveryDocs: [
                'https://sheets.googleapis.com/$discovery/rest?version=v4',
                'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'
              ],
              scope: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file'
            });
            
            this.isInitialized = true;
            console.log('Google Sheets API inicializada com sucesso (modo multiusuário)');
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

  // Criar nova planilha para o usuário (na conta dele)
  async createUserSpreadsheet(userEmail) {
    try {
      await this.initialize();
      await this.ensureSignedIn();

      console.log('Criando planilha na conta do usuário:', userEmail);

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
      console.log('Planilha criada na conta do usuário com ID:', spreadsheetId);
      
      // Configurar cabeçalhos das abas
      await this.setupHeaders(spreadsheetId);
      
      // Salvar ID da planilha no localStorage do usuário
      localStorage.setItem(`spreadsheet_${userEmail}`, spreadsheetId);
      
      return spreadsheetId;
    } catch (error) {
      console.error('Erro ao criar planilha:', error);
      // Se falhar, continuar apenas com localStorage
      console.log('Continuando apenas com localStorage...');
      return null;
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

      console.log('Item adicionado com sucesso na planilha do usuário');
      return response;
    } catch (error) {
      console.error('Erro ao adicionar item na planilha:', error);
      // Não falhar se Google Sheets não funcionar
      return null;
    }
  }

  // Ler itens da lista
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

      console.log('Itens carregados da planilha do usuário:', items.length);
      return items;
    } catch (error) {
      console.error('Erro ao ler itens da planilha:', error);
      return [];
    }
  }

  // Marcar item como comprado
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

      console.log('Item marcado como comprado na planilha do usuário:', itemId);
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
        'Não informado',
        (item.quantidade * item.preco).toFixed(2)
      ]];

      const response = await window.gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'Historico!A:G',
        valueInputOption: 'USER_ENTERED',
        resource: { values }
      });

      console.log('Item adicionado ao histórico na planilha do usuário');
      return response;
    } catch (error) {
      console.error('Erro ao adicionar ao histórico:', error);
      return null;
    }
  }

  // Ler histórico de compras
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

      console.log('Histórico carregado da planilha do usuário:', history.length);
      return history;
    } catch (error) {
      console.error('Erro ao ler histórico da planilha:', error);
      return [];
    }
  }

  // Remover item da lista
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

      console.log('Item removido da planilha do usuário:', itemId);
      return true;
    } catch (error) {
      console.error('Erro ao remover item da planilha:', error);
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

      console.log('Compra finalizada com sucesso na planilha do usuário');
      return true;
    } catch (error) {
      console.error('Erro ao finalizar compra na planilha:', error);
      return false;
    }
  }
}

// Instância singleton
const googleSheetsService = new GoogleSheetsService();

export default googleSheetsService;

