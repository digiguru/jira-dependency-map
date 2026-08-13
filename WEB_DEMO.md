# Web demo

The web demo is a thin frontend for this repository's existing dependency-map engine.

It does **not** call `digiguru/jiradependecy`, and it does not maintain a second copy of the Graphviz conversion logic. During the static build, the repository's own `toDot.mjs`, `remapper.mjs`, and `parse.mjs` modules are copied into `dist/core/`; the browser frontend imports the same `toDot.mjs` and `remapper.mjs` implementation used by the CLI.

## Spreadsheet input

The public demo accepts rows copied from Excel, Google Sheets, or a Jira CSV export. The bundled synthetic example is `public/mock-jira-data.tsv`.

Friendly columns are:

- `Key`
- `Summary`
- `Status`
- `Story Points`
- `Group`
- `Blocks`
- `Blocked By`

The parser also recognises common Jira-export aliases including `Issue key`, `Story point estimate`, `Parent`, `Outward issue link (Blocks)`, and `Inward issue link (Blocks)`. Repeated Jira link columns are supported.

## Security boundary

The static demo deliberately has no Jira username/API-token form. Live authenticated Jira queries remain in the Node CLI, where credentials do not need to be shipped to browser JavaScript.

## Validation

```bash
npm ci
npm run lint
npm test
npm run build
npm run smoke
```

The smoke test serves the actual `dist/` directory on localhost and checks the homepage, mock data, browser entrypoint, shared core modules, spreadsheet parser, and Viz.js runtime.
