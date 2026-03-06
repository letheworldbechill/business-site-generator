/**
 * @sb/templates - Template Registry für Smooth Builder
 * 
 * Verwaltet alle verfügbaren Website-Templates mit:
 * - Branchenspezifische Vorlagen
 * - Theme-Definitionen
 * - Section-Konfigurationen
 */

import type { TemplateDefinition, ITemplateRegistry } from '@sb/types';

// ============================================================================
// REGISTRY IMPLEMENTATION
// ============================================================================

class TemplateRegistryImpl implements ITemplateRegistry {
  private templates = new Map<string, TemplateDefinition>();
  
  register(template: TemplateDefinition): void {
    if (!template.id) {
      throw new Error('Template must have an id');
    }
    
    if (this.templates.has(template.id)) {
      console.warn(`Template "${template.id}" already registered. Overwriting.`);
    }
    
    this.templates.set(template.id, template);
  }
  
  unregister(id: string): void {
    this.templates.delete(id);
  }
  
  get(id: string): TemplateDefinition | undefined {
    return this.templates.get(id);
  }
  
  getAll(): TemplateDefinition[] {
    return Array.from(this.templates.values());
  }
  
  getByIndustry(industry: string): TemplateDefinition[] {
    return this.getAll().filter(t => t.industry === industry);
  }
  
