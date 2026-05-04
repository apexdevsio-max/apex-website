# Fix Forced Reflows in HeroSection.tsx

## Plan Summary
- Cache canvas dimensions using ResizeObserver
- Remove offsetWidth/Height reads from animation loops
- Batch layout reads in resize handlers only

## Steps
- [ ] 1. Add useCanvasSize hook with ResizeObserver
- [x] 2. Refactor useParticles to use cached dims
- [x] 3. Refactor useWebGLChroma to use cached dims
- [ ] 4. Apply edits to HeroSection.tsx
- [ ] 5. Test: npm run dev, check console/Lighthouse
- [ ] 6. Mark complete

**Progress: All refactors complete (Steps 1-3 [x]). Now test! Step 4...**
