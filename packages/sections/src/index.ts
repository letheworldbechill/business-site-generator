/**
 * @sb/sections - Section Registry für Smooth Builder
 * 
 * Verwaltet alle verfügbaren Section-Typen mit:
 * - Dynamischer Registrierung
 * - Plugin-Unterstützung
 * - Validierung
 * - Legacy-Alias-Mapping
 */

import type {
  SectionType,
  SectionDefinition,
  SectionVariant,
  FieldDefinition,
  ISectionRegistry
} from '@sb/types';

// ============================================================================
// REGISTRY IMPLEMENTATION
// ============================================================================

class SectionRegistryImpl implements ISectionRegistry {
  private definitions = new Map<SectionType, SectionDefinition>();
  private aliases = new Map<string, SectionType>();
  
  /**
   * Registriert eine neue Section-Definition
   */
  register(definition: SectionDefinition): void {
    // Validierung
    if (!definition.type) {
      throw new Error('Section definition must have a type');
    }
    
    if (this.definitions.has(definition.type)) {
      console.warn(`Section type "${definition.type}" is already registered. Overwriting.`);
    }
    
    // Normalisierung
    const normalized: SectionDefinition = {
      ...definition,
      type: definition.type.toLowerCase() as SectionType,
      variants: definition.variants || [{ id: 'default', label: 'Standard' }],
      defaultVariant: definition.defaultVariant || 'default',
      fields: definition.fields || [],
      defaults: definition.defaults || {}
    };
    
    this.definitions.set(normalized.type, normalized);
    
    // Aliases registrieren
    if (definition.aliasTo) {
      this.aliases.set(definition.type, definition.aliasTo as SectionType);
    }
  }
  
  /**
   * Entfernt eine Section-Definition
   */
  unregister(type: SectionType): void {
    this.definitions.delete(type);
    // Aliases entfernen, die auf diesen Typ zeigen
    for (const [alias, target] of this.aliases) {
      if (target === type) {
        this.aliases.delete(alias);
      }
    }
  }
  
  /**
   * Gibt eine Section-Definition zurück
   */
  get(type: SectionType): SectionDefinition | undefined {
    // Alias auflösen
    const resolvedType = this.aliases.get(type) ?? type;
    return this.definitions.get(resolvedType);
  }
  
  /**
   * Gibt alle Section-Definitionen zurück
   */
  getAll(): SectionDefinition[] {
    return Array.from(this.definitions.values())
      .filter(d => !d.deprecated);
  }
  
  /**
   * Prüft, ob ein Section-Typ existiert
   */
  has(type: SectionType): boolean {
    const resolvedType = this.aliases.get(type) ?? type;
    return this.definitions.has(resolvedType);
  }
  
  /**
   * Gibt alle Section-Typen zurück
   */
  getTypes(): SectionType[] {
    return Array.from(this.definitions.keys())
      .filter(type => !this.definitions.get(type)?.deprecated);
  }
  
  /**
   * Löst einen Alias auf
   */
  resolveAlias(type: string): SectionType {
    return this.aliases.get(type) ?? type as SectionType;
  }
  
  /**
   * Gibt Varianten für einen Section-Typ zurück
   */
  getVariants(type: SectionType): SectionVariant[] {
    const def = this.get(type);
    return def?.variants ?? [{ id: 'default', label: 'Standard' }];
  }
  
  /**
   * Gibt Felder für einen Section-Typ zurück
   */
  getFields(type: SectionType): FieldDefinition[] {
    const def = this.get(type);
    return def?.fields ?? [];
  }
  
