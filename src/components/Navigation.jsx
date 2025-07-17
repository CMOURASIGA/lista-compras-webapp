import React from 'react';

const Navigation = ({ currentPage, setCurrentPage, user }) => {
  const navItems = [
    { id: 'lista', label: 'Lista', icon: '📝' },
    { id: 'adicionar', label: 'Adicionar', icon: '➕' },
    { id: 'carrinho', label: 'Carrinho', icon: '🛒' },
    { id: 'historico', label: 'Histórico', icon: '📊' }
  ];

  return (
    <div className="bg-white shadow-lg">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b">
        <h1 className="text-xl font-bold text-gray-800">Lista de Compras</h1>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-600">Olá, {user.given_name || user.name}</span>
          <button
            onClick={() => {
              localStorage.removeItem("user");
              window.location.reload();
            }}
            className="text-red-500 hover:text-red-700 text-sm"
          >
            Sair
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-around py-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentPage(item.id)}
            className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
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
  );
};

export default Navigation;

