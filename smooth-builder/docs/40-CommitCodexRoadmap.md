Smooth Builder 6.0
40-Commit Codex Roadmap
PHASE 1 — Foundation (commits 1–6)

Goal: establish types and utilities that everything depends on.

Commit 1
Define block tree types

Create:

packages/foundation/types/src/block.ts

Define:

Block
BuilderState
BlockID
BlockType

Add tests for:

block creation
tree structure
Commit 2
Create core utility helpers

Create utilities:

packages/foundation/utils/src/object.ts
packages/foundation/utils/src/string.ts
packages/foundation/utils/src/id.ts

Functions:

deepClone
deepMerge
slugify
createId
Commit 3
Add HTML escaping helpers

Create:

utils/security.ts

Functions:

escapeHTML()
sanitizeURL()

These will later protect generated HTML.

Commit 4
Add tree traversal helpers

Create:

utils/tree.ts

Functions:

findBlock
getChildren
walkTree
Commit 5
Add schema validation layer

Install:

zod

Create:

types/schema.ts

Define:

BlockSchema
BuilderStateSchema
Commit 6
Setup test infrastructure

Add tests for:

block validation
tree traversal
security helpers
PHASE 2 — Core Engine (commits 7–15)

Goal: implement the state mutation engine.

Commit 7
Create operations module
packages/core/operations

Define operations:

ADD_BLOCK
REMOVE_BLOCK
MOVE_BLOCK
UPDATE_PROP
Commit 8
Implement operation executor

Create:

applyOperation.ts

Rules:

pure function
no side effects
Commit 9
Add operation validation

Check:

parent exists
block type valid
index bounds
Commit 10
Implement command layer
packages/core/commands

Commands:

addBlock()
removeBlock()
updateProp()
moveBlock()

Commands generate operations.

Commit 11
Implement event system

Create:

packages/core/events

Simple event bus:

emit
subscribe
unsubscribe
Commit 12
Implement store

Create:

packages/core/store

Features:

state storage
apply operation
listeners
Commit 13
Add history manager

Create:

packages/core/history

Features:

undo
redo
operation stack
Commit 14
Add store tests

Test:

operation execution
undo/redo
event triggers
Commit 15
Create plugin system

Create:

packages/core/plugins

Allow registration of lifecycle hooks.

PHASE 3 — Domain Layer (commits 16–22)

Goal: define builder concepts.

Commit 16
Block registry

Create:

packages/domain/blocks

Register block types.

Example:

hero
services
cta
footer
Commit 17
Block schemas

Define schema for each block.

Example:

HeroBlockSchema
ServiceBlockSchema
Commit 18
Template registry

Create:

packages/domain/templates

Templates define initial block trees.

Commit 19
Brand model

Create:

packages/domain/brand

Define:

colors
fonts
spacing
radius
Commit 20
Settings model

Define site settings:

language
seo
legal pages
Commit 21
Content model

Define:

text
images
links
Commit 22
Domain validation

Validate:

template application
block compatibility
PHASE 4 — Generator Engine (commits 23–31)

Goal: implement Turbo static generation.

Commit 23
Create generator pipeline
packages/infrastructure/generator

Pipeline API:

pipeline.use(stage)
pipeline.run(state)
Commit 24
Implement state normalization

Resolve:

block tree
template inheritance
defaults
Commit 25
HTML generator

Convert block tree → HTML.

Create:

generator/html
Commit 26
CSS generator

Generate design tokens.

Create:

generator/css

Output:

tokens
layout
section styles
Commit 27
Runtime JS generator

Generate minimal runtime.

Target:

<8KB
Commit 28
Image optimizer

Add:

AVIF/WebP conversion
lazy loading
Commit 29
Critical CSS extractor

Inline above-the-fold styles.

Commit 30
HTML minifier

Add:

minifyHTML
minifyCSS
minifyJS
Commit 31
Export bundle

Create:

packages/infrastructure/exporters

Export:

zip
static folder
PHASE 5 — Preview System (commits 32–35)

Goal: implement builder preview.

Commit 32
Block renderer

Render blocks recursively.

Commit 33
Preview engine

Create:

packages/presentation/preview

Render live site.

Commit 34
Hot preview updates

Subscribe to store updates.

Commit 35
Preview performance optimization

Avoid unnecessary rerenders.

PHASE 6 — Builder UI (commits 36–40)

Goal: implement the visual editor.

Commit 36
Canvas layout

Create builder canvas.

Commit 37
Block inspector

Edit block properties.

Commit 38
Drag & drop blocks

Reorder sections.

Commit 39
Template selector

Apply site templates.

Commit 40
Export UI

Allow exporting static site.

Expected Result After Commit 40

Smooth Builder will support:

visual editing
block tree architecture
plugin system
undo/redo
live preview
static site generation
turbo optimized export

Output websites will be:

HTML
CSS
minimal JS

Deployable anywhere.

Recommended Codex Workflow

Use prompts like:

Implement commit 7 from the roadmap.
Follow the architecture rules in AI_DEVELOPMENT_GUIDE.md.
Write tests for all new modules.
Do not modify unrelated modules.
Pro Tip

AI projects stay stable if:

architecture doc = rules
roadmap = execution order

You now have both.