# React Hooks Notes

Hooks are functions that let you add React features to a component.
They always start with `use`.

Note : Read ComponentLifecycleNotes.md fiile first to understand the stages of a component's life, then come back here to see how hooks fit into those stages.

## Rules of Hooks

There are two rules you must always follow. React will break if you don't.

**1. Only call hooks at the top level**

Never call hooks inside `if`, `for`, or nested functions. React relies on hooks always being called in the same order every render.

```tsx
// ❌ Wrong
if (isLoggedIn) {
  const [name, setName] = useState('');
}

// ✅ Correct
const [name, setName] = useState('');
if (isLoggedIn) {
  // use name here
}
```

**2. Only call hooks inside React functions**

Hooks only work inside function components or other custom hooks — not in regular JavaScript functions, classes, or event handlers.

```tsx
// ❌ Wrong — regular function
function calculate() {
  const [value, setValue] = useState(0); // won't work
}

// ✅ Correct — React component
function MyComponent() {
  const [value, setValue] = useState(0);
}
```

---

```
State hooks     → remember values
Effect hooks    → sync with the outside world
Ref hooks       → hold a value without re-rendering
Performance     → skip expensive work
Context hooks   → read shared data
Reducer hooks   → manage complex state
Custom hooks    → reuse logic across components
```

---

## useState — remember a value

The most common hook. Stores a value and re-renders the component when it changes.

```tsx
const [count, setCount] = useState(0);

<button onClick={() => setCount(count + 1)}>
  Clicked {count} times
</button>
```

Use it for anything that should update the UI when it changes: form inputs, toggles, counters.

---

## useEffect — sync with the outside world

Runs code after the component renders. Used for fetching data, timers, subscriptions — anything outside React.

The dependency array `[]` controls *when* the effect runs, which maps to the three lifecycle stages.

### Mount — run once when the component appears

Pass an empty array `[]`. The effect runs once after the first render and never again.

```tsx
useEffect(() => {
  console.log('Component mounted — fetch initial data, start a timer, etc.');
}, []);
```

### Update — run when a value changes

Pass the value in the array. The effect re-runs every time that value changes.

```tsx
useEffect(() => {
  console.log('query changed, fetch new results');
  fetchResults(query);
}, [query]); // re-runs whenever query changes
```

### Unmount — cleanup when the component is removed

Return a function from the effect. React calls it when the component leaves the screen (and also before re-running the effect on updates).

```tsx
useEffect(() => {
  const id = setInterval(() => console.log('tick'), 1000);

  return () => {
    clearInterval(id); // runs on unmount — stops the timer
  };
}, []);
```

### All three together

```tsx
useEffect(() => {
  // Mount + Update: runs on mount, and again when query changes
  let cancelled = false;

  fetch(`/api/search?q=${query}`)
    .then(res => res.json())
    .then(data => {
      if (!cancelled) setResults(data);
    });

  // Unmount + before next update: cancel the stale request
  return () => { cancelled = true; };
}, [query]);
```

### Quick cheat sheet

| Dependency array | When effect runs |
|---|---|
| No array | After every render |
| `[]` | Once on mount only |
| `[value]` | On mount + every time `value` changes |
| Returned function | On unmount + before each re-run |

---


## useRef — hold a value without re-rendering

> TODO: Add notes

---

## useMemo — skip expensive recalculations

`useMemo` caches the result of a calculation and only recomputes it when its dependencies change.

```tsx
const total = useMemo(() => {
  return items.reduce((sum, item) => sum + item.price, 0);
}, [items]); // only recalculates when items changes
```

Without `useMemo`, `total` would be recalculated on every render — even if `items` did not change.

Use it when a calculation is slow or the result is used in many places.

---

## useCallback — skip recreating a function

Every render creates a new version of every function inside a component. `useCallback` keeps the same function reference as long as its dependencies do not change.

```tsx
const handleClick = useCallback(() => {
  console.log('clicked', id);
}, [id]); // same function reference unless id changes
```

This matters when you pass a function as a prop to a child component — without `useCallback`, the child re-renders every time the parent renders, even if nothing changed.

**Simple rule of thumb:**
- `useMemo` → cache a **value**
- `useCallback` → cache a **function**

---

## useContext — read shared data without prop drilling

Context lets you share data with any component in the tree without passing it down through every level as props.

```tsx
// 1. Create the context
const ThemeContext = createContext('light');

// 2. Wrap your tree with a Provider
function App() {
  return (
    <ThemeContext.Provider value="dark">
      <Toolbar />
    </ThemeContext.Provider>
  );
}

// 3. Read the value anywhere inside the tree
function Toolbar() {
  const theme = useContext(ThemeContext);
  return <p>Current theme: {theme}</p>;
}
```

Use it for app-wide values like theme, current user, or language.

---

## useReducer — manage complex state

`useReducer` does the same job as `useState` — it stores state. The difference is *how you update it*.

With `useState` you call a setter directly. With `useReducer` you describe *what happened* (an action), and a separate function (the reducer) decides what the new state should be.

---

### The problem with useState for complex state

Imagine a form with several related fields. With `useState` you end up with many separate setters and it gets hard to track what's changing what:

