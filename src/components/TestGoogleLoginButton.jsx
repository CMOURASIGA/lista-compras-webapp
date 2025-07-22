import React from 'react';

const TestGoogleLoginButton = ({ onLoginSuccess, onLoginError }) => {
  const handleTestLogin = () => {
    // Simular resposta de login bem-sucedida
    const mockTokenResponse = {
      access_token: 'mock_access_token_for_testing',
      token_type: 'Bearer',
      expires_in: 3600,
      scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/spreadsheets'
    };

    // Simular dados do usuário
    const mockUserInfo = {
      email: 'teste@exemplo.com',
      name: 'Usuário Teste',
      picture: 'https://via.placeholder.com/40'
    };

    // Salvar dados do usuário no localStorage para simular o processo real
    localStorage.setItem('user', JSON.stringify(mockUserInfo));
    
    onLoginSuccess(mockTokenResponse);
  };

  return (
    <button
      onClick={handleTestLogin}
      className="flex items-center justify-center w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
    >
      <span className="font-medium">🧪 Login de Teste (Simular)</span>
    </button>
  );
};

export default TestGoogleLoginButton;

