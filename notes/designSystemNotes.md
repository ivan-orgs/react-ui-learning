# Design System Primitives — wabi and sabi

## What is a design system primitive?

A primitive is a small, reusable component that handles one visual concern — a styled text block, a card wrapper, a button — so every part of the app looks consistent without each page styling its own elements from scratch.

This project has two component libraries:

| Library | What it contains |
|---|---|
| `wabi` | Low-level UI primitives — `Text`, `Button`, `Surface`, `Stack`, `Skeleton` |
| `sabi` | App-level layout pieces — `AppHeader`, `Time`, `KeyValuePair`, `ShowMore`, `SidePanel` |

Both are just folders with an `index.ts` that re-exports everything. There is no external package — it is your own code, organised to mirror how a real design system package works.

---

## How the barrel export (index.ts) works

Each library has an `index.ts` that collects and re-exports all components. This is called a **barrel export**.

```ts
// src/components/wabi/index.ts
export { Button }                    from '../../shared/ui/Button';
export { SkeletonLine, PageSkeleton } from '../../shared/ui/Skeleton';
export { Stack }                     from '../../shared/ui/Stack';
export { Surface }                   from '../../shared/ui/Surface';
export { Text }                      from './Text';
```

Without this, every import would need the full path to the file:

```tsx
// ❌ Without barrel — long and fragile
import { Button }  from '../../shared/ui/Button';
import { Surface } from '../../shared/ui/Surface';
import { Text }    from '../../components/wabi/Text';

// ✅ With barrel — one clean import line
import { Button, Surface, Text } from '../../components/wabi';
```

If you ever move a component to a different file, you only update the barrel — all consumers stay the same.

---

## wabi — the primitives

### Text

Renders a `<p>` tag with a `tone` prop that controls colour. The tone values are a **literal union** — only `"default"`, `"muted"`, or `"danger"` are allowed.

**What is `children` and how does it get its value?**

`children` is a special prop in React. You do not pass it as an attribute like `tone="muted"`. Instead, whatever you place **between the opening and closing tags** of a component automatically becomes `children`.

```tsx
<Text tone="muted">Secondary info</Text>
//                 ↑
//   "Secondary info" is the children — React passes it in automatically
```

React collects everything between the tags and hands it to the component as `props.children`. The component then decides where to render it — in this case, inside the `<p>`.

```tsx
type TextTone = 'default' | 'muted' | 'danger';

function Text({ children, tone = 'default' }) {
  //           ↑         ↑
  //   the content       the prop you pass as an attribute
  //   between the tags

  return <p className={`${styles.text} ${styles[tone]}`}>{children}</p>;
  //                                                       ↑
  //                                      renders "Secondary info" here
}
```

`children` can be anything — a plain string, a number, other JSX elements, or even another component:

```tsx
<Text>Simple string</Text>

<Text tone="danger">
  <strong>Error:</strong> something went wrong
</Text>

<Text tone="muted">
  <Time value={task.updatedAt} />
</Text>
```

Usage:

```tsx
<Text>Normal message</Text>
<Text tone="muted">Secondary info</Text>
<Text tone="danger">Something went wrong</Text>
```

The CSS module maps `styles[tone]` to a scoped class — `styles.muted`, `styles.danger` etc. — so there are no global class name clashes.

---

### Button

A styled wrapper around the native `<button>` that adds a `variant` prop for appearance and forwards every other native button attribute automatically.

```tsx
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
}

//                                                       ↓ ButtonProps used here
function Button({ children, variant = 'secondary', ...props }: ButtonProps) {
  return (
    <button className={`${styles.button} ${styles[variant]}`} {...props}>
      {children}
    </button>
  );
}
```

There are four things to understand here:

---

**0. Where `ButtonProps` is actually used**

`ButtonProps` is defined once and used in exactly one place — as the type annotation on the function parameter:

```tsx
function Button({ children, variant = 'secondary', ...props }: ButtonProps) {
//                                                            ↑
//                         tells TypeScript: "the props coming in must match ButtonProps"
```

In TypeScript, `: TypeName` after the destructuring `}` tells TypeScript what shape the whole props object must be. TypeScript then checks every prop you pass against it when calling the component:

```tsx
<Button variant="primary" onClick={fn}>Save</Button>  // ✅ valid
<Button variant="wrong">Save</Button>                 // ❌ error — 'wrong' not in the union
<Button>Save</Button>                                 // ✅ valid — variant has a default
```

Without `: ButtonProps`, TypeScript would type the parameter as `any` — no error checking at all.

---

**0. `children: ReactNode` — what the button label can be**

