# Known Limitations v0.1

Status: Phase 11 preview limitation list.

SpecWise v0.1 is a local preview foundation, not a complete AI extraction product.

## Current Limitations

- No real AI extraction yet.
- No OCR / vision.
- No PDF parsing.
- No Figma import.
- No database connection.
- No Web UI.
- No auto-apply patches.
- No final spec-pack generation.
- No real agent calls.
- Deterministic draft is heuristic and review-required.
- CSV field inference is deterministic and sample-based; relationship, enum, and required hints require human review.
- XLSX files are recognized in inventory metadata only; v0.1 does not parse XLSX binary contents.
- Handoff pack skeleton is context only.

## What This Means

The draft generator is useful for a safe baseline, but it is not a substitute for human review.

The mock AI patch flow is useful for validating contracts and review workflow, but it is not connected to a real provider.

The handoff pack skeleton prepares context for future coding agents, but it does not authorize implementation and does not call agents.

## Future Work

Future phases may add release prep, public repository packaging, explicit AI preview integration, or richer handoff templates. Those should preserve explicit opt-in, safety checks, and human review boundaries.

Future XLSX parsing requires a separate dependency and safety decision, or a confirmed dependency-free strategy, before implementation.
