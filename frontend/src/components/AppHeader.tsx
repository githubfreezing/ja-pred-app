// src/components/AppHeader.tsx
import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container"; // ← 追加

import { useAuth } from "react-oidc-context";
import { useNavigate } from "react-router-dom";

const AppHeader: React.FC = () => {
  const auth = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      // まずローカルのユーザー情報を破棄（これだけでも「未ログイン扱い」にできます）
      await auth.removeUser();

      // 画面をログインへ
      navigate("/", { replace: true });

      // もし Hosted UI の「完全ログアウト」もしたい場合は、
      // 下の「2) Cognito Hosted UI もログアウトさせたい場合」を実装してください。
    } catch (e) {
      console.error("Sign out failed:", e);
    }
  };

  const isDisabled = auth.isLoading || !auth.isAuthenticated;

  return (
    <AppBar position="fixed"
      elevation={2}
      sx={{ background: "#7A5A54", boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}
    >
      <Container maxWidth="lg">
        <Toolbar>
          <Typography variant="h6" sx={{
            flexGrow: 1,
            color: "#F7F3EF",
            fontWeight: 600
            }}
          >
            JA予測アプリ202601
          </Typography>

          <Box sx={{ display: "flex", gap: 1 }}>

            <Button
              color="inherit"
              disabled={isDisabled}
              onClick={() => navigate("/upload")}
            >
              アップロード
            </Button>

            <Button
              color="inherit"
              disabled={isDisabled}
              onClick={() => navigate("/pastdate")}
            >
              過去データ
            </Button>

            <Button
              color="inherit"
              onClick={handleSignOut}
              disabled={isDisabled}
            >
              Sign out
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default AppHeader;