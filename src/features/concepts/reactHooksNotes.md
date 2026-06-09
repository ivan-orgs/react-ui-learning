# React hooks notes

Hooks are functions that start with `use`.

Call hooks at the top of a React function component or another custom hook. Do not call hooks inside `if` blocks, loops, or nested functions.

## useState

Use `useState` when a component needs to remember a value and re-render when that value changes.

```tsx
import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount((current) => current + 1)}>
      Count: {count}
    </button>
  );
}
```

Syntax:

```tsx
const [value, setValue] = useState(initialValue);
```

## useEffect

Use `useEffect` when a component needs to synchronize with something outside rendering, such as timers, document title updates, subscriptions, or network-style side effects.

```tsx
import { useEffect, useState } from "react";

function Clock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);

    return () => window.clearInterval(id);
  }, []);

  return <p>{now.toLocaleTimeString()}</p>;
}
```

Syntax:

```tsx
useEffect(() => {
  // run after render

  return () => {
    // optional cleanup
  };
}, [dependencies]);
```

## useRef

Use `useRef` when you need to keep a mutable value without causing a re-render, or when you need a reference to a DOM element.

```tsx
import { useRef } from "react";

function SearchBox() {
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <>
      <input ref={inputRef} />
      <button onClick={() => inputRef.current?.focus()}>Focus</button>
    </>
  );
}
```

Syntax:

```tsx
const ref = useRef(initialValue);
```

Read or write the current value with:

```tsx
ref.current
```

## useContext

Use `useContext` when many components need shared data without passing props through every level.

```tsx
import { createContext, useContext } from "react";

const ThemeContext = createContext("light");

function Toolbar() {
  const theme = useContext(ThemeContext);

  return <p>Current theme: {theme}</p>;
}
```

Syntax:

```tsx
const value = useContext(SomeContext);
```

The component must be rendered inside the matching provider if it needs a custom value:

```tsx
<SomeContext.Provider value={value}>
  <Child />
</SomeContext.Provider>
```

## useMemo

Use `useMemo` when you want to cache a calculated value between renders.

```tsx
import { useMemo } from "react";

function TaskCount({ tasks }: { tasks: string[] }) {
  const total = useMemo(() => tasks.length, [tasks]);

  return <p>Total tasks: {total}</p>;
}
```

Syntax:

```tsx
const memoizedValue = useMemo(() => {
  return expensiveCalculation(input);
}, [input]);
```

## useCallback

Use `useCallback` when you want to cache a function between renders, often before passing it to a child component.

```tsx
import { useCallback, useState } from "react";

function TaskActions() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectTask = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  return <button onClick={() => selectTask("TASK-101")}>{selectedId ?? "Select"}</button>;
}
```

Syntax:

```tsx
const memoizedFunction = useCallback(() => {
  doSomething(value);
}, [value]);
```

## Custom hooks

Use a custom hook when you want to reuse stateful logic across components.

Custom hooks:

- Start with `use`.
- Can call other hooks.
- Return data, functions, or both.
- Follow the same hook rules as components.

```tsx
import { useEffect, useState } from "react";

function useTicker() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  return now;
}

function HeaderClock() {
  const now = useTicker();

  return <span>{now.toLocaleTimeString()}</span>;
}
```

Syntax:

```tsx
function useSomething() {
  // call hooks here
  return something;
}
```
