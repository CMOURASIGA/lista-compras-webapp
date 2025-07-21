
import { useEffect } from "react";

export default function GoogleLoginButton({ onLoginSuccess }) {
  useEffect(() => {
    const loadGapi = async () => {
      await new Promise((resolve) => {
        const interval = setInterval(() => {
          if (window.gapi) {
            clearInterval(interval);
            resolve();
          }
        }, 100);
      });

      window.gapi.load("client:auth2", async () => {
        await window.gapi.client.init({
          clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID,
          scope: "https://www.googleapis.com/auth/spreadsheets",
        });

        const authInstance = window.gapi.auth2.getAuthInstance();
        if (!authInstance) return;

        const isSignedIn = authInstance.isSignedIn.get();
        if (isSignedIn) {
          const user = authInstance.currentUser.get();
          handleUser(user);
        } else {
          renderButton();
        }
      });
    };

    const renderButton = () => {
      window.google.accounts.id.initialize({
        client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
      });

      window.google.accounts.id.renderButton(document.getElementById("gsi-button"), {
        theme: "outline",
        size: "large",
        text: "signin_with",
        shape: "rectangular",
      });
    };

    const handleCredentialResponse = async () => {
      const user = window.gapi.auth2.getAuthInstance().currentUser.get();
      handleUser(user);
    };

    const handleUser = async (user) => {
      const profile = user.getBasicProfile();
      const authResponse = user.getAuthResponse();

      const userInfo = {
        email: profile.getEmail(),
        name: profile.getName(),
        picture: profile.getImageUrl(),
        token: authResponse.access_token,
      };

      localStorage.setItem("user", JSON.stringify(userInfo));
      onLoginSuccess(userInfo);
    };

    loadGapi();
  }, []);

  return (
    <div className="flex flex-col items-center space-y-4">
      <div id="gsi-button"></div>
      <p className="text-xs text-gray-500 text-center max-w-xs">
        Ao fazer login, você autoriza o acesso ao Google Sheets para salvar suas listas de compras.
      </p>
    </div>
  );
}
