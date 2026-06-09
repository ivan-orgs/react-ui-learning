# Component Lifecycle Notes

A React **component** has three stages in its life: **mounting**, **updating**, and **unmounting**.

```
Component Mounts → Component Updates (0 or more times) → Component Unmounts
```

Note and Don't confuse : These are things that happen to the **component** — not to `useEffect`.
`useEffect` is a separate hook that *listens* to these stages and lets you run code at each one.

Think of it this way:

```
Component lifecycle  →  what happens to the component (appear, change, disappear)
useEffect            →  your code that reacts to those moments
```

---

## Stage 1: Component Mounts

**What it means for the component:**
The component appears on the screen for the first time. React runs your function, builds the JSX, and inserts it into the DOM.

```tsx
function Greeting() {
  return <h1>Hello!</h1>; // component mounts → this appears on screen
}
```

**How useEffect hooks into this:**
Pass an empty array `[]`. The effect runs once, right after the component is inserted into the DOM.

```tsx
function Greeting() {
  // The COMPONENT mounts → useEffect with [] fires once after that
  useEffect(() => {
    console.log('useEffect ran — component just mounted');
    // good place to: fetch initial data, start a timer, add an event listener
  }, []); // ← empty array = "only run after the component mounts"

  return <h1>Hello!</h1>;
}
```

> The `[]` does not mean "mount". It means "no dependencies — never re-run".
> It *happens* to line up with mount because it runs once and never again.

---

## Stage 2: Component Updates

**What it means for the component:**
State or props changed. React re-runs your function and re-renders the UI with the new values. The component stays on screen — it just refreshes.

