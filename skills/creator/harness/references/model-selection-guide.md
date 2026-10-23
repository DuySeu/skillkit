# Claude model selection guide

Choose the model for an agent by four criteria for the task: **complexity, expected duration, required autonomy, and response speed**. You can specify the model in `model:` in the YAML frontmatter of an agent definition file, in the `model` parameter of the `Agent` tool, and in `opts.model` passed to `agent()` in `Workflow`. Record the reason for your choice as a comment in the agent definition or the orchestration skill.

## Summary decision table

| Model | Selection criteria | Representative tasks |
|------|----------|----------|
| **fable** | A long-running, autonomous model that plans for itself from a complex goal and chains many steps through to the final deliverable | Hard reasoning, creative work, agent orchestration, very difficult tasks that must be handled from planning through long-running execution |
| **opus** | A reasoning-centered model that analyzes professional, complex problems in depth and reaches refined judgments and conclusions | Design and architecture, code generation, complex analysis, cross-verification, creative writing |
| **sonnet** | A general-purpose model that handles most everyday work in balance, such as writing, coding, analysis, and research | General writing, coding, and research, log parsing, format conversion, static file checks, running deployment scripts, simple collection |

## 1. Fable

**Main role:** Suited to very difficult tasks that require making a plan and carrying it out autonomously over a long period. It does not stop at answering a question directly; it understands the goal, plans several steps, and carries on to the final deliverable.

### Well-suited tasks

**① Long tasks made of several steps**: Use it when the work does not end in a single answer and several tasks must be performed in sequence.
- Market research → competitor analysis → strategy formulation → report writing
- Requirements analysis → service structure design → development plan writing → deliverable production
- Reviewing several documents, then deriving an overall conclusion and an action plan
- Designing the entire process of a long-running project

What matters is that the individual steps are not isolated, and that this is **work where the result of an earlier step affects the next step**.

**② Reviewing large and complex material**: Use it when you must review a large volume of complex material together, such as papers, reports, meeting minutes, and technical documents. This is the case where you need to do more than a simple summary and carry on to the next task.
- Analyzing commonalities and differences across several sources
- Identifying claims that conflict with each other
- Separating the core evidence from the surrounding information
- Synthesizing a lot of material into one logical deliverable

**③ Turning a vague idea into a concrete deliverable**: Work where the requirements are not settled and only a rough idea is given, and the model decides the necessary details on its own to produce a deliverable.
- Developing an idea like "a service with this kind of feel" into a business plan
- Designing the structure and content of presentation material from only a rough topic
- Making an incomplete product idea concrete as a feature list and a development plan
- Producing a finished report or piece of content when there is no draft

Choose it when **the ability to judge and fill in the missing parts** matters more than the ability to follow given instructions as they are.

**④ Problems that need deep reasoning together with planning, coordination, and long-running execution**: Fable does not always reason more deeply than Opus. Fable is better suited to problems that need planning, coordination, and long-running execution along with deep reasoning.

### When to choose Fable

- When the result has to go through several steps to be reached
- When it is hard for the user to specify every procedure directly
- When the model has to plan the order of work on its own
- When a finished deliverable has to be produced from a vast amount of material
- When a project-level result is needed rather than a short answer

## 2. Opus

**Main role:** A high-performance reasoning model that analyzes and solves hard problems in depth. If Fable is suited to long-term planning and autonomous execution, Opus is suited to digging deep into a problem with a defined scope and analyzing it logically.

### Well-suited tasks

**① Complex research and analysis**: Work that does not end at finding information but must evaluate several pieces of evidence and reach a logical conclusion.
- Researching a complex industry or market in depth
- Comparative analysis of several research results
- Evaluating the pros and cons of a policy or business strategy
- Analyzing causes and effects based on data and documents
- Writing a conclusion that synthesizes different perspectives

**② Reviewing long technical documents**: Work of reading and understanding documents with a lot of specialized terminology and a complex structure. Software design documents, system architecture documents, research papers, technical specifications, product requirements documents, and complex API and development documents fall under this. It is suited to **grasping the logical structure and technical meaning** rather than shortening the document.

