import React from "react";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from 'jwt-decode';

const GoogleLoginButton = () => {
  const handleLogin = (credentialResponse) => {
    const decoded = jwt_Decode(credentialResponse.credential);
    console.log("Usuário autenticado:", decoded);

    localStorage.setItem("user", JSON.stringify(decoded));
    window.location.reload(); // Recarrega para atualizar estado após login
  };

  return (
    <GoogleLogin
      onSuccess={handleLogin}
      onError={() => {
        console.log("Erro ao fazer login com Google");
      }}
    />
  );
};

export default GoogleLoginButton;
