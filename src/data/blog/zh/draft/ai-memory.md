---
title: AI Agent 的记忆如何构建
description: 思考碎片 20260424
pubDatetime: 2026-04-24T00:00:01Z
tags:
  - AI
  - Agent
  - Memory
lang: zh
featured: false
draft: true
---

# AI Agent 记忆如何构建

最近对 Agent 的记忆系统设计很感兴趣，尤其是结合人类的记忆机制，比较它们之间的异同，很有意思。这篇为相关思考和收获。

## 记忆是动态过程

首先，一个重要的问题是，我们**如何看待人类的记忆**。这不仅决定了我们如何认识自己，也能影响我们设计 agent 记忆系统的思路。

说起记忆，我们容易想到“存储“的概念。好像有了可靠的存储机制，就能解决一切记忆问题，可这是一个误解。

事实上，人类的记忆并不是静态的存储，记忆的提取也不是简单的检索和回放。

> 现代认知神经科学并不把记忆视为对过去经验的固定读取，而更倾向于将回忆理解为一种**线索驱动的动态重建**过程。过去经历会留下分布式的记忆痕迹（Engram）；当当前情境、内部状态、语义关联或目标与这些痕迹形成足够匹配时，相关神经活动模式被重新激活，并与既有知识和图式（Schema）重新组合，**生成**当下这一次回忆。因此，记忆既不是纯粹复现，也不是任意虚构，而是**在历史痕迹约束下的重构**。[^1] [^2] [^3] [^4]

从中可以提炼记忆机制的关键步骤：

- 过去经历留下记忆痕迹
- 当前线索与记忆痕迹匹配
- 相关神经活动模式被重新激活
- 与既有知识和图式重新组合
- 生成当下这一次回忆


下面我们就看看，在 Agent 记忆系统设计上有哪些尝试，是否在某些方面可以借鉴人类的记忆机制。

## Agent 记忆的类型

目前的 Agent 系统多数依赖外部记忆，比如基于 RAG 技术的存储和检索。这是静态的思路。

Agent 的记忆机制会围绕大模型的特点来设计。从技术实现的角度看，我认为大模型的记忆可以区分为三个层面：

1. **参数记忆**：记忆可以写进权重参数，这是模型“真正地“记住了。

2. **上下文/KV 记忆**：记忆体现在推理过程内部，如长上下文、KV Cache 等。

3. **外部记忆**：记忆在模型外部，如向量库、知识图谱和数据库等。

对于第一种，权重参数在预训练阶段已经决定，让记忆体现于参数上很难，先跳过这个选项。

第三种就是我们常见的、基于存储和检索的记忆方案。

对于第二种，可以参考 EverMind 公司提出的 **MSA** 架构（延伸阅读 5）。

MSA 的思想是将记忆**融入模型的推理过程**。它不是简单把检索的文本重新插入 prompt，而是事先把历史内容做预处理，把长期记忆编码成 `Latent Memory States`，然后在多层 `Attention` 里通过 `Routing / Top-k` 筛选等机制**注意到**相关记忆。

在应用 MSA 的过程中，既然需设计预处理和存储机制，那就有**信息召回**的可能性。

因为即使历史上下文全部被用于 Query 的匹配，采用 Top-k 的稀疏方案，依然可能导致信息丢失，这取决于 Router 机制的精确度。

（如果你看过大模型推理的基本原理，理解 MSA 应该没什么问题。详细内容可参考原论文）

从这个过程也可以看出，**记忆是生成式的**，不是静态的。

结合人类记忆的提取，这里有一个对比图：

![RAG Architecture](../../images/rag-msa-human.png)

因此，从 Agent 和模型的角度说： 

> Agent Memory 的核心不是“存更多上下文”，而是“让过去经验以合适的表征形态参与当前推理”。

## 四层记忆结构

四类记忆的区分：
![Memory Types](../../images/agent-memory.png)

值得一提的是，这里面从情节记忆到语义和程序记忆的转变，需要一个沉淀和巩固的过程，通常成为 `Consolidation`。这个过程不必每时每刻都发生，而是发生在特定的时间窗口。

