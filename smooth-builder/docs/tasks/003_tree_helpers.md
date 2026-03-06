TASK ID:
003

GOAL:
Implement tree traversal and manipulation helpers.

FILES:
packages/foundation/tree/src/index.ts

REQUIREMENTS:

Implement the following helpers:

- findBlock(tree: Block, id: BlockID): Block | null
- insertBlock(tree: Block, parentId: BlockID, block: Block): Block
- removeBlock(tree: Block, id: BlockID): Block
- moveBlock(tree: Block, id: BlockID, targetId: BlockID): Block

All functions must return new tree (immutable).

TESTS:

Create tests verifying:

- deep search correctness
- insert at root and nested levels
- remove leaf and subtree
- move preserves all children

SUCCESS:

Tree operations are immutable and all tests pass.
