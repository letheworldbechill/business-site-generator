/**
 * @sb/utils - Utility-Funktionen für Smooth Builder
 * 
 * Dieses Modul stellt wiederverwendbare Hilfsfunktionen bereit,
 * die von allen anderen Modulen genutzt werden können.
 */

// ============================================================================
// OBJECT UTILITIES
// ============================================================================

/**
 * Prüft, ob ein Wert ein einfaches Objekt ist (kein Array, null, etc.)
 */
export function isObject(val: unknown): val is Record<string, unknown> {
  return val !== null && typeof val === 'object' && !Array.isArray(val);
}

/**
 * Tiefe Kopie eines Objekts
 * Verwendet structuredClone wenn verfügbar, sonst JSON-Fallback
 */
export function deepClone<T>(value: T): T {
  try {
    if (typeof structuredClone === 'function') {
      return structuredClone(value);
    }
  } catch {
    // Fallback
  }
  return JSON.parse(JSON.stringify(value));
}

/**
 * Rekursives Merging von Objekten
 * Arrays werden ersetzt, nicht gemerged
 */
export function deepMerge<T extends Record<string, unknown>>(
  target: T,
  source: Partial<T>
): T {
  const out = Array.isArray(target) ? [...target] : { ...target };
  
  if (!source) return out as T;
  
  for (const key of Object.keys(source) as Array<keyof T>) {
    const s = source[key];
    const t = out[key as keyof typeof out];
    
    if (isObject(t) && isObject(s)) {
      (out as Record<string, unknown>)[key as string] = deepMerge(
        t as Record<string, unknown>,
        s as Record<string, unknown>
      );
    } else {
      (out as Record<string, unknown>)[key as string] = Array.isArray(s) ? [...s] : s;
    }
  }
  
  return out as T;
}

/**
 * Deterministische JSON-Serialisierung (sortierte Keys)
 */
export function stableStringify(obj: unknown): string {
  const seen = new WeakSet();
  
  return JSON.stringify(obj, function(_k, v) {
    if (isObject(v)) {
      if (seen.has(v)) return undefined;
      seen.add(v);
      return Object.keys(v).sort().reduce((acc, key) => {
        acc[key] = v[key];
        return acc;
      }, {} as Record<string, unknown>);
    }
    return v;
  });
}

/**
 * Strukturelle Gleichheit zweier Werte
 */
export function isEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  return stableStringify(a) === stableStringify(b);
}

/**
 * Wert aus verschachteltem Objekt per Pfad abrufen
 */
export function getByPath<T = unknown>(
  obj: unknown,
  path: string | string[],
  fallback?: T
): T | undefined {
  if (!obj) return fallback;
  
  const parts = Array.isArray(path) ? path : path.split('.');
  let cur: unknown = obj;
  
  for (const p of parts) {
    if (cur == null) return fallback;
    cur = (cur as Record<string, unknown>)[p];
  }
  
  return (cur === undefined ? fallback : cur) as T;
}

/**
 * Wert in verschachteltem Objekt per Pfad setzen (immutabel)
 */
export function setByPath<T extends Record<string, unknown>>(
  obj: T,
  path: string | string[],
  value: unknown
): T {
  const parts = Array.isArray(path) ? path : path.split('.');
  const out = Array.isArray(obj) ? [...obj] : { ...obj };
  let cur: Record<string, unknown> = out as Record<string, unknown>;
  
  for (let i = 0; i < parts.length; i++) {
    const key = parts[i];
    const isLast = i === parts.length - 1;
    const next = cur[key];
    
    if (isLast) {
      cur[key] = value;
    } else {
      const nextObj = isObject(next) ? { ...next } : {};
      cur[key] = nextObj;
      cur = nextObj;
    }
  }
  
  return out as T;
}

/**
 * Wählt bestimmte Keys aus einem Objekt
 */
export function pick<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const out = {} as Pick<T, K>;
  for (const k of keys) {
    if (Object.prototype.hasOwnProperty.call(obj, k)) {
      out[k] = obj[k];
    }
  }
  return out;
}

/**
 * Entfernt bestimmte Keys aus einem Objekt
 */
export function omit<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const out = { ...obj } as Omit<T, K>;
  for (const k of keys) {
    delete (out as Record<string, unknown>)[k as string];
  }
  return out;
}

/**
 * Sicheres JSON-Parsing mit Fallback
 */
export function safeJsonParse<T>(str: string, fallback: T): T {
  try {
    return JSON.parse(str) as T;
  } catch {
    return fallback;
  }
}

// ============================================================================
// STRING UTILITIES
// ============================================================================

/**
 * HTML-Escaping
 */
