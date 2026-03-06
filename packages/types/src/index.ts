/**
 * @sb/types - Zentrale Typdefinitionen für Smooth Builder
 * 
 * VERSION: 5.1.0 - KORRIGIERT
 * - Konsistente Feldnamen (background statt bg)
 * - Typisierte Action-Payloads
 * - Error-Types hinzugefügt
 * - Erweiterte UI-State-Felder
 */

// ============================================================================
// PRIMITIVE TYPES
// ============================================================================

export type SectionType = 
  | 'header' | 'hero' | 'trustbar' | 'authority' | 'services' | 'benefits' 
  | 'process' | 'proofTable' | 'team' | 'gallery' | 'testimonials' 
  | 'faq' | 'cta' | 'footer' | 'cookie' | 'custom'
  | string;

export type BuilderMode = 'structure' | 'design' | 'export';
export type RadiusStyle = 'sharp' | 'rounded' | 'pill';
export type FontId = 'system' | 'inter' | 'serif' | 'mono' | string;
export type AnalyticsProvider = 'none' | 'ga4' | 'matomo' | string;
export type SidebarTab = 'sections' | 'properties' | 'brand' | 'content' | 'settings' | 'code';
export type BuilderTheme = 'light' | 'dark';
export type Language = 'de' | 'fr' | 'it' | 'en' | string;
export type FieldType = 'text' | 'textarea' | 'richtext' | 'image' | 'list' | 'select' | 'toggle' | 'color' | 'number' | 'url' | 'email' | 'custom-elements';

// ============================================================================
// SECTION MODELS
// ============================================================================

export interface SectionInstance {
  id: string;
  type: SectionType;
  variant: string;
  enabled: boolean;
}

export interface SectionSpacing {
  pt: number;
  pb: number;
}

export interface SectionVariant {
  id: string;
  label: string;
  description?: string;
  thumbnail?: string;
}

export interface FieldDefinition {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  itemLabel?: string;
  itemShape?: Record<string, FieldType | string>;
  required?: boolean;
  maxLength?: number;
  min?: number;
  max?: number;
  helpText?: string;
}

export interface SectionDefinition {
  type: SectionType;
  name: string;
  icon: string;
  description: string;
  category?: string;
  variants: SectionVariant[];
  defaultVariant: string;
  fields: FieldDefinition[];
  defaults: Record<string, unknown>;
  deprecated?: boolean;
  aliasTo?: string;
  isCustom?: boolean;
  allowedElements?: string[];
}

// ============================================================================
// BRAND MODELS - KONSISTENT
// ============================================================================

export interface ColorPalette {
  primary: string;
  accent: string;
  background: string;  // ✓ Konsistent
  surface: string;
  text: string;
  textLight: string;
  border: string;
}

export interface BrandSettings {
  logo: string | null;
  logoAlt?: string | null;
  colors: ColorPalette;
  font: FontId;
  radius: RadiusStyle;
}

// ============================================================================
// LAYOUT MODELS
// ============================================================================

export interface LayoutState {
  sections: SectionInstance[];
  order: string[];
  spacing: Record<string, SectionSpacing>;
}

export type ContentState = Record<string, Record<string, unknown>>;

// ============================================================================
// SETTINGS MODELS
// ============================================================================

export interface ConsentCategories {
  necessary: boolean;
  statistics: boolean;
  marketing: boolean;
}

export interface ConsentSettings {
  enabled: boolean;
  analytics: AnalyticsProvider;
  privacyLink: string;
  categories: ConsentCategories;
}

export interface FeatureFlags {
  darkModeToggle: boolean;
  stickyHeader: boolean;
  smoothScroll: boolean;
  lazyImages: boolean;
  preloadCritical: boolean;
}

export interface SEOSettings {
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  ogImage?: string;
  robots?: string;
}

export interface SiteSettings {
  siteName: string;
  siteDescription: string;
  favicon: string;
  language: Language;
  consent: ConsentSettings;
  features: FeatureFlags;
  seo?: SEOSettings;
}

// ============================================================================
// UI STATE
// ============================================================================

export interface UIState {
  activeSection: string | null;
  activeElementPath: string | null;
  showGrid: boolean;
  show8pxRaster: boolean;
  sidebarTab: SidebarTab;
  builderTheme: BuilderTheme;
  zoom: number;
  viewport: 'desktop' | 'tablet' | 'mobile';
}

// ============================================================================
// APP STATE
// ============================================================================

