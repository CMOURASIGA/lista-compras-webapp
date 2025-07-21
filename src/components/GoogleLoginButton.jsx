import React from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { FcGoogle } from 'react-icons/fc'; // Usando um ícone do Google para o botão

const GoogleLoginButton = ({ onLoginSuccess, onLoginError }) => {
  const login = useGoogleLogin({
    onSuccess: onLoginSuccess,
    onError: onLoginError,
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/drive.file', // Permissão para criar e acessar arquivos criados pelo app
      'https://www.googleapis.com/auth/spreadsheets' // Permissão para gerenciar as planilhas
    ].join(' '),
  });

  return (
    <button
      onClick={() => login()}
      className="flex items-center justify-center w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
    >
      <FcGoogle className="w-6 h-6 mr-3" />
      <span className="font-medium">Fazer login com Google</span>
    </button>
  );
};

export default GoogleLoginButton;

