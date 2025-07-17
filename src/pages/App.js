import React from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Home from "./home"; // ou o componente principal que você usa

const App = () => {
  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <Home />
    </GoogleOAuthProvider>
  );
};

export default App;
