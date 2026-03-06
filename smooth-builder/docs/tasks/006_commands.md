TASK ID:
006

GOAL:
Implement the command pattern with undo/redo support.

FILES:
packages/core/commands/src/index.ts

REQUIREMENTS:

Define Command interface:

- execute(): Operation
- undo(): Operation

Implement CommandManager:

- execute(command: Command): void
- undo(): void
- redo(): void
- history: Command[]

TESTS:

Create tests verifying:

- execute applies operation
- undo reverts state
- redo re-applies
- history length is correct

SUCCESS:

Undo/redo works correctly for all command types.
