<script lang="ts">
  import { goto } from "$app/navigation";
  import { useInput } from "../../../hooks/useInput";
  import { asyncRegister, isAuthLoading } from "../states/authStore";

  const { value: name } = useInput("");
  const { value: email } = useInput("");
  const { value: password } = useInput("");

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    if (await asyncRegister($name, $email, $password)) await goto("/auth/login");
  }
</script>

<h2 class="mb-4 text-lg font-bold text-slate-900">Daftar</h2>
<form class="space-y-4" onsubmit={handleSubmit}>
  <div>
    <label for="register-name" class="mb-1 block text-sm font-medium text-slate-700">Nama</label>
    <input id="register-name" type="text" required bind:value={$name}
      class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
  </div>
  <div>
    <label for="register-email" class="mb-1 block text-sm font-medium text-slate-700">Email</label>
    <input id="register-email" type="email" required bind:value={$email}
      class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
  </div>
  <div>
    <label for="register-password" class="mb-1 block text-sm font-medium text-slate-700">Kata Sandi</label>
    <input id="register-password" type="password" required bind:value={$password}
      class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
  </div>
  <button type="submit" disabled={$isAuthLoading}
    class="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">
    Daftar
  </button>
</form>
<p class="mt-4 text-center text-sm text-slate-500">
  Sudah punya akun?
  <a href="/auth/login" class="font-semibold text-indigo-600 hover:underline">Masuk</a>
</p>
