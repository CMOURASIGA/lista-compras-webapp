import React, { useState } from "react";
import GoogleLoginButton from "../components/GoogleLoginButton";
import Navigation from "../components/Navigation";
import ListaCompras from "./ListaCompras";
import AdicionarItem from "./AdicionarItem";
import Carrinho from "./Carrinho";
import Historico from "./Historico";

const Home = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const [currentPage, setCurrentPage] = useState('lista');

  const renderPage = () => {
    switch (currentPage) {
      case 'lista':
        return <ListaCompras />;
      case 'adicionar':
        return <AdicionarItem />;
      case 'carrinho':
        return <Carrinho />;
      case 'historico':
        return <Historico />;
      default:
        return <ListaCompras />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {!user ? (
        <div className="flex flex-col items-center justify-center min-h-screen text-center">
          <h1 className="text-2xl font-bold mb-4">Minha Lista de Compras</h1>
          <GoogleLoginButton />
        </div>
      ) : (
        <>
          <Navigation 
            currentPage={currentPage} 
            setCurrentPage={setCurrentPage} 
            user={user} 
          />
          <main className="pb-4">
            {renderPage()}
          </main>
        </>
      )}
    </div>
  );
};

export default Home;
