// Saved-views widget: a Save and a Load button that drop into the header
// actions slot (left of the settings gear). Save captures the live view under a
// typed name (with an inline overwrite confirm — no native window.prompt, which
// sandboxed iframes block); Load lists saved views, applies one on click, and
// deletes one via a per-row ×. Persistence lives in viewstore.ts; the host wires
// the two callbacks (read current view / apply a loaded view). DOM-bound; pairs
// with savedviews.css.

import './savedviews.css';
import { listViews, saveView, deleteView } from '../helpers/viewstore.js';
import type { ChartState, SavedView } from '../types.js';

export interface SavedViewsCallbacks {
  // Read the host's current tab + the active chart's full state.
  getCurrent(): { tab: SavedView['tab']; state: ChartState };
  // Switch to a loaded view's tab and seed its chart with the saved state.
  apply(view: SavedView): void;
}

export function mountSavedViews(host: HTMLElement, cb: SavedViewsCallbacks): void {
  // Each button owns a popover; opening one closes the others (and the document
  // click / Escape closes all). Closers are registered as each island mounts.
  const closers: Array<(open: boolean) => void> = [];

  function makeIsland(title: string, svg: string, onOpen?: () => void): { popover: HTMLDivElement; setOpen: (open: boolean) => void } {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'chart-settings-btn chart-sv-btn'; // reuse the gear's island look
    btn.title = title;
    btn.setAttribute('aria-label', title);
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = svg;

    const popover = document.createElement('div');
    popover.className = 'chart-sv-popover';

    const setOpen = (open: boolean): void => {
      popover.classList.toggle('is-open', open);
      btn.classList.toggle('is-active', open);
      btn.setAttribute('aria-expanded', String(open));
    };
    closers.push(setOpen);

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const willOpen = !popover.classList.contains('is-open');
      for (const c of closers) c(false);
      setOpen(willOpen);
      if (willOpen) onOpen?.();
    });
    popover.addEventListener('click', (e) => e.stopPropagation());

    host.append(btn, popover);
    return { popover, setOpen };
  }

  // --- Save -----------------------------------------------------------------
  const save = makeIsland('Save view', SAVE_SVG, () => name.focus());
  const form = document.createElement('div');
  form.className = 'chart-sv-form';
  const name = document.createElement('input');
  name.type = 'text';
  name.className = 'chart-sv-name';
  name.placeholder = 'View name…';
  const confirm = document.createElement('button');
  confirm.type = 'button';
  confirm.className = 'chart-sv-confirm';
  confirm.textContent = 'Save';
  const msg = document.createElement('div');
  msg.className = 'chart-sv-msg';
  form.append(name, confirm, msg);
  save.popover.append(form);

  let pendingOverwrite = ''; // the name the next click will overwrite, once confirmed

  const resetForm = (): void => {
    name.value = '';
    msg.textContent = '';
    confirm.textContent = 'Save';
    pendingOverwrite = '';
  };

  const commit = (viewName: string): void => {
    const { tab, state } = cb.getCurrent();
    saveView({ name: viewName, tab, state });
    resetForm();
    save.setOpen(false);
  };

  confirm.addEventListener('click', () => {
    const n = name.value.trim();
    if (!n) {
      name.focus();
      return;
    }
    if (pendingOverwrite === n) {
      commit(n); // second click on a known name = confirmed overwrite (decision F)
      return;
    }
    if (listViews().some((v) => v.name === n)) {
      pendingOverwrite = n;
      confirm.textContent = 'Overwrite?';
      msg.textContent = `"${n}" already exists.`;
      return;
    }
    commit(n);
  });
  name.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') confirm.click();
  });
  name.addEventListener('input', () => {
    if (pendingOverwrite) resetPending(); // editing the name cancels a staged overwrite
  });
  const resetPending = (): void => {
    pendingOverwrite = '';
    confirm.textContent = 'Save';
    msg.textContent = '';
  };

  // --- Load -----------------------------------------------------------------
  const load = makeIsland('Load view', LOAD_SVG, () => renderList());
  const list = document.createElement('div');
  list.className = 'chart-sv-list';
  load.popover.append(list);

  function renderList(): void {
    const views = listViews();
    list.replaceChildren();
    if (views.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'chart-sv-empty';
      empty.textContent = 'No saved views yet.';
      list.append(empty);
      return;
    }
    for (const v of views) {
      const row = document.createElement('div');
      row.className = 'chart-sv-row';

      const open = document.createElement('button');
      open.type = 'button';
      open.className = 'chart-sv-load';
      open.textContent = v.name;
      open.title = v.tab === 'tracks' ? 'Campaign view' : 'World view';
      open.addEventListener('click', () => {
        cb.apply(v);
        load.setOpen(false);
      });

      const del = document.createElement('button');
      del.type = 'button';
      del.className = 'chart-sv-del';
      del.setAttribute('aria-label', `Delete ${v.name}`);
      del.textContent = '×';
      del.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteView(v.name); // decision G
        renderList();
      });

      row.append(open, del);
      list.append(row);
    }
  }

  document.addEventListener('click', () => {
    for (const c of closers) c(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') for (const c of closers) c(false);
  });
}

// Inline SVGs so the artifact stays dependency-free (no icon font / asset).
const SAVE_SVG = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>`;
const LOAD_SVG = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>`;
