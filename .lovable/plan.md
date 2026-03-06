# Enhance Diet Page -- Appealing Visuals & Interactivity

## Changes (single file: `src/pages/Diet.tsx`)

### 1. Animated Macro Donut/Ring Chart

Replace the plain 4-column number grid with a visual **circular progress ring** for calories (using a lightweight SVG ring) plus colored macro bars for protein/carbs/fat showing percentage of daily target. Each bar animates in on load using framer-motion.

### 2. Expandable Meal Cards

Make each meal card **expandable/collapsible** using Radix Accordion or a simple toggle state. By default show meal name, time, and calorie count. On tap/click, expand to reveal food items with portion sizes and macro breakdown. Add a smooth height animation via framer-motion's `AnimatePresence` + `layout`.

### 3. Staggered Entry Animations

Each meal card animates in with a staggered delay (0.05s increments) using framer-motion variants, giving a cascading feel as you scroll.

### 4. Meal Emoji Icons

Add contextual emoji/icons per meal name (Breakfast = sunrise icon, Lunch = sun, Dinner = moon, Snack = cookie). Map meal names to icons for visual variety instead of the same utensils icon everywhere.

### 5. Colored Macro Chips

In the expanded meal view, show protein/carbs/fat as small colored badge chips (green for protein, blue for carbs, amber for fat) instead of plain text.

### 6. Daily Target Progress

If `dailyTarget` exists, show a progress bar under the calorie ring: "1850 / 2200 kcal" with a filled bar, giving a sense of completion.

### 7. Protein Note & Supplements Styling

- Protein note card: gradient left border accent + subtle background
- Supplements: pill-shaped badges instead of bullet list

## Technical Details

**File: `src/pages/Diet.tsx**`

- Add state `expandedMeal` (string | null) to track which meal is open
- Create an SVG ring component inline (simple `<circle>` with `stroke-dashoffset` animation)
- Use `motion.div` with `layout` prop on meal cards for smooth expand/collapse
- Use existing `Badge` component for macro chips
- Map meal names to lucide icons: `Sunrise`, `Sun`, `Moon`, `Cookie`
- All framer-motion, no new dependencies needed
- add workout visuals
- make the websit more aesthetic apealing
- &nbsp;