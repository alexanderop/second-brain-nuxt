---
title: "Stop Writing Code: Why Software Development Is Dead and Engineering Lives On"
status: draft
tags:
  - ai-coding
  - software-engineering
  - career
  - productivity
core_idea: "Software development (writing code) is dying while software engineering (designing systems) becomes more valuable than ever—the developers who thrive will be the ones who stop typing and start thinking."
target_audience: "Developers worried about AI replacing them, engineering managers rethinking team structures, and anyone who wants to understand how their role will change by 2031"
created: 2026-01-13
updated: 2026-01-13
---

## Draft

I haven't written code by hand in months.

This year alone, I built four complete projects using only Claude Code: a markdown editor, a Nuxt blog starter, a workout tracking app, and the Second Brain you might be reading this on. At work, I regularly one-shot entire issues without touching my keyboard for anything except prompts. Last week, I resolved a production incident using VS Code Copilot while barely glancing at the actual code.

I'm not special. I'm just paying attention.

And I'm not alone. Simon Willison[^1]—one of the most respected voices in the developer community—put it bluntly on the Oxide and Friends podcast:

> I think the job of being paid money to type code into a computer will go the same way as punching punch cards [...] I do not think anyone will be paid to just do the thing where you type the code. I think software engineering will still be an enormous career. I just think the software engineers won't be spending multiple hours of their day in a text editor typing out syntax.

But here's the part that matters:

> The more time I spend on AI-assisted programming the less afraid I am for my job, because it turns out building software—especially at the rate it's now possible to build—still requires enormous skill, experience and depth of understanding. The skills are changing though! Being able to read a detailed specification and transform it into lines of code is the thing that's being automated away. What's left is everything else, and the more time I spend working with coding agents the larger that "everything else" becomes.

That "everything else" is the whole point.

### The Shift Is Already Here

In five years, developers won't write code by hand. This isn't a prediction about some distant future—it's a description of what's already happening to anyone using the right tools.

The reason most people don't see it? Two things: skill gaps and companies failing to provide developers with modern tooling. Most developers are still typing every character. Most companies are still debating whether AI tools are "worth the license cost." Meanwhile, the developers who figured this out are shipping at 10x the pace.

The creator of Claude Code uses Claude Code to work on multiple features simultaneously. Techniques like Ralph[^2]—an automation framework that breaks work into discrete chunks—can literally rip through your entire backlog. This isn't theoretical. It's happening now, in production, at companies that stopped waiting for permission.

### The Great Distinction Nobody Talks About

Here's what changes everything: understanding the difference between software *engineering* and software *development*.

**Software engineering** is designing systems. Architecture decisions. Test strategies. The guardrails that keep a codebase healthy over time. Knowing what to build and—more importantly—what not to build.

**Software development** is writing the actual code. Translating specifications into syntax. Converting tickets into pull requests.

One of these is a creative, strategic discipline. The other is translation work.

Software development is dying. Software engineering is more valuable than ever.

Kent Beck[^3] put it perfectly: 90% of traditional skills have lost their economic value because AI can replicate them efficiently. But the remaining 10%? They gain 1000x leverage through AI augmentation. The question you need to answer: which skills are your 10%?

### Scrum Was a Workaround for Human Limitations

Think about why we created Scrum in the first place.

We needed big teams with specialized roles because implementing features took forever. Frontend developers, backend developers, QA engineers, DevOps specialists—all coordinating through ceremonies and tickets because the bottleneck was literally typing characters into an editor.

In the worst cases—an anti-pattern far too common—managers saw developers as "code monkeys" who converted tickets into code. The developer's job was translation, not thinking.

This made sense when coding was slow. When a feature took days or weeks to implement.

Those days are over.

When implementation takes days, you need ceremonies to coordinate. When implementation takes minutes, the coordination overhead becomes the bottleneck. Scrum isn't dying because it was bad—it's dying because the constraint it solved no longer exists.

### The New Economics

The math has fundamentally changed.

Prototypes are cheap now. What took a sprint takes an afternoon. Burke Holland[^4], a Microsoft developer advocate, built four substantial projects with AI—including Swift applications in a language he doesn't know. His advice? "Make things. Stop waiting to have all the answers... you can make them faster than you ever thought possible."

I've watched product owners use Claude Code to generate their own prototypes, fix simple bugs, and submit pull requests. They're not becoming developers—they're just not waiting for developers anymore.

Ralph-style automation lets you feed your backlog to an AI and get working code out the other end. Not perfect code. Not production-ready code on the first try. But functional code that's 80% there, leaving humans to handle the remaining 20% that actually requires judgment.

The developers who thrive aren't writing more code. They're orchestrating AI to write code for them, then applying their expertise to the parts that matter.

### The Hard Part Was Never Coding

Here's the uncomfortable truth: coding was never the hard part. We just convinced ourselves it was because it took so much *time*.

Lee Robinson[^5]—who went from Vercel to Cursor—built a Rust image compressor, a SvelteKit web app, and a hardware game without writing code by hand. His reflection? "Writing code was never really the bottleneck, especially for larger projects." And: "It wasn't about the code... It's about building something great and something that I'm proud of."

