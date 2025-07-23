import React, { useState } from 'react';
import { useUserData } from '../contexts/UserDataContext';
import PriceInput from '../components/PriceInput';
import { Plus, ShoppingBag, Lightbulb, CheckCircle, AlertCircle } from 'lucide-react';

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
    { nome: 'Grãos e Cereais', emoji: '🌾' },
    { nome: 'Carnes e Peixes', emoji: '🥩' },
    { nome: 'Laticínios', emoji: '🥛' },
    { nome: 'Frutas', emoji: '🍎' },
    { nome: 'Verduras e Legumes', emoji: '🥬' },
    { nome: 'Bebidas', emoji: '🥤' },
    { nome: 'Limpeza', emoji: '🧽' },
    { nome: 'Higiene', emoji: '🧴' },
    { nome: 'Padaria', emoji: '🍞' },
    { nome: 'Congelados', emoji: '🧊' },
    { nome: 'Outros', emoji: '📦' }
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
        
        // Auto-hide success message
        setTimeout(() => {
          setMessage({ type: '', text: '' });
        }, 3000);
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

  const clearMessage = () => {
    setMessage({ type: '', text: '' });
  };

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-b-3xl shadow-lg mb-6">
        <div className="flex items-center space-x-3 mb-2">
          <Plus className="w-8 h-8" />
          <h1 className="text-2xl font-bold">Adicionar Item</h1>
        </div>
        <p className="text-blue-100">Adicione novos produtos à sua lista de compras</p>
      </div>

      <div className="px-4">
        {/* Messages */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-2xl flex items-start space-x-3 ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            )}
            <div className="flex-1">
              <div className={`font-medium ${
                message.type === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {message.text}
              </div>
            </div>
            <button 
              onClick={clearMessage}
              className={`text-lg font-bold hover:opacity-70 ${
                message.type === 'success' ? 'text-green-600' : 'text-red-600'
              }`}
            >
              ×
            </button>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nome do Item */}
            <div>
              <label htmlFor="nome" className="block text-sm font-semibold text-gray-700 mb-2">
                Nome do Item *
              </label>
              <input
                type="text"
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleInputChange}
                placeholder="Ex: Arroz integral, Banana nanica..."
                className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-800 placeholder-gray-500"
                required
              />
            </div>

            {/* Quantidade e Categoria */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="quantidade" className="block text-sm font-semibold text-gray-700 mb-2">
                  Quantidade *
                </label>
                <input
                  type="number"
                  id="quantidade"
                  name="quantidade"
                  value={formData.quantidade}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-800"
                  required
                />
              </div>

              <div>
                <label htmlFor="categoria" className="block text-sm font-semibold text-gray-700 mb-2">
                  Categoria *
                </label>
                <select
                  id="categoria"
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-800"
                  required
                >
                  <option value="">Selecione...</option>
                  {categorias.map((categoria) => (
                    <option key={categoria.nome} value={categoria.nome}>
                      {categoria.emoji} {categoria.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Preço */}
            <div>
              <label htmlFor="preco" className="block text-sm font-semibold text-gray-700 mb-2">
                Preço Estimado (Opcional)
              </label>
              <PriceInput
                value={formData.preco}
                onChange={handlePriceChange}
                placeholder="0,00"
                className="bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all py-3"
              />
            </div>

            {/* Total Estimado */}
            {formData.preco && formData.quantidade && calculateTotal() > 0 && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-2xl border border-green-200">
                <div className="flex items-center space-x-2">
                  <ShoppingBag className="w-5 h-5 text-green-600" />
                  <div className="text-sm text-green-800">
                    <span className="font-medium">Total estimado: </span>
                    <span className="text-xl font-bold">R$ {calculateTotal().toFixed(2).replace('.', ',')}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Botão Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 px-6 rounded-2xl font-semibold text-white transition-all duration-200 ${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transform hover:scale-[1.02] shadow-lg hover:shadow-xl'
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center space-x-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Adicionando...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <Plus className="w-5 h-5" />
                  <span>Adicionar à Lista</span>
                </div>
              )}
            </button>
          </form>
        </div>

        {/* Dicas Card */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-200">
          <div className="flex items-start space-x-3">
            <Lightbulb className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-sm font-semibold text-yellow-800 mb-3">💡 Dicas para adicionar itens:</h3>
              <ul className="text-sm text-yellow-700 space-y-2">
                <li className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Use nomes específicos para facilitar a identificação</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Defina a quantidade correta para evitar desperdício</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>O preço estimado ajuda no controle do orçamento</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Use vírgula para separar os centavos (ex: 1,50)</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Quick Add Suggestions */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">⚡ Adicionar Rapidamente</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { nome: 'Arroz 5kg', categoria: 'Grãos e Cereais', emoji: '🌾' },
              { nome: 'Leite 1L', categoria: 'Laticínios', emoji: '🥛' },
              { nome: 'Banana 1kg', categoria: 'Frutas', emoji: '🍌' },
              { nome: 'Pão Frances', categoria: 'Padaria', emoji: '🍞' },
            ].map((item, index) => (
              <button
                key={index}
                onClick={() => setFormData({
                  nome: item.nome,
                  quantidade: '1',
                  categoria: item.categoria,
                  preco: ''
                })}
                className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 hover:border-blue-300 hover:shadow-md transition-all text-left"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-xl">{item.emoji}</span>
                  <div>
                    <div className="font-medium text-gray-800 text-sm">{item.nome}</div>
                    <div className="text-xs text-gray-500">{item.categoria}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdicionarItem;