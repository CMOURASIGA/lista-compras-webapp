import React, { useState, useEffect } from 'react';
import { formatPriceInput, parseInputValue, isValidNumber } from '../utils/formatters';

const PriceInput = ({ 
  value, 
  onChange, 
  placeholder = "0,00", 
  className = "",
  required = false,
  disabled = false 
}) => {
  const [displayValue, setDisplayValue] = useState('');

  useEffect(() => {
    if (value !== undefined && value !== null) {
      setDisplayValue(formatPriceInput(value));
    }
  }, [value]);

  const handleChange = (e) => {
    let inputValue = e.target.value;
    
    // Permitir apenas números, vírgula e ponto
    inputValue = inputValue.replace(/[^0-9,\.]/g, '');
    
    // Substituir ponto por vírgula (padrão brasileiro)
    inputValue = inputValue.replace('.', ',');
    
    // Permitir apenas uma vírgula
    const commaCount = (inputValue.match(/,/g) || []).length;
    if (commaCount > 1) {
      return;
    }
    
    // Limitar casas decimais a 2
    const parts = inputValue.split(',');
    if (parts[1] && parts[1].length > 2) {
      inputValue = parts[0] + ',' + parts[1].substring(0, 2);
    }
    
    setDisplayValue(inputValue);
    
    // Converter para número e enviar para o componente pai
    const numericValue = parseInputValue(inputValue);
    if (onChange) {
      onChange(numericValue);
    }
  };

  const handleBlur = () => {
    // Formatar valor ao perder o foco
    if (displayValue) {
      const numericValue = parseInputValue(displayValue);
      if (!isNaN(numericValue)) {
        setDisplayValue(formatPriceInput(numericValue));
      }
    }
  };

  const handleFocus = (e) => {
    // Selecionar todo o texto ao focar
    e.target.select();
  };

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none">
        R$
      </span>
      <input
        type="text"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholder={placeholder}
        className={`pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
        required={required}
        disabled={disabled}
        inputMode="decimal"
      />
      {!isValidNumber(displayValue) && displayValue && (
        <div className="absolute -bottom-5 left-0 text-xs text-red-500">
          Valor inválido
        </div>
      )}
    </div>
  );
};

export default PriceInput;

