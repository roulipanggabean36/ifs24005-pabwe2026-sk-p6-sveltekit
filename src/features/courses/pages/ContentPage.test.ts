import { describe, expect, it, vi } from "vitest";
import { get } from "svelte/store";
import { screen } from "@testing-library/svelte";

vi.mock("../states/coursesStore", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../states/coursesStore")>()),
  asyncLoadContent: vi.fn(),
  asyncSetContentStatus: vi.fn(),
}));

import { click, makeContent, renderWithProviders } from "../../../test-utils";
import {
  asyncLoadContent,
  asyncSetContentStatus,
  courseContent,
  isContentLoading,
} from "../states/coursesStore";
import ContentPage from "./ContentPage.svelte";

const props = { courseId: "3", contentId: "11" };
const withContent = (overrides = {}) => () => courseContent.set(makeContent(overrides));

describe("ContentPage", () => {
  it("menampilkan status memuat", () => {
    renderWithProviders(ContentPage, { props, setup: () => isContentLoading.set(true) });
    expect(asyncLoadContent).toHaveBeenCalledWith("11");
    expect(screen.getByRole("status")).toHaveTextContent("Memuat materi...");
  });

  it("menampilkan pesan bila materi tidak ditemukan", () => {
    renderWithProviders(ContentPage, { props });
    expect(screen.getByText("Materi tidak ditemukan.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Kembali ke kursus/ })).toHaveAttribute("href", "/courses/3");
  });

  it("memutar video YouTube dan menandai selesai", async () => {
    renderWithProviders(ContentPage, { props, setup: withContent() });
    expect(screen.getByTitle("Video Dasar Java")).toHaveAttribute(
      "src",
      "https://www.youtube.com/embed/uHyfQV0kbgo"
    );
    await click(screen.getByRole("button", { name: "Tandai selesai" }));
    expect(asyncSetContentStatus).toHaveBeenCalledWith("11", 1);
  });

  it("menandai belum selesai untuk materi yang sudah selesai", async () => {
    renderWithProviders(ContentPage, { props, setup: withContent({ my_status_finished: true }) });
    await click(screen.getByRole("button", { name: "Tandai belum selesai" }));
    expect(asyncSetContentStatus).toHaveBeenCalledWith("11", 0);
  });

  it("memberi tahu bila tautan YouTube tidak valid", () => {
    renderWithProviders(ContentPage, { props, setup: withContent({ youtube: "https://example.com/x" }) });
    expect(screen.getByText("Tautan YouTube tidak valid.")).toBeInTheDocument();
    expect(screen.queryByTitle("Video Dasar Java")).toBeNull();
  });

  it("membersihkan materi saat halaman ditutup", () => {
    const { unmount } = renderWithProviders(ContentPage, { props, setup: withContent() });
    unmount();
    expect(get(courseContent)).toBeNull();
  });
});
