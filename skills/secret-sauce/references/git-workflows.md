# Git Workflow Patterns

Reference guide for git operations and version control best practices.

---

## Commit Format

Use conventional commit format:

```
<type>(<scope>): <description>
```

**Rules**:
- Subject line: 50 characters max
- Use imperative mood ("add", "fix", "update" - not "added", "fixes", "updated")
- No period at end of subject line
- Separate subject from body with blank line (if body needed)

**Types**:
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation only
- `style` - Formatting, no code change
- `refactor` - Code restructuring without behavior change
- `perf` - Performance improvement
- `test` - Adding or updating tests
- `chore` - Build process, dependencies, tooling

**Examples**:

```bash
# Good
feat(auth): add OAuth2 login flow
fix(api): handle null response in user endpoint
docs(readme): update installation instructions
refactor(utils): simplify date formatting logic

# Bad
feat: Added new login feature.          # Past tense, period
Fix bug                                  # Missing scope, vague
update stuff                             # No type, unclear
```

---

## Branch Naming

**Format**: `<type>/<description>`

**Conventions**:
- Use lowercase and hyphens
- Keep descriptions concise but meaningful
- Include ticket/issue number when applicable

**Branch Types**:

| Type | Purpose | Example |
|------|---------|---------|
| `feature/` | New functionality | `feature/user-dashboard` |
| `fix/` | Bug fixes | `fix/login-redirect-loop` |
| `hotfix/` | Urgent production fixes | `hotfix/auth-token-expiry` |
| `refactor/` | Code improvements | `refactor/api-error-handling` |
| `docs/` | Documentation | `docs/api-reference` |
| `test/` | Test additions | `test/integration-suite` |
| `chore/` | Maintenance tasks | `chore/dependency-updates` |

**Examples**:

```bash
feature/oauth-integration
fix/null-pointer-user-service
hotfix/security-patch-2024
refactor/database-queries
```

---

## Pull Request Template

Use this format for PR descriptions:

```markdown
## Summary
<1-3 bullet points describing what this PR does>

## Test plan
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] [Additional testing steps specific to this PR]
```

**Guidelines**:
- Summary should explain the "why" not just the "what"
- Test plan should be actionable checklist
- Link related issues when applicable

---

## Workflow Rules

### Do NOT Commit Until Work Is Confirmed

- Complete all implementation before committing
- Run tests and linting first
- Verify changes work as expected
- Get confirmation before finalizing

```bash
# Pre-commit checklist
npm run lint                    # Use ESLint CLI, NOT next lint
npm run typecheck               # TypeScript validation
npm run test                    # Run test suite
```

### Linting Command

**Important**: Always use `npm run lint` instead of `next lint`:

```bash
# Correct
npm run lint

# Incorrect
next lint
npx next lint
```

### Archive Branches After Merge

After merging to main/master:

```bash
# Archive the branch
git branch -m feature/old-feature archive/feature/old-feature
git push origin archive/feature/old-feature
git push origin --delete feature/old-feature
```

Or simply delete if archiving not needed:

```bash
git branch -d feature/completed-feature
git push origin --delete feature/completed-feature
```

---

## Common Operations

### Starting New Work

```bash
git checkout main
git pull origin main
git checkout -b feature/new-feature
```

### Keeping Branch Updated

```bash
git fetch origin
git rebase origin/main
# Resolve conflicts if any
```

### Pre-Commit Workflow

```bash
# 1. Check status
git status

# 2. Run quality checks
npm run lint
npm run typecheck
npm run test

# 3. Stage specific files (avoid git add -A)
git add src/components/NewFeature.tsx
git add src/tests/new-feature.test.ts

# 4. Commit with proper format
git commit -m "feat(components): add NewFeature component"
```

### Creating PR

```bash
# Push branch
git push -u origin feature/new-feature

# Create PR via CLI
gh pr create --title "feat(components): add NewFeature" --body "$(cat <<'EOF'
## Summary
- Add NewFeature component for dashboard
- Includes responsive design and accessibility

## Test plan
- [ ] Unit tests pass
- [ ] Visual regression tested
- [ ] Mobile viewport verified
EOF
)"
```

---

## Git Safety

- Never force push to main/master
- Avoid `git reset --hard` without confirmation
- Don't commit secrets or credentials
- Stage specific files rather than using `git add -A`
- Review diff before committing: `git diff --staged`
