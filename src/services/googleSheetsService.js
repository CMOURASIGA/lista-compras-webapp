let accessToken = null;

/**
 * Define o token de acesso globalmente para ser usado nas chamadas de API.
 * @param {string | null} token O token de acesso ou null para limpar.
 */
export function setAccessToken(token) {
  accessToken = token;
}

/**
 * Lê valores de uma planilha
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
 * Escreve valores em uma planilha
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

/**
 * Cria uma nova planilha no Google Drive do usuário
 */
export async function createUserSpreadsheet(userEmail) {
  if (!accessToken) throw new Error("Token de acesso não disponível");

  const spreadsheetData = {
    properties: {
      title: `Lista de Compras - ${userEmail}`,
    },
    sheets: [
      { properties: { title: "Itens" } },
      { properties: { title: "Historico" } },
    ],
  };

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(spreadsheetData),
    }
  );

  const data = await res.json();
  const spreadsheetId = data.spreadsheetId;

  // Salva no localStorage para uso posterior
  localStorage.setItem(`spreadsheetId_${userEmail}`, spreadsheetId);
  return spreadsheetId;
}

/**
 * Getter de ID salvo
 */
export function getUserSpreadsheetId(userEmail) {
  return localStorage.getItem(`spreadsheetId_${userEmail}`);
}

/**
 * Define manualmente o accessToken, se necessário
 */
export function setAccessToken(token) {
  accessToken = token;
}


/**
 * Limpa células específicas em uma planilha
 */
export async function clearSheetRange(spreadsheetId, range) {
  if (!accessToken) throw new Error("Token de acesso não disponível");

  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:clear`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
}

/**
 * Procura por uma planilha pelo nome no Google Drive do usuário.
 * Requer o escopo 'https://www.googleapis.com/auth/drive.readonly' ou similar.
 */
export async function findSpreadsheetByName(fileName) {
  if (!accessToken) throw new Error("Token de acesso não disponível");

  const encodedFileName = encodeURIComponent(fileName);
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=name='${encodedFileName}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!res.ok) {
    const errorData = await res.json();
    console.error("Erro ao buscar planilha no Drive:", errorData);
    throw new Error(`Erro na API do Google Drive: ${res.statusText}`);
  }

  const data = await res.json();
  return data.files && data.files.length > 0 ? data.files[0].id : null;
}
