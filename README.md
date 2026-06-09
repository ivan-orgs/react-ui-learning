# React UI Learning Lab

A small React + TypeScript app designed to teach the roadmap concepts with minimal code.

## Run it

Start the Spring Boot backend from the sibling project:

```bash
cd ../task-review-service
mvn spring-boot:run
```

Then start the React app:

```bash
npm install
npm run dev
```

Open the Vite URL shown in the terminal.

The React app calls `http://127.0.0.1:8080` by default. Override it with `VITE_API_BASE_URL` if the backend runs somewhere else.

## Learning path

1. Start at `src/main.tsx` for `createRoot`, `StrictMode`, providers, and router setup.
2. Read `src/router.tsx` for nested routes, lazy loading, params, error pages, and not found handling.
3. Read `src/features/taskReviews/pages/QueuePage.tsx` for lists, keys, state, memo, callbacks, and a small grid.
4. Read `src/features/taskReviews/pages/TaskDetailsPage.tsx` for params, derived fetching, context, widgets, empty states, and side panel flows.
5. Read `src/shared/api/httpClient.ts` for axios, interceptors, env-aware headers, and calls to the Spring Boot backend.
6. Read `src/features/taskReviews/model/TaskReviewRecord.ts` for wrapper classes around raw API data.
7. Run `npm test` and read `src/features/taskReviews/__tests__/QueuePage.test.tsx` for Testing Library basics.

## Concepts covered

- Semantic HTML, CSS cascade, inheritance, box model, flex layouts, responsive layout, CSS modules, DOM updates, and event bubbling
- JavaScript variables, functions, array/object operations, destructuring, promises, `async`/`await`, `try`/`catch`, optional chaining, truthy/nullish checks.
- TypeScript annotations, inference, interfaces, types, unions, literal unions, template literal types, generics, `as const`, and `satisfies`.
- JSX, function components, props, composition, conditional rendering, lists, keys, state, synthetic events, and hooks.
- React Router v7, nested routes, layout routes, `Outlet`, params, `Link`, `NavLink`, `useNavigate`, lazy routes, and route error UI.
- TanStack Query (formerly React Query) : query keys, stale time, caching, background refetching, and `ensureQueryData`.
- Axios clients, `get`, `post`, request/response interceptors, auth headers, Spring Boot API responses, loader coordination, and environment-aware behavior.
- Context API for shared page state, loading/error/data, side-panel state, and sibling coordination.
- Design-system-style primitives mirroring `wabi` and `sabi`.
- Real AG Grid: `ColDef`, grid options, custom cell renderers, grid API auto sizing, row shaping, row click navigation, and a checks table.
- Wrapper classes for API abstraction, helper methods, header-to-row mapping, and columnar data encoding.
- Loading, empty, route errors, component `ErrorBoundary`, skeletons, `aria-busy`, `aria-live`, and not found states.
- Vitest, Testing Library, jest-dom, mocked HTTP clients, mocked hooks, DOM assertions, and integration-style tests.

References(unpaid) before making this project for learning UI : 

scrimba html css : https://scrimba.com/learn-html-and-css-c0p
scrimbs JS : https://scrimba.com/learn-javascript-c0v
codevolution async js : https://www.youtube.com/watch?v=exBgWAIeIeg
Codevolution react 18 crash course : https://www.youtube.com/watch?v=jLS0TkAHvRg

TODO (optional):
codevolution CSS Flexbox Crash Course- https://youtu.be/z62f2k38s64
codevolution CSS Grid Crash Course - https://youtu.be/p4Ith5qRM1g
codevolution Advanced JavaScript Crash Course - https://youtu.be/R9I85RhI7Cg
