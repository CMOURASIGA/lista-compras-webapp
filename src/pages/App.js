import React from 'react';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center text-center p-4">
      <h1 className="text-3xl font-bold text-green-700 mb-6">Minha Lista de Compras</h1>
      <button
        onClick={() => alert('Login com Google será implementado aqui')}
        className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
      >
        Entrar com Google
      </button>
    </div>
  );
}