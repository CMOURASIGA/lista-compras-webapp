import React, { useState } from 'react';
import { useUserData } from '../contexts/UserDataContext';
import { formatCurrency } from '../utils/formatters';
import { ShoppingCart, Check, Package, CreditCard, Info, X, CheckCircle, AlertCircle } from 'lucide-react';

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

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-b-3xl shadow-lg mb-6">
        <div className="flex items-center space-x-3 mb-4">
          <ShoppingCart className="w-8 h-8" />
          <h1 className="text-2xl font-bold">Carrinho</h1>
        </div>
        
        {/* Status da Sincronização */}
        <div className="flex items-center space-x-2 mb-4">
          <div className={`w-3 h-3 rounded-full animate-pulse ${
            userData.hasGoogleSheets ? 'bg-green-400' : 'bg-yellow-400'
          }`}></div>
          <span className="text-sm opacity-90">
            {userData.hasGoogleSheets ? 'Sincronizado com Google Sheets' : 'Dados salvos localmente'}
          </span>
        </div>

        {/* Resumo do Carrinho */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/20 rounded-2xl p-4 backdrop-blur-sm text-center">
            <Package className="w-6 h-6 mx-auto mb-2 text-white/80" />
            <div className="text-2xl font-bold">{itensComprados.length}</div>
            <div className="text-sm opacity-90">Itens</div>
          </div>
          <div className="bg-white/20 rounded-2xl p-4 backdrop-blur-sm text-center">
            <CreditCard className="w-6 h-6 mx-auto mb-2 text-white/80" />
            <div className="text-xl font-bold">{formatCurrency(stats.valorComprado)}</div>
            <div className="text-sm opacity-90">Total</div>
          </div>
          <div className="bg-white/20 rounded-2xl p-4 backdrop-blur-sm text-center">
            <Check className="w-6 h-6 mx-auto mb-2 text-white/80" />
            <div className="text-2xl font-bold">{stats.itensPendentes}</div>
            <div className="text-sm opacity-90">Restantes</div>
          </div>
        </div>
      </div>

      <div className="px-4">
        {/* Mensagens */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-2xl flex items-start space-x-3 ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200'
              : message.type === 'warning'
              ? 'bg-yellow-50 border border-yellow-200'
              : 'bg-red-50 border border-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            ) : message.type === 'warning' ? (
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            )}
            <div className="flex-1">
              <div className={`font-medium ${
                message.type === 'success' ? 'text-green-800' 
                : message.type === 'warning' ? 'text-yellow-800'
                : 'text-red-800'
              }`}>
                {message.text}
              </div>
            </div>
            <button 
              onClick={clearMessage}
              className={`text-lg font-bold hover:opacity-70 ${
                message.type === 'success' ? 'text-green-600' 
                : message.type === 'warning' ? 'text-yellow-600'
                : 'text-red-600'
              }`}
            >
              ×
            </button>
          </div>
        )}

        {/* Lista de Itens Comprados */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center space-x-2">
            <Check className="w-5 h-5 text-green-600" />
            <span>Itens Comprados</span>
          </h3>
          
          {itensComprados.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🛒</div>
              <h4 className="text-xl font-semibold text-gray-800 mb-2">Carrinho vazio</h4>
              <p className="text-gray-600 mb-6">
                Marque os itens como comprados na sua lista para vê-los aqui
              </p>
              <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
                <div className="flex items-start space-x-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">💡 Como usar:</p>
                    <p>Vá para a aba "Lista" e clique no círculo ao lado dos itens para marcá-los como comprados.</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {itensComprados.map((item) => (
                <div
                  key={item.id}
                  className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-4"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white">
                      <Check className="w-5 h-5" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-2xl">{getEmojiForCategory(item.categoria)}</span>
                        <span className="font-semibold text-lg text-gray-800">{item.nome}</span>
                      </div>
                      
                      <div className="flex items-center space-x-3 text-sm">
                        <span className="bg-white px-3 py-1 rounded-full font-medium text-gray-700">
                          {item.quantidade}x
                        </span>
                        <span className={`px-3 py-1 rounded-full text-white text-xs font-medium ${
                          getColorForCategory(item.categoria)
                        }`}>
                          {item.categoria}
                        </span>
                        <span className="text-gray-600">{formatCurrency(item.preco)} cada</span>
                      </div>
                      
                      {item.dataCompra && (
                        <div className="text-xs text-gray-500 mt-2">
                          Comprado em {item.dataCompra}
                        </div>
                      )}
                    </div>
                    
                    <div className="text-right">
                      <div className="font-bold text-green-600 text-lg">
                        {formatCurrency(item.preco * item.quantidade)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Finalizar Compra */}
        {itensComprados.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
                  <CreditCard className="w-5 h-5 text-green-600" />
                  <span>Finalizar Compra</span>
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Os itens serão adicionados ao seu histórico e a lista será reiniciada.
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">Total da compra</div>
                <div className="text-3xl font-bold text-green-600">
                  {formatCurrency(stats.valorComprado)}
                </div>
              </div>
            </div>
            
            <button
              onClick={handleFinalizePurchase}
              disabled={isFinalizingPurchase}
              className={`w-full py-4 px-6 rounded-2xl font-semibold text-white transition-all duration-200 ${
                isFinalizingPurchase
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 transform hover:scale-[1.02] shadow-lg hover:shadow-xl'
              }`}
            >
              {isFinalizingPurchase ? (
                <div className="flex items-center justify-center space-x-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Finalizando...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <Check className="w-5 h-5" />
                  <span>Finalizar Compra ({itensComprados.length} item{itensComprados.length !== 1 ? 'ns' : ''})</span>
                </div>
              )}
            </button>
          </div>
        )}

        {/* Instruções */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
          <div className="flex items-start space-x-3">
            <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h4 className="text-sm font-semibold text-blue-800 mb-3">ℹ️ Como usar o carrinho:</h4>
              <ul className="text-sm text-blue-700 space-y-2">
                <li className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Marque os itens como comprados na aba "Lista"</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Os itens marcados aparecerão automaticamente aqui</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Clique em "Finalizar Compra" para mover os itens para o histórico</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Após finalizar, os itens serão removidos da lista atual</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Carrinho;