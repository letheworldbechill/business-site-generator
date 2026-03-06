The “Content Graph” Engine

Most website builders think in pages and sections.

Instead, Smooth Builder can internally treat all content as a structured content graph.

This one architectural feature unlocks:

automatic SEO pages

multi-language sites

collections (CMS-like features)

dynamic page generation

AI content generation

while still exporting pure static websites

No database required at runtime.

Why This Is Powerful

Typical builders have two systems:

Page builder
+
CMS

Which becomes messy.

Instead Smooth Builder has:

Block Tree (layout)
+
Content Graph (data)

Layout and content are separated.

Concept
Block Tree (visual structure)
Page
 ├ Hero
 ├ Services
 ├ Testimonials
 └ Footer
Content Graph (data)
Service
 ├ name
 ├ description
 ├ image

Testimonial
 ├ author
 ├ quote
 ├ company
Example

Instead of manually adding service cards:

The builder defines a collection:

Services
  - Web Development
  - SEO
  - Hosting

Hero section references:

services collection

The generator expands it into HTML.

Generated Output

Input content graph:

services = [
  {name:"Web Development"},
  {name:"SEO"},
  {name:"Hosting"}
]

Generated HTML:

<section class="services">
  <article class="service">
    <h3>Web Development</h3>
  </article>

  <article class="service">
    <h3>SEO</h3>
  </article>

  <article class="service">
    <h3>Hosting</h3>
  </article>
</section>

Still 100% static.

Dynamic Pages (Huge Feature)

Content graph enables automatic page generation.

Example:

Blog posts

Content:

posts/
  - post-1
  - post-2
  - post-3

Generator creates:

/blog/post-1
/blog/post-2
/blog/post-3

Static HTML pages.

SEO Magic

You can generate:

city pages
industry pages
service pages

Example:

/seo-zurich
/seo-bern
/seo-basel

Generated automatically from data.

Extremely valuable for businesses.

Architecture Integration

Add a content graph layer.

Builder
 ├ Block Tree (layout)
 └ Content Graph (data)

Generator pipeline:

Content Graph
      ↓
Block Tree
      ↓
Page Resolver
      ↓
Static Page Generator
      ↓
Export
Content Graph Types

Create module:

packages/domain/content-graph

Example schema:

interface ContentNode {
  id: string
  type: string
  fields: Record<string, unknown>
}

Graph structure:

interface ContentGraph {
  nodes: Record<string, ContentNode>
  edges: Record<string, string[]>
}
Example Collections

Smooth Builder could support:

services
team members
blog posts
testimonials
faq items
locations
products
Block Reference Example

A block could reference a collection.

ServicesBlock {
  source: "services"
}

Generator expands it.

Why This Beats Webflow

Webflow has a CMS but:

dynamic runtime
heavy JS
complex hosting

Smooth Builder:

content graph
+
static generation

Result:

faster
simpler
cheaper hosting
AI Superpower

This architecture also makes AI content generation trivial.

Example:

Generate 20 SEO pages
for Swiss plumbers

AI fills the content graph.

Generator creates all pages.

Example AI Prompt
Generate content graph nodes
for 10 Swiss accounting services.

AI outputs structured data.

Builder turns it into pages.

Final Architecture

Smooth Builder becomes:

Editor
 ├ Block Tree Engine
 ├ Content Graph Engine
 ├ Plugin System

Generator
 ├ HTML generator
 ├ CSS generator
 ├ Runtime generator
 ├ Asset optimizer

Output
 └ Static Website
What This Unlocks

Smooth Builder suddenly supports:

CMS
SEO page generation
dynamic collections
AI content generation
static export

All with zero backend.

The Best Part

This feature fits perfectly with the architecture you already built.

Your layered modular system (types → store → generators → exporters → UI) can support this extension cleanly. 

ARCHITECTURE