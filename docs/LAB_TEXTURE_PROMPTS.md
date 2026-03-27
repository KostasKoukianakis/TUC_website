# Lab Master Texture Prompts

Use these prompts to generate a single shared texture set for the lab interior in the same visual direction as the provided reference (dark cinematic environment with subtle particulate atmosphere).

## 1) Master atlas (required)

**Target file:** `public/textures/lab/lab_master_01.webp`  
**Suggested size:** `4096x4096`  
**Usage:** one texture reused on floor/walls/basic furniture

**Prompt (copy/paste):**

```text
Create a single physically plausible PBR base-color atlas texture for a dark cinematic research laboratory environment.

Style direction:
- high-end moody, low-key lighting look
- neutral charcoal palette with subtle cool tint
- realistic but understated, no stylized comic look
- designed to work under particle-point overlays and volumetric fog

Atlas layout requirements (single square image):
- include 6 clearly separated material zones in a 3x2 grid
- zone A: painted concrete wall (fine grain, micro stains, subtle edge wear)
- zone B: polished worn epoxy floor (soft streaks, faint scuffs, directional drag marks)
- zone C: brushed dark metal (for racks/cabinets)
- zone D: matte polymer/plastic (for desk/chair parts)
- zone E: whiteboard panel (slightly dirty white, faint marker ghosts)
- zone F: monitor bezel + dark glass screen tint (very low reflection baked look)

Texture constraints:
- seamless/tile-friendly appearance inside each zone
- no text, logos, symbols, or readable labels
- no perspective, no shadows, no baked lighting hotspots
- preserve midtone detail, avoid crushed blacks
- realistic micro-variation, not noisy or chaotic

Color targets:
- dominant values in deep gray range (#16181c to #3a3f46)
- cool neutrals with occasional steel-blue hints
- whiteboard zone can reach light gray but never pure white clipping

Output:
- flat top-down atlas image only
- high detail suitable for close camera inspection
```

## 2) Roughness atlas (optional but recommended)

**Target file:** `public/textures/lab/lab_master_01_roughness.webp`  
**Suggested size:** `4096x4096`

**Prompt:**

```text
Generate a roughness atlas matching an existing 3x2 laboratory material atlas layout.

Requirements:
- grayscale only (black=glossy, white=rough)
- preserve the exact same zone placement as the base-color atlas
- wall: mostly rough with mild variation
- floor epoxy: semi-gloss with directional variation and worn paths
- dark metal: medium roughness with brushed anisotropic feel implied
- polymer/plastic: medium-high roughness, smooth but not glossy
- whiteboard: low-to-medium roughness with subtle smudges
- monitor bezel/glass: bezel medium roughness, glass area lower roughness

Constraints:
- no text, no symbols, no baked shadows
- clean value separation, avoid extreme clipping
- physically plausible map intended for real-time rendering
```

## 3) Normal atlas (optional polish)

**Target file:** `public/textures/lab/lab_master_01_normal.webp`  
**Suggested size:** `4096x4096`

**Prompt:**

```text
Generate a tangent-space normal atlas matching an existing 3x2 dark laboratory material atlas.

Requirements:
- preserve exact zone coordinates from the base atlas
- include only micro and meso surface detail (grain, brushed metal, subtle floor scratches)
- avoid deep height displacement or large sculpted forms
- realistic intensity suitable for close-up shots without looking exaggerated

Constraints:
- no logos/text/symbol embossing
- no baked directional light
- clean, game-ready normal map for physically based rendering
```

## Quick generation notes

- If your image tool supports "seed", keep a fixed seed for all maps so details align better.
- Export to `webp` quality 92-96.
- Keep the same resolution and layout across all maps.
- Start with base-color only; add roughness/normal only after composition is approved.
