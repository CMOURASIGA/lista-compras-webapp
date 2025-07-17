import React, { useState, useEffect } from 'react';

const ListaCompras = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carregamento de dados
    // Futuramente será integrado com Google Sheets
    const mockItems = [
      { id: 1, nome: 'Arroz', quantidade: 2, categoria: 'Grãos', comprado: false, preco: 8.50 },
      { id: 2, nome: 'Feijão', quantidade: 1, categoria: 'Grãos', comprado: false, preco: 6.00 },
      { id: 3, nome: 'Leite', quantidade: 3, categoria: 'Laticínios', comprado: true, preco: 4.50 },
    ];
    
    setTimeout(() => {
      setItems(mockItems);
      setLoading(false);
    }, 1000);
  }, []);

  const toggleComprado = (id) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, comprado: !item.comprado } : item
    ));
  };

  const removeItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  const totalItens = items.length;
  const itensComprados = items.filter(item => item.comprado).length;
  const valorTotal = items.reduce((total, item) => total + (item.preco * item.quantidade), 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Resumo */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <h2 className="text-lg font-semibold mb-3 text-gray-800">Resumo da Lista</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">{totalItens}</div>
            <div className="text-sm text-gray-600">Total de Itens</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">{itensComprados}</div>
            <div className="text-sm text-gray-600">Comprados</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">R$ {valorTotal.toFixed(2)}</div>
            <div className="text-sm text-gray-600">Valor Total</div>
          </div>
        </div>
      </div>

      {/* Lista de Itens */}
      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📝</div>
            <p>Sua lista está vazia</p>
            <p className="text-sm">Adicione alguns itens para começar</p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-lg shadow-md p-4 border-l-4 ${
                item.comprado ? 'border-green-500 bg-green-50' : 'border-blue-500'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => toggleComprado(item.id)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      item.comprado
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-gray-300 hover:border-green-500'
                    }`}
                  >
                    {item.comprado && '✓'}
                  </button>
                  <div className={item.comprado ? 'line-through text-gray-500' : ''}>
                    <div className="font-medium">{item.nome}</div>
                    <div className="text-sm text-gray-600">
                      {item.quantidade}x • {item.categoria} • R$ {item.preco.toFixed(2)}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ListaCompras;