  /**
   * Gibt Default-Werte für einen Section-Typ zurück
   */
  getDefaults(type: SectionType): Record<string, unknown> {
    const def = this.get(type);
    return { ...def?.defaults } ?? {};
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const SectionRegistry = new SectionRegistryImpl();

// ============================================================================
// BUILT-IN SECTION DEFINITIONS
// ============================================================================

const builtInSections: SectionDefinition[] = [
  // Header
  {
    type: 'header',
    name: 'Header',
    icon: '📌',
    description: 'Navigation und Logo',
    variants: [
      { id: 'simple', label: 'Einfach' },
      { id: 'centered', label: 'Zentriert' },
      { id: 'split', label: 'Logo links, Nav rechts' },
      { id: 'transparent', label: 'Transparent' }
    ],
    defaultVariant: 'simple',
    fields: [
      { key: 'brandName', label: 'Brand Name', type: 'text', placeholder: 'Firma AG' },
      { key: 'nav', label: 'Navigation', type: 'list', itemLabel: 'Link', itemShape: { label: 'text', href: 'text' } },
      { key: 'ctaLabel', label: 'CTA Label', type: 'text', placeholder: 'Kontakt' },
      { key: 'ctaHref', label: 'CTA Link', type: 'text', placeholder: '#kontakt' }
    ],
    defaults: {
      brandName: 'Meine Website',
      nav: [
        { label: 'Leistungen', href: '#leistungen' },
        { label: 'Über uns', href: '#team' },
        { label: 'FAQ', href: '#faq' }
      ],
      ctaLabel: 'Kontakt',
      ctaHref: '#kontakt'
    }
  },
  
  // Hero
  {
    type: 'hero',
    name: 'Hero',
    icon: '🎯',
    description: 'Hauptbereich mit Headline',
    variants: [
      { id: 'centered', label: 'Zentriert', description: 'Text mittig, CTA darunter' },
      { id: 'split', label: 'Split', description: 'Text links, Bild rechts' },
      { id: 'split-reverse', label: 'Split Reverse', description: 'Bild links, Text rechts' },
      { id: 'fullscreen', label: 'Fullscreen', description: 'Hintergrundbild, Text overlay' },
      { id: 'minimal', label: 'Minimal', description: 'Nur Headline + CTA' }
    ],
    defaultVariant: 'centered',
    fields: [
      { key: 'headline', label: 'Headline', type: 'text' },
      { key: 'subline', label: 'Subline', type: 'textarea' },
      { key: 'ctaLabel', label: 'CTA Label', type: 'text' },
      { key: 'ctaHref', label: 'CTA Link', type: 'text' },
      { key: 'image', label: 'Bild', type: 'image' }
    ],
    defaults: {
      headline: 'Schnell zu einer starken Landingpage',
      subline: 'Canvas-first Builder für Schweizer Standards.',
      ctaLabel: 'Offerte anfragen',
      ctaHref: '#kontakt',
      image: null
    }
  },
  
  // Trustbar
  {
    type: 'trustbar',
    name: 'Trust Bar',
    icon: '🤝',
    description: 'Logos / Trust Elemente',
    variants: [
      { id: 'logos', label: 'Nur Logos' },
      { id: 'logos-text', label: 'Logos + Text' },
      { id: 'stats', label: 'Kennzahlen' },
      { id: 'badges', label: 'Badges' }
    ],
    defaultVariant: 'logos',
    fields: [
      { key: 'items', label: 'Items', type: 'list', itemLabel: 'Item', itemShape: { label: 'text', value: 'text', icon: 'text' } }
    ],
    defaults: {
      items: [
        { label: 'Schweizer Qualität', value: '', icon: '🇨🇭' },
        { label: 'Datenschutz', value: '', icon: '🔒' },
        { label: 'Schnelle Umsetzung', value: '', icon: '⚡' }
      ]
    }
  },
  
  // Services
  {
    type: 'services',
    name: 'Services',
    icon: '🔧',
    description: 'Leistungen / Angebote',
    variants: [
      { id: 'grid-2', label: '2 Spalten' },
      { id: 'grid-3', label: '3 Spalten' },
      { id: 'grid-4', label: '4 Spalten' },
      { id: 'list', label: 'Liste' }
    ],
    defaultVariant: 'grid-2',
    fields: [
      { key: 'headline', label: 'Headline', type: 'text' },
      { key: 'items', label: 'Services', type: 'list', itemLabel: 'Service', itemShape: { title: 'text', text: 'textarea', icon: 'text' } }
    ],
    defaults: {
      headline: 'Leistungen',
      items: [
        { title: 'Beratung', text: 'Klare Analyse und pragmatische Umsetzung.', icon: '💡' },
        { title: 'Umsetzung', text: 'Schnell, sauber, zuverlässig.', icon: '🛠' },
        { title: 'Support', text: 'Begleitung nach dem Launch.', icon: '📞' }
      ]
    }
  },
  
  // Benefits
  {
    type: 'benefits',
    name: 'Benefits',
    icon: '✨',
    description: 'Vorteile / Nutzen',
    variants: [
      { id: 'grid-2', label: '2 Spalten' },
      { id: 'grid-3', label: '3 Spalten' },
      { id: 'list', label: 'Liste mit Icons' }
    ],
    defaultVariant: 'grid-3',
    fields: [
      { key: 'headline', label: 'Headline', type: 'text' },
      { key: 'items', label: 'Benefits', type: 'list', itemLabel: 'Benefit', itemShape: { title: 'text', text: 'textarea', icon: 'text' } }
    ],
    defaults: {
      headline: 'Ihre Vorteile',
      items: [
        { title: 'Schnell', text: 'Von Entwurf zu Export in Minuten.', icon: '⚡' },
        { title: 'Professionell', text: 'Schweizer Qualität im Design.', icon: '🇨🇭' },
        { title: 'Flexibel', text: 'Eigene Inhalte, eigene Struktur.', icon: '🧩' }
      ]
    }
  },
  
  // Team
  {
    type: 'team',
    name: 'Team',
    icon: '👥',
    description: 'Team-Vorstellung',
    variants: [
      { id: 'grid', label: 'Grid' },
      { id: 'cards', label: 'Karten' },
      { id: 'minimal', label: 'Minimal' }
    ],
    defaultVariant: 'grid',
    fields: [
      { key: 'headline', label: 'Headline', type: 'text' },
      { key: 'members', label: 'Mitglieder', type: 'list', itemLabel: 'Person', itemShape: { name: 'text', role: 'text', bio: 'textarea', image: 'image' } }
    ],
    defaults: {
      headline: 'Unser Team',
      members: [
        { name: 'Max Muster', role: 'Geschäftsführer', bio: 'Langjährige Erfahrung.', image: null },
        { name: 'Anna Beispiel', role: 'Design', bio: 'Kreativ und detailgenau.', image: null }
      ]
    }
  },
  
  // Testimonials
  {
    type: 'testimonials',
    name: 'Testimonials',
    icon: '💬',
    description: 'Kundenstimmen',
    variants: [
      { id: 'grid', label: 'Grid' },
      { id: 'slider', label: 'Slider' },
      { id: 'single', label: 'Einzeln' }
    ],
    defaultVariant: 'grid',
    fields: [
      { key: 'headline', label: 'Headline', type: 'text' },
      { key: 'items', label: 'Testimonials', type: 'list', itemLabel: 'Testimonial', itemShape: { quote: 'textarea', name: 'text', role: 'text', image: 'image' } }
    ],
    defaults: {
      headline: 'Was Kunden sagen',
      items: [
        { quote: 'Schnell, professionell, genau was wir brauchten.', name: 'A. Kundin', role: 'Geschäftsführung', image: null },
        { quote: 'Top Service und sehr saubere Umsetzung.', name: 'B. Kunde', role: 'Inhaber', image: null }
      ]
    }
  },
  
  // FAQ
  {
    type: 'faq',
    name: 'FAQ',
    icon: '❓',
    description: 'Fragen & Antworten',
    variants: [
      { id: 'accordion', label: 'Akkordeon' },
      { id: 'two-column', label: 'Zwei Spalten' },
      { id: 'list', label: 'Liste' }
    ],
    defaultVariant: 'accordion',
    fields: [
      { key: 'headline', label: 'Headline', type: 'text' },
      { key: 'items', label: 'Fragen', type: 'list', itemLabel: 'FAQ', itemShape: { q: 'text', a: 'textarea' } }
    ],
    defaults: {
      headline: 'FAQ',
      items: [
        { q: 'Wie schnell kann ich exportieren?', a: 'Sobald Struktur und Pflichtinhalte stehen, ist Export möglich.' },
        { q: 'Bleibt alles offline?', a: 'Ja. Alles läuft lokal im Browser und wird in LocalStorage gespeichert.' }
      ]
    }
  },
  
  // CTA
  {
    type: 'cta',
    name: 'CTA',
    icon: '🚀',
    description: 'Call-to-Action',
    variants: [
      { id: 'centered', label: 'Zentriert' },
      { id: 'split', label: 'Split' },
      { id: 'banner', label: 'Full-width Banner' }
    ],
    defaultVariant: 'centered',
    fields: [
      { key: 'headline', label: 'Headline', type: 'text' },
      { key: 'text', label: 'Text', type: 'textarea' },
      { key: 'ctaLabel', label: 'CTA Label', type: 'text' },
      { key: 'ctaHref', label: 'CTA Link', type: 'text' }
    ],
    defaults: {
      headline: 'Bereit für den nächsten Schritt?',
      text: 'Erhalte eine schnelle Einschätzung und ein klares Angebot.',
      ctaLabel: 'Kontakt aufnehmen',
      ctaHref: '#kontakt'
    }
  },
  
  // Footer
  {
    type: 'footer',
    name: 'Footer',
    icon: '📍',
    description: 'Footer mit Links & Legal',
    variants: [
      { id: 'simple', label: 'Einfach' },
      { id: 'columns', label: 'Mit Spalten' },
      { id: 'minimal', label: 'Minimal' }
    ],
    defaultVariant: 'simple',
    fields: [
      { key: 'companyName', label: 'Firma', type: 'text' },
      { key: 'address', label: 'Adresse', type: 'textarea' },
      { key: 'email', label: 'E-Mail', type: 'text' },
      { key: 'phone', label: 'Telefon', type: 'text' },
      { key: 'legal', label: 'Legal Links', type: 'list', itemLabel: 'Link', itemShape: { label: 'text', href: 'text' } },
      { key: 'copyright', label: 'Copyright', type: 'text' }
    ],
    defaults: {
      companyName: 'Meine Firma AG',
      address: 'Musterstrasse 1\n8000 Zürich',
      email: 'info@firma.ch',
      phone: '+41 44 000 00 00',
      legal: [
        { label: 'Impressum', href: '/impressum' },
        { label: 'Datenschutz', href: '/datenschutz' }
      ],
      copyright: '© 2024'
    }
  },
  
  // Cookie
  {
    type: 'cookie',
    name: 'Cookie Banner',
    icon: '🍪',
    description: 'Cookie-Consent-Banner',
    variants: [
      { id: 'banner', label: 'Banner' },
      { id: 'modal', label: 'Modal' },
      { id: 'minimal', label: 'Minimal' }
    ],
    defaultVariant: 'banner',
    fields: [
      { key: 'title', label: 'Titel', type: 'text' },
      { key: 'text', label: 'Text', type: 'textarea' },
      { key: 'privacyLink', label: 'Datenschutz-Link', type: 'text' }
    ],
    defaults: {
      title: 'Cookies',
      text: 'Wir verwenden Cookies, um die Nutzung zu verbessern. Du kannst deine Auswahl jederzeit anpassen.',
      privacyLink: '/datenschutz'
    }
  },
  
  // Custom
  {
    type: 'custom',
    name: 'Custom Section',
    icon: '🧩',
    description: 'Freier Container für eigene Elemente',
    isCustom: true,
    variants: [
      { id: 'full', label: 'Volle Breite' },
      { id: 'contained', label: 'Container' },
      { id: 'narrow', label: 'Schmal' }
    ],
    defaultVariant: 'contained',
    fields: [
      { key: 'elements', label: 'Elemente', type: 'custom-elements' }
    ],
    defaults: {
      elements: []
    },
    allowedElements: ['headline', 'text', 'button', 'image', 'spacer', 'divider', 'columns']
  },
  
  // Legacy Aliases
  {
    type: 'trust',
    name: 'Trust (Legacy)',
    icon: '🤝',
    description: 'Logos / Trust Elemente',
    deprecated: true,
    aliasTo: 'trustbar',
    variants: [{ id: 'logos', label: 'Nur Logos' }],
    defaultVariant: 'logos',
    fields: [],
    defaults: {}
  },
  
  {
    type: 'stickyCta',
    name: 'Sticky CTA (Legacy)',
    icon: '📣',
    description: 'Sticky Call-to-Action',
    deprecated: true,
    aliasTo: 'cta',
    variants: [{ id: 'bar', label: 'Bar' }],
    defaultVariant: 'bar',
    fields: [],
    defaults: {}
  }
];

// Registriere alle Built-in Sections
builtInSections.forEach(def => SectionRegistry.register(def));

// ============================================================================
// EXPORTS
// ============================================================================

export type { SectionDefinition, SectionVariant, FieldDefinition };

/**
 * Helper zum Registrieren von Section-Plugins
 */
export function registerSection(definition: SectionDefinition): void {
  SectionRegistry.register(definition);
}

/**
 * Helper zum Abrufen aller verfügbaren Sections
 */
export function getAvailableSections(): SectionDefinition[] {
  return SectionRegistry.getAll();
}

/**
 * Helper zum Gruppieren von Sections nach Kategorie
 */
export function getSectionsByCategory(): Record<string, SectionDefinition[]> {
  const sections = SectionRegistry.getAll();
  
  const categories: Record<string, SectionType[]> = {
    'Navigation': ['header', 'footer'],
    'Hero': ['hero'],
    'Trust & Social Proof': ['trustbar', 'authority', 'testimonials'],
    'Inhalt': ['services', 'benefits', 'process', 'proofTable', 'team', 'gallery'],
    'Interaktion': ['faq', 'cta', 'cookie'],
    'Custom': ['custom']
  };
  
  const result: Record<string, SectionDefinition[]> = {};
  
  for (const [category, types] of Object.entries(categories)) {
    result[category] = types
      .map(type => sections.find(s => s.type === type))
      .filter(Boolean) as SectionDefinition[];
  }
  
  return result;
}
