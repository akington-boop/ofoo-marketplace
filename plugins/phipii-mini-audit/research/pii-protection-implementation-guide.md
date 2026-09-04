# pii-protection-implementation-guide

This technical implementation guide covers the end-to-end setup and runtime behavior of the build-time AST injection system. Here is a brief, high-level summary of what is included:

*   **Webpack & Config Setup:** Standard syntax for registering the plugin in your `webpack.config.js` and creating a project-root `component-decorator.config.js` with your custom configuration.
*   **Targeting Rules & Extensions:** Practical code examples showcasing the full syntax of our matching system, including absolute OS-normalized path mapping, prefix/suffix wildcards (`**`), conditional prop guards (`whenProp`), and token-list evaluations.
*   **Compile-Time Mechanics:** A technical deep-dive into how the plugin uses Babel's parser and traverse systems to safely merge class names, inject props into nested elements (like Material-UI's input properties), apply non-destructive wrapper modes (`display:contents`), and perform package-level patches directly inside `node_modules`.
*   **Verification & Safety Rails:** Actionable instructions on how to parse Webpack compilation warning statistics (`stats.warnings`) to fail CI builds on dead or unmatched rules, accompanied by an automated Cypress end-to-end assertion script to verify class presence in the browser.
