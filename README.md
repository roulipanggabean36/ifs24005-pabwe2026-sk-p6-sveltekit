# Delcom Courses (ifs24005-pabwe2026-sk-p6-sveltekit)

SvelteKit 3 + TypeScript + Svelte 5 + Tailwind v4, adapter-bun. Data dari Delcom Open API (Auth, Users, Courses).

```bash
bun install
bun run test:coverage   # threshold 100%
bun run dev             # http://localhost:3005
bun run build && bun start
```

Gunakan `bun run test`, bukan `bun test`.

## Struktur
- `src/routes` — rute SvelteKit (SPA, `ssr = false`)
- `src/features/{auth,users,courses,common}` — api, states, pages, layouts, components, modals
- `src/helpers`, `src/hooks` — apiHelper, toolsHelper, useInput
- Tes berdampingan dengan berkasnya (`*.test.ts`), tes rute ada di `src/App.test.ts`

## Endpoint yang dipakai
Auth: `/auth/login`, `/auth/register`, `/auth/logout`. Users: `/users`, `/users/me`, `/users/me/photo`, `/users/password`.
Courses: `/courses`, `/courses/:id`, `/courses/:id/cover`, `/courses/:id/students`, `/courses/:id/students/ratings`,
`/courses/:id/contents`, `/courses/-/contents/:id`, `/courses/-/contents/:id/learns`.
