---
title: 从 Code Repo 到 Memory Repo
description: 思考碎片 20260420
pubDatetime: 2026-04-20T00:00:02Z
tags:
  - AI
  - Agent
  - Harness
  - Memory
lang: zh
featured: false
draft: false
---

设想这样的场景，团队里每个人都使用 Coding agent 完成 Build 任务，合作开发一款复杂系统或者产品。

除了 Code repo 的代码和项目规范文件，有没有可能让每个成员与 agent 的交互记忆，以某种方式共享，就像 Code 共享一样？

比如，一个成员发现了代码中的 bug，通过几轮与 agent 的交互，定位了 root cause，这过程中agent 的思考路径、尝试过的方案，对于团队来说都是有用的经验。

那这部分经验是否可以通过 MCP 工具上传到某个 Memory Serice，并以某种形式（数据库、知识图谱等）持久化到一个存储中。其他成员通过 MCP 工具可以获取这些记忆，并注入到自己的 agent 上下文中？

另外，相关 memory MCP 的配置跟随 code 一起 track，这样同样 code repo 的开发者可以随时共享 agent 记忆。

我称之为 `Memory Repository`。

如果细化，需要考虑几个问题：

1. 对于共享者：什么样的记忆需要共享，什么不应该共享？即记忆的筛选问题。
2. 对于使用者：什么可以访问，什么不可以，即权限和隐私问题。
3. 共享者上传记忆后，以何种方式存储？
4. 使用者拿到记忆后，如何有效利用？

比如 3，常见的共享 memory 形态是数据库。

比如 OpenMemory 公开写的是 self-hosted、local-first，后端可以是 SQLite / Postgre。

Mem0 这类系统则把 memory 做成 API，可 add、search，并支持 user / organizational memory 这样的作用域。

也就是说，跨 agent 共享时，最常见的底座不是一个 markdown 文件，而是一个有结构的 backend service。

一个可能的记忆对象举例：

```json
{
  "id": "mem_123",
  "memory_type": "procedure",
  "content": "For repo X, run seed-db before integration tests, otherwise failures are usually false negatives.",
  "scope": "project",
  "actor": "developer_a",
  "repo_id": "repo_x",
  "project_id": "proj_alpha",
  "task_id": "issue_248",
  "run_id": "run_2026_04_20_01",
  "categories": ["testing", "database", "ci"],
  "source": "claude_code_session",
  "evidence_refs": ["commit:abc123", "log:/ci/248/test.log"],
  "confidence": 0.86,
  "valid_from": "2026-04-20T08:00:00Z",
  "valid_until": null,
  "status": "verified"
}
```

例如对于 4，可以考虑：

- Hard context

一定要遵守的规则，放到 checked-in docs / AGENTS.md，不要只靠 memory。OpenAI 官方对 Codex 说得很直接：必须始终适用的团队指导应放在 AGENTS.md 或 checked-in docs 里，memory 只是 recall layer。

- Working memory brief

把当前任务最相关的几条共享记忆压成一个短摘要，像这样：

```
Relevant shared memory for this task:
1. Verified procedure: run seed-db before integration tests in repo X.
2. Recent failure pattern: auth token mismatch in staging often appears as DB timeout.
3. Open handoff: issue_248 already fixed parser path; next step is CI verification.
```

- On-demand references

把剩下内容保留成可回查引用，不立即塞进上下文。Anthropic 推荐的就是这种轻量标识符 + 按需加载方式。

再比如对于 2，涉及审计和治理的问题：

需要保留这类信息：

- 作者是谁
- 何时写入
- 证据是什么
- 是否被后续推翻
- 谁访问过这条 memory

具体的实现层面我还要再思考，但直觉上这个概念应该会有用。

目前找到一些资料：

OpenAI / Codex

- [Codex memories](https://developers.openai.com/codex/memories)
- [`AGENTS.md` guide](https://developers.openai.com/codex/guides/agents-md)
- [Codex MCP integration](https://developers.openai.com/codex/mcp)

Anthropic

- [Effective context engineering for AI agents](https://anthropic.com/engineering/effective-context-engineering-for-ai-agents)
- [Model Context Protocol announcement](https://www.anthropic.com/news/model-context-protocol)

MCP official spec and security

- [MCP architecture overview](https://modelcontextprotocol.io/docs/learn/architecture)
- [MCP resources spec](https://modelcontextprotocol.io/specification/2025-06-18/server/resources)
- [MCP tools spec](https://modelcontextprotocol.io/specification/2025-06-18/server/tools)
- [MCP authorization guide](https://modelcontextprotocol.io/docs/tutorials/security/authorization)
- [MCP security best practices](https://modelcontextprotocol.io/docs/tutorials/security/security_best_practices)
- [MCP working / interest groups](https://modelcontextprotocol.io/community/working-interest-groups)

Mem0 / OpenMemory 
- [Mem0 MCP docs](https://docs.mem0.ai/platform/mem0-mcp)
- [Mem0 memory types](https://docs.mem0.ai/core-concepts/memory-types)
- [Mem0 add memories API](https://docs.mem0.ai/api-reference/memory/add-memories)
- [Mem0 search memories API](https://docs.mem0.ai/api-reference/memory/search-memories)
- [Mem0 collaborative task assistant cookbook](https://docs.mem0.ai/cookbooks/operations/team-task-agent)
- [Mem0 tagging and organizing memories](https://docs.mem0.ai/cookbooks/essentials/tagging-and-organizing-memories)
- [OpenMemory product page](https://mem0.ai/openmemory)
- [OpenMemory GitHub repository](https://github.com/CaviraOSS/OpenMemory)
- [Introducing OpenMemory MCP](https://mem0.ai/blog/introducing-openmemory-mcp)
- [How to make clients more context-aware with OpenMemory MCP](https://mem0.ai/blog/how-to-make-your-clients-more-context-aware-with-openmemory-mcp)

Nowledge Mem

- [Nowledge Mem homepage](https://mem.nowledge.co/)
- [Nowledge Mem API reference](https://mem.nowledge.co/docs/api)
- [Codex CLI integration](https://mem.nowledge.co/integrations/codex-cli)
- [Claude Code integration](https://mem.nowledge.co/integrations/claude-code)
- [Spaces documentation](https://mem.nowledge.co/zh/docs/spaces)
- [Changelog](https://mem.nowledge.co/changelog)

Other frameworks / protocols

- [LangGraph memory overview](https://docs.langchain.com/oss/python/langgraph/memory)
- [Google A2A protocol announcement](https://developers.googleblog.com/en/a2a-a-new-era-of-agent-interoperability/)