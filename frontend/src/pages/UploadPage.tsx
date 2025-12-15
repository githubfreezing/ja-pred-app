// src/pages/UploadPage.tsx
import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  Container,
  Stack,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

type Props = {
  apiBase?: string; // 例: "http://localhost:8000"
};

export default function UploadPage({ apiBase }: Props) {
  const API_BASE = useMemo(
    () => apiBase ?? (import.meta as any).env?.VITE_API_BASE ?? "http://localhost:8000",
    [apiBase]
  );

  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  const fileLabel = file ? file.name : "ファイルを選択してください";

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(null);
    const f = e.target.files?.[0] ?? null;
    setFile(f);
  };

  const upload = async () => {
    if (!file) {
      setMessage({ type: "error", text: "ファイルを選択してください。" });
      return;
    }

    setIsUploading(true);
    setMessage(null);

    try {
      const form = new FormData();
      form.append("file", file);

      // 例: FastAPI側が POST /upload で受ける想定
      const res = await fetch(`${API_BASE}/api/v1/upload`, {
        method: "POST",
        body: form,
      });

      const text = await res.text();
      if (!res.ok) {
        setMessage({ type: "error", text: `アップロードに失敗しました（${res.status}）: ${text}` });
        return;
      }

      setMessage({ type: "success", text: "アップロードが完了しました。" });
      setFile(null);
    } catch (err) {
      setMessage({ type: "error", text: `通信エラー: ${String(err)}` });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >

        <Stack spacing={3} sx={{ width: "100%", alignItems: "center" }}>
          <Typography variant="h4" fontWeight={700}>
            アップロード
          </Typography>

          {message && (
            <Alert severity={message.type} sx={{ width: "100%" }}>
              {message.text}
            </Alert>
          )}

          {/* ファイル選択：input[type=file] を Button でラップ */}
          <Button
            component="label"
            variant="outlined"
            size="large"
            startIcon={<UploadFileIcon />}
            sx={{
              width: "100%",
              justifyContent: "center",
              py: 1.6,
              borderWidth: 2,
            }}
            disabled={isUploading}
          >
            {fileLabel}
            <input type="file" hidden onChange={onPickFile} />
          </Button>

          <Button
            variant="contained"
            size="large"
            startIcon={isUploading ? <CircularProgress size={18} /> : <CloudUploadIcon />}
            onClick={upload}
            disabled={!file || isUploading}
            sx={{
              width: 220,
              py: 1.2,
              borderRadius: 2,
            }}
          >
            アップロード
          </Button>

        </Stack>
      </Box>
    </Container>
  );
}