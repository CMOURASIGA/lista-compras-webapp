import React from "react";
import GoogleLoginButton from "../components/GoogleLoginButton";

const Home = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center">
      {!user ? (
        <>
          <h1 className="text-2xl font-bold mb-4">Minha Lista de Compras</h1>
          <GoogleLoginButton />
        </>
      ) : (
        <>
          <h1 className="text-2xl font-bold mb-2">
            Olá, {user.given_name || user.name}!
          </h1>
          <p className="mb-4">Email: {user.email}</p>
          <button
            className="bg-red-500 text-white px-4 py-2 rounded"
            onClick={() => {
              localStorage.removeItem("user");
              window.location.reload();
            }}
          >
            Sair
          </button>
        </>
      )}
    </div>
  );
};

export default Home;
