<script lang="ts">
  import { X } from "lucide-svelte";
  import { showErrorDialog } from "../../../helpers/toolsHelper";
  import type { Id } from "../api/courseApi";
  import { asyncChangeCover, isMutatingCover } from "../states/coursesStore";

  let { courseId, onClose }: { courseId: Id; onClose: () => void } = $props();
  let file: File | undefined = $state();

  function handleFile(event: Event) {
    file = (event.currentTarget as HTMLInputElement).files![0];
  }

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    if (!file) {
      await showErrorDialog("Pilih berkas gambar terlebih dahulu.");
      return;
    }
    if (await asyncChangeCover(courseId, file)) onClose();
  }
</script>

<div class="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50 p-4" role="dialog" aria-modal="true" aria-label="Ubah Sampul">
  <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
    <div class="mb-4 flex items-center justify-between">
      <h2 class="text-lg font-bold text-slate-900">Ubah Sampul</h2>
      <button type="button" aria-label="Tutup" onclick={onClose} class="rounded-lg p-1 text-slate-500 hover:bg-slate-100"><X size={18} /></button>
    </div>
    <form class="space-y-4" onsubmit={handleSubmit}>
      <div>
        <label for="cover-file" class="mb-1 block text-sm font-medium text-slate-700">Berkas Sampul</label>
        <input id="cover-file" type="file" accept="image/*" onchange={handleFile}
          class="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:text-indigo-700" />
      </div>
      <button type="submit" disabled={$isMutatingCover}
        class="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">Unggah</button>
    </form>
  </div>
</div>
