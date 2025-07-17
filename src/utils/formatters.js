// Utilitários para formatação brasileira

// Formatar valor monetário em reais
export const formatCurrency = (value) => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return 'R$ 0,00';
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numValue);
};

// Formatar número com vírgula decimal brasileira
export const formatNumber = (value) => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return '0';
  
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(numValue);
};

// Converter entrada de texto com vírgula para número
export const parseInputValue = (inputValue) => {
  if (!inputValue) return 0;
  
  // Remover espaços e substituir vírgula por ponto
  const cleanValue = inputValue.toString().trim().replace(',', '.');
  const numValue = parseFloat(cleanValue);
  
  return isNaN(numValue) ? 0 : numValue;
};

// Formatar input de preço para exibição (com vírgula)
export const formatPriceInput = (value) => {
  if (!value) return '';
  
  const numValue = parseInputValue(value);
  return numValue.toFixed(2).replace('.', ',');
};

// Validar se o valor é um número válido
export const isValidNumber = (value) => {
  if (!value) return false;
  
  const numValue = parseInputValue(value);
  return !isNaN(numValue) && numValue >= 0;
};

// Formatar data brasileira
export const formatDate = (date) => {
  if (!date) return '';
  
  const dateObj = date instanceof Date ? date : new Date(date);
  
  return dateObj.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// Formatar data e hora brasileira
export const formatDateTime = (date) => {
  if (!date) return '';
  
  const dateObj = date instanceof Date ? date : new Date(date);
  
  return dateObj.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Capitalizar primeira letra de cada palavra
export const capitalizeWords = (str) => {
  if (!str) return '';
  
  return str.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
};

// Formatar quantidade (sem decimais desnecessários)
export const formatQuantity = (quantity) => {
  const num = parseInt(quantity);
  return isNaN(num) ? 1 : num;
};

// Detectar se o usuário está no Brasil (para formatação automática)
export const isBrazilianLocale = () => {
  const locale = navigator.language || navigator.languages[0];
  return locale.startsWith('pt-BR') || locale.startsWith('pt');
};

// Configurar formatação baseada na localização
export const getLocaleConfig = () => {
  const isBR = isBrazilianLocale();
  
  return {
    currency: isBR ? 'BRL' : 'USD',
    locale: isBR ? 'pt-BR' : 'en-US',
    decimalSeparator: isBR ? ',' : '.',
    thousandsSeparator: isBR ? '.' : ',',
    currencySymbol: isBR ? 'R$' : '$'
  };
};

// Máscara para input de preço
export const maskPrice = (value) => {
  if (!value) return '';
  
  // Remove tudo que não é número
  let numericValue = value.replace(/\D/g, '');
  
  // Adiciona zeros à esquerda se necessário
  numericValue = numericValue.padStart(3, '0');
  
  // Insere a vírgula decimal
  const integerPart = numericValue.slice(0, -2);
  const decimalPart = numericValue.slice(-2);
  
  return `${integerPart},${decimalPart}`;
};

// Remover máscara de preço
export const unmaskPrice = (maskedValue) => {
  if (!maskedValue) return 0;
  
  return parseInputValue(maskedValue);
};

