let accessToken = null;
let gapi = null;

/**
 * Inicializa o Google API
 */
export async function initialize() {
  try {
    // Verificar se o gapi já está carregado
    if (window.gapi) {
      gapi = window.gapi;
      
      // Aguardar o carregamento das APIs necessárias
      await new Promise((resolve) => {
        gapi.load('client:auth2', resolve);
      });
      
      await gapi.client.init({
        clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID,
        discoveryDocs: [
          'https://sheets.googleapis.com/$discovery/rest?version=v4',
          'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'
        ],
        scope: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file'
      });
      
      console.log('Google API inicializada com sucesso');
      return true;
    } else {
      console.warn('Google API não está disponível');
      return false;
    }
  } catch (error) {
    console.error('Erro ao inicializar Google API:', error);
    return false;
  }
}

/**
 * Garante que o usuário está autenticado
 */
export async function ensureSignedIn() {
  try {
    if (!gapi) {
      await initialize();
    }
    
    const authInstance = gapi.auth2.getAuthInstance();
    if (!authInstance.isSignedIn.get()) {
      await authInstance.signIn();
    }
    
    const user = authInstance.currentUser.get();
    accessToken = user.getAuthResponse().access_token;
    return true;
  } catch (error) {
    console.error('Erro ao garantir autenticação:', error);
    return false;
  }
}

/**
 * Obtém o ID da planilha do usuário (armazenado no localStorage)
 */
export function getUserSpreadsheetId(userEmail) {
  return localStorage.getItem(`spreadsheetId_${userEmail}`);
}

/**
 * Cria uma nova planilha no Google Drive do usuário
 */
export async function createUserSpreadsheet(userEmail) {
  try {
    await ensureSignedIn();
    
    const spreadsheetData = {
      properties: {
        title: `Lista de Compras - ${userEmail}`,
      },
      sheets: [
        {
          properties: {
            title: 'Itens',
            gridProperties: {
              rowCount: 1000,
              columnCount: 10
            }
          }
        },
        {
          properties: {
            title: 'Historico',
            gridProperties: {
              rowCount: 1000,
              columnCount: 10
            }
          }
        }
      ]
    };

    const response = await gapi.client.sheets.spreadsheets.create({
      resource: spreadsheetData
    });

    const spreadsheetId = response.result.spreadsheetId;
    
    // Configurar cabeçalhos das planilhas
    await setupSpreadsheetHeaders(spreadsheetId);
    
    // Salvar o ID da planilha no localStorage
    localStorage.setItem(`spreadsheetId_${userEmail}`, spreadsheetId);
    
    console.log('Planilha criada com sucesso:', spreadsheetId);
    return spreadsheetId;
  } catch (error) {
    console.error('Erro ao criar planilha:', error);
    return null;
  }
}

/**
 * Configura os cabeçalhos das planilhas
 */
async function setupSpreadsheetHeaders(spreadsheetId) {
  try {
    const requests = [
      {
        updateCells: {
          range: {
            sheetId: 0, // Aba "Itens"
            startRowIndex: 0,
            endRowIndex: 1,
            startColumnIndex: 0,
            endColumnIndex: 7
          },
          rows: [{
            values: [
              { userEnteredValue: { stringValue: 'ID' } },
              { userEnteredValue: { stringValue: 'Nome' } },
              { userEnteredValue: { stringValue: 'Quantidade' } },
              { userEnteredValue: { stringValue: 'Categoria' } },
              { userEnteredValue: { stringValue: 'Preco' } },
              { userEnteredValue: { stringValue: 'Status' } },
              { userEnteredValue: { stringValue: 'DataCriacao' } }
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
            endColumnIndex: 8
          },
          rows: [{
            values: [
              { userEnteredValue: { stringValue: 'Data' } },
              { userEnteredValue: { stringValue: 'Item' } },
              { userEnteredValue: { stringValue: 'Quantidade' } },
              { userEnteredValue: { stringValue: 'Preco' } },
              { userEnteredValue: { stringValue: 'Categoria' } },
              { userEnteredValue: { stringValue: 'Loja' } },
              { userEnteredValue: { stringValue: 'Total' } },
              { userEnteredValue: { stringValue: 'ID' } }
            ]
          }],
          fields: 'userEnteredValue'
        }
      }
    ];

    await gapi.client.sheets.spreadsheets.batchUpdate({
      spreadsheetId: spreadsheetId,
      resource: { requests: requests }
    });

    console.log('Cabeçalhos configurados com sucesso');
  } catch (error) {
    console.error('Erro ao configurar cabeçalhos:', error);
  }
}

/**
 * Obtém todos os itens da planilha
 */
export async function getItems(spreadsheetId) {
  try {
    await ensureSignedIn();
    
    const response = await gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: 'Itens!A2:G1000'
    });

    const rows = response.result.values || [];
    const items = rows
      .filter(row => row[0]) // Filtrar linhas vazias
      .map(row => ({
        id: row[0] || '',
        nome: row[1] || '',
        quantidade: parseInt(row[2]) || 1,
        categoria: row[3] || '',
        preco: parseFloat(row[4]) || 0,
        status: row[5] || 'pendente',
        dataCriacao: row[6] || '',
        dataCompra: row[7] || ''
      }));

    return items;
  } catch (error) {
    console.error('Erro ao obter itens:', error);
    return [];
  }
}

