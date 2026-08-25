---
name: conceptual-design
description: Use when drawing or editing conceptual/system architecture diagrams with draw.io / diagrams.net (*.drawio) — architecture, component, deployment, or infrastructure sketches.
---

# draw.io Architecture Diagrams (*.drawio)

Produce architecture / conceptual-design diagrams as `*.drawio` files — plain draw.io XML that opens in diagrams.net, the desktop app, or VS Code draw.io extensions.

**Core principle: the mxfile XML is the deliverable.** Write uncompressed `<mxfile>…</mxfile>` to `<name>.drawio` and stop.

## Workflow

1. **Design the diagram first, on paper (mentally).** Decide the layers/tiers, which components exist, and which arrows connect them. A good conceptual diagram has 5–15 nodes; if the user's system is bigger, group components into labeled containers. Model responsibilities as nodes and flows as edges — give it real structure (zones/trust boundaries, layers, a title), not a flat flowchart.

   **Conceptual designs are high-level — stay at the level of responsibilities/stages, never individual functions, classes, or implementation detail.** Unless the user explicitly asks for a detailed/component-level view, structure every conceptual design as three left→right zones, each a labeled dashed container:
   - **1 · USER INPUT** — the things the user provides (arguments, files, requests, events).
   - **2 · PIPELINE / WORKFLOW** — 2–5 high-level stages describing *what happens* to the input (each a responsibility, e.g. "Analyze preview vs safezone", not `parse_verdict()`). Show key external resources (datastores, APIs, models) as supporting dependencies feeding the relevant stage with dashed edges below the pipeline.
   - **3 · OUTPUT** — what the workflow produces (result, response, side effects) plus the error/failure path if relevant.

   Collapse implementation-level steps into stages: e.g. `fetch_image()` + `build_prompt()` + `invoke_model()` become one "Analyze …" stage. If you catch yourself naming functions or listing more than ~5 pipeline boxes, you are too low-level — zoom out.
2. **Plan the layout with real coordinates** (see Layout rules below) — this is the step that decides whether the result looks professional or like spaghetti.
3. **Write the draw.io XML** to `<name>.drawio` (format below). Save next to the user's files unless they say otherwise. Sanity-check: every node has a label, ids are unique, no two rectangles in the same tier overlap.
4. **Optional architecture write-up**: After delivering the `.drawio`, ask whether to write `docs/<name>.md` explaining the architecture. Only write it if the user agrees. Useful sections: overview, zones/components, main flows, and sync vs async notes when relevant.

## draw.io XML format

Minimal valid skeleton — every diagram must have the two bootstrap cells `0` and `1`:

```xml
<mxfile host="app.diagrams.net">
  <diagram id="d1" name="Page-1">
    <mxGraphModel dx="800" dy="600" grid="0" page="0">
      <root>
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>

        <mxCell id="web" value="Web App" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;fontSize=13;" vertex="1" parent="1">
          <mxGeometry x="40" y="120" width="160" height="60" as="geometry"/>
        </mxCell>

        <mxCell id="e1" value="" style="edgeStyle=orthogonalEdgeStyle;strokeColor=#6c8ebf;" edge="1" parent="1" source="web" target="api">
          <mxGeometry relative="1" as="geometry"/>
        </mxCell>
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
```

Rules: uncompressed XML only · no XML comments in the final file · unique ids · `vertex="1"` xor `edge="1"` · escape special characters in `value` (`&` → `&amp;`, `<` → `&lt;`) · (0,0) is top-left. Full format detail: `reference/drawio-format.md`. A worked example: `examples/architecture.drawio`.

Common styles:

| Purpose | style |
|---|---|
| Component / service | `rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;` |
| Database | `shape=cylinder3;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;` |
| Actor / external system | `rounded=0;whiteSpace=wrap;html=1;fillColor=#ffe6cc;strokeColor=#d79b00;` |
| Decision | `rhombus;whiteSpace=wrap;html=1;fillColor=#fff2cc;strokeColor=#d6b656;` |
| Queue / topic | `rounded=1;whiteSpace=wrap;html=1;fillColor=#e1d5e7;strokeColor=#9673a6;` |
| Start/end, cloud service | `ellipse;whiteSpace=wrap;html=1;fillColor=#f8cecc;strokeColor=#b85450;` |
| Group container / trust boundary | `rounded=1;fillColor=none;strokeColor=#999999;dashed=1;verticalAlign=top;fontStyle=1;` |
| Title | `text;fillColor=none;strokeColor=none;fontSize=18;fontStyle=1;` |

Edge options: `edgeStyle=orthogonalEdgeStyle` for right-angle routing, `dashed=1` for async/optional flows, `endArrow=none` for plain lines, `exitX/exitY/entryX/entryY` (0–1 fractions) to pin which side an arrow leaves/enters.

Containers: children of a container cell use `parent="<container-id>"` and coordinates **relative to the container**.

Prefer **plain-text labels** (use `&#10;` for line breaks): rich HTML labels are harder to keep consistent across editors.

## Layout rules (what makes it look good)

- Flow in one direction: left→right (request flow) or top→bottom (layered architecture). Don't mix.
- Standard node size 160×60; databases 120×80. Keep sizes consistent within a tier.
- Gaps: ≥ 80px horizontally, ≥ 60px vertically between nodes. Containers get 30px inner padding + 30px top for the title.
- Align nodes in the same tier on the same x (or y) coordinate — misalignment of a few px looks sloppy.
- Avoid crossing edges: order nodes within a tier so arrows go to neighbors. Use `exitX/entryX` pins when two edges would overlap.
- One color per role (use the palette above), not one color per node. A diagram with 8 colors reads worse than one with 3.
- Set `fontColor=#000000` on every shape block (nodes) so labels stay black and legible in all viewers — draw.io otherwise applies a lighter default that is hard to read. Leave the title, subtitle, and container/zone headings at their default color.
- Add a bold title text node at the top.
- Coordinates that overlap: before writing XML, list each node with its (x, y, w, h) and check no two rectangles in the same tier intersect.

## Common mistakes / red flags

- Forgetting `parent="1"` on top-level cells or the `vertex="1"`/`edge="1"` flags — cells silently disappear.
- Compressing or Base64-encoding the mxfile — keep plain uncompressed XML.
- A single flow of boxes labeled "conceptual architecture" — add zones, layers, grouping.
- **Too low-level for a conceptual design** — naming individual functions/classes, or more than ~5 pipeline boxes. Collapse into high-level stages and use the three zones (USER INPUT · PIPELINE/WORKFLOW · OUTPUT) unless the user explicitly asked for a detailed component view.
- If asked to *edit* an existing `.drawio`: modify the mxfile XML in place (or rewrite the file), keeping cells `0`/`1` and unique ids.
