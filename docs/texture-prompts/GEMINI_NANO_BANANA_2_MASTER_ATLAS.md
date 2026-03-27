# Gemini (Nano Banana 2) - Master Atlas Prompt

Copy/paste this exactly in Gemini.

```text
Generate ONE single PBR base-color texture atlas for a dark cinematic research laboratory interior.

STRICT OUTPUT RULES:
- output exactly one square image
- top-down flat texture sheet (NOT a rendered scene)
- no perspective
- no text, no logos, no symbols, no letters
- no baked lighting, no shadows, no highlights from a fake camera
- no frames, no borders, no UI

ATLAS LAYOUT (strict):
- 3 columns x 2 rows grid, 6 equal zones
- zone A (top-left): painted concrete wall, subtle grain and mild wear
- zone B (top-center): worn epoxy floor, directional drag/scuff marks
- zone C (top-right): dark brushed metal for cabinets/racks
- zone D (bottom-left): matte polymer/plastic for desks/chairs
- zone E (bottom-center): whiteboard surface with faint erased marker ghosts
- zone F (bottom-right): monitor bezel + dark neutral screen tint

STYLE:
- realistic, physically plausible, understated
- dark neutral palette, cool charcoal tones
- high micro-detail but clean, not chaotic
- intended for real-time 3D, readable at close distance

COLOR CONSTRAINTS:
- dominant tones between #16181c and #3a3f46
- subtle cool steel-blue hints only
- no strong saturated colors
- whiteboard area can be light gray, never clipped pure white

TECHNICAL QUALITY:
- tile-friendly feel inside each zone
- high-frequency detail controlled (avoid noisy AI artifacts)
- preserve midtone detail, avoid crushed blacks

FINAL:
- 4096x4096 preferred
- output only the atlas image
```

