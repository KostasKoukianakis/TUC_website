# Ανάλυση Σελίδας Lightweight (lightweight.info/en)

## 1. Τεχνολογίες & Stack

- **Framework:** Next.js
- **CMS:** Sanity (cdn.sanity.io για images/assets)
- **Fonts:** Clean sans-serif (προφανώς custom ή premium web font)
- **Animations:** Πιθανώς GSAP ή similar για scroll effects

---

## 2. Δομή Σελίδας (Structure)

### Pre-loader (Optional)
- Οθόνη σχεδόν μαύρη (#000)
- Κεντρική λεπτή οριζόντια γραμμή που λειτουργεί ως progress bar
- Minimalist εμφάνιση πριν φορτώσει το κύριο content
- Cookie consent banner (κάτω δεξιά)

### Hero Section (Κύρια περιοχή)
**Layout:**
- **Full viewport** – 100vh, πλήρες πλάτος (edge-to-edge)
- **Background:** Video ή υψηλής ανάλυσης εικόνα
  - Σκηνή: Cyclist σε mountain pass, dramatic φωτισμός, βραχώδες τοπίο
  - Ατμόσφαιρα: Σκούρα, cinematic, premium
- **Overlay:** Γραμμικό gradient (από πάνω προς κάτω) για αντίθεση κειμένου
  - Συνήθως: διαφανές πάνω → σκούρο μαύρο/charcoal κάτω
- **Περιεχόμενο (κεντραρισμένο):**
  - Label: "WELCOME" (μικρό, uppercase, letter-spacing)
  - Headline: "THE EVOLUTION OF PERFORMANCE" (μεγάλο, bold)
  - CTA: "Learn more" (κουμπί ή link)

**Typography hierarchy:**
- Label: 12–14px, uppercase, tracking-wide
- Headline: 48–72px (responsive), font-weight bold/semibold
- Πολύ καθαρό, minimal, πολύ λίγο κείμενο

### Sticky Scroll Sections
- Sections τύπου PHILOSOPHY, CRAFT, INNOVATION, EVOLUTION
- Κάθε section: μικρό label + μεγάλο headline + σύντομη περιγραφή
- **Pin/parallax:** Μερικά elements μένουν pinned κατά το scroll
- Αριθμοί / διαχωριστές: "01 / 04", "02 / 04" κ.λπ.

### Social / Gallery Section
- "#ridelightweight" – οριζόντια gallery με Instagram-style images
- Παράλληλη διάταξη με scroll
- Κάθε card: εικόνα + blockquote/caption

### Footer
- Newsletter signup
- Πολλά links (Wheels, About, Dealer, Service, Documents, Contact)
- Εικόνα cyclists σε gravel road (full-width)
- Πολύ καθαρό, structured footer

---

## 3. Hero Background – Τεχνικές Λεπτομέρειες

### Επιλογές υλοποίησης
1. **Video background**
   - `<video>` με `object-fit: cover`, `position: absolute`, `inset: 0`
   - `muted`, `playsinline`, `autoplay`, `loop`
   - `poster` attribute για fallback (mobile / slow connections)
2. **Image background**
   - `next/image` με `fill` και `object-fit: cover`
   - Ανάλυση αρκετή για retina (π.χ. 1920×1080+)
3. **Gradient overlay**
   - `linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.85) 100%)`
   - Ρυθμίζεται ανάλογα με την αντίθεση του background

### Break-out από container
- Για full-bleed hero μέσα σε container layout:
  ```css
  width: 100vw;
  margin-left: calc(-50vw + 50%);
  ```
- Ή το Hero να είναι το πρώτο child του main, πριν το container div

---

## 4. Key Design Principles

| Στοιχείο | Lightweight |
|----------|-------------|
| **Κολορίτ** | Μαύρο, λευκό, hints of accent (π.χ. subtle gold) |
| **Typography** | Minimal, μεγάλα headlines, πολύ λίγο body text |
| **Whitespace** | Πολύ negative space |
| **Imagery** | High-end, cinematic, premium αίσθηση |
| **Motion** | Απαλά scroll-linked animations |

---

## 5. Πηγές

- [Lightweight Homepage](https://lightweight.info/en)
- [Design Drastic – Full-Screen Video Hero](https://designdrastic.com/snippet/video-background-hero/)
- [Series Eight](https://www.serieseight.com/) – Agency που αναφέρεται στο site
