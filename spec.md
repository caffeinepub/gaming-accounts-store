# Specification

## Summary
**Goal:** Remove the storefront logo from the navbar and apply a red → purple → orange gradient to all "Game Vault" brand text instances.

**Planned changes:**
- Remove the logo image/icon from the Navigation component so only the "Game Vault" text remains
- Apply a CSS `background-clip: text` linear gradient (red → purple → orange) to the "Game Vault" text in the Navigation bar
- Apply the same gradient to the "Game Vault" text in the Footer
- Apply the same gradient to the "Game Vault" text in the LoadingScreen3D component

**User-visible outcome:** The navbar shows no logo icon — only the "Game Vault" brand name styled with a consistent red → purple → orange gradient, matching the Footer and loading screen text.
