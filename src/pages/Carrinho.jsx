import React, { useState, useEffect } from 'react';

const Carrinho = () => {
  const [itensCarrinho, setItensCarrinho] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carregamento de itens comprados
    // Futuramente será integrado com Google Sheets
    const mockItensCarrinho = [
      { id: 3, nome: 'Leite', quantidade: 3, categoria: 'Laticínios', preco: 4.50, dataCompra: '2025-01-15' },
      { id: 4, nome: 'Pão', quantidade: 2, categoria: 'Padaria', preco: 3.00, dataCompra: '2025-01-15' },
    ];
    
    setTimeout(() => {
      setItensCarrinho(mockItensCarrinho);
      setLoading(false);
    }, 1000);
  }, []);

  const finalizarCompra = () => {
    // Simular finalização da compra
    // Futuramente será integrado com Google Sheets para salvar no histórico
    alert('Compra finalizada! Os itens foram movidos para o histórico.');
    setItensCarrinho([]);
  };

  const removerDoCarrinho = (id) => {
    setItensCarrinho(itensCarrinho.filter(item => item.id !== id));
  };

  const valorTotal = itensCarrinho.reduce((total, item) => total + (item.preco * item.quantidade), 0);
  const quantidadeTotal = itensCarrinho.reduce((total, item) => total + item.quantidade, 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Header do Carrinho */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <h2 className="text-lg font-semibold mb-3 text-gray-800">Carrinho de Compras</h2>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">{quantidadeTotal}</div>
            <div className="text-sm text-gray-600">Itens no Carrinho</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">R$ {valorTotal.toFixed(2)}</div>
            <div className="text-sm text-gray-600">Valor Total</div>
          </div>
        </div>
      </div>

      {/* Lista de Itens no Carrinho */}
      <div className="space-y-3 mb-6">
        {itensCarrinho.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">🛒</div>
            <p>Seu carrinho está vazio</p>
            <p className="text-sm">Marque alguns itens como comprados na lista</p>
          </div>
        ) : (
          itensCarrinho.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium text-gray-800">{item.nome}</div>
                  <div className="text-sm text-gray-600">
                    {item.quantidade}x • {item.categoria} • R$ {item.preco.toFixed(2)} cada
                  </div>
                  <div className="text-sm text-green-600 font-medium">
                    Subtotal: R$ {(item.preco * item.quantidade).toFixed(2)}
                  </div>
                </div>
                <button
                  onClick={() => removerDoCarrinho(item.id)}
                  className="text-red-500 hover:text-red-700 p-2"
                  title="Remover do carrinho"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Botão de Finalizar Compra */}
      {itensCarrinho.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-semibold text-gray-800">Total da Compra:</span>
            <span className="text-2xl font-bold text-green-600">R$ {valorTotal.toFixed(2)}</span>
          </div>
          <button
            onClick={finalizarCompra}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-md transition-colors"
          >
            Finalizar Compra
          </button>
          <p className="text-xs text-gray-500 text-center mt-2">
            Os itens serão movidos para o histórico de compras
          </p>
        </div>
      )}

      {/* Dicas */}
      <div className="mt-6 p-4 bg-blue-50 rounded-md">
        <h3 className="text-sm font-medium text-blue-800 mb-2">💡 Como usar o carrinho:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Itens marcados como comprados aparecem automaticamente aqui</li>
          <li>• Revise os preços antes de finalizar a compra</li>
          <li>• Ao finalizar, os itens vão para o histórico</li>
        </ul>
      </div>
    </div>
  );
};

export default Carrinho;

