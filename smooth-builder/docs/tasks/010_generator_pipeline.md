TASK ID:
010

GOAL:
Implement the static site generator pipeline.

FILES:
packages/generator/src/pipeline.ts

REQUIREMENTS:

Implement GeneratorPipeline:

- addStep(step: PipelineStep): void
- run(state: BuilderState): GeneratedSite

PipelineStep interface:

- name: string
- process(input: PipelineContext): PipelineContext

GeneratedSite must contain:

- html: string
- css: string
- assets: Asset[]

TESTS:

Create tests verifying:

- steps run in order
- context is passed between steps
- output contains valid HTML

SUCCESS:

Pipeline produces valid static output from BuilderState.
