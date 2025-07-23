
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import ListaCompras from './ListaCompras';
import AdicionarItem from './AdicionarItem';
import Carrinho from './Carrinho';
import Historico from './Historico';

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="p-4 bg-blue-500 text-white flex justify-between">
      <h1 className="text-xl">Lista de Compras</h1>
      {user ? (
        <div>
          <span className="mr-4">Olá, {user.name}</span>
          <button onClick={logout} className="bg-red-500 px-2 py-1 rounded">Sair</button>
        </div>
      ) : (
        <div id="g_id_onload"
             data-client_id={import.meta.env.VITE_GOOGLE_CLIENT_ID}
             data-auto_prompt="false"
             data-callback="handleCredentialResponse">
        </div>
      )}
    </header>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Header />
        <main className="p-4">
          <Routes>
            <Route path="/" element={<ListaCompras />} />
            <Route path="/adicionar" element={<AdicionarItem />} />
            <Route path="/carrinho" element={<Carrinho />} />
            <Route path="/historico" element={<Historico />} />
          </Routes>
        </main>
      </Router>
    </AuthProvider>
  );
};

export default App;
