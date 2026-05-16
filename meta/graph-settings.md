# Graph Settings Protocol

When a new type or subtype is added to `meta/types.md`, or a new entity folder is created under `data/` or `historian/`, update both graph config files to add matching color groups:

1. **`.vscode/settings.json`** — add a group entry to each view in `foam.graph.views` that needs it:
   - `Default` view: add entries for both the `data/` and `historian/` paths, with `id`, `label`, `match.property: "path"`, `match.value`, `color`, and `enabled: true`. Order general before specific (last match wins).
   - `Canon vs Free` view: no change needed unless an entirely new top-level folder is added.

2. **`.obsidian/graph.json`** — add a `colorGroups` entry for both the `data/` and `historian/` paths using the same color. RGB format: pack R, G, B as a 9-digit zero-padded decimal integer (`RRRGGGBBB`), e.g. R=77, G=208, B=225 → `77208225`.

Before choosing a color, read `meta/color-theory.md` for the canonical color map. Select the hex for the matching group or subtype. Use the same hex in both config files. If no existing group fits, pick from the Available list in that file.
