import React, { useState } from 'react';
import { useUserData } from '../contexts/UserDataContext';
import { formatCurrency } from '../utils/formatters';
import { Search, Edit2, Trash2, Check, Filter } from 'lucide-react';

const ListaCompras = () => {
  const { userData, toggleItemStatus, removeItem, editItem, getStatistics } = useUserData();
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const stats = getStatistics();

  const categorias = [
    { nome: 'Grãos e Cereais', cor: 'bg-yellow-500', emoji: '🌾' },
    { nome: 'Carnes e Peixes', cor: 'bg-red-500', emoji: '🥩' },
    { nome: 'Laticínios', cor: 'bg-blue-500', emoji: '🥛' },
    { nome: 'Frutas', cor: 'bg-green-500', emoji: '🍎' },
    { nome: 'Verduras e Legumes', cor: 'bg-emerald-500', emoji: '🥬' },
    { nome: 'Bebidas', cor: 'bg-purple-500', emoji: '🥤' },
    { nome: 'Limpeza', cor: 'bg-cyan-500', emoji: '🧽' },
    { nome: 'Higiene', cor: 'bg-pink-500', emoji: '🧴' },
    { nome: 'Padaria', cor: 'bg-orange-500', emoji: '🍞' },
    { nome: 'Congelados', cor: 'bg-indigo-500', emoji: '🧊' },
    { nome: 'Outros', cor: 'bg-gray-500', emoji: '📦' }
  ];

  const getEmojiForCategory = (categoria) => {
    return categorias.find(c => c.nome === categoria)?.emoji || '📦';
  };

  const getColorForCategory = (categoria) => {
    return categorias.find(c => c.nome === categoria)?.cor || 'bg-gray-500';
  };

  const handleToggleComprado = async (itemId) => {
    await toggleItemStatus(itemId);
  };

  const handleRemoveItem = async (itemId) => {
    if (window.confirm('Tem certeza que deseja remover este item?')) {
      await removeItem(itemId);
    }
  };

  const handleEditItem = (item) => {
    setEditingItem(item.id);
    setEditForm({
      nome: item.nome,
      quantidade: item.quantidade,
      categoria: item.categoria,
      preco: item.preco
    });
  };

  const handleSaveEdit = async () => {
    const success = await editItem(editingItem, editForm);
    if (success) {
      setEditingItem(null);
      setEditForm({});
    } else {
      alert('Erro ao editar item. Tente novamente.');
    }
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setEditForm({});
  };

  const filteredItems = userData.items.filter(item => {
    const matchesSearch = item.nome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'todos' || item.categoria === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (userData.isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando sua lista...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      {/* Header com Gradiente */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-b-3xl shadow-lg mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Minha Lista</h1>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full animate-pulse ${
              userData.hasGoogleSheets ? 'bg-green-400' : 'bg-yellow-400'
            }`}></div>
            <span className="text-sm opacity-90">
              {userData.hasGoogleSheets ? 'Sincronizado' : 'Local'}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-white/20 rounded-2xl p-4 backdrop-blur-sm text-center">
            <div className="text-2xl font-bold">{stats.totalItens}</div>
            <div className="text-sm opacity-90">Total</div>
          </div>
          <div className="bg-white/20 rounded-2xl p-4 backdrop-blur-sm text-center">
            <div className="text-2xl font-bold">{stats.itensComprados}</div>
            <div className="text-sm opacity-90">Comprados</div>
          </div>
          <div className="bg-white/20 rounded-2xl p-4 backdrop-blur-sm text-center">
            <div className="text-xl font-bold">{formatCurrency(stats.valorTotal)}</div>
            <div className="text-sm opacity-90">Valor Total</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white/20 rounded-full h-3 mb-2">
          <div 
            className="bg-yellow-400 h-3 rounded-full transition-all duration-500"
            style={{ width: `${stats.totalItens > 0 ? (stats.itensComprados / stats.totalItens) * 100 : 0}%` }}
          ></div>
        </div>
        <div className="text-sm opacity-90">
          {stats.itensComprados} de {stats.totalItens} itens comprados
        </div>
      </div>

      {/* Search and Filter */}
      <div className="px-4 mb-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar itens..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white rounded-2xl border-0 shadow-sm focus:ring-2 focus:ring-green-500 transition-all"
          />
        </div>

        {/* Category Filter */}
        <div className="flex overflow-x-auto space-x-2 pb-2">
          <button
            onClick={() => setSelectedCategory('todos')}
            className={`px-4 py-2 rounded-full whitespace-nowrap transition-all flex items-center space-x-2 ${
              selectedCategory === 'todos' 
                ? 'bg-green-500 text-white shadow-lg' 
                : 'bg-white text-gray-600 hover:bg-gray-50 shadow-sm'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>Todos</span>
          </button>
          {categorias.map(categoria => (
            <button
              key={categoria.nome}
              onClick={() => setSelectedCategory(categoria.nome)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-all flex items-center space-x-2 ${
                selectedCategory === categoria.nome
                  ? `${categoria.cor} text-white shadow-lg`
                  : 'bg-white text-gray-600 hover:bg-gray-50 shadow-sm'
              }`}
            >
              <span>{categoria.emoji}</span>
              <span className="text-sm">{categoria.nome}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Itens */}
      <div className="px-4 space-y-3">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
            <div className="text-6xl mb-4">🛒</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {searchTerm || selectedCategory !== 'todos' ? 'Nenhum item encontrado' : 'Sua lista está vazia'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedCategory !== 'todos' 
                ? 'Tente ajustar os filtros de busca' 
                : 'Adicione alguns itens para começar suas compras'
              }
            </p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-2xl p-4 shadow-sm border-l-4 transition-all duration-200 ${
                item.status === 'comprado' 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-blue-500 hover:shadow-md'
              }`}
            >
              {editingItem === item.id ? (
                // Modo de edição
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                      <input
                        type="text"
                        value={editForm.nome}
                        onChange={(e) => setEditForm({...editForm, nome: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade</label>
                      <input
                        type="number"
                        value={editForm.quantidade}
                        onChange={(e) => setEditForm({...editForm, quantidade: parseInt(e.target.value) || 1})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                      <select
                        value={editForm.categoria}
                        onChange={(e) => setEditForm({...editForm, categoria: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        {categorias.map(cat => (
                          <option key={cat.nome} value={cat.nome}>
                            {cat.emoji} {cat.nome}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Preço (R$)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={editForm.preco}
                        onChange={(e) => setEditForm({...editForm, preco: parseFloat(e.target.value) || 0})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSaveEdit}
                      className="px-6 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors font-medium"
                    >
                      Salvar
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="px-6 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors font-medium"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                // Modo de visualização
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleToggleComprado(item.id)}
                    className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${
                      item.status === 'comprado'
                        ? 'bg-green-500 border-green-500 text-white scale-110'
                        : 'border-gray-300 hover:border-green-500 hover:bg-green-50'
                    }`}
                  >
                    {item.status === 'comprado' && <Check className="w-5 h-5" />}
                  </button>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-2xl">{getEmojiForCategory(item.categoria)}</span>
                      <span className={`font-semibold text-lg ${
                        item.status === 'comprado' ? 'line-through text-gray-500' : 'text-gray-800'
                      }`}>
                        {item.nome}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-3 text-sm">
                      <span className="bg-gray-100 px-3 py-1 rounded-full font-medium">
                        {item.quantidade}x
                      </span>
                      <span className={`px-3 py-1 rounded-full text-white text-xs font-medium ${
                        getColorForCategory(item.categoria)
                      }`}>
                        {item.categoria}
                      </span>
                      <span className="font-medium text-gray-700">
                        {formatCurrency(item.preco)} cada
                      </span>
                      <span className="font-bold text-green-600">
                        Total: {formatCurrency(item.preco * item.quantidade)}
                      </span>
                    </div>
                    
                    {item.dataCriacao && (
                      <div className="text-xs text-gray-400 mt-2">
                        Adicionado em {item.dataCriacao}
                        {item.dataCompra && ` • Comprado em ${item.dataCompra}`}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleEditItem(item)}
                      className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                      title="Editar item"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                      title="Remover item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Resumo no final */}
      {userData.items.length > 0 && (
        <div className="px-4 mt-8 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="text-center text-sm text-gray-600 mb-2">
              {stats.itensPendentes > 0 
                ? `${stats.itensPendentes} item(ns) pendente(s)`
                : 'Todos os itens foram marcados como comprados!'
              }
            </div>
            {stats.itensComprados > 0 && (
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-2">
                  💡 Vá para o "Carrinho" para finalizar a compra
                </div>
                <div className="text-sm">
                  <span className="text-gray-600">Valor comprado: </span>
                  <strong className="text-green-600">{formatCurrency(stats.valorComprado)}</strong>
                  <span className="text-gray-600"> • Restante: </span>
                  <strong className="text-purple-600">{formatCurrency(stats.valorPendente)}</strong>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ListaCompras;