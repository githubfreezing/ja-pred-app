import { request } from "./http";

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  access_token: string;
  token_type?: string;
};

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  // FastAPI 側のエンドポイントに合わせて変更してください
  return request<LoginResponse>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}