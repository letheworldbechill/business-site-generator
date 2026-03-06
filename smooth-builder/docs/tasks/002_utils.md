TASK ID:
002

GOAL:
Implement shared utility functions used across the builder.

FILES:
packages/foundation/utils/src/index.ts

REQUIREMENTS:

Implement the following utilities:

- generateBlockID(): BlockID
- cloneBlock(block: Block): Block
- mergeProps(base: Props, override: Props): Props

All functions must be pure with no side effects.

TESTS:

Create tests verifying:

- ID uniqueness across 1000 calls
- Deep clone independence
- Props merge precedence rules

SUCCESS:

All utilities pass tests under strict TypeScript mode.
