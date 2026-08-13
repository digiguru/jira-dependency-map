# Jira Dependency Map

A CLI-first tool for analysing Jira issue dependencies.

It queries Jira Cloud with JQL, extracts blocking relationships and selected fields, optionally remaps values such as statuses or groupings, and can emit Graphviz DOT so the dependency graph can be rendered by Graphviz-compatible tools.

## How this differs from `jiradependecy`

These repositories are related, but they are not the same application:

- **`jira-dependency-map` (this repo)** is the newer **command-line/data-processing tool**. It is intended for repeatable queries, YAML configuration, automation and generating raw, mapped or DOT output.
- **[`digiguru/jiradependecy`](https://github.com/digiguru/jiradependecy)** is the older **browser visualiser prototype**. It contains a web UI and client-side Viz.js rendering, and its original live Jira integration depended on a now-retired Heroku proxy.

Use this repository when you want a scriptable Jira dependency workflow. Use `jiradependecy` if you are interested in the original browser visualisation prototype.

## What it does

The CLI can:

- run a Jira JQL search and confirm how many issues were returned (`connect`)
- print the raw Jira issues (`raw`)
- map Jira fields into a smaller dependency-oriented model (`remap`)
- generate Graphviz DOT representing blocking relationships (`dot`)
- read settings from YAML and override them with command-line options
- remap values such as workflow statuses or grouping labels before output

The default mapping is configurable rather than tied to one Jira schema. See [`example.yml`](./example.yml) for a representative configuration.

## Requirements

- Node.js 24.x
- a Jira Cloud account with access to the issues being queried
- a Jira API token for authenticated live queries

## Install

```bash
npm ci
```

You can run the CLI directly:

```bash
node index.mjs version
node index.mjs connect example.yml
node index.mjs raw example.yml
node index.mjs remap example.yml
node index.mjs dot example.yml
```

Or link the package locally to use its `jira-map` executable:

```bash
npm link
jira-map version
```

## Configuration

Each Jira command accepts an optional YAML settings file plus command-line overrides:

```text
-s, --server <url>       Jira server, for example your-site.atlassian.net
-u, --username <value>   Jira username, typically an email address
-p, --password <value>   Jira API token
-q, --query <jql>        JQL query
-n, --number <count>     Maximum number of issues to return (default: 50)
```

A YAML file can also define a `map` section describing which Jira fields become the dependency model's key, title, status, grouping and additional data. Mapping entries may include defaults and remap rules.

Do not commit Jira credentials or API tokens. Keep credential-bearing configuration local.

## Development

```bash
npm test
npm run lint
npm run build
```

The test suite covers parsing, remapping, Jira request behaviour, DOT generation and CLI startup.

## Output model

At a high level, Jira issues are reduced to nodes containing values such as:

- issue key
- title/additional information
- status
- grouping
- `blocks`
- `is blocked by`

`dot` then turns those relationships into Graphviz DOT for visualisation.
