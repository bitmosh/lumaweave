---
id: source.adapter.website.url.v0
title: Website URL Adapter v0
type: concept
status: current
cluster: lime
domain: source-adapter
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-09
references:
  - source.adapter.os.overview
  - source.adapter.catalog
  - source.adapter.ingestion.safety.qa
tags: [source-adapter, website, url, adapter, v0, observed, crawl-bounded]
---

# Website URL Adapter v0

## Summary

The Website URL Adapter lets a user provide a URL and generate a LumaWeave graph from website structure. The first implementation should be **observed-only** and tightly bounded.

## Core Pipeline

```txt
URL
→ normalize
→ fetch page
→ parse HTML
→ extract links/headings/assets
→ translate to graph
→ validate
→ render
```

## v0 Scope

Recommended first version:

```txt
single URL input
same-domain links only
max depth 0 or 1
max pages 25–50
observed facts only
no AI inference
no form submission
no script execution
no asset downloading beyond metadata
```

## Nodes

```txt
website.page
website.heading
website.asset
website.domain
```

Optional later:

```txt
website.topic
website.form
website.script
website.stylesheet
website.schemaEntity
```

## Edges

```txt
links_to
has_heading
embeds_asset
belongs_to_domain
canonicalizes_to
```

Optional later:

```txt
mentions_topic
similar_to
co_occurs_with
loads_script
loads_stylesheet
```

## Extraction Fields

For each page:

```txt
final URL
canonical URL
title
meta description
h1/h2/h3 headings
anchor links
anchor text
image src/alt
script src
stylesheet href
OpenGraph tags
schema.org JSON-LD, if present
status code
content type
```

## Crawl Policy

Default guardrails:

```txt
respect robots.txt
same-domain only
GET/HEAD only
no form submission
no login/logout/payment paths
max depth
max pages
crawl delay
skip binary files
skip huge responses
normalize URLs
record redirects
```

## URL Normalization

Normalize:

```txt
protocol
host casing
trailing slash
hash fragments
query params according to policy
redirect final URLs
canonical link tags
```

## Evidence

Every `links_to` edge should include evidence:

```ts
{
  kind: "url",
  uri: "https://example.com/docs",
  selector: "a[href='/api']",
  excerpt: "API Reference"
}
```

Every heading node should include:

```ts
{
  kind: "selector",
  uri: "https://example.com/docs",
  selector: "h2:nth-of-type(3)",
  excerpt: "Authentication"
}
```

## Graph Modes

Future UI could offer:

```txt
Link Map
Topic Map
SEO Map
Asset Map
Full Hybrid Map
```

v0 should only implement:

```txt
Link Map
```

## Ingestion QA Report

Every crawl should report:

```txt
input URL
normalized URL
adapter used
crawl depth
max pages
pages fetched
pages skipped
links extracted
assets found
errors
warnings
robots.txt status
limits hit
node count
edge count
observed edge count
inferred edge count
AI-inferred edge count
```

## Stop Conditions

Stop ingestion if:

```txt
max pages reached
robots.txt disallows crawl
response size too large
unsupported content type
redirect loop detected
network failures exceed threshold
crawl enters disallowed path
```

## Non-Goals For v0

Do not perform AI summarization.
Do not perform deep semantic clustering.
Do not execute JavaScript.
Do not submit forms.
Do not crawl unbounded.
Do not infer hidden site architecture.
Do not download large assets.

## Future Enhancements

```txt
sitemap.xml support
depth 2–3 crawl
keyword extraction
topic clustering
schema.org entity graph
SEO/canonical graph
asset dependency graph
AI-assisted semantic layer
website graph presets
```