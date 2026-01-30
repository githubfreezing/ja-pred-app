// src/routes/index.tsx
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "react-oidc-context";

import Login from "../pages/LoginPage";
import Upload from "../pages/UploadPage";
import PastData from "../pages/PastDataPage";
import Sample from "../pages/SamplePage";

// ✅ 未ログインなら "/" に戻すガード
// function RequireAuth({ children }: { children: JSX.Element }) {
function RequireAuth({ children }: { children: React.ReactElement }) {
  const auth = useAuth();
  const location = useLocation();

  // 認証状態の判定中は画面遷移させず待つ（チラつき防止）
  if (auth.isLoading) return <div>Loading...</div>;

  // 未ログインならログイン画面へ（元の遷移先は state に保持）
  if (!auth.isAuthenticated) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return children;
}

const AppRoutes = () => {
  const auth = useAuth();

  // すでにログイン済みで "/" に来たら、アップロードへ飛ばす（任意）
  const homeElement = auth.isLoading ? (
    <div>Loading...</div>
  ) : auth.isAuthenticated ? (
    <Navigate to="/upload" replace />
  ) : (
    <Login />
  );

  return (
    <Routes>
      <Route path="/" element={homeElement} />

      {/* <Route
        path="/upload"
        element={
          <RequireAuth>
            <Upload />
          </RequireAuth>
        }
      />

      <Route
        path="/pastdate"
        element={
          <RequireAuth>
            <PastData />
          </RequireAuth>
        }
      /> */}

      {/* ログイン機能未実装用URL */}
      <Route
        path="/upload"
        element={
            <Upload />
        }
      />
      <Route
        path="/pastdate"
        element={
            <PastData />
        }
      />
      {/* //////////////////////////// */}

      <Route
        path="/sample"
        element={
          <Sample />
        }
      />

      {/* どこにも一致しない場合は "/" に */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;