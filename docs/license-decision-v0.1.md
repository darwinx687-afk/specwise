# License Decision v0.1

Status: Phase 16 decision record. This document is not legal advice.

The project owner confirmed MIT License for SpecWise before tagging and releasing `v0.1.0-preview.0`.

The root `LICENSE` file has been added with standard MIT License text.

The `package.json` license field is set to `MIT`.

本文不是法律建议。项目所有者已经确认 SpecWise 使用 MIT License。根目录 `LICENSE` 文件已添加，`package.json` license 字段已设置为 `MIT`。

## Common Options To Consider

- MIT: simple permissive license, common for developer tools.
- Apache-2.0: permissive license with explicit patent grant.
- BSD-3-Clause: permissive license with attribution and non-endorsement terms.
- GPL/AGPL family: copyleft licenses, stronger sharing requirements.
- Source-available / custom license: requires careful legal review.

## Project-Fit Notes

For a developer-facing CLI tool that aims for broad adoption, a permissive license such as MIT or Apache-2.0 is usually easier for users to adopt. The final choice must be confirmed by the project owner.

## Decision Gate

- [x] Project owner confirms the license: MIT.
- [x] `LICENSE` file is added after owner confirmation.
- [x] `package.json` license field is added after owner confirmation.
- [x] Release/tag planning is reviewed after the license decision.

This license gate is complete for `v0.1.0-preview.0`. npm publication remains intentionally skipped.
