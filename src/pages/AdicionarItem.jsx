import React, { useState } from 'react';

const AdicionarItem = () => {
  const [formData, setFormData] = useState({
    nome: '',
    quantidade: 1,
    categoria: '',
    preco: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Simular salvamento
    // Futuramente será integrado com Google Sheets
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setFormData({
        nome: '',
        quantidade: 1,
        categoria: '',
        preco: ''
      });

      setTimeout(() => setSuccess(false), 3000);
    }, 1000);
  };

  return (
    <div className="p-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-6 text-gray-800">Adicionar Novo Item</h2>

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            ✅ Item adicionado com sucesso!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome do Item */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome do Item *
            </label>
            <input
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: Arroz integral"
            />
          </div>

          {/* Quantidade */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantidade *
            </label>
            <input
              type="number"
              name="quantidade"
              value={formData.quantidade}
              onChange={handleChange}
              min="1"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Categoria */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoria *
            </label>
            <select
              name="categoria"
              value={formData.categoria}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preço Estimado (R$)
            </label>
            <input
              type="number"
              name="preco"
              value={formData.preco}
              onChange={handleChange}
              step="0.01"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>

          {/* Botão de Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Adicionando...
              </div>
            ) : (
              'Adicionar Item'
            )}
          </button>
        </form>

        {/* Dicas */}
        <div className="mt-6 p-4 bg-blue-50 rounded-md">
          <h3 className="text-sm font-medium text-blue-800 mb-2">💡 Dicas:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Use nomes específicos para facilitar a identificação</li>
            <li>• Defina a quantidade correta para evitar desperdício</li>
            <li>• O preço estimado ajuda no controle do orçamento</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdicionarItem;

