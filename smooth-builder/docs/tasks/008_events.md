TASK ID:
008

GOAL:
Implement the internal event bus.

FILES:
packages/core/events/src/index.ts

REQUIREMENTS:

Implement EventBus:

- on(event: string, handler: Function): () => void
- emit(event: string, payload: unknown): void
- off(event: string, handler: Function): void

Events to define:

- BLOCK_ADDED
- BLOCK_REMOVED
- PROPS_UPDATED
- SELECTION_CHANGED

TESTS:

Create tests verifying:

- handler is called on emit
- off prevents future calls
- multiple handlers on same event

SUCCESS:

Event bus is decoupled and all tests pass.
