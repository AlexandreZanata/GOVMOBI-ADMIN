# Motion and Navigation Patterns — GOVMOBI-ADMIN

> **Cross-links:** [`design-pattern.md`](./design-pattern.md) · [`../design-system/design-system-accessibility.md`](../design-system/design-system-accessibility.md)

---

## Motion Philosophy

GOVMOBI-ADMIN is an operational tool. Motion must serve a functional purpose — communicating state changes, directing attention, or providing spatial context. Decorative animation is forbidden.

**Every animation must:**
1. Have a functional purpose
2. Respect `prefers-reduced-motion`
3. Complete in ≤ 300ms
4. Not block user interaction

---

## 1. Page Transitions

**Decision:** No page transition animations.

Next.js App Router handles page navigation. We do not add CSS transitions between pages. Reasons:
- Operational users navigate frequently; transitions add latency perception
- Skeleton screens provide sufficient loading feedback
- Reduces complexity and bundle size

```tsx
// ✅ Correct — no transition, immediate render
export default function RunsPage() {
  return <RunList />;
}

// ❌ Forbidden — decorative page transition
export default function RunsPage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <RunList />
    </motion.div>
  );
}
```

---

## 2. Modal and Dialog Animation

**Use:** Fade in/out, 150ms duration.

```css
/* In govmobile.css or component styles */
@keyframes dialog-in {
  from { opacity: 0; transform: scale(0.97); }
  to   { opacity: 1; transform: scale(1); }
}

@keyframes dialog-out {
  from { opacity: 1; transform: scale(1); }
  to   { opacity: 0; transform: scale(0.97); }
}

@media (prefers-reduced-motion: reduce) {
  @keyframes dialog-in  { from { opacity: 0; } to { opacity: 1; } }
  @keyframes dialog-out { from { opacity: 1; } to { opacity: 0; } }
}
```

### Rules

- Duration: 150ms enter, 100ms exit.
- `prefers-reduced-motion`: reduce to opacity-only fade (no scale).
- Focus is trapped inside the modal while open.
- `Escape` closes the modal.

---

## 3. Drawer / Side Panel Animation

**Use:** Slide in from right, 200ms duration.

```css
@keyframes drawer-in {
  from { transform: translateX(100%); }
  to   { transform: translateX(0); }
}

@media (prefers-reduced-motion: reduce) {
  @keyframes drawer-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
}
```

### Rules

- Duration: 200ms enter, 150ms exit.
- `prefers-reduced-motion`: fade only.
- Overlay behind drawer has opacity 0.4 black.
- Clicking overlay closes the drawer.

---

## 4. Toast Notifications

**Use:** Slide in from bottom-right, 200ms.

```tsx
// Toast appears at bottom-right
// Auto-dismisses after 4 seconds (success/info) or 8 seconds (error)
// Manual dismiss via close button

toast.success(t("runs:assign.success"));
toast.error(t("runs:assign.error"));
```

### Rules

- Success/info toasts: auto-dismiss after 4 seconds.
- Error toasts: auto-dismiss after 8 seconds (user needs more time to read).
- Maximum 3 toasts visible simultaneously (oldest dismissed first).
- `aria-live="polite"` on the toast container.

---

## 5. Navigation Feedback

### Active Route Indicator

The sidebar navigation must clearly indicate the active route:

```tsx
<NavItem
  href="/runs"
  active={pathname.startsWith("/runs")}
  icon={<RunsIcon />}
  label={t("nav:runs")}
/>
```

- Active item: `bg-brand-primary/10 text-brand-primary font-medium`
- Inactive item: `text-neutral-600 hover:bg-neutral-100`
- No animation on active state change — instant visual update.

### Breadcrumbs

Required on all nested routes:

```tsx
// /runs/[id] → "Runs / Run #001"
<Breadcrumb>
  <BreadcrumbItem href="/runs">{t("nav:runs")}</BreadcrumbItem>
  <BreadcrumbItem current>{run.title}</BreadcrumbItem>
</Breadcrumb>
```

### Back Navigation

- Always provide an explicit "Back" button on detail pages.
- Do not rely on browser back button alone.
- Do not auto-navigate after an action — let the user decide when to leave.

---

## 6. prefers-reduced-motion Implementation

```tsx
// Hook for checking motion preference
function usePrefersReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return prefersReduced;
}
```

All animated components must use this hook or the CSS `@media (prefers-reduced-motion: reduce)` query.

---

## Review Checklist

- [ ] Page transitions are explicitly set to "none" with rationale
- [ ] Modal and drawer animations have duration and reduced-motion variants
- [ ] Toast rules include auto-dismiss timing and aria-live
- [ ] Navigation feedback covers active state, breadcrumbs, and back navigation
- [ ] prefers-reduced-motion implementation is provided
