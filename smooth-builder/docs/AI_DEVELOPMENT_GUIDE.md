Smooth Builder — Codex Development Guide
Purpose

This document defines the rules, architecture, and development workflow for AI agents contributing to the Smooth Builder project.

The goal is to ensure that all generated code:

maintains the architecture

preserves performance guarantees

produces secure static websites

Project Vision

Smooth Builder is a visual website builder that generates extremely fast static websites.

Key principle:

Editor complexity must never leak into the generated website.

The builder may use modern frameworks internally, but the generated output must remain:

Static HTML
Static CSS
Minimal JS runtime
Performance Requirements

Generated websites must meet the following targets:

Metric	Target
Lighthouse	95–100
First Contentful Paint	<1s
Largest Contentful Paint	<2s
JS runtime	<10KB
CSS bundle	<30KB
Core Architecture

The system follows a layered modular architecture.

presentation
application
domain
infrastructure
foundation

Modules must only depend on lower layers.

The current architecture diagram describes these relationships and must be respected when implementing new features. 

ARCHITECTURE

Repository Structure

Codex must maintain this structure.

smooth-builder/

apps/
  web/

packages/

  foundation
    types
    utils

  core
    store
    commands
    operations
    events
    plugins
    history

  domain
    blocks
    templates
    brand
    content
    settings

  infrastructure
    storage
    generator
    optimizer
    exporters

  presentation
    ui
    preview
    devtools

  runtime
    client-runtime
Data Model

All builder content must be stored as a block tree.

Example structure:

Page
 ├ Hero
 │ ├ Headline
 │ └ CTA
 ├ Services
 │ ├ ServiceCard
 │ └ ServiceCard
 └ Footer

Block interface:

export interface Block {
  id: string
  type: string
  props: Record<string, unknown>
  children: string[]
}

Builder state:

export interface BuilderState {
  root: string
  blocks: Record<string, Block>
}
State Mutation Model

All state changes must use operations.

Allowed operations:

ADD_BLOCK
REMOVE_BLOCK
MOVE_BLOCK
UPDATE_PROP
APPLY_TEMPLATE

Operations must be:

pure functions
deterministic
side-effect free
Command Layer

Commands translate UI intent into operations.

Example commands:

addBlock(parentId, type)
updateProp(blockId, key, value)
moveBlock(id, parent, index)
applyTemplate(templateId)

Commands may validate inputs before generating operations.

Plugin System

Smooth Builder supports plugins.

Plugins may hook into lifecycle events:

onInit
onBlockAdded
onBlockUpdated
onTemplateApplied
onBeforeExport
onAfterExport

Plugins must never modify core architecture.

Generator Engine

The generator converts builder state into production code.

Pipeline stages:

normalizeState
resolveTemplates
generateHTML
generateCSS
generateRuntime
optimizeAssets
minify
export

Each stage must be implemented as a modular pipeline component.

Generated Website Rules

Generated websites must follow strict constraints.

HTML

Must be:

semantic
minimal DOM
framework-free
accessible

Example output:

<section class="hero">
  <h1>Your Software Solution</h1>
  <p>Efficient. Secure. Scalable.</p>
  <a class="btn btn-primary">Get Started</a>
</section>
CSS

CSS must use design tokens + reusable system classes.

Example tokens:

:root{
 --color-primary:#0d9488;
 --space-4:1rem;
 --radius:10px;
}

Target bundle size:

20–30KB
Runtime JavaScript

Generated sites must include a minimal runtime.

Responsibilities:

menu toggle
accordion
cookie banner
form validation

Runtime size target:

<8KB gzipped

Frameworks are forbidden.

Asset Optimization

Export must optimize all assets.

Images:

JPEG → AVIF
PNG → WebP
responsive sizes
lazy loading

Fonts:

subset fonts
self-host
preload
Security Rules

Generated sites must enforce:

HTML escaping

All user content must be escaped.

URL validation

Allowed protocols:

https
mailto
tel
Content Security Policy

Generated sites must include a strict CSP header.

Development Constraints

AI agents must follow these rules.

TypeScript strict mode
no any types
pure functions where possible
no global mutable state
no circular dependencies

The repository already enforces strict TypeScript compiler settings and module aliases that must be respected. 

tsconfig.base

Forbidden Patterns

AI agents must never introduce:

React/Vue runtime in exported sites
inline JavaScript in generated HTML
CSS duplication per section
server-side rendering for generated sites
large JS bundles
Workflow for AI Contributions

When implementing a feature:

Understand the architecture.

Identify affected modules.

Write tests first.

Implement minimal code.

Ensure performance rules are maintained.

Example Task Template for Codex

When requesting new features from Codex, use this format.

TASK:
Implement the block operations engine.

CONSTRAINTS:
- Must follow the block tree architecture.
- Operations must be pure functions.
- No UI logic in this module.

FILES:
packages/core/operations/
Long-Term Goals

Smooth Builder should evolve toward:

plugin ecosystem
AI template generation
industry-specific templates
multi-language site generation
enterprise deployment
Final Rule

The most important design principle:

Builder complexity is acceptable.
Generated websites must remain extremely simple.