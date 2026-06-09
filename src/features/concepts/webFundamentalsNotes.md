> TODO: to be reviewed. As I already knew these concepts , so not reviewed this file yet.

# Web Fundamentals Notes

A beginner's guide to core web concepts — from writing good HTML to handling browser events.

---

## 1. Semantic HTML

HTML tags have meaning. Using the *right* tag for the right content helps browsers, screen readers, and search engines understand your page — not just display it.

**Problem:** Using `<div>` for everything gives no meaning to the structure.  
**Solution:** Use tags that describe the content they hold.

```html
<!-- ❌ No meaning — just boxes -->
<div class="header">My Site</div>
<div class="nav">Home | About</div>
<div class="article">Welcome!</div>

<!-- ✅ Semantic — tells the browser what each part IS -->
<header>My Site</header>
<nav>Home | About</nav>
<article>Welcome!</article>
<footer>© 2026</footer>
```

---

## 2. CSS Cascade

The cascade is the rule that decides *which style wins* when multiple rules target the same element. It considers **source order**, **specificity**, and **importance**.

```css
/* Both rules target <p>, but the second one wins — it comes later */
p { color: blue; }
p { color: red; }   /* ← this wins (later in the file) */

/* This wins over both above — higher specificity (.intro is more specific than p) */
.intro { color: green; }
```

> **Key idea:** More specific selectors beat less specific ones. Later rules beat earlier ones (when specificity is equal).

---

## 3. CSS Inheritance

Some CSS properties automatically pass down from a parent element to its children. This saves you from repeating yourself.

```css
/* Set font once on the body — all children inherit it */
body {
  font-family: Arial, sans-serif;
  color: #333;
}

/* Properties like border and background do NOT inherit */
div {
  border: 1px solid black; /* only this div gets a border, not its children */
}
```

> **Inherits by default:** `color`, `font-*`, `line-height`, `text-align`  
> **Does NOT inherit:** `margin`, `padding`, `border`, `background`, `width`

---

## 4. Box Model

Every HTML element is a rectangular box. The box model describes the layers around content: **padding → border → margin**.

```
┌──────────────────────────┐
│         margin           │  ← space outside the border
│  ┌────────────────────┐  │
│  │      border        │  │  ← the visible edge
│  │  ┌──────────────┐  │  │
│  │  │   padding    │  │  │  ← space inside the border
│  │  │  ┌────────┐  │  │  │
│  │  │  │content │  │  │  │  ← your text/image
│  │  │  └────────┘  │  │  │
│  │  └──────────────┘  │  │
│  └────────────────────┘  │
└──────────────────────────┘
```

```css
.card {
  width: 200px;          /* content width */
  padding: 16px;         /* space inside, between content and border */
  border: 2px solid #ccc;
  margin: 24px;          /* space outside, pushing other elements away */

  /* box-sizing: border-box makes width INCLUDE padding + border */
  box-sizing: border-box;
}
```

> **Tip:** Always set `box-sizing: border-box` globally — it makes sizing much more predictable.

---

## 5. Flex Layout

Flexbox arranges items in a row or column and handles spacing automatically. You apply it to a **container**, and its direct children become **flex items**.

```css
/* The container controls how its children are arranged */
.container {
  display: flex;
  flex-direction: row;       /* row (default) or column */
  justify-content: center;   /* alignment along the main axis (horizontal) */
  align-items: center;       /* alignment along the cross axis (vertical) */
  gap: 16px;                 /* space between items */
}
```

```html
<div class="container">
  <div>Item 1</div>   <!-- these three sit side-by-side, centered -->
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

> **Common pattern:** `justify-content: space-between` spreads items to opposite ends (great for navbars).

---

## 6. Responsive Layout

Responsive design makes your page look good on any screen size. Use **media queries** to apply different styles at different widths.

```css
/* Default: single column layout for mobile */
.grid {
  display: flex;
  flex-direction: column;
}

/* When screen is 768px or wider, switch to a row layout */
@media (min-width: 768px) {
  .grid {
    flex-direction: row;
  }
}

/* Use relative units so elements scale with the screen */
.card {
  width: 100%;       /* full width on mobile */
  max-width: 400px;  /* but never wider than 400px */
  font-size: 1rem;   /* 1rem = browser default size (~16px) */
}
```

> **Mobile-first approach:** Write styles for small screens first, then use `min-width` media queries to add styles for larger screens.

---

## 7. CSS Modules

CSS Modules solve the problem of class name clashes. Every class name is **locally scoped** to the component file — so `.button` in one component won't accidentally affect `.button` in another.

```css
/* Button.module.css */
.button {
  background: blue;
  color: white;
  padding: 8px 16px;
}
```

```jsx
// Button.jsx
import styles from './Button.module.css';

function Button() {
  // styles.button becomes a unique name like "Button_button__xK2pQ"
  return <button className={styles.button}>Click me</button>;
}
```

> **No more naming conflicts.** You can use simple, readable class names without worrying about global collisions.

---

## 8. DOM Updates

The DOM (Document Object Model) is the browser's live representation of your HTML. JavaScript can read and update it to change what the user sees — without reloading the page.

```js
// Select an element from the DOM
const heading = document.getElementById('title');

// Read it
console.log(heading.textContent); // "Hello"

// Update it — the page changes instantly
heading.textContent = 'Hello, World!';

// Create and add a new element
const newPara = document.createElement('p');
newPara.textContent = 'This paragraph was added by JS.';
document.body.appendChild(newPara); // add it to the page
```

> **React does this for you** under the hood via its Virtual DOM — you describe what the UI should look like, and React figures out the minimum DOM changes needed.

---

## 9. Event Bubbling

When you click an element, the event doesn't stop there — it *bubbles up* through every parent element all the way to the document root. This is called **event bubbling**.

```html
<div id="parent">
  <button id="child">Click me</button>
</div>
```

```js
document.getElementById('parent').addEventListener('click', () => {
  console.log('Parent clicked!'); // this ALSO fires when the button is clicked
});

document.getElementById('child').addEventListener('click', (event) => {
  console.log('Button clicked!'); // fires first
  event.stopPropagation();        // ← uncomment to stop the event from bubbling up
});

// Click the button → logs: "Button clicked!" then "Parent clicked!"
```

**Event Delegation** — a useful pattern using bubbling:

```js
// Instead of adding listeners to every <li>, add ONE listener to the <ul>
document.getElementById('list').addEventListener('click', (event) => {
  if (event.target.tagName === 'LI') {
    console.log('You clicked:', event.target.textContent);
  }
});
```

> **event.target** = the element that was actually clicked.  
> **event.currentTarget** = the element the listener is attached to.

---

## Quick Reference

| Concept | Core Idea | Key Property / Method |
|---|---|---|
| **Semantic HTML** | Use meaningful tags | `<header>`, `<nav>`, `<article>`, `<footer>` |
| **CSS Cascade** | Later & more specific rules win | Specificity order: inline > id > class > tag |
| **CSS Inheritance** | Some properties flow from parent to child | `color`, `font-*` inherit; `border`, `margin` don't |
| **Box Model** | Content → Padding → Border → Margin | `box-sizing: border-box` |
| **Flex Layout** | Arrange items in row or column | `display: flex`, `justify-content`, `align-items` |
| **Responsive Layout** | Different styles for different screen widths | `@media (min-width: ...)` |
| **CSS Modules** | Locally scoped class names per component | `import styles from './File.module.css'` |
| **DOM Updates** | JS reads/writes the live HTML tree | `getElementById`, `textContent`, `appendChild` |
| **Event Bubbling** | Events travel up the DOM tree | `event.stopPropagation()`, `event.target` |
