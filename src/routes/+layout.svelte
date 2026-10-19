<script lang="ts">
  import "../index.css";
  import type { Snippet } from "svelte";
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { asyncPreloadProfile } from "../features/auth/states/authStore";
  import CourseLayout from "../features/courses/layouts/CourseLayout.svelte";

  let { children }: { children: Snippet } = $props();
  let ready = $state(false);
  const isAuthRoute = $derived(page.url.pathname.startsWith("/auth"));

  onMount(async () => {
    const loggedIn = await asyncPreloadProfile();
    if (!loggedIn && !isAuthRoute) await goto("/auth/login");
    ready = true;
  });
</script>

{#if ready}
  {#if isAuthRoute}
    {@render children()}
  {:else}
    <CourseLayout>{@render children()}</CourseLayout>
  {/if}
{/if}
