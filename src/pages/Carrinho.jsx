import React, { useState } from 'react';
import { useUserData } from '../contexts/UserDataContext';
import { useTestUserData } from '../contexts/TestUserDataContext';

const Carrinho = () => {
  // Tentar usar contexto de teste primeiro, depois o normal
  let contextData;
  try {
    contextData = useTestUserData();
  } catch {
    contextData = useUserData();
  }

  const { userData, getStatistics, finalizePurchase } = contextData;
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
    <div className="p-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Carrinho de Compras</h2>
        
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

        {/* Resumo do Carrinho */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{itensComprados.length}</div>
            <div className="text-sm text-gray-600">Itens no Carrinho</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.valorComprado)}</div>
            <div className="text-sm text-gray-600">Valor Total</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{stats.itensPendentes}</div>
            <div className="text-sm text-gray-600">Itens Restantes</div>
          </div>
        </div>
      </div>

      {/* Mensagens */}
      {message.text && (
        <div className={`mb-4 p-4 rounded-lg flex items-center justify-between ${
          message.type === 'success' 
            ? 'bg-green-100 text-green-700 border border-green-200'
            : message.type === 'warning'
            ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
            : 'bg-red-100 text-red-700 border border-red-200'
        }`}>
          <span>{message.text}</span>
          <button 
            onClick={clearMessage}
            className="ml-2 text-lg font-bold hover:opacity-70"
          >
            ×
          </button>
        </div>
      )}

      {/* Lista de Itens Comprados */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Itens Comprados</h3>
        
        {itensComprados.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🛒</div>
            <h4 className="text-xl font-medium text-gray-800 mb-2">Carrinho vazio</h4>
            <p className="text-gray-600 mb-4">
              Marque os itens como comprados na sua lista para vê-los aqui
            </p>
            <div className="text-sm text-gray-500">
              <p>💡 Dica: Vá para a aba "Lista" e clique no círculo ao lado dos itens</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {itensComprados.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">
                    ✓
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">{item.nome}</div>
                    <div className="text-sm text-gray-600 flex items-center space-x-3">
                      <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                        {item.quantidade}x
                      </span>
                      <span className="bg-blue-100 px-2 py-1 rounded text-xs">
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
                  <div className="font-bold text-green-600">
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
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Finalizar Compra</h3>
              <p className="text-sm text-gray-600">
                Os itens serão adicionados ao seu histórico e a lista será reiniciada para a próxima compra.
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Total da compra</div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(stats.valorComprado)}
              </div>
            </div>
          </div>
          
          <button
            onClick={handleFinalizePurchase}
            disabled={isFinalizingPurchase}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
              isFinalizingPurchase
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-green-500'
            } text-white`}
          >
            {isFinalizingPurchase ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Finalizando...
              </div>
            ) : (
              `Finalizar Compra (${itensComprados.length} item${itensComprados.length !== 1 ? 'ns' : ''})`
            )}
          </button>
        </div>
      )}

      {/* Instruções */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-2">ℹ️ Como usar o carrinho:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Marque os itens como comprados na aba "Lista"</li>
          <li>• Os itens marcados aparecerão automaticamente aqui</li>
          <li>• Clique em "Finalizar Compra" para mover os itens para o histórico</li>
          <li>• Após finalizar, os itens serão removidos da lista atual</li>
        </ul>
      </div>
    </div>
  );
};

export default Carrinho;

