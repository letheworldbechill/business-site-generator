/**
 * @sb/storage - Persistierung für Smooth Builder
 * 
 * Implementiert das Adapter-Pattern für verschiedene Storage-Backends:
 * - LocalStorage (Standard)
 * - IndexedDB (für größere Daten)
 * - Memory (für Tests)
 * - Erweiterbar für Cloud-Storage
 */

import { deepClone, safeJsonParse, debounce } from '@sb/utils';
import type { AppState, IStorageAdapter, StorageEnvelope } from '@sb/types';

// ============================================================================
// STORAGE CONSTANTS
// ============================================================================

export const STORAGE_KEY = 'sb5_state_v5';
export const STORAGE_META_KEY = 'sb5_state_v5_meta';
export const LEGACY_PREFIX = 'smooth_builder_';
export const CURRENT_VERSION = 5;

// ============================================================================
// LOCALSTORAGE ADAPTER
// ============================================================================

/**
 * LocalStorage Adapter
 * Standard-Adapter für Browser-basierte Persistierung
 */
export class LocalStorageAdapter implements IStorageAdapter {
  private key: string;
  private metaKey: string;
  
  constructor(key = STORAGE_KEY, metaKey = STORAGE_META_KEY) {
    this.key = key;
    this.metaKey = metaKey;
  }
  
  isAvailable(): boolean {
    try {
      const testKey = '__sb5_storage_test__';
      localStorage.setItem(testKey, '1');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }
  
  async load(): Promise<AppState | null> {
    if (!this.isAvailable()) return null;
    
    try {
      const raw = localStorage.getItem(this.key);
      if (!raw) return null;
      
      const envelope = safeJsonParse<StorageEnvelope | null>(raw, null);
      if (envelope?.state) {
        return envelope.state;
      }
      
      return null;
    } catch {
      return null;
    }
  }
  
  async save(state: AppState): Promise<boolean> {
    if (!this.isAvailable()) return false;
    
    try {
      const envelope: StorageEnvelope = {
        version: CURRENT_VERSION,
        savedAt: Date.now(),
        state: this.serializeState(state)
      };
      
      localStorage.setItem(this.key, JSON.stringify(envelope));
      localStorage.setItem(this.metaKey, JSON.stringify({
        savedAt: envelope.savedAt,
        version: envelope.version
      }));
      
      return true;
    } catch {
      return false;
    }
  }
  
  async remove(): Promise<void> {
    try {
      localStorage.removeItem(this.key);
      localStorage.removeItem(this.metaKey);
    } catch {
      // Ignore
    }
  }
  
  async getMeta(): Promise<{ savedAt?: number; version?: number }> {
    try {
      const raw = localStorage.getItem(this.metaKey);
      if (!raw) return {};
      return safeJsonParse(raw, {});
    } catch {
      return {};
    }
  }
  
  /**
   * Serialisiert State für Persistierung
   * Entfernt ephemere UI-Auswahlen
   */
  private serializeState(state: AppState): AppState {
    const out = deepClone(state);
    if (out.ui) {
      out.ui.activeSection = null;
      out.ui.activeElementPath = null;
    }
    return out;
  }
}

// ============================================================================
// MEMORY ADAPTER (für Tests)
// ============================================================================

/**
 * Memory Adapter
 * Speichert State im Arbeitsspeicher (für Tests/SSR)
 */
export class MemoryStorageAdapter implements IStorageAdapter {
  private data: AppState | null = null;
  private meta: { savedAt?: number; version?: number } = {};
  
  isAvailable(): boolean {
    return true;
  }
  
  async load(): Promise<AppState | null> {
    return this.data ? deepClone(this.data) : null;
  }
  
  async save(state: AppState): Promise<boolean> {
    this.data = deepClone(state);
    this.meta = { savedAt: Date.now(), version: CURRENT_VERSION };
    return true;
  }
  
  async remove(): Promise<void> {
    this.data = null;
    this.meta = {};
  }
  
  async getMeta(): Promise<{ savedAt?: number; version?: number }> {
    return { ...this.meta };
  }
  
  /**
   * Für Tests: Direkter Zugriff auf gespeicherte Daten
   */
  getRaw(): AppState | null {
    return this.data;
  }
}

// ============================================================================
// INDEXEDDB ADAPTER (für große Daten)
// ============================================================================

/**
 * IndexedDB Adapter
 * Für größere Datenmengen (Bilder, viele Sections)
 */
export class IndexedDBStorageAdapter implements IStorageAdapter {
  private dbName: string;
  private storeName: string;
  private db: IDBDatabase | null = null;
  
