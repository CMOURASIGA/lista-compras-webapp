import React, { useState, useEffect } from 'react';

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
    if (value !== undefined && value !== null && value !== '') {
      // Converter número para formato brasileiro
      const numValue = typeof value === 'string' ? parseFloat(value.replace(',', '.')) : value;
      if (!isNaN(numValue)) {
        setDisplayValue(numValue.toFixed(2).replace('.', ','));
      }
    } else {
      setDisplayValue('');
    }
  }, [value]);

  const handleChange = (e) => {
    let inputValue = e.target.value;
    
    // Permitir apenas números e vírgula
    inputValue = inputValue.replace(/[^0-9,]/g, '');
    
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
    if (onChange) {
      if (inputValue === '') {
        onChange(0);
      } else {
        const numericValue = parseFloat(inputValue.replace(',', '.'));
        onChange(isNaN(numericValue) ? 0 : numericValue);
      }
    }
  };

  const handleBlur = () => {
    // Formatar valor ao perder o foco
    if (displayValue && displayValue !== '') {
      const numericValue = parseFloat(displayValue.replace(',', '.'));
      if (!isNaN(numericValue) && numericValue > 0) {
        setDisplayValue(numericValue.toFixed(2).replace('.', ','));
      } else if (displayValue === '0' || displayValue === '0,00') {
        setDisplayValue('');
      }
    }
  };

  const handleFocus = (e) => {
    // Selecionar todo o texto ao focar
    e.target.select();
  };

  const isValid = () => {
    if (!displayValue || displayValue === '') return true;
    const numericValue = parseFloat(displayValue.replace(',', '.'));
    return !isNaN(numericValue) && numericValue >= 0;
  };

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none text-sm">
        R$
      </span>
      <input
        type="text"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholder={placeholder}
        className={`pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full ${
          !isValid() ? 'border-red-500' : 'border-gray-300'
        } ${className}`}
        required={required}
        disabled={disabled}
        inputMode="decimal"
        autoComplete="off"
      />
      {!isValid() && displayValue && (
        <div className="absolute -bottom-5 left-0 text-xs text-red-500">
          Valor inválido
        </div>
      )}
    </div>
  );
};

export default PriceInput;