```tsx
const [name, setName] = useState('');
const [email, setEmail] = useState('');
const [submitting, setSubmitting] = useState(false);
const [error, setError] = useState(null);

// Submit button needs to touch all of them:
setSubmitting(true);
setError(null);
// ... later:
setSubmitting(false);
setError('Something went wrong');
```

The update logic is scattered everywhere.

---

### The solution — useReducer

You move all the update logic into one function called the **reducer**. The component just says *what happened*, and the reducer decides *what changes*.

Three new words to know:
- **state** — the current data (same as useState)
- **action** — an object describing what happened (e.g. `{ type: 'submit' }`)
- **dispatch** — the function you call to send an action
- **reducer** — a function that receives the current state + action and returns the new state

```tsx
// Step 1: Define the reducer — all update logic lives here
function reducer(state, action) {
  switch (action.type) {
    case 'submit':
      return { ...state, submitting: true, error: null };

    case 'success':
      return { ...state, submitting: false };

    case 'error':
      return { ...state, submitting: false, error: action.message };

    default:
      return state;
  }
}

// Step 2: Use it in your component
function ContactForm() {
  const [state, dispatch] = useReducer(reducer, {
    submitting: false,
    error: null,
  });

  function handleSubmit() {
    dispatch({ type: 'submit' }); // 1. tell the reducer "submit started" → sets submitting: true

    sendData()                    // 2. sendData() returns a Promise (it's an async operation)
      .then(() => {               // 3. if sendData succeeded (no error)...
        dispatch({ type: 'success' }); //    tell reducer "it worked" → sets submitting: false
      })
      .catch(err => {             // 4. if sendData failed (threw an error)...
        dispatch({ type: 'error', message: err.message }); // tell reducer "it failed" → sets error message
      });
  }

  return (
    <div>
      {state.error && <p>{state.error}</p>}
      <button onClick={handleSubmit} disabled={state.submitting}>
        {state.submitting ? 'Sending...' : 'Send'}
      </button>
    </div>
  );
}
```

The component never touches state directly. It just dispatches events. The reducer handles everything.

---

### useState vs useReducer — when to use which

| Situation | Use |
|---|---|
| One simple value (toggle, counter, input) | `useState` |
| Several values that update together | `useReducer` |
| Next state depends on the previous state in complex ways | `useReducer` |
| You want all update logic in one place | `useReducer` |

---

## Custom Hooks — reuse logic across components

A custom hook is just a function that starts with `use` and calls other hooks inside it.
It lets you extract repeated logic so multiple components can share it.

```tsx
// Extract fetch logic into a reusable hook
function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      });
  }, [url]);

  return { data, loading };
}

// Use it in any component
function PostList() {
  const { data: posts, loading } = useFetch('/api/posts');
  if (loading) return <p>Loading...</p>;
  return posts.map(post => <p key={post.id}>{post.title}</p>);
}

function UserList() {
  const { data: users, loading } = useFetch('/api/users');
  if (loading) return <p>Loading...</p>;
  return users.map(user => <p key={user.id}>{user.name}</p>);
}
```

In fact, this is exactly what React Query's `useQuery` is — a custom hook that handles fetch, cache, loading, and error for you.

---

## All Hooks at Each Lifecycle Stage

### useState

```tsx
// Mount   → initialized with the default value (0)
// Update  → calling setCount triggers a re-render with the new value
// Unmount → state is discarded
const [count, setCount] = useState(0);
```

### useEffect

```tsx
// Mount   → runs once after first render
// Update  → re-runs whenever `query` changes
// Unmount → returned cleanup function runs
useEffect(() => {
  const id = startPolling(query);
  return () => stopPolling(id); // cleanup
}, [query]);
```

### useMemo

```tsx
// Mount   → computed once from initial values
// Update  → recomputed only when `items` changes, skipped otherwise
// Unmount → cached value is discarded
const total = useMemo(() => {
  return items.reduce((sum, item) => sum + item.price, 0);
}, [items]);
```

### useCallback

```tsx
// Mount   → function created once
// Update  → same function reference kept unless `id` changes
// Unmount → function is discarded
const handleClick = useCallback(() => {
  console.log('clicked', id);
}, [id]);
```

### useContext

```tsx
// Mount   → reads the current context value from the nearest Provider
// Update  → re-renders automatically when the context value changes
// Unmount → unsubscribes from context updates
const theme = useContext(ThemeContext);
```

### useReducer

```tsx
// Mount   → state initialized to { count: 0 }
// Update  → dispatch triggers reducer, new state causes re-render
// Unmount → state is discarded
const [state, dispatch] = useReducer(reducer, { count: 0 });
```

### Custom Hook (useFetch)

```tsx
// Mount   → fetch starts, loading = true
// Update  → url changes → effect re-runs, new fetch starts, old cancelled
// Unmount → cleanup sets cancelled = true, stale response is ignored
function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch(url)
      .then(res => res.json())
      .then(data => { if (!cancelled) { setData(data); setLoading(false); } });
    return () => { cancelled = true; };
  }, [url]);

  return { data, loading };
}
```

---



