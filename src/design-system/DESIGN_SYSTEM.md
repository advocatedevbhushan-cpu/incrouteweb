# INCroute Design System

> Enterprise-grade design foundation for the Business Infrastructure Platform.

## Quick Start

```tsx
// 1. Import CSS tokens (once, in main.tsx or App.tsx)
import "./index.css"; // Single source of truth for all tokens
import "./design-system/typography.css";

// 2. Import components
import { Button, Card, Badge, Modal, useToast } from "./design-system";
```

---

## Color System

| Token | Value | Usage |
|-------|-------|-------|
| `--ds-bg-primary` | `#0F172A` | Page background |
| `--ds-bg-secondary` | `#18253D` | Elevated background |
| `--ds-surface-primary` | `#1B263B` | Card surfaces |
| `--ds-surface-elevated` | `#22304A` | Modals, dropdowns |
| `--ds-workspace-bg` | `#F8FAFC` | Light data panels |
| `--ds-brand-primary` | `#6C7CFF` | Primary actions |
| `--ds-brand-secondary` | `#A78BFA` | Secondary accent |
| `--ds-brand-premium` | `#D4AF37` | Premium indicators |
| `--ds-text-primary` | `#F8FAFC` | Headings, important |
| `--ds-text-secondary` | `#CBD5E1` | Body copy |
| `--ds-text-muted` | `#94A3B8` | Labels, captions |

### Status Colors
- Success: `#22C55E`
- Warning: `#F59E0B`
- Error: `#EF4444`
- Info: `#3B82F6`

---

## Typography Scale

| Class | Size | Weight | Use Case |
|-------|------|--------|----------|
| `.ds-display-xl` | clamp(2.75rem, 5vw, 4rem) | 800 | Hero headlines |
| `.ds-display-lg` | clamp(2.25rem, 4vw, 3.25rem) | 800 | Section headers |
| `.ds-display-md` | clamp(1.875rem, 3vw, 2.5rem) | 700 | Page titles |
| `.ds-h1` | 1.75rem | 700 | Dashboard headers |
| `.ds-h2` | 1.5rem | 700 | Section titles |
| `.ds-h3` | 1.25rem | 600 | Card titles |
| `.ds-h4` | 1.0625rem | 600 | Subsections |
| `.ds-body-lg` | 1.0625rem | 400 | Intro text |
| `.ds-body-md` | 0.9375rem | 400 | Standard body |
| `.ds-body-sm` | 0.8125rem | 400 | Descriptions |
| `.ds-caption` | 0.75rem | 500 | Timestamps, meta |
| `.ds-label` | 0.6875rem | 600 | Form labels, pills |

---

## Spacing (8-point grid)

| Token | Value |
|-------|-------|
| `--ds-space-1` | 4px |
| `--ds-space-2` | 8px |
| `--ds-space-3` | 12px |
| `--ds-space-4` | 16px |
| `--ds-space-5` | 24px |
| `--ds-space-6` | 32px |
| `--ds-space-7` | 48px |
| `--ds-space-8` | 64px |
| `--ds-space-9` | 96px |
| `--ds-space-10` | 128px |

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--ds-radius-xs` | 4px | Tags, chips |
| `--ds-radius-sm` | 6px | Small buttons |
| `--ds-radius-md` | 8px | Inputs |
| `--ds-radius-lg` | 12px | Cards |
| `--ds-radius-xl` | 16px | Panels |
| `--ds-radius-2xl` | 20px | Dashboard cards |
| `--ds-radius-3xl` | 28px | Hero elements |
| `--ds-radius-full` | 9999px | Avatars, pills |

---

## Components

### Button
```tsx
<Button variant="primary" size="md" leftIcon={<Plus />}>Create Entity</Button>
<Button variant="secondary">Cancel</Button>
<Button variant="danger" loading>Delete</Button>
```
Variants: `primary` · `secondary` · `ghost` · `text` · `danger` · `success`
Sizes: `sm` (32px) · `md` (40px) · `lg` (48px)

### Card
```tsx
<Card variant="interactive" padding="lg">...</Card>
<MetricCard label="Active Entities" value="12" delta="+3 this month" deltaTone="up" />
```
Variants: `standard` · `elevated` · `interactive` · `workspace`

### Badge
```tsx
<Badge tone="success" dot>Active</Badge>
<StatusBadge status="overdue" />
```
Status presets: `active` · `pending` · `completed` · `overdue` · `critical` · `draft` · `paid` · `unpaid` · `tmFiled` · `tmApproved` · `rocFiled` · `gstFiled`

### Form Fields
```tsx
<Field label="Company Name" error={errors.name} required>
  <Input state={errors.name ? "error" : "default"} leftIcon={<Building2 />} />
</Field>
```

### Modal
```tsx
<ConfirmModal open={show} onClose={close} onConfirm={handleDelete} title="Delete Entity?" message="This cannot be undone." variant="danger" />
```

### Toast
```tsx
const { toast } = useToast();
toast("success", "Entity Created", "Your company has been registered.");
```

### Sidebar
```tsx
<SidebarProvider>
  <DashboardShell>
    <Sidebar>
      <SidebarHeader logo={<Logo />} title="INCroute" />
      <NavItem icon={<Building2 />} label="Entities" active />
      <NavItem icon={<FileText />} label="Compliance" badge="3" />
    </Sidebar>
    <DashboardMain>
      <DashboardHeader>...</DashboardHeader>
      <DashboardContent>...</DashboardContent>
    </DashboardMain>
  </DashboardShell>
</SidebarProvider>
```

### Data Display
```tsx
<ProgressBar value={75} tone="success" showLabel />
<CircularProgress value={98} label="Compliant" tone="success" />
<Timeline items={[{ title: "Incorporation", description: "Entity formed", tone: "success" }]} />
```

---

## Layout System

```
┌──────────┬────────────────────────────────┐
│          │  DashboardHeader               │
│ Sidebar  ├────────────────────────────────┤
│ (260px)  │                                │
│          │  DashboardContent              │
│          │  (max-w: 1200px, centered)     │
│          │                                │
└──────────┴────────────────────────────────┘
```

- Sidebar: 260px expanded, 72px collapsed
- Header: 64px height, sticky, blur backdrop
- Content: 1200px max, 24px padding
- Grid: Use `<Grid cols={3} gap={4}>` for card layouts

---

## Motion

| Duration | Use Case |
|----------|----------|
| 80ms | Micro-interactions (press) |
| 150ms | Hover states, toggles |
| 250ms | Panel transitions |
| 400ms | Page transitions, modals |

Easing: `cubic-bezier(0.16, 1, 0.3, 1)` for snappy UI

---

## Responsive Breakpoints

| Name | Width | Usage |
|------|-------|-------|
| sm | 640px | Mobile landscape |
| md | 768px | Tablet portrait |
| lg | 1024px | Tablet landscape |
| xl | 1280px | Desktop |
| 2xl | 1536px | Wide desktop |

---

## File Structure

```
src/design-system/
├── index.ts           # Barrel export
├── tokens.css         # CSS custom properties
├── tokens.ts          # JS token export
├── typography.css     # Type scale classes
├── utils.ts           # cn() helper
├── DESIGN_SYSTEM.md   # This file
└── components/
    ├── Badge.tsx
    ├── Button.tsx
    ├── Card.tsx
    ├── FormControls.tsx
    ├── Input.tsx
    ├── Layout.tsx
    ├── Modal.tsx
    ├── Sidebar.tsx
    ├── Table.tsx
    └── Toast.tsx
```
