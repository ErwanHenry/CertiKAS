# Contributing to CertiKAS

Thank you for your interest in contributing to CertiKAS! We're building a crucial tool to combat AI-generated fake news and misinformation.

## Ways to Contribute

### 🐛 Report Bugs
- Check [existing issues](https://github.com/certikas/certikas/issues) first
- Use the bug report template
- Include steps to reproduce, expected behavior, and screenshots
- Specify your environment (OS, browser, Node version)

### 💡 Suggest Features
- Open a feature request issue
- Explain the use case and benefits
- Discuss implementation approach
- Consider security and privacy implications

### 🔧 Submit Code
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Run linters and tests (`npm run lint && npm test`)
6. Commit with clear messages (`git commit -m 'Add amazing feature'`)
7. Push to your fork (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### 📝 Improve Documentation
- Fix typos and clarify explanations
- Add examples and use cases
- Translate to other languages
- Create tutorials and guides

### 🌍 Translations
We need translations for:
- Frontend UI (English → Your Language)
- Documentation
- Error messages

## Development Setup

```bash
# Clone repository
git clone https://github.com/certikas/certikas.git
cd certikas

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your configuration

# Run development server
npm run dev

# Run tests
npm test

# Run linters
npm run lint
```

## Code Style

We use ESLint for code quality:

```bash
npm run lint        # Check for issues
npm run lint:fix    # Auto-fix issues
```

### JavaScript Style Guide
- Use ES6+ features
- Prefer `const` over `let`, avoid `var`
- Use arrow functions for callbacks
- Add JSDoc comments for functions
- Keep functions small and focused

### Commit Messages
Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add bulk certification API endpoint
fix: resolve CORS issue on verification endpoint
docs: update API documentation for /verify
test: add unit tests for ContentHash value object
chore: update dependencies
```

## Testing

All new features must include tests:

```bash
npm test                # Run all tests
npm run test:watch      # Watch mode
npm run test:coverage   # Coverage report
```

### Test Structure
```javascript
describe('CertificationService', () => {
  it('should certify content successfully', async () => {
    const service = new CertificationService({ ... });
    const result = await service.certifyContent({ ... });
    expect(result.status).toBe('pending');
  });
});
```

## Pull Request Process

1. **Update documentation** if adding features
2. **Add tests** for new functionality
3. **Pass all CI checks** (linting, tests, build)
4. **Request review** from maintainers
5. **Address feedback** promptly
6. **Squash commits** before merging

## Security

### Reporting Vulnerabilities
**DO NOT** open public issues for security vulnerabilities.

Email: security@certikas.org

We'll respond within 48 hours and work with you to:
- Confirm the vulnerability
- Develop a fix
- Release a patch
- Credit you (if desired)

### Security Best Practices
- Never commit `.env` files or credentials
- Validate all user inputs
- Use parameterized queries (prevent SQL injection)
- Implement rate limiting on APIs
- Keep dependencies updated

## Architecture

CertiKAS uses **Hexagonal Architecture** (Ports & Adapters):

```
src/
├── domain/              # Core business logic (no dependencies)
│   ├── entities/        # Certificate, User
│   ├── value-objects/   # ContentHash
│   └── repositories/    # Interfaces only
├── application/         # Use cases & orchestration
│   ├── commands/        # CreateCertificate
│   ├── queries/         # GetCertificate
│   └── services/        # CertificationService
├── infrastructure/      # External integrations
│   ├── kaspa/           # Blockchain adapter
│   ├── kasplex/         # Token adapter
│   └── storage/         # Database adapter
└── interfaces/          # User-facing layers
    ├── api/             # REST API
    ├── web/             # Frontend
    └── extension/       # Browser extension
```

### Design Principles
- **Domain-driven design** - Business logic in domain layer
- **Dependency inversion** - Infrastructure depends on domain
- **Testability** - Mock external dependencies easily
- **Separation of concerns** - Each layer has clear responsibility

## Community Guidelines

### Code of Conduct
- Be respectful and inclusive
- Assume good intentions
- Provide constructive feedback
- Focus on what's best for the community
- No harassment, discrimination, or trolling

### Communication Channels
- **GitHub Issues** - Bug reports and feature requests
- **GitHub Discussions** - General questions and ideas
- **Discord** - Real-time chat and collaboration
- **Twitter** - Announcements and updates

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Credited in release notes
- Eligible for Igra token rewards (coming soon)
- Invited to contributor Discord channel

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for helping fight fake news! 🛡️**
