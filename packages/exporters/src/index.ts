/**
 * @sb/exporters - Export-Orchestrierung für Smooth Builder
 * 
 * Koordiniert die Generatoren und erstellt:
 * - Preview HTML (inline CSS/JS)
 * - Production ZIP (separate Dateien)
 * - JSON Backup
 */

import { deepClone, filenameSafe, dataUrlToBytes, guessExtFromMime, downloadBlob, downloadText } from '@sb/utils';
import { generateStylesCSS, generateHTML, generateMainJS, generatePrivacyPage, generateImpressum } from '@sb/generators';
import type { AppState, ExportResult, IExporter } from '@sb/types';

// ============================================================================
// ASSET EXTRACTION
// ============================================================================

interface ExtractedAsset {
  key: string;
  filename: string;
  bytes: Uint8Array;
  mime: string;
}

/**
 * Extrahiert alle Data-URLs aus dem State und konvertiert sie zu Dateien
 */
function extractAssets(state: AppState): { assets: ExtractedAsset[]; replacements: Map<string, string> } {
  const assets: ExtractedAsset[] = [];
  const replacements = new Map<string, string>();
  const seen = new Map<string, string>(); // dataUrl -> filename (Deduplizierung)
  
  let counter = 0;
  
  function processDataUrl(dataUrl: string, prefix: string): string | null {
    if (!dataUrl || !dataUrl.startsWith('data:')) return null;
    
    // Deduplizierung via SHA-256-ähnlichem Check (hier vereinfacht)
    if (seen.has(dataUrl)) {
      return seen.get(dataUrl)!;
    }
    
    const parsed = dataUrlToBytes(dataUrl);
    if (!parsed) return null;
    
    const ext = guessExtFromMime(parsed.mime);
    const filename = `assets/${prefix}-${++counter}.${ext}`;
    
    assets.push({
      key: dataUrl,
      filename,
      bytes: parsed.bytes,
      mime: parsed.mime
    });
    
    seen.set(dataUrl, filename);
    replacements.set(dataUrl, filename);
    
    return filename;
  }
  
  // Logo
  if (state.brand.logo) {
    processDataUrl(state.brand.logo, 'logo');
  }
  
  // Content durchsuchen (Bilder in Sections)
  for (const [sectionId, content] of Object.entries(state.content)) {
    if (!content || typeof content !== 'object') continue;
    
    // Einzelne Bilder
    if (typeof (content as any).image === 'string') {
      processDataUrl((content as any).image, `img-${sectionId}`);
    }
    
    // Listen mit Bildern (Team, Testimonials, etc.)
    const lists = ['members', 'items', 'testimonials'];
    for (const listKey of lists) {
      const list = (content as any)[listKey];
      if (!Array.isArray(list)) continue;
      
      for (let i = 0; i < list.length; i++) {
        const item = list[i];
        if (item && typeof item.image === 'string') {
          processDataUrl(item.image, `${sectionId}-${i}`);
        }
      }
    }
  }
  
  return { assets, replacements };
}

/**
 * Ersetzt Data-URLs im State durch relative Pfade
 */
function replaceDataUrls(state: AppState, replacements: Map<string, string>): AppState {
  const clone = deepClone(state);
  
  // Logo
  if (clone.brand.logo && replacements.has(clone.brand.logo)) {
    clone.brand.logo = replacements.get(clone.brand.logo)!;
  }
  
  // Content
  for (const content of Object.values(clone.content)) {
    if (!content || typeof content !== 'object') continue;
    
    // Einzelne Bilder
    if (typeof (content as any).image === 'string' && replacements.has((content as any).image)) {
      (content as any).image = replacements.get((content as any).image);
    }
    
    // Listen
    const lists = ['members', 'items', 'testimonials'];
    for (const listKey of lists) {
      const list = (content as any)[listKey];
      if (!Array.isArray(list)) continue;
      
      for (const item of list) {
        if (item && typeof item.image === 'string' && replacements.has(item.image)) {
          item.image = replacements.get(item.image);
        }
      }
    }
  }
  
  return clone;
}

// ============================================================================
// PREVIEW EXPORTER
// ============================================================================

/**
 * Generiert Preview-HTML mit inline CSS und JS
 */
export function generatePreviewHTML(state: AppState): string {
  const css = generateStylesCSS(state);
  const js = generateMainJS(state);
  
  return generateHTML(state, {
    mode: 'preview',
    inlineCss: css,
    inlineJs: js
  });
}

/**
 * Exportiert Preview-HTML als Download
 */
