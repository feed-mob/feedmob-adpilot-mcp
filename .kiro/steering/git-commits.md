---
inclusion: manual
---

# Git Commit Guidelines

When writing git commit messages, follow these conventions:

## Format

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

## Rules

- **Subject line**: Imperative mood, lowercase, no period, max 72 characters
- **Type**: Use one of: `feat`, `fix`, `chore`, `docs`, `style`, `refactor`, `test`, `perf`
- **Scope**: Optional, indicates the area of change (e.g., `auth`, `database`, `ui`, `mcp-tools`)
- **Body**: Optional, provides additional context. Wrap at 72 characters.
- **Footer**: Optional, for breaking changes or issue references

## Types

- `feat`: New feature or capability
- `fix`: Bug fix
- `chore`: Maintenance tasks, dependencies, configuration
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semicolons, etc.)
- `refactor`: Code restructuring without changing behavior
- `test`: Adding or updating tests
- `perf`: Performance improvements

## Examples

```
feat(auth): add Google OAuth authentication

fix(database): handle connection pool exhaustion

chore(deps): upgrade @modelcontextprotocol/sdk to v1.2.0

refactor(mcp-tools): extract parameter validation logic

test(agents): add property tests for campaign persistence

docs(readme): update MCP server configuration instructions
```

## Best Practices

- Start with the most important information
- Explain **what** and **why**, not **how**
- Reference issue numbers in footer when applicable
- Use present tense: "add feature" not "added feature"
- Keep commits atomic and focused on a single concern
