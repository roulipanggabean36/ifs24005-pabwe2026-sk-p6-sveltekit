<script lang="ts">
  import type { Snippet } from "svelte";
  import { GraduationCap } from "lucide-svelte";
  import AuthSessionRedirect from "../pages/AuthSessionRedirect.svelte";

  let { children }: { children: Snippet } = $props();
</script>

<AuthSessionRedirect />
<div class="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-slate-50 to-sky-50 p-4">
  <div class="w-full max-w-md">
    <div class="mb-6 text-center">
      <span class="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg">
        <GraduationCap size={30} />
      </span>
      <h1 class="text-2xl font-extrabold text-slate-900">Delcom Courses</h1>
      <p class="mt-1 text-sm text-slate-500">
        Belajar pemrograman lewat kursus video yang dibuat oleh sesama pengguna Delcom.
      </p>
    </div>
    <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {@render children()}
    </div>
  </div>
</div>
