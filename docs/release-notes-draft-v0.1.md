# SpecWise v0.1.0-preview.0 Release Notes

Status: Release notes source for the `v0.1.0-preview.0` GitHub release. npm publication is intentionally skipped.

## Highlights

- Local-first SpecWise CLI preview.
- Dependency-free package with no runtime npm dependencies.
- Reviewable, evidence-based spec-pack workflow for messy legacy business materials.
- Deterministic local draft generation.
- Offline AI patch validation and merge preview.
- Human review reports and manual apply plans.
- Context-only handoff pack skeletons for future coding-agent workflows.
- MIT License applied.

## What Works Now

- `validate`: validate SpecWise spec-pack folders.
- `inventory`: scan legacy input folders and create material inventories.
- `draft`: generate review-required deterministic draft spec-packs.
- `provider list` and `provider doctor`: inspect safe provider configuration boundaries.
- `extract --dry-run`: generate extraction dry-run plans without provider calls.
- `patch validate` and `patch preview`: validate AI patch candidates and generate offline merge previews.
- `ai-preview prepare`: prepare local prompt artifacts without provider calls.
- `review init`, `review validate`, and `review report`: support human review workflow.
- `apply-plan create` and `apply-plan validate`: create and validate manual revision plans.
- `handoff create` and `handoff validate`: create and validate context-only agent handoff skeletons.

## Safety Boundaries

- No real AI provider calls.
- No prompt runner.
- No OCR or vision.
- No Web UI.
- No coding agent calls.
- No generated application code.
- No auto-apply patch behavior.
- No final spec-pack generation.
- Outputs remain review-required.

## What Is Intentionally Not Included

- Real AI extraction.
- Real provider runtime execution.
- Calls to Codex, Claude Code, Cursor, or Spec Kit.
- Production deployment workflow.
- npm publication.
- GitHub release automation.

## Examples

- Minimal valid spec-pack fixture.
- Realistic legacy staff evaluation example.
- Invalid fixture that fails as expected.
- Mock AI patch fixture.
- Human review decision fixture.
- Manual apply plan fixture.
- Handoff manifest fixture.

## CLI Commands

```bash
node bin/specwise.mjs --help
node bin/specwise.mjs doctor
npm test
npm run smoke
```

## Known Limitations

- No real AI extraction yet.
- No OCR / vision / PDF / Figma / database / Web UI support.
- Handoff skeletons prepare context only.
- Deterministic draft output is heuristic and review-required.
- License: MIT.

## License And Package Status

License: MIT.

The root `LICENSE` file has been added.

The `package.json` license field is set to `MIT`.

`package.json` remains `private: true`.

npm publication is intentionally skipped.
