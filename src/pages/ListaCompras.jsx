import React, { useState } from 'react';
import { useUserData } from '../contexts/UserDataContext';
import { formatCurrency } from '../utils/formatters';

const ListaCompras = () => {
  const { userData, toggleItemStatus, removeItem, editItem, getStatistics } = useUserData();
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({});
  const stats = getStatistics();

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

  if (userData.isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando sua lista...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      {/* Status da Sincronização */}
      <div className="mb-4">
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
          userData.hasGoogleSheets 
            ? 'bg-green-100 text-green-800' 
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {userData.hasGoogleSheets ? (
            <>
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Sincronizado com Google Sheets
            </>
          ) : (
            <>
              <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
              Dados salvos localmente
            </>
          )}
        </div>
      </div>

      {/* Resumo */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Resumo da Lista</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-3xl font-bold text-blue-600">{stats.totalItens}</div>
            <div className="text-sm text-gray-600">Total de Itens</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-3xl font-bold text-green-600">{stats.itensComprados}</div>
            <div className="text-sm text-gray-600">Comprados</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-3xl font-bold text-purple-600">{formatCurrency(stats.valorTotal)}</div>
            <div className="text-sm text-gray-600">Valor Total</div>
          </div>
        </div>
        
        {stats.itensComprados > 0 && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex justify-between text-sm">
              <span>Valor comprado: <strong>{formatCurrency(stats.valorComprado)}</strong></span>
              <span>Restante: <strong>{formatCurrency(stats.valorPendente)}</strong></span>
            </div>
          </div>
        )}
      </div>

      {/* Lista de Itens */}
      <div className="space-y-3">
        {userData.items.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-medium text-gray-800 mb-2">Sua lista está vazia</h3>
            <p className="text-gray-600 mb-4">Adicione alguns itens para começar suas compras</p>
            <div className="text-sm text-gray-500">
              <p>💡 Dica: Use a aba "Adicionar" para incluir produtos</p>
            </div>
          </div>
        ) : (
          userData.items.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-lg shadow-md p-4 border-l-4 transition-all duration-200 ${
                item.status === 'comprado' 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-blue-500 hover:shadow-lg'
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade</label>
                      <input
                        type="number"
                        value={editForm.quantidade}
                        onChange={(e) => setEditForm({...editForm, quantidade: parseInt(e.target.value) || 1})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                      <select
                        value={editForm.categoria}
                        onChange={(e) => setEditForm({...editForm, categoria: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Grãos">Grãos</option>
                        <option value="Laticínios">Laticínios</option>
                        <option value="Frutas">Frutas</option>
                        <option value="Carnes">Carnes</option>
                        <option value="Padaria">Padaria</option>
                        <option value="Limpeza">Limpeza</option>
                        <option value="Outros">Outros</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Preço (R$)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={editForm.preco}
                        onChange={(e) => setEditForm({...editForm, preco: parseFloat(e.target.value) || 0})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSaveEdit}
                      className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                    >
                      Salvar
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                // Modo de visualização
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleToggleComprado(item.id)}
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${
                        item.status === 'comprado'
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-gray-300 hover:border-green-500 hover:bg-green-50'
                      }`}
                    >
                      {item.status === 'comprado' && '✓'}
                    </button>
                    
                    <div className={item.status === 'comprado' ? 'line-through text-gray-500' : ''}>
                      <div className="font-medium text-lg">{item.nome}</div>
                      <div className="text-sm text-gray-600 flex items-center space-x-3">
                        <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                          {item.quantidade}x
                        </span>
                        <span className="bg-blue-100 px-2 py-1 rounded text-xs">
                          {item.categoria}
                        </span>
                        <span className="font-medium">
                          {formatCurrency(item.preco)} cada
                        </span>
                        <span className="font-bold text-purple-600">
                          Total: {formatCurrency(item.preco * item.quantidade)}
                        </span>
                      </div>
                      {item.dataCriacao && (
                        <div className="text-xs text-gray-400 mt-1">
                          Adicionado em {item.dataCriacao}
                          {item.dataCompra && ` • Comprado em ${item.dataCompra}`}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditItem(item)}
                      className="text-blue-500 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                      title="Editar item"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                      title="Remover item"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Ações */}
      {userData.items.length > 0 && (
        <div className="mt-6 text-center">
          <div className="text-sm text-gray-600 mb-2">
            {stats.itensPendentes > 0 
              ? `${stats.itensPendentes} item(ns) pendente(s)`
              : 'Todos os itens foram marcados como comprados!'
            }
          </div>
          {stats.itensComprados > 0 && (
            <p className="text-xs text-gray-500">
              💡 Vá para o "Carrinho" para finalizar a compra
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ListaCompras;

