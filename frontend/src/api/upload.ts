// src/api/upload.ts

export type UploadResponse = {
  message: string;
  filename: string;
  forecast: any[]; // 予測の型が決まっていれば置き換えてOK
};

export async function uploadFile(
  apiBase: string,
  file: File
): Promise<{ ok: boolean; status: number; data?: UploadResponse; errorText?: string }> {
// Promise<{ ok: boolean; status: number; text: string }> {
  const form = new FormData();
  form.append("file", file);

  console.log("通信先#####", apiBase)
  const res = await fetch(`${apiBase}/api/v1/upload`, {
    method: "POST",
    body: form,
  });

  // 成功時はJSON、失敗時はテキスト（or JSON）を想定して安全に処理
  if (res.ok) {
    const data = (await res.json()) as UploadResponse;
    return {
      ok: true,
      status: res.status,
      data,
    };
  } else {
    const errorText = await res.text();
    return {
      ok: false,
      status: res.status,
      errorText,
    };
  }
}
