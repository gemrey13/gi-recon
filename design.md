# Gi-Recon Frontend - Design System

## Overview

A cohesive design system for **Gi-Recon**, a desktop reconciliation application. This document covers the visual design language, color palette, typography, component styling, and UI/UX patterns used throughout the application.

---

## Color Palette

### Primary Brand Colors

| Color | Tailwind Class | Usage |
|-------|----------------|-------|
| **Indigo** | `indigo-600` | Primary actions, buttons, links, interactive elements |
| **Indigo Light** | `indigo-50`, `indigo-100` | Backgrounds, highlights, focus states |
| **Indigo Dark** | `indigo-400` | Accent text, brand secondary |

### Status Colors

| Status | Color | Tailwind Classes | Usage |
|--------|-------|------------------|-------|
| **Success** | Emerald | `emerald-50` / `emerald-500` / `emerald-600` | Matched transactions, success messages, progress indicators |
| **Warning** | Amber | `amber-50` / `amber-500` / `amber-600` | Flagged issues, pending items, caution states |
| **Error** | Red | `red-50` / `red-500` / `red-600` | Errors, critical issues, deletion warnings |
| **Info** | Blue | `blue-50` / `blue-500` / `blue-600` | Information, hints, secondary actions |

### Neutral Colors

| Shade | Tailwind Class | Usage |
|-------|----------------|-------|
| **Background** | `slate-50` | Light page backgrounds, containers |
| **Surface** | `white` | Cards, modals, input fields |
| **Dark Surface** | `slate-900` | Sidebar, dark panels, headers |
| **Border** | `slate-200` | Subtle borders, dividers |
| **Border Dark** | `slate-700` | Dark theme borders |
| **Text Primary** | `slate-900` | Main body text |
| **Text Secondary** | `slate-500` | Labels, hints, secondary text |
| **Text Muted** | `slate-400` | Disabled text, very light labels |
| **Text Inverse** | `white` | Text on dark backgrounds |

### Gradient Overlays
- Sidebar fade: `from-slate-900 to-slate-800`
- Accent gradient: `from-indigo-600 to-indigo-500`

---

## Typography

### Font Family
- **Default**: System sans-serif stack via `font-sans`
- Applied globally in tailwind configuration

### Type Scale

| Element | Tailwind Classes | Usage |
|---------|------------------|-------|
| **H1** | `text-4xl font-black tracking-tight` | Page titles (Overview, GrabPage) |
| **H2** | `text-2xl font-bold` | Section headers |
| **H3** | `text-lg font-bold` | Subsection titles, card headers |
| **Body** | `text-base` | Regular paragraph text |
| **Label** | `text-sm font-semibold` | Form labels, card titles |
| **Caption** | `text-xs` | Helper text, timestamps |
| **Badge** | `text-[10px] font-bold uppercase tracking-widest` | Status badges, labels |

### Text Colors & Hierarchy

```css
/* Primary Text */
text-slate-900          /* Main body text, high contrast */

/* Secondary Text */
text-slate-500          /* Descriptions, secondary info */

/* Tertiary Text */
text-slate-400          /* Disabled state, very light */

/* Inverse */
text-white              /* On dark backgrounds */

/* Accent */
text-indigo-600         /* Links, interactive text */
text-emerald-600        /* Success states */
text-amber-600          /* Warning states */
```

---

## Spacing System

### Consistent Spacing Scale (Tailwind Default)

```
4px   → `0.5`, `px`, `0.25rem`
8px   → `1`, `2`, `0.5rem`
12px  → `3`, `0.75rem`
16px  → `4`, `1rem`
24px  → `6`, `1.5rem`
32px  → `8`, `2rem`
48px  → `12`, `3rem`
64px  → `16`, `4rem`
```

### Padding Patterns
- **Containers**: `p-4` (16px) to `p-10` (40px)
- **Cards**: `p-5` (20px) standard
- **Modals**: `p-6` (24px)
- **Inputs**: `px-3 py-2` (12px horizontal, 8px vertical)

### Margin & Gaps
- **Vertical spacing between sections**: `space-y-6` to `space-y-10`
- **Horizontal gaps**: `gap-4` to `gap-8`
- **Between cards in grid**: `gap-4`

---

## Component Styling Guide

### Buttons

#### Primary Button (Action)
```
bg-indigo-600 
hover:bg-indigo-500 
active:scale-95
text-white font-semibold py-2 px-4 rounded-lg
transition-all duration-300 ease-in-out
```

#### Secondary Button
```
bg-slate-200 
hover:bg-slate-300 
text-slate-900 font-semibold py-2 px-4 rounded-lg
transition-all duration-300
```

#### Button States
- **Hover**: Slight brightness increase, shadow enhancement
- **Active/Pressed**: `scale-95` (compression effect)
- **Disabled**: `opacity-50 cursor-not-allowed`
- **Loading**: Icon spinner, disabled state

### Input Fields

#### Text Input
```
w-full px-3 py-2 
border border-slate-200 rounded-lg 
bg-white text-slate-900 
placeholder:text-slate-400
focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
transition-all duration-300
```

