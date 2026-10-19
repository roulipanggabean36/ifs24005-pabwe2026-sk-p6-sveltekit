<script lang="ts">
  import { page } from "$app/state";
  import ContentPage from "../../../../../features/courses/pages/ContentPage.svelte";

  const courseId = $derived(page.params.courseId);
  const contentId = $derived(page.params.contentId);
</script>

{#key contentId}
  <ContentPage {courseId} {contentId} />
{/key}