The actually hard problems haven't changed:
- Understanding what customers need (not what they say they need)
- Writing specifications clear enough that anyone—human or AI—can implement them
- Knowing what to build and what to skip
- Making architectural decisions that won't haunt you in two years
- Marketing, positioning, product sense

These are human problems. Creative problems. Strategic problems.

Martin Fowler[^6] argues this is the biggest shift since assembly to high-level languages. But here's what he gets right: AI lacks architectural judgment. It cannot distinguish good patterns from poor ones. It can write code all day, but it can't tell you whether that code should exist.

The value shifts from writing code to knowing what code to write and why.

### "But AI Code Is Buggy"

Yes. And?

The first high-level language compilers produced worse machine code than hand-written assembly. Early web frameworks were slower than hand-crafted HTML. Every abstraction layer introduces inefficiencies.

We adopt them anyway because developer productivity matters more than perfect output. The question isn't "is AI code flawless?"—it's "is AI code good enough, fast enough, to change the economics?"

The answer is yes. Today. Not in five years—today.

I'm not arguing AI produces better code than expert developers. I'm arguing it produces acceptable code fast enough that the calculus changes. When you can generate ten implementations in the time it takes to write one, you can afford to throw away the bad ones.

The skeptics are optimizing for the wrong variable. They're measuring code quality when they should be measuring iteration speed.

### How to Prepare

Geoffrey Huntley[^7] put it bluntly: "Software engineers who haven't adopted or started exploring software assistants, are frankly not gonna make it."

But here's the nuance he adds: "I suspect there's not going to be mass-layoffs for software developers due to AI. Instead, what we will see is a natural attrition between those who invest in themselves right now and those who do not."

This isn't about being replaced by AI. It's about being outperformed by developers who use AI. The gap is already opening.

If you want to thrive in this new world, here's where to focus:

**Learn how LLMs actually work.** Not to build models—to orchestrate them. Understand context windows, token limits, prompt engineering. Know why your AI assistant suddenly "forgot" what you told it three messages ago. This isn't optional knowledge anymore; it's table stakes.

**Study the architecture of AI agents.** The developers who can build custom agents for their specific workflows have superpowers the rest of the industry doesn't understand yet. Resources like the 12 Factor Agents[^8] manifesto lay out the principles: small focused agents, deterministic control flow with strategic LLM decision points, and proper context window management. Learn what context engineering means. Understand why RAG exists. Build something that automates your own repetitive work.

**Double down on software engineering.** System design, architecture patterns, testing strategies—these skills become more valuable, not less. When anyone can generate code, the people who know what code to generate become invaluable.

**Stop optimizing for code output.** Start optimizing for clarity of thought, quality of specifications, and speed of iteration. Your value isn't in the characters you type; it's in the decisions you make.

### The Paradox

Here's what I find fascinating: I don't think we'll ever get AI that matches human agency and creativity. The models might plateau. They might not get dramatically "smarter" than they are today.

It doesn't matter.

Even with current capabilities, as tooling improves, we're witnessing the biggest transformation in software development history. The change isn't coming from AI replacing human thinking—it's coming from AI eliminating the translation layer between human thinking and working software.

You don't need AGI to automate code. You just need models that are good enough at translation, combined with humans who are good enough at specification.

We have both. Right now.

---

The question isn't whether this shift will happen. It's whether you'll be ready when your company finally notices.

[^1]: Simon Willison, [LLM Predictions for 2026](https://simonwillison.net/2026/Jan/8/llm-predictions-for-2026)
[^2]: [Ralph](https://github.com/snarktank/ralph) - Automation framework for AI-driven development
[^3]: Kent Beck, [90% of My Skills Are Now Worth $0](https://tidyfirst.substack.com/p/90-of-my-skills-are-now-worth-0)
[^4]: Burke Holland, [Opus 4.5 is Going to Change Everything](https://burkeholland.github.io/posts/opus-4-5-change-everything/)
[^5]: Lee Robinson, [AI codes better than me. Now what?](https://www.youtube.com/watch?v=UrNLVip0hSA)
[^6]: Martin Fowler, [How AI Will Change Software Engineering](https://www.youtube.com/watch?v=CQmI4XKTa0U)
[^7]: Geoffrey Huntley, [What do I mean by some software devs are "ngmi"?](https://ghuntley.com/ngmi/)
[^8]: [12 Factor Agents](https://www.humanlayer.dev/blog/12-factor-agents) - Principles for production-grade AI agents

## Source Notes

- [[llm-predictions-for-2026]] - Simon Willison's prediction that typing code will go the way of punch cards
- [[ai-codes-better-than-me-now-what]] - Lee Robinson's reflection that "writing code was never really the bottleneck"
- [[opus-4-5-is-going-to-change-everything]] - Burke Holland building Swift apps without knowing Swift
- [[90-of-my-skills-are-now-worth-0]] - Kent Beck's 90/10 framework
- [[12-factor-agents]] - Architecture principles for building production-grade AI agents
- [[the-age-of-the-generalist]] - High-agency generalists thriving while passive specialists struggle
- [[how-ai-will-change-software-engineering]] - Martin Fowler on the biggest shift since assembly
- [[ralph]] - The tool that demonstrates backlog automation in practice
