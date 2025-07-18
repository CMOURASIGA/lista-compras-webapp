import { useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { exchangeToken } from "../services/googleSheetsService";

export default function GoogleLoginButton({ onLoginSuccess }) {
  useEffect(() => {
    const initializeGSI = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
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
      } else {
        setTimeout(initializeGSI, 1000); // tenta novamente se ainda não carregou
      }
    };

    initializeGSI();
  }, []);

  const handleCredentialResponse = async (response) => {
    try {
      const jwt = response.credential;
      const userInfo = jwtDecode(jwt);

      console.log("Usuário logado via GSI:", userInfo);

      // Trocar o JWT por accessToken
      await exchangeToken(jwt);

      const userData = {
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
        jwt: jwt,
      };

      localStorage.setItem("user", JSON.stringify(userData));

      // Chamar callback de sucesso
      onLoginSuccess(userData);
    } catch (error) {
      console.error("Erro no login GSI:", error);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div id="gsi-button"></div>
      <p className="text-xs text-gray-500 text-center max-w-xs">
        Ao fazer login, você autoriza o acesso ao Google Sheets para salvar suas listas de compras.
      </p>
    </div>
  );
}
