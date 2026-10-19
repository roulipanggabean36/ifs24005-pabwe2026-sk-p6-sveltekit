import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/svelte";

vi.mock("$app/navigation", () => ({ goto: vi.fn() }));
vi.mock("$app/state", () => ({
  page: { url: new URL("http://localhost/"), params: {}, status: 404, error: null },
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  localStorage.clear();
});
