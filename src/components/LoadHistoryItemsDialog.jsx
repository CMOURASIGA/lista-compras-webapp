import React, { useState } from 'react';

const LoadHistoryItemsDialog = ({ isOpen, onConfirm, onCancel, historyItems }) => {
  const [selectedItems, setSelectedItems] = useState([]);

  if (!isOpen) return null;

  const handleItemToggle = (itemId) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === historyItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(historyItems.map(item => item.id));
    }
  };

  const handleConfirm = () => {
    const itemsToAdd = historyItems.filter(item => selectedItems.includes(item.id));
    onConfirm(itemsToAdd);
    setSelectedItems([]);
  };

  const handleCancel = () => {
    onCancel();
    setSelectedItems([]);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 shadow-xl max-h-[80vh] overflow-hidden flex flex-col">
        <div className="text-center mb-4">
          <div className="mb-4">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Produtos Comprados Anteriormente
          </h3>
          
          <p className="text-sm text-gray-500 mb-4">
            Encontramos {historyItems.length} {historyItems.length === 1 ? 'produto' : 'produtos'} únicos no seu histórico de compras. 
            Selecione quais deseja adicionar à sua lista atual.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto mb-4">
          <div className="mb-3">
            <button
              onClick={handleSelectAll}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              {selectedItems.length === historyItems.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
            </button>
          </div>

          <div className="space-y-2">
            {historyItems.map((item) => (
              <div
                key={item.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedItems.includes(item.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleItemToggle(item.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => handleItemToggle(item.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div>
                      <div className="font-medium text-gray-900">{item.nome}</div>
                      <div className="text-sm text-gray-500">
                        {item.categoria} • Qtd: {item.quantidade} • R$ {item.preco.toFixed(2)}
                      </div>
                      {item.lastPurchaseDate && (
                        <div className="text-xs text-gray-400">
                          Última compra: {item.lastPurchaseDate}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex space-x-3 pt-4 border-t">
          <button
            onClick={handleCancel}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Pular
          </button>
          <button
            onClick={handleConfirm}
            disabled={selectedItems.length === 0}
            className={`flex-1 font-medium py-2 px-4 rounded-lg transition-colors ${
              selectedItems.length === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            Adicionar {selectedItems.length > 0 ? `(${selectedItems.length})` : ''}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoadHistoryItemsDialog;

