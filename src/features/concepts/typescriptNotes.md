> TODO: to be reviewed. As I already knew these concepts , so not reviewed this file yet.

# TypeScript Notes

TypeScript is JavaScript with a type system — it catches mistakes **before** your code even runs.

---

## 1. Why TypeScript?

JavaScript lets bugs slip through at runtime (when users see them). TypeScript catches them at **compile time** (when you're still coding).

```ts
// JavaScript — no error until runtime
function greet(name) {
  return "Hello, " + name.toUpperCase();
}
greet(42); // 💥 Runtime crash: name.toUpperCase is not a function

// TypeScript — error caught immediately
function greet(name: string) {
  return "Hello, " + name.toUpperCase();
}
greet(42); // ❌ Compile error: Argument of type 'number' is not assignable to parameter of type 'string'
```

---

## 2. Type Annotations

You explicitly tell TypeScript what type a variable, parameter, or return value should be.

```ts
let age: number = 25;
let username: string = "alice";
let isLoggedIn: boolean = true;

// Function with annotated parameter and return type
function add(a: number, b: number): number {
  return a + b;
}

age = "twenty"; // ❌ Error: Type 'string' is not assignable to type 'number'
```

---

## 3. Type Inference

You don't always need to annotate — TypeScript figures out the type from the value you assign.

```ts
let score = 100;       // TS infers: number
let city = "London";   // TS infers: string
let active = true;     // TS infers: boolean

score = "ninety-nine"; // ❌ Error: Type 'string' is not assignable to type 'number'
// TS already knew 'score' was a number from the initial value
```

> **Rule of thumb:** Let inference work for simple values. Use explicit annotations for function parameters and return types.

---

## 4. Interfaces

An interface describes the **shape** of an object — what properties it must have and their types.

```ts
interface User {
  id: number;
  name: string;
  email: string;
  isAdmin?: boolean; // '?' means optional
}

const alice: User = {
  id: 1,
  name: "Alice",
  email: "alice@example.com",
};

const bob: User = {
  id: 2,
  name: "Bob",
  // ❌ Error: Property 'email' is missing in type '{ id: number; name: string; }'
};
```

---

## 5. Type Aliases

The `type` keyword lets you name any type — objects, unions, primitives, etc. More flexible than interface.

```ts
type Point = {
  x: number;
  y: number;
};

type ID = string | number; // can be either — interfaces can't do this

const origin: Point = { x: 0, y: 0 };
const userId: ID = "abc-123"; // ✅ string
const postId: ID = 42;        // ✅ number
```

---

## 6. Interface vs Type

Both describe object shapes. Here's when to use which:

| | `interface` | `type` |
|---|---|---|
| Object shapes | ✅ Preferred | ✅ Works |
| Extend / merge | ✅ `extends`, declaration merging | ✅ `&` intersection |
| Unions & intersections | ❌ Can't do `A \| B` directly | ✅ `type ID = string \| number` |
| Primitives & tuples | ❌ | ✅ `type Pair = [string, number]` |
| React props / API shapes | ✅ Common convention | ✅ Also fine |

> **Simple rule:** Use `interface` for object/class shapes. Use `type` for everything else (unions, primitives, tuples).

---

## 7. Union Types

A union (`A | B`) means a value can be **one of several types**.

```ts
// Parameter can be a string OR a number
function printId(id: string | number) {
  if (typeof id === "string") {
    console.log("String ID:", id.toUpperCase());
  } else {
    console.log("Numeric ID:", id.toFixed(0));
  }
}

printId("abc-99"); // ✅
printId(101);      // ✅
printId(true);     // ❌ Error: Argument of type 'boolean' is not assignable
```

---

## 8. Literal Unions

Instead of a broad type like `string`, you lock down the **exact values** that are allowed.

```ts
type Role = "admin" | "user" | "guest";

function setRole(role: Role) {
  console.log("Role set to:", role);
}

setRole("admin");  // ✅
setRole("user");   // ✅
setRole("owner");  // ❌ Error: Argument of type '"owner"' is not assignable to type 'Role'
```

This is great for status fields, button variants, themes — anything with a fixed set of options.

---

## 9. Template Literal Types

You can build string types by **combining** other string types — like template literals in JS but at the type level.

```ts
type Direction = "top" | "bottom" | "left" | "right";
type CSSProperty = `margin-${Direction}`;
// Result: "margin-top" | "margin-bottom" | "margin-left" | "margin-right"

function setMargin(property: CSSProperty, value: string) {
  console.log(`${property}: ${value}`);
}

setMargin("margin-top", "16px");    // ✅
setMargin("margin-center", "8px"); // ❌ Error: not assignable to type 'CSSProperty'
```

---

## 10. Generics

Generics let you write **reusable code** that works with any type — you pass the type in like a parameter.

```ts
// Without generics — only works for strings
function firstString(arr: string[]): string {
  return arr[0];
}

// With generics — works for any type
function first<T>(arr: T[]): T {
  return arr[0];
}

const a = first([1, 2, 3]);         // T = number → returns number
const b = first(["x", "y", "z"]);  // T = string → returns string
const c = first([true, false]);     // T = boolean → returns boolean
```

Think of `<T>` as a placeholder that gets filled in with the real type when the function is called.

---

## 11. `as const`

`as const` **freezes** a value so TypeScript treats it as exact literal types, not broad ones.

```ts
// Without as const — TS infers string[], loses exact values
const roles = ["admin", "user", "guest"];
// type: string[]  ← too broad

// With as const — TS knows the exact tuple of literal values
const ROLES = ["admin", "user", "guest"] as const;
// type: readonly ["admin", "user", "guest"]  ← exact!

type Role = typeof ROLES[number]; // "admin" | "user" | "guest"

// Great for config objects too
const CONFIG = {
  theme: "dark",
  lang: "en",
} as const;
// CONFIG.theme is "dark", not just string
```

---

## 12. `satisfies`

`satisfies` checks that a value **matches a type** without changing how TypeScript narrows the value's specifics.

```ts
type Theme = "light" | "dark";

type AppConfig = {
  theme: Theme;
  maxRetries: number;
};

// Without satisfies — TS widens the type to AppConfig, losing specifics
const config1: AppConfig = { theme: "dark", maxRetries: 3 };
config1.theme; // type: Theme (just "light" | "dark", not the exact "dark")

// With satisfies — TS validates the shape AND keeps exact types
const config2 = {
  theme: "dark",
  maxRetries: 3,
} satisfies AppConfig;

config2.theme; // type: "dark"  ← TS still knows the exact value!

// Still catches mistakes:
const config3 = {
  theme: "neon", // ❌ Error: Type '"neon"' is not assignable to type 'Theme'
} satisfies AppConfig;
```

> **When to use:** Use `satisfies` when you want type-safety checks **and** you need TS to remember the exact values (e.g., for autocomplete or narrowing downstream).

---

## Quick Reference

| Feature | Syntax | What it does |
|---|---|---|
| Type annotation | `let x: number` | Explicitly declare a variable's type |
| Type inference | `let x = 10` | TS guesses the type from the value |
| Interface | `interface User { name: string }` | Describe object shape (preferred for objects) |
| Type alias | `type ID = string \| number` | Name any type, including unions |
| Union | `string \| number` | Value can be one of several types |
| Literal union | `"admin" \| "user"` | Value must be one of these exact strings |
| Template literal | `` `margin-${Direction}` `` | Build string types from parts |
| Generic | `function f<T>(x: T): T` | Reusable code for any type |
| `as const` | `["a", "b"] as const` | Freeze value; TS uses exact literal types |
| `satisfies` | `value satisfies Type` | Validate shape without losing type specifics |
