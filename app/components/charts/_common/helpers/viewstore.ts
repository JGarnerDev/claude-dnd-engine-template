// localStorage CRUD for saved views. Persists `{ version, views }` under one
// key; the version guards a future migration. Every read/write is wrapped so a
// missing/corrupt payload or a storage exception (private mode, quota) degrades
// to an empty list / no-op rather than throwing — the artifact is a single
// offline HTML file and must never break on storage. No DOM beyond
// `localStorage`, so it's unit-testable with a stub.

import type { SavedView } from '../types.js';
import { applyDefaults } from './viewstate.js';

const KEY = 'campaign:saved-views:v1';
const VERSION = 1;

// Coerce one raw entry into a valid SavedView, or null if it can't be salvaged.
function toView(raw: unknown): SavedView | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.name !== 'string' || !r.name) return null;
  const tab = r.tab === 'tracks' ? 'tracks' : 'world'; // unknown tab -> 'world'
  return { name: r.name, tab, state: applyDefaults(r.state as Parameters<typeof applyDefaults>[0]) };
}

// Read the stored list. Returns [] on absent/corrupt data or any thrown access.
export function listViews(): SavedView[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as { views?: unknown };
    if (!parsed || !Array.isArray(parsed.views)) return [];
    return parsed.views.map(toView).filter((v): v is SavedView => v !== null);
  } catch {
    return [];
  }
}

// Persist the full list. Swallows write failures (quota/private mode).
function writeViews(views: SavedView[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify({ version: VERSION, views }));
  } catch {
    /* fail soft — nothing persisted, in-memory UI still reflects the change */
  }
}

// Insert or replace by name (case-sensitive). Overwrite (decision F) replaces the
// existing entry in place, preserving its position; a new name appends.
export function saveView(view: SavedView): SavedView[] {
  const views = listViews();
  const i = views.findIndex((v) => v.name === view.name);
  if (i >= 0) views[i] = view;
  else views.push(view);
  writeViews(views);
  return views;
}

// Remove by name (decision G). No-op if absent. Returns the new list.
export function deleteView(name: string): SavedView[] {
  const views = listViews().filter((v) => v.name !== name);
  writeViews(views);
  return views;
}
