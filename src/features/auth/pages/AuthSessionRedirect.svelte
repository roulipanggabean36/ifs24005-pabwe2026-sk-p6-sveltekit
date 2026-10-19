<script lang="ts">
  import { goto } from "$app/navigation";
  import { sessionReady } from "../states/authStore";

  // Pengalihan hanya terjadi saat token, status login, dan profil sudah siap.
  $effect(() => {
    if ($sessionReady) goto("/");
  });
</script>
