---
name: generate-commit-description
description: Generates structured, professional commit messages adhering to Conventional Commits from staged git diffs.
---

# Generate Commit Description Skill

This skill guides the agent to inspect git staged changes and generate a structured, standard commit message using the Conventional Commits specification.

## When to use this skill
- When the user asks to "generate a commit description", "create a commit message", "write a commit log", or "describe current changes".
- Prior to making a commit where documentation or tracking of changes is required.

## How to use it
1. **Analyze Staged Changes**: Run `git diff --cached` to see all staged code changes. If there are no staged changes, check `git diff` for unstaged changes and suggest staging them first.
2. **Draft the Commit Message**:
   - Use the standard Conventional Commits format:
     ```
     <type>(<scope>): <description>

     [optional body]
     ```
   - **Types**:
     - `feat`: A new user-facing feature or API endpoint.
     - `fix`: A bug fix or error correction.
     - `refactor`: Code change that neither fixes a bug nor adds a feature (e.g., performance optimizations, restructuring).
     - `docs`: Documentation updates (e.g., README, API docs).
     - `test`: Adding or updating tests.
     - `style`: Formatting, semi-colons, white-space, etc.
     - `chore`: Build steps, dependency updates, configuration adjustments.
   - **Scope**: (Optional) e.g., `backend`, `frontend`, `auth`, `payments`. Use lowercase.
   - **Description**:
     - Use the imperative mood (e.g., "add", "fix", "improve" instead of "added", "fixes", "improving").
     - Concise, under 72 characters.
     - No period at the end.
     - Lowercase first letter.
3. **Optional Body**:
   - If there are multiple non-trivial changes, add a blank line after the subject and list bullet points starting with `- `.
   - Keep bullet points concise and explain *what* changed and *why* (if not obvious).
4. **Output Format**: Present the message inside a copyable markdown code block (labeled `git-commit`).
