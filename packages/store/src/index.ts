/**
 * @sb/store - State Management für Smooth Builder
 * 
 * Implementiert einen minimalen Store, der kompatibel mit
 * React 18's useSyncExternalStore ist.
 * 
 * Features:
 * - Immutable State Updates
 * - Integrierte History (Undo/Redo)
 * - Auto-Persistierung
 * - Type-safe Actions
 */

import { deepClone, deepMerge, isEqual, roundTo8px } from '@sb/utils';
import { HistoryManager, defaultHistoryPolicy } from '@sb/history';
import { createDebouncedSaver, LocalStorageAdapter } from '@sb/storage';
import type {
  AppState,
  Action,
  ActionType,
  IStore,
  IStorageAdapter,
  StoreOptions,
  SectionInstance,
  LayoutState,
  BrandSettings,
  SiteSettings,
  UIState,
  Listener,
  Unsubscribe
} from '@sb/types';
import { ActionTypes } from '@sb/types';

// ============================================================================
// INITIAL STATE
// ============================================================================

export const initialState: AppState = {
  mode: 'structure',
  
  layout: {
    sections: [],
    order: [],
    spacing: {}
  },
  
  brand: {
    logo: null,
    colors: {
      primary: '#0f766e',
      accent: '#f59e0b',
      background: '#ffffff',
      surface: '#f8fafc',
      text: '#0f172a',
      textLight: '#64748b',
      border: 'rgba(0,0,0,0.08)'
    },
    font: 'inter',
    radius: 'rounded'
  },
  
  content: {},
  
  settings: {
    siteName: 'Meine Website',
    siteDescription: '',
    favicon: '🏠',
    language: 'de',
    consent: {
      enabled: true,
      analytics: 'none',
      privacyLink: '/datenschutz',
      categories: {
        necessary: true,
        statistics: false,
        marketing: false
      }
    },
    features: {
      darkModeToggle: false,
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
    builderTheme: 'light'
  }
};

// ============================================================================
// SPACING PRESETS
// ============================================================================

export const SPACING_PRESETS = {
  compact: { pt: 32, pb: 32 },
  balanced: { pt: 64, pb: 64 },
  spacious: { pt: 96, pb: 96 },
  hero: { pt: 80, pb: 120 }
} as const;

export type SpacingPreset = keyof typeof SPACING_PRESETS;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const MODES = ['structure', 'design', 'export'] as const;

function normalizeMode(mode: string): 'structure' | 'design' | 'export' {
  return MODES.includes(mode as any) ? mode as any : 'structure';
}

function normalizeSectionType(type: string): string {
  if (type === 'trust') return 'trustbar';
  return String(type || '').trim().toLowerCase();
}

function nextSectionId(state: AppState, type: string): string {
  const t = normalizeSectionType(type);
  const nums = state.layout.sections
    .filter(s => s.type === t)
    .map(s => {
      const m = String(s.id).match(/-(\d+)$/);
      return m ? Number(m[1]) : 0;
    });
  const n = nums.length ? Math.max(...nums) + 1 : 1;
  return `${t}-${n}`;
}

function ensureOrderConsistency(layout: LayoutState): LayoutState {
  const ids = new Set(layout.sections.map(s => s.id));
  const order = Array.isArray(layout.order)
    ? layout.order.filter(id => ids.has(id))
    : [];
  
  // Fehlende Sections anhängen
  for (const s of layout.sections) {
    if (!order.includes(s.id)) order.push(s.id);
  }
  
  return { ...layout, order };
}

// ============================================================================
// REDUCER
// ============================================================================

export function reducer(state: AppState, action: Action): AppState {
  const type = action?.type;
  const payload = action?.payload;
  
  switch (type) {
    // ======== MODE ========
    case ActionTypes.SET_MODE: {
      const mode = normalizeMode(payload as string);
      return { ...state, mode };
    }
    
    // ======== LOAD/RESET ========
    case ActionTypes.LOAD_STATE: {
      if (!payload || typeof payload !== 'object') return state;
      const merged = deepMerge(initialState, payload as Partial<AppState>);
      merged.layout = ensureOrderConsistency(merged.layout);
      return merged;
    }
    
    case ActionTypes.RESET_PROJECT: {
      const keepTheme = state.ui?.builderTheme ?? initialState.ui.builderTheme;
      const next = deepClone(initialState);
      next.ui.builderTheme = keepTheme;
      return next;
    }
    
    // ======== SECTIONS ========
    case ActionTypes.ADD_SECTION: {
      const p = payload as { type?: string; id?: string; variant?: string; enabled?: boolean } | string;
      const sectionType = normalizeSectionType(typeof p === 'string' ? p : p?.type ?? '');
      if (!sectionType) return state;
      
      const id = (typeof p !== 'string' && p?.id) ? String(p.id) : nextSectionId(state, sectionType);
      const variant = (typeof p !== 'string' && p?.variant) ? String(p.variant) : 'default';
      const enabled = (typeof p !== 'string' && typeof p?.enabled === 'boolean') ? p.enabled : true;
      
      const newSection: SectionInstance = { id, type: sectionType, variant, enabled };
      const sections = [...state.layout.sections, newSection];
      const order = [...state.layout.order, id];
      const spacing = { ...state.layout.spacing, [id]: { pt: 64, pb: 64 } };
      const ui = { ...state.ui, activeSection: id };
      
      return {
        ...state,
        layout: ensureOrderConsistency({ ...state.layout, sections, order, spacing }),
        ui
      };
    }
    
    case ActionTypes.ADD_SECTIONS_BULK: {
      const items = Array.isArray(payload) ? payload : [];
      let next = state;
      for (const item of items) {
        next = reducer(next, { type: ActionTypes.ADD_SECTION, payload: item });
      }
      return next;
    }
    
    case ActionTypes.REMOVE_SECTION: {
      const p = payload as { id?: string } | string;
      const id = String(typeof p === 'string' ? p : p?.id ?? '');
      if (!id) return state;
      
      const sections = state.layout.sections.filter(s => s.id !== id);
      const order = state.layout.order.filter(x => x !== id);
      const spacing = { ...state.layout.spacing };
      delete spacing[id];
      
      const content = { ...state.content };
      delete content[id];
      
      const activeSection = state.ui.activeSection === id ? null : state.ui.activeSection;
      
      return {
        ...state,
        layout: ensureOrderConsistency({ ...state.layout, sections, order, spacing }),
        content,
        ui: { ...state.ui, activeSection }
      };
    }
    
    case ActionTypes.TOGGLE_SECTION: {
      const p = payload as { id?: string } | string;
      const id = String(typeof p === 'string' ? p : p?.id ?? '');
      if (!id) return state;
      
      const sections = state.layout.sections.map(s =>
        s.id === id ? { ...s, enabled: !s.enabled } : s
      );
      
      return { ...state, layout: { ...state.layout, sections } };
    }
    
    case ActionTypes.SELECT_SECTION: {
      const p = payload as { id?: string | null } | string | null;
      const id = typeof p === 'string' || p === null ? p : p?.id ?? null;
      return { ...state, ui: { ...state.ui, activeSection: id } };
    }
    
    case ActionTypes.UPDATE_SECTION: {
      const p = payload as { id?: string; [key: string]: unknown };
      const id = p?.id ? String(p.id) : null;
      if (!id) return state;
      
      const sections = state.layout.sections.map(s => {
        if (s.id !== id) return s;
        const { id: _, ...updates } = p;
        return { ...s, ...updates };
      });
      
      return { ...state, layout: { ...state.layout, sections } };
    }
    
    case ActionTypes.UPDATE_SECTION_VARIANT: {
      const p = payload as { id?: string; variant?: string };
      const id = p?.id ? String(p.id) : null;
      const variant = p?.variant ? String(p.variant) : null;
      if (!id || !variant) return state;
      
      const sections = state.layout.sections.map(s =>
        s.id === id ? { ...s, variant } : s
      );
      
      return { ...state, layout: { ...state.layout, sections } };
    }
    
    case ActionTypes.REORDER: {
      const newOrder = payload as string[];
      if (!Array.isArray(newOrder)) return state;
      return {
        ...state,
        layout: ensureOrderConsistency({ ...state.layout, order: newOrder })
      };
    }
    
    case ActionTypes.MOVE_SECTION: {
      const p = payload as { id?: string; direction?: 'up' | 'down' };
      const id = p?.id ? String(p.id) : null;
      const dir = p?.direction;
      if (!id || (dir !== 'up' && dir !== 'down')) return state;
      
      const idx = state.layout.order.indexOf(id);
      if (idx < 0) return state;
      
      const newIdx = dir === 'up' ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= state.layout.order.length) return state;
      
      const order = [...state.layout.order];
      [order[idx], order[newIdx]] = [order[newIdx], order[idx]];
      
      return { ...state, layout: { ...state.layout, order } };
    }
    
    // ======== SPACING ========
    case ActionTypes.UPDATE_SPACING: {
      const p = payload as { id?: string; pt?: number; pb?: number };
      const id = p?.id ? String(p.id) : null;
      if (!id) return state;
      
      const prev = state.layout.spacing[id] ?? { pt: 64, pb: 64 };
      const next = {
        pt: roundTo8px(p.pt ?? prev.pt),
        pb: roundTo8px(p.pb ?? prev.pb)
      };
      
      return {
        ...state,
        layout: {
          ...state.layout,
          spacing: { ...state.layout.spacing, [id]: next }
        }
      };
    }
    
    case ActionTypes.APPLY_SPACING_PRESET: {
      const p = payload as { id?: string; preset?: SpacingPreset };
      const id = p?.id ? String(p.id) : null;
      const presetKey = p?.preset;
      if (!id || !presetKey || !SPACING_PRESETS[presetKey]) return state;
      
      const preset = SPACING_PRESETS[presetKey];
      return reducer(state, {
        type: ActionTypes.UPDATE_SPACING,
        payload: { id, pt: preset.pt, pb: preset.pb }
      });
    }
    
    // ======== BRAND ========
    case ActionTypes.SET_LOGO: {
      return { ...state, brand: { ...state.brand, logo: (payload as string) || null } };
    }
    
    case ActionTypes.SET_COLORS: {
      const colors = (payload && typeof payload === 'object') ? payload : {};
      return {
        ...state,
        brand: {
          ...state.brand,
          colors: deepMerge(state.brand.colors, colors as Partial<typeof state.brand.colors>)
        }
      };
    }
    
    case ActionTypes.SET_FONT: {
      const font = String(payload || 'system');
      return { ...state, brand: { ...state.brand, font } };
    }
    
    case ActionTypes.SET_RADIUS: {
      const radius = String(payload || 'rounded') as 'sharp' | 'rounded' | 'pill';
      return { ...state, brand: { ...state.brand, radius } };
    }
    
    // ======== CONTENT ========
    case ActionTypes.UPDATE_CONTENT: {
      const p = payload as { id?: string; [key: string]: unknown };
      const id = p?.id ? String(p.id) : null;
      if (!id) return state;
      
      const patch = { ...p };
      delete patch.id;
      
      const prev = state.content[id] ?? {};
      const next = deepMerge(prev, patch);
      
      return { ...state, content: { ...state.content, [id]: next } };
    }
    
    case ActionTypes.REPLACE_CONTENT: {
      const p = payload as { id?: string; value?: Record<string, unknown> };
      const id = p?.id ? String(p.id) : null;
      if (!id) return state;
      
      const value = p?.value ?? {};
      return { ...state, content: { ...state.content, [id]: deepClone(value) } };
    }
    
    case ActionTypes.REMOVE_CONTENT: {
      const p = payload as { id?: string } | string;
      const id = String(typeof p === 'string' ? p : p?.id ?? '');
      if (!id) return state;
      
      const content = { ...state.content };
      delete content[id];
      return { ...state, content };
    }
    
    // ======== SETTINGS ========
    case ActionTypes.UPDATE_SETTINGS: {
      const patch = (payload && typeof payload === 'object') ? payload : {};
      return { ...state, settings: deepMerge(state.settings, patch as Partial<SiteSettings>) };
    }
    
    case ActionTypes.UPDATE_CONSENT: {
      const patch = (payload && typeof payload === 'object') ? payload : {};
      return {
        ...state,
        settings: {
          ...state.settings,
          consent: deepMerge(state.settings.consent, patch as Partial<typeof state.settings.consent>)
        }
      };
    }
    
    case ActionTypes.UPDATE_FEATURES: {
      const patch = (payload && typeof payload === 'object') ? payload : {};
      return {
        ...state,
        settings: {
          ...state.settings,
          features: deepMerge(state.settings.features, patch as Partial<typeof state.settings.features>)
        }
      };
    }
    
    // ======== UI ========
    case ActionTypes.TOGGLE_GRID: {
      return { ...state, ui: { ...state.ui, showGrid: !state.ui.showGrid } };
    }
    
    case ActionTypes.TOGGLE_8PX: {
      return { ...state, ui: { ...state.ui, show8pxRaster: !state.ui.show8pxRaster } };
    }
    
    case ActionTypes.SET_SIDEBAR_TAB: {
      return { ...state, ui: { ...state.ui, sidebarTab: String(payload || 'sections') as any } };
    }
    
    case ActionTypes.SET_BUILDER_THEME: {
      const theme = payload === 'dark' ? 'dark' : 'light';
      return { ...state, ui: { ...state.ui, builderTheme: theme } };
    }
    
    case ActionTypes.SET_ACTIVE_ELEMENT_PATH: {
      return { ...state, ui: { ...state.ui, activeElementPath: (payload as string) || null } };
    }
    
    default:
      return state;
  }
}

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

