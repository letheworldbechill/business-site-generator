TASK ID:
009

GOAL:
Implement the plugin registration system.

FILES:
packages/core/plugins/src/index.ts

REQUIREMENTS:

Define Plugin interface:

- name: string
- version: string
- install(context: PluginContext): void

Implement PluginRegistry:

- register(plugin: Plugin): void
- get(name: string): Plugin | null
- getAll(): Plugin[]

PluginContext must expose:

- store
- eventBus
- registerBlockType

TESTS:

Create tests verifying:

- plugin registers correctly
- duplicate name throws
- context is passed on install

SUCCESS:

Plugin system is isolated and tests pass.
