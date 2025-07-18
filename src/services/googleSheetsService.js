class GoogleSheetsService {
  constructor() {
    this.isInitialized = false;
    this.gapi = null;
  }

  async initialize() {
    if (this.isInitialized) return true;

    return new Promise((resolve, reject) => {
      if (typeof window.gapi === 'undefined') {
        const error = new Error('Google API (gapi) não carregada. Verifique o script api.js em index.html.');
        console.error(error);
        alert("Erro: Google API não carregada.");
        return reject(error);
      }

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
          console.log('✅ Google API inicializada com sucesso');
          resolve(true);
        } catch (error) {
          console.error('❌ Erro ao inicializar Google API:', error);
          alert("Erro ao inicializar Google API:\n" + JSON.stringify(error, null, 2));
          reject(error);
        }
      });
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
      console.log('✅ Usuário autenticado:', userEmail);

      const existingId = this.getUserSpreadsheetId(userEmail);
      if (existingId) {
        console.log(`🔁 Planilha já existente: ${existingId}`);
        return existingId;
      }

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
              gridProperties: { rowCount: 1000, columnCount: 8 }
            }
          },
          {
            properties: {
              title: 'Historico',
              gridProperties: { rowCount: 1000, columnCount: 7 }
            }
          }
        ]
      });

      const spreadsheetId = response.result.spreadsheetId;
      console.log('🟢 Planilha criada com ID:', spreadsheetId);

      await this.setupHeaders(spreadsheetId);
      localStorage.setItem(`spreadsheet_${userEmail}`, spreadsheetId);
      return spreadsheetId;
    } catch (error) {
      console.error('❌ Erro ao criar planilha:', error);
      alert("Erro ao criar planilha:\n" + JSON.stringify(error, null, 2));
      return null;
    }
  }

  async setupHeaders(spreadsheetId) {
    const requests = [
      {
        updateCells: {
          range: { sheetId: 0, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: 8 },
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
          range: { sheetId: 1, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: 7 },
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

    try {
      await window.gapi.client.sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        resource: { requests }
      });
      console.log('📄 Cabeçalhos configurados com sucesso');
    } catch (error) {
      console.error('Erro ao configurar cabeçalhos:', error);
      throw error;
    }
  }

  getUserSpreadsheetId(userEmail) {
    return localStorage.getItem(`spreadsheet_${userEmail}`);
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

      console.log('📥 Histórico carregado:', history.length);
      return history;
    } catch (error) {
      console.error('Erro ao ler histórico:', error);
      alert("Erro ao ler histórico:\n" + JSON.stringify(error, null, 2));
      return [];
    }
  }

  // (Demais métodos como addItem, getItems, markItemAsBought etc. permanecem iguais)
}

// Exportar instância
const googleSheetsService = new GoogleSheetsService();
export default googleSheetsService;
