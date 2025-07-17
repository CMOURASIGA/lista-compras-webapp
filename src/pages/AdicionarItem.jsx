import React, { useState } from 'react';
import { useUserData } from '../contexts/UserDataContext';
import PriceInput from '../components/PriceInput';
import { formatCurrency, isValidNumber } from '../utils/formatters';

const AdicionarItem = ({ onBack }) => {
  const { addItem, loading } = useUserData();
  const [formData, setFormData] = useState({
    nome: '',
    quantidade: 1,
    categoria: '',
    preco: 0
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const categorias = [
    'Grãos e Cereais',
    'Carnes e Peixes', 
    'Laticínios',
    'Frutas',
    'Verduras e Legumes',
    'Bebidas',
    'Limpeza',
    'Higiene',
    'Padaria',
    'Congelados',
    'Outros'
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    if (!formData.quantidade || formData.quantidade < 1) {
      newErrors.quantidade = 'Quantidade deve ser maior que 0';
    }

    if (!formData.categoria) {
      newErrors.categoria = 'Categoria é obrigatória';
    }

    if (!isValidNumber(formData.preco) || formData.preco <= 0) {
      newErrors.preco = 'Preço deve ser maior que 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const success = await addItem({
        nome: formData.nome.trim(),
        quantidade: parseInt(formData.quantidade),
        categoria: formData.categoria,
        preco: formData.preco.toString().replace('.', ',') // Converter para formato brasileiro
      });

      if (success) {
        setShowSuccess(true);
        setFormData({
          nome: '',
          quantidade: 1,
          categoria: '',
          preco: 0
        });
        setErrors({});

        // Esconder mensagem de sucesso após 3 segundos
        setTimeout(() => {
          setShowSuccess(false);
        }, 3000);
      }
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpar erro do campo quando usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Adicionar Novo Item
      </h2>

      {showSuccess && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md flex items-center">
          <span className="mr-2">✅</span>
          Item adicionado com sucesso!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nome do Item */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome do Item *
          </label>
          <input
            type="text"
            value={formData.nome}
            onChange={(e) => handleInputChange('nome', e.target.value)}
            placeholder="Ex: Arroz integral"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.nome ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={loading}
          />
          {errors.nome && (
            <p className="mt-1 text-xs text-red-500">{errors.nome}</p>
          )}
        </div>

        {/* Quantidade */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quantidade *
          </label>
          <input
            type="number"
            min="1"
            value={formData.quantidade}
            onChange={(e) => handleInputChange('quantidade', parseInt(e.target.value) || 1)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.quantidade ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={loading}
          />
          {errors.quantidade && (
            <p className="mt-1 text-xs text-red-500">{errors.quantidade}</p>
          )}
        </div>

        {/* Categoria */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Categoria *
          </label>
          <select
            value={formData.categoria}
            onChange={(e) => handleInputChange('categoria', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.categoria ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={loading}
          >
            <option value="">Selecione uma categoria</option>
            {categorias.map((categoria) => (
              <option key={categoria} value={categoria}>
                {categoria}
              </option>
            ))}
          </select>
          {errors.categoria && (
            <p className="mt-1 text-xs text-red-500">{errors.categoria}</p>
          )}
        </div>

        {/* Preço */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Preço Estimado (R$)
          </label>
          <PriceInput
            value={formData.preco}
            onChange={(value) => handleInputChange('preco', value)}
            placeholder="0,00"
            className={errors.preco ? 'border-red-500' : ''}
            disabled={loading}
          />
          {errors.preco && (
            <p className="mt-1 text-xs text-red-500">{errors.preco}</p>
          )}
          {formData.preco > 0 && (
            <p className="mt-1 text-xs text-gray-500">
              Total estimado: {formatCurrency(formData.preco * formData.quantidade)}
            </p>
          )}
        </div>

        {/* Botão Submit */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 px-4 rounded-md text-white font-medium transition-colors ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
          }`}
        >
          {loading ? 'Adicionando...' : 'Adicionar Item'}
        </button>
      </form>

      {/* Dicas */}
      <div className="mt-6 p-4 bg-yellow-50 rounded-md">
        <h3 className="text-sm font-medium text-yellow-800 mb-2">💡 Dicas:</h3>
        <ul className="text-xs text-yellow-700 space-y-1">
          <li>• Use nomes específicos para facilitar a identificação</li>
          <li>• Defina a quantidade correta para evitar desperdício</li>
          <li>• O preço estimado ajuda no controle do orçamento</li>
          <li>• Use vírgula para separar os centavos (ex: 1,50)</li>
        </ul>
      </div>
    </div>
  );
};

export default AdicionarItem;

