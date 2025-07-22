import { findOrCreateSpreadsheet } from '../services/googleSheetsService';

/**
 * Garante que a planilha do usuário esteja disponível, procurando-a ou criando-a.
 * Esta função agora atua como um wrapper para a lógica centralizada em findOrCreateSpreadsheet.
 * @param {string} userEmail - E-mail do usuário logado.
 * @returns {Promise<string>} O ID da planilha.
 */
export async function ensureSpreadsheetExists(userEmail) {
  console.log('Verificando a existência da planilha...');
  const spreadsheetId = await findOrCreateSpreadsheet(userEmail);

  if (spreadsheetId) {
    console.log('✅ Planilha pronta para uso:', spreadsheetId);
  }

  return spreadsheetId;
}