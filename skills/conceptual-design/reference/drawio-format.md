# .drawio format reference

A `.drawio` file is uncompressed draw.io XML: an `<mxfile>` wrapping one or more
`<diagram>` pages, each with an `<mxGraphModel>` and a `<root>` of `<mxCell>`s.

```xml
<mxfile host="app.diagrams.net">
  <diagram id="d1" name="Page-1">
    <mxGraphModel dx="800" dy="600" grid="0" page="0">
      <root>
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
```

draw.io also accepts a bare `<mxGraphModel>…` fragment (it wraps on open). Prefer
the full `<mxfile>` form for files you ship.

## Key rules for AI-generated XML

1. Always include `<mxCell id="0"/>` and `<mxCell id="1" parent="0"/>`.
2. Uncompressed, plain XML — never compressed/Base64 content.
3. **No XML comments** (`<!-- -->`) anywhere in the final file — can break parsing.
4. All `id`s unique. Diagram elements use `parent="1"` (or a group/layer id).
5. `vertex="1"` (shapes) and `edge="1"` (connectors) are mutually exclusive.
6. Style = `key=value;` pairs, e.g. `rounded=1;whiteSpace=wrap;html=1;fillColor=#DAE8FC;`.
7. Non-rectangular shapes need a matching `perimeter=` (e.g. `ellipse` →
   `perimeter=ellipsePerimeter`); `shape=cylinder3` handles its own perimeter.
8. Coordinates: (0,0) is top-left; x→right, y→down.
9. HTML inside `value` must be XML-escaped (`&lt; &gt; &amp; &quot;`).
10. Children of a group/container use coordinates **relative to the parent**.

Official reference: https://www.drawio.com/docs/reference/diagram-generation/ and the
canonical shared rules at https://github.com/jgraph/drawio-mcp/blob/main/shared/xml-reference.md

## Conceptual architecture guidance

A conceptual architecture is more than a flow of boxes. Include:
- **Boundaries / zones** (trust boundary, VPC, external vs internal) as dashed containers.
- **Layers or C4 levels** — pick one level and stay consistent: *Context* (system + external
  actors/systems), *Container* (deployable/runnable units + data stores), or *Component*
  (internal parts of one container). Do not mix levels in one diagram.
- **Grouping** related components inside a labeled container.

For style-string validation and a full checklist, see the draw.io Style Reference:
https://github.com/jgraph/drawio-mcp/blob/main/shared/style-reference.md
