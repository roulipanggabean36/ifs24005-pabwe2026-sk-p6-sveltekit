import { describe, expect, it, vi } from "vitest";
import { tick } from "svelte";
import { fireEvent, screen, waitFor } from "@testing-library/svelte";

vi.mock("../states/coursesStore", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../states/coursesStore")>()),
  asyncChangeCourse: vi.fn(),
}));

import { click, renderWithProviders } from "../../../test-utils";
import { asyncChangeCourse } from "../states/coursesStore";
import ChangeModal from "./ChangeModal.svelte";

const course = { id: 3, title: "Dasar C", description: "Belajar C" };

async function submit(container: HTMLElement) {
  await fireEvent.input(screen.getByLabelText("Judul"), { target: { value: "Judul Baru" } });
  await fireEvent.submit(container.querySelector("form")!);
}

describe("ChangeModal", () => {
  it("terisi data kursus dan menutup setelah berhasil", async () => {
    vi.mocked(asyncChangeCourse).mockResolvedValue(true);
    const onClose = vi.fn();
    const { container } = renderWithProviders(ChangeModal, { props: { course, onClose } });
    expect(screen.getByLabelText("Judul")).toHaveValue("Dasar C");
    expect(screen.getByLabelText("Deskripsi")).toHaveValue("Belajar C");
    await submit(container);
    await waitFor(() => expect(asyncChangeCourse).toHaveBeenCalledWith(3, "Judul Baru", "Belajar C"));
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  });

  it("tetap terbuka saat perubahan gagal", async () => {
    vi.mocked(asyncChangeCourse).mockResolvedValue(false);
    const onClose = vi.fn();
    const { container } = renderWithProviders(ChangeModal, { props: { course, onClose } });
    await submit(container);
    await waitFor(() => expect(asyncChangeCourse).toHaveBeenCalled());
    await tick();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("menutup lewat tombol tutup", async () => {
    const onClose = vi.fn();
    renderWithProviders(ChangeModal, { props: { course, onClose } });
    await click(screen.getByLabelText("Tutup"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
