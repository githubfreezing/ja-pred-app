// src/hooks/useFileUpload.ts
import { useCallback, useState } from "react";
import { uploadFile } from "../api/upload";
import { API_BASE } from "../config/api";

type Message = { type: "success" | "error"; text: string } | null;

///////////////////////////////////////////////////////////////
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// export default function useFileUpload(apiBase?: string) {
export default function useFileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<Message>(null);
  const [forecast, setForecast] = useState<any[]>([]);

  const upload = useCallback(async () => {
    if (!file) {
      setMessage({ type: "error", text: "ファイルを選択してください。" });
      return;
    }

    setIsUploading(true);
    setMessage(null);

    console.log("アップロードボタン#####", API_BASE_URL)
    try {
      const result = await uploadFile(API_BASE_URL, file);
      console.log("result#################",result);

      if (!result.ok || !result.data) {
        setMessage({ type: "error", text: `アップロード失敗(${result.status}): ${result.errorText ?? ""}` });
        return;
      }

      // setMessage({ type: "success", text: "アップロードが完了しました。" });
      setMessage({ type: "success", text: result.data.message });
      setFile(null);
      setForecast(result.data.forecast);
    } catch (err) {
      setMessage({ type: "error", text: `通信エラー: ${String(err)}` });
    } finally {
      setIsUploading(false);
    }
  }, [API_BASE, file]);

  return {
    file,
    setFile,
    isUploading,
    message,
    upload,
    forecast,
  };
}