TASK ID:
007

GOAL:
Implement the central state store.

FILES:
packages/core/store/src/index.ts

REQUIREMENTS:

Implement Store:

- getState(): BuilderState
- dispatch(command: Command): void
- subscribe(listener: () => void): () => void

Store must:

- be immutable externally
- notify all subscribers on state change
- support unsubscribe

TESTS:

Create tests verifying:

- state updates after dispatch
- subscribers are called
- unsubscribe stops notifications

SUCCESS:

Store is functional and all tests pass.