`ReactNode` is a TypeScript type that means "anything React can render". This includes:

```tsx
// A plain string
<Button>Save</Button>

// A number
<Button>{count}</Button>

// JSX
<Button><span>Save</span> review</Button>

// Another component
<Button><Icon name="save" /> Save</Button>
```

Without `children: ReactNode` in the interface, TypeScript would not know the component accepts content between its tags. `ReactNode` is the widest type for "something renderable" — if you can put it between JSX tags, it fits.

---

**1. `variant` prop — controls the visual style**

`variant` is a literal union — only `'primary'`, `'secondary'`, or `'ghost'` are valid. Just like `tone` in `Text`, it is used to look up the right CSS class:

```tsx
styles[variant]
// variant = 'primary'  → styles['primary'] → "Button_primary__xK2"
// variant = 'ghost'    → styles['ghost']   → "Button_ghost__mR5"
```

Default is `'secondary'`, so `<Button>Click</Button>` with no variant still gets a style.

---

**2. `ButtonHTMLAttributes<HTMLButtonElement>` — why it exists**

When you use a native `<button>` in HTML, you can pass many built-in attributes to it:

```tsx
<button onClick={fn} disabled={true} type="submit" aria-label="Save">
  Click
</button>
```

Now you are wrapping that `<button>` inside your own `Button` component. The problem: TypeScript does not automatically know your component should accept `onClick`, `disabled`, `type`, etc. You have to tell it.

You could list them manually — but there are dozens of them. Instead you use `extends`:

```tsx
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
}
```

Think of it as saying:

> "My `ButtonProps` includes everything a real `<button>` already accepts — plus my own `variant` prop on top."

`ButtonHTMLAttributes<HTMLButtonElement>` is just TypeScript's pre-built list of every attribute a `<button>` element understands. You are borrowing that list instead of writing it yourself.

Result: TypeScript now knows `<Button onClick={fn} disabled={true}>` is valid — exactly like a native button.

---

**3. `...props` — collecting and forwarding what you didn't name**

This is a two-step process. Let's trace it with a real example:

```tsx
// Someone uses Button like this:
<Button variant="primary" onClick={approve} disabled={saving}>
  Save review
</Button>
```

React passes all of those as one props object into the component:

```tsx
// What React hands to Button internally:
{
  variant:  'primary',
  onClick:  approve,
  disabled: saving,
  children: 'Save review'
}
```

Now inside Button, you destructure:

```tsx
function Button({ children, variant = 'secondary', ...props }) {
```

React picks out `children` and `variant` by name. **Everything that is left over** gets collected into `...props`:

```tsx
// After destructuring:
children  = 'Save review'
variant   = 'primary'
props     = { onClick: approve, disabled: saving }
//           ↑ the leftovers — onClick and disabled were not named, so they went here
```

Then `{...props}` on the `<button>` spreads those leftovers back out:

```tsx
<button {...props}>
// same as writing:
<button onClick={approve} disabled={saving}>
```

So the full journey of `onClick` and `disabled`:

```
<Button onClick={approve} disabled={saving}>
    ↓ not named in destructuring
    ↓ collected into ...props
    ↓ spread back onto the real <button>
<button onClick={approve} disabled={saving}>   ✅ works like a normal button
```

Without this, `onClick` and `disabled` would be silently swallowed — the real `<button>` would never receive them.

**Usage:**

```tsx
<Button variant="primary" onClick={approve} disabled={saving}>
  Save review
</Button>
```

---

### Surface

A card wrapper — gives a consistent border, padding, and optional heading to any content block.

```tsx
function Surface({ children, title }) {
  return (
    <section className={styles.surface}>
      {title ? <h2>{title}</h2> : null}
      {children}
    </section>
  );
}
```

Usage — any content dropped inside gets the card treatment:

```tsx
<Surface title="Suggested priority">
  <Text>{task.suggestedPriority}</Text>
</Surface>

<Surface title="Summary">
  <ShowMore text={task.summary} />
</Surface>
```

This is a **composition primitive** — it doesn't care what goes inside it, it just wraps whatever children it receives.

---

### Stack

Stacks its children vertically with a configurable `gap` prop.

```tsx
function Stack({ children, gap = 12 }) {
  const style = { '--gap': `${gap}px` } as CSSProperties;
  return <div style={style} className="stack">{children}</div>;
}
```

**How `--gap` works — CSS custom properties**

A CSS custom property is a variable you define in CSS (or JS) and read in CSS. Names always start with `--`.

The Stack component does this in two steps across two files:

**Step 1 — JS sets the variable on the element** (`Stack.tsx`)