类比人类的记忆，神经科学里通常区分 `Synaptic Consolidation` 和 `Systems Consolidation`。前者更快，发生在学习后的数分钟到数小时尺度，让新形成的痕迹更稳定；后者更慢，涉及**海马—新皮层**之间的长期重组。[参考文献](https://www.sciencedirect.com/science/article/abs/pii/S0306452224002306)

另外，以前大家容易把 Consolidation 主要和睡眠绑定，但近年的研究越来越强调**清醒休息**(`Wakeful Rest`) 也重要。2025 年一项系统综述和 meta-analysis 汇总 37 项研究、63 个实验，发现学习后的安静清醒休息能显著促进记忆巩固，而且效果在 7 天后仍可观察到。[参考文献](https://link.springer.com/article/10.3758/s13423-025-02665-x)

这对 agent 很有启发：不一定非要等离线的批处理，系统空闲时就可以做轻量 replay / consolidation。例如在用户暂停、任务空闲以及会话间隔：

- 回放本次 episode
- 与已有 semantic memory 对齐
- 发现重复模式
- 发现冲突
- 给候选记忆打分

不过，睡眠仍然是巩固（`Consolidation`）的核心窗口之一。2024 年 TMR 综述说，睡眠支持新记忆的强化（`Strengthening`）和整合（`Integration`）；睡眠中的记忆激活（`Memory Reactivation`）被认为涉及新信息的重处理（`Reprocessing`）、重新分布（`Redistribution`），并与已有记忆网络整合。[参考文献](https://www.nature.com/articles/s41539-024-00244-8)

对于 agent 来说，其实无所谓“清醒“还是“睡眠“，因为人类的大脑在两种状态下确实有区别，但 agent 系统的则没有。因此，可以借鉴的是**区分不同的巩固任务类型**，不妨从以下几个角度入手：

- 在线 vs 离线
- 轻量 vs 深度
- 局部 vs 全局
- 近期情节 vs 长期历史
- 低风险整理 vs 高风险更新

人类记忆还有一个非常重要的机制：旧记忆被重新激活后，可能进入短暂可塑状态，然后被加强、削弱或更新。这个叫 `Reconsolidation`。相关研究认为，记忆重新激活会让已存记忆重新变得**可塑**（Labile），随后需要重新稳定，这个窗口可以让记忆**被新信息更新**。

这对 agent 设计也很重要。很多 agent memory 只在写入时做 Consolidation，却忽略了 retrieval-triggered update。例如，在某条旧记忆被检索并用于回答后：

- 检查它是否仍然正确
- 是否出现新证据
- 是否需要提高/降低置信度
- 是否需要合并或拆分

对于巩固的目标，2023 年 Nature Neuroscience 的一篇 complementary learning systems 研究提出一个很有意思的观点：系统巩固的目标不只是“把记忆从海马转移到新皮层”，而是服务于**泛化**（`Generalization`）。

如果环境中有很多不可预测噪声，过度巩固反而会让系统过拟合。这篇文章提出，应该优先巩固**有助于泛化的可预测关系**，而不是所有细节。[参考文献](https://www.nature.com/articles/s41593-023-01382-9)

因此，对于 agent 系统：

不该深度巩固：
- 临时任务细节
- 一次性的调试中间假设
- 没有证据支持的推断

应该优先巩固：
- 用户明确偏好
- 多次重复出现的模式
- 被验证过的项目事实
- 可复用的 troubleshooting 方法

![Consolidation](../../images/consolidation.png)

体现类似设计思想的设计系统有开源的 [MemPalace](https://github.com/mempalace/mempalace)。


我使用觉得遗忘也是智能的一部分。

一个永远不忘的 agent 会出现几个问题：

- 旧偏好污染新偏好
- 临时事实被当成长期事实
- 过期项目状态影响决策
- 低价值细节挤占检索空间
- 过去失败经验被过度泛化
- 记忆越多，检索越慢、噪声越大

agent 的遗忘不应该首先设计成“删除”，而应该设计成“可访问性下降”。真正删除只用于隐私、安全、用户明确要求、法律合规和确认无价值的垃圾信息。

这点很像人类记忆。人类遗忘很多时候不是痕迹彻底消失，而是变得更难被线索激活；有些记忆在特定线索、情境或强化后又能被唤起。

近年的 agent memory 研究也在往这个方向走，比如 Oblivion 明确把遗忘定义为 accessibility decay，而不是 explicit deletion。[参考文献](https://arxiv.org/abs/2604.00131)

更进一步，遗忘可以分为四种类型：

| 类型                            | 含义               | 是否删除原始数据 |
| ----------------------------- | ---------------- | -------- |
| **Accessibility Decay**       | 记忆还在，但默认不容易被检索出来 | 否        |
| **Compression / Abstraction** | 细节被压缩，只保留高层语义或方法 | 原始数据可归档  |
| **Supersession**              | 旧事实被新事实替代，但历史仍保留 | 否        |
| **Hard Deletion**             | 彻底删除或不可恢复删除      | 是        |

![Forgetting](../../images/forgetting.png)

很多系统只在写入时判断要不要记忆，但遗忘更应该发生在检索时。

最近的 Oblivion 很有启发：它把 memory control 拆成 read path 和 write path。read path 决定什么时候查 memory，避免 always-on retrieval；write path 决定哪些记忆应该被强化。它的核心思想是：遗忘是可访问性的衰减，而不是删除。

遗忘机制设计的可以参考这几个原则：

**原则一：默认先降权，不默认删除**

删除是不可逆操作，应该谨慎。大多数遗忘应该是 accessibility decay。

**原则二：不同 memory 类型用不同衰减率**

临时上下文快衰减；用户明确偏好慢衰减；工具验证过的事实慢衰减；未验证推断快衰减。

**原则三：旧事实不要删除，要标记 validity**

这能避免 agent 没有时间感。旧事实可能对历史问题仍然有用。

**原则四：记忆被使用后要重新评估**

调用一次 memory，不只是 read，也应该触发 reconsolidation check。

**原则五：遗忘要有用户控制**

用户可以明确要求：

- 忘掉这个
- 这条记忆错了
- 这个只在本项目有效
- 这不是我的长期偏好

**原则六：保留原始证据，衰减检索索引**

除非合规或用户要求删除，否则不要轻易丢原始 episode。真正需要动态衰减的是检索层、语义层和 latent memory 激活层。

总结：
![](../../images/human-agent-memory.png)

## 延伸阅读

### 1. Human Memory Foundations

#### Working Memory

- Baddeley, A. D., & Hitch, G. (1974). **Working Memory**.  
  Recommended for understanding working memory as an active, limited-capacity workspace for the current task.  
  Relevance: maps to agent `Working Memory`: current request, recent context, active plan, tool results.  
  Source: https://app.nova.edu/toolbox/instructionalproducts/edd8124/fall11/1974-Baddeley-and-Hitch.pdf

#### Episodic and Semantic Memory

- Tulving, E. (1972). **Episodic and Semantic Memory**.  
  Foundational paper distinguishing personal event memory from general conceptual/factual knowledge.  
  Relevance: maps to agent `Episodic Memory` and `Semantic Memory`.  
  Source: https://alicekim.ca/EMSM72.pdf

#### Procedural Memory / Knowing How vs Knowing That

- Cohen, N. J., & Squire, L. R. (1980). **Preserved Learning and Retention of Pattern-Analyzing Skill in Amnesia: Dissociation of Knowing How and Knowing That**.  
  Classic evidence that skill learning can be separated from declarative fact/event memory.  
  Relevance: maps to agent `Procedural Memory`: workflows, skills, playbooks, policies.  
  Source: https://pubmed.ncbi.nlm.nih.gov/7414331/

#### Sleep and Memory Consolidation

- Rasch, B., & Born, J. (2013). **About Sleep’s Role in Memory**.  
  A major review on sleep-dependent memory consolidation, including replay, stabilization, and integration.  
  Relevance: inspires agent `sleep-like consolidation`: batch replay, clustering, abstraction, skill distillation.  
  Source: https://pubmed.ncbi.nlm.nih.gov/23589831/

#### Engram / Memory Traces

- Liu, X., Ramirez, S., Pang, P. T., et al. (2012). **Optogenetic Stimulation of a Hippocampal Engram Activates Fear Memory Recall**.  
  Landmark work showing that reactivating hippocampal engram cells can trigger memory recall behavior in mice.  
  Relevance: useful for thinking about memory as reactivatable traces, not stored files.  
  Source: https://www.nature.com/articles/nature11028

- Josselyn, S. A., & Tonegawa, S. (2020). **Memory Engrams: Recalling the Past and Imagining the Future**.  
  Review of engram theory and how memory traces support recall and reconstruction.  
  Relevance: connects human memory traces with MSA-like latent trace memory.  
  Source: https://pmc.ncbi.nlm.nih.gov/articles/PMC7577560/

---

### 2. Cognitive Architectures and Agent Memory Frameworks

#### CoALA

- Sumers, T. R., Yao, S., Narasimhan, K., & Griffiths, T. L. (2023/2024). **Cognitive Architectures for Language Agents**.  
  The most important high-level framework for mapping cognitive architecture ideas to language agents.  
  Relevance: directly uses working, episodic, semantic, and procedural memory for language agents.  
  Source: https://arxiv.org/abs/2309.02427

#### MemGPT / Letta

- Packer, C., Wooders, S., Lin, K., Fang, V., Patil, S. G., Stoica, I., & Gonzalez, J. E. (2023). **MemGPT: Towards LLMs as Operating Systems**.  
  Introduces virtual context management and memory tiers inspired by operating systems.  
  Relevance: helps understand working memory vs archival memory, and why context must be managed rather than simply expanded.  
  Source: https://arxiv.org/abs/2310.08560

- Letta Documentation. **Memory Management / Core, Recall, and Archival Memory**.  
  Productized continuation of MemGPT-style memory management.  
  Relevance: useful for seeing how agent-controlled memory tools are exposed in practice.  
  Source: https://docs.letta.com/concepts/memory-management/

---

### 3. Long-Term Agent Memory Systems

#### Zep / Graphiti

- Rasmussen, P., Paliychuk, P., Beauvais, T., Ryan, J., & Chalef, D. (2025). **Zep: A Temporal Knowledge Graph Architecture for Agent Memory**.  
  Proposes a temporal knowledge graph architecture for long-term agent memory.  
  Relevance: especially important for semantic memory, source/time-aware facts, fact invalidation, and relationship evolution.  
  Source: https://arxiv.org/abs/2501.13956

#### A-MEM

- Xu, W., Liang, Z., Mei, K., Gao, H., Tan, J., & Zhang, Y. (2025). **A-MEM: Agentic Memory for LLM Agents**.  
  Proposes a dynamic, Zettelkasten-inspired memory network for LLM agents.  
  Relevance: closest to memory evolution, linking, and reconsolidation-like updating.  
  Source: https://arxiv.org/abs/2502.12110

#### MemoryOS

- Kang, J., et al. (2025). **Memory OS of AI Agent**.  
  Proposes a hierarchical memory operating system for personalized AI agents.  
  Relevance: useful for studying short-term, mid-term, and long-term memory update pipelines.  
  Source: https://aclanthology.org/2025.emnlp-main.1318/

#### LangMem / LangGraph Memory

- LangChain. (2025). **LangMem SDK for Agent Long-Term Memory**.  
  SDK for extracting, updating, and consolidating long-term agent memory.  
  Relevance: practical engineering reference for memory extraction, consolidation, and personalization.  
  Source: https://www.langchain.com/blog/langmem-sdk-launch

#### Mem0

- Mem0. **Universal / Self-Improving Memory Layer for LLM Applications**.  
  Product-oriented memory layer for persistent context and user personalization.  
  Relevance: useful for application-level memory APIs and personalization memory.  
  Source: https://docs.mem0.ai/platform/overview

#### MemPalace

- MemPalace. **Open-source AI Memory System / Memory Palace for Agents**.  
  Local-first memory system using memory-palace-inspired organization and MCP integration.  
  Relevance: useful for episodic archive, verbatim-first memory, and agent-accessible memory tooling.  
  Source: https://github.com/mempalace/mempalace

---

### 4. Memory as a System Resource

#### MemOS

- Li, Z., Song, S., Xi, C., et al. (2025). **MemOS: A Memory OS for AI System**.  
  Treats memory as a first-class system resource and unifies plaintext memory, activation-based memory, and parameter-level memory.  
  Relevance: probably the most complete conceptual direction for memory lifecycle, provenance, versioning, scheduling, and memory evolution.  
  Source: https://arxiv.org/abs/2507.03724

---

### 5. Latent / Attention-Native Memory

#### MSA

- Chen, Y., Chen, R., Yi, S., et al. (2026). **MSA: Memory Sparse Attention for Efficient End-to-End Memory Model Scaling to 100M Tokens**.  
  Introduces Memory Sparse Attention, which encodes long-term memory into latent memory states and retrieves them through sparse attention.  
  Relevance: closest to the idea of memory traces participating directly in reasoning rather than being inserted as text.  
  Source: https://arxiv.org/abs/2603.23516

---

### 6. Forgetting, Decay, and Memory Governance

#### Oblivion

- Rana, A., Hung, C.-C., Sun, Q., Kunkel, J. M., & Lawrence, C. (2026). **Oblivion: Self-Adaptive Agentic Memory Control through Decay-Driven Activation**.  
  Defines forgetting as decay-driven reduction in accessibility rather than explicit deletion.  
  Relevance: directly supports the design principle that most forgetting should lower retrieval accessibility before deleting evidence.  
  Source: https://arxiv.org/abs/2604.00131

## 参考文献

[^1]: https://www.annualreviews.org/doi/pdf/10.1146/annurev.psych.49.1.289
[^2]: https://wixtedlab.ucsd.edu/publications/Psych%20218/Tulving_Thompson_1973.pdf
[^3]: https://pmc.ncbi.nlm.nih.gov/articles/PMC7577560
[^4]: https://www.nature.com/articles/s41562-023-01799-z
