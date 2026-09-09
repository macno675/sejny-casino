# Sejny Casino — Design System

Charakter stylu, zasady wizualne i reguły implementacji UI.
Dokument jest źródłem prawdy dla wyglądu produktu.

---

## 1. Charakter marki

**Sejny Casino** to premium, industrialny salon gier w klimacie dark-gaming:

- matowy charcoal i metaliczne złoto,
- fioletowe / magenta bloom za rzadkimi dropami,
- glassmorphism tylko jako warstwa UI (nie jako dekoracyjny chaos),
- takt „case opening” — napięcie, deceleracja, czytelny hit.

Inspiracje: skrzynie CS-like, glass UI, kolekcjonerskie karty 3D, lobby esports.
Nie robimy kreskówkowego casina ani jasnego soft-UI.

**Słowa kluczowe:** dense · tactile · metallic · cinematic · high-stakes · slow-burn

---

## 2. Paleta (CSS variables)

| Token | Wartość | Rola |
| --- | --- | --- |
| `--bg` | `#0c0c0e` | tło aplikacji |
| `--bg-elevated` | `#16161a` | panele / skrzynie |
| `--bg-metal` | `#1c1c22` | industrialne powierzchnie |
| `--cream` | `#f3f0e8` | tekst główny |
| `--muted` | `#8b8b97` | meta / opisy |
| `--gold` | `#f0c14a` | wartość, jackpot, markery premium |
| `--gold-deep` | `#b8860b` | metaliczne krawędzie |
| `--violet` | `#8b5cf6` | rare glow, epic |
| `--magenta` | `#e879a9` | highlight / legendary bloom |
| `--cyan` | `#2dd4a8` | claim CTA, sukces |
| `--marker` | `#d4ff3f` | wskaźnik spinnera (center line) |
| `--danger` | `#ff5d7a` | błędy |
| `--line` | `rgba(255,255,255,0.08)` | obramowania glass |

### Zasady koloru

1. Tło zawsze niemal czarne / charcoal — bez fioletowego pełnego fillu całej strony.
2. Złoto = pieniądze, streak, legendary, skrzynia premium.
3. Fiolet / magenta = tylko glow rzadkości i ambient (max 2 źródła światła na viewport).
4. Marker spinnera = `--marker` (lime/żółty), nigdy złoto (żeby nie mylić z lootem).
5. Unikać domyślnego „AI purple gradient on white”.

---

## 3. Typografia

| Rola | Font | Użycie |
| --- | --- | --- |
| Display | **Syne** (`--font-display`) | SEJNY, tytuły sekcji, nazwy nagród |
| Body | **Outfit** (`--font-body`) | UI, opisy, formularze |
| Mono | `ui-monospace` | countdown, numery spin |

### Hierarchia

- Hero / page title: display, 36–56px, tracking tight, weight 700–800
- Section label: 11px, uppercase, `tracking-[0.24em]`, `--muted`
- Body: 14–16px, `--muted` dla secondary
- Liczby coinów: semibold + `--gold`

Nie używać Inter / Roboto / Arial jako brand fonts.

---

## 4. Kształty i powierzchnie

### Glass panel (`.glass`)

- `border-radius`: **24–28px** (`rounded-3xl`)
- border: `1px solid var(--line)`
- fill: półprzezroczysty + `backdrop-blur` ~16–20px
- cień: głęboki, miękki (`0 20px 50px rgba(0,0,0,0.45)`)
- highlight: `inset 0 1px 0 rgba(255,255,255,0.06)`

### Industrial case / chest

- radius mniejszy niż glass: **16–20px**
- materiał: gradient metal (`#2a2a32` → `#121216`)
- krawędzie: złote lub stalowe (1–2px)
- hardware: nitki, „klódka”, logo — CSS / SVG, nie emoji jako główny asset

### Karty loot / collectible

- proporcje ~ **3:4**
- rarity glow **od dołu** karty (nie pełny outline neon)
- hover 3D: `rotateY` / `rotateX` max ±12°, ease cinematic
- inventory pokazuje **tylko posiadane** — bez locked slots i bez „X/Y unlock”

### Przyciski

- domyślnie **pill** (`rounded-full`)
- Primary claim: gradient cyan → aqua, tekst ciemny
- Neon / secondary: glass + violet ring
- Ghost: cienki border, bez fillu

---

## 5. Motion

| Interakcja | Czas | Easing |
| --- | --- | --- |
| Hover UI | 200–300ms | ease-out |
| Page enter | 500–700ms | `[0.22, 1, 0.36, 1]` |
| Case spinner | **5–6.5s** | strong ease-out (szybki start, długa deceleracja) |
| Card deal / dice | wolniej niż arcade | staggered 350–500ms |
| Reduce motion ON | skróć do ≤400ms / bez blur trail |

### Case opening (obowiązkowy wzorzec)

1. Poziomy pasek kart nagród.
2. Stała pionowa linia markera na środku (`--marker`).
3. Strip jedzie w lewo; wygrana karta zatrzymuje się pod markerem.
4. Po stopie: krótki bloom + panel „You received”.
5. Jeden open / dzień; countdown mono do następnej skrzyni.

---

## 6. Layout

- Max content: **72rem** (`max-w-6xl`)
- Desktop: top nav glass
- Mobile: floating bottom pill nav
- Sekcje: jedna myśl / jeden headline / jeden supporting line
- Lobby hero: brand + CTA + atmosfera — bez dashboardowego ścisku widgetów

---

## 7. Komponenty kluczowe

### Daily Chest

- Dwie skrzynie wizualne: **Standard** (matte) i **Gold** (streak ≥ 5 highlight)
- Spinner nad skrzyniami
- Tile nagród: coins / XP / card / jackpot — ikona + rarity foot glow

### Inventory cards

- Foto + motif + type chip + rarity chip
- Bonuses czytelne, bez clutteru

### Games

- Wolniejsze tempo, cinematic settle
- Win = krótki gold flash, nie confetti spam

---

## 8. Do’s / Don’ts

**Do**

- Utrzymuj charcoal + gold jako bazę
- Jeden wyraźny CTA na viewport
- Rarity komunikuj kolorem stopy karty / glowem
- Animuj z intencją (spinner, deal, chest)

**Don’t**

- Nie pokazuj katalogu zablokowanych kart
- Nie spłaszczaj UI do czystej bieli / cream editorial
- Nie używaj wielu neonowych outline naraz
- Nie przyspieszaj spinnera poniżej ~4s (wygląda tanio)
- Nie mieszaj broadsheet / terracotta soft-UI z tym systemem

---

## 9. Pliki implementacji

| Plik | Rola |
| --- | --- |
| `src/app/globals.css` | tokeny, ambient, glass, chest, spinner |
| `src/components/ui.tsx` | Button / Panel / Toggle |
| `src/components/daily-chest.tsx` | case opening |
| `src/components/collectible-card.tsx` | karty 3D |
| `src/components/app-shell.tsx` | chrome nawigacji |
| `.cursor/rules/sejny-design.mdc` | reguła agenta |

Zmiany wizualne muszą być zgodne z tym dokumentem.
