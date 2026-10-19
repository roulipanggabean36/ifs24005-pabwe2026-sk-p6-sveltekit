import { describe, expect, it, vi } from "vitest";
import { tick } from "svelte";
import { fireEvent, screen, waitFor } from "@testing-library/svelte";

vi.mock("../states/coursesStore", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../states/coursesStore")>()),
  asyncAddCourse: vi.fn(),
}));

import { click, renderWithProviders } from "../../../test-utils";
import { asyncAddCourse } from "../states/coursesStore";
import AddModal from "./AddModal.svelte";

async function submit(container: HTMLElement) {
  await fireEvent.input(screen.getByLabelText("Judul"), { target: { value: "Judul Baru" } });
  await fireEvent.input(screen.getByLabelText("Deskripsi"), { target: { value: "Isi deskripsi" } });
  await fireEvent.submit(container.querySelector("form")!);
}

describe("AddModal", () => {
  it("menutup modal setelah kursus berhasil ditambahkan", async () => {
    vi.mocked(asyncAddCourse).mockResolvedValue(true);
    const onClose = vi.fn();
    const { container } = renderWithProviders(AddModal, { props: { onClose } });
    await submit(container);
    await waitFor(() => expect(asyncAddCourse).toHaveBeenCalledWith("Judul Baru", "Isi deskripsi"));
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  });

  it("tetap terbuka saat penambahan gagal", async () => {
    vi.mocked(asyncAddCourse).mockResolvedValue(false);
    const onClose = vi.fn();
    const { container } = renderWithProviders(AddModal, { props: { onClose } });
    await submit(container);
    await waitFor(() => expect(asyncAddCourse).toHaveBeenCalled());
    await tick();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("menutup lewat tombol tutup", async () => {
    const onClose = vi.fn();
    renderWithProviders(AddModal, { props: { onClose } });
    await click(screen.getByLabelText("Tutup"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
