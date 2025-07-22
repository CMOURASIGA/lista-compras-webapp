
// Variável global para armazenar o token de acesso
let accessToken = null;

// Constante para o prefixo do nome da planilha
const SPREADSHEET_NAME_PREFIX = 'Lista de Compras -';

/**
 * Define o token de acesso para ser usado nas chamadas de API.
 * @param {string} token - O token de acesso OAuth2.
 */
export const setAccessToken = (token) => {
  accessToken = token;
};

/**
 * Cria um cabeçalho de autorização com o token de acesso.
 * @returns {Headers} - Objeto Headers com o token de autorização.
 */
const getAuthHeaders = () => {
  if (!accessToken) {
    throw new Error('Token de acesso não definido. Faça o login novamente.');
  }
  const headers = new Headers();
  headers.append('Authorization', `Bearer ${accessToken}`);
  headers.append('Content-Type', 'application/json');
  return headers;
};

/**
 * Busca o ID da planilha do usuário no localStorage.
 * @param {string} userEmail - O e-mail do usuário.
 * @returns {string|null} - O ID da planilha ou null se não encontrado.
 */
export const getUserSpreadsheetId = (userEmail) => {
  return localStorage.getItem(`spreadsheetId_${userEmail}`);
};

/**
 * Busca metadados da planilha, como o ID de cada aba.
 * @param {string} spreadsheetId - O ID da planilha.
 * @returns {Promise<Array>} - Uma lista de abas com suas propriedades.
 */
const getSheetMetadata = async (spreadsheetId) => {
  const headers = getAuthHeaders();
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties(sheetId,title)`,
    { headers }
  );

  if (!response.ok) {
    throw new Error('Falha ao buscar metadados da planilha.');
  }

  const data = await response.json();
  return data.sheets;
};

/**
 * Procura por uma planilha pelo nome no Google Drive do usuário.
 * @param {string} sheetName - O nome da planilha a ser procurada.
 * @returns {Promise<string|null>} - O ID da planilha se encontrada, senão null.
 */
const findSpreadsheetByName = async (sheetName) => {
  const headers = getAuthHeaders();
  const query = `mimeType='application/vnd.google-apps.spreadsheet' and name='${sheetName}' and trashed=false`;
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name)`,
    { headers }
  );

  if (!response.ok) {
    throw new Error('Falha ao buscar a planilha no Google Drive.');
  }

  const data = await response.json();
  if (data.files && data.files.length > 0) {
    return data.files[0].id;
  }
  return null;
};

/**
 * Cria uma nova planilha com abas "Itens" e "Historico".
 * @param {string} sheetName - O nome para a nova planilha.
 * @returns {Promise<string>} - O ID da planilha recém-criada.
 */