export interface AppState {
  mode: BuilderMode;
  layout: LayoutState;
  brand: BrandSettings;
  content: ContentState;
  settings: SiteSettings;
  ui: UIState;
  meta?: {
    createdAt?: number;
    updatedAt?: number;
    version?: number;
  };
}

// ============================================================================
// ACTION TYPES
// ============================================================================

export const ActionTypes = {
  SET_MODE: 'SET_MODE',
  ADD_SECTION: 'ADD_SECTION',
  ADD_SECTIONS_BULK: 'ADD_SECTIONS_BULK',
  REMOVE_SECTION: 'REMOVE_SECTION',
  DUPLICATE_SECTION: 'DUPLICATE_SECTION',
  TOGGLE_SECTION: 'TOGGLE_SECTION',
  SELECT_SECTION: 'SELECT_SECTION',
  UPDATE_SECTION: 'UPDATE_SECTION',
  UPDATE_SECTION_VARIANT: 'UPDATE_SECTION_VARIANT',
  REORDER: 'REORDER',
  MOVE_SECTION: 'MOVE_SECTION',
  UPDATE_SPACING: 'UPDATE_SPACING',
  APPLY_SPACING_PRESET: 'APPLY_SPACING_PRESET',
  SET_LOGO: 'SET_LOGO',
  SET_COLORS: 'SET_COLORS',
  SET_FONT: 'SET_FONT',
  SET_RADIUS: 'SET_RADIUS',
  UPDATE_CONTENT: 'UPDATE_CONTENT',
  REPLACE_CONTENT: 'REPLACE_CONTENT',
  REMOVE_CONTENT: 'REMOVE_CONTENT',
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',
  UPDATE_CONSENT: 'UPDATE_CONSENT',
  UPDATE_FEATURES: 'UPDATE_FEATURES',
  UPDATE_SEO: 'UPDATE_SEO',
  TOGGLE_GRID: 'TOGGLE_GRID',
  TOGGLE_8PX: 'TOGGLE_8PX',
  SET_SIDEBAR_TAB: 'SET_SIDEBAR_TAB',
  SET_BUILDER_THEME: 'SET_BUILDER_THEME',
  SET_ACTIVE_ELEMENT_PATH: 'SET_ACTIVE_ELEMENT_PATH',
  SET_ZOOM: 'SET_ZOOM',
  SET_VIEWPORT: 'SET_VIEWPORT',
  LOAD_STATE: 'LOAD_STATE',
  RESET_PROJECT: 'RESET_PROJECT',
  APPLY_TEMPLATE: 'APPLY_TEMPLATE',
  UNDO: 'UNDO',
  REDO: 'REDO'
} as const;

export type ActionType = typeof ActionTypes[keyof typeof ActionTypes];

// ============================================================================
// TYPED PAYLOADS
// ============================================================================

export interface AddSectionPayload {
  type: SectionType;
  id?: string;
  variant?: string;
  enabled?: boolean;
  afterId?: string;
}

export interface UpdateSpacingPayload {
  id: string;
  pt?: number;
  pb?: number;
}

export interface MoveSectionPayload {
  id: string;
  direction: 'up' | 'down';
}

export interface Action<T = unknown> {
  type: ActionType;
  payload?: T;
  meta?: {
    skipHistory?: boolean;
    coalesceKey?: string;
    coalesceWindowMs?: number;
    source?: string;
  };
}

// ============================================================================
// TEMPLATE MODELS - KORRIGIERT
// ============================================================================

export interface TemplateComponent {
  enabled: boolean;
  variant?: string;
  data: Record<string, unknown>;
}

export interface TemplateTheme {
  primary: string;
  accent: string;
  background: string;  // ✓ KORRIGIERT: war "bg"
  surface: string;
  text: string;
  textLight: string;
  radius: RadiusStyle;
  darkMode: boolean;
  fontStack: FontId;
}

export interface TemplateDefinition {
  id: string;
  name: string;
  description: string;
  industry: string;
  icon: string;
  preview?: string;
  tags?: string[];
  components: Record<string, TemplateComponent>;
  theme: TemplateTheme;
}

// ============================================================================
// ERROR TYPES - NEU
// ============================================================================

export type ErrorCode = 
  | 'STORAGE_UNAVAILABLE' | 'STORAGE_QUOTA_EXCEEDED' | 'STORAGE_CORRUPTED'
  | 'EXPORT_FAILED' | 'IMPORT_INVALID' | 'SECTION_NOT_FOUND'
  | 'TEMPLATE_NOT_FOUND' | 'VALIDATION_FAILED' | 'UNKNOWN';

