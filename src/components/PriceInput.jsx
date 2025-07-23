import React, { useState, useEffect } from 'react';
import { DollarSign } from 'lucide-react';

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
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
        <DollarSign className="w-4 h-4 text-gray-500" />
      </div>
      <input
        type="text"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholder={placeholder}
        className={`pl-10 pr-4 py-3 border-0 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all w-full text-gray-800 placeholder-gray-400 ${
          !isValid() ? 'ring-2 ring-red-500 bg-red-50' : 'bg-gray-50'
        } ${className}`}
        required={required}
        disabled={disabled}
        inputMode="decimal"
        autoComplete="off"
      />
      {!isValid() && displayValue && (
        <div className="absolute -bottom-6 left-0 text-xs text-red-500 flex items-center space-x-1">
          <span className="w-1 h-1 bg-red-500 rounded-full"></span>
          <span>Valor inválido</span>
        </div>
      )}
    </div>
  );
};

export default PriceInput;