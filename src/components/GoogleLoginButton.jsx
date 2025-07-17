import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useUserData } from '../contexts/UserDataContext';

const GoogleLoginButton = ({ onLoginSuccess }) => {
  const { initializeUserData } = useUserData();

  const handleSuccess = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      console.log('Login bem-sucedido:', decoded);
      
      const userInfo = {
        email: decoded.email,
        name: decoded.name,
        picture: decoded.picture
      };

      // Salvar no localStorage para persistência
      localStorage.setItem("user", JSON.stringify(userInfo));

      // Inicializar dados do usuário (incluindo criação de planilha se necessário)
      await initializeUserData(userInfo);
      
      if (onLoginSuccess) {
        onLoginSuccess(userInfo);
      }
    } catch (error) {
      console.error('Erro ao processar login:', error);
    }
  };

  const handleError = () => {
    console.error('Erro no login com Google');
  };

  return (
    <div className="flex justify-center">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        useOneTap={false}
        theme="outline"
        size="large"
        text="signin_with"
        shape="rectangular"
        logo_alignment="left"
      />
    </div>
  );
};

export default GoogleLoginButton;