const createUserSpreadsheet = async (sheetName) => {
  const headers = getAuthHeaders();
  const body = {
    properties: { title: sheetName },
    sheets: [
      { properties: { title: 'Itens' } },
      { properties: { title: 'Historico' } },
    ],
  };

  const response = await fetch(
    'https://sheets.googleapis.com/v4/spreadsheets?fields=spreadsheetId,sheets.properties',
    {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    throw new Error('Falha ao criar a planilha.');
  }

  const spreadsheet = await response.json();
  await setupSheetHeaders(spreadsheet.spreadsheetId, spreadsheet.sheets);
  return spreadsheet.spreadsheetId;
};

/**
 * Garante que a planilha do usuário exista, procurando ou criando uma nova.
 * @param {string} userEmail - O e-mail do usuário.
 * @returns {Promise<string>} - O ID da planilha.
 */
export const findOrCreateSpreadsheet = async (userEmail) => {
  let spreadsheetId = getUserSpreadsheetId(userEmail);
  if (spreadsheetId) {
    return spreadsheetId;
  }

  const sheetName = `${SPREADSHEET_NAME_PREFIX}${userEmail}`;
  spreadsheetId = await findSpreadsheetByName(sheetName);

  if (spreadsheetId) {
    localStorage.setItem(`spreadsheetId_${userEmail}`, spreadsheetId);
    return spreadsheetId;
  }

  spreadsheetId = await createUserSpreadsheet(sheetName);
  localStorage.setItem(`spreadsheetId_${userEmail}`, spreadsheetId);
  return spreadsheetId;
};

/**
 * Configura os cabeçalhos das abas "Itens" e "Historico".
 * @param {string} spreadsheetId - O ID da planilha.
 * @param {Array} sheetProperties - As propriedades das abas.
 */
const setupSheetHeaders = async (spreadsheetId, sheetProperties) => {
  const headers = getAuthHeaders();
  const headerValues = {
    Itens: ["ID", "Nome", "Quantidade", "Categoria", "Preco", "Status", "DataCriacao", "DataCompra"],
    Historico: ["Data", "Item", "Quantidade", "Preco", "Categoria", "Loja", "Total", "ID"],
  };

  const sheetIdMap = {};
  sheetProperties.forEach(sheet => {
    sheetIdMap[sheet.properties.title] = sheet.properties.sheetId;
  });

  const requests = Object.keys(headerValues)
    .map(sheetTitle => ({
      updateCells: {
        range: { sheetId: sheetIdMap[sheetTitle], startRowIndex: 0, endRowIndex: 1 },
        rows: [{
          values: headerValues[sheetTitle].map(header => ({
            userEnteredValue: { stringValue: header },
            userEnteredFormat: { textFormat: { bold: true } },
          })),
        }],
        fields: 'userEnteredValue,userEnteredFormat.textFormat.bold',
      },
    }))
    .filter(req => req.updateCells.range.sheetId !== undefined);

  if (requests.length > 0) {
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({ requests }),
      }
    );
  }
};

/**
 * Lê dados de um intervalo em uma planilha.
 * @param {string} spreadsheetId - O ID da planilha.
 * @param {string} range - O intervalo a ser lido (ex: 'Itens!A:H').
 * @returns {Promise<Object>} - Os dados da planilha.
 */
