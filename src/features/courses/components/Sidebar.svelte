<script lang="ts">
  import { page } from "$app/state";
  import { BookOpen, User, Users, X } from "lucide-svelte";

  let { open, onClose }: { open: boolean; onClose: () => void } = $props();

  const items = [
    { href: "/", label: "Semua Kursus", icon: BookOpen, match: (p: string) => p === "/" || p.startsWith("/courses") },
    { href: "/users", label: "Pengguna", icon: Users, match: (p: string) => p.startsWith("/users") },
    { href: "/profile", label: "Profil", icon: User, match: (p: string) => p.startsWith("/profile") },
  ];

  const path = $derived(page.url.pathname);
</script>

<aside data-testid="sidebar"
  class="fixed bottom-0 left-0 top-16 z-20 w-64 border-r border-slate-200 bg-white p-4 lg:block {open ? 'block' : 'hidden'}">
  <div class="mb-2 flex justify-end lg:hidden">
    <button type="button" aria-label="Tutup menu" onclick={onClose} class="rounded-lg p-1 text-slate-500 hover:bg-slate-100">
      <X size={18} />
    </button>
  </div>
  <nav class="space-y-1">
    {#each items as item (item.href)}
      {@const active = item.match(path)}
      <a href={item.href} onclick={onClose} aria-current={active ? "page" : undefined}
        class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium {active ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}">
        <item.icon size={18} />
        {String(item.label)}
      </a>
    {/each}
  </nav>
</aside>
