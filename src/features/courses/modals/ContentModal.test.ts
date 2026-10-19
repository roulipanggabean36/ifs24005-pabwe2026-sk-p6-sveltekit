import { describe, expect, it, vi } from "vitest";
import { tick } from "svelte";
import { fireEvent, screen, waitFor } from "@testing-library/svelte";

vi.mock("../states/coursesStore", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../states/coursesStore")>()),
  asyncAddContent: vi.fn(),
  asyncChangeContent: vi.fn(),
}));

import { click, makeContent, renderWithProviders } from "../../../test-utils";
import { asyncAddContent, asyncChangeContent } from "../states/coursesStore";
import ContentModal from "./ContentModal.svelte";

const youtube = "https://youtu.be/uHyfQV0kbgo";

async function submit(container: HTMLElement) {
  await fireEvent.input(screen.getByLabelText("Judul"), { target: { value: "Judul Konten" } });
  await fireEvent.input(screen.getByLabelText("Tautan YouTube"), { target: { value: youtube } });
  await fireEvent.submit(container.querySelector("form")!);
}

describe("ContentModal", () => {
  it("mode tambah menutup setelah berhasil", async () => {
    vi.mocked(asyncAddContent).mockResolvedValue(true);
    const onClose = vi.fn();
    const { container } = renderWithProviders(ContentModal, { props: { courseId: 3, content: null, onClose } });
    expect(screen.getByRole("heading", { name: "Tambah Konten" })).toBeInTheDocument();
    expect(screen.getByLabelText("Judul")).toHaveValue("");
    await submit(container);
    await waitFor(() => expect(asyncAddContent).toHaveBeenCalledWith(3, "Judul Konten", youtube));
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  });

  it("mode tambah tetap terbuka saat gagal", async () => {
    vi.mocked(asyncAddContent).mockResolvedValue(false);
    const onClose = vi.fn();
    const { container } = renderWithProviders(ContentModal, { props: { courseId: 3, content: null, onClose } });
    await submit(container);
    await waitFor(() => expect(asyncAddContent).toHaveBeenCalled());
    await tick();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("mode ubah terisi data konten dan menutup setelah berhasil", async () => {
    vi.mocked(asyncChangeContent).mockResolvedValue(true);
    const onClose = vi.fn();
    const content = makeContent({ id: 11, title: "Lama" });
    const { container } = renderWithProviders(ContentModal, { props: { courseId: 3, content, onClose } });
    expect(screen.getByRole("heading", { name: "Ubah Konten" })).toBeInTheDocument();
    expect(screen.getByLabelText("Judul")).toHaveValue("Lama");
    expect(screen.getByLabelText("Tautan YouTube")).toHaveValue(content.youtube);
    await submit(container);
    await waitFor(() => expect(asyncChangeContent).toHaveBeenCalledWith(3, 11, "Judul Konten", youtube));
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  });

  it("mode ubah tetap terbuka saat gagal", async () => {
    vi.mocked(asyncChangeContent).mockResolvedValue(false);
    const onClose = vi.fn();
    const { container } = renderWithProviders(ContentModal, {
      props: { courseId: 3, content: makeContent(), onClose },
    });
    await submit(container);
    await waitFor(() => expect(asyncChangeContent).toHaveBeenCalled());
    await tick();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("menutup lewat tombol tutup", async () => {
    const onClose = vi.fn();
    renderWithProviders(ContentModal, { props: { courseId: 3, content: null, onClose } });
    await click(screen.getByLabelText("Tutup"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
