import { writable } from "svelte/store";

export function useInput(initial = "") {
  const value = writable(initial);
  const onChange = (event: Event) => value.set((event.target as HTMLInputElement).value);
  const reset = () => value.set(initial);
  return { value, onChange, reset };
}
