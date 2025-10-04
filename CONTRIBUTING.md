# 🤝 Contributing to LangChain.js Code Generation Agent

Thank you for your interest in contributing! This project aims to provide high-quality AI-powered code generation for Next.js and Express.js applications.

## 🚀 Quick Start

1. **Fork the repository**
2. **Clone your fork:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/langchain-js-code-agent.git
   cd langchain-js-code-agent
   ```
3. **Install dependencies:**
   ```bash
   npm install --legacy-peer-deps
   ```
4. **Set up environment:**
   ```bash
   cp .env.example .env
   # Add your GOOGLE_API_KEY
   ```
5. **Run tests:**
   ```bash
   npm test
   ```

## 📋 Development Guidelines

### Code Style
- Use ES6+ features and modules
- Follow existing code patterns
- Add JSDoc comments for functions
- Use meaningful variable names
- Keep functions small and focused

### Git Workflow
1. Create a feature branch: `git checkout -b feature/amazing-feature`
2. Make your changes
3. Test thoroughly
4. Commit with descriptive messages
5. Push and create a Pull Request

### Commit Messages
Use conventional commits:
- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation updates
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test additions/updates
- `chore:` Maintenance tasks

## 🔧 Project Structure

```
src/
├── agents/          # AI agents for code generation
├── templates/       # Code generation templates
├── utils/          # Utility functions
└── index.js        # Main application entry
```

## 🧪 Testing

- Run all tests: `npm test`
- Run linting: `npm run lint`
- Test setup: `node test-setup.js`

## 📝 Adding New Features

### Adding New Code Templates
1. Edit `src/templates/index.js`
2. Add your template following existing patterns
3. Update the agent to use the new template
4. Add tests and documentation

### Adding New Agents
1. Create new agent in `src/agents/`
2. Extend `BaseAgent` class
3. Implement required methods
4. Update main application to register the agent
5. Add tests and documentation

## 🐛 Reporting Issues

When reporting issues, please include:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Environment details (Node.js version, OS)
- Error messages and logs

## 💡 Feature Requests

We welcome feature requests! Please:
- Check existing issues first
- Provide clear use case description
- Explain why the feature would be valuable
- Consider implementation complexity

## 🔒 Security

- Never commit API keys or secrets
- Use environment variables for configuration
- Follow security best practices
- Report security issues privately

## 📄 Documentation

- Update README.md for user-facing changes
- Update API.md for API changes
- Add inline code comments
- Update examples if needed

## 🎉 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- GitHub contributors graph

## 📞 Getting Help

- Create an issue for bugs
- Use discussions for questions
- Check existing documentation first

## 📜 Code of Conduct

Please be respectful and professional in all interactions. We're building something awesome together! 🚀

---

Happy coding! 💻✨