import React from 'react';
import { useUserData } from '../contexts/UserDataContext';
import { formatCurrency } from '../utils/formatters';

const ListaCompras = () => {
  const { userData, markItemAsBought, removeItem, getStatistics } = useUserData();
  const stats = getStatistics();

  const handleToggleComprado = async (itemId) => {
    const item = userData.items.find(i => i.id === itemId);
    if (item && item.status === 'pendente') {
      await markItemAsBought(itemId);
    }
  };

  const handleRemoveItem = async (itemId) => {
    if (window.confirm('Tem certeza que deseja remover este item?')) {
      await removeItem(itemId);
    }
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
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleToggleComprado(item.id)}
                    disabled={item.status === 'comprado'}
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${
                      item.status === 'comprado'
                        ? 'bg-green-500 border-green-500 text-white cursor-default'
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
                
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                  title="Remover item"
                >
                  🗑️
                </button>
              </div>
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

