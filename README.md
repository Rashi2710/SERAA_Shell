# SERAA_Shell

Iterations for the SERAA platform, integrating all the existing platforms.

**[Open the prototypes →](index.html)** — wireframe shell, single-file product, and design system.

---

## SERAA Wireframes — Antigravity Build Kit

This folder is a ready-to-use workspace for building the SERAA wireframes in Google Antigravity, based on the "SERAA — Unified Platform IA & UX Flow" doc.

Source doc: https://claude.ai/code/artifact/aedf24db-9a11-415b-8c4a-d0bd6872e79a

## What's in here

```
seraa-wireframes/
├── README.md          ← you are here
├── IA-SPEC.md          ← full IA reference, exported from the doc — the agent should read this before every prompt
└── prompts/
    ├── 00-project-setup.md
    ├── 01-seraa-home.md
    ├── 02-signin-and-handoff.md
    ├── 03-pulze-nav.md
    ├── 04-axon-nav.md
    ├── 05-synapse-nav.md
    ├── 06-cortex-nav.md
    ├── 07-billing-and-assure.md
    └── 08-wire-the-flows.md
```

## How to use with Antigravity

1. Install Antigravity, sign in with a Google account.
2. Launch Antigravity → **Open Workspace** → select this `seraa-wireframes/` folder (do this once; don't create a new empty folder — this one already has the spec and prompts in it).
3. Open **Agent Manager** → **New Task**.
4. Work through the files in `/prompts/` **in numeric order, one task per file**:
   - Open the prompt file, copy its full contents, paste into a new Agent Manager task.
   - Review the agent's plan before approving — check it's reading `IA-SPEC.md` and building on the previous screens, not starting over.
   - Let it build and verify (Antigravity runs it in a browser and checks it renders) before moving to the next prompt.
5. Keep `IA-SPEC.md` in the folder root the whole time — every prompt tells the agent to re-read it, so decisions stay consistent screen to screen (same nav conventions, same product names, same placeholder colors).

## What gets built

Static HTML/CSS/vanilla-JS screens, styled with the **Covasant Design System** ([Figma file](https://www.figma.com/design/QUc4unOvEPYYFBIWUG3rep/Covasant-Design-System)). All color, radius, spacing and type values in `site/shared/styles.css` are tokens mirrored from that file's `1. Color modes` (Light), `2. Radius`, `3. Spacing` and `6. Typography` collections — retheming means editing the `:root` block, nothing else. Covering:
- SERAA sign-in and the entitlement/handoff sequence
- SERAA home (ask bar, quick-start triad, use-case strip, Avatars strip, all-products row, recents)
- Each product's own navigation shell (Pulze, Axon, Synapse, Cortex's Foundry-style top nav)
- Billing & Usage rollup and the Assure dashboard surface
- A2UI & chat-assistance patterns — agent status states, loaders, and assistant-generated UI (see `site/patterns.html`), from the [A2UI and Chat Assistance](https://www.figma.com/design/ZTSXaG0vjNsCjc4EzXZV5n/A2UI-and-Chat-Assitance) Figma file
- The six navigation flows, wired together as real clickable links between the screens built above

## Build order

`00` → `01` → `02` → `03` → `04` → `05` → `06` → `07` → `08`. Don't skip ahead — `08` assumes every screen from `01`–`07` already exists and just links them.
