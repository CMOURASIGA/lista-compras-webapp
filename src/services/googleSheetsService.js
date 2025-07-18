let accessToken = null;

/**
 * Troca o JWT (credential) do Google Identity por um access token OAuth2
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
