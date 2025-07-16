import React from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Home from "./pages/Home"; // ou o componente principal que você usa

const App = () => {
  return (
    <GoogleOAuthProvider clientId="61677669740-vf6epk35jup6ibr0lk1gt6o9kpg5n7k.apps.googleusercontent.com">
      <Home />
    </GoogleOAuthProvider>
  );
};

export default App;
