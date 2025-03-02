import React from "react";
import ReactDOM from "react-dom/client";
import { StrictMode } from "react";
import { Auth0Provider } from "@auth0/auth0-react";
import App from "./App.tsx";

const domain = import.meta.env.VITE_AUTH0_DOMAIN!;
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID!;
const callbackUrl = import.meta.env.VITE_AUTH0_CALLBACK_URL!;

// ReactDOM.createRoot(document.getElementById("root")!).render(
//   <Auth0Provider
//     domain={domain}
//     clientId={clientId}
//     authorizationParams={{ redirect_uri: callbackUrl }}
//   >
//     <StrictMode>
//       <App />
//     </StrictMode>
//   </Auth0Provider>
// );
ReactDOM.createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
