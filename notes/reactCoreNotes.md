> TODO: to be reviewed. As I already knew these concepts , so not reviewed this file yet.

# React Core Concepts

A quick reference guide to the essential building blocks of React — written for beginners.

---

## 1. JSX

JSX lets you write HTML-like syntax directly inside JavaScript/TypeScript. React compiles it to `React.createElement()` calls under the hood.

```tsx
// JSX — what you write
const element = <h1>Hello, World!</h1>;

// What React actually runs (you never write this)
const element = React.createElement("h1", null, "Hello, World!");

// JSX rules:
// - Must return a single root element (wrap in <> ... </> if needed)
// - Use className instead of class
// - Self-close tags with no children: <img />
const card = (
  <>
    <h2 className="title">My Card</h2>
    <img src="photo.jpg" alt="photo" />
  </>
);
```

---

## 2. Function Components

A component is just a function that returns JSX. The function name must start with a capital letter.

```tsx
// A simple function component
function Greeting() {
  return <h1>Hello, React!</h1>;
}

// Arrow function style (same thing)
const Greeting = () => {
  return <h1>Hello, React!</h1>;
};

// Use it like an HTML tag
const App = () => <Greeting />;
```

> **Common mistake:** Using a lowercase name like `<greeting />` — React will treat it as an HTML tag, not a component.

---

## 3. Props

Props are how you pass data into a component — like attributes on an HTML element. They flow **one way**: parent → child.

```tsx
// Define the shape of props with a type
type ButtonProps = {
  label: string;
  color?: string; // optional prop
};

// Receive props as the first argument
function Button({ label, color = "blue" }: ButtonProps) {
  return <button style={{ background: color }}>{label}</button>;
}

// Pass props like HTML attributes
const App = () => (
  <Button label="Click Me" color="green" />
);
```

> **Common mistake:** Trying to modify props inside a component — props are **read-only**.

---

## 4. Composition

Build complex UIs by nesting components inside each other — like assembling Lego bricks. Use the special `children` prop to pass JSX between tags.

```tsx
// A reusable Card "shell" that accepts any content
type CardProps = {
  children: React.ReactNode; // anything renderable
};

function Card({ children }: CardProps) {
  return <div className="card">{children}</div>;
}

// Compose: place any content inside the Card
function App() {
  return (
    <Card>
      <h2>Title</h2>         {/* these become children */}
      <p>Some description.</p>
    </Card>
  );
}
```

---

## 5. Conditional Rendering

Show or hide parts of the UI based on a condition. Two common patterns: `&&` (show or nothing) and the ternary `? :` (show one or the other).

```tsx
type Props = { isLoggedIn: boolean };

function Dashboard({ isLoggedIn }: Props) {
  return (
    <div>
      {/* && : renders only when condition is true */}
      {isLoggedIn && <p>Welcome back!</p>}

      {/* ternary: one branch or the other */}
      {isLoggedIn ? (
        <button>Logout</button>
      ) : (
        <button>Login</button>
      )}
    </div>
  );
}
```

> **Common mistake:** Using `0 && <p>...</p>` — if the left side is `0`, React renders the number `0`. Use `count > 0 && ...` instead.

---

## 6. Lists and Keys

Render arrays of data by mapping over them. Every item needs a unique `key` prop so React can track changes efficiently.

```tsx
type Fruit = { id: number; name: string };

const fruits: Fruit[] = [
  { id: 1, name: "Apple" },
  { id: 2, name: "Banana" },
  { id: 3, name: "Mango" },
];

function FruitList() {
  return (
    <ul>
      {fruits.map((fruit) => (
        // key must be unique among siblings
        <li key={fruit.id}>{fruit.name}</li>
      ))}
    </ul>
  );
}
```

> **Common mistake:** Using the array index as a key (`key={index}`) — this causes bugs when the list is reordered or filtered. Prefer a stable unique ID.

---

## 7. State with `useState`

State is a value that can change over time. When state changes, React re-renders the component with the new value.

```tsx
import { useState } from "react";

function Counter() {
  // [current value, function to update it]
  const [count, setCount] = useState(0); // 0 is the initial value

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
```

> **Common mistake:** Mutating state directly — `count++` won't trigger a re-render. Always call the setter: `setCount(count + 1)`.

📖 **For deeper coverage of `useState`, `useEffect`, `useContext`, and more — see `hooksNotes.md`.**

---

## 8. Synthetic Events

React wraps the browser's native events into a unified `SyntheticEvent`. The API looks the same, but it works consistently across all browsers.

```tsx
function Form() {
  // SyntheticEvent types are provided by React
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    console.log("Button clicked!", e.currentTarget);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("Input value:", e.target.value); // read input text
  };

  return (
    <div>
      <input onChange={handleChange} placeholder="Type something..." />
      <button onClick={handleClick}>Submit</button>
    </div>
  );
}
```

> **Common mistake:** Calling the handler instead of passing it — `onClick={handleClick()}` runs immediately on render. Use `onClick={handleClick}` (no parentheses).

---

## 9. Hooks Overview

Hooks are special functions that let you "hook into" React features (like state or lifecycle) from function components. All hooks start with `use`.

```tsx
import { useState, useEffect, useContext } from "react";

function Example() {
  const [data, setData] = useState(null); // manage state
  useEffect(() => { /* run side effects */ }, []); // lifecycle
  // useContext, useRef, useMemo, useCallback, and more...

  return <div>{/* ... */}</div>;
}
```

Rules of Hooks:
- Only call hooks **at the top level** of a component (not inside loops or if-statements)
- Only call hooks inside **React function components** (or custom hooks)

📖 **See `hooksNotes.md` for the full list of hooks with examples.**

---

## Quick Reference

| Concept | What it does | Key syntax |
|---|---|---|
| **JSX** | HTML-like syntax in JS | `<div className="box">` |
| **Function Component** | Returns JSX; name starts with capital | `function Card() { return <div/> }` |
| **Props** | Pass data parent → child | `<Card title="Hi" />` |
| **Composition** | Nest components; pass children | `<Card><p>text</p></Card>` |
| **Conditional — &&** | Render only if true | `{isOpen && <Modal />}` |
| **Conditional — ternary** | Render one of two | `{ok ? <A /> : <B />}` |
| **Lists** | Map array to JSX | `items.map(i => <li key={i.id}>)` |
| **Key** | Unique ID for list items | `key={item.id}` |
| **useState** | Local state in a component | `const [val, setVal] = useState(0)` |
| **Synthetic Events** | React's cross-browser event wrapper | `onClick`, `onChange`, `onSubmit` |
| **Hooks** | Functions to use React features | `useState`, `useEffect`, `useRef`… |
