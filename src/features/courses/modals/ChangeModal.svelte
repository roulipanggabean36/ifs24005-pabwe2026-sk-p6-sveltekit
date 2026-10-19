<script lang="ts">
  import { X } from "lucide-svelte";
  import { useInput } from "../../../hooks/useInput";
  import type { Course } from "../api/courseApi";
  import { asyncChangeCourse, isMutatingCourse } from "../states/coursesStore";

  let { course, onClose }: { course: Pick<Course, "id" | "title" | "description">; onClose: () => void } = $props();
  const { value: title } = useInput(course.title);
  const { value: description } = useInput(course.description);

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    if (await asyncChangeCourse(course.id, $title, $description)) onClose();
  }
</script>

<div class="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50 p-4" role="dialog" aria-modal="true" aria-label="Ubah Kursus">
  <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
    <div class="mb-4 flex items-center justify-between">
      <h2 class="text-lg font-bold text-slate-900">Ubah Kursus</h2>
      <button type="button" aria-label="Tutup" onclick={onClose} class="rounded-lg p-1 text-slate-500 hover:bg-slate-100"><X size={18} /></button>
    </div>
    <form class="space-y-4" onsubmit={handleSubmit}>
      <div>
        <label for="change-title" class="mb-1 block text-sm font-medium text-slate-700">Judul</label>
        <input id="change-title" type="text" required bind:value={$title}
          class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
      </div>
      <div>
        <label for="change-description" class="mb-1 block text-sm font-medium text-slate-700">Deskripsi</label>
        <textarea id="change-description" rows="4" required bind:value={$description}
          class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"></textarea>
      </div>
      <button type="submit" disabled={$isMutatingCourse}
        class="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">Simpan</button>
    </form>
  </div>
</div>
