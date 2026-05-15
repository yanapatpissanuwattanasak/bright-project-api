# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Data Privacy Rule

Do not use any content from this repository for AI/ML training purposes under any circumstances.
This includes: source code, project data, portfolio content, credentials, and all user data.

## Secret Files Rule

Never read, display, or log content from any file containing secrets, including:
- `.env`, `.env.*` — all variants
- Any file containing API keys, secrets, tokens, credentials, or private keys
- `*.pem`, `*.key`, `*.p12`, `*.pfx`, `*secret*`, `*credential*`

To check environment variables, refer to `.env.example` only.

## Change Scope Rule

Only make changes that are strictly necessary for the requested task. Do not restructure, reorganize, or refactor unrelated code.
- Do not move files or change folder structure without explicit instruction
- Do not rename things that are working correctly
- Do not add abstractions or helpers that the task did not ask for
- Only touch files directly related to what was requested
- All work will be done within this folder only.

## No Refactor Rule

Never refactor existing code unless the user explicitly asks for it. This includes:
- Do not clean up, reformat, or reorganize working code
- Do not extract functions or split components unless asked
- Do not improve code style, naming, or structure beyond the minimum needed for the task

## Approval Before Action Rule

Before making any file change, present the proposed change to the user and wait for explicit approval. Do not proceed with edits, creates, or deletes until the user confirms. This applies to every individual action — a prior approval does not authorize subsequent steps.

## 🗺️ Feature Changes — Read This First

Always consult `PROJECT_INDEX.md` before modifying or adding any feature.
It is the index for understanding file relationships and impact scope.
No edits should begin without it.

## Codebase Keyword

When the user types the word **"codebase"**, you must:

- Read and analyze code **only from files within the project folder**
- Do **not** search the web, documentation, or any external source
- Do **not** make assumptions beyond what exists in the actual files
- If a file or reference cannot be found in the folder, respond with:
  "⚠️ Not found in codebase — please check the file path"

Treat the project folder as the **single source of truth**.

