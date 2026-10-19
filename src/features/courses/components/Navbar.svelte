<script lang="ts">
  import { goto } from "$app/navigation";
  import { GraduationCap, LogOut, Menu } from "lucide-svelte";
  import { resolveAssetUrl } from "../../../helpers/toolsHelper";
  import { asyncLogout, authProfile } from "../../auth/states/authStore";

  let { onToggleSidebar }: { onToggleSidebar: () => void } = $props();

  async function handleLogout() {
    if (await asyncLogout()) await goto("/auth/login");
  }
</script>

<header class="fixed inset-x-0 top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4">
  <div class="flex items-center gap-3">
    <button type="button" aria-label="Buka menu" onclick={onToggleSidebar}
      class="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden">
      <Menu size={20} />
    </button>
    <a href="/" class="flex items-center gap-2 font-extrabold text-slate-900">
      <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white">
        <GraduationCap size={20} />
      </span>
      Delcom Courses
    </a>
  </div>
  <div class="flex items-center gap-3">
    {#if $authProfile}
      <a href="/profile" class="flex items-center gap-2 text-sm font-medium text-slate-700">
        <img src={resolveAssetUrl($authProfile.photo)} alt={$authProfile.name} class="h-8 w-8 rounded-full object-cover" />
        <span class="hidden sm:inline">{$authProfile.name}</span>
      </a>
    {/if}
    <button type="button" aria-label="Keluar" onclick={handleLogout}
      class="rounded-lg p-2 text-slate-600 hover:bg-slate-100">
      <LogOut size={18} />
    </button>
  </div>
</header>
