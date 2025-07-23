import React, { useState } from 'react';
import { useUserData } from '../contexts/UserDataContext';
import { formatCurrency } from '../utils/formatCurrency';
import { Check, Edit, Trash2, History, FileText, AlertTriangle, RefreshCw } from 'lucide-react';

const ListaCompras = () => {
  const { userData, toggleItemStatus, removeItem, editItem, getStatistics, offerToLoadPreviousItems, forceReload } = useUserData();
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-main dark:text-text-muted">Carregando sua lista...</p>
        </div>
      </div>
    );
  }

  if (userData.error) {
    return (
      <div className="flex flex-col justify-center items-center h-64 text-center p-4">
        <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
        <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">Ocorreu um Erro</h3>
        <p className="text-text-main dark:text-text-muted mb-6">{userData.error}</p>
        <button
          onClick={() => forceReload()}
          className="flex items-center px-4 py-2 bg-primary text-white rounded-full font-semibold hover:bg-primary-dark transition-colors"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Forçar Carregamento de Produtos
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      {/* Status da Sincronização e Ações */}
      <div className="mb-4 flex justify-between items-center">
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
          userData.hasGoogleSheets 
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
        }`}>
          {userData.hasGoogleSheets ? (
            <>
              <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
              Sincronizado com Google Sheets
            </>
          ) : (
            <>
              <span className="w-2 h-2 bg-accent rounded-full mr-2"></span>
              Dados salvos localmente
            </>
          )}
        </div>
        <button
          onClick={offerToLoadPreviousItems}
          className="flex items-center px-3 py-1 bg-primary text-white rounded-full text-xs font-medium hover:bg-primary-dark"
        >
          <History className="w-4 h-4 mr-1" />
          Carregar Itens
        </button>
      </div>

      {/* Resumo */}
      <div className="bg-white dark:bg-bg-dark rounded-2xl shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-text-main dark:text-white">Resumo da Lista</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/50 rounded-xl">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.totalItens}</div>
            <div className="text-sm text-text-muted dark:text-text-muted-dark">Total de Itens</div>
          </div>
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/50 rounded-xl">
            <div className="text-3xl font-bold text-primary dark:text-primary-dark">{stats.itensComprados}</div>
            <div className="text-sm text-text-muted dark:text-text-muted-dark">Comprados</div>
          </div>
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/50 rounded-xl">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{formatCurrency(stats.valorTotal)}</div>
            <div className="text-sm text-text-muted dark:text-text-muted-dark">Valor Total</div>
          </div>
        </div>
        
        {stats.itensComprados > 0 && (
          <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <div className="flex justify-between text-sm text-text-main dark:text-gray-200">
              <span>Valor comprado: <strong className="font-semibold">{formatCurrency(stats.valorComprado)}</strong></span>
              <span>Restante: <strong className="font-semibold">{formatCurrency(stats.valorPendente)}</strong></span>
            </div>
          </div>
        )}
      </div>

      {/* Lista de Itens */}
      <div className="space-y-3">
        {userData.items.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-bg-dark rounded-2xl shadow-md">
            <FileText className="mx-auto text-text-muted dark:text-text-muted-dark w-16 h-16 mb-4" />
            <h3 className="text-xl font-medium text-text-main dark:text-white mb-2">Sua lista está vazia</h3>
            <p className="text-text-muted dark:text-text-muted-dark mb-4">Adicione alguns itens para começar suas compras</p>
            <div className="text-sm text-text-muted dark:text-text-muted-dark">
              <p>💡 Dica: Use a navegação abaixo para adicionar itens.</p>
            </div>
          </div>
        ) : (
          userData.items.map((item) => (
            <div
              key={item.id}
              className={`bg-white dark:bg-bg-dark rounded-2xl shadow-md p-4 border-l-4 transition-all duration-200 ${
                item.status === 'comprado' 
                  ? 'border-primary bg-green-50 dark:bg-green-900/20' 
                  : 'border-accent hover:shadow-lg'
              }`}
            >
              {editingItem === item.id ? (
                // Modo de edição
                <div className="space-y-4">
                  {/* ... formulário de edição ... */}
                </div>
              ) : (
                // Modo de visualização
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleToggleComprado(item.id)}
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${
                        item.status === 'comprado'
                          ? 'bg-primary border-primary text-white'
                          : 'border-gray-300 dark:border-gray-600 hover:border-primary hover:bg-green-50 dark:hover:bg-green-900/50'
                      }`}
                    >
                      {item.status === 'comprado' && <Check size={20} />}
                    </button>
                    
                    <div className={item.status === 'comprado' ? 'line-through text-text-muted dark:text-text-muted-dark' : 'text-text-main dark:text-gray-200'}>
                      <div className="font-medium text-lg">{item.nome}</div>
                      <div className="text-sm text-text-muted dark:text-text-muted-dark flex items-center space-x-3 flex-wrap">
                        <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">
                          {item.quantidade}x
                        </span>
                        <span className="bg-blue-100 dark:bg-blue-900/50 px-2 py-1 rounded text-xs">
                          {item.categoria}
                        </span>
                        <span className="font-medium">
                          {formatCurrency(item.preco)} cada
                        </span>
                        <span className="font-bold text-purple-600 dark:text-purple-400">
                          Total: {formatCurrency(item.preco * item.quantidade)}
                        </span>
                      </div>
                      {item.dataCriacao && (
                        <div className="text-xs text-text-muted-dark mt-1">
                          Adicionado em {item.dataCriacao}
                          {item.dataCompra && ` • Comprado em ${item.dataCompra}`}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditItem(item)}
                      className="text-blue-500 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/50 transition-colors"
                      title="Editar item"
                    >
                      <Edit size={20} />
                    </button>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/50 transition-colors"
                      title="Remover item"
                    >
                      <Trash2 size={20} />
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
          <div className="text-sm text-text-main dark:text-gray-300 mb-2">
            {stats.itensPendentes > 0 
              ? `${stats.itensPendentes} item(ns) pendente(s)`
              : 'Todos os itens foram marcados como comprados!'
            }
          </div>
          {stats.itensComprados > 0 && (
            <p className="text-xs text-text-muted dark:text-text-muted-dark">
              💡 Vá para o "Carrinho" para finalizar a compra
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ListaCompras;

