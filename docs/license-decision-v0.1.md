# License Decision v0.1

Status: Phase 15 planning document. This document is not legal advice.

The project owner must choose a license before tagging or releasing `v0.1.0-preview.0`.

No `LICENSE` file has been added yet.

No `package.json` license field should be added until the project owner confirms the license choice.

本文不是法律建议。项目所有者需要在创建 `v0.1.0-preview.0` tag 或 release 前确认许可证。当前不要自动添加 `LICENSE` 文件，也不要自动修改 `package.json` license 字段。

## Common Options To Consider

- MIT: simple permissive license, common for developer tools.
- Apache-2.0: permissive license with explicit patent grant.
- BSD-3-Clause: permissive license with attribution and non-endorsement terms.
- GPL/AGPL family: copyleft licenses, stronger sharing requirements.
- Source-available / custom license: requires careful legal review.

## Project-Fit Notes

For a developer-facing CLI tool that aims for broad adoption, a permissive license such as MIT or Apache-2.0 is usually easier for users to adopt. The final choice must be confirmed by the project owner.

## Decision Gate

- [ ] Project owner confirms the license.
- [ ] `LICENSE` file is added only after owner confirmation.
- [ ] `package.json` license field is added only after owner confirmation, if appropriate.
- [ ] Release/tag planning is reviewed after the license decision.

Until this gate is complete, do not create a git tag, GitHub release, or npm publication.
