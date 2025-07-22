import React, { useState } from 'react';
import { useUserData } from '../contexts/UserDataContext';
import PriceInput from '../components/PriceInput';

const AdicionarItem = () => {
  const { addItem } = useUserData();
  const [formData, setFormData] = useState({
    nome: '',
    quantidade: '1',
    categoria: '',
    preco: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePriceChange = (value) => {
    setFormData(prev => ({
      ...prev,
      preco: value
    }));
  };

  const validateForm = () => {
    if (!formData.nome.trim()) {
      setMessage({ type: 'error', text: 'Nome do item é obrigatório' });
      return false;
    }
    if (!formData.categoria) {
      setMessage({ type: 'error', text: 'Categoria é obrigatória' });
      return false;
    }
    if (!formData.quantidade || parseInt(formData.quantidade) < 1) {
      setMessage({ type: 'error', text: 'Quantidade deve ser maior que zero' });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const success = await addItem(formData);
      
      if (success) {
        setMessage({ type: 'success', text: 'Item adicionado com sucesso!' });
        setFormData({
          nome: '',
          quantidade: '1',
          categoria: '',
          preco: ''
        });
      } else {
        setMessage({ type: 'error', text: 'Erro ao adicionar item. Tente novamente.' });
      }
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
      setMessage({ type: 'error', text: 'Erro inesperado. Tente novamente.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateTotal = () => {
    const precoStr = formData.preco?.toString() || '';
    const preco = parseFloat(precoStr.replace(',', '.')) || 0;
    const quantidade = parseInt(formData.quantidade) || 0;
    return preco * quantidade;
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800 text-center">
          Adicionar Novo Item
        </h2>

        {message.text && (
          <div className={`mb-4 p-3 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-100 text-green-700 border border-green-200' 
              : 'bg-red-100 text-red-700 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome do Item */}
          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
              Nome do Item *
            </label>
            <input
              type="text"
              id="nome"
              name="nome"
              value={formData.nome}
              onChange={handleInputChange}
              placeholder="Ex: Arroz integral"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Quantidade */}
          <div>
            <label htmlFor="quantidade" className="block text-sm font-medium text-gray-700 mb-1">
              Quantidade *
            </label>
            <input
              type="number"
              id="quantidade"
              name="quantidade"
              value={formData.quantidade}
              onChange={handleInputChange}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Categoria */}
          <div>
            <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 mb-1">
              Categoria *
            </label>
            <select
              id="categoria"
              name="categoria"
              value={formData.categoria}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Selecione uma categoria</option>
              {categorias.map((categoria) => (
                <option key={categoria} value={categoria}>
                  {categoria}
                </option>
              ))}
            </select>
          </div>

          {/* Preço */}
          <div>
            <label htmlFor="preco" className="block text-sm font-medium text-gray-700 mb-1">
              Preço Estimado (R$)
            </label>
            <PriceInput
              value={formData.preco}
              onChange={handlePriceChange}
              placeholder="0,00"
            />
          </div>

          {/* Total Estimado */}
          {formData.preco && formData.quantidade && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-sm text-blue-700">
                Total estimado: <strong>R$ {calculateTotal().toFixed(2).replace('.', ',')}</strong>
              </div>
            </div>
          )}

          {/* Botão Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
              isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500'
            } text-white`}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Adicionando...
              </div>
            ) : (
              'Adicionar Item'
            )}
          </button>
        </form>

        {/* Dicas */}
        <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
          <h3 className="text-sm font-medium text-yellow-800 mb-2">💡 Dicas:</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Use nomes específicos para facilitar a identificação</li>
            <li>• Defina a quantidade correta para evitar desperdício</li>
            <li>• O preço estimado ajuda no controle do orçamento</li>
            <li>• Use vírgula para separar os centavos (ex: 1,50)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdicionarItem;

