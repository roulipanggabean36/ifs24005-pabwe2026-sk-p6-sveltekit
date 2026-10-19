<script lang="ts">
  import { onMount } from "svelte";
  import { resolveAssetUrl } from "../../../helpers/toolsHelper";
  import { asyncLoadUsers, isUsersLoading, users } from "../states/usersStore";

  onMount(() => {
    asyncLoadUsers();
  });
</script>

<h1 class="mb-1 text-2xl font-extrabold text-slate-900">Pengguna</h1>
<p class="mb-6 text-sm text-slate-500">Daftar pengguna yang terdaftar di Delcom.</p>

{#if $isUsersLoading}
  <p role="status" class="text-sm text-slate-500">Memuat pengguna...</p>
{:else if $users.length === 0}
  <p class="text-sm text-slate-500">Belum ada pengguna.</p>
{:else}
  <ul class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
    {#each $users as user (user.id)}
      <li class="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <img src={resolveAssetUrl(user.photo)} alt={`Foto ${user.name}`} class="h-12 w-12 rounded-full object-cover" />
        <div class="min-w-0">
          <p class="truncate font-semibold text-slate-900">{user.name}</p>
          <p class="truncate text-sm text-slate-500">{user.email}</p>
        </div>
      </li>
    {/each}
  </ul>
{/if}
