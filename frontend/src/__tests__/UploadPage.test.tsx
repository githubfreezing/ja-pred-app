// import { render, screen } from "@testing-library/react";
// import userEvent from "@testing-library/user-event";
// import { describe, it, expect, vi, afterEach } from "vitest";
// import "@testing-library/jest-dom/vitest";

// import UploadPage from "../pages/UploadPage";
// import { uploadFile } from "../api/upload";

// /* =========================
//    UploadPage 用のモック
// ========================= */

// /**
//  * upload 関数のモック
//  */
// const mockUpload = vi.fn();

// /**
//  * useFileUpload のモック
//  */
// vi.mock("../hooks/useFileUpload", () => ({
//   default: () => ({
//     file: new File(["dummy"], "test.csv"),
//     setFile: vi.fn(),
//     isUploading: false,
//     message: "",
//     upload: mockUpload,
//   }),
// }));

// /* =========================
//    UploadPage のテスト
// ========================= */

// describe("UploadPage", () => {
//   it("画面タイトル「アップロード」が表示される", () => {
//     render(<UploadPage />);

//     expect(
//       screen.getByRole("heading", { name: "アップロード" })
//     ).toBeInTheDocument();
//   });

//   it("アップロードボタンを押すと upload が呼ばれる", async () => {
//     render(<UploadPage />);

//     const user = userEvent.setup();

//     const buttons = screen.getAllByRole("button", {
//       name: "アップロード",
//     });

//     const uploadButton = buttons.find(
//       (btn) => !btn.hasAttribute("disabled")
//     );

//     expect(uploadButton).toBeTruthy();

//     await user.click(uploadButton!);

//     expect(mockUpload).toHaveBeenCalledTimes(1);
//   });
// });

// /* =========================
//    uploadFile(API) のテスト
// ========================= */

// describe("uploadFile", () => {
//   afterEach(() => {
//     vi.restoreAllMocks();
//   });

//   it("ファイルを POST してレスポンスを正しく返す", async () => {
//     // ---------- Arrange ----------
//     const mockFetch = vi.fn().mockResolvedValue({
//       ok: true,
//       status: 200,
//       text: vi.fn().mockResolvedValue("uploaded"),
//     });

//     globalThis.fetch = mockFetch as unknown as typeof fetch;

//     const apiBase = "http://example.com";
//     const file = new File(["dummy"], "test.csv");

//     // ---------- Act ----------
//     const result = await uploadFile(apiBase, file);

//     // ---------- Assert ----------
//     // fetch が正しい URL / method で呼ばれているか
//     expect(mockFetch).toHaveBeenCalledWith(
//       "http://example.com/api/v1/upload",
//       expect.objectContaining({
//         method: "POST",
//         body: expect.any(FormData),
//       })
//     );

//     // 戻り値の検証
//     expect(result).toEqual({
//       ok: true,
//       status: 200,
//       text: "uploaded",
//     });
//   });
// });
