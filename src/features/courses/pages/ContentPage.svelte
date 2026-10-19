<script lang="ts">
  import { onMount } from "svelte";
  import { ArrowLeft, Video } from "lucide-svelte";
  import { getYoutubeId } from "../../../helpers/toolsHelper";
  import {
    asyncLoadContent,
    asyncSetContentStatus,
    courseContent,
    isContentLoading,
  } from "../states/coursesStore";

  let { courseId, contentId }: { courseId: string; contentId: string } = $props();

  onMount(() => {
    asyncLoadContent(contentId);
    return () => courseContent.set(null);
  });
</script>

<a href={`/courses/${courseId}`} class="mb-4 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:underline">
  <ArrowLeft size={16} /> Kembali ke kursus
</a>

{#if $isContentLoading && !$courseContent}
  <p role="status" class="text-sm text-slate-500">Memuat materi...</p>
{:else if $courseContent}
  {@const content = $courseContent}
  {@const videoId = getYoutubeId(content.youtube)}
  <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
    <h1 class="mb-4 flex items-center gap-2 text-xl font-extrabold text-slate-900">
      <Video size={22} class="text-indigo-500" /> {String(content.title)}
    </h1>
    {#if videoId}
      <div class="aspect-video w-full overflow-hidden rounded-xl bg-black">
        <iframe title={`Video ${String(content.title)}`} src={`https://www.youtube.com/embed/${videoId}`}
          class="h-full w-full" allowfullscreen></iframe>
      </div>
    {:else}
      <p class="text-sm text-rose-600">Tautan YouTube tidak valid.</p>
    {/if}
    <button type="button" onclick={() => asyncSetContentStatus(contentId, content.my_status_finished ? 0 : 1)}
      class="mt-5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
      {content.my_status_finished ? "Tandai belum selesai" : "Tandai selesai"}
    </button>
  </div>
{:else}
  <p class="text-sm text-slate-500">Materi tidak ditemukan.</p>
{/if}
