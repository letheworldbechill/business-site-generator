/**
 * @sb/history - Undo/Redo History Manager
 * 
 * Implementiert ein Undo/Redo-System mit:
 * - Konfigurierbarer Stack-Größe
 * - Coalescing für hochfrequente Updates
 * - Immutable State-Snapshots
 */

import { deepClone } from '@sb/utils';
import type { IHistoryManager, HistoryRecordOptions } from '@sb/types';

/**
 * History Manager Konfiguration
 */
export interface HistoryManagerOptions {
  /** Maximale Anzahl von Undo-Schritten (Standard: 50) */
  maxSize?: number;
  /** Standard-Coalescing-Fenster in ms (Standard: 400) */
  defaultCoalesceWindowMs?: number;
}

/**
 * History Manager Klasse
 * 
 * Verwaltet Undo/Redo-Stacks für beliebige State-Typen.
 * Unterstützt Coalescing für häufige Updates (z.B. Slider-Bewegungen).
 */
export class HistoryManager<T> implements IHistoryManager<T> {
  private past: T[] = [];
  private present: T | null = null;
  private future: T[] = [];
  
  private maxSize: number;
  private defaultCoalesceWindowMs: number;
  
  private lastCoalesceKey: string | null = null;
  private lastCoalesceAt = 0;
  
  constructor(options: HistoryManagerOptions = {}) {
    this.maxSize = Math.max(1, options.maxSize ?? 50);
    this.defaultCoalesceWindowMs = options.defaultCoalesceWindowMs ?? 400;
  }
  
  /**
   * Initialisiert den History Manager mit einem initialen State
   */
  init(initialState: T): void {
    this.past = [];
    this.future = [];
    this.present = deepClone(initialState);
    this.lastCoalesceKey = null;
    this.lastCoalesceAt = 0;
  }
  
  /**
   * Prüft, ob Undo möglich ist
   */
  canUndo(): boolean {
    return this.past.length > 0;
  }
  
  /**
   * Prüft, ob Redo möglich ist
   */
  canRedo(): boolean {
    return this.future.length > 0;
  }
  
  /**
   * Gibt den aktuellen State zurück
   */
  getCurrent(): T | null {
    return this.present ? deepClone(this.present) : null;
  }
  
  /**
   * Löscht die gesamte History
   */
  clear(): void {
    this.past = [];
    this.future = [];
    this.present = null;
    this.lastCoalesceKey = null;
    this.lastCoalesceAt = 0;
  }
  
  /**
   * Zeichnet einen neuen State auf
   * 
   * Mit Coalescing können schnelle aufeinanderfolgende Updates
   * zu einem einzigen History-Eintrag zusammengefasst werden.
   */
  record(nextState: T, options?: HistoryRecordOptions): void {
    // Erste Aufnahme
    if (this.present === null) {
      this.present = deepClone(nextState);
      return;
    }
    
    const now = Date.now();
    const coalesceKey = options?.coalesceKey ?? null;
    const windowMs = options?.coalesceWindowMs ?? this.defaultCoalesceWindowMs;
    
    // Coalescing-Logik
    const shouldCoalesce =
      coalesceKey !== null &&
      this.lastCoalesceKey === coalesceKey &&
      (now - this.lastCoalesceAt) <= windowMs &&
      this.past.length > 0;
    
    if (shouldCoalesce) {
      // Aktuellen State ersetzen ohne History-Eintrag
      this.present = deepClone(nextState);
      this.lastCoalesceKey = coalesceKey;
      this.lastCoalesceAt = now;
      return;
    }
    
    // Standard: Present in Past pushen, neuen Present setzen, Future löschen
    this.past.push(deepClone(this.present));
    this.present = deepClone(nextState);
    this.future = [];
    
    // Stack-Größe begrenzen
    while (this.past.length > this.maxSize) {
      this.past.shift();
    }
    
    this.lastCoalesceKey = coalesceKey;
    this.lastCoalesceAt = coalesceKey ? now : 0;
  }
  
  /**
   * Undo - Geht zum vorherigen State zurück
   */
  undo(): T | null {
    if (!this.canUndo()) return null;
    
    const previous = this.past.pop()!;
    this.future.unshift(deepClone(this.present!));
    this.present = deepClone(previous);
    
    // Undo unterbricht Coalescing
    this.lastCoalesceKey = null;
    this.lastCoalesceAt = 0;
    
    return deepClone(this.present);
  }
  
  /**
   * Redo - Stellt den nächsten State wieder her
   */
  redo(): T | null {
    if (!this.canRedo()) return null;
    
    const next = this.future.shift()!;
    this.past.push(deepClone(this.present!));
    this.present = deepClone(next);
    
    // Redo unterbricht Coalescing
    this.lastCoalesceKey = null;
    this.lastCoalesceAt = 0;
    
    return deepClone(this.present);
  }
  
  /**
   * Gibt die Anzahl der Undo-Schritte zurück
   */
  getUndoCount(): number {
    return this.past.length;
  }
  
  /**
   * Gibt die Anzahl der Redo-Schritte zurück
   */
  getRedoCount(): number {
    return this.future.length;
  }
  
  /**
   * Erstellt einen Snapshot des aktuellen History-Zustands
   */
  getSnapshot(): { past: T[]; present: T | null; future: T[] } {
    return {
      past: this.past.map(s => deepClone(s)),
      present: this.present ? deepClone(this.present) : null,
      future: this.future.map(s => deepClone(s))
    };
  }
  
  /**
   * Stellt einen Snapshot wieder her
   */
  restoreSnapshot(snapshot: { past: T[]; present: T | null; future: T[] }): void {
    this.past = snapshot.past.map(s => deepClone(s));
    this.present = snapshot.present ? deepClone(snapshot.present) : null;
    this.future = snapshot.future.map(s => deepClone(s));
    this.lastCoalesceKey = null;
    this.lastCoalesceAt = 0;
  }
}

/**
 * Factory-Funktion für History Manager
 */
export function createHistoryManager<T>(options?: HistoryManagerOptions): HistoryManager<T> {
  return new HistoryManager<T>(options);
}

/**
 * History Policy für Action-Types
 * Bestimmt, ob eine Action in der History aufgezeichnet werden soll
 */
export interface HistoryPolicy {
  /** Ob die Action aufgezeichnet werden soll */
  record: boolean;
  /** Coalescing-Schlüssel für Gruppierung */
  coalesceKey?: string;
  /** Coalescing-Zeitfenster in ms */
  coalesceWindowMs?: number;
}

/**
 * Standard History Policy für Smooth Builder
 */
export function defaultHistoryPolicy(actionType: string, payload?: unknown): HistoryPolicy {
  // UI-Actions werden nicht aufgezeichnet
  const noRecord = new Set([
    'SELECT_SECTION',
    'TOGGLE_GRID',
    'TOGGLE_8PX',
    'SET_SIDEBAR_TAB',
    'SET_BUILDER_THEME',
    'SET_ACTIVE_ELEMENT_PATH',
    'SET_MODE'
  ]);
  
  if (noRecord.has(actionType)) {
    return { record: false };
  }
  
  // Hochfrequente Updates mit Coalescing
  const coalesce = new Set([
    'UPDATE_SPACING',
    'UPDATE_CONTENT',
    'SET_COLORS'
  ]);
  
  if (coalesce.has(actionType)) {
    const id = (payload && typeof payload === 'object' && 'id' in payload)
      ? String((payload as Record<string, unknown>).id)
      : 'global';
    
    return {
      record: true,
      coalesceKey: `${actionType}:${id}`,
      coalesceWindowMs: 450
    };
  }
  
  return { record: true };
}
