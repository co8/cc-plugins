# Claude Code Plugins by co8

![Plugins](https://img.shields.io/badge/plugins-1-blue) ![Skills](https://img.shields.io/badge/skills-2-purple) ![License](https://img.shields.io/badge/license-MIT-green) ![Maintained](https://img.shields.io/badge/maintained-yes-brightgreen)

[![Claude Code](https://img.shields.io/badge/Claude_Code-Anthropic-F9DC3E?logo=anthropic&logoColor=white)](https://claude.ai/code) [![skills.sh](https://img.shields.io/badge/skills.sh-npx_skills_add-black?logo=vercel)](https://skills.sh) [![Vercel](https://img.shields.io/badge/Vercel-Hosted-000000?logo=vercel&logoColor=white)](https://vercel.com)

![Generated with Claude](https://img.shields.io/badge/Generated_with-Claude-D4A574?logo=anthropic&logoColor=white)

A curated collection of Claude Code plugins and skills for enhanced productivity and workflow automation.

---

## 📋 Available Skills & Plugins

| Name                | Type   | Purpose                                          |
| ------------------- | ------ | ------------------------------------------------ |
| **telegram-plugin** | Plugin | Remote interaction with Claude Code via Telegram |
| **secret-sauce**    | Skill  | Development best practices and patterns          |
| **swarm-protocol**  | Skill  | Multi-agent orchestration for complex projects   |

---

## ⚡ Quick Install

### Install Skills

```bash
# Install skills via skills.sh
npx skills add co8/cc-plugins/secret-sauce
npx skills add co8/cc-plugins/swarm-protocol
```

### Add the Marketplace

```bash
# Add cc-plugins marketplace to Claude Code
/plugin marketplace add co8/cc-plugins
```

### Install Plugins

```bash
# Install plugins from the marketplace
/plugin install telegram-plugin@cc-plugins
```

---

## 📦 Available Plugins

### [Telegram Plugin](./plugins/telegram-plugin) ![Version](https://img.shields.io/badge/version-0.6.0-blue)

**Remote interaction with Claude Code via Telegram**

Control and monitor Claude Code remotely via Telegram. Receive smart notifications about task completions, errors, session events, and important insights. Respond to Claude's questions via Telegram inline keyboards from anywhere.

**Features:**

- 🚀 Auto-Setup Detection - Automatic configuration prompts
- 📬 Smart Notifications - Task updates and insights
- ✅ Remote Approvals - Interactive inline keyboards
- 🔔 Keyword Detection - Automatic insight detection
- ⚡ Message Batching - Intelligent notification grouping
- 🎛️ Fully Configurable - Customize all settings

**Quick Start:**

```bash
/telegram-plugin:configure
```

[View Documentation →](./plugins/telegram-plugin/README.md)

---

## 🎯 Available Skills

### [Secret Sauce](./skills/secret-sauce) ![Version](https://img.shields.io/badge/version-1.2.0-purple)

**Development best practices and project patterns**

Centralized collection of best practices, rules, and templates extracted from real production projects. Enables carrying accumulated learnings to future projects automatically.

**Features:**

- 📝 Project Templates - CLAUDE.md, settings.json, project docs
- 🔧 Framework Rules - TypeScript, Next.js, React, Supabase patterns
- 🚀 Deployment Guides - Vercel, Supabase configuration
- 🧪 Testing Standards - Unit, integration, E2E patterns
- 🔄 Git Workflows - Commit conventions, PR templates

**Quick Start:**

```bash
npx skills add co8/cc-plugins/secret-sauce
```

---

### [Swarm Protocol](./skills/swarm-protocol) ![Version](https://img.shields.io/badge/version-1.2.0-purple)

**Multi-agent development orchestration for complex projects**

Coordinate parallel development workstreams, manage project documentation structure, and automate milestone commits. Ideal for large features requiring multiple agents working simultaneously.

**Features:**

- 🐝 Parallel Agents - Coordinate multiple workstreams
- 📋 Project Planning - Structured documentation templates
- 🎯 Milestone Tracking - Automated progress commits
- 🔀 Phase Management - Sequential and parallel execution
- 📊 Code Review - Quality metrics and recommendations

**Quick Start:**

```bash
npx skills add co8/cc-plugins/swarm-protocol
/swarm <project-name>
```

---

## 📄 License

MIT License. See [LICENSE](./LICENSE) for details.

---

Made with ❤️ by [co8.com](https://co8.com)
