<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { ArrowLeft, Camera, Check, GraduationCap, Pencil, Plus, Star, Trash2, Users, Video } from "lucide-svelte";
  import { useInput } from "../../../hooks/useInput";
  import { formatRating, resolveAssetUrl } from "../../../helpers/toolsHelper";
  import type { CourseContent } from "../api/courseApi";
  import ChangeCoverModal from "../modals/ChangeCoverModal.svelte";
  import ChangeModal from "../modals/ChangeModal.svelte";
  import ContentModal from "../modals/ContentModal.svelte";
  import {
    asyncDeleteContent,
    asyncDeleteCourse,
    asyncJoinCourse,
    asyncLeaveCourse,
    asyncLoadCourse,
    asyncRateCourse,
    course,
    courseRole,
    isCourseLoading,
  } from "../states/coursesStore";

  let { courseId }: { courseId: string } = $props();

  let showChange = $state(false);
  let showCover = $state(false);
  let showContent = $state(false);
  let editingContent = $state<CourseContent | null>(null);
  let rating = $state(5);
  const { value: comment } = useInput("");

  onMount(() => {
    asyncLoadCourse(courseId);
    return () => course.set(null);
  });

  function openContentModal(content: CourseContent | null) {
    editingContent = content;
    showContent = true;
  }

  async function handleDeleteCourse() {
    if (await asyncDeleteCourse(courseId)) await goto("/");
  }

  async function handleRate(event: SubmitEvent) {
    event.preventDefault();
    await asyncRateCourse(courseId, Number(rating), $comment);
  }
</script>

<a href="/" class="mb-4 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:underline">
  <ArrowLeft size={16} /> Semua Kursus
</a>

{#if $isCourseLoading && !$course}
  <p role="status" class="text-sm text-slate-500">Memuat kursus...</p>
{:else if $course}
  {@const c = $course}
  <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    {#if c.cover}
      <img src={resolveAssetUrl(c.cover)} alt={`Sampul ${c.title}`} class="h-56 w-full object-cover" />
    {:else}
      <div class="flex h-56 w-full items-center justify-center bg-indigo-50 text-indigo-400"><GraduationCap size={56} /></div>
    {/if}
    <div class="p-6">
      <h1 class="text-2xl font-extrabold text-slate-900">{c.title}</h1>
      <p class="mt-2 text-slate-600">{c.description}</p>
      <p class="mt-3 text-sm text-slate-500">Dibuat oleh {String(c.author.name)}</p>
      <div class="mt-4 flex flex-wrap items-center gap-5 text-sm text-slate-700">
        <span class="inline-flex items-center gap-1"><Users size={16} /> {String(c.students.length)} peserta</span>
        <span class="inline-flex items-center gap-1"><Video size={16} /> {String(c.total_contents)} konten</span>
        <span class="inline-flex items-center gap-1 font-semibold text-amber-700"><Star size={16} /> {formatRating(c.avg_ratings)}</span>
      </div>

      <div class="mt-6 flex flex-wrap gap-2">
        {#if $courseRole === "owner"}
          <button type="button" onclick={() => (showChange = true)}
            class="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"><Pencil size={16} />Ubah Data</button>
          <button type="button" onclick={() => (showCover = true)}
            class="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"><Camera size={16} />Ubah Sampul</button>
          <button type="button" onclick={() => openContentModal(null)}
            class="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700"><Plus size={16} />Tambah Konten</button>
          <button type="button" onclick={handleDeleteCourse}
            class="inline-flex items-center gap-2 rounded-lg border border-rose-300 px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50"><Trash2 size={16} />Hapus Kursus</button>
        {:else if $courseRole === "student"}
          <p class="mr-2 self-center text-sm font-medium text-emerald-700">{`Progres belajar: ${c.my_percentage_finished}%`}</p>
          <button type="button" onclick={() => asyncLeaveCourse(courseId)}
            class="rounded-lg border border-rose-300 px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50">Keluar dari Kursus</button>
        {:else}
          <button type="button" onclick={() => asyncJoinCourse(courseId)}
            class="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700">Daftar Kursus</button>
        {/if}
      </div>
    </div>
  </div>

  <section class="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
    <h2 class="mb-4 text-lg font-bold text-slate-900">Daftar Konten</h2>
    {#if c.contents.length === 0}
      <p class="text-sm text-slate-500">Belum ada konten.</p>
    {:else}
      <ol class="divide-y divide-slate-100">
        {#each c.contents as content (content.id)}
          <li class="flex items-center gap-3 py-3">
            <span class="text-indigo-500"><Video size={18} /></span>
            {#if $courseRole === "guest"}
              <span class="flex-1 text-slate-500">{content.title}</span>
            {:else}
              <a href={`/courses/${c.id}/contents/${content.id}`} class="flex-1 font-medium text-slate-800 hover:text-indigo-600">{content.title}</a>
            {/if}
            {#if content.my_status_finished}
              <span class="text-emerald-600" title="Selesai"><Check size={16} /></span>
            {/if}
            {#if $courseRole === "owner"}
              <button type="button" aria-label={`Ubah ${content.title}`} onclick={() => openContentModal(content)}
                class="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><Pencil size={16} /></button>
              <button type="button" aria-label={`Hapus ${content.title}`} onclick={() => asyncDeleteContent(courseId, content.id)}
                class="rounded-lg p-2 text-rose-700 hover:bg-rose-50"><Trash2 size={16} /></button>
            {/if}
          </li>
        {/each}
      </ol>
    {/if}
  </section>

  <section class="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
    <h2 class="mb-4 text-lg font-bold text-slate-900">Rating Peserta</h2>
    {#if c.ratings.length === 0}
      <p class="text-sm text-slate-500">Belum ada rating.</p>
    {:else}
      <ul class="space-y-3">
        {#each c.ratings as item}
          <li class="rounded-lg bg-slate-50 p-3">
            <div class="flex items-center justify-between text-sm">
              <strong class="text-slate-900">{item.name}</strong>
              <span class="inline-flex items-center gap-1 font-semibold text-amber-700"><Star size={14} /> {String(item.ratings)}</span>
            </div>
            <p class="mt-1 text-sm text-slate-600">{item.comment}</p>
          </li>
        {/each}
      </ul>
    {/if}

    {#if $courseRole === "student"}
      <form class="mt-6 space-y-3 border-t border-slate-100 pt-4" onsubmit={handleRate}>
        <div>
          <label for="rating-value" class="mb-1 block text-sm font-medium text-slate-700">Nilai</label>
          <select id="rating-value" bind:value={rating}
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
            {#each [1, 2, 3, 4, 5] as n}
              <option {...{ value: n }}>{n}</option>
            {/each}
          </select>
        </div>
        <div>
          <label for="rating-comment" class="mb-1 block text-sm font-medium text-slate-700">Komentar</label>
          <textarea id="rating-comment" rows="3" bind:value={$comment}
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"></textarea>
        </div>
        <button type="submit" class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">Kirim Rating</button>
      </form>
    {/if}
  </section>

  {#if showChange}
    <ChangeModal course={c} onClose={() => (showChange = false)} />
  {/if}
  {#if showCover}
    <ChangeCoverModal courseId={c.id} onClose={() => (showCover = false)} />
  {/if}
  {#if showContent}
    <ContentModal courseId={c.id} content={editingContent} onClose={() => (showContent = false)} />
  {/if}
{:else}
  <p class="text-sm text-slate-500">Kursus tidak ditemukan.</p>
{/if}
