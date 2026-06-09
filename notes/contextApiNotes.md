# Context API Notes

## Wrapping useContext in a custom hook

Instead of calling `useContext` directly in every component, you wrap it in a custom hook. This gives two benefits: a cleaner import, and a clear error if the hook is used outside its Provider.

**Without the wrapper — every component does this:**

```tsx
import { useContext } from 'react';
import { TaskContext } from '../context/TaskContext';

function PriorityWidget() {
  const value = useContext(TaskContext);
  if (!value) return null; // must remember to handle null every time
  const { task } = value;
}
```

**With the wrapper — written once in the context file:**

```tsx
// TaskContext.tsx
export function useTaskContext() {
  const value = useContext(TaskContext);

  if (!value) {
    // Throws a helpful error if someone forgets to wrap with <TaskProvider>
    throw new Error('useTaskContext must be used inside <TaskProvider>');
  }

  return value;
}
```

**Now every component just does:**

```tsx
function PriorityWidget() {
  const { task } = useTaskContext(); // clean, safe, no null check needed
}
```

If a developer accidentally uses `useTaskContext()` outside a `<TaskProvider>`, they get a clear error message immediately instead of a confusing `undefined` crash somewhere deeper.

---

## Two contexts on one page — and why

The task detail page uses two separate contexts stacked together:

```tsx
<TaskProvider task={data} loading={isLoading} error={error}>
  <ReviewUIProvider>
    <TaskContent />
  </ReviewUIProvider>
</TaskProvider>
```

| Context | What it holds | Type of state |
|---|---|---|
| `TaskContext` | `task`, `loading`, `error` | Server data — comes from the API |
| `ReviewUIContext` | `openSection`, `panelTab`, `resetUI` | UI-only — nothing to do with the server |

**Why not put everything in one context?**

When a context's `value` changes, **every component that calls `useContext` on that context re-renders** — regardless of which part of the value that component actually uses.

React does not look at which property you destructured. It only checks: did the context value object change? If yes, re-render all consumers.

So if you merged both contexts into one:

```tsx
// ❌ One big merged context
<AppContext.Provider value={{ task, loading, error, openSection, panelTab, resetUI }}>
```

This is what happens when the user just switches a tab (`panelTab` changes):

```
1. User clicks "Log" tab
2. setPanelTab('log') is called
3. The context value object is recreated — it now has panelTab: 'log'
4. React sees the value changed
5. Every consumer re-renders:
   - PriorityWidget  ← only uses 'task', did not need to re-render
   - ConfidenceWidget ← only uses 'task', did not need to re-render
   - ChecksTable      ← only uses 'task', did not need to re-render
   - SidePanel        ← actually needed this re-render ✅
```

The widgets re-render for no reason — they read the same `task` value as before, but React does not know that without you telling it.

**Keeping them separate fixes this:**

```tsx
// ✅ Two separate contexts
<TaskProvider ...>        {/* holds task, loading, error */}
  <ReviewUIProvider>     {/* holds openSection, panelTab, resetUI */}
    ...
  </ReviewUIProvider>
</TaskProvider>
```

Now when `panelTab` changes, only `ReviewUIContext` value changes. Components that only consume `TaskContext` (`PriorityWidget`, `ConfidenceWidget` etc.) are untouched — they never subscribed to `ReviewUIContext` in the first place.


```tsx
// A widget that only needs task data — imports only TaskContext
function PriorityWidget() {
  const { task } = useTaskContext();
}

// A button that only switches tabs — imports only ReviewUIContext
function SidePanel() {
  const { panelTab, setPanelTab } = useReviewUI();
}
```

Each context has one clear responsibility. Changes in one do not affect consumers of the other.
