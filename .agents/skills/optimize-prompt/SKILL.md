---
name: optimize-prompt
description: Converts informal or raw human language instructions into professional, structured developer prompts.
---

# Optimize Prompt Skill

This skill guides the agent to convert informal, brief, or conversational human language requests into clear, professional, structured developer prompts suitable for AI execution.

## When to use this skill
- When the user asks to "optimize this prompt", "make my prompt professional", or "structure my instruction".
- When a user's instruction is vague, open-ended, or lacks technical context (e.g. "add comments", "fix auth", "clean styling").
- Prior to triggering a complex subagent or workflow.

## How to use it
1. **Analyze Human Language Input**: Identify the primary action (add, fix, refactor, style, test), the target files/components, and any implicit requirements.
2. **Retrieve Context**: Identify the relevant files in the workspace, technology stack details (MUI, NestJS, etc.), and design boundaries.
3. **Format into a Professional Prompt**: Structure the output using this template:
   ```markdown
   # Developer Prompt: [Concise Feature Name]

   ## Role & Context
   Define the target agent role (e.g. Lead NestJS Security Engineer) and reference the codebase stack boundaries.

   ## Objective
   Detail what needs to be created or modified, including specific file paths.

   ## Requirements
   - List strict validation standards (e.g., class-validator DTOs, Swagger decorators).
   - List design system principles (e.g., Soft UI layout, Outfit/Inter typography).
   - List testing requirements (e.g., Jest unit/integration tests).
   - Require architectural visualizations (HLD/LLD Mermaid diagrams Before & After) if adding/updating features.

   ## Expected Output
   Specify files to be created/modified, formatting tags (e.g. copyable code blocks), and verification commands.
   ```
4. **Output Format**: Present the resulting prompt inside a copyable markdown block (labeled `prompt`).
