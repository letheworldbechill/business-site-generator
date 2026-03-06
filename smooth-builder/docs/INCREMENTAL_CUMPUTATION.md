The last architectural trick that makes large builders scale smoothly is something used in tools like Figma and advanced editors: Incremental Computation with a Dependency Graph.

Instead of recomputing everything whenever the user changes something, the system tracks dependencies between pieces of state and only recomputes what is affected.

This keeps the editor fast even for very large sites (hundreds of blocks, many pages, collections).

Incremental Dependency Graph

The builder maintains an internal graph of dependencies.

Nodes represent pieces of computed data, for example:

Block
Section Layout
Resolved Tokens
Rendered Preview
Generated HTML

Edges represent dependencies:

Block → Section Layout
Section Layout → Preview Render
Tokens → CSS Generation
Content Graph → HTML Generation

So if a token changes, the system knows:

Token changed
↓
Recompute CSS
↓
Update preview

But it does not recompute the entire page.

Example Graph
          Brand Tokens
               │
               ▼
           CSS Styles
               │
               ▼
            Preview

Block Tree → Layout → Preview
Block Tree → HTML Generator → Export
Content Graph → HTML Generator

Each node caches its result.

How It Works

Every computed step is defined as a pure function.

Example:

function computeLayout(blockTree) {
  // returns layout structure
}

The dependency graph stores:

inputs
outputs
dependencies

When input changes, only affected nodes recompute.

Implementation Concept

Create module:

packages/core/compute-graph

Core types:

interface Node<T> {
  id: string
  compute: () => T
  dependencies: string[]
  value?: T
}

Graph manager:

class ComputeGraph {
  nodes: Map<string, Node<any>>

  recompute(nodeId: string) {
    // recompute dependencies first
  }
}
Example Node Definitions

Preview render node:

graph.register({
 id: "preview",
 dependencies: ["layout", "tokens"],
 compute: () => renderPreview()
})

CSS generation node:

graph.register({
 id: "css",
 dependencies: ["tokens"],
 compute: () => generateCSS()
})

HTML generation node:

graph.register({
 id: "html",
 dependencies: ["blockTree","contentGraph"],
 compute: () => generateHTML()
})
What Happens on Edit

User changes headline text.

Dependency graph updates:

Block changed
↓
Layout recomputed
↓
Preview updated

CSS and export remain unchanged.

Very fast.

What Happens on Theme Change

User changes brand color.

Graph updates:

Tokens changed
↓
CSS recomputed
↓
Preview refreshed

Blocks remain untouched.

Why This Matters

Without incremental computation:

edit → rebuild everything

Large sites become slow.

With compute graph:

edit → recompute affected nodes only

Performance remains constant.

Benefits

This architecture gives Smooth Builder:

fast editor even with large sites

minimal recomputation

clean separation of systems

easier debugging

It fits perfectly with the layered architecture you already documented for the project modules and responsibilities. 

ARCHITECTURE

Combined Final Architecture

Smooth Builder becomes:

EDITOR SYSTEM

Block Tree Engine
Content Graph Engine
Design Token Engine
Compute Dependency Graph
Plugin System


GENERATION SYSTEM

HTML Generator
CSS Token Generator
Runtime Generator
Asset Optimizer
Export Pipeline


OUTPUT

Static HTML
Token-based CSS
Minimal JS
Result

You now have an architecture capable of:

visual builder

CMS-like content

AI content generation

instant theme changes

extremely fast static websites

scalable editor performance