  getIndustries(): string[] {
    const industries = new Set(this.getAll().map(t => t.industry));
    return Array.from(industries);
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const TemplateRegistry = new TemplateRegistryImpl();

// ============================================================================
// SWISS MARKET TEMPLATES
// ============================================================================

const swissTemplates: TemplateDefinition[] = [
  // Schweizer KMU (Standard)
  {
    id: 'schweizer-kmu',
    name: 'Schweizer KMU',
    description: 'Professionelle Landingpage für kleine und mittlere Unternehmen',
    industry: 'general',
    icon: '🇨🇭',
    components: {
      header: {
        enabled: true,
        variant: 'simple',
        data: {
          brandName: 'Meine Firma AG',
          nav: [
            { label: 'Leistungen', href: '#leistungen' },
            { label: 'Über uns', href: '#team' },
            { label: 'FAQ', href: '#faq' }
          ],
          ctaLabel: 'Kontakt',
          ctaHref: '#kontakt'
        }
      },
      hero: {
        enabled: true,
        variant: 'centered',
        data: {
          headline: 'Ihr Partner für Erfolg',
          subline: 'Professionelle Lösungen für Schweizer Unternehmen.',
          ctaLabel: 'Offerte anfragen',
          ctaHref: '#kontakt'
        }
      },
      trustbar: {
        enabled: true,
        variant: 'logos',
        data: {
          items: [
            { label: 'Schweizer Qualität', icon: '🇨🇭' },
            { label: 'Datenschutz', icon: '🔒' },
            { label: 'Persönlicher Service', icon: '👤' }
          ]
        }
      },
      services: {
        enabled: true,
        variant: 'grid-3',
        data: {
          headline: 'Leistungen',
          items: [
            { title: 'Beratung', text: 'Professionelle Beratung für Ihr Unternehmen.', icon: '💡' },
            { title: 'Umsetzung', text: 'Schnelle und zuverlässige Umsetzung.', icon: '🛠' },
            { title: 'Support', text: 'Langfristige Begleitung.', icon: '📞' }
          ]
        }
      },
      team: {
        enabled: true,
        variant: 'grid',
        data: {
          headline: 'Unser Team',
          members: [
            { name: 'Max Muster', role: 'Geschäftsführer', bio: 'Langjährige Erfahrung.' },
            { name: 'Anna Beispiel', role: 'Projektleitung', bio: 'Strukturiert und zuverlässig.' }
          ]
        }
      },
      faq: {
        enabled: true,
        variant: 'accordion',
        data: {
          headline: 'Häufige Fragen',
          items: [
            { q: 'Wie kann ich Sie erreichen?', a: 'Per Telefon oder E-Mail.' },
            { q: 'Wie schnell erhalte ich eine Offerte?', a: 'Innert 24 Stunden.' }
          ]
        }
      },
      cta: {
        enabled: true,
        variant: 'centered',
        data: {
          headline: 'Bereit für den nächsten Schritt?',
          text: 'Kontaktieren Sie uns für eine unverbindliche Beratung.',
          ctaLabel: 'Jetzt anfragen',
          ctaHref: '#kontakt'
        }
      },
      footer: {
        enabled: true,
        variant: 'simple',
        data: {
          companyName: 'Meine Firma AG',
          address: 'Musterstrasse 1\n8000 Zürich',
          email: 'info@firma.ch',
          phone: '+41 44 000 00 00',
          legal: [
            { label: 'Impressum', href: '/impressum' },
            { label: 'Datenschutz', href: '/datenschutz' }
          ]
        }
      }
    },
    theme: {
      primary: '#0f766e',
      accent: '#f59e0b',
      background: '#ffffff',
      surface: '#f8fafc',
      text: '#0f172a',
      textLight: '#64748b',
      radius: 'rounded',
      darkMode: false,
      fontStack: 'inter'
    }
  },
  
  // Treuhand
  {
    id: 'treuhand',
    name: 'Treuhand & Finanzen',
    description: 'Vertrauenswürdiges Design für Treuhänder und Finanzdienstleister',
    industry: 'finance',
    icon: '📊',
    components: {
      header: {
        enabled: true,
        variant: 'simple',
        data: {
          brandName: 'Muster Treuhand AG',
          nav: [
            { label: 'Dienstleistungen', href: '#leistungen' },
            { label: 'Über uns', href: '#team' },
            { label: 'Kontakt', href: '#kontakt' }
          ],
          ctaLabel: 'Termin vereinbaren',
          ctaHref: '#kontakt'
        }
      },
      hero: {
        enabled: true,
        variant: 'split',
        data: {
          headline: 'Ihr Treuhänder in der Region',
          subline: 'Buchhaltung, Steuern und Unternehmensberatung aus einer Hand.',
          ctaLabel: 'Erstgespräch vereinbaren',
          ctaHref: '#kontakt'
        }
      },
      trustbar: {
        enabled: true,
        variant: 'badges',
        data: {
          items: [
            { label: 'TREUHAND|SUISSE', icon: '✓' },
            { label: 'revDSG konform', icon: '🔒' },
            { label: '25+ Jahre Erfahrung', icon: '⭐' }
          ]
        }
      },
      services: {
        enabled: true,
        variant: 'grid-3',
        data: {
          headline: 'Unsere Dienstleistungen',
          items: [
            { title: 'Buchhaltung', text: 'Laufende Buchführung und Jahresabschluss.', icon: '📚' },
            { title: 'Steuern', text: 'Steuerberatung und -optimierung.', icon: '📋' },
            { title: 'Beratung', text: 'Unternehmensberatung und Nachfolgeplanung.', icon: '💼' },
            { title: 'Lohnbuchhaltung', text: 'Lohnadministration und Sozialversicherungen.', icon: '👥' },
            { title: 'Revision', text: 'Eingeschränkte Revision nach OR.', icon: '✔️' },
            { title: 'Gründung', text: 'Firmengründung und Umstrukturierung.', icon: '🏢' }
          ]
        }
      },
      team: {
        enabled: true,
        variant: 'cards',
        data: {
          headline: 'Unser Team',
          members: [
            { name: 'Dr. Hans Muster', role: 'Inhaber, dipl. Treuhandexperte', bio: 'Über 30 Jahre Erfahrung.' },
            { name: 'Maria Beispiel', role: 'Leiterin Buchhaltung', bio: 'Fachausweis Finanz- und Rechnungswesen.' }
          ]
        }
      },
      testimonials: {
        enabled: true,
        variant: 'grid',
        data: {
          headline: 'Das sagen unsere Kunden',
          items: [
            { quote: 'Kompetent, zuverlässig und immer erreichbar.', name: 'A. Kundin', role: 'Geschäftsführerin' },
            { quote: 'Endlich ein Treuhänder, der mitdenkt.', name: 'B. Kunde', role: 'Inhaber KMU' }
          ]
        }
      },
      cta: {
        enabled: true,
        variant: 'banner',
        data: {
          headline: 'Kostenlose Erstberatung',
          text: 'Lernen Sie uns unverbindlich kennen.',
          ctaLabel: 'Termin buchen',
          ctaHref: '#kontakt'
        }
      },
      footer: {
        enabled: true,
        variant: 'columns',
        data: {
          companyName: 'Muster Treuhand AG',
          address: 'Bahnhofstrasse 10\n8000 Zürich',
          email: 'info@muster-treuhand.ch',
          phone: '+41 44 000 00 00',
          legal: [
            { label: 'Impressum', href: '/impressum' },
            { label: 'Datenschutz', href: '/datenschutz' }
          ]
        }
      }
    },
    theme: {
      primary: '#1e40af',
      accent: '#0f766e',
      background: '#ffffff',
      surface: '#f1f5f9',
      text: '#0f172a',
      textLight: '#475569',
      radius: 'rounded',
      darkMode: false,
      fontStack: 'system'
    }
  },
  
  // Arztpraxis
  {
    id: 'arztpraxis',
    name: 'Arztpraxis',
    description: 'Professionelles und vertrauenswürdiges Design für medizinische Praxen',
    industry: 'medical',
    icon: '🏥',
    components: {
      header: {
        enabled: true,
        variant: 'simple',
        data: {
          brandName: 'Praxis Dr. Muster',
          nav: [
            { label: 'Leistungen', href: '#leistungen' },
            { label: 'Team', href: '#team' },
            { label: 'Kontakt', href: '#kontakt' }
          ],
          ctaLabel: 'Termin buchen',
          ctaHref: '#kontakt'
        }
      },
      hero: {
        enabled: true,
        variant: 'centered',
        data: {
          headline: 'Ihre Gesundheit in guten Händen',
          subline: 'Hausarztpraxis mit persönlicher Betreuung.',
          ctaLabel: 'Online Termin buchen',
          ctaHref: '#kontakt'
        }
      },
      services: {
        enabled: true,
        variant: 'grid-3',
        data: {
          headline: 'Unsere Leistungen',
          items: [
            { title: 'Allgemeinmedizin', text: 'Umfassende hausärztliche Versorgung.', icon: '🩺' },
            { title: 'Check-ups', text: 'Präventive Vorsorgeuntersuchungen.', icon: '✅' },
            { title: 'Impfungen', text: 'Reise- und Standardimpfungen.', icon: '💉' }
          ]
        }
      },
      team: {
        enabled: true,
        variant: 'grid',
        data: {
          headline: 'Unser Praxisteam',
          members: [
            { name: 'Dr. med. Hans Muster', role: 'Facharzt für Allgemeinmedizin', bio: '' },
            { name: 'Petra Beispiel', role: 'MPA', bio: '' }
          ]
        }
      },
      faq: {
        enabled: true,
        variant: 'accordion',
        data: {
          headline: 'Häufige Fragen',
          items: [
            { q: 'Wie buche ich einen Termin?', a: 'Online oder telefonisch.' },
            { q: 'Welche Versicherungen werden akzeptiert?', a: 'Alle Schweizer Krankenversicherungen.' }
          ]
        }
      },
      footer: {
        enabled: true,
        variant: 'simple',
        data: {
          companyName: 'Praxis Dr. Muster',
          address: 'Gesundheitsweg 5\n8000 Zürich',
          email: 'praxis@dr-muster.ch',
          phone: '+41 44 000 00 00',
          legal: [
            { label: 'Impressum', href: '/impressum' },
            { label: 'Datenschutz', href: '/datenschutz' }
          ]
        }
      }
    },
    theme: {
      primary: '#0891b2',
      accent: '#059669',
      background: '#ffffff',
      surface: '#f0fdfa',
      text: '#0f172a',
      textLight: '#64748b',
      radius: 'rounded',
      darkMode: false,
      fontStack: 'system'
    }
  },
  
  // Handwerker
  {
    id: 'handwerker',
    name: 'Handwerk & Gewerbe',
    description: 'Direkt und professionell für Handwerksbetriebe',
    industry: 'trades',
    icon: '🔧',
    components: {
      header: {
        enabled: true,
        variant: 'simple',
        data: {
          brandName: 'Muster Schreinerei',
          nav: [
            { label: 'Leistungen', href: '#leistungen' },
            { label: 'Galerie', href: '#galerie' },
            { label: 'Kontakt', href: '#kontakt' }
          ],
          ctaLabel: 'Offerte anfragen',
          ctaHref: '#kontakt'
        }
      },
      hero: {
        enabled: true,
        variant: 'split',
        data: {
          headline: 'Qualität aus Meisterhand',
          subline: 'Massgeschneiderte Lösungen in Holz seit 1985.',
          ctaLabel: 'Unverbindliche Offerte',
          ctaHref: '#kontakt'
        }
      },
      trustbar: {
        enabled: true,
        variant: 'stats',
        data: {
          items: [
            { label: 'Jahre Erfahrung', value: '35+', icon: '' },
            { label: 'Projekte', value: '500+', icon: '' },
            { label: 'Zufriedene Kunden', value: '100%', icon: '' }
          ]
        }
      },
      services: {
        enabled: true,
        variant: 'grid-2',
        data: {
          headline: 'Unsere Leistungen',
          items: [
            { title: 'Möbel nach Mass', text: 'Individuelle Möbel für jeden Raum.', icon: '🪑' },
            { title: 'Küchen', text: 'Traumküchen nach Ihren Wünschen.', icon: '🍳' },
            { title: 'Türen & Fenster', text: 'Hochwertige Holzarbeiten.', icon: '🚪' },
            { title: 'Reparaturen', text: 'Schneller Service vor Ort.', icon: '🔨' }
          ]
        }
      },
      testimonials: {
        enabled: true,
        variant: 'single',
        data: {
          headline: 'Das sagen unsere Kunden',
          items: [
            { quote: 'Perfekte Arbeit, pünktlich und sauber. Sehr zu empfehlen!', name: 'Familie Muster', role: 'Zürich' }
          ]
        }
      },
      cta: {
        enabled: true,
        variant: 'centered',
        data: {
          headline: 'Ihr Projekt wartet',
          text: 'Lassen Sie uns über Ihre Ideen sprechen.',
          ctaLabel: 'Jetzt anfragen',
          ctaHref: '#kontakt'
        }
      },
      footer: {
        enabled: true,
        variant: 'simple',
        data: {
          companyName: 'Muster Schreinerei GmbH',
          address: 'Werkstrasse 15\n8000 Zürich',
          email: 'info@muster-schreinerei.ch',
          phone: '+41 44 000 00 00',
          legal: [
            { label: 'Impressum', href: '/impressum' },
            { label: 'Datenschutz', href: '/datenschutz' }
          ]
        }
      }
    },
    theme: {
      primary: '#854d0e',
      accent: '#ca8a04',
      background: '#ffffff',
      surface: '#fefce8',
      text: '#1c1917',
      textLight: '#57534e',
      radius: 'sharp',
      darkMode: false,
      fontStack: 'system'
    }
  },
  
  // Restaurant
  {
    id: 'restaurant',
    name: 'Restaurant & Gastro',
    description: 'Einladendes Design für Restaurants und Cafés',
    industry: 'gastro',
    icon: '🍽️',
    components: {
      header: {
        enabled: true,
        variant: 'centered',
        data: {
          brandName: 'Restaurant Muster',
          nav: [
            { label: 'Speisekarte', href: '#menu' },
            { label: 'Über uns', href: '#about' },
            { label: 'Kontakt', href: '#kontakt' }
          ],
          ctaLabel: 'Tisch reservieren',
          ctaHref: '#kontakt'
        }
      },
      hero: {
        enabled: true,
        variant: 'fullscreen',
        data: {
          headline: 'Willkommen im Muster',
          subline: 'Frische Küche mit regionalen Zutaten.',
          ctaLabel: 'Tisch reservieren',
          ctaHref: '#kontakt'
        }
      },
      services: {
        enabled: true,
        variant: 'grid-3',
        data: {
          headline: 'Unsere Küche',
          items: [
            { title: 'Saisonal', text: 'Frische Zutaten der Saison.', icon: '🥬' },
            { title: 'Regional', text: 'Produkte aus der Region.', icon: '🏔️' },
            { title: 'Hausgemacht', text: 'Mit Liebe zubereitet.', icon: '👨‍🍳' }
          ]
        }
      },
      cta: {
        enabled: true,
        variant: 'banner',
        data: {
          headline: 'Reservieren Sie Ihren Tisch',
          text: 'Wir freuen uns auf Ihren Besuch.',
          ctaLabel: 'Jetzt reservieren',
          ctaHref: 'tel:+41440000000'
        }
      },
      footer: {
        enabled: true,
        variant: 'columns',
        data: {
          companyName: 'Restaurant Muster',
          address: 'Genussweg 8\n8000 Zürich',
          email: 'info@restaurant-muster.ch',
          phone: '+41 44 000 00 00',
          legal: [
            { label: 'Impressum', href: '/impressum' },
            { label: 'Datenschutz', href: '/datenschutz' }
          ]
        }
      }
    },
    theme: {
      primary: '#7f1d1d',
      accent: '#b91c1c',
      background: '#fef2f2',
      surface: '#ffffff',
      text: '#1c1917',
      textLight: '#57534e',
      radius: 'rounded',
      darkMode: false,
      fontStack: 'serif'
    }
  },
  
  // IT-Dienstleister
  {
    id: 'it-dienstleister',
    name: 'IT & Digital',
    description: 'Modernes Design für IT-Unternehmen und Agenturen',
    industry: 'tech',
    icon: '💻',
    components: {
      header: {
        enabled: true,
        variant: 'transparent',
        data: {
          brandName: 'TechMuster AG',
          nav: [
            { label: 'Services', href: '#services' },
            { label: 'Technologien', href: '#tech' },
            { label: 'Kontakt', href: '#kontakt' }
          ],
          ctaLabel: 'Projekt starten',
          ctaHref: '#kontakt'
        }
      },
      hero: {
        enabled: true,
        variant: 'split',
        data: {
          headline: 'Digitale Lösungen für morgen',
          subline: 'Wir entwickeln Software, die Ihr Business voranbringt.',
          ctaLabel: 'Projekt besprechen',
          ctaHref: '#kontakt'
        }
      },
      trustbar: {
        enabled: true,
        variant: 'logos',
        data: {
          items: [
            { label: 'AWS Partner', icon: '☁️' },
            { label: 'ISO 27001', icon: '🔐' },
            { label: 'Agile', icon: '🔄' }
          ]
        }
      },
      services: {
        enabled: true,
        variant: 'grid-3',
        data: {
          headline: 'Unsere Services',
          items: [
            { title: 'Software-Entwicklung', text: 'Massgeschneiderte Anwendungen.', icon: '⚙️' },
            { title: 'Cloud & DevOps', text: 'Skalierbare Infrastruktur.', icon: '☁️' },
            { title: 'IT-Beratung', text: 'Strategische Digitalberatung.', icon: '📊' }
          ]
        }
      },
      benefits: {
        enabled: true,
        variant: 'list',
        data: {
          headline: 'Warum wir',
          items: [
            { title: 'Swiss Made', text: 'Entwicklung und Hosting in der Schweiz.', icon: '🇨🇭' },
            { title: 'Agil', text: 'Flexible Zusammenarbeit.', icon: '🔄' },
            { title: 'Support', text: '24/7 Erreichbarkeit.', icon: '📞' }
          ]
        }
      },
      cta: {
        enabled: true,
        variant: 'centered',
        data: {
          headline: 'Bereit für Ihr nächstes Projekt?',
          text: 'Lassen Sie uns über Ihre Ideen sprechen.',
          ctaLabel: 'Gespräch vereinbaren',
          ctaHref: '#kontakt'
        }
      },
      footer: {
        enabled: true,
        variant: 'columns',
        data: {
          companyName: 'TechMuster AG',
          address: 'Digitalstrasse 42\n8000 Zürich',
          email: 'hello@techmuster.ch',
          phone: '+41 44 000 00 00',
          legal: [
            { label: 'Impressum', href: '/impressum' },
            { label: 'Datenschutz', href: '/datenschutz' }
          ]
        }
      }
    },
    theme: {
      primary: '#6366f1',
      accent: '#8b5cf6',
      background: '#0f172a',
      surface: '#1e293b',
      text: '#f1f5f9',
      textLight: '#94a3b8',
      radius: 'rounded',
      darkMode: true,
      fontStack: 'inter'
    }
  }
];

// Registriere alle Templates
swissTemplates.forEach(t => TemplateRegistry.register(t));

// ============================================================================
// EXPORTS
// ============================================================================

export type { TemplateDefinition };

/**
 * Helper zum Registrieren von Templates
 */
export function registerTemplate(template: TemplateDefinition): void {
  TemplateRegistry.register(template);
}

/**
 * Helper zum Abrufen aller Templates
 */
export function getAvailableTemplates(): TemplateDefinition[] {
  return TemplateRegistry.getAll();
}

/**
 * Helper zum Abrufen von Templates nach Branche
 */
export function getTemplatesByIndustry(industry: string): TemplateDefinition[] {
  return TemplateRegistry.getByIndustry(industry);
}

/**
 * Wendet ein Template auf den State an
 */
export function applyTemplate(templateId: string, state: import('@sb/types').AppState): import('@sb/types').AppState {
  const template = TemplateRegistry.get(templateId);
  if (!template) return state;
  
  const sections: import('@sb/types').SectionInstance[] = [];
  const order: string[] = [];
  const spacing: Record<string, { pt: number; pb: number }> = {};
  const content: Record<string, Record<string, unknown>> = {};
  
  let counter = 0;
  
  for (const [type, config] of Object.entries(template.components)) {
    if (!config.enabled) continue;
    
    const id = `${type}-${++counter}`;
    
    sections.push({
      id,
      type,
      variant: config.variant || 'default',
      enabled: true
    });
    
    order.push(id);
    spacing[id] = { pt: 64, pb: 64 };
    content[id] = { ...config.data };
  }
  
  return {
    ...state,
    layout: { sections, order, spacing },
    brand: {
      ...state.brand,
      colors: {
        primary: template.theme.primary,
        accent: template.theme.accent,
        background: template.theme.bg,
        surface: template.theme.surface,
        text: template.theme.text,
        textLight: template.theme.textLight,
        border: 'rgba(0,0,0,0.08)'
      },
      font: template.theme.fontStack,
      radius: template.theme.radius
    },
    content
  };
}
