---
id: adapter.website.url.v0
title: Website URL Adapter v0
type: manual
status: accepted
version: v73c
domain: source-adapter
cluster: lime
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-09
depends_on:
  - system.source.adapter.os
  - schema.source.graph.normalized
tags:
  - source-adapter
  - website
  - URL
  - crawler
  - adapter
  - v0
  - accepted
---

# Website URL Adapter v0

**Status:** Docs-only plan. No implementation without Source Adapter OS Contract acceptance.

---

## Scope

The Website URL Adapter ingests a single URL or small site and produces a normalized LumaWeave graph of pages, headings, links, and topics. It is the first "wow-factor" adapter — anyone can immediately see something they recognize (their own website) as a graph.

---

## v0 Scope (Minimal Safe Implementation)

```
Input:     single URL
Depth:     0 (input URL only) or 1 (direct links from input URL)
Extraction:
  pages       → website.page nodes
  links       → links_to edges (observed, evidence = HTML anchor)
  headings    → website.heading nodes + has_heading edges
  title       → node label
  status code → node metadata
Output:    LumaSourceGraph (normalized schema)
```

---

## Crawl Policy

```
same-domain only — never follow external links without explicit user permission
depth limit:  0 or 1 in v0 (depth 2+ requires v1)
page limit:   50 pages max in v0
timeout:      30 seconds total crawl time
robots.txt:   respect robots.txt always
rate limit:   1 request per second minimum
user agent:   identify as LumaWeave graph crawler
```

---

## Safety Requirements

```
Never crawl domains not explicitly provided by the user
Never store crawled HTML beyond the current session
Never follow redirect chains > 5 hops
Never make authenticated requests without explicit user credential grant
Never access localhost or private IP ranges
Never execute JavaScript on crawled pages (static HTML only in v0)
Always record which pages were skipped and why (in warnings[])
```

---

## Translation Set (Website v0)

```
HTML page    → website.page node
  label:       <title> or <h1> text
  id:          normalized URL
  metadata:    url, statusCode, wordCount, internalLinks[], externalLinks[]

HTML heading → website.heading node
  label:       heading text content
  id:          url + "#" + anchor

HTML link    → links_to edge
  confidence:  observed
  evidence:    { kind: "url", uri: targetUrl, selector: "a[href]", excerpt: linkText }

<h1-h6>      → has_heading edge
  confidence:  observed
  evidence:    { kind: "url", uri: pageUrl, selector: "h1", excerpt: headingText }
```

---

## Ingestion QA Report

The adapter produces a QA report alongside the graph:

```
Total pages crawled
Pages skipped (with reason: robots.txt, timeout, error, depth limit)
Links followed vs links skipped
Warnings (e.g. "50 page limit hit — graph may be incomplete")
Confidence breakdown: observed / inferred / ai-inferred counts
```

---

## Future v1+ Features

```
Depth 2 crawl + sitemap.xml support
Heading/topic extraction (inferred edges)
AI-assisted semantic topic clustering (ai-inferred)
External link graph (opt-in)
JavaScript rendering support (requires sandboxing contract)
Authenticated crawl (requires credential security contract)
```
