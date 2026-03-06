/**
 * @sb/store/hooks - React Hooks für Smooth Builder Store
 * 
 * Hooks für die Integration mit React 18:
 * - useSyncExternalStore für optimale Performance
 * - Memoized Selectors
 * - Dispatch-Wrapper
 */

import { useSyncExternalStore, useCallback, useMemo } from 'react';
import type { Store, AppState, Action, SectionInstance, BrandSettings, SiteSettings, UIState } from '@sb/types';

// ============================================================================
// STORE CONTEXT (wird von App bereitgestellt)
// ============================================================================

let globalStore: Store | null = null;

/**
 * Setzt den globalen Store (wird beim App-Start aufgerufen)
 */
export function setGlobalStore(store: Store): void {
  globalStore = store;
}

/**
 * Gibt den globalen Store zurück
 */
export function getGlobalStore(): Store {
  if (!globalStore) {
    throw new Error('Store not initialized. Call setGlobalStore first.');
  }
  return globalStore;
}

// ============================================================================
// BASE HOOKS
// ============================================================================

/**
 * Hook für den vollständigen State
 */
export function useStore(): AppState {
  const store = getGlobalStore();
  return useSyncExternalStore(
    store.subscribe.bind(store),
    store.getState.bind(store),
    store.getState.bind(store) // Server-Snapshot
  );
}

/**
 * Hook für Dispatch-Funktion
 */
export function useDispatch(): (action: Action) => void {
  const store = getGlobalStore();
  return useCallback((action: Action) => store.dispatch(action), [store]);
}

/**
 * Hook für einen Teil des States mit Selector
 */
export function useSelector<T>(selector: (state: AppState) => T): T {
  const store = getGlobalStore();
  
  const getSnapshot = useCallback(() => selector(store.getState()), [store, selector]);
  
  return useSyncExternalStore(
    store.subscribe.bind(store),
    getSnapshot,
    getSnapshot
  );
}

// ============================================================================
// SPECIALIZED HOOKS
// ============================================================================

/**
 * Hook für den aktuellen Modus
 */
export function useMode(): AppState['mode'] {
  return useSelector(state => state.mode);
}

/**
 * Hook für Layout-Daten
 */
export function useLayout(): AppState['layout'] {
  return useSelector(state => state.layout);
}

/**
 * Hook für alle Sections
 */
export function useSections(): SectionInstance[] {
  return useSelector(state => state.layout.sections);
}

/**
 * Hook für Section-Reihenfolge
 */
export function useSectionOrder(): string[] {
  return useSelector(state => state.layout.order);
}

/**
 * Hook für geordnete Sections
 */
export function useOrderedSections(): SectionInstance[] {
  const sections = useSections();
  const order = useSectionOrder();
  
  return useMemo(() => {
    const byId = new Map(sections.map(s => [s.id, s]));
    return order.map(id => byId.get(id)).filter(Boolean) as SectionInstance[];
  }, [sections, order]);
}

/**
 * Hook für aktivierte Sections
 */
export function useEnabledSections(): SectionInstance[] {
  const ordered = useOrderedSections();
  return useMemo(() => ordered.filter(s => s.enabled), [ordered]);
}

/**
 * Hook für eine einzelne Section
 */
export function useSection(id: string): SectionInstance | null {
  const sections = useSections();
  return useMemo(() => sections.find(s => s.id === id) ?? null, [sections, id]);
}

/**
 * Hook für aktive Section
 */
export function useActiveSection(): SectionInstance | null {
  const activeId = useSelector(state => state.ui.activeSection);
  const sections = useSections();
  
  return useMemo(() => {
    if (!activeId) return null;
    return sections.find(s => s.id === activeId) ?? null;
  }, [activeId, sections]);
}

/**
 * Hook für Section-Spacing
 */
export function useSectionSpacing(id: string): { pt: number; pb: number } {
  return useSelector(state => state.layout.spacing[id] ?? { pt: 64, pb: 64 });
}

/**
 * Hook für Section-Content
 */
export function useSectionContent(id: string): Record<string, unknown> {
  return useSelector(state => state.content[id] ?? {});
}

/**
 * Hook für Brand-Einstellungen
 */
export function useBrand(): BrandSettings {
  return useSelector(state => state.brand);
}

/**
 * Hook für Farbpalette
 */
export function useColors(): BrandSettings['colors'] {
  return useSelector(state => state.brand.colors);
}

/**
 * Hook für Site-Einstellungen
 */
export function useSettings(): SiteSettings {
  return useSelector(state => state.settings);
}

/**
 * Hook für UI-State
 */
export function useUI(): UIState {
  return useSelector(state => state.ui);
}

/**
 * Hook für Builder-Theme
 */
export function useBuilderTheme(): 'light' | 'dark' {
  return useSelector(state => state.ui.builderTheme);
}

/**
 * Hook für Sidebar-Tab
 */
export function useSidebarTab(): string {
  return useSelector(state => state.ui.sidebarTab);
}

/**
 * Hook für Grid-Anzeige
 */
export function useShowGrid(): boolean {
  return useSelector(state => state.ui.showGrid);
}

// ============================================================================
// UNDO/REDO HOOKS
// ============================================================================

/**
 * Hook für Undo/Redo-Status
 */
