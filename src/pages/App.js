import React from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Home from "./home";
import { UserDataProvider } from "../contexts/UserDataContext";

function App() {
  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <UserDataProvider>
        <div className="App">
          <Home />
        </div>
      </UserDataProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
