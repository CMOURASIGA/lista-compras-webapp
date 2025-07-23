
import { useAuth } from '../contexts/AuthContext';

let accessToken = null;

/**
 * Atualiza o token de acesso a partir do contexto de autenticação
 */
export function setAccessToken() {
  try {
    const { token } = useAuth();
    accessToken = token;
  } catch (e) {
    console.error("Erro ao obter token do contexto:", e);
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
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?valueInputOption=USER_ENTERED`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ values }),
    }
  );

  return res.json();
}
