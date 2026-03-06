TASK ID:
001

GOAL:
Define the block tree type system.

FILES:
packages/foundation/types/src/block.ts

REQUIREMENTS:

Define the following types:

- BlockID
- BlockType
- Block
- BuilderState

The Block interface must contain:

- id
- type
- props
- children

TESTS:

Create tests verifying:

- block creation
- child relationships
- state validation

SUCCESS:

Block types compile under strict TypeScript mode.
