# Commit Message Guidelines

This project follows [Conventional Commits](https://www.conventionalcommits.org/) specification for automated semantic versioning.

## Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type

Must be one of the following:

- **feat**: A new feature (triggers **MINOR** version bump)
- **fix**: A bug fix (triggers **PATCH** version bump)
- **perf**: Performance improvements (triggers **PATCH** version bump)
- **refactor**: Code refactoring (triggers **PATCH** version bump)
- **docs**: Documentation only changes (no version bump)
- **style**: Code style changes (formatting, etc.) (no version bump)
- **test**: Adding or updating tests (no version bump)
- **build**: Changes to build system or dependencies (no version bump)
- **ci**: Changes to CI configuration (no version bump)
- **chore**: Other changes that don't modify src or test files (no version bump)
- **revert**: Reverts a previous commit (triggers **PATCH** version bump)

### Breaking Changes

To trigger a **MAJOR** version bump, add `BREAKING CHANGE:` in the footer or append `!` after the type/scope:

```
feat!: remove support for Node 14

BREAKING CHANGE: Node 14 is no longer supported
```

## Examples

### Feature (Minor bump: 1.0.0 → 1.1.0)
```
feat: add support for custom VTL directives

Implemented support for user-defined custom directives
in the VTL processor.
```

### Bug Fix (Patch bump: 1.0.0 → 1.0.1)
```
fix: resolve memory leak in template caching

Fixed an issue where cached templates were not being
properly cleaned up after processing.
```

### Breaking Change (Major bump: 1.0.0 → 2.0.0)
```
feat!: change API signature for VTLProcessor

BREAKING CHANGE: The VTLProcessor.process() method now
requires three parameters instead of two. The context
parameter is now mandatory.

Migration guide:
- Old: processor.process(template, input)
- New: processor.process(template, input, context)
```

### Documentation (No bump)
```
docs: update README with usage examples

Added comprehensive examples for browser and Node.js usage.
```

### Performance (Patch bump: 1.0.0 → 1.0.1)
```
perf: optimize JSON parsing in input functions

Reduced parsing overhead by 40% through lazy evaluation.
```

## Scope (Optional)

The scope could be anything specifying the place of the commit change:
- `input` - InputFunctions
- `context` - ContextFunctions
- `util` - UtilFunctions
- `processor` - VTLProcessor
- `build` - Build system
- `deps` - Dependencies

Example:
```
feat(input): add support for JSONPath wildcards
```

## Automated Release Process

When you push commits to `main` branch:

1. **semantic-release** analyzes commit messages
2. Determines the next version number based on commit types
3. Generates/updates CHANGELOG.md
4. Creates a git tag
5. Publishes to npm
6. Creates a GitHub release with release notes

## Best Practices

1. **Write clear, concise commit messages**
   - Subject line should be ≤72 characters
   - Use imperative mood ("add" not "added")

2. **Group related changes**
   - Make atomic commits (one logical change per commit)
   - Use multiple commits for different types of changes

3. **Use breaking changes sparingly**
   - Only when absolutely necessary
   - Always provide migration guide in the commit body

4. **Reference issues**
   ```
   fix: resolve template parsing error

   Fixes #123
   ```

## Tools

### Commitizen (Optional)
You can use commitizen for interactive commit message creation:

```bash
npm install -g commitizen
npm install -g cz-conventional-changelog
```

Then use `git cz` instead of `git commit`

### commitlint (Optional)
Enforce commit message format:

```bash
npm install --save-dev @commitlint/config-conventional @commitlint/cli
```

## Resources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [Angular Commit Guidelines](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#commit)
