import React from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Home from "./home";
import { UserDataProvider } from "../contexts/UserDataContext";

function App() {
  return (
    <UserDataProvider>
      <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
        <div className="App">
          <Home />
        </div>
      </GoogleOAuthProvider>
    </UserDataProvider>
  );
}

export default App;
