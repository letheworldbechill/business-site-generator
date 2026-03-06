1. Add a Task Template

Create:

/docs/AI_TASK_TEMPLATE.md

Content:

# Smooth Builder AI Task

TASK ID:
{{task_id}}

GOAL:
{{goal}}

ARCHITECTURE CONTEXT:
Smooth Builder is a modular static website builder.
Follow the architecture defined in:

/docs/ARCHITECTURE.md
/docs/AI_DEVELOPMENT_GUIDE.md

FILES TO CREATE OR MODIFY:
{{files}}

IMPLEMENTATION REQUIREMENTS:
{{requirements}}

CONSTRAINTS:

- Maintain modular architecture
- Follow TypeScript strict mode
- No circular dependencies
- Do not introduce framework code into generated sites
- Operations must remain pure functions
- Generated websites must remain static

TESTING:

Write unit tests for all new logic.

Tests must cover:

{{tests}}

SUCCESS CRITERIA:

{{success}}
2. Add Task Definitions

Create:

/docs/tasks/

Example task:

/docs/tasks/001_block_types.md

Content:

TASK ID:
001

GOAL:
Define the block tree type system.

FILES:
packages/foundation/types/src/block.ts

REQUIREMENTS:

Define the following types:

BlockID
BlockType
Block
BuilderState

The Block interface must contain:

id
type
props
children

TESTS:

Create tests verifying:

block creation
child relationships
state validation

SUCCESS:

Block types compile under strict TypeScript mode.
3. Codex Prompt Generator

Create a small script that turns tasks into prompts.

File:

/scripts/generate-ai-task.js

Example:

import fs from "fs";

const template = fs.readFileSync(
  "docs/AI_TASK_TEMPLATE.md",
  "utf8"
);

const task = fs.readFileSync(
  process.argv[2],
  "utf8"
);

const output = template.replace(
  "{{task_id}}",
  task.match(/TASK ID:\s*(.*)/)[1]
);

console.log(output);

Run:

node scripts/generate-ai-task docs/tasks/001_block_types.md

This prints a Codex-ready prompt.

4. Example Generated Codex Prompt

The script outputs something like:

TASK ID: 001

GOAL:
Define the block tree type system.

FILES TO CREATE OR MODIFY:

packages/foundation/types/src/block.ts

IMPLEMENTATION REQUIREMENTS:

Define the following interfaces:

BlockID
BlockType
Block
BuilderState

Block structure:

id
type
props
children

CONSTRAINTS:

Follow TypeScript strict mode.
No any types.

TESTING:

Write unit tests verifying block creation and hierarchy.

SUCCESS CRITERIA:

Block types compile and pass tests.

This can be pasted directly into Codex / GPT / Cursor / Copilot agents.

5. Recommended Development Loop

Use this loop for every commit.

Step 1

Generate task:

node scripts/generate-ai-task docs/tasks/007_operations.md
Step 2

Paste prompt into Codex.

Step 3

Review generated code.

Step 4

Run tests.

Step 5

Commit.

6. Example AI Task Structure
/docs/tasks
001_block_types.md
002_utils.md
003_tree_helpers.md
004_schema_validation.md
005_operations.md
006_commands.md
007_store.md
008_events.md
009_plugins.md
010_generator_pipeline.md
...
040_export_ui.md

Each corresponds to the roadmap commits.

7. Why This System Works

Most AI projects fail because prompts are:

too vague
too large
too architectural

This system ensures:

small tasks
clear boundaries
consistent architecture
test coverage
8. Final Smooth Builder Development Stack

Your project now has:

Architecture
block tree engine
plugin system
turbo static generation
Tooling
pnpm monorepo
TypeScript strict
Vitest testing
AI Infrastructure
architecture docs
AI development guide
task generator
commit roadmap