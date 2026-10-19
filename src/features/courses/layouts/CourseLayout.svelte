<script lang="ts">
  import type { Snippet } from "svelte";
  import Navbar from "../components/Navbar.svelte";
  import Sidebar from "../components/Sidebar.svelte";

  let { children }: { children: Snippet } = $props();
  let sidebarOpen = $state(false);
</script>

<div class="min-h-screen">
  <Navbar onToggleSidebar={() => (sidebarOpen = !sidebarOpen)} />
  <Sidebar open={sidebarOpen} onClose={() => (sidebarOpen = false)} />
  <main class="pt-16 lg:pl-64">
    <div class="mx-auto max-w-6xl p-4 sm:p-6">
      {@render children()}
    </div>
  </main>
</div>