export async function exportPreviewHTML(state: AppState): Promise<ExportResult> {
  try {
    const html = generatePreviewHTML(state);
    const filename = `${filenameSafe(state.settings.siteName)}-preview.html`;
    
    downloadText(html, filename, 'text/html;charset=utf-8');
    
    return { success: true, filename };
  } catch (error) {
    return { success: false, error: error as Error };
  }
}

// ============================================================================
// PRODUCTION ZIP EXPORTER
// ============================================================================

/**
 * Erstellt Production ZIP mit allen Dateien
 */
export async function exportProductionZip(state: AppState): Promise<ExportResult> {
  try {
    // JSZip dynamisch laden
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    
    // Assets extrahieren
    const { assets, replacements } = extractAssets(state);
    const processedState = replaceDataUrls(state, replacements);
    
    // Dateien generieren
    const css = generateStylesCSS(processedState);
    const js = generateMainJS(processedState);
    const html = generateHTML(processedState, {
      mode: 'production',
      cssHref: 'styles.css',
      jsSrc: 'main.js'
    });
    
    // Hauptdateien
    zip.file('index.html', html);
    zip.file('styles.css', css);
    zip.file('main.js', js);
    
    // Legal-Seiten
    zip.file('datenschutz.html', generatePrivacyPage(processedState));
    zip.file('impressum.html', generateImpressum(processedState));
    
    // Assets
    const assetsFolder = zip.folder('assets');
    for (const asset of assets) {
      const path = asset.filename.replace('assets/', '');
      assetsFolder?.file(path, asset.bytes);
    }
    
    // Backup JSON
    const backup = {
      version: 5,
      exportedAt: new Date().toISOString(),
      state: deepClone(state) // Original-State mit Data-URLs für Re-Import
    };
    zip.file('backup.json', JSON.stringify(backup, null, 2));
    
    // README
    const readme = `# ${state.settings.siteName}

Exportiert mit Smooth Builder 5.0
Datum: ${new Date().toLocaleDateString('de-CH')}

## Dateien
- index.html - Hauptseite
- styles.css - Stylesheets
- main.js - JavaScript
- datenschutz.html - Datenschutzerklärung
- impressum.html - Impressum
- assets/ - Bilder und Medien
- backup.json - Projekt-Backup für Re-Import

## Deployment
1. Alle Dateien auf Webserver hochladen
2. Oder via Netlify/Vercel deployen

## Support
support@smoothbuilder.ch
`;
    zip.file('README.md', readme);
    
    // ZIP generieren und downloaden
    const blob = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 9 }
    });
    
    const filename = `${filenameSafe(state.settings.siteName)}.zip`;
    downloadBlob(blob, filename);
    
    return { success: true, filename };
  } catch (error) {
    return { success: false, error: error as Error };
  }
}

// ============================================================================
// JSON EXPORTER
// ============================================================================

/**
 * Exportiert State als JSON-Backup
 */
export async function exportJSON(state: AppState): Promise<ExportResult> {
  try {
    const backup = {
      version: 5,
      exportedAt: new Date().toISOString(),
      state: deepClone(state)
    };
    
    const json = JSON.stringify(backup, null, 2);
    const filename = `${filenameSafe(state.settings.siteName)}-backup.json`;
    
    downloadText(json, filename, 'application/json');
    
    return { success: true, filename };
  } catch (error) {
    return { success: false, error: error as Error };
  }
}

// ============================================================================
// JSON IMPORTER
// ============================================================================

/**
 * Importiert State aus JSON-Backup
 */
export function importJSON(jsonString: string): AppState | null {
  try {
    const parsed = JSON.parse(jsonString);
    
    // Validierung
    if (!parsed || typeof parsed !== 'object') return null;
    
    // Neues Format (mit envelope)
    if (parsed.version && parsed.state) {
      return parsed.state as AppState;
    }
    
    // Altes Format (direkter State)
    if (parsed.mode && parsed.layout) {
      return parsed as AppState;
    }
    
    return null;
  } catch {
    return null;
  }
}

// ============================================================================
// EXPORTER CLASS
// ============================================================================

/**
 * Exporter-Klasse mit allen Export-Methoden
 */
export class Exporter implements IExporter {
  exportPreviewHTML(state: AppState): Promise<ExportResult> {
    return exportPreviewHTML(state);
  }
  
  exportProductionZip(state: AppState): Promise<ExportResult> {
    return exportProductionZip(state);
  }
  
  exportJSON(state: AppState): Promise<ExportResult> {
    return exportJSON(state);
  }
}

/**
 * Singleton-Instanz
 */
export const exporter = new Exporter();

// ============================================================================
// CONVENIENCE EXPORTS
// ============================================================================

export const exporters = {
  preview: exportPreviewHTML,
  production: exportProductionZip,
  json: exportJSON,
  import: importJSON
};