/**
 * Obtém o histórico da planilha
 */
export async function getHistory(spreadsheetId) {
  try {
    await ensureSignedIn();
    
    const response = await gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: 'Historico!A2:H1000'
    });

    const rows = response.result.values || [];
    const history = rows
      .filter(row => row[0]) // Filtrar linhas vazias
      .map(row => ({
        data: row[0] || '',
        item: row[1] || '',
        quantidade: parseInt(row[2]) || 1,
        preco: parseFloat(row[3]) || 0,
        categoria: row[4] || '',
        loja: row[5] || 'Não informado',
        total: parseFloat(row[6]) || 0,
        id: row[7] || ''
      }));

    return history;
  } catch (error) {
    console.error('Erro ao obter histórico:', error);
    return [];
  }
}

/**
 * Adiciona um item à planilha
 */
export async function addItem(spreadsheetId, item) {
  try {
    await ensureSignedIn();
    
    const values = [[
      item.id,
      item.nome,
      item.quantidade,
      item.categoria,
      item.preco,
      item.status,
      item.dataCriacao,
      item.dataCompra || ''
    ]];

    await gapi.client.sheets.spreadsheets.values.append({
      spreadsheetId: spreadsheetId,
      range: 'Itens!A:H',
      valueInputOption: 'RAW',
      resource: { values: values }
    });

    console.log('Item adicionado com sucesso');
    return true;
  } catch (error) {
    console.error('Erro ao adicionar item:', error);
    return false;
  }
}

/**
 * Marca um item como comprado
 */
export async function markItemAsBought(spreadsheetId, itemId) {
  try {
    await ensureSignedIn();
    
    // Primeiro, encontrar a linha do item
    const items = await getItems(spreadsheetId);
    const itemIndex = items.findIndex(item => item.id === itemId);
    
    if (itemIndex === -1) {
      console.error('Item não encontrado');
      return false;
    }

    const rowIndex = itemIndex + 2; // +2 porque começamos na linha 2 (linha 1 é cabeçalho)
    const dataCompra = new Date().toLocaleDateString('pt-BR');

    await gapi.client.sheets.spreadsheets.values.update({
      spreadsheetId: spreadsheetId,
      range: `Itens!F${rowIndex}:G${rowIndex}`,
      valueInputOption: 'RAW',
      resource: {
        values: [['comprado', dataCompra]]
      }
    });

    console.log('Item marcado como comprado');
    return true;
  } catch (error) {
    console.error('Erro ao marcar item como comprado:', error);
    return false;
  }
}

/**
 * Remove um item da planilha
 */
export async function removeItem(spreadsheetId, itemId) {
  try {
    await ensureSignedIn();
    
    // Primeiro, encontrar a linha do item
    const items = await getItems(spreadsheetId);
    const itemIndex = items.findIndex(item => item.id === itemId);
    
    if (itemIndex === -1) {
      console.error('Item não encontrado');
      return false;
    }

    const rowIndex = itemIndex + 1; // +1 porque o índice do Google Sheets é baseado em 0, mas começamos na linha 2

    await gapi.client.sheets.spreadsheets.batchUpdate({
      spreadsheetId: spreadsheetId,
      resource: {
        requests: [{
          deleteDimension: {
            range: {
              sheetId: 0, // Aba "Itens"
              dimension: 'ROWS',
              startIndex: rowIndex,
              endIndex: rowIndex + 1
            }
          }
        }]
      }
    });

    console.log('Item removido com sucesso');
    return true;
  } catch (error) {
    console.error('Erro ao remover item:', error);
    return false;
  }
}

/**
 * Adiciona um item ao histórico
 */
export async function addToHistory(spreadsheetId, item) {
  try {
    await ensureSignedIn();
    
    const values = [[
      item.dataCompra || new Date().toLocaleDateString('pt-BR'),
      item.nome,
      item.quantidade,
      item.preco,
      item.categoria,
      'Não informado', // loja
      item.preco * item.quantidade, // total
      item.id
    ]];

    await gapi.client.sheets.spreadsheets.values.append({
      spreadsheetId: spreadsheetId,
      range: 'Historico!A:H',
      valueInputOption: 'RAW',
      resource: { values: values }
    });

    console.log('Item adicionado ao histórico');
    return true;
  } catch (error) {
    console.error('Erro ao adicionar ao histórico:', error);
    return false;
  }
}

/**
 * Troca o JWT por um access token OAuth2 (função legada, mantida para compatibilidade)
 */
export async function exchangeToken(jwt) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  const data = await res.json();
  if (data.access_token) {
    accessToken = data.access_token;
  } else {
    throw new Error("Erro ao trocar JWT por token de acesso: " + JSON.stringify(data));
  }
}

/**
 * Lê valores de uma planilha (função legada, mantida para compatibilidade)
 */
export async function readSheet(spreadsheetId, range) {
  if (!accessToken) throw new Error("Token de acesso não disponível");

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return res.json();
}

/**
 * Escreve valores em uma planilha (função legada, mantida para compatibilidade)
 */
export async function writeSheet(spreadsheetId, range, values) {
  if (!accessToken) throw new Error("Token de acesso não disponível");

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?valueInputOption=RAW`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        range,
        majorDimension: "ROWS",
        values,
      }),
    }
  );

  return res.json();
}

