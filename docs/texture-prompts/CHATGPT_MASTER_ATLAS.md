# ChatGPT Image - Master Atlas Prompt

Copy/paste this exactly in ChatGPT image generation.

```text
Create a single 4096x4096 base-color PBR texture atlas for a dark cinematic laboratory.

Hard constraints:
1) This must be a flat texture atlas, not a 3D render.
2) No perspective, no scene composition, no camera angle.
3) No text, letters, logos, labels, symbols, or watermarks.
4) No baked shadows or directional lighting.
5) One square image only.

Atlas structure:
- Exact 3x2 grid of equal rectangular zones.
- Top-left: painted concrete wall (fine grain, mild wear).
- Top-center: epoxy floor (soft worn streaks, subtle scuffs, directional drag).
- Top-right: brushed dark metal (cabinet/rack feel).
- Bottom-left: matte polymer/plastic (desk/chair material).
- Bottom-center: whiteboard material (light gray, faint erased marker traces).
- Bottom-right: monitor bezel + dark glass-like screen tint (neutral, non-emissive look in base color).

Visual style targets:
- photorealistic material response cues, understated, no stylized art.
- dark neutral charcoal palette with slight cool tint.
- strong microdetail but controlled and clean.
- midtone-rich values for grading flexibility.

Color boundaries:
- most pixels should live between #16181c and #3a3f46.
- occasional cool steel-blue hints are acceptable.
- avoid saturated colors.
- whiteboard zone can be significantly lighter, but avoid clipped pure white.

Output requirements:
- produce exactly one atlas image
- keep each zone clearly separable for UV assignment
- no extra elements outside the six zones
```

