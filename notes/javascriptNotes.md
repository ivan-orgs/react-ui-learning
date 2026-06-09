> TODO: to be reviewed. As I already knew these concepts , so not reviewed this file yet.

# JavaScript Core Concepts — Beginner Notes

A quick-reference guide to the JavaScript patterns you'll use every day in React and modern JS development.

---

## 1. Variables — `var`, `let`, `const`

JavaScript gives you three ways to declare variables. In modern code, you'll almost never use `var`.

```js
// var — function-scoped, can be re-declared. Avoid it.
var name = "Alice";
var name = "Bob"; // no error, confusing!

// let — block-scoped, can be reassigned. Use for values that change.
let count = 0;
count = 1; // ✅ OK

// const — block-scoped, cannot be reassigned. Use this by default.
const PI = 3.14;
// PI = 3; // ❌ Error

// const with objects/arrays: the reference is fixed, but contents can change
const user = { name: "Alice" };
user.name = "Bob"; // ✅ OK — we changed a property, not the variable itself
```

> **Rule of thumb:** Start with `const`. Switch to `let` only if you need to reassign. Never use `var`.

---

## 2. Functions — Declaration vs Arrow Functions

Both do the same job, but arrow functions are shorter and handle `this` differently (important in React).

```js
// Function Declaration — has its own 'this', can be called before it's defined
function greet(name) {
  return "Hello, " + name;
}

// Arrow Function — shorter syntax, no own 'this' (preferred in React)
const greet = (name) => "Hello, " + name;

// Single param: parentheses optional
const double = n => n * 2;

// Multiple lines: need curly braces and explicit return
const add = (a, b) => {
  const result = a + b;
  return result;
};

console.log(greet("Alice")); // "Hello, Alice"
console.log(double(5));      // 10
```

---

## 3. Array Operations — `map`, `filter`, `find`, `reduce`

These methods let you transform and query arrays without writing loops. They don't mutate the original array.

```js
const numbers = [1, 2, 3, 4, 5];

// map — transform every item, returns a new array of the same length
const doubled = numbers.map(n => n * 2);
// [2, 4, 6, 8, 10]

// filter — keep only items that match a condition
const evens = numbers.filter(n => n % 2 === 0);
// [2, 4]

// find — return the FIRST item that matches (or undefined)
const firstBig = numbers.find(n => n > 3);
// 4

// reduce — fold the array into a single value
const sum = numbers.reduce((total, n) => total + n, 0);
// 15  (0 is the starting value)
```

---

## 4. Object Operations — Spread, `Object.keys`, `Object.entries`

These tools let you copy, merge, and loop over objects cleanly.

```js
const user = { name: "Alice", age: 25 };

// Spread (...) — copy an object or merge two objects
const updatedUser = { ...user, age: 26 };
// { name: "Alice", age: 26 }  (original unchanged)

const extra = { role: "admin" };
const fullUser = { ...user, ...extra };
// { name: "Alice", age: 25, role: "admin" }

// Object.keys — get an array of the keys
Object.keys(user); // ["name", "age"]

// Object.entries — get an array of [key, value] pairs
Object.entries(user); // [["name", "Alice"], ["age", 25]]

// Useful for looping:
Object.entries(user).forEach(([key, value]) => {
  console.log(`${key}: ${value}`);
});
// name: Alice
// age: 25
```

---

## 5. Destructuring — Arrays and Objects

Destructuring lets you unpack values from arrays or objects into variables in one line.

```js
// --- Object Destructuring ---
const user = { name: "Alice", age: 25, role: "admin" };

// Basic
const { name, age } = user;
console.log(name); // "Alice"

// Rename while destructuring
const { name: userName } = user;
console.log(userName); // "Alice"

// Default value if the key doesn't exist
const { country = "USA" } = user;
console.log(country); // "USA"

// --- Array Destructuring ---
const colors = ["red", "green", "blue"];

// Basic — order matters
const [first, second] = colors;
console.log(first);  // "red"
console.log(second); // "green"

// Skip items with a comma
const [, , third] = colors;
console.log(third); // "blue"

// Swap two variables cleanly
let a = 1, b = 2;
[a, b] = [b, a];
// a = 2, b = 1
```

---

## 6. Spread and Rest — `...`

The `...` syntax has two jobs depending on where you use it.

### Spread — expand something into individual pieces

```js
// Spread an array into another array
const a = [1, 2, 3];
const b = [...a, 4, 5]; // [1, 2, 3, 4, 5]

// Spread an object into another object (seen a lot in React state updates)
const user = { name: 'Alice', age: 25 };
const updated = { ...user, age: 26 }; // { name: 'Alice', age: 26 }

// Spread an array as function arguments
function add(x, y, z) { return x + y + z; }
const nums = [1, 2, 3];
add(...nums); // same as add(1, 2, 3) → 6
```

### Rest — collect remaining items into one variable

Rest is the opposite — it *gathers* leftover values into an array.

```js
// Rest in function parameters — collect any number of arguments
function sum(...numbers) {
  return numbers.reduce((total, n) => total + n, 0);
}
sum(1, 2, 3, 4); // 10  — numbers = [1, 2, 3, 4]

// Rest in destructuring — collect what's left
const [first, ...rest] = [10, 20, 30, 40];
// first = 10,  rest = [20, 30, 40]

const { name, ...others } = { name: 'Alice', age: 25, role: 'admin' };
// name = 'Alice',  others = { age: 25, role: 'admin' }
```

> **Simple rule:** `...` before a value = **spread** (expand it out). `...` in a parameter/pattern = **rest** (collect the remainder).