```tsx
const style = { '--gap': `${gap}px` } as CSSProperties;
// If gap = 24, this produces: style="--gap: 24px"
// The variable is set directly on the <div> as an inline style
```

**Step 2 — CSS reads it with `var()`** (`global.css`)

```css
.stack {
  display: grid;
  gap: var(--gap);  /* reads whatever value --gap was set to */
}
```

`var(--gap)` means "look up the value of `--gap` on this element". Since the JS set it to `24px`, the browser reads `gap: 24px`.

**The full flow:**

```
<Stack gap={24}>        →  style="--gap: 24px"   (JS sets variable)
   .stack { gap: var(--gap) }                     (CSS reads variable)
   → browser applies gap: 24px between children  ✅
```

**Why do it this way instead of just `style={{ gap: '24px' }}`?**

You could. But the CSS custom property approach means the gap value is controlled from JS while the layout logic stays in CSS. The `.stack` class in `global.css` can use `--gap` in multiple places if needed — e.g. in a media query — and the JS only has to set it once.

Usage:

```tsx
<Stack gap={24}>
  <PriorityWidget />
  <ConfidenceWidget />
  <CheckCoverageWidget />
</Stack>
```

---


### Skeleton / PageSkeleton

Shows animated placeholder lines while data is loading. `PageSkeleton` also sets `aria-busy="true"` and `aria-live="polite"` — these tell screen readers that the region is currently loading.

```tsx
function PageSkeleton({ title }) {
  return (
    <section aria-busy="true" aria-live="polite">
      <p>{title}</p>
      <SkeletonLine />
      <SkeletonLine />
      <SkeletonLine />
    </section>
  );
}
```

Usage — shown instead of the real page while the query is loading:

```tsx
if (isLoading) return <PageSkeleton title="Loading task detail" />;
```

---

## sabi — the app-level pieces

### AppHeader

The top navigation bar rendered on every page. Uses semantic `<header>` and `<nav>` tags, and `<NavLink>` so the active route gets highlighted automatically.

```tsx
function AppHeader() {
  return (
    <header>
      <h1>Priority task workspace</h1>
      <nav aria-label="Main navigation">
        <NavLink to="/">Queue</NavLink>
        <NavLink to="/concepts">Concepts</NavLink>
      </nav>
    </header>
  );
}
```

---

### Time

Renders a `<time>` element with a machine-readable `dateTime` attribute (the ISO string) and a human-readable display (formatted with `Intl.DateTimeFormat`).

```tsx
function Time({ value }: { value: Date | string }) {
  const date = typeof value === 'string' ? new Date(value) : value;
  return <time dateTime={date.toISOString()}>{new Intl.DateTimeFormat('en-IN').format(date)}</time>;
}
```

Usage:

```tsx
<KeyValuePair label="Updated" value={<Time value={task.updatedAt} />} />
// Renders: <time datetime="2024-05-01T10:30:00.000Z">01/05/2024</time>
```

The `<time>` element is semantic HTML — browsers, search engines, and assistive tools all understand it represents a date or time.

---

### KeyValuePair

Renders a `<dt>` / `<dd>` pair inside a `<div>` — the semantic HTML way to display label-and-value data like a definition list.

```tsx
function KeyValuePair({ label, value }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
```

Usage:

```tsx
<dl>
  <KeyValuePair label="Team"    value={task.team} />
  <KeyValuePair label="Owner"   value={task.owner} />
  <KeyValuePair label="Updated" value={<Time value={task.updatedAt} />} />
</dl>
```

The `value` prop is typed as `ReactNode` — so it can be a plain string, a number, or even another component like `<Time />`.

---

## Quick Reference

| Component | Library | What it renders | Key prop |
|---|---|---|---|
| `Text` | `wabi` | `<p>` with colour tone | `tone?: "default" \| "muted" \| "danger"` |
| `Button` | `wabi` | `<button>` with variant styling | `variant?: "primary" \| "secondary" \| "ghost"` |
| `Surface` | `wabi` | `<section>` card wrapper | `title?: string` |
| `Stack` | `wabi` | `<div>` vertical spacer | `gap?: number` |
| `SkeletonLine` | `wabi` | Animated loading placeholder line | — |
| `PageSkeleton` | `wabi` | Full loading state with `aria-busy` | `title: string` |
| `AppHeader` | `sabi` | `<header>` + `<nav>` top bar | — |
| `Time` | `sabi` | `<time>` with ISO + formatted display | `value: Date \| string` |
| `KeyValuePair` | `sabi` | `<dt>` / `<dd>` label-value pair | `label: string`, `value: ReactNode` |
