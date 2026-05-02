# LumaWeave Handleset Upgrade Packet

This packet introduces the **LumaWeave Handleset Registry**: a living encyclopedia of configurable settings, visual tokens, physics parameters, renderer bindings, theme customization values, and QA/test coverage.

## Core Idea

```txt
settings path → UI control → default value → visual token → runtime target → QA/test coverage
```

Every configurable thing should eventually have a documented handle.

## Recommended Placement

```bash
cd ~/Projects/lumaweave
mkdir -p docs/handleset
unzip ~/Downloads/lumaweave_handleset_upgrade_packet.zip -d docs/handleset
```

## Best First Bandit Task

Start with:

```txt
Handleset Registry Audit v0 — documentation only
```

Do not make the handleset control the app yet. First, use it to describe the current app accurately.
