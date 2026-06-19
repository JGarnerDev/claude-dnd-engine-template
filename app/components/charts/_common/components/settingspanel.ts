// Floating settings panel (Excalidraw-style island). A gear button that sits in
// the page header (alongside the view tabs) toggles an overlay card hosting the
// chart controls that used to sit in-flow above the chart (zoom toolbar, filter
// bar) — so the chart canvas takes the full height. The host swaps the panel's
// contents per active view via the returned handle. DOM-bound; pairs with
// settingspanel.css.

import './settingspanel.css';

// One labelled group inside the panel (e.g. "Zoom" → the toolbar node).
export interface SettingsSection {
  label: string;
  node: HTMLElement;
}

// Handle returned to the host: setSections swaps what the panel shows (relocating
// the given control nodes into the panel) without rebuilding the gear/overlay, so
// the open/closed state survives a view switch.
export interface SettingsHandle {
  setSections(sections: SettingsSection[]): void;
}

// Mounts the gear + overlay into `host` (the header actions slot, which must be a
// positioning context — see settingspanel.css). The panel starts closed; the gear
// toggles it, and an outside click or Escape closes it.
export function mountSettingsPanel(host: HTMLElement): SettingsHandle {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'chart-settings-btn';
  btn.title = 'Settings';
  btn.setAttribute('aria-label', 'Settings');
  btn.setAttribute('aria-expanded', 'false');
  btn.innerHTML = GEAR_SVG;

  const panel = document.createElement('div');
  panel.className = 'chart-settings-panel';

  const setOpen = (open: boolean): void => {
    panel.classList.toggle('is-open', open);
    btn.classList.toggle('is-active', open);
    btn.setAttribute('aria-expanded', String(open));
  };

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    setOpen(!panel.classList.contains('is-open'));
  });

  // Outside click + Escape close. Clicks inside the panel keep it open.
  panel.addEventListener('click', (e) => e.stopPropagation());
  document.addEventListener('click', () => setOpen(false));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setOpen(false);
  });

  host.append(btn, panel);

  return {
    setSections(sections: SettingsSection[]): void {
      panel.replaceChildren();
      for (const { label, node } of sections) {
        const group = document.createElement('div');
        group.className = 'chart-settings-group';
        const head = document.createElement('div');
        head.className = 'chart-settings-grouplabel';
        head.textContent = label;
        group.append(head, node); // appendChild relocates the control out of the chart flow
        panel.appendChild(group);
      }
    },
  };
}

// Inline so the artifact stays dependency-free (no icon font / asset).
const GEAR_SVG = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`;
