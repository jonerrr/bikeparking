import { persisted } from 'svelte-persisted-store';

export const center = persisted('center', [-73.95, 40.69]);
export const zoom = persisted('zoom', 12.5);
export const invisibleLayers = persisted<string[]>('invisibleLayers', []);