#### Select Dropdown
```
appearance-none px-3 py-2 pr-8
border border-slate-200 rounded-lg
bg-white text-slate-900
hover:border-slate-300 focus:ring-2 focus:ring-indigo-500
cursor-pointer
```

### Cards

#### Standard Card
```
bg-white 
rounded-2xl 
border border-slate-200 
shadow-sm 
hover:shadow-md (optional)
transition-shadow duration-300
p-5
```

#### Dark Card (Sidebar Widget)
```
bg-slate-800 
rounded-xl 
p-3
text-white
border border-slate-700
```

#### Metric Card
```
bg-white p-5 rounded-2xl 
border border-slate-200 shadow-sm
transition-hover hover:shadow-md
```

### Badges & Status Indicators

#### Info Badge
```
px-2 py-1 
bg-indigo-50 text-indigo-700 
rounded-md border border-indigo-100 
text-xs font-medium
```

#### Success Badge
```
px-2 py-1 
bg-emerald-50 text-emerald-700 
rounded-md border border-emerald-100 
text-xs font-medium
```

#### Warning Badge
```
px-2 py-1 
bg-amber-50 text-amber-600 
rounded-md border border-amber-200 
text-xs font-medium
```

### Progress Bars

#### Standard Progress
```
h-1 w-full bg-slate-100 rounded-full overflow-hidden

/* Fill */
h-full bg-emerald-500
transition-all duration-300
```

### Modals & Overlays

#### Modal Container
```
fixed inset-0 
bg-black/50 (backdrop blur)
flex items-center justify-center
z-50
```

#### Modal Content
```
bg-white rounded-2xl shadow-2xl 
p-6 max-w-md w-full mx-4
```

### Tables

#### Table Header
```
bg-slate-100 
text-slate-900 font-semibold 
px-4 py-3 text-left text-sm
```

#### Table Row
```
border-b border-slate-200 
hover:bg-slate-50 
transition-colors duration-200
px-4 py-3 text-sm
```

#### Table Row - Selected
```
bg-indigo-50 
border-l-4 border-l-indigo-600
```

### Checkboxes & Toggles

#### Checkbox
```
w-5 h-5 
rounded border border-slate-300 
bg-white
checked:bg-indigo-600 checked:border-indigo-600
focus:ring-2 focus:ring-indigo-500
cursor-pointer
```

---

## Borders & Shadows

### Border Radius Scale

| Size | Tailwind Class | Usage |
|------|----------------|-------|
| **Small** | `rounded-lg` (8px) | Buttons, inputs, small elements |
| **Medium** | `rounded-xl` (12px) | Cards, modals |
| **Large** | `rounded-2xl` (16px) | Large cards, hero sections |
| **Full** | `rounded-full` | Circular buttons, avatars |

### Shadow System

| Level | Tailwind Class | Usage |
|-------|----------------|-------|
| **None** | None | Clean minimal elements |
| **Subtle** | `shadow-sm` | Cards, small containers |
| **Standard** | `shadow-md` | Modals, dropdown menus |
| **Deep** | `shadow-lg` | Floating panels |
| **Extra** | `shadow-xl` | Top-level modals, overlays |

### Shadow Effects
```
shadow-sm     /* 0 1px 2px rgba(0,0,0,0.05) */
hover:shadow-md /* Hover elevation */
transition-shadow duration-300
```

---

## Transitions & Animations

### Standard Duration
- **Quick interactions**: `duration-200` (200ms)
- **Normal transitions**: `duration-300` (300ms)
- **Slow animations**: `duration-500` (500ms)

### Easing Functions
- **Default**: `ease-in-out`
- **Smooth**: `ease-[cubic-bezier(0.25,0.8,0.25,1)]` (custom smooth curve)
- **Snappy**: `ease-in` / `ease-out`

### Common Transitions
```css
/* Button interactions */
transition-all duration-300 ease-in-out

/* Sidebar collapse */
transition-all duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)]

/* Hover effects */
transition-colors duration-300
transition-shadow duration-300
transition-transform duration-300

/* Scale animations */
active:scale-95
hover:scale-110 (small UI elements)
```

---

## Layout & Grid System

### Flexbox Layouts

#### Horizontal Flex
```css
flex items-center justify-between
flex items-center gap-4
flex items-start
```

#### Vertical Flex
```css
flex flex-col gap-6
flex flex-col items-center
```

### Grid Layouts

#### Responsive Grids
```css
/* Overview cards */
grid grid-cols-1 md:grid-cols-3 gap-8

/* Metrics cards */
grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4

/* Reconciliation workspace */
grid grid-cols-1 lg:grid-cols-12 gap-6 h-150
```

### Responsive Breakpoints

| Breakpoint | Tailwind | Width | Usage |
|------------|----------|-------|-------|
| **Mobile** | None (default) | < 640px | Base styles, single column |
| **Small** | `sm:` | ≥ 640px | 2-column layouts |
| **Medium** | `md:` | ≥ 768px | 3-column layouts |
| **Large** | `lg:` | ≥ 1024px | Full responsive designs |
| **XL** | `xl:` | ≥ 1280px | Extra wide screens |