  constructor(dbName = 'SmoothBuilder', storeName = 'state') {
    this.dbName = dbName;
    this.storeName = storeName;
  }
  
  isAvailable(): boolean {
    return typeof indexedDB !== 'undefined';
  }
  
  private async getDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);
      
      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
        }
      };
    });
  }
  
  async load(): Promise<AppState | null> {
    if (!this.isAvailable()) return null;
    
    try {
      const db = await this.getDB();
      
      return new Promise((resolve, reject) => {
        const tx = db.transaction(this.storeName, 'readonly');
        const store = tx.objectStore(this.storeName);
        const request = store.get('current');
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const envelope = request.result as StorageEnvelope | undefined;
          resolve(envelope?.state ?? null);
        };
      });
    } catch {
      return null;
    }
  }
  
  async save(state: AppState): Promise<boolean> {
    if (!this.isAvailable()) return false;
    
    try {
      const db = await this.getDB();
      
      const envelope: StorageEnvelope = {
        version: CURRENT_VERSION,
        savedAt: Date.now(),
        state: deepClone(state)
      };
      
      return new Promise((resolve, reject) => {
        const tx = db.transaction(this.storeName, 'readwrite');
        const store = tx.objectStore(this.storeName);
        const request = store.put(envelope, 'current');
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(true);
      });
    } catch {
      return false;
    }
  }
  
  async remove(): Promise<void> {
    if (!this.isAvailable()) return;
    
    try {
      const db = await this.getDB();
      
      return new Promise((resolve, reject) => {
        const tx = db.transaction(this.storeName, 'readwrite');
        const store = tx.objectStore(this.storeName);
        const request = store.delete('current');
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    } catch {
      // Ignore
    }
  }
  
  async getMeta(): Promise<{ savedAt?: number; version?: number }> {
    const state = await this.load();
    if (!state) return {};
    
    try {
      const db = await this.getDB();
      
      return new Promise((resolve) => {
        const tx = db.transaction(this.storeName, 'readonly');
        const store = tx.objectStore(this.storeName);
        const request = store.get('current');
        
        request.onerror = () => resolve({});
        request.onsuccess = () => {
          const envelope = request.result as StorageEnvelope | undefined;
          resolve({
            savedAt: envelope?.savedAt,
            version: envelope?.version
          });
        };
      });
    } catch {
      return {};
    }
  }
}

// ============================================================================
// COMPOSITE ADAPTER (Fallback-Chain)
// ============================================================================

/**
 * Composite Adapter
 * Versucht mehrere Adapter in Reihenfolge
 */
export class CompositeStorageAdapter implements IStorageAdapter {
  private adapters: IStorageAdapter[];
  
  constructor(adapters: IStorageAdapter[]) {
    this.adapters = adapters;
  }
  
  isAvailable(): boolean {
    return this.adapters.some(a => a.isAvailable());
  }
  
  async load(): Promise<AppState | null> {
    for (const adapter of this.adapters) {
      if (adapter.isAvailable()) {
        const state = await adapter.load();
        if (state) return state;
      }
    }
    return null;
  }
  
  async save(state: AppState): Promise<boolean> {
    for (const adapter of this.adapters) {
      if (adapter.isAvailable()) {
        const success = await adapter.save(state);
        if (success) return true;
      }
    }
    return false;
  }
  
  async remove(): Promise<void> {
    for (const adapter of this.adapters) {
      if (adapter.isAvailable()) {
        await adapter.remove();
      }
    }
  }
  
  async getMeta(): Promise<{ savedAt?: number; version?: number }> {
    for (const adapter of this.adapters) {
      if (adapter.isAvailable()) {
        const meta = await adapter.getMeta();
        if (meta.savedAt) return meta;
      }
    }
    return {};
  }
}

// ============================================================================
// DEBOUNCED SAVER
// ============================================================================

export interface DebouncedSaverOptions {
  wait?: number;
  adapter?: IStorageAdapter;
}

/**
 * Erstellt einen debounced Storage Saver
 */
export function createDebouncedSaver(options: DebouncedSaverOptions = {}) {
  const wait = options.wait ?? 500;
  const adapter = options.adapter ?? new LocalStorageAdapter();
  
  const debouncedSave = debounce(async (state: AppState) => {
    await adapter.save(state);
  }, wait);
  
  return {
    save(state: AppState): void {
      debouncedSave(state);
    },
    
    flush(): void {
      debouncedSave.flush();
    },
    
    cancel(): void {
      debouncedSave.cancel();
    }
  };
}

// ============================================================================
// MIGRATION
// ============================================================================

/**
 * Migriert Legacy-Daten aus alten Smooth Builder Versionen
 */
export async function migrateLegacyData(
  adapter: IStorageAdapter
): Promise<AppState | null> {
  // Prüfe auf existierende Legacy-Keys
  const builderTheme = localStorage.getItem(LEGACY_PREFIX + 'builderTheme');
  const componentsRaw = localStorage.getItem(LEGACY_PREFIX + 'components');
  const orderRaw = localStorage.getItem(LEGACY_PREFIX + 'order');
  const settingsRaw = localStorage.getItem(LEGACY_PREFIX + 'settings');
  
  const components = componentsRaw ? safeJsonParse(componentsRaw, null) : null;
  const order = orderRaw ? safeJsonParse(orderRaw, null) : null;
  const settings = settingsRaw ? safeJsonParse(settingsRaw, null) : null;
  
  if (!components && !order && !settings && !builderTheme) {
    return null;
  }
  
  // Mapping von Legacy-Typen
  const normalizeType = (t: string): string => {
    if (t === 'trust') return 'trustbar';
    if (t === 'stickyCta') return 'cta';
    return t;
  };
  
  const sections: Array<{ id: string; type: string; variant: string; enabled: boolean }> = [];
  const orderIds: string[] = [];
  const spacing: Record<string, { pt: number; pb: number }> = {};
  const content: Record<string, Record<string, unknown>> = {};
  
  const legacyOrder = Array.isArray(order) ? order : Object.keys(components || {});
  const counters: Record<string, number> = {};
  
  for (const legacyType of legacyOrder) {
    const type = normalizeType(legacyType);
    counters[type] = (counters[type] || 0) + 1;
    const id = `${type}-${counters[type]}`;
    
    const comp = components?.[legacyType];
    const enabled = comp ? !!comp.enabled : true;
    
    sections.push({ id, type, variant: 'default', enabled });
    orderIds.push(id);
    spacing[id] = { pt: 64, pb: 64 };
    
    if (comp?.data && typeof comp.data === 'object') {
      content[id] = deepClone(comp.data) as Record<string, unknown>;
    }
  }
  
  const migratedState: AppState = {
    mode: 'structure',
    layout: { sections, order: orderIds, spacing },
    brand: {
      logo: null,
      colors: {
        primary: settings?.primaryColor ?? '#0f766e',
        accent: settings?.accentColor ?? '#f59e0b',
        background: '#ffffff',
        surface: '#f8fafc',
        text: '#0f172a',
        textLight: '#64748b',
        border: 'rgba(0,0,0,0.08)'
      },
      font: settings?.fontStack ?? 'system',
      radius: 'rounded'
    },
    content,
    settings: {
      siteName: settings?.siteName ?? 'Meine Website',
      siteDescription: settings?.siteDescription ?? '',
      favicon: '🏠',
      language: 'de',
      consent: {
        enabled: true,
        analytics: 'none',
        privacyLink: '/datenschutz',
        categories: { necessary: true, statistics: false, marketing: false }
      },
      features: {
        darkModeToggle: !!settings?.darkModeToggle,
        stickyHeader: true,
        smoothScroll: true
      }
    },
    ui: {
      activeSection: null,
      activeElementPath: null,
      showGrid: true,
      show8pxRaster: false,
      sidebarTab: 'sections',
      builderTheme: safeJsonParse(builderTheme ?? '', 'light') as 'light' | 'dark'
    }
  };
  
  // Migrierte Daten speichern
  await adapter.save(migratedState);
  
  return migratedState;
}

// ============================================================================
// FACTORY
// ============================================================================

export type AdapterType = 'localStorage' | 'indexedDB' | 'memory';

/**
 * Factory für Storage-Adapter
 */
export function createStorageAdapter(type: AdapterType = 'localStorage'): IStorageAdapter {
  switch (type) {
    case 'indexedDB':
      return new IndexedDBStorageAdapter();
    case 'memory':
      return new MemoryStorageAdapter();
    case 'localStorage':
    default:
      return new LocalStorageAdapter();
  }
}

/**
 * Standard-Export: Vorkonfigurierter LocalStorage-Adapter
 */
export const storage = new LocalStorageAdapter();
