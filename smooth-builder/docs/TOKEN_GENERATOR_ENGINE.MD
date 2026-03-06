The feature I hinted at is something used internally in Figma, Shopify Polaris, and advanced design systems.

If Smooth Builder implements it properly, you get instant global redesigns, consistent themes, and much smaller CSS output — while still generating static sites.

This is called a Design Token Engine.

The Design Token Engine

Instead of sections defining their own styles, all styling comes from tokens.

Tokens are semantic variables describing design decisions, not raw values.

Example token system:

:root{
 --color-primary:#0d9488;
 --color-text:#0f172a;
 --color-surface:#ffffff;

 --radius-sm:6px;
 --radius-md:12px;

 --space-4:1rem;
 --space-8:2rem;

 --font-base:Inter;
}

Sections never define raw values.

They reference tokens.

Example hero CSS:

.hero{
 padding:var(--space-8);
 background:var(--color-surface);
}

.hero h1{
 color:var(--color-text);
}
Why This Is Powerful

If the user changes brand color, the entire site updates instantly.

Example:

Old brand:

--color-primary:#0d9488;

New brand:

--color-primary:#6366f1;

Every button, link, accent color updates automatically.

Token Layers

Smooth Builder should support three token layers.

System tokens
↓
Theme tokens
↓
Component tokens
1. System Tokens

Global base scale.

Example:

--space-1
--space-2
--space-4
--space-8

Spacing scale.

Typography scale.

Radius scale.

2. Theme Tokens

Brand identity.

Example:

--color-primary
--color-secondary
--color-accent
--font-heading

Themes can change these.

Example themes:

Swiss Professional
Tech Startup
Luxury Brand
Minimalist
3. Component Tokens

Fine tuning for components.

Example:

--button-radius
--card-shadow
--hero-padding
Token Resolution System

The generator must resolve tokens in layers.

Example resolution:

component token
↓
theme token
↓
system token

Example:

--button-radius:var(--radius-md);
Architecture Integration

Add a design token module.

packages/domain/design-tokens

Structure:

design-tokens/
  tokens.ts
  system.ts
  theme.ts
  resolver.ts
Token Schema

Example TypeScript model:

export interface DesignTokens {
 colors: {
   primary:string
   accent:string
   surface:string
 }

 spacing:{
   xs:string
   sm:string
   md:string
   lg:string
 }

 radius:{
   sm:string
   md:string
   lg:string
 }

 typography:{
   body:string
   heading:string
 }
}
Generator Integration

During export:

Builder State
↓
Resolve tokens
↓
Generate CSS variables
↓
Generate CSS classes
↓
Export stylesheet
Example Generated CSS

Output might look like:

:root{
 --color-primary:#6366f1;
 --space-4:1rem;
 --radius-md:12px;
}

.btn{
 padding:var(--space-4);
 border-radius:var(--radius-md);
 background:var(--color-primary);
}
Massive Performance Benefit

Without tokens, builders produce huge CSS:

400–700 KB CSS

With tokens:

20–30 KB CSS

Because styles are reused.

Instant Theme Switching

The builder could allow:

Light theme
Dark theme
Brand variations

Example output:

:root[data-theme="dark"]{
 --color-surface:#0f172a;
 --color-text:#f8fafc;
}
AI Design Capabilities

Tokens also allow AI-driven design generation.

Example AI request:

Generate a Swiss professional theme
for accounting firms.

AI outputs tokens:

{
 "primary":"#0d9488",
 "accent":"#f59e0b",
 "surface":"#ffffff",
 "font":"Inter"
}

Builder instantly redesigns site.

Real Competitive Advantage

Most builders mix:

content
layout
style

Smooth Builder becomes:

Content Graph
Block Tree
Design Tokens

Three independent layers.

Final Smooth Builder Architecture
EDITOR

Block Tree Engine
Content Graph Engine
Design Token Engine
Plugin System


GENERATOR

HTML Generator
CSS Token Generator
Runtime Generator
Asset Optimizer


OUTPUT

Static HTML
Token CSS
Minimal JS
Result

Smooth Builder now supports:

visual builder
CMS collections
SEO page generation
AI content generation
instant theme switching
ultra fast static sites

All with no backend runtime required.