<script lang="ts">
  import { X } from "lucide-svelte";
  import { useInput } from "../../../hooks/useInput";
  import type { CourseContent, Id } from "../api/courseApi";
  import { asyncAddContent, asyncChangeContent, isMutatingContent } from "../states/coursesStore";

  let { courseId, content, onClose }: { courseId: Id; content: CourseContent | null; onClose: () => void } = $props();
  const { value: title } = useInput(content ? content.title : "");
  const { value: youtube } = useInput(content ? content.youtube : "");

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    const ok = content
      ? await asyncChangeContent(courseId, content.id, $title, $youtube)
      : await asyncAddContent(courseId, $title, $youtube);
    if (ok) onClose();
  }
</script>

<div class="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50 p-4" role="dialog" aria-modal="true" aria-label="Konten Kursus">
  <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
    <div class="mb-4 flex items-center justify-between">
      <h2 class="text-lg font-bold text-slate-900">{content ? "Ubah Konten" : "Tambah Konten"}</h2>
      <button type="button" aria-label="Tutup" onclick={onClose} class="rounded-lg p-1 text-slate-500 hover:bg-slate-100"><X size={18} /></button>
    </div>
    <form class="space-y-4" onsubmit={handleSubmit}>
      <div>
        <label for="content-title" class="mb-1 block text-sm font-medium text-slate-700">Judul</label>
        <input id="content-title" type="text" required bind:value={$title}
          class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
      </div>
      <div>
        <label for="content-youtube" class="mb-1 block text-sm font-medium text-slate-700">Tautan YouTube</label>
        <input id="content-youtube" type="url" required bind:value={$youtube}
          class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
      </div>
      <button type="submit" disabled={$isMutatingContent}
        class="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">Simpan</button>
    </form>
  </div>
</div>
