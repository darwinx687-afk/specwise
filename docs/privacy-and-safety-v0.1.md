# Privacy And Safety v0.1

Status: Phase 11 safety note.

SpecWise is local-first.

Current v0.1 commands do not call AI providers.

Current v0.1 commands do not make network calls.

Mock examples contain synthetic data.

Do not use real sensitive business data unless you understand where outputs are written.

Future AI preview must be explicit opt-in.

No API keys should be committed.

Local absolute paths must not be included in generated artifacts.

SpecWise v0.1 默认本地运行，不调用真实 AI provider，也不联网。示例数据为 mock 数据。请勿提交 API key 或真实敏感业务数据。

## Output Locations

Most generation commands write to an explicit `--out` folder.

Use `./tmp/...` for local experiments and remove generated output after review.

## Sensitive Data Guidance

- Review input materials before running local workflows.
- Avoid committing generated outputs that contain sensitive business details.
- Keep API keys out of config files.
- Keep local machine paths out of shared artifacts.
- Treat handoff packs as review context, not public-safe documents by default.

## Future AI Preview Boundary

Future AI provider preview must be explicit opt-in, patch-only, and review-required.

Current v0.1 behavior does not call real providers.

