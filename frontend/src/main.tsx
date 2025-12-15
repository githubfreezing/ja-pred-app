// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "react-oidc-context";
import type { UserManagerSettings } from "oidc-client-ts";

const cognitoAuthConfig: UserManagerSettings = {
  authority: "https://cognito-idp.ap-northeast-1.amazonaws.com/ap-northeast-1_q9uxFWr5Z",
  client_id: "78mm636s6secrjievukbpus3jd",
  // redirect_uri: "https://d84l1y8p4kdic.cloudfront.net/",
  redirect_uri: "http://localhost:5173",
  response_type: "code",
  // scope: "openid email profile",
  scope: "openid email",
  // onSigninCallback: () => {
  //   // ?code=... をURLから消す（推奨）
  //   window.history.replaceState({}, document.title, window.location.pathname);
  // },
  // ✅ Cognitoログイン完了後に呼ばれる
  //    user.state.returnTo があればそこへ、なければ /upload へ
  onSigninCallback: async (user) => {
    // ?code=... をURLから消す（推奨）
    window.history.replaceState({}, document.title, window.location.pathname);

    const returnTo = (user?.state as any)?.returnTo ?? "/upload";
    window.location.replace(returnTo);
  },
};

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <AuthProvider {...cognitoAuthConfig}>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
