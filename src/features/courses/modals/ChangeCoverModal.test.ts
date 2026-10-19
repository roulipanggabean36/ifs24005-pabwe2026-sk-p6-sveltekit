import { describe, expect, it, vi } from "vitest";
import { tick } from "svelte";
import { fireEvent, screen, waitFor } from "@testing-library/svelte";

vi.mock("sweetalert2", () => ({ default: { fire: vi.fn() } }));
vi.mock("../states/coursesStore", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../states/coursesStore")>()),
  asyncChangeCover: vi.fn(),
}));

import Swal from "sweetalert2";
import { click, renderWithProviders } from "../../../test-utils";
import { asyncChangeCover } from "../states/coursesStore";
import ChangeCoverModal from "./ChangeCoverModal.svelte";

const file = new File(["x"], "cover.png", { type: "image/png" });

async function chooseAndSubmit(container: HTMLElement) {
  await fireEvent.change(screen.getByLabelText("Berkas Sampul"), { target: { files: [file] } });
  await fireEvent.submit(container.querySelector("form")!);
}

describe("ChangeCoverModal", () => {
  it("meminta berkas bila belum memilih", async () => {
    const { container } = renderWithProviders(ChangeCoverModal, { props: { courseId: 3, onClose: vi.fn() } });
    await fireEvent.submit(container.querySelector("form")!);
    await waitFor(() =>
      expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: "error" }))
    );
    expect(asyncChangeCover).not.toHaveBeenCalled();
  });

  it("mengunggah berkas lalu menutup saat berhasil", async () => {
    vi.mocked(asyncChangeCover).mockResolvedValue(true);
    const onClose = vi.fn();
    const { container } = renderWithProviders(ChangeCoverModal, { props: { courseId: 3, onClose } });
    await chooseAndSubmit(container);
    await waitFor(() => expect(asyncChangeCover).toHaveBeenCalledWith(3, file));
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  });

  it("tetap terbuka saat unggahan gagal", async () => {
    vi.mocked(asyncChangeCover).mockResolvedValue(false);
    const onClose = vi.fn();
    const { container } = renderWithProviders(ChangeCoverModal, { props: { courseId: 3, onClose } });
    await chooseAndSubmit(container);
    await waitFor(() => expect(asyncChangeCover).toHaveBeenCalled());
    await tick();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("menutup lewat tombol tutup", async () => {
    const onClose = vi.fn();
    renderWithProviders(ChangeCoverModal, { props: { courseId: 3, onClose } });
    await click(screen.getByLabelText("Tutup"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
