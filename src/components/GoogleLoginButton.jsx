import { useEffect } from "react";

export default function GoogleLoginButton({ onLoginSuccess }) {
  useEffect(() => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        auto_select: false,
      });

      window.google.accounts.id.renderButton(
        document.getElementById("gsi-button"),
        { theme: "outline", size: "large" }
      );
    }
  }, []);

  const handleCredentialResponse = (response) => {
    const jwt = response.credential;
    onLoginSuccess(jwt); // repassa o JWT para ser trocado por token de acesso
  };

  return <div id="gsi-button"></div>;
}
