import React, { useState } from 'react';
import { useUserData } from '../contexts/UserDataContext';
import { formatCurrency } from '../utils/formatCurrency';
import { ShoppingCart, Check, X, Info, Loader2 } from 'lucide-react';

const Carrinho = () => {
  const { userData, finalizePurchase, getStatistics } = useUserData();
  const [isFinalizingPurchase, setIsFinalizingPurchase] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const stats = getStatistics();
  const itensComprados = userData.items.filter(item => item.status === 'comprado');

  const handleFinalizePurchase = async () => {
    if (itensComprados.length === 0) {
      setMessage({ type: 'warning', text: 'Não há itens comprados para finalizar.' });
      return;
    }

    setIsFinalizingPurchase(true);
    setMessage({ type: '', text: '' });

    try {
      const success = await finalizePurchase();
      
      if (success) {
        setMessage({ 
          type: 'success', 
          text: `Compra finalizada! ${itensComprados.length} item(ns) movido(s) para o histórico.` 
        });
      } else {
        setMessage({ type: 'error', text: 'Erro ao finalizar compra. Tente novamente.' });
      }
    } catch (error) {
      console.error('Erro ao finalizar compra:', error);
      setMessage({ type: 'error', text: 'Erro inesperado. Tente novamente.' });
    } finally {
      setIsFinalizingPurchase(false);
    }
  };

  const clearMessage = () => {
    setMessage({ type: '', text: '' });
  };

  return (
    <div className="p-4 max-w-4xl mx-auto pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">Carrinho de Compras</h2>
        
        {/* Resumo do Carrinho */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/50 rounded-xl">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{itensComprados.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Itens no Carrinho</div>
          </div>
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/50 rounded-xl">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">{formatCurrency(stats.valorComprado)}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Valor Total</div>
          </div>
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/50 rounded-xl">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{stats.itensPendentes}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Itens Restantes</div>
          </div>
        </div>
      </div>

      {/* Mensagens */}
      {message.text && (
        <div className={`mb-4 p-4 rounded-lg flex items-center justify-between ${
          message.type === 'success' 
            ? 'bg-green-100 text-green-700 border border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700'
            : message.type === 'warning'
            ? 'bg-yellow-100 text-yellow-700 border border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700'
            : 'bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700'
        }`}>
          <span>{message.text}</span>
          <button 
            onClick={clearMessage}
            className="ml-2 text-lg font-bold hover:opacity-70"
          >
            <X size={20} />
          </button>
        </div>
      )}

      {/* Lista de Itens Comprados */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Itens Comprados</h3>
        
        {itensComprados.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingCart className="mx-auto text-gray-400 dark:text-gray-500 w-16 h-16 mb-4" />
            <h4 className="text-xl font-medium text-gray-800 dark:text-white mb-2">Carrinho vazio</h4>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Marque os itens como comprados na sua lista para vê-los aqui
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {itensComprados.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">
                    <Check size={16} />
                  </div>
                  <div>
                    <div className="font-medium text-gray-800 dark:text-gray-200">{item.nome}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center space-x-3">
                      <span className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs">
                        {item.quantidade}x
                      </span>
                      <span className="bg-blue-100 dark:bg-blue-900/50 px-2 py-1 rounded text-xs">
                        {item.categoria}
                      </span>
                      <span>{formatCurrency(item.preco)} cada</span>
                    </div>
                    {item.dataCompra && (
                      <div className="text-xs text-gray-500 mt-1">
                        Comprado em {item.dataCompra}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(item.preco * item.quantidade)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ações */}
      {itensComprados.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Finalizar Compra</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Os itens serão movidos para o seu histórico.
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600 dark:text-gray-300">Total da compra</div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(stats.valorComprado)}
              </div>
            </div>
          </div>
          
          <button
            onClick={handleFinalizePurchase}
            disabled={isFinalizingPurchase}
            className={`w-full py-3 px-4 rounded-lg font-semibold text-lg transition-colors flex items-center justify-center ${
              isFinalizingPurchase
                ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-green-500'
            } text-white`}
          >
            {isFinalizingPurchase ? (
              <>
                <Loader2 className="animate-spin mr-2" />
                Finalizando...
              </>
            ) : (
              `Finalizar Compra (${itensComprados.length} item${itensComprados.length !== 1 ? 'ns' : ''})`
            )}
          </button>
        </div>
      )}

      {/* Instruções */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
        <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2 flex items-center"><Info size={16} className="mr-2"/>Como usar o carrinho:</h4>
        <ul className="text-sm text-blue-700 dark:text-blue-200 space-y-1 list-disc list-inside">
          <li>Marque os itens como comprados na aba "Lista"</li>
          <li>Os itens marcados aparecerão automaticamente aqui</li>
          <li>Clique em "Finalizar Compra" para mover os itens para o histórico</li>
          <li>Após finalizar, os itens serão removidos da lista atual</li>
        </ul>
      </div>
    </div>
  );
};

export default Carrinho;

