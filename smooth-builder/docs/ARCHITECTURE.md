SMOOTH BUILDER 6.0
Architecture Specification (For Codex / AI Agents)
1. Project Goal

Smooth Builder is a visual website builder that generates extremely fast static websites.

The editor may be complex, but the output must be minimal static HTML.

Performance Targets
Metric	Target
Lighthouse score	95–100
First Contentful Paint	<1s
Largest Contentful Paint	<2s
Runtime JS	<10KB
CSS	<30KB
2. Core Architectural Principles

The system must enforce the following rules:

Rule 1 — Editor ≠ Output

Builder complexity must never leak into generated sites.

Editor uses:

React
State management
Block tree
Plugins

Output uses:

Static HTML
Static CSS
Minimal JS runtime
Rule 2 — Block Tree Data Model

All content in the builder is represented as a block tree.

Example:

Page
 ├ Hero
 │ ├ Headline
 │ └ CTA
 ├ Services
 │ ├ ServiceCard
 │ └ ServiceCard
 └ Footer
Block Structure
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
3. Monorepo Structure

Codex must maintain this workspace structure.

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
4. Core System Flow
Editor Flow
User Action
  ↓
Command
  ↓
Operation
  ↓
Block Tree Update
  ↓
Event Emitted
  ↓
Preview Render
Export Flow
Block Tree
  ↓
Normalize State
  ↓
Resolve Templates
  ↓
Generate HTML
  ↓
Generate CSS
  ↓
Generate JS Runtime
  ↓
Optimize Assets
  ↓
Export Static Bundle
5. Operations System

All state mutations must use operations.

Allowed operations:

ADD_BLOCK
REMOVE_BLOCK
MOVE_BLOCK
UPDATE_PROP
APPLY_TEMPLATE

Example operation:

{
 type: "ADD_BLOCK",
 parent: "root",
 block: { type: "hero" }
}

Operations must be pure functions.

6. Command Layer

Commands translate UI intent into operations.

Example:

addBlock(parentId: string, type: string)
updateProp(blockId: string, key: string, value: unknown)
moveBlock(id: string, parent: string, index: number)

Commands may perform validation.

7. Plugin System

Plugins must be supported.

Plugin lifecycle hooks:

onInit
onBlockAdded
onBlockUpdated
onTemplateApplied
onBeforeExport
onAfterExport

Example plugin:

registerPlugin({
 name: "analytics",

 onBlockAdded(block) {
   console.log("Block added", block.type)
 }
})
8. Generator Engine

Generator converts builder state to production website.

Pipeline stages:

normalizeState
resolveTemplates
generateHTML
generateCSS
generateRuntime
optimizeAssets
minify
export

Each stage is a pipeline module.

Example:

pipeline
  .use(normalizeState)
  .use(generateHTML)
  .use(generateCSS)
  .use(optimizeAssets)
9. HTML Generation Rules

Generated HTML must follow strict rules.

Required
semantic HTML
minimal DOM
no framework markup

Example output:

<section class="hero">
  <h1>Your Software Solution</h1>
  <p>Efficient. Secure. Scalable.</p>
  <a class="btn btn-primary">Get Started</a>
</section>
10. CSS Generation Rules

CSS must use design tokens + system styles.

Example tokens:

:root{
 --color-primary:#0d9488;
 --space-4:1rem;
 --radius:10px;
}

Sections must reuse system classes.

CSS size target:

20–30KB
11. Runtime JS

Generated sites must include a minimal runtime.

Responsibilities:

menu toggle
accordion
cookie banner
form validation

Target:

<8KB gzipped

Example runtime:

document.querySelectorAll("[data-toggle]")
.forEach(btn=>{
 btn.onclick=()=>{
  const el=document.getElementById(btn.dataset.toggle)
  el.classList.toggle("open")
 }
})
12. Asset Optimization

Export must automatically optimize assets.

Images:

JPEG → AVIF
PNG → WebP
generate responsive sizes
lazy load

Example output:

<img
 src="/images/hero.avif"
 width="1200"
 height="700"
 loading="lazy"
/>
13. Security Requirements

All generated sites must enforce:

HTML escaping
escape user text
prevent XSS
URL validation

Allowed protocols:

https
mailto
tel
Content Security Policy

Generated site must include:

Content-Security-Policy:
default-src 'self';
img-src 'self' data:;
style-src 'self';
script-src 'self';
14. Performance Guarantees

Export process must enforce:

HTML minification
CSS minification
JS minification
image compression
font subsetting
15. Deployment Targets

Generated sites must deploy to:

Vercel
Netlify
Cloudflare Pages
AWS S3
Static hosting

No backend required.

16. Testing Requirements

Codex must implement tests.

Required tests:

operation tests
generator tests
export tests
plugin lifecycle tests
17. Development Rules

Codex must follow these constraints.

TypeScript strict mode
no any types
pure functions for operations
no global mutable state
no circular dependencies

Your project already enforces strict TypeScript configuration and modular dependency paths. 

tsconfig.base

18. Anti-Patterns (Forbidden)

Codex must never introduce:

React in exported websites
inline JS in HTML
CSS per section duplication
large runtime frameworks
dynamic server rendering
19. Success Definition

Smooth Builder is successful if generated sites are:

ultra fast
fully static
secure by default
SEO friendly
deployable anywhere

✅ Recommended next step for Codex

After adding this architecture file:

Create these packages first:

packages/core/operations
packages/core/store
packages/core/commands
packages/core/events
packages/domain/blocks
packages/infrastructure/generator
packages/infrastructure/optimizer

This forms the minimal builder engine.