export function useHistory(): { canUndo: boolean; canRedo: boolean } {
  const store = getGlobalStore();
  
  // Diese Werte sind nicht Teil des States, daher manuelles Tracking
  const canUndo = useSyncExternalStore(
    store.subscribe.bind(store),
    () => store.canUndo(),
    () => store.canUndo()
  );
  
  const canRedo = useSyncExternalStore(
    store.subscribe.bind(store),
    () => store.canRedo(),
    () => store.canRedo()
  );
  
  return { canUndo, canRedo };
}

// ============================================================================
// COMBINED HOOKS
// ============================================================================

/**
 * Hook für Section mit allen zugehörigen Daten
 */
export function useSectionData(id: string): {
  section: SectionInstance | null;
  content: Record<string, unknown>;
  spacing: { pt: number; pb: number };
  isActive: boolean;
} {
  const section = useSection(id);
  const content = useSectionContent(id);
  const spacing = useSectionSpacing(id);
  const activeId = useSelector(state => state.ui.activeSection);
  
  return useMemo(() => ({
    section,
    content,
    spacing,
    isActive: activeId === id
  }), [section, content, spacing, activeId, id]);
}

/**
 * Hook für Builder-Status
 */
export function useBuilderStatus(): {
  mode: AppState['mode'];
  canDesign: boolean;
  canExport: boolean;
  sectionCount: number;
  enabledCount: number;
} {
  const state = useStore();
  
  return useMemo(() => {
    const sections = state.layout.sections;
    const enabled = sections.filter(s => s.enabled);
    
    return {
      mode: state.mode,
      canDesign: sections.length > 0,
      canExport: enabled.length > 0,
      sectionCount: sections.length,
      enabledCount: enabled.length
    };
  }, [state]);
}

// ============================================================================
// ACTION HOOKS
// ============================================================================

/**
 * Hook für häufig verwendete Actions
 */
export function useActions() {
  const dispatch = useDispatch();
  
  return useMemo(() => ({
    setMode: (mode: string) => dispatch({ type: 'SET_MODE', payload: mode }),
    
    addSection: (type: string, options?: { variant?: string }) => 
      dispatch({ type: 'ADD_SECTION', payload: { type, ...options } }),
    
    removeSection: (id: string) => 
      dispatch({ type: 'REMOVE_SECTION', payload: { id } }),
    
    selectSection: (id: string | null) => 
      dispatch({ type: 'SELECT_SECTION', payload: { id } }),
    
    toggleSection: (id: string) => 
      dispatch({ type: 'TOGGLE_SECTION', payload: { id } }),
    
    updateVariant: (id: string, variant: string) => 
      dispatch({ type: 'UPDATE_SECTION_VARIANT', payload: { id, variant } }),
    
    reorder: (order: string[]) => 
      dispatch({ type: 'REORDER', payload: order }),
    
    moveSection: (id: string, direction: 'up' | 'down') => 
      dispatch({ type: 'MOVE_SECTION', payload: { id, direction } }),
    
    updateSpacing: (id: string, pt?: number, pb?: number) => 
      dispatch({ type: 'UPDATE_SPACING', payload: { id, pt, pb } }),
    
    setLogo: (logo: string | null) => 
      dispatch({ type: 'SET_LOGO', payload: logo }),
    
    setColors: (colors: Partial<BrandSettings['colors']>) => 
      dispatch({ type: 'SET_COLORS', payload: colors }),
    
    setFont: (font: string) => 
      dispatch({ type: 'SET_FONT', payload: font }),
    
    setRadius: (radius: string) => 
      dispatch({ type: 'SET_RADIUS', payload: radius }),
    
    updateContent: (id: string, content: Record<string, unknown>) => 
      dispatch({ type: 'UPDATE_CONTENT', payload: { id, ...content } }),
    
    updateSettings: (settings: Partial<SiteSettings>) => 
      dispatch({ type: 'UPDATE_SETTINGS', payload: settings }),
    
    undo: () => dispatch({ type: 'UNDO' }),
    
    redo: () => dispatch({ type: 'REDO' }),
    
    resetProject: () => dispatch({ type: 'RESET_PROJECT' })
  }), [dispatch]);
}

// ============================================================================
// KEYBOARD SHORTCUTS HOOK
// ============================================================================

/**
 * Hook für Keyboard-Shortcuts
 */
export function useKeyboardShortcuts(): void {
  const { undo, redo } = useActions();
  const { canUndo, canRedo } = useHistory();
  
  useMemo(() => {
    const handler = (e: KeyboardEvent) => {
      const isMeta = e.metaKey || e.ctrlKey;
      
      // Undo: Cmd/Ctrl + Z
      if (isMeta && e.key === 'z' && !e.shiftKey && canUndo) {
        e.preventDefault();
        undo();
        return;
      }
      
      // Redo: Cmd/Ctrl + Shift + Z
      if (isMeta && e.key === 'z' && e.shiftKey && canRedo) {
        e.preventDefault();
        redo();
        return;
      }
      
      // Redo: Cmd/Ctrl + Y (Windows)
      if (isMeta && e.key === 'y' && canRedo) {
        e.preventDefault();
        redo();
        return;
      }
    };
    
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo, canUndo, canRedo]);
}