export function escapeHtml(str: string | null | undefined): string {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * URL-freundlicher Slug
 */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

/**
 * Generiert eine eindeutige ID
 */
export function uid(prefix = ''): string {
  const hasCrypto = typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function';
  
  if (hasCrypto) {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
    const id = `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
    return prefix ? `${prefix}-${id}` : id;
  }
  
  return (prefix ? prefix + '-' : '') + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

/**
 * Dateiname-sicherer String
 */
export function filenameSafe(name: string): string {
  const n = name.trim().toLowerCase();
  return (n || 'website')
    .replace(/[\s]+/g, '-')
    .replace(/[^a-z0-9\-]+/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'website';
}

// ============================================================================
// COLOR UTILITIES
// ============================================================================

/**
 * Normalisiert Hex-Farbe zu 6-stelligem Format
 */
export function normalizeHex(hex: string): string | null {
  let h = hex.trim();
  if (!h) return null;
  if (h[0] !== '#') h = '#' + h;
  if (h.length === 4) {
    h = '#' + h[1] + h[1] + h[2] + h[2] + h[3] + h[3];
  }
  if (!/^#[0-9a-fA-F]{6}$/.test(h)) return null;
  return h.toLowerCase();
}

/**
 * Hex zu RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const h = normalizeHex(hex);
  if (!h) return null;
  const int = parseInt(h.slice(1), 16);
  return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 };
}

/**
 * WCAG relative Luminanz
 */
export function luminance({ r, g, b }: { r: number; g: number; b: number }): number {
  const srgb = [r, g, b].map(v => {
    const x = v / 255;
    return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
}

/**
 * WCAG Kontrastverhältnis
 */
export function contrastRatio(fgHex: string, bgHex: string): number | null {
  const fg = hexToRgb(fgHex);
  const bg = hexToRgb(bgHex);
  if (!fg || !bg) return null;
  const L1 = luminance(fg);
  const L2 = luminance(bg);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}

// ============================================================================
// TIMING UTILITIES
// ============================================================================

/**
 * Debounce-Funktion mit cancel und flush
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  wait = 200
): T & { cancel: () => void; flush: () => void } {
  let t: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;
  let lastThis: unknown = null;
  
  function debounced(this: unknown, ...args: Parameters<T>): void {
    lastArgs = args;
    lastThis = this;
    if (t) clearTimeout(t);
    t = setTimeout(() => {
      t = null;
      fn.apply(lastThis, lastArgs!);
    }, wait);
  }
  
  debounced.cancel = () => {
    if (t) clearTimeout(t);
    t = null;
    lastArgs = null;
    lastThis = null;
  };
  
  debounced.flush = () => {
    if (!t || !lastArgs) return;
    clearTimeout(t);
    t = null;
    fn.apply(lastThis, lastArgs);
  };
  
  return debounced as T & { cancel: () => void; flush: () => void };
}

/**
 * Throttle-Funktion
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  limit = 100
): T {
  let inThrottle = false;
  let queued: { args: Parameters<T> } | null = null;
  let lastThis: unknown = null;
  
  function run() {
    if (!queued) return;
    const { args } = queued;
    queued = null;
    fn.apply(lastThis, args);
    inThrottle = true;
    setTimeout(() => {
      inThrottle = false;
      run();
    }, limit);
  }
  
  return function throttled(this: unknown, ...args: Parameters<T>): void {
    lastThis = this;
    if (!inThrottle) {
      fn.apply(lastThis, args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
        run();
      }, limit);
    } else {
      queued = { args };
    }
  } as T;
}

// ============================================================================
// FILE UTILITIES
// ============================================================================

/**
 * Liest Datei als DataURL
 */
export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result || ''));
    r.onerror = () => reject(r.error || new Error('FileReader failed'));
    r.readAsDataURL(file);
  });
}

/**
 * Liest Datei als Text
 */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result || ''));
    r.onerror = () => reject(r.error || new Error('FileReader failed'));
    r.readAsText(file);
  });
}

/**
 * Download eines Blobs
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const a = document.createElement('a');
  const url = URL.createObjectURL(blob);
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(url);
    a.remove();
  }, 0);
}

/**
 * Download eines Text-Strings
 */
export function downloadText(text: string, filename: string, mime = 'text/plain;charset=utf-8'): void {
  const blob = new Blob([text], { type: mime });
  downloadBlob(blob, filename);
}

/**
 * Konvertiert DataURL zu Bytes
 */
export function dataUrlToBytes(dataUrl: string): { mime: string; bytes: Uint8Array } | null {
  const m = /^data:([^;]+);base64,(.*)$/i.exec(dataUrl);
  if (!m) return null;
  const mime = m[1];
  const b64 = m[2];
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return { mime, bytes };
}

/**
 * Ermittelt Dateiendung aus MIME-Type
 */
export function guessExtFromMime(mime: string): string {
  if (!mime) return 'bin';
  if (mime.includes('png')) return 'png';
  if (mime.includes('jpeg') || mime.includes('jpg')) return 'jpg';
  if (mime.includes('webp')) return 'webp';
  if (mime.includes('gif')) return 'gif';
  if (mime.includes('svg')) return 'svg';
  return 'bin';
}

// ============================================================================
// NUMBER UTILITIES
// ============================================================================

/**
 * Clampt eine Zahl zwischen min und max
 */
export function clamp(n: number, min: number, max: number): number {
  const x = Number(n);
  return Number.isFinite(x) ? Math.min(max, Math.max(min, x)) : min;
}

/**
 * Rundet auf 8px-Raster
 */
export function roundTo8px(n: number): number {
  return Math.round(n / 8) * 8;
}

/**
 * Formatiert Bytes als menschenlesbaren String
 */
export function formatBytes(bytes: number): string {
  const n = Number(bytes);
  if (!Number.isFinite(n) || n <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(units.length - 1, Math.floor(Math.log(n) / Math.log(1024)));
  const v = n / Math.pow(1024, i);
  return `${v.toFixed(v < 10 && i > 0 ? 1 : 0)} ${units[i]}`;
}

// ============================================================================
// PLATFORM UTILITIES
// ============================================================================

/**
 * Prüft, ob der User auf einem Mac ist
 */
export function isMac(): boolean {
  return /Mac|iPhone|iPad|iPod/i.test(navigator.platform || '');
}

/**
 * Prüft, ob der User Reduced Motion bevorzugt
 */
export function prefersReducedMotion(): boolean {
  try {
    return matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  } catch {
    return false;
  }
}

/**
 * No-operation Funktion
 */
export function noop(): void {
  // Intentionally empty
}
