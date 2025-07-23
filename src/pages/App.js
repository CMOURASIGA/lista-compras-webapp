
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

import GoogleLoginButton from '../components/GoogleLoginButton';
import ListaCompras from './ListaCompras';
import AdicionarItem from './AdicionarItem';
import Carrinho from './Carrinho';
import Historico from './Historico';

const App = () => {
  const { user, logout } = useAuth();

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        {!user ? (
          <div className="flex items-center justify-center h-screen">
            <GoogleLoginButton />
          </div>
        ) : (
          <>
            <header className="bg-blue-600 text-white px-4 py-3 flex justify-between items-center">
              <h1 className="text-xl font-bold">Lista de Compras</h1>
              <div className="flex items-center gap-4">
                <span className="hidden sm:inline">Olá, {user.name}</span>
                <button onClick={logout} className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded">
                  Sair
                </button>
              </div>
            </header>

            <main className="p-4">
              <Routes>
                <Route path="/" element={<ListaCompras />} />
                <Route path="/adicionar" element={<AdicionarItem />} />
                <Route path="/carrinho" element={<Carrinho />} />
                <Route path="/historico" element={<Historico />} />
              </Routes>
            </main>
          </>
        )}
      </div>
    </Router>
  );
};

export default App;
