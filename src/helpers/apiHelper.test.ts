import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiRequest, getAccessToken, putAccessToken, removeAccessToken } from "./apiHelper";

const fetchMock = vi.fn();
const reply = (body: object) => fetchMock.mockResolvedValue({ json: async () => body });

describe("apiHelper", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  it("menyimpan, membaca, dan menghapus token", () => {
    expect(getAccessToken()).toBeNull();
    putAccessToken("abc");
    expect(getAccessToken()).toBe("abc");
    removeAccessToken();
    expect(getAccessToken()).toBeNull();
  });

  it("memakai GET tanpa token sebagai default", async () => {
    reply({ status: "success", message: "ok", data: { a: 1 } });
    const result = await apiRequest("/x");
    expect(result).toEqual({ success: true, message: "ok", data: { a: 1 } });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`${DELCOM_BASEURL}/x`);
    expect(init.method).toBe("GET");
    expect(init.headers.Authorization).toBeUndefined();
    expect(init.body).toBeUndefined();
  });

  it("menambahkan header Authorization bila token tersedia", async () => {
    putAccessToken("tok");
    reply({ status: "success" });
    await apiRequest("/x", { method: "DELETE" });
    const [, init] = fetchMock.mock.calls[0];
    expect(init.method).toBe("DELETE");
    expect(init.headers.Authorization).toBe("Bearer tok");
  });

  it("tidak mengirim Authorization saat auth dimatikan", async () => {
    putAccessToken("tok");
    reply({ status: "success" });
    await apiRequest("/x", { auth: false });
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBeUndefined();
  });

  it("mengirim body JSON", async () => {
    reply({ status: "success" });
    await apiRequest("/x", { method: "POST", body: { a: 1 } });
    const [, init] = fetchMock.mock.calls[0];
    expect(init.headers["Content-Type"]).toBe("application/json");
    expect(init.body).toBe(JSON.stringify({ a: 1 }));
  });

  it("mengirim FormData apa adanya tanpa Content-Type", async () => {
    reply({ status: "success" });
    const form = new FormData();
    await apiRequest("/x", { method: "POST", body: form });
    const [, init] = fetchMock.mock.calls[0];
    expect(init.body).toBe(form);
    expect(init.headers["Content-Type"]).toBeUndefined();
  });

  it("memberi pesan kosong bila server tidak mengirim pesan", async () => {
    reply({ status: "fail" });
    expect(await apiRequest("/x")).toEqual({ success: false, message: "", data: undefined });
  });

  it("mengembalikan kegagalan saat jaringan bermasalah", async () => {
    fetchMock.mockRejectedValue(new Error("offline"));
    expect(await apiRequest("/x")).toEqual({
      success: false,
      message: "Gagal terhubung ke server",
      data: undefined,
    });
  });
});
