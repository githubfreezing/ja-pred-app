// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "react-oidc-context";
import type { User } from "oidc-client-ts";

const cognitoAuthConfig = {
  authority: "https://cognito-idp.ap-northeast-1.amazonaws.com/ap-northeast-1_q9uxFWr5Z",
  // authority: "https://ap-northeast-1q9uxfwr5z.auth.ap-northeast-1.amazoncognito.com",
  client_id: "78mm636s6secrjievukbpus3jd",
  redirect_uri: "http://localhost:5173",//JA予測アプリ
  // redirect_uri: "https://ja-pred-app.com",
  response_type: "code",
  // scope: "openid email profile",
  scope: "openid email",
} as const;

const onSigninCallback = async (user: User | void) => {
  // ?code=... をURLから消す（推奨）
  window.history.replaceState({}, document.title, window.location.pathname);

  // user が渡らない実装/状況もあるため保険を入れる
  const returnTo =
    (user && (user.state as any)?.returnTo) ? (user.state as any).returnTo : "/upload";

  window.location.replace(returnTo);
};

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <AuthProvider {...cognitoAuthConfig} onSigninCallback={onSigninCallback}>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