### Container Widths
```css
max-w-6xl mx-auto     /* Content container */
max-w-md w-full       /* Modal width */
w-64                  /* Sidebar width */
```

---

## Specific UI Patterns

### Navigation Links (Active State)
```css
/* Active link */
text-indigo-600 bg-indigo-50 font-semibold

/* Inactive link */
text-slate-500 hover:text-slate-900
transition-colors duration-300
```

### Form Groups
```css
flex flex-col gap-2
label: text-sm font-semibold text-slate-700
input/select: (see input field styling)
helper: text-xs text-slate-500
```

### Icon Styling
```css
/* Standard icon */
text-slate-500

/* On hover */
hover:text-indigo-600

/* Active/highlighted */
text-indigo-600

/* Icon size standards */
size-5    /* 20px, standard */
size-20   /* 80px, hero icons */
size-4    /* 16px, small icons */
```

### Loading States
```css
/* Spinner/Loader */
animate-spin

/* Disabled overlay */
opacity-50 cursor-not-allowed

/* Loading skeleton (pulse) */
animate-pulse bg-slate-200
```

---

## Dark Theme (Future)

### Dark Mode Color Map
- `bg-slate-50` → `dark:bg-slate-900`
- `bg-white` → `dark:bg-slate-800`
- `text-slate-900` → `dark:text-white`
- `border-slate-200` → `dark:border-slate-700`

---

## Accessibility Considerations

### Color Contrast
- All text meets WCAG AA standard (4.5:1 for normal, 3:1 for large)
- Don't rely on color alone for information (use icons, text)

### Focus States
```css
focus:outline-none focus:ring-2 focus:ring-indigo-500
/* Visible ring for keyboard navigation */
```

### Interactive Elements
- Min height: 44px (touch targets on mobile)
- Sufficient padding around clickable areas

### Semantic HTML
- Use `<button>` for actions (not `<div>`)
- Use `<label>` with inputs
- Use `<table>` for data tables
- ARIA labels where needed

---

## CSS Utilities Reference

### Most Common Utility Classes

| Category | Examples |
|----------|----------|
| **Spacing** | `p-4`, `m-6`, `gap-8`, `space-y-4` |
| **Display** | `flex`, `grid`, `hidden`, `block`, `inline` |
| **Sizing** | `w-full`, `h-screen`, `max-w-md`, `min-h-100` |
| **Colors** | `bg-indigo-600`, `text-slate-900`, `border-slate-200` |
| **Typography** | `text-lg`, `font-bold`, `tracking-wide`, `uppercase` |
| **Borders** | `rounded-lg`, `border`, `border-2`, `border-indigo-600` |
| **Effects** | `shadow-md`, `opacity-50`, `blur`, `drop-shadow` |
| **Interactions** | `hover:`, `active:`, `focus:`, `disabled:` |
| **Transforms** | `scale-95`, `translate-x-0`, `rotate-90` |
| **Positioning** | `absolute`, `relative`, `fixed`, `inset-0` |

---

## Design Tokens Summary

| Token | Value | Tailwind |
|-------|-------|----------|
| **Primary Color** | `#4f46e5` | `indigo-600` |
| **Success Color** | `#10b981` | `emerald-600` |
| **Warning Color** | `#f59e0b` | `amber-500` |
| **Font Family** | System sans-serif | `font-sans` |
| **Border Radius (Card)** | `16px` | `rounded-2xl` |
| **Shadow (Card)** | `0 1px 3px rgba(0,0,0,0.1)` | `shadow-sm` |
| **Transition Speed** | `300ms` | `duration-300` |
| **Z-index (Modal)** | `50` | `z-50` |

---

## Usage Examples

### Example: Reconciliation Card
```tsx
<div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">
    Auto-Matched
  </h3>
  <p className="text-2xl font-black text-slate-900">{count}</p>
  <div className="mt-3 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
    <div className="h-full bg-emerald-500" style={{ width: `${percentage}%` }}></div>
  </div>
</div>
```

### Example: Primary Button
```tsx
<button className="bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300">
  Save Changes
</button>
```

### Example: Form Group
```tsx
<div className="flex flex-col gap-2">
  <label className="text-sm font-semibold text-slate-700">Email Address</label>
  <input className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
  <span className="text-xs text-slate-500">We'll never share your email</span>
</div>
```

---

## Quick Reference

### Color Usage Map
```
Buttons & Links      → indigo-600
Success/Checkmark    → emerald-600
Warnings/Pending     → amber-500
Errors               → red-600
Backgrounds          → slate-50
Text (Primary)       → slate-900
Text (Secondary)     → slate-500
Borders              → slate-200
```

### Responsive Pattern
```
Mobile first (default): grid grid-cols-1
Tablet (md:):          md:grid-cols-2
Desktop (lg:):         lg:grid-cols-3
```

---

Generated: April 24, 2026