**③ Reviewing research methodology**: Work of examining not only the research results but also whether the method used to obtain them is valid.
- Checking whether the research design is appropriate, whether the sample is sufficient, and whether the sample is free of bias
- Checking whether there are problems in the measurement method and the statistical conclusions
- Reviewing whether the conclusions are exaggerated beyond the actual evidence and whether there is room for a different interpretation

**④ Coding that performs several development steps on its own**: It does not stop at producing one or two lines of code; it understands the goal and carries out several development tasks in sequence.
- Analyzing an existing codebase and finding the cause of errors
- Modifying code across several files, implementing features, and writing tests
- Improving code structure and deciding the next task on its own during development

### When to choose Opus

- When the problem is specialized and difficult but **its scope is relatively clear**
- When in-depth logical analysis and review are needed
- When you must understand a technical document or paper accurately
- When you must find the gaps in a study or analysis
- When you must solve complex coding or technical problems

## 3. Sonnet

**Main role:** A balanced general-purpose model that performs most everyday work reliably. Unless the task is very complex or needs specialized judgment, it can be used broadly for writing, coding, research, and analysis.

### Well-suited tasks

**① Writing and content production**: Suited to emails, blog posts, report drafts, ad copy, proofreading and rewriting sentences, presentation scripts, planning social media content, and brainstorming ideas.

**② General coding work**: Suited to writing functions, fixing code errors, developing simple programs, explaining existing code, refactoring, writing test code, and producing data processing scripts.

**③ Analysis and research**: Suited to outlining a topic, comparing products and services, analyzing document contents, simple competitor research, extracting key claims, comparing pros and cons, and organizing analysis results into tables or reports.

**④ Problem solving made of several steps**: Splits work with a clear scope into several steps and performs them. Summarizing material and then writing a presentation script, analyzing requirements and then producing code examples, or analyzing data and then explaining the results fall under this. Distinguish it from the long-running, autonomous projects handed to Fable.

**⑤ Repetitive and operational work**: Suited to log parsing, format conversion, static file checks, running deployment scripts, and simple collection.

### When to choose Sonnet

- Use it when you are not sure which model to choose. If it is hard to judge, make sonnet the default.
- Use it when everyday work has to be handled quickly and reliably.
- Use it when performing several kinds of work together, such as writing, coding, and research.
- Use it when dealing with a problem that is neither too simple nor too complex.
- Use it when both speed and result quality must be considered.

## Criteria for telling Fable and Opus apart

- **Fable**: Plans the whole task and carries it out autonomously for a long time.
- **Opus**: Reasons deeply about and analyzes a complex problem with a defined scope.

For example, **Opus** is suited to critiquing a single paper in depth, and **Fable** is suited to reviewing dozens of papers, building a research strategy, and producing the final report. If the result of an earlier step affects the next step and the model has to chain several steps on its own, use Fable. If you need to analyze one clearly scoped problem in depth, use Opus.

## Rules for applying this in the harness

1. **Judge by the task**: Do not choose a model on the grounds that "it is an important agent". Choose the model by weighing the complexity, expected duration, required autonomy, and response speed of the task the agent will take on.
2. **Do not assign the same model across the board without a reason**: Assigning fable or opus to every agent only increases cost. Choose the suitable model for each agent and leave the reason as a comment.
3. **Separate the orchestration layer from the execution layer**: Even if you used fable for the layer that handles planning and orchestration (the main session or a supervisor agent), specify a model suited to each task separately for the worker agents beneath it. The orchestrating agent being fable does not mean the worker agents need to be fable too.
4. **Choose the model per workflow stage**: In a `Workflow` script, you can specify a different model for each stage with `opts.model`. Use sonnet for repetitive collection and conversion stages, opus for stages of in-depth verification, review, and design, and fable for stages that make the overall plan and run for a long time.
