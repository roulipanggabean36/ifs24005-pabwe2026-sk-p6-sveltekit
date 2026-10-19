<script lang="ts">
  import { useInput } from "../../../hooks/useInput";
  import { asyncLogin, isAuthLoading } from "../states/authStore";

  const { value: email } = useInput("");
  const { value: password } = useInput("");

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    await asyncLogin($email, $password);
  }
</script>

<h2 class="mb-4 text-lg font-bold text-slate-900">Masuk</h2>
<form class="space-y-4" onsubmit={handleSubmit}>
  <div>
    <label for="login-email" class="mb-1 block text-sm font-medium text-slate-700">Email</label>
    <input id="login-email" type="email" required bind:value={$email}
      class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
  </div>
  <div>
    <label for="login-password" class="mb-1 block text-sm font-medium text-slate-700">Kata Sandi</label>
    <input id="login-password" type="password" required bind:value={$password}
      class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
  </div>
  <button type="submit" disabled={$isAuthLoading}
    class="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">
    Masuk
  </button>
</form>
<p class="mt-4 text-center text-sm text-slate-500">
  Belum punya akun?
  <a href="/auth/register" class="font-semibold text-indigo-600 hover:underline">Daftar</a>
</p>
