import React from 'react';
import { ShoppingCart, Plus, Check, BarChart3 } from 'lucide-react';

const Navigation = ({ currentPage, onPageChange }) => {
  const navItems = [
    { id: 'lista', label: 'Lista', icon: ShoppingCart },
    { id: 'adicionar', label: 'Adicionar', icon: Plus },
    { id: 'carrinho', label: 'Carrinho', icon: Check },
    { id: 'historico', label: 'Histórico', icon: BarChart3 }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50 shadow-lg">
      <div className="flex justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`flex flex-col items-center py-3 px-4 rounded-xl transition-all duration-200 min-w-0 ${
                currentPage === item.id
                  ? 'bg-green-100 text-green-600 scale-105'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
              }`}
            >
              <IconComponent className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Navigation;