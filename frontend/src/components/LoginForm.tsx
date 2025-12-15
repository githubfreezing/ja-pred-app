import React from "react";
import { Box, Button, TextField, Alert } from "@mui/material";
import { login } from "../api/auth";

export default function LoginForm() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await login({ email, password });
      // 例：トークン保存（仕様に合わせて変更）
      localStorage.setItem("access_token", res.access_token);
      // 例：ログイン後遷移（後で routes を増やすなら変更）
      window.location.href = "/";
    } catch (err: any) {
      setError(err?.message ?? "ログインに失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={onSubmit} sx={{ display: "grid", gap: 1.5 }}>
      {error && (
        <Alert severity="error" sx={{ textAlign: "left" }}>
          {error}
        </Alert>
      )}

      <TextField
        placeholder="メールアドレス"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        type="email"
        autoComplete="email"
        fullWidth
        InputProps={{
          sx: {
            height: 44,
            bgcolor: "#dbe9ff",
            borderRadius: 0,
            "& fieldset": { borderColor: "#2f4b63", borderWidth: 1.5 },
            "&:hover fieldset": { borderColor: "#2f4b63" },
            "&.Mui-focused fieldset": { borderColor: "#2f4b63" },
          },
        }}
      />

      <TextField
        placeholder="パスワード"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        type="password"
        autoComplete="current-password"
        fullWidth
        InputProps={{
          sx: {
            height: 44,
            bgcolor: "#dbe9ff",
            borderRadius: 0,
            "& fieldset": { borderColor: "#2f4b63", borderWidth: 1.5 },
            "&:hover fieldset": { borderColor: "#2f4b63" },
            "&.Mui-focused fieldset": { borderColor: "#2f4b63" },
          },
        }}
      />

      <Button
        type="submit"
        variant="contained"
        disabled={loading}
        sx={{
          mt: 1,
          height: 44,
          width: 160,
          mx: "auto",
          borderRadius: 1,
          bgcolor: "#0b5a74",
          "&:hover": { bgcolor: "#094a60" },
          fontWeight: 700,
        }}
      >
        ログイン
      </Button>
    </Box>
  );
}