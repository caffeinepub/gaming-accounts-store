# Specification

## Summary
**Goal:** Replace the existing dark neon gaming theme with a cohesive sunset aesthetic across the entire Game Vault frontend.

**Planned changes:**
- Update `index.css` CSS custom properties to use the NYC sunset palette: deep dusk purple/navy-black backgrounds (`#1a0a2e`, `#0d0519`, `#1c0f3f`), warm dark mid-tones, and sunset accents (golden yellow `#f5a623`, burnt orange `#e85d04`, dusky pink `#d63384`, soft purple `#9b59b6`); update glow utility classes to emit warm orange/pink/golden shadows instead of cyan/neon glows; retain Orbitron and Rajdhani font imports and the Game Vault gradient text
- Update `tailwind.config.js` to replace neon color tokens (neon-cyan, electric-orange, hot-pink) with sunset palette tokens (`sunset-gold`, `sunset-orange`, `sunset-pink`, `sunset-purple`, `dusk-bg`, `dusk-mid`); update `pulse-glow` and keyframe animation colors to warm sunset tones
- Apply sunset theme across all page and layout components (`StorefrontPage.tsx`, `ProductDetailPage.tsx`, `CheckoutPage.tsx`, `OrderConfirmationPage.tsx`, `AdminPanelPage.tsx`, `Navigation.tsx`, `Footer.tsx`, `ProductCard.tsx`, `CartDrawer.tsx`, `CategoryCard.tsx`, all checkout sub-components, all admin sub-components): replace neon color classes with sunset equivalents for backgrounds, buttons, cards, borders, hover states, badges, and focus rings
- Update `LoadingScreen3D.tsx` HTML overlay elements to use sunset palette colors; update the Three.js scene sky gradient (orange-gold at horizon to deep purple at top), building materials, and vehicle/light colors to warm sunset tones; leave the Game Vault gradient text and 3D scene geometry/animations unchanged

**User-visible outcome:** All pages and UI elements display a unified sunset aesthetic with deep dusk purple/navy-black backgrounds and warm golden-orange/dusky pink/soft purple accents, replacing all neon-cyan and electric accents throughout the app.