```tsx
function Counter() {
  const [count, setCount] = useState(0);

  // Clicking the button changes state → component RE-RENDERS (updates)
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

**How useEffect hooks into this:**
Pass the value in the array. The effect re-runs every time that value changes — after each re-render where the value is different.

```tsx
function Counter() {
  const [count, setCount] = useState(0);

  // The COMPONENT updates (count changes) → useEffect with [count] fires after that
  useEffect(() => {
    console.log('useEffect ran — count just changed to', count);
    // good place to: sync with an external system, log analytics
  }, [count]); // ← [count] = "re-run whenever count changes"

  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

> Note: this effect also runs on mount (first render), because that is when
> `count` gets its initial value. Mount is just the first update.

**When does the cleanup run during an update?**

If your effect returns a cleanup function, React calls it **before re-running the effect** on the next update. The order every time a dependency changes is:

```
1. Dependency changes → component re-renders
2. Cleanup from the PREVIOUS effect runs  ← cleans up the old effect
3. The NEW effect runs
```

Example — a timer that resets whenever `delay` changes:

```tsx
function Timer({ delay }) {
  useEffect(() => {
    console.log(`Starting timer with delay: ${delay}`);
    const id = setInterval(() => console.log('tick'), delay);

    return () => {
      console.log(`Clearing old timer (delay was: ${delay})`);
      clearInterval(id); // ← cleanup runs BEFORE the next effect starts
    };
  }, [delay]);
}
```

If `delay` changes from `1000` to `500`:
1. Component re-renders
2. Cleanup runs → `clearInterval` stops the old 1000ms timer
3. New effect runs → starts a fresh 500ms timer

Without the cleanup, both timers would run at the same time.

---

## Stage 3: Component Unmounts

**What it means for the component:**
The component is removed from the screen — you navigated away, or a condition hid it. React removes it from the DOM.

```tsx
function App() {
  const [show, setShow] = useState(true);

  return (
    <>
      <button onClick={() => setShow(false)}>Hide</button>
      {show && <Timer />}  {/* clicking Hide → Timer component UNMOUNTS */}
    </>
  );
}
```

**The problem without cleanup:**

When the component mounts, `useEffect` starts a timer. When the component unmounts, the timer keeps running — because nothing told it to stop.

```tsx
function Timer() {
  useEffect(() => {
    // Component mounts → timer starts
    const id = setInterval(() => {
      console.log('tick'); // ⚠️ keeps printing even after Timer is removed!
    }, 1000);

    // No cleanup → timer leaks
  }, []);

  return <p>Timer is running...</p>;
}
```

Even after `<Timer />` disappears from the screen, `setInterval` is still alive in memory, still firing every second. This is a **memory leak**.

**The fix — return a cleanup function:**

`useEffect` lets you return a function. React calls that returned function when the component unmounts. That is the cleanup.

```tsx
function Timer() {
  useEffect(() => {
    // Component mounts → timer starts
    const id = setInterval(() => {
      console.log('tick');
    }, 1000);

    // Return a function → React calls this when the component unmounts
    return () => {
      clearInterval(id); // ✅ timer is stopped, no more ticks
    };
  }, []);

  return <p>Timer is running...</p>;
}
```

Step by step:
1. `<Timer />` appears — `useEffect` runs — timer starts
2. `<Timer />` is hidden/removed — React calls the returned function — `clearInterval(id)` — timer stops

The cleanup function is not something you call yourself. You just return it, and React knows to call it at the right time.

> **Tip:** Think of it as a pair.
> Effect = "start something". Cleanup = "stop that same thing".

---

## Putting It All Together

**The scenario:** A search page. The user types in a search box. The `query` prop changes every time they type. Results are fetched from an API.

```tsx
function SearchResults({ query }) {
  const [results, setResults] = useState([]);

  useEffect(() => {
    let cancelled = false;  // a flag to track if this fetch is still relevant

    fetch(`/api/search?q=${query}`)
      .then(res => res.json())
      .then(data => {
        if (!cancelled) setResults(data); // only update state if still relevant
      });

    return () => {
      cancelled = true; // mark this fetch as outdated
    };
  }, [query]); // re-run whenever query changes

  return results.map(r => <p key={r.id}>{r.title}</p>);
}
```

**Step-by-step flow:**

**Step 1 — Component mounts (user visits the page, query = "react")**
- Component appears on screen
- `useEffect` runs for the first time
- `cancelled = false` — the fetch is fresh
- Fetch starts: `GET /api/search?q=react`
- Fetch finishes → `cancelled` is still `false` → `setResults(data)` → component re-renders with results

**Step 2 — Component updates (user types again, query changes to "redux")**
- React sees `query` changed, so it re-runs the effect
- But first: the **cleanup from the previous effect runs** → sets `cancelled = true`
- This means: if the old `react` fetch hasn't finished yet, its result will be ignored (`if (!cancelled)` is now false)
- Now the new effect runs fresh: `cancelled = false` again
- New fetch starts: `GET /api/search?q=redux`
- Fetch finishes → `cancelled` is still `false` → `setResults(data)` → page updates

**Step 3 — Component unmounts (user navigates away)**
- React calls the cleanup one final time → `cancelled = true`
- If a fetch was still in flight, its result is ignored — it won't try to call `setResults` on a component that no longer exists

**Why `cancelled` matters:**
Without it, if "react" fetches slowly and finishes *after* "redux" starts, the page would briefly show "react" results — even though the user already typed "redux". This is a **stale result bug**. The `cancelled` flag prevents that.

---


## Quick Reference

| Stage | What happens to the component | How useEffect reacts |
|---|---|---|
| **Mount** | Appears on screen for the first time | Effect with `[]` runs once after insert |
| **Update** | State or props change, re-renders | Effect with `[dep]` runs after each change |
| **Unmount** | Removed from the screen | Returned cleanup function runs |

---

## Why the Cleanup Function Matters

Without cleanup you can get:

- **Memory leaks** — timers or subscriptions still running after the component is gone
- **Stale updates** — a slow fetch from an old query updates state after a new query has started

The cleanup return is React's way of saying "undo whatever you did when this effect ran".
