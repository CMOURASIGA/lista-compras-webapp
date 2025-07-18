import { useEffect } from "react";
import { jwtDecode } from "jwt-decode";

export default function GoogleLoginButton({ onLoginSuccess }) {
  useEffect(() => {
    // Aguardar o carregamento das APIs do Google
    const initializeGoogleAuth = async () => {
      if (window.gapi && window.google) {
        try {
          // Inicializar o gapi
          await new Promise((resolve) => {
            window.gapi.load('auth2', resolve);
          });

          const authInstance = await window.gapi.auth2.init({
            client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
            scope: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file profile email'
          });

          // Configurar o botão GSI para login inicial
          window.google.accounts.id.initialize({
            client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
            callback: handleCredentialResponse,
            auto_select: false,
          });

          window.google.accounts.id.renderButton(
            document.getElementById("gsi-button"),
            { 
              theme: "outline", 
              size: "large",
              text: "signin_with",
              shape: "rectangular"
            }
          );

          console.log('Google Auth inicializado com sucesso');
        } catch (error) {
          console.error('Erro ao inicializar Google Auth:', error);
        }
      } else {
        // Tentar novamente após um tempo se as APIs ainda não carregaram
        setTimeout(initializeGoogleAuth, 1000);
      }
    };

    initializeGoogleAuth();
  }, []);

  const handleCredentialResponse = async (response) => {
    try {
      const jwt = response.credential;
      const userInfo = jwtDecode(jwt);
      
      console.log('Usuário logado:', userInfo);
      
      // Salvar informações do usuário
      const userData = {
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
        jwt: jwt
      };
      
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Agora precisamos obter permissões OAuth2 para acessar Sheets e Drive
      try {
        const authInstance = window.gapi.auth2.getAuthInstance();
        const googleUser = await authInstance.signIn({
          scope: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file'
        });
        
        console.log('OAuth2 autorizado com sucesso');
        
        // Chamar callback de sucesso
        onLoginSuccess(userData);
      } catch (oauthError) {
        console.error('Erro na autorização OAuth2:', oauthError);
        // Mesmo assim, permitir login básico
        onLoginSuccess(userData);
      }
      
    } catch (error) {
      console.error('Erro ao processar login:', error);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div id="gsi-button"></div>
      <p className="text-xs text-gray-500 text-center max-w-xs">
        Ao fazer login, você autoriza o acesso ao Google Sheets para salvar suas listas de compras
      </p>
    </div>
  );
}

