> TODO: to be reviewed. As I already knew these concepts , so not reviewed this file yet.

# React Router Notes (v7)

React Router lets you map URLs to components — when the URL changes, the right component renders **without a full page reload**.

---

## 1. What React Router Does

A traditional site reloads the whole page on every link click. React Router intercepts that and swaps components instead, keeping your app fast and stateful.

```
URL /home  → renders <Home />
URL /about → renders <About />
URL /posts/42 → renders <PostDetail /> with id = 42
```

No server round-trip. Just JavaScript swapping components.

---

## 2. Basic Setup — `createBrowserRouter` + `RouterProvider`

`createBrowserRouter` builds your route map. `RouterProvider` plugs it into your React app.

```tsx
// main.tsx
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";

// Define the router with your routes
const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  { path: "/about", element: <About /> },
]);

// Plug the router into your app
ReactDOM.createRoot(document.getElementById("root")!).render(
  <RouterProvider router={router} />
);
```

---

## 3. Defining Routes — `path` + `element`

Each route is an object with a `path` (URL pattern) and an `element` (what to render).

```tsx
const router = createBrowserRouter([
  { path: "/",       element: <Home /> },     // matches exactly "/"
  { path: "/about",  element: <About /> },    // matches "/about"
  { path: "/posts",  element: <Posts /> },    // matches "/posts"
]);
```

If no path matches, nothing renders — we'll fix that with `errorElement` in section 10.

---

## 4. Nested Routes — URLs That Build on Each Other

Child routes inherit the parent's path. `/posts` + `new` becomes `/posts/new`.

```tsx
const router = createBrowserRouter([
  {
    path: "/posts",
    element: <Posts />,         // renders at /posts
    children: [
      { path: "new",  element: <NewPost /> },   // renders at /posts/new
      { path: ":id",  element: <PostDetail /> }, // renders at /posts/42
    ],
  },
]);
```

> The parent component must include an `<Outlet />` to show child content — see next section.

---

## 5. Layout Routes + `Outlet`

A layout route wraps child routes with shared UI (like a header or sidebar). `<Outlet />` is the slot where the active child component renders.

```tsx
// RootLayout.tsx — shared wrapper for all pages
import { Outlet } from "react-router-dom";

export default function RootLayout() {
  return (
    <div>
      <header>My App</header>      {/* always visible */}
      <main>
        <Outlet />                 {/* child route renders here */}
      </main>
    </div>
  );
}
```

```tsx
// router config — RootLayout wraps everything
const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,     // the shared wrapper
    children: [
      { index: true, element: <Home /> },   // "/" renders Home inside layout
      { path: "about",  element: <About /> },
      { path: "posts",  element: <Posts /> },
    ],
  },
]);
```

`index: true` means "render this when the parent path matches exactly."

---

## 6. URL Params — Dynamic Segments with `useParams`

A `:param` in a path is a wildcard that captures whatever the user typed. Read it with `useParams`.

```tsx
// Route definition
{ path: "posts/:id", element: <PostDetail /> }
```

```tsx
// PostDetail.tsx
import { useParams } from "react-router-dom";

export default function PostDetail() {
  const { id } = useParams(); // "id" matches the :id in the path

  return <h1>Showing post #{id}</h1>; // e.g. /posts/42 → "Showing post #42"
}
```

You can have multiple params: `posts/:postId/comments/:commentId`.

---

## 7. `Link` and `NavLink` — Navigate Without Page Reload

Use `<Link>` instead of `<a href>` so React Router handles the navigation (no reload). `<NavLink>` is the same but automatically adds an `active` CSS class when its URL matches.

```tsx
import { Link, NavLink } from "react-router-dom";

function Nav() {
  return (
    <nav>
      {/* Basic link — no page reload */}
      <Link to="/about">About</Link>

      {/* NavLink — gets class="active" when /posts is the current URL */}
      <NavLink to="/posts" style={({ isActive }) => ({
        fontWeight: isActive ? "bold" : "normal",
      })}>
        Posts
      </NavLink>
    </nav>
  );
}
```

---

## 8. `useNavigate` — Navigate Programmatically

Sometimes you need to navigate after something happens (form submit, button click, etc.). `useNavigate` gives you a function to trigger navigation from code.

```tsx
import { useNavigate } from "react-router-dom";

export default function LoginForm() {
  const navigate = useNavigate();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // ... do login logic ...
    navigate("/dashboard");        // send user to /dashboard
    // navigate(-1) goes back one page, like the browser back button
  }

  return (
    <form onSubmit={handleSubmit}>
      <button type="submit">Log In</button>
    </form>
  );
}
```

---

## 9. Lazy Routes — Load Pages Only When Needed

By default, all your page components are bundled together. Lazy routes split them out — a page's code only downloads when the user actually visits it.

```tsx
import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";

// React.lazy wraps a dynamic import — code loads on demand
const Dashboard = lazy(() => import("./pages/Dashboard"));

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        path: "dashboard",
        element: (
          // Suspense shows a fallback while the chunk is downloading
          <Suspense fallback={<p>Loading...</p>}>
            <Dashboard />
          </Suspense>
        ),
      },
    ],
  },
]);
```

Use lazy loading for heavy pages (dashboards, admin panels) to keep initial load fast.

---

## 10. Route Error UI — `errorElement`

`errorElement` is shown when a route throws an error **or** no route matches (404). Add it to your root route to catch everything.

```tsx
// ErrorPage.tsx
import { useRouteError } from "react-router-dom";

export default function ErrorPage() {
  const error = useRouteError() as { statusText?: string; message?: string };

  return (
    <div>
      <h1>Oops! Something went wrong.</h1>
      {/* Shows "Not Found" on 404, or the actual error message */}
      <p>{error.statusText || error.message}</p>
    </div>
  );
}
```

```tsx
// Attach it to the root route
const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <ErrorPage />,  // catches 404s and thrown errors
    children: [
      { index: true, element: <Home /> },
      { path: "about",     element: <About /> },
      { path: "posts",     element: <Posts /> },
      { path: "posts/:id", element: <PostDetail /> },
      { path: "dashboard", element: <Suspense fallback={<p>Loading...</p>}><Dashboard /></Suspense> },
    ],
  },
]);
```

---

## Quick Reference

| Concept | API | Purpose |
|---|---|---|
| Create router | `createBrowserRouter([...])` | Define all routes as an array |
| Mount router | `<RouterProvider router={router} />` | Plug router into your app |
| Basic route | `{ path: "/about", element: <About /> }` | Map a URL to a component |
| Index route | `{ index: true, element: <Home /> }` | Default child at parent's exact path |
| Nested routes | `children: [...]` inside a route | Build URL segments on a parent path |
| Layout + slot | `<Outlet />` inside a layout component | Where child route renders |
| URL param | `:id` in path, `useParams()` in component | Read dynamic URL segments |
| Link | `<Link to="/path">` | Navigate without page reload |
| Active link | `<NavLink to="/path">` | Same as Link + auto `active` class |
| Code navigate | `useNavigate()` → `navigate("/path")` | Navigate from JS (after events) |
| Lazy load | `lazy(() => import(...))` + `<Suspense>` | Load page code on demand |
| Error UI | `errorElement: <ErrorPage />` | Show on 404 or thrown errors |
| Read error | `useRouteError()` | Access the error inside `errorElement` |
