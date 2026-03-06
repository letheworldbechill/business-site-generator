TASK ID:
005

GOAL:
Define the core operation system for state mutations.

FILES:
packages/core/operations/src/index.ts

REQUIREMENTS:

Define an Operation type:

- type: string
- payload: unknown

Implement applyOperation(state: BuilderState, op: Operation): BuilderState

Operations to implement:

- ADD_BLOCK
- REMOVE_BLOCK
- UPDATE_PROPS
- MOVE_BLOCK

TESTS:

Create tests verifying:

- each operation produces correct new state
- original state is not mutated
- unknown operation throws

SUCCESS:

All operations are pure and tests pass.
