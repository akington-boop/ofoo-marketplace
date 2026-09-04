# how to phipii-mini-audit

Documents how PII/PHI form fields get tagged for the TransPerfect translation
pipeline. Tagging is done by `MuiComponentDecoratorPlugin`, a Webpack 5
build-time AST plugin — it injects a CSS class (default `GlobalLinkNoTx`)
into form inputs and MUI components at compile time, so translation vendors
never see sensitive field content. No source files are edited; the class is
invisible until you inspect the compiled DOM output.

Real plugin source: `@webmdhs/component-decorator`
(`Webpack/MuiComponentDecoratorPlugin/`).

## How to tell if something is tagged

Tagging happens at compile time, so it never shows up in source. To verify:

- Inspect the **compiled DOM output** at runtime for the `GlobalLinkNoTx` class.
- Watch Webpack's `stats.warnings` — the plugin emits one warning per rule
  that matched nothing (typo, deleted markup, renamed component):
  ```
  WARNING in [MuiComponentDecoratorPlugin] Rule matched no component or element: *[className="CardHeaderContianer"] → target:className
  ```
  Warnings are non-fatal; fail CI on them explicitly if you want enforcement.

## Setup

```js
// webpack.config.js
const { MuiComponentDecoratorPlugin } = require("@webmdhs/component-decorator");

new MuiComponentDecoratorPlugin({
  configFile: path.join(__dirname, "component-decorator.config.js"), // default
  className: "GlobalLinkNoTx",  // default
  useCoreRules: true,           // enable built-in MUI v5/v6 + native rules
  includePackages: true,        // patch third-party packages directly (default)
  validateRules: true,          // warn on unmatched rules (default)
});
```

## Adding a tagging rule

Rules live in `component-decorator.config.js` at the project root:

```js
module.exports = {
  rules: [
    // Prop injection: component forwards className down to a DOM element
    { match: "@mui/material/TextField", target: "inputProps.className" },   // MUI v5
    { match: "@mui/material/TextField", target: "slotProps.htmlInput.className" }, // MUI v6

    // Component ignores className entirely — wrap it instead
    { match: "my-lib/AvatarPicker", wrapWith: "span" },

    // Third-party npm package — patches its compiled output directly, no source edits
    { match: "@webmdhs/universal-profile-avatar-component", target: "className" },
  ],
  ignore: ["@mui/material/TextField"],   // opt components out entirely
  defaultWrapWith: "span",
};
```

- **`target`** — dot-path where the class is injected (`className`,
  `inputProps.className`, `slotProps.htmlInput.className`, ...). Merged with
  any existing class value at runtime, never overwrites.
- **`wrapWith`** — wraps the element in `<span style="display:contents">`
  instead, for components that don't forward any className prop.
- **`whenProp: { name, value, match: "exact" | "token", matchConditionalBranches }`**
  — only fires when a prop matches (e.g. tag a `Card` only when
  `className` contains the token `"score"`, or `disabled` is `true`).
- **Wildcards** — `"*"` matches every element/component in a file;
  `"**Foo"` / `"Foo**"` / `"**Foo**"` match by import-path suffix / prefix /
  substring, useful when the same component is imported from many relative
  paths.
- **Package mode** — automatic whenever `match` is a bare package specifier
  (not a relative or absolute path): the plugin resolves the package's
  compiled entry file and patches its outermost `className`-bearing element
  directly inside `node_modules`, without touching files that import it.

## Built-in core rules

Active when `useCoreRules: true`. Covers native `input` / `textarea` /
`select`, plus MUI v5 (`inputProps.className`) and MUI v6
(`slotProps.*.className`) for `TextField`, `Input`, `OutlinedInput`,
`FilledInput`, `InputBase`, `NativeSelect`. Both MUI major-version rules run
in parallel — whichever version is installed uses its rule, the other is a
no-op.

## Full reference

See the plugin's own README for the complete rule syntax, conditional
ignore entries, `includePackages` config-level package pulling, and
troubleshooting for components that don't forward `className`:
`@webmdhs/component-decorator/src/Webpack/MuiComponentDecoratorPlugin/README.md`
