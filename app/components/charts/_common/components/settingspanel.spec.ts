// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { mountSettingsPanel } from './settingspanel.js';

describe('mountSettingsPanel', () => {
  let host: HTMLDivElement;
  const section = (label: string) => {
    const node = document.createElement('div');
    node.className = `sec-${label}`;
    return { label, node };
  };

  beforeEach(() => {
    host = document.createElement('div');
    document.body.appendChild(host);
  });

  it('mounts a gear button and a (initially empty, closed) panel', () => {
    mountSettingsPanel(host);
    expect(host.querySelector('.chart-settings-btn')).toBeTruthy();
    const panel = host.querySelector('.chart-settings-panel')!;
    expect(panel).toBeTruthy();
    expect(panel.classList.contains('is-open')).toBe(false);
    expect(host.querySelector('.chart-settings-btn')!.getAttribute('aria-expanded')).toBe('false');
  });

  it('setSections hosts the sections and relocates their nodes into the panel', () => {
    const handle = mountSettingsPanel(host);
    const zoom = section('Zoom');
    handle.setSections([zoom, section('Filter')]);
    expect([...host.querySelectorAll('.chart-settings-grouplabel')].map((g) => g.textContent)).toEqual(['Zoom', 'Filter']);
    expect(host.querySelector('.chart-settings-panel .sec-Zoom')).toBe(zoom.node);
  });

  it('setSections replaces prior sections', () => {
    const handle = mountSettingsPanel(host);
    handle.setSections([section('Zoom')]);
    handle.setSections([section('Filter')]);
    expect(host.querySelector('.sec-Zoom')).toBeFalsy();
    expect(host.querySelector('.sec-Filter')).toBeTruthy();
  });

  it('toggles open on the gear click', () => {
    mountSettingsPanel(host);
    const btn = host.querySelector<HTMLButtonElement>('.chart-settings-btn')!;
    const panel = host.querySelector('.chart-settings-panel')!;
    btn.click();
    expect(panel.classList.contains('is-open')).toBe(true);
    expect(btn.getAttribute('aria-expanded')).toBe('true');
    btn.click();
    expect(panel.classList.contains('is-open')).toBe(false);
  });

  it('closes on an outside (document) click but stays open on a panel click', () => {
    const handle = mountSettingsPanel(host);
    handle.setSections([section('Zoom')]);
    const btn = host.querySelector<HTMLButtonElement>('.chart-settings-btn')!;
    const panel = host.querySelector<HTMLDivElement>('.chart-settings-panel')!;
    btn.click();
    panel.click(); // inside — stopPropagation keeps it open
    expect(panel.classList.contains('is-open')).toBe(true);
    document.body.click(); // outside
    expect(panel.classList.contains('is-open')).toBe(false);
  });

  it('closes on Escape', () => {
    mountSettingsPanel(host);
    host.querySelector<HTMLButtonElement>('.chart-settings-btn')!.click();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(host.querySelector('.chart-settings-panel')!.classList.contains('is-open')).toBe(false);
  });
});