export class SBError extends Error {
  constructor(public code: ErrorCode, message: string, public cause?: unknown) {
    super(message);
    this.name = 'SBError';
  }
}

// ============================================================================
// GENERATOR & EXPORT MODELS
// ============================================================================

export interface HTMLGeneratorOptions {
  mode: 'preview' | 'production';
  cssHref?: string;
  jsSrc?: string;
  inlineCss?: string;
  inlineJs?: string;
  faviconDataUrl?: string;
  baseUrl?: string;
  minify?: boolean;
}

export interface ExportResult {
  success: boolean;
  filename?: string;
  size?: number;
  error?: SBError;
}

export interface ExportProgress {
  phase: 'preparing' | 'generating' | 'packaging' | 'complete';
  progress: number;
  message?: string;
}

// ============================================================================
// STORAGE MODELS
// ============================================================================

export interface StorageEnvelope {
  version: number;
  savedAt: number;
  state: AppState;
  checksum?: string;
}

export interface IStorageAdapter {
  isAvailable(): boolean;
  load(): Promise<AppState | null>;
  save(state: AppState): Promise<boolean>;
  remove(): Promise<void>;
  getMeta(): Promise<{ savedAt?: number; version?: number }>;
}

// ============================================================================
// HISTORY MODELS
// ============================================================================

export interface HistoryRecordOptions {
  coalesceKey?: string;
  coalesceWindowMs?: number;
}

export interface IHistoryManager<T> {
  init(initialState: T): void;
  record(state: T, options?: HistoryRecordOptions): void;
  undo(): T | null;
  redo(): T | null;
  canUndo(): boolean;
  canRedo(): boolean;
  clear(): void;
  getCurrent(): T | null;
}

// ============================================================================
// STORE & REGISTRY INTERFACES
// ============================================================================

export interface IStore<T> {
  getState(): T;
  dispatch(action: Action): void;
  subscribe(listener: () => void): () => void;
  canUndo(): boolean;
  canRedo(): boolean;
  flush(): void;
}

export interface StoreOptions {
  historyLimit?: number;
  saveDebounceMs?: number;
  storage?: IStorageAdapter;
}

export interface ISectionRegistry {
  register(definition: SectionDefinition): void;
  unregister(type: SectionType): void;
  get(type: SectionType): SectionDefinition | undefined;
  getAll(): SectionDefinition[];
  has(type: SectionType): boolean;
}

export interface ITemplateRegistry {
  register(template: TemplateDefinition): void;
  unregister(id: string): void;
  get(id: string): TemplateDefinition | undefined;
  getAll(): TemplateDefinition[];
  getByIndustry(industry: string): TemplateDefinition[];
}

export type GeneratorFn<T = string> = (state: AppState, options?: Record<string, unknown>) => T;

export interface IGeneratorPipeline {
  register(category: string, name: string, generator: GeneratorFn): void;
  generate(category: string, name: string, state: AppState, options?: Record<string, unknown>): string;
  getAvailable(category: string): string[];
}

export interface IExporter {
  exportPreviewHTML(state: AppState): Promise<ExportResult>;
  exportProductionZip(state: AppState, onProgress?: (p: ExportProgress) => void): Promise<ExportResult>;
  exportJSON(state: AppState): Promise<ExportResult>;
}

// ============================================================================
// REACT COMPONENT PROPS
// ============================================================================

export interface BuilderComponentProps {
  state: AppState;
  dispatch: (action: Action) => void;
}

export interface SectionPreviewProps {
  section: SectionInstance;
  content: Record<string, unknown>;
  brand: BrandSettings;
  settings: SiteSettings;
  isActive: boolean;
  spacing: SectionSpacing;
  onClick?: () => void;
  onDoubleClick?: () => void;
}

export interface SidebarProps extends BuilderComponentProps {
  className?: string;
  ariaLabel?: string;
}

export interface ToolbarProps extends BuilderComponentProps {
  mode: BuilderMode;
  canDesign: boolean;
  canExport: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onModeChange: (mode: BuilderMode) => void;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type PayloadOf<A extends Action> = A extends Action<infer P> ? P : never;
export type Listener = () => void;
export type Unsubscribe = () => void;
export type RequireKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type ArrayElement<T> = T extends readonly (infer E)[] ? E : never;