---

## 7. Promises — Handling Async Work

A **Promise** represents a value that will be available in the future (like data from an API). It can either **resolve** (success) or **reject** (failure).


```js
// Creating a Promise
const fetchUser = new Promise((resolve, reject) => {
  const success = true;

  if (success) {
    resolve({ name: "Alice" }); // data is ready
  } else {
    reject("Something went wrong"); // it failed
  }
});

// Consuming a Promise with .then / .catch
fetchUser
  .then(user => {
    console.log(user.name); // "Alice" — runs on success
  })
  .catch(error => {
    console.error(error); // runs on failure
  })
  .finally(() => {
    console.log("Done!"); // always runs
  });
```

---

## 7. `async` / `await` — Cleaner Promises

`async/await` is just a nicer way to write the same Promise code. It reads like synchronous code.

```js
// BEFORE — with .then/.catch (can get nested/hard to read)
function loadUser() {
  fetch("/api/user")
    .then(res => res.json())
    .then(data => console.log(data))
    .catch(err => console.error(err));
}

// AFTER — with async/await (reads top-to-bottom, much cleaner)
async function loadUser() {
  const res = await fetch("/api/user"); // wait for the response
  const data = await res.json();        // wait to parse JSON
  console.log(data);
}

// async functions always return a Promise
// Use 'await' only inside an 'async' function
```

---

## 8. `try` / `catch` — Handling Errors

Wrap risky code in a `try` block. If it throws an error, the `catch` block handles it gracefully.

```js
async function loadUser() {
  try {
    const res = await fetch("/api/user"); // might fail (network error)

    if (!res.ok) {
      throw new Error("Server returned an error"); // manually throw
    }

    const data = await res.json();
    console.log(data);

  } catch (error) {
    // runs if anything in 'try' throws
    console.error("Failed to load user:", error.message);

  } finally {
    // optional: always runs (good for cleanup, hiding loaders)
    console.log("Request finished");
  }
}
```

---

## 9. Optional Chaining — `?.`

`?.` lets you safely access deeply nested properties without crashing if something in the chain is `null` or `undefined`.

```js
const user = {
  name: "Alice",
  address: {
    city: "New York"
  }
};

// BEFORE — verbose safety checks
const city = user && user.address && user.address.city;

// AFTER — with optional chaining
const city = user?.address?.city;
// "New York"

// Returns undefined (not an error) if something is missing
const zip = user?.address?.zip;
// undefined

// Also works with methods and arrays
const firstTag = post?.tags?.[0];       // safe array access
const len = user?.getName?.();          // safe method call
```

---

## 10. Truthy / Nullish Checks — `??`, `||`, `&&`, Ternary

These operators handle conditional values compactly.

```js
const user = null;
const name = "";
const age = 0;

// || (OR) — returns the first TRUTHY value
// ⚠️ Treats 0, "", false as falsy — can be surprising
const displayName = name || "Guest";   // "Guest" (because "" is falsy)
const displayAge  = age  || 18;        // 18 (because 0 is falsy — probably wrong!)

// ?? (Nullish Coalescing) — returns the first NON-NULL/UNDEFINED value
// ✅ Safer: only triggers for null or undefined
const displayAge2 = age ?? 18;         // 0 (correct! age exists, it's just 0)
const userName    = user ?? "Guest";   // "Guest" (user is null)

// && (AND) — returns the first FALSY value, or the last value
// Commonly used for conditional rendering in React
const isLoggedIn = true;
const greeting = isLoggedIn && "Welcome back!"; // "Welcome back!"

// Ternary — inline if/else
const label = isLoggedIn ? "Logout" : "Login";
// "Logout"

// Combining them
const display = user?.name ?? "Anonymous";
// Safely reads user.name, falls back to "Anonymous" if null/undefined
```

---

## Quick Reference Table

| Concept | Syntax | One-liner |
|---|---|---|
| Block-scoped variable | `let x = 1` | Reassignable, use for changing values |
| Constant variable | `const x = 1` | Default choice, cannot be reassigned |
| Arrow function | `const fn = (x) => x * 2` | Shorter, no own `this` |
| Transform array | `arr.map(x => ...)` | New array, same length |
| Filter array | `arr.filter(x => ...)` | New array, fewer items |
| Find one item | `arr.find(x => ...)` | First match or `undefined` |
| Fold array | `arr.reduce((acc, x) => ..., init)` | Single output value |
| Copy/merge object | `{ ...obj, key: val }` | Non-destructive update |
| Object keys | `Object.keys(obj)` | Array of key strings |
| Object pairs | `Object.entries(obj)` | Array of `[key, value]` |
| Object destructure | `const { a, b } = obj` | Unpack object properties |
| Rename on destructure | `const { a: myA } = obj` | `myA` holds `obj.a` |
| Default on destructure | `const { a = 0 } = obj` | Fallback if key missing |
| Array destructure | `const [x, y] = arr` | Unpack by position |
| Promise chain | `.then(...).catch(...)` | Handle async results |
| Async function | `async function fn() {}` | Returns a Promise |
| Await result | `const data = await promise` | Pause until resolved |
| Error handling | `try { } catch (e) { }` | Catch thrown errors |
| Safe property access | `obj?.a?.b` | `undefined` instead of crash |
| Nullish fallback | `val ?? "default"` | Fallback only for `null`/`undefined` |
| OR fallback | `val \|\| "default"` | Fallback for any falsy value |
| Conditional AND | `cond && value` | Value only if condition is truthy |
| Inline if/else | `cond ? "yes" : "no"` | Single-line conditional |
