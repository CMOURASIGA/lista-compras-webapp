import React from 'react';

const CreatePreListDialog = ({ isOpen, onConfirm, onCancel, suggestedItems }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 shadow-xl max-h-[80vh] overflow-y-auto">
        <div className="text-center">
          <div className="mb-4">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Criar Pré-Lista de Compras?
          </h3>
          
          <p className="text-sm text-gray-500 mb-4">
            Baseado no seu histórico de compras, encontramos {suggestedItems.length} itens que você compra com frequência. 
            Deseja criar uma pré-lista com estes produtos?
          </p>

          {/* Lista de itens sugeridos */}
          <div className="mb-6 max-h-48 overflow-y-auto">
            <div className="text-left bg-gray-50 rounded-lg p-3">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Itens sugeridos:</h4>
              <div className="space-y-1">
                {suggestedItems.slice(0, 8).map((item, index) => (
                  <div key={index} className="flex justify-between items-center text-xs">
                    <span className="text-gray-600">{item.nome}</span>
                    <span className="text-gray-500">
                      {item.categoria && `${item.categoria} • `}
                      R$ {item.preco.toFixed(2)}
                    </span>
                  </div>
                ))}
                {suggestedItems.length > 8 && (
                  <div className="text-xs text-gray-500 text-center pt-1">
                    ... e mais {suggestedItems.length - 8} itens
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={onCancel}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Começar Lista Vazia
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Criar Pré-Lista
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePreListDialog;

