<script lang="ts">
  import { onMount } from "svelte";
  import { GraduationCap, Plus, Search, Trash2, Users, Video } from "lucide-svelte";
  import { useInput } from "../../../hooks/useInput";
  import { formatRating, resolveAssetUrl } from "../../../helpers/toolsHelper";
  import { profileId } from "../../auth/states/authStore";
  import AddModal from "../modals/AddModal.svelte";
  import {
    asyncDeleteAllCourses,
    asyncDeleteCourse,
    asyncLoadCourses,
    courses,
    isCoursesLoading,
  } from "../states/coursesStore";

  const { value: search } = useInput("");
  let onlyMine = $state(false);
  let showAdd = $state(false);

  const filtered = $derived(
    $courses.filter(
      (item) =>
        item.title.toLowerCase().includes($search.toLowerCase()) &&
        (!onlyMine || item.user_id === $profileId)
    )
  );

  onMount(() => {
    asyncLoadCourses();
  });
</script>

<div class="mb-6 flex flex-wrap items-center justify-between gap-3">
  <div>
    <h1 class="text-2xl font-extrabold text-slate-900">Semua Kursus</h1>
    <p class="text-sm text-slate-500">Jelajahi kursus video dan kelola kursus milik Anda.</p>
  </div>
  <div class="flex gap-2">
    <button type="button" onclick={() => (showAdd = true)}
      class="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
      <Plus size={16} /> Tambah Kursus
    </button>
    <button type="button" onclick={asyncDeleteAllCourses}
      class="inline-flex items-center gap-2 rounded-lg border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50">
      <Trash2 size={16} /> Hapus Semua
    </button>
  </div>
</div>

<div class="mb-6 flex flex-wrap items-center gap-4">
  <div class="relative min-w-60 flex-1">
    <span class="pointer-events-none absolute left-3 top-2.5 text-slate-400"><Search size={16} /></span>
    <label for="course-search" class="sr-only">Cari kursus</label>
    <input id="course-search" type="search" placeholder="Cari kursus..." bind:value={$search}
      class="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
  </div>
  <label class="flex items-center gap-2 text-sm text-slate-700">
    <input type="checkbox" bind:checked={onlyMine} class="h-4 w-4 rounded border-slate-300" />
    Kursus milik saya
  </label>
</div>

{#if $isCoursesLoading}
  <p role="status" class="text-sm text-slate-500">Memuat kursus...</p>
{:else if filtered.length === 0}
  <p class="text-sm text-slate-500">Belum ada kursus yang cocok.</p>
{:else}
  <ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {#each filtered as item (item.id)}
      <li class="relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <a href={`/courses/${item.id}`} class="block">
          {#if item.cover}
            <img src={resolveAssetUrl(item.cover)} alt={`Sampul ${item.title}`} class="h-36 w-full object-cover" />
          {:else}
            <div class="flex h-36 w-full items-center justify-center bg-indigo-50 text-indigo-400"><GraduationCap size={40} /></div>
          {/if}
          <div class="p-4">
            <h2 class="font-bold text-slate-900">{item.title}</h2>
            <p class="mt-1 line-clamp-2 text-sm text-slate-500">{item.description}</p>
            <p class="mt-2 text-xs text-slate-500">Oleh {String(item.author.name)}</p>
            <div class="mt-3 flex items-center gap-4 text-xs text-slate-600">
              <span class="inline-flex items-center gap-1"><Users size={14} /> {String(item.students.length)} peserta</span>
              <span class="inline-flex items-center gap-1"><Video size={14} /> {String(item.total_contents)} konten</span>
            </div>
            <p class="mt-2 text-xs font-semibold text-amber-600">{formatRating(item.avg_ratings)}</p>
          </div>
        </a>
        {#if item.user_id === $profileId}
          <button type="button" aria-label={`Hapus ${item.title}`} onclick={() => asyncDeleteCourse(item.id)}
            class="absolute right-2 top-2 rounded-lg bg-white/90 p-2 text-rose-600 shadow hover:bg-white">
            <Trash2 size={16} />
          </button>
        {/if}
      </li>
    {/each}
  </ul>
{/if}

{#if showAdd}
  <AddModal onClose={() => (showAdd = false)} />
{/if}