export class Store implements IStore<AppState> {
  private state: AppState;
  private listeners = new Set<Listener>();
  private history: HistoryManager<AppState>;
  private saver: ReturnType<typeof createDebouncedSaver>;
  
  constructor(options: StoreOptions = {}) {
    const historyLimit = options.historyLimit ?? 50;
    const saveDebounceMs = options.saveDebounceMs ?? 450;
    const storageAdapter = options.storage ?? new LocalStorageAdapter();
    
    this.state = deepClone(initialState);
    this.history = new HistoryManager({ maxSize: historyLimit });
    this.saver = createDebouncedSaver({ wait: saveDebounceMs, adapter: storageAdapter });
    
    this.history.init(this.state);
  }
  
  getState(): AppState {
    return this.state;
  }
  
  subscribe(listener: Listener): Unsubscribe {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  
  dispatch(action: Action): void {
    if (!action?.type) return;
    
    // Undo/Redo
    if (action.type === ActionTypes.UNDO) {
      const prev = this.history.undo();
      if (prev) {
        this.state = prev;
        this.persist();
        this.emit();
      }
      return;
    }
    
    if (action.type === ActionTypes.REDO) {
      const next = this.history.redo();
      if (next) {
        this.state = next;
        this.persist();
        this.emit();
      }
      return;
    }
    
    // Normale Dispatch
    const next = reducer(this.state, action);
    if (isEqual(this.state, next)) return;
    
    this.state = next;
    
    // History Policy
    const policy = defaultHistoryPolicy(action.type, action.payload);
    if (policy.record && !action.meta?.skipHistory) {
      this.history.record(next, {
        coalesceKey: policy.coalesceKey,
        coalesceWindowMs: policy.coalesceWindowMs
      });
    }
    
    this.persist();
    this.emit();
  }
  
  canUndo(): boolean {
    return this.history.canUndo();
  }
  
  canRedo(): boolean {
    return this.history.canRedo();
  }
  
  flush(): void {
    this.saver.flush();
  }
  
  /**
   * Lädt State aus Storage
   */
  async loadFromStorage(adapter?: IStorageAdapter): Promise<boolean> {
    const storage = adapter ?? new LocalStorageAdapter();
    const loaded = await storage.load();
    
    if (loaded) {
      const merged = deepMerge(initialState, loaded);
      merged.layout = ensureOrderConsistency(merged.layout);
      this.state = merged;
      this.history.init(this.state);
      this.emit();
      return true;
    }
    
    return false;
  }
  
  /**
   * Setzt State direkt (für Tests/Import)
   */
  setState(state: AppState): void {
    this.state = deepClone(state);
    this.history.init(this.state);
    this.persist();
    this.emit();
  }
  
  private emit(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }
  
  private persist(): void {
    this.saver.save(this.state);
  }
}

// ============================================================================
// FACTORY
// ============================================================================

/**
 * Erstellt einen konfigurierten Store
 */
export function createStore(options: StoreOptions = {}): Store {
  return new Store(options);
}

/**
 * Erstellt einen Store mit geladenen Daten
 */
export async function createBuilderStore(options: StoreOptions = {}): Promise<Store> {
  const store = createStore(options);
  await store.loadFromStorage(options.storage);
  
  // Builder-Theme sofort anwenden
  const theme = store.getState().ui.builderTheme;
  if (typeof document !== 'undefined') {
    if (theme === 'light') {
      document.documentElement.classList.add('builder-light');
    } else {
      document.documentElement.classList.remove('builder-light');
    }
  }
  
  return store;
}

// ============================================================================
// SELECTORS
// ============================================================================

export const selectors = {
  /** Aktiver Modus */
  mode: (state: AppState) => state.mode,
  
  /** Alle Sections */
  sections: (state: AppState) => state.layout.sections,
  
  /** Section-Reihenfolge */
  order: (state: AppState) => state.layout.order,
  
  /** Geordnete Sections */
  orderedSections: (state: AppState) => {
    const byId = new Map(state.layout.sections.map(s => [s.id, s]));
    return state.layout.order.map(id => byId.get(id)).filter(Boolean) as SectionInstance[];
  },
  
  /** Aktivierte Sections */
  enabledSections: (state: AppState) => {
    const ordered = selectors.orderedSections(state);
    return ordered.filter(s => s.enabled);
  },
  
  /** Aktive Section */
  activeSection: (state: AppState) => {
    const id = state.ui.activeSection;
    if (!id) return null;
    return state.layout.sections.find(s => s.id === id) ?? null;
  },
  
  /** Spacing für Section */
  sectionSpacing: (state: AppState, id: string) =>
    state.layout.spacing[id] ?? { pt: 64, pb: 64 },
  
  /** Content für Section */
  sectionContent: (state: AppState, id: string) =>
    state.content[id] ?? {},
  
  /** Brand-Einstellungen */
  brand: (state: AppState) => state.brand,
  
  /** Farbpalette */
  colors: (state: AppState) => state.brand.colors,
  
  /** Site-Einstellungen */
  settings: (state: AppState) => state.settings,
  
  /** UI-State */
  ui: (state: AppState) => state.ui,
  
  /** Kann Design-Modus betreten? */
  canDesign: (state: AppState) => state.layout.order.length > 0,
  
  /** Kann exportieren? */
  canExport: (state: AppState) => state.layout.order.length > 0
};

// ============================================================================
// ACTION CREATORS
// ============================================================================

export const actions = {
  setMode: (mode: string): Action => ({ type: ActionTypes.SET_MODE, payload: mode }),
  
  addSection: (type: string, options?: { variant?: string }): Action => ({
    type: ActionTypes.ADD_SECTION,
    payload: { type, ...options }
  }),
  
  removeSection: (id: string): Action => ({ type: ActionTypes.REMOVE_SECTION, payload: { id } }),
  
  selectSection: (id: string | null): Action => ({ type: ActionTypes.SELECT_SECTION, payload: { id } }),
  
  toggleSection: (id: string): Action => ({ type: ActionTypes.TOGGLE_SECTION, payload: { id } }),
  
  updateVariant: (id: string, variant: string): Action => ({
    type: ActionTypes.UPDATE_SECTION_VARIANT,
    payload: { id, variant }
  }),
  
  reorder: (order: string[]): Action => ({ type: ActionTypes.REORDER, payload: order }),
  
  moveSection: (id: string, direction: 'up' | 'down'): Action => ({
    type: ActionTypes.MOVE_SECTION,
    payload: { id, direction }
  }),
  
  updateSpacing: (id: string, pt?: number, pb?: number): Action => ({
    type: ActionTypes.UPDATE_SPACING,
    payload: { id, pt, pb }
  }),
  
  setLogo: (logo: string | null): Action => ({ type: ActionTypes.SET_LOGO, payload: logo }),
  
  setColors: (colors: Partial<AppState['brand']['colors']>): Action => ({
    type: ActionTypes.SET_COLORS,
    payload: colors
  }),
  
  setFont: (font: string): Action => ({ type: ActionTypes.SET_FONT, payload: font }),
  
  setRadius: (radius: string): Action => ({ type: ActionTypes.SET_RADIUS, payload: radius }),
  
  updateContent: (id: string, content: Record<string, unknown>): Action => ({
    type: ActionTypes.UPDATE_CONTENT,
    payload: { id, ...content }
  }),
  
  updateSettings: (settings: Partial<SiteSettings>): Action => ({
    type: ActionTypes.UPDATE_SETTINGS,
    payload: settings
  }),
  
  undo: (): Action => ({ type: ActionTypes.UNDO }),
  
  redo: (): Action => ({ type: ActionTypes.REDO }),
  
  resetProject: (): Action => ({ type: ActionTypes.RESET_PROJECT })
};

// Re-export types
export { ActionTypes } from '@sb/types';