export const readSheet = async (spreadsheetId, range) => {
  const headers = getAuthHeaders();
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`,
    { headers }
  );

  if (!response.ok) {
    throw new Error(`Falha ao ler a planilha: ${range}`);
  }

  return response.json();
};

/**
 * Adiciona um novo item à aba "Itens".
 * @param {string} spreadsheetId - O ID da planilha.
 * @param {Object} item - O item a ser adicionado.
 */
export const addItemToSheet = async (spreadsheetId, item) => {
  const headers = getAuthHeaders();
  const range = 'Itens!A:H';
  const values = [[
    item.id, item.nome, item.quantidade, item.categoria,
    item.preco, item.status, item.dataCriacao, item.dataCompra
  ]];

  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({ values }),
    }
  );
};

/**
 * Atualiza o status e a data de compra de um item na planilha.
 * @param {string} spreadsheetId - O ID da planilha.
 * @param {number} rowIndex - O índice da linha a ser atualizada.
 * @param {string} status - O novo status.
 * @param {string} dataCompra - A nova data de compra.
 */
export const updateItemStatusInSheet = async (spreadsheetId, rowIndex, status, dataCompra) => {
  const headers = getAuthHeaders();
  const sheetMetadata = await getSheetMetadata(spreadsheetId);
  const itensSheet = sheetMetadata.find(s => s.properties.title === 'Itens');
  if (!itensSheet) throw new Error("Aba 'Itens' não encontrada.");

  const requests = [
    {
      updateCells: {
        range: { sheetId: itensSheet.properties.sheetId, startRowIndex: rowIndex - 1, endRowIndex: rowIndex, startColumnIndex: 5, endColumnIndex: 6 },
        rows: [{ values: [{ userEnteredValue: { stringValue: status } }] }],
        fields: 'userEnteredValue',
      },
    },
    {
      updateCells: {
        range: { sheetId: itensSheet.properties.sheetId, startRowIndex: rowIndex - 1, endRowIndex: rowIndex, startColumnIndex: 7, endColumnIndex: 8 },
        rows: [{ values: [{ userEnteredValue: { stringValue: dataCompra } }] }],
        fields: 'userEnteredValue',
      },
    },
  ];

  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({ requests }),
    }
  );
};

/**
 * Move itens da aba "Itens" para a aba "Historico".
 * @param {string} spreadsheetId - O ID da planilha.
 * @param {Array} itemsToMove - A lista de itens a serem movidos.
 */
export const moveItemsToHistory = async (spreadsheetId, itemsToMove) => {
  const headers = getAuthHeaders();
  const sheetMetadata = await getSheetMetadata(spreadsheetId);
  const itensSheet = sheetMetadata.find(s => s.properties.title === 'Itens');
  if (!itensSheet) throw new Error("Aba 'Itens' não encontrada.");

  // 1. Adicionar itens ao Histórico
  const historyValues = itemsToMove.map(item => [
    new Date().toLocaleDateString('pt-BR'),
    item.nome, item.quantidade, item.preco, item.categoria, 'N/A',
    (item.preco || 0) * (item.quantidade || 1), item.id
  ]);

  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Historico!A:H:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({ values: historyValues }),
    }
  );

  // 2. Deletar itens da aba "Itens"
  const allItemsResult = await readSheet(spreadsheetId, "Itens!A2:A");
  const allSheetItemIds = (allItemsResult.values || []).map(row => row[0]);

  const deleteRequests = [];
  for (let i = allSheetItemIds.length - 1; i >= 0; i--) {
    if (itemsToMove.some(item => item.id === allSheetItemIds[i])) {
      deleteRequests.push({
        deleteDimension: {
          range: {
            sheetId: itensSheet.properties.sheetId,
            dimension: 'ROWS',
            startIndex: i + 1,
            endIndex: i + 2,
          },
        },
      });
    }
  }

  if (deleteRequests.length > 0) {
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({ requests: deleteRequests }),
      }
    );
  }
};

/**
 * Edita um item existente na aba "Itens".
 * @param {string} spreadsheetId - O ID da planilha.
 * @param {number} rowIndex - O índice da linha a ser editada (base 1).
 * @param {Object} item - O item com os novos dados.
 */
export const editItemInSheet = async (spreadsheetId, rowIndex, item) => {
  const headers = getAuthHeaders();
  const sheetMetadata = await getSheetMetadata(spreadsheetId);
  const itensSheet = sheetMetadata.find(s => s.properties.title === 'Itens');
  if (!itensSheet) throw new Error("Aba 'Itens' não encontrada.");

  const values = [[
    item.id, item.nome, item.quantidade, item.categoria,
    item.preco, item.status, item.dataCriacao, item.dataCompra
  ]];

  const requests = [{
    updateCells: {
      range: { 
        sheetId: itensSheet.properties.sheetId, 
        startRowIndex: rowIndex - 1, 
        endRowIndex: rowIndex, 
        startColumnIndex: 0, 
        endColumnIndex: 8 
      },
      rows: [{
        values: values[0].map(value => ({
          userEnteredValue: { stringValue: value.toString() }
        }))
      }],
      fields: 'userEnteredValue',
    },
  }];

  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({ requests }),
    }
  );
};

/**
 * Limpa um intervalo de células na planilha.
 * @param {string} spreadsheetId - O ID da planilha.
 * @param {string} range - O intervalo a ser limpo (ex: 'Itens!A2:H2').
 */
export const clearSheetRange = async (spreadsheetId, range) => {
  const headers = getAuthHeaders();
  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:clear`,
    {
      method: 'POST',
      headers,
    }
  );
};
