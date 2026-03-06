TASK ID:
004

GOAL:
Implement schema validation for block props.

FILES:
packages/foundation/validation/src/index.ts

REQUIREMENTS:

Implement:

- defineSchema(blockType: BlockType, schema: Schema): void
- validateBlock(block: Block): ValidationResult
- ValidationResult must contain: valid, errors[]

Schema must support:

- required fields
- type checking (string, number, boolean)
- nested objects

TESTS:

Create tests verifying:

- valid block passes
- missing required field fails
- wrong type fails
- nested validation works

SUCCESS:

Validation logic is complete and all tests pass.
