import React from 'react';

const Navigation = ({ currentPage, onPageChange }) => {
  const navItems = [
    { id: 'lista', label: 'Lista', icon: '📝' },
    { id: 'adicionar', label: 'Adicionar', icon: '➕' },
    { id: 'carrinho', label: 'Carrinho', icon: '🛒' },
    { id: 'historico', label: 'Histórico', icon: '📊' }
  ];

  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-around py-3">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors min-w-0 flex-1 ${
                currentPage === item.id
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="text-lg mb-1">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Navigation;

