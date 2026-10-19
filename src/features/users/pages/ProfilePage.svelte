<script lang="ts">
  import { get } from "svelte/store";
  import { Camera } from "lucide-svelte";
  import { useInput } from "../../../hooks/useInput";
  import { resolveAssetUrl, showErrorDialog } from "../../../helpers/toolsHelper";
  import { authProfile } from "../../auth/states/authStore";
  import {
    asyncChangePassword,
    asyncChangePhoto,
    asyncUpdateProfile,
    isMutatingPassword,
    isMutatingPhoto,
    isMutatingProfile,
  } from "../states/usersStore";

  const initial = get(authProfile);
  const { value: name } = useInput(initial ? initial.name : "");
  const { value: email } = useInput(initial ? initial.email : "");
  const { value: oldPassword, reset: resetOld } = useInput("");
  const { value: newPassword, reset: resetNew } = useInput("");
  const { value: confirmPassword, reset: resetConfirm } = useInput("");

  async function handleProfile(event: SubmitEvent) {
    event.preventDefault();
    await asyncUpdateProfile($name, $email);
  }

  async function handlePhoto(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files![0];
    if (file) await asyncChangePhoto(file);
  }

  async function handlePassword(event: SubmitEvent) {
    event.preventDefault();
    if ($newPassword !== $confirmPassword) {
      await showErrorDialog("Konfirmasi kata sandi baru tidak sama.");
      return;
    }
    if (await asyncChangePassword($oldPassword, $newPassword)) {
      resetOld();
      resetNew();
      resetConfirm();
    }
  }
</script>

<h1 class="mb-6 text-2xl font-extrabold text-slate-900">Profil</h1>

<div class="grid gap-6 lg:grid-cols-3">
  <section class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
    <h2 class="mb-4 font-bold text-slate-900">Foto Profil</h2>
    {#if $authProfile}
      <img src={resolveAssetUrl($authProfile.photo)} alt={`Foto ${$authProfile.name}`}
        class="mb-4 h-28 w-28 rounded-full object-cover" />
    {/if}
    <label for="profile-photo"
      class="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
      <Camera size={16} /> Foto Profil
    </label>
    <input id="profile-photo" type="file" accept="image/*" class="sr-only" disabled={$isMutatingPhoto}
      onchange={handlePhoto} />
  </section>

  <section class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
    <h2 class="mb-4 font-bold text-slate-900">Data Diri</h2>
    <form class="space-y-4" onsubmit={handleProfile}>
      <div>
        <label for="profile-name" class="mb-1 block text-sm font-medium text-slate-700">Nama</label>
        <input id="profile-name" type="text" required bind:value={$name}
          class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
      </div>
      <div>
        <label for="profile-email" class="mb-1 block text-sm font-medium text-slate-700">Email</label>
        <input id="profile-email" type="email" required bind:value={$email}
          class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
      </div>
      <button type="submit" disabled={$isMutatingProfile}
        class="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">
        Simpan Data
      </button>
    </form>
  </section>

  <section class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
    <h2 class="mb-4 font-bold text-slate-900">Kata Sandi</h2>
    <form class="space-y-4" onsubmit={handlePassword}>
      <div>
        <label for="profile-old" class="mb-1 block text-sm font-medium text-slate-700">Kata Sandi Lama</label>
        <input id="profile-old" type="password" required bind:value={$oldPassword}
          class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
      </div>
      <div>
        <label for="profile-new" class="mb-1 block text-sm font-medium text-slate-700">Kata Sandi Baru</label>
        <input id="profile-new" type="password" required bind:value={$newPassword}
          class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
      </div>
      <div>
        <label for="profile-confirm" class="mb-1 block text-sm font-medium text-slate-700">Konfirmasi Kata Sandi Baru</label>
        <input id="profile-confirm" type="password" required bind:value={$confirmPassword}
          class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
      </div>
      <button type="submit" disabled={$isMutatingPassword}
        class="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">
        Ubah Kata Sandi
      </button>
    </form>
  </section>
</div